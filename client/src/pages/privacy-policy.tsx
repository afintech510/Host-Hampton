import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-ivory to-soft-blush-pink">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <p className="text-gray-600">
                  We collect information you provide directly to us, such as when you:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>Request a quote or book an event</li>
                  <li>Create an account or profile</li>
                  <li>Contact us via phone, email, or contact forms</li>
                  <li>Subscribe to our newsletter or marketing communications</li>
                  <li>Participate in surveys or promotional activities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Information Collected Automatically</h4>
                <p className="text-gray-600">
                  When you visit our website, we may automatically collect certain information about your device and how you interact with our site, including:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>IP address and browser type</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website or search terms</li>
                  <li>Device information and operating system</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Provide and improve our party planning services</li>
                <li>Process bookings and communicate about events</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Respond to your inquiries and customer service requests</li>
                <li>Analyze website usage to improve user experience</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>With your explicit consent</li>
                <li>To trusted service providers who assist in operating our business</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic 
                storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of the data we hold about you</li>
              </ul>
              <p className="text-gray-600 mt-4">
                To exercise these rights, please contact us at privacy@hosthampton.com or (555) 123-PARTY.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@hosthampton.com</p>
                <p><strong>Phone:</strong> (555) 123-PARTY</p>
                <p><strong>Address:</strong> 123 Party Lane, Hampton, NY 11946</p>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}