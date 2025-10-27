import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { isValidBookingId } from "@/lib/id-generator";
import CustomerBookingPage from "./customer-booking";
import { apiRequest } from "@/lib/queryClient";

export default function MyThemePartyPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [leadId, setLeadId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const createBooking = async () => {
      // Check for leadId query parameter (for admin quote links)
      const urlParams = new URLSearchParams(window.location.search);
      const leadIdParam = urlParams.get('leadId');
      
      if (leadIdParam) {
        const parsedLeadId = parseInt(leadIdParam, 10);
        if (!isNaN(parsedLeadId)) {
          setLeadId(parsedLeadId);
          return;
        }
      }
      
      if (!id) {
        // Root route - create new booking
        setIsCreating(true);
        try {
          const response = await apiRequest("POST", `/api/leads/legacy`, {
            source: "party-booking",
            status: "draft",
            partyType: "full-service",
            customerName: "",
            email: "",
            phone: "",
            eventDate: null,
            guestCount: 12,
            childAge: null,
            childFirstName: "",
            partyTheme: null,
            packageSelection: null,
            selectedPremiumActivities: [],
            selectedStandardActivities: [],
            selectedFood: "pizza",
            selectedFoodAddons: {},
            selectedCupcakeFlavor: "vanilla",
            selectedSweetAddons: {},
            selectedDrinkAddons: {},
            selectedPartyExtras: {},
            selectedAllergies: [],
            customRequests: ""
          });
          const data = await response.json();
          if (data.success && data.lead) {
            setLeadId(data.lead.id);
          }
        } catch (error) {
          console.error("Failed to create booking:", error);
        } finally {
          setIsCreating(false);
        }
        return;
      }

      if (!isValidBookingId(id)) {
        // Invalid ID format - redirect to create new booking
        setLocation('/my-theme-party/');
        return;
      }
      
      // Valid ID from URL - use it as leadId
      setLeadId(parseInt(id, 10));
    };

    createBooking();
  }, [id, setLocation]);

  // If we have a leadId, render the booking page
  if (leadId) {
    return <CustomerBookingPage leadId={leadId.toString()} />;
  }

  // Loading state while creating
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{isCreating ? 'Creating your booking...' : 'Loading...'}</p>
      </div>
    </div>
  );
}