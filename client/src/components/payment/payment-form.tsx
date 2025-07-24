import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield, Lock } from "lucide-react";

interface PaymentFormProps {
  onSuccess: () => void;
  onError: () => void;
  bookingData: any;
}

export function PaymentForm({ onSuccess, onError, bookingData }: PaymentFormProps) {
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Please check your payment details and try again.",
        variant: "destructive",
      });
      onError();
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful!",
        description: "Your reservation has been confirmed.",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      {bookingData && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Event Type:</span>
                <span className="capitalize font-medium">
                  {bookingData.eventType?.replace('-', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">#{bookingData.eventId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice ID:</span>
                <span className="font-medium">#{bookingData.invoiceId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Element */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <CreditCard className="w-5 h-5" />
          <span className="font-medium">Payment Information</span>
        </div>
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Address Element */}
      <div className="space-y-4">
        <AddressElement 
          options={{
            mode: 'billing',
            fields: {
              phone: 'always',
            },
          }}
        />
      </div>

      <Separator />

      {/* Security Notice */}
      <div className="bg-green-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2 text-green-800">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Secure Payment</span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Your payment information is encrypted and secure. We use Stripe for payment processing and never store your card details.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-pink-400 hover:bg-pink-500 disabled:bg-gray-200 disabled:text-gray-400"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Complete Payment</span>
          </div>
        )}
      </Button>

      {/* Terms Notice */}
      <p className="text-xs text-gray-500 text-center">
        By completing this payment, you agree to our terms of service and cancellation policy. 
        All deposits are subject to our refund terms.
      </p>
    </form>
  );
}