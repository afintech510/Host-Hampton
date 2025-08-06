import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={hostHamptonLogo} 
            alt="Host Hampton" 
            className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-white shadow-lg"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-gray-600">Host Hampton Party Services</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Host Hampton Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. Booking and Payment Terms</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• A $200 deposit is required to secure your party reservation</p>
                  <p>• Deposits are fully refundable up to 48 hours before your scheduled event</p>
                  <p>• The remaining balance is due on the day of your event</p>
                  <p>• All prices are subject to 8.75% sales tax</p>
                  <p>• Additional guests beyond the base package are charged at $25 per person</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. Cancellation Policy</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• Cancellations made 48+ hours before event: Full deposit refund</p>
                  <p>• Cancellations made 24-48 hours before: 50% deposit refund</p>
                  <p>• Cancellations made less than 24 hours: No refund</p>
                  <p>• Weather-related cancellations are handled case-by-case</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. Party Modifications</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• Guest count changes must be confirmed 24 hours prior to event</p>
                  <p>• Add-on services can be modified up to 24 hours before your party</p>
                  <p>• Date and time changes are subject to availability</p>
                  <p>• Theme changes may incur additional fees</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Facility Rules</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• Host Hampton Studio is located in Speonk, NY</p>
                  <p>• Adult supervision is required at all times during children's parties</p>
                  <p>• Outside food and beverages may be restricted based on package selection</p>
                  <p>• Decorations must be approved by Host Hampton staff</p>
                  <p>• Clean-up is included in all party packages</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Liability and Safety</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• Parents/guardians are responsible for supervising children throughout the event</p>
                  <p>• Host Hampton provides general liability coverage for the facility</p>
                  <p>• Guests participate in activities at their own risk</p>
                  <p>• Any damages to facility or equipment will be charged to the booking party</p>
                  <p>• Medical emergencies will be handled according to standard first aid procedures</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Food Service and Allergies</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• Please inform us of any food allergies or dietary restrictions in advance</p>
                  <p>• We accommodate gluten-free, dairy-free, and other special dietary needs when possible</p>
                  <p>• Food safety is our priority - outside food may be restricted</p>
                  <p>• Birthday cakes and cupcakes are included in most packages</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. Contact Information</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• Phone: 631-400-8080</p>
                  <p>• Email: info@hosthampton.com</p>
                  <p>• Address: Host Hampton Studio, Speonk, NY</p>
                  <p>• For questions or concerns, please contact us directly</p>
                </div>
              </section>

              <section className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-900">Agreement</h3>
                <p className="text-gray-700">
                  By booking a party with Host Hampton, you acknowledge that you have read, understood, 
                  and agree to these terms and conditions. These terms are subject to change and will 
                  be updated on our website accordingly.
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  Last updated: January 2025
                </p>
              </section>

              <div className="text-center pt-6">
                <Button onClick={() => window.close()} className="bg-purple-600 hover:bg-purple-700">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}