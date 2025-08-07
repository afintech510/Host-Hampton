import { useParams, useSearch } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { generateBookingId, isValidBookingId } from "@/lib/id-generator";
import StudioRentalReservationPage from "./studio-rental-reservation";

export default function MyStudioRentalPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!id) {
      // Root route - create new booking with random ID
      const newId = generateBookingId();
      setLocation(`/my-studio-rental/${newId}`);
      return;
    }

    if (!isValidBookingId(id)) {
      // Invalid ID format - redirect to create new booking
      setLocation('/my-studio-rental/');
      return;
    }
  }, [id, setLocation]);

  // If we have a valid ID, render the booking page
  if (id && isValidBookingId(id)) {
    return <StudioRentalReservationPage />;
  }

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating your booking...</p>
      </div>
    </div>
  );
}