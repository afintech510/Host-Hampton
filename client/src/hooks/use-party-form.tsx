import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


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
  partyNotes?: string;
  totalEstimate?: number;
  specialNeeds?: string[];
  
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
  
  // Room rental pricing
  rentalPricing?: {
    basePrice: number;
    securityDeposit: number;
    total: number;
    hours: number;
    isWeekend: boolean;
  };
}

// Addon prices will be loaded from database - no more mock data

export function usePartyForm() {
  const [leadId, setLeadId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<FormData>>(() => {
    // Initialize from session storage
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('partyFormData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved form data:', e);
        }
      }
    }
    return {};
  });
  const { toast } = useToast();

  // DISABLED: Lead creation is now handled by the quotes endpoint to prevent duplicates
  // const createLeadMutation = useMutation({
  //   mutationFn: async (leadData: any) => {
  //     const response = await apiRequest("POST", "/api/leads", leadData);
  //     return response.json();
  //   },
  //   onSuccess: (data) => {
  //     setLeadId(data.lead.id);
  //     console.log("Lead created successfully:", data.lead);
  //   },
  //   onError: (error) => {
  //     console.error("Failed to create lead:", error);
  //   },
  // });

  // Lead update mutation for form progress tracking
  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: number; updates: any }) => {
      // Don't convert dates to ISO strings - let the backend handle date processing
      const processedUpdates = { ...updates };
      
      // Remove any undefined values that might cause issues
      Object.keys(processedUpdates).forEach(key => {
        if (processedUpdates[key] === undefined) {
          delete processedUpdates[key];
        }
      });
      
      const response = await apiRequest("PATCH", `/api/leads/${leadId}`, processedUpdates);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Lead updated successfully:", data.lead);
    },
    onError: (error) => {
      console.error("Failed to update lead:", error);
    },
  });

  // Save to session storage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('partyFormData', JSON.stringify(formData));
    }
  }, [formData]);

  // Fetch themes for pricing calculation
  const { data: themes = [] } = useQuery({
    queryKey: ["/api/party-themes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/party-themes");
      const data = await response.json();
      return data.success ? data.themes : [];
    },
  });

  // Fetch addons for pricing calculation
  const { data: addons = [] } = useQuery({
    queryKey: ["/api/addons"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/addons");
      const data = await response.json();
      return data.success ? data.addons : [];
    },
  });

  const calculateTotal = (data: Partial<FormData>) => {
    try {
      const basePrice = 400; // Base party package price
      
      // Add theme price
      const selectedTheme = themes.find((theme: any) => theme.name === data.partyTheme);
      const themePrice = selectedTheme ? (Number(selectedTheme.price) || 0) / 100 : 0; // Convert cents to dollars, ensure it's a number
      
      // Add addon prices from database with per-guest pricing support
      const guestCount = Number(data.guestCount) || 10; // Default to 10 guests if not specified
      const addonTotal = (data.partyAddons || []).reduce(
        (total: number, addonName: string) => {
          const selectedAddon = addons.find((addon: any) => addon.name === addonName);
          if (!selectedAddon) return total;
          
          const basePrice = (Number(selectedAddon.price) || 0) / 100; // Convert cents to dollars
          const addonPrice = selectedAddon.per_guest ? basePrice * guestCount : basePrice;
          
          return total + addonPrice;
        },
        0,
      );
      
      const total = basePrice + themePrice + addonTotal;
      console.log("Calculated total (debug):", { 
        basePrice, 
        themePrice: themePrice,
        addonTotal, 
        total, 
        typeofTotal: typeof total,
        selectedTheme: selectedTheme?.name,
        addons: data.partyAddons 
      });
      
      // Ensure we return a valid number that meets Stripe minimum
      const finalTotal = Math.max(Number(total) || 400, 1); // At least $1 to meet Stripe minimum
      console.log("Final calculated total:", finalTotal, typeof finalTotal);
      return finalTotal;
    } catch (error) {
      console.error("Error calculating total:", error);
      return 400; // Return base price as fallback
    }
  };

  // Inquiry submission (for "Show Price" clicks)
  const submitInquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/create-inquiry", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Inquiry Submitted Successfully!",
        description: "We'll contact you within 24 hours with your personalized quote and availability.",
      });
      
      // Redirect to home after successful inquiry
      setTimeout(() => {
        window.location.href = "/themed-parties";
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  // Payment submission (for "Pay Reservation Deposit" clicks)
  const submitPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/book-with-payment", data);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }
      
      return result;
    },
    onSuccess: (data) => {
      if (data.success && data.clientSecret) {
        // Store payment info and redirect to Stripe payment
        localStorage.setItem('pendingPayment', JSON.stringify({
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId,
          bookingData: data.bookingData
        }));
        
        // Redirect to payment page
        window.location.href = `/payment?client_secret=${data.clientSecret}`;
      } else {
        toast({
          title: "Payment Setup Failed",
          description: data.message || "Please try again or contact us directly.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Payment mutation error:", error);
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  // Legacy booking submission (for existing birthday party flow)
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

        // Calculate the total amount
        const calculatedTotal = calculateTotal(formData);
        const paymentAmount = Number(formData.totalEstimate || calculatedTotal || 550); // Ensure it's a number
        
        console.log("Submitting payment (fixed):", { 
          eventId: data.data.eventId, 
          invoiceId: data.data.invoiceId, 
          amount: paymentAmount,
          amountType: typeof paymentAmount,
          eventType: formData.eventType,
          formDataTotal: formData.totalEstimate,
          calculatedTotal
        });

        // Clear form data on successful submission
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('partyFormData');
        }
        setFormData({});
        setLeadId(null);

        // Create Stripe payment intent and redirect to checkout
        submitPaymentMutation.mutate({
          eventId: data.data.eventId,
          invoiceId: data.data.invoiceId,
          amount: paymentAmount,
          eventType: formData.eventType,
          leadId: leadId, // Include lead ID for conversion
          customerEmail: formData.customerEmail || formData.parentEmail
        });
      } else {
        // For request-only events (jewelry, studio rental)
        toast({
          title: "🎉 Request Submitted Successfully!",
          description: "We'll contact you within 24 hours to discuss your request.",
        });
        
        // Clear form data on successful submission
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('partyFormData');
        }
        setFormData({});
        setLeadId(null);
        
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

  // DISABLED: Function to create lead when contact info is provided
  // Lead creation is now handled by the quotes endpoint to prevent duplicates
  const createLeadFromContact = (contactData: Partial<FormData>) => {
    // This function is disabled to prevent duplicate lead creation
    // Lead creation now happens in the /api/quotes endpoint
    console.log("Lead creation skipped - handled by quotes endpoint");
  };

  // Helper function to map event types to IDs
  const getEventTypeId = (eventType: string): number => {
    const mapping: { [key: string]: number } = {
      "birthday": 1,
      "birthday-party": 1,
      "workshop": 2,
      "permanent-jewelry": 3,
      "permanent-jewelry-popup": 4,
      "studio-rental": 5,
      "host-your-client": 6,
      "permanent-jewelry-appointment": 7,
      "diy-party": 1,
      "private-event": 1
    };
    return mapping[eventType] || 1;
  };

  // Helper function to get party theme ID
  const getPartyThemeId = (themeName: string): number | null => {
    const theme = themes.find((t: any) => t.name === themeName);
    return theme?.id || null;
  };

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      
      // Auto-calculate total when relevant fields change
      if (newData.partyTheme || newData.partyAddons || newData.guestCount) {
        const calculatedTotal = calculateTotal(updated);
        updated.totalEstimate = Number(calculatedTotal) || 400; // Ensure it's a number
      }
      
      // DISABLED: Lead creation is now handled by quotes endpoint
      // createLeadFromContact(updated);
      
      // Update lead progress if lead exists
      if (leadId) {
        updateLeadMutation.mutate({
          leadId,
          updates: {
            formData: updated,
            estimatedCost: updated.totalEstimate,
            guestCount: updated.guestCount,
            eventDate: updated.partyDate || updated.customPreferredDate || updated.jewelryPreferredDate || updated.preferredDate || updated.studioPreferredDate,
            timeSlot: updated.partyTime || updated.customStartTime || updated.jewelryPreferredTime || updated.startTime || updated.studioStartTime,
            notes: updated.partyNotes || updated.eventDescription
          }
        });
      }
      
      // Immediately save to session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('partyFormData', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const resetForm = () => {
    // Reset form data completely
    setFormData({});
    
    // Clear session storage completely
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('partyFormData');
    }
    
    // Reset lead ID so a new lead can be created if needed
    setLeadId(null);
  };

  const clearFormData = () => {
    // Clear form data when starting a new quote
    setFormData({});
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('partyFormData');
    }
    setLeadId(null);
  };

  const submitBooking = async (options?: { action?: 'inquiry' | 'payment' }) => {
    const eventType = formData.eventType || "";
    const action = options?.action || 'legacy';
    
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
      totalEstimate: eventType === "birthday-party" ? Number(calculateTotal(formData)) || 400 : undefined,
      
      // Add deposit amount for payment flow
      depositAmount: formData.rentalPricing?.total || 
        (eventType === "diy-party" ? 12500 : eventType === "private-event" ? 20000 : 10000), // Default deposits in cents
      leadId: leadId // Include lead ID for potential conversion
    };

    // Route to appropriate mutation based on action
    switch (action) {
      case 'inquiry':
        await submitInquiryMutation.mutateAsync(bookingData);
        break;
      case 'payment':
        await submitPaymentMutation.mutateAsync(bookingData);
        break;
      default:
        // Legacy booking flow
        await submitBookingMutation.mutateAsync(bookingData);
        break;
    }
  };

  return {
    formData,
    updateFormData,
    submitBooking,
    resetForm,
    clearFormData,
    leadId,
    createLeadFromContact,
    isSubmitting: submitBookingMutation.isPending || 
                 submitInquiryMutation.isPending || 
                 submitPaymentMutation.isPending,
  };
}
