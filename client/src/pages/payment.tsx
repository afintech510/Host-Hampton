import { useEffect, useState } from "react";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from "@/components/payment/payment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Payment() {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'succeeded' | 'failed'>('processing');
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get client secret from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecretFromUrl = urlParams.get('client_secret');
    
    if (clientSecretFromUrl) {
      setClientSecret(clientSecretFromUrl);
    }

    // Get stored payment info from localStorage
    const pendingPayment = localStorage.getItem('pendingPayment');
    if (pendingPayment) {
      const paymentInfo = JSON.parse(pendingPayment);
      setPaymentIntentId(paymentInfo.paymentIntentId || '');
      setBookingData(paymentInfo.bookingData || null);
      
      // Use stored client secret if URL doesn't have one
      if (!clientSecretFromUrl && paymentInfo.clientSecret) {
        setClientSecret(paymentInfo.clientSecret);
      }
    }
  }, []);

  const handlePaymentSuccess = () => {
    setPaymentStatus('succeeded');
    // Clear stored payment info
    localStorage.removeItem('pendingPayment');
  };

  const handlePaymentError = () => {
    setPaymentStatus('failed');
  };

  const handleBackToBooking = () => {
    setLocation('/book-event');
  };

  const handleBackToHome = () => {
    setLocation('/themed-parties');
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-dusty-blue flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              No payment information found. Please start the booking process again.
            </p>
            <Button 
              onClick={handleBackToBooking}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'succeeded') {
    return (
      <div className="min-h-screen bg-dusty-blue flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 mr-2" />
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-700 font-medium">
                Your reservation deposit has been processed successfully.
              </p>
              <p className="text-sm text-gray-600">
                We'll contact you within 24 hours to finalize your event details and discuss any special requirements.
              </p>
              {bookingData && (
                <div className="bg-pink-50 p-3 rounded-lg mt-4">
                  <p className="text-sm text-pink-800">
                    <strong>Booking ID:</strong> {bookingData.eventId}
                  </p>
                  <p className="text-sm text-pink-800">
                    <strong>Invoice ID:</strong> {bookingData.invoiceId}
                  </p>
                </div>
              )}
            </div>
            <Button 
              onClick={handleBackToHome}
              className="w-full bg-pink-400 hover:bg-pink-500"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-dusty-blue flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              There was an issue processing your payment. Please try again or contact us directly.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setPaymentStatus('processing')}
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={handleBackToBooking}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#A1B5C8', // Dusty blue
      colorBackground: '#ffffff',
      colorText: '#374151',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-dusty-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Complete Your Payment</CardTitle>
            <p className="text-center text-gray-600 text-sm">
              Secure payment processing powered by Stripe
            </p>
          </CardHeader>
          <CardContent>
            <Elements options={options} stripe={stripePromise}>
              <PaymentForm 
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                bookingData={bookingData}
              />
            </Elements>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center">
          <Button 
            variant="ghost" 
            onClick={handleBackToBooking}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>
        </div>
      </div>
    </div>
  );
}