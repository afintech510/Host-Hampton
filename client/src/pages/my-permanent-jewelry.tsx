import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { generateBookingId, isValidBookingId } from "@/lib/id-generator";
import PermanentJewelryReservationPage from "./permanent-jewelry-reservation";

export default function MyPermanentJewelryPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!id) {
      // Root route - create new booking with random ID
      const newId = generateBookingId();
      setLocation(`/my-permanent-jewelry/${newId}`);
      return;
    }

    if (!isValidBookingId(id)) {
      // Invalid ID format - redirect to create new booking
      setLocation('/my-permanent-jewelry/');
      return;
    }
  }, [id, setLocation]);

  // If we have a valid ID, render the booking page
  if (id && isValidBookingId(id)) {
    // Pass leadId from query parameter to PermanentJewelryReservationPage
    const searchParams = new URLSearchParams(window.location.search);
    const leadId = searchParams.get('leadId');
    return <PermanentJewelryReservationPage leadId={leadId} />;
  }

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
        <p className="text-yellow-800">Setting up your permanent jewelry session...</p>
      </div>
    </div>
  );
}