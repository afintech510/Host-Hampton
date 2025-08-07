import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, DollarSign, Phone } from "lucide-react";

export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-ivory to-soft-blush-pink">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Cancellation Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We understand that plans can change. Here's our flexible cancellation and rescheduling policy.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-mauve-rose" />
                Cancellation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">14+ Days Before Event</h4>
                <p className="text-green-700">
                  <strong>Full refund</strong> minus a $25 processing fee. No questions asked!
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">7-13 Days Before Event</h4>
                <p className="text-yellow-700">
                  <strong>50% refund</strong> of total payment. We'll work with you to find alternative dates.
                </p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">3-6 Days Before Event</h4>
                <p className="text-orange-700">
                  <strong>25% refund</strong> due to preparation costs and lost booking opportunities.
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Less Than 3 Days</h4>
                <p className="text-red-700">
                  <strong>No refund available</strong> due to staff scheduling and preparation commitments.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-mauve-rose" />
                Rescheduling Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Free Rescheduling</h4>
                <p className="text-gray-600">
                  Reschedule your party <strong>up to 7 days before</strong> your original date at no additional cost, 
                  subject to availability.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Last-Minute Rescheduling</h4>
                <p className="text-gray-600">
                  Rescheduling within 7 days incurs a <strong>$50 rescheduling fee</strong> to cover 
                  administrative costs and potential lost bookings.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Credit Option</h4>
                <p className="text-gray-600">
                  Instead of a refund, you can choose to receive <strong>full credit</strong> toward a future party 
                  (valid for 12 months from original event date).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-mauve-rose" />
                Special Circumstances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Weather-Related Cancellations</h4>
                <p className="text-gray-600">
                  For outdoor events, severe weather conditions may require rescheduling. We'll work with you 
                  to find an alternative date at no additional cost.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Medical Emergencies</h4>
                <p className="text-gray-600">
                  We understand emergencies happen. Please contact us immediately - we'll work with you on a 
                  case-by-case basis to find the best solution.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Host Hampton Cancellations</h4>
                <p className="text-gray-600">
                  If we need to cancel due to circumstances beyond our control, you'll receive a 
                  <strong>full refund</strong> or priority rescheduling.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-mauve-rose" />
                Refund Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Refunds are processed within 5-7 business days</li>
                <li>• Refunds are issued to the original payment method</li>
                <li>• Processing fees may apply depending on payment method</li>
                <li>• Add-on purchases follow the same cancellation timeline</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-mauve-rose" />
                How to Cancel or Reschedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                To cancel or reschedule your party, please contact us as soon as possible:
              </p>
              
              <div className="bg-dusty-blue/10 border border-dusty-blue/20 rounded-lg p-4">
                <div className="space-y-2 text-gray-700">
                  <p><strong>Phone:</strong> 631-998-9325</p>
                  <p><strong>Email:</strong> hosthampton295@gmail.com</p>
                  <p><strong>Hours:</strong> Monday-Saturday 9AM-6PM</p>
                </div>
              </div>
              
              <p className="text-gray-600 mt-4">
                Please have your booking confirmation number ready when you contact us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• All cancellations must be made via phone or email - not through third parties</li>
                <li>• Deposit payments are non-refundable after 14 days regardless of cancellation timing</li>
                <li>• Special event packages may have different cancellation terms</li>
                <li>• This policy applies to all bookings made after January 1, 2024</li>
              </ul>
              
              <p className="text-gray-500 text-sm mt-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}