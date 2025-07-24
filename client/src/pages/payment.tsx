import { useState, useEffect } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      }
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent.status === 'succeeded') {
      toast({
        title: "Payment Successful!",
        description: "Thank you for your payment. We'll contact you soon with event details.",
      });
      
      // Clear saved form data
      sessionStorage.removeItem('partyFormData');
      
      // Redirect to success page or home
      setTimeout(() => {
        window.location.href = "/?payment=success";
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Payment
          </>
        )}
      </Button>
    </form>
  );
};

export default function Payment() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get client secret from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecretParam = urlParams.get('client_secret');
    
    if (clientSecretParam) {
      setClientSecret(clientSecretParam);
      setIsLoading(false);
    } else {
      // Check if there's pending payment data in localStorage
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        try {
          const paymentData = JSON.parse(pendingPayment);
          setClientSecret(paymentData.clientSecret);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to parse pending payment:', error);
          toast({
            title: "Payment Error",
            description: "Unable to load payment information. Please try booking again.",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/book-event";
          }, 2000);
        }
      } else {
        toast({
          title: "Payment Error",
          description: "No payment information found. Redirecting to booking...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/book-event";
        }, 2000);
      }
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>
              Unable to load payment information. Please try booking again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/book-event"}
              className="w-full"
            >
              Return to Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
              <CardDescription>
                Secure payment processing for your Host Hampton event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}