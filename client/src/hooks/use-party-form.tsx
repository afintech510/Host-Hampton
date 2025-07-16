import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertPartyBooking } from "@shared/schema";

interface FormData {
  partyDate: string;
  partyTime: string;
  partyTheme: string;
  partyAddons: string[];
  childName: string;
  childAge: number;
  guestCount: number;
  foodChoice: string;
  cupcakeFlavor: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  city: string;
  zipCode: string;
  partyNotes?: string;
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

  const calculateTotal = (data: Partial<FormData>) => {
    const basePrice = 400; // Base party package price
    const addonTotal = (data.partyAddons || []).reduce(
      (total: number, addon: string) => {
        return total + (ADDON_PRICES[addon] || 0);
      },
      0,
    );
    return basePrice + addonTotal;
  };

  const submitBookingMutation = useMutation({
    mutationFn: async (data: InsertPartyBooking) => {
      const response = await apiRequest("POST", "/api/party-bookings", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Party Booked Successfully!",
        description: "Redirecting to secure payment...",
      });

      // Open GoDaddy payment link in popup
      const paymentUrl =
        "https://0b55c8c3-d136-4109-9537-5db058a282c7.paylinks.godaddy.com/party-deposit"; // Replace with actual GoDaddy payment link
      const popup = window.open(
        paymentUrl,
        "payment",
        "width=900,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no",
      );

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        toast({
          title: "Popup Blocked",
          description:
            "Please allow popups for payment processing. Redirecting now...",
          variant: "destructive",
        });
        // Fallback: redirect in same window after a short delay
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
              description:
                "Thank you! We'll contact you within 24 hours to confirm your party details.",
            });
          }
        }, 1000);
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
    const totalEstimate = calculateTotal(formData);

    const bookingData: InsertPartyBooking = {
      partyDate: formData.partyDate!,
      partyTime: formData.partyTime!,
      partyTheme: formData.partyTheme!,
      partyAddons: formData.partyAddons || [],
      childName: formData.childName!,
      childAge: formData.childAge!,
      guestCount: formData.guestCount!,
      foodChoice: formData.foodChoice!,
      cupcakeFlavor: formData.cupcakeFlavor!,
      parentFirstName: formData.parentFirstName!,
      parentLastName: formData.parentLastName!,
      parentEmail: formData.parentEmail!,
      parentPhone: formData.parentPhone!,
      address: formData.address!,
      city: formData.city!,
      zipCode: formData.zipCode!,
      partyNotes: formData.partyNotes || "",
      totalEstimate,
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
