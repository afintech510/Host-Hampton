import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertPartyBooking } from "@shared/schema";

interface FormData {
  // Common fields
  eventType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  
  // Legacy birthday party fields
  partyDate?: string;
  partyTime?: string;
  partyTheme?: string;
  partyAddons?: string[];
  childName?: string;
  childAge?: number;
  guestCount?: number;
  foodChoice?: string;
  cupcakeFlavor?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  partyNotes?: string;
  totalEstimate?: number;
  
  // Custom event fields (DIY/Private)
  eventDescription?: string;
  adultCount?: number;
  childrenCount?: number;
  selectedCustomAddons?: string[];
  customPreferredDate?: string;
  customStartTime?: string;
  customEndTime?: string;
  
  // Permanent Jewelry fields
  selectedJewelryPieces?: string[];
  jewelryPeopleCount?: number;
  jewelryPreferredDate?: string;
  jewelryPreferredTime?: string;
  
  // Workshop fields
  workshopType?: string;
  workshopDescription?: string;
  classFormat?: string;
  expectedAttendees?: number;
  preferredDate?: string;
  startTime?: string;
  selectedWorkshopAddons?: string[];
  
  // Studio Rental fields
  studioPurpose?: string;
  customStudioPurpose?: string;
  studioPurposeDescription?: string;
  studioClientCount?: number;
  studioGroupType?: string;
  studioPreferredDate?: string;
  studioStartTime?: string;
  studioEndTime?: string;
}

const ADDON_PRICES: Record<string, number> = {
  "photo-booth": 50,
  "candy-wall": 75,
  balloons: 25,
  karaoke: 40,
  "glitter-makeup": 30,
  "hair-tinsel": 25,
  "beaded-hair-braid": 35,
  "glitter-tattoo": 20,
  manicure: 40,
  "bracelet-making": 30,
};

export function usePartyForm() {
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const { toast } = useToast();

  // Fetch themes for pricing calculation
  const { data: themes = [] } = useQuery({
    queryKey: ["/api/party-themes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/party-themes");
      const data = await response.json();
      return data.success ? data.themes : [];
    },
  });

  const calculateTotal = (data: Partial<FormData>) => {
    const basePrice = 400; // Base party package price
    
    // Add theme price
    const selectedTheme = themes.find((theme: any) => theme.name === data.partyTheme);
    const themePrice = selectedTheme ? selectedTheme.price / 100 : 0; // Convert cents to dollars
    
    // Add addon prices
    const addonTotal = (data.partyAddons || []).reduce(
      (total: number, addon: string) => {
        return total + (ADDON_PRICES[addon] || 0);
      },
      0,
    );
    
    return basePrice + themePrice + addonTotal;
  };

  const submitBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/submit-booking", data);
      return response.json();
    },
    onSuccess: (data) => {
      const eventType = formData.eventType || "";
      
      // Check if this is a paid event that needs payment processing
      const paidEvents = ["birthday-party", "diy-party", "private-event", "workshop"];
      const isPaidEvent = paidEvents.includes(eventType);
      
      if (isPaidEvent && data.data?.invoiceId) {
        toast({
          title: "🎉 Event Booked Successfully!",
          description: "Redirecting to secure payment...",
        });

        // Open payment link in popup for paid events
        const paymentUrl = "https://0b55c8c3-d136-4109-9537-5db058a282c7.paylinks.godaddy.com/party-deposit";
        const popup = window.open(
          paymentUrl,
          "payment",
          "width=900,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no",
        );

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for payment processing. Redirecting now...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 2000);
        } else {
          // Monitor popup to detect when it's closed
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              toast({
                title: "Payment Window Closed",
                description: "Thank you! We'll contact you within 24 hours to confirm your event details.",
              });
              // Redirect to home after payment
              setTimeout(() => {
                window.location.href = "/";
              }, 2000);
            }
          }, 1000);
        }
      } else {
        // For request-only events (jewelry, studio rental)
        toast({
          title: "🎉 Request Submitted Successfully!",
          description: "We'll contact you within 24 hours to discuss your request.",
        });
        
        // Redirect to confirmation page after a brief delay
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description:
          "There was an error submitting your party booking. Please try again or contact us directly.",
        variant: "destructive",
      });
      console.error("Booking error:", error);
    },
  });

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const submitBooking = async () => {
    const eventType = formData.eventType || "";
    
    // Create comprehensive booking data that includes all form fields
    const bookingData = {
      // Common fields
      eventType,
      customerName: formData.customerName || 
        (formData.parentFirstName && formData.parentLastName ? 
          `${formData.parentFirstName} ${formData.parentLastName}` : ""),
      customerEmail: formData.customerEmail || formData.parentEmail || "",
      customerPhone: formData.customerPhone || formData.parentPhone || "",
      customerCompany: formData.customerCompany,
      
      // Include all form data for specific flows
      ...formData,
      
      // Calculate totals for legacy flow
      totalEstimate: eventType === "birthday-party" ? calculateTotal(formData) : undefined,
    };

    await submitBookingMutation.mutateAsync(bookingData);
  };

  return {
    formData,
    updateFormData,
    submitBooking,
    isSubmitting: submitBookingMutation.isPending,
  };
}
