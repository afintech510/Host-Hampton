import { useParams } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { generateBookingId, isValidBookingId } from "@/lib/id-generator";
import TruckerHatReservationPage from "./trucker-hat-reservation";

export default function MyTruckerHatPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!id) {
      // Root route - create new booking with random ID
      const newId = generateBookingId();
      setLocation(`/my-trucker-hat/${newId}`);
      return;
    }

    if (!isValidBookingId(id)) {
      // Invalid ID format - redirect to create new booking
      setLocation('/my-trucker-hat/');
      return;
    }
  }, [id, setLocation]);

  // If we have a valid ID, render the booking page
  if (id && isValidBookingId(id)) {
    // Pass leadId from query parameter to TruckerHatReservationPage
    const searchParams = new URLSearchParams(window.location.search);
    const leadId = searchParams.get('leadId');
    return <TruckerHatReservationPage leadId={leadId} />;
  }

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating your booking...</p>
      </div>
    </div>
  );
}