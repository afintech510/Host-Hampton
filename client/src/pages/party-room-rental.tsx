import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Users, MapPin, Wifi, Camera, Music, Utensils, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PartyRoomRental() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [rentalTotal, setRentalTotal] = useState(0);
  const [isWeekend, setIsWeekend] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const amenities = [
    { icon: <Users className="w-5 h-5" />, text: "Capacity up to 50 guests" },
    { icon: <Wifi className="w-5 h-5" />, text: "Free high-speed WiFi" },
    { icon: <Camera className="w-5 h-5" />, text: "Photo backdrop area" },
    { icon: <Music className="w-5 h-5" />, text: "Sound system & microphone" },
    { icon: <Utensils className="w-5 h-5" />, text: "Kitchen facilities available" },
    { icon: <MapPin className="w-5 h-5" />, text: "Prime Hampton location" },
  ];

  // Pricing structure from database
  const weekdayRates = {
    2: 300,
    3: 400,
    4: 500
  };

  const weekendRates = {
    2: 400,
    3: 550,
    4: 700
  };

  // Calculate rental total when date or duration changes
  useEffect(() => {
    if (selectedDate && duration) {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      const weekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      setIsWeekend(weekend);

      const durationNum = parseInt(duration);
      const rates = weekend ? weekendRates : weekdayRates;
      const total = rates[durationNum as keyof typeof rates] || 0;
      setRentalTotal(total);
    } else {
      setRentalTotal(0);
    }
  }, [selectedDate, duration]);

  const handleDepositCheckout = async () => {
    if (!selectedDate || !startTime || !duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Connect to Stripe for $200 deposit checkout
      // TODO: Create booking in database with "pending confirmation" status
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated payment processing

      setBookingConfirmed(true);
      toast({
        title: "Reservation Request Received!",
        description: "Your $200 deposit has been processed. Host Hampton will contact you within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "There was an issue processing your deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen" style={{
        background: 'linear-gradient(90deg, #B9C9D4 0%, #B9C9D4 20%, #F5F1ED 40%, #F0F0F0 60%, #B9C9D4 80%, #B9C9D4 100%)'
      }}>
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Card className="bg-white shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thank You for Your Reservation Request
              </h1>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-gray-800 text-lg leading-relaxed">
                  <strong>Host Hampton will contact you within 24 hours to confirm availability.</strong>
                </p>
                <p className="text-gray-700 mt-4">
                  Host Hampton reserves the right to cancel any reservation within one week of booking.
                </p>
              </div>
              <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Reservation Details:</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Start Time:</strong> {startTime}</p>
                  <p><strong>Duration:</strong> {duration} hours</p>
                  <p><strong>Total Rental:</strong> ${rentalTotal.toFixed(2)}</p>
                  <p><strong>Deposit Paid:</strong> $200.00</p>
                  <p><strong>Balance Due:</strong> ${(rentalTotal - 200).toFixed(2)}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setBookingConfirmed(false);
                  setSelectedDate("");
                  setStartTime("");
                  setDuration("");
                  setRentalTotal(0);
                }}
                variant="outline"
                className="border-blue-300 text-blue-700"
              >
                Make Another Reservation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Party Room Rental
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rent our beautiful party space for your special celebration. Perfect for birthdays, 
            workshops, corporate events, and private gatherings in the heart of Hampton.
          </p>
        </div>

        {/* Amenities Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What's Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <div className="text-amber-600">{amenity.icon}</div>
                <span className="text-gray-700">{amenity.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reservation Form */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Reserve Your Date
              </h2>
              <p className="text-gray-600">
                Select your date, time, and duration. We'll calculate pricing based on weekday or weekend rates.
              </p>
            </div>

            <div className="space-y-6">
              {/* Date Picker */}
              <div>
                <Label htmlFor="rental-date" className="text-lg font-semibold">
                  Select Date *
                </Label>
                <Input
                  id="rental-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2"
                  required
                  data-testid="input-rental-date"
                />
                {selectedDate && (
                  <p className="text-sm text-gray-600 mt-2">
                    {isWeekend ? (
                      <span className="text-amber-700 font-medium">🎉 Weekend Rate</span>
                    ) : (
                      <span className="text-blue-700 font-medium">📅 Weekday Rate</span>
                    )}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <Label htmlFor="start-time" className="text-lg font-semibold">
                  Start Time *
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2"
                  required
                  data-testid="input-start-time"
                />
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration" className="text-lg font-semibold">
                  Duration *
                </Label>
                <Select
                  value={duration}
                  onValueChange={setDuration}
                  required
                >
                  <SelectTrigger id="duration" className="mt-2" data-testid="select-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing Display */}
              {rentalTotal > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">Rental Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Rate Type:</span>
                      <span className="font-medium">{isWeekend ? 'Weekend' : 'Weekday'}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Duration:</span>
                      <span className="font-medium">{duration} hours</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-300">
                      <span>Total Rental:</span>
                      <span>${rentalTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 pt-2">
                      <span>Deposit Required:</span>
                      <span className="font-medium">$200.00</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Balance Due at Event:</span>
                      <span className="font-medium">${(rentalTotal - 200).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleDepositCheckout}
                disabled={!selectedDate || !startTime || !duration || isProcessing}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg py-6 mt-6"
                data-testid="button-checkout-deposit"
              >
                {isProcessing ? "Processing..." : "Pay $200 Deposit & Reserve"}
              </Button>

              <p className="text-sm text-gray-500 text-center mt-4">
                By clicking "Pay $200 Deposit & Reserve", you agree to our terms. Host Hampton will contact you within 24 hours to confirm availability.
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Questions About Your Rental?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our party room books up quickly, especially on weekends. Secure your date today 
            with a $200 reservation deposit.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> Host Hampton reserves the right to cancel any reservation within one week of booking. Your deposit is fully refundable if we need to cancel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
