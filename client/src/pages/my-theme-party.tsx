import { useParams } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { generateBookingId, isValidBookingId } from "@/lib/id-generator";
import CustomerBookingPage from "./customer-booking";

export default function MyThemePartyPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!id) {
      // Root route - create new booking with random ID
      const newId = generateBookingId();
      setLocation(`/my-theme-party/${newId}`);
      return;
    }

    if (!isValidBookingId(id)) {
      // Invalid ID format - redirect to create new booking
      setLocation('/my-theme-party/');
      return;
    }
  }, [id, setLocation]);

  // If we have a valid ID, render the booking page
  if (id && isValidBookingId(id)) {
    // Pass leadId from query parameter to CustomerBookingPage
    const searchParams = new URLSearchParams(window.location.search);
    const leadId = searchParams.get('leadId');
    return <CustomerBookingPage leadId={leadId} />;
  }

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating your booking...</p>
      </div>
    </div>
  );
}