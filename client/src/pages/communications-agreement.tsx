import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";

export default function CommunicationsAgreement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={hostHamptonLogo} 
            alt="Host Hampton" 
            className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white shadow-lg"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Communications Agreement</h1>
          <p className="text-gray-600">Host Hampton Event Communications Policy</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Communication Consent & Agreement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 1, 2025<br />
              <strong>Last Updated:</strong> January 1, 2025
            </p>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. Event Communications</h3>
                <p>
                  By agreeing to this Communications Agreement, you consent to receive communications from Host Hampton regarding your booked events, including but not limited to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Event confirmations and booking details</li>
                  <li>Event reminders (48 hours and 24 hours before your event)</li>
                  <li>Important updates regarding your event date, time, or details</li>
                  <li>Weather-related notifications or venue changes</li>
                  <li>Post-event follow-up and feedback requests</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. Communication Methods</h3>
                <p>
                  We will communicate with you through the following methods:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Email:</strong> Primary method for detailed communications, confirmations, and updates</li>
                  <li><strong>Text Messages (SMS):</strong> Quick reminders and time-sensitive updates</li>
                  <li><strong>Phone Calls:</strong> For urgent matters or when immediate response is needed</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. Marketing Communications</h3>
                <p>
                  You also consent to receive marketing communications from Host Hampton, including:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Promotional offers and special discounts</li>
                  <li>New service announcements and party theme updates</li>
                  <li>Seasonal event packages and limited-time offers</li>
                  <li>Birthday party ideas and planning tips</li>
                  <li>Customer testimonials and photo sharing opportunities</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Frequency</h3>
                <p>
                  Communication frequency may vary based on:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Event-related:</strong> As needed for your specific bookings</li>
                  <li><strong>Marketing:</strong> Approximately 2-4 messages per month</li>
                  <li><strong>Promotional:</strong> Up to 1-2 special offers per month</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Your Rights</h3>
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Opt out of marketing communications at any time</li>
                  <li>Update your communication preferences</li>
                  <li>Request to receive communications via specific methods only</li>
                  <li>Contact us to modify or withdraw consent</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  <strong>Note:</strong> Event-related communications are essential for service delivery and cannot be opted out of while you have active bookings.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Contact Information</h3>
                <p>
                  To modify your communication preferences or ask questions about this agreement:
                </p>
                <ul className="list-none pl-0 mt-2 space-y-1">
                  <li><strong>Email:</strong> hosthampton295@gmail.com</li>
                  <li><strong>Phone:</strong> 631-998-9325</li>
                  <li><strong>Address:</strong> Host Hampton Studio, Speonk, NY</li>
                </ul>
              </section>

              <section className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">7. Consent</h3>
                <p>
                  By checking the Communications Agreement box during booking, you acknowledge that you have read, understood, and agree to the terms of this Communications Agreement. You confirm that you are authorized to provide consent for the contact information provided.
                </p>
              </section>
            </div>

            <div className="text-center mt-8 pt-6 border-t">
              <Button 
                onClick={() => window.close()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}