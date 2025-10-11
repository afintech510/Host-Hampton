import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Mail } from "lucide-react";
import Navigation from "@/components/navigation";

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    // Get eventId from URL query params
    const params = new URLSearchParams(window.location.search);
    const id = params.get('eventId');
    setEventId(id);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F1EB' }}>
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              🎉 Booking Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-gray-600 space-y-2">
              <p className="text-lg">
                Your party deposit has been received and your event is confirmed!
              </p>
              <p className="text-sm">
                Event ID: #{eventId}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-center gap-2 text-purple-900">
                <Mail className="h-5 w-5" />
                <p className="font-medium">Check your email</p>
              </div>
              <p className="text-sm text-purple-700">
                We've sent a confirmation email with all the details of your party booking.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What's Next?</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>You'll receive a confirmation email shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>The remaining balance is due on the day of your event</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>You can view and manage your booking by logging into My Events</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => setLocation('/my-events')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                data-testid="button-view-my-events"
              >
                <Calendar className="mr-2 h-4 w-4" />
                View My Events
              </Button>
              
              <Button
                onClick={() => setLocation('/')}
                variant="outline"
                className="w-full rounded-full"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </div>

            <div className="text-xs text-gray-500 pt-4">
              <p>Questions? Contact us at:</p>
              <p className="font-medium">hosthampton295@gmail.com</p>
              <p className="font-medium">631-998-9325</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
