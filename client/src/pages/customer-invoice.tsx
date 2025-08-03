import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Invoice {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string | null;
  eventDetails: string;
  eventLocation: string;
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  balanceDue: number;
  depositPaid: boolean;
  status: string;
  notes: string;
  createdAt: string;
  items: Array<{
    id: number;
    type: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

function PaymentForm({ invoice }: { invoice: Invoice }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [processing, setProcessing] = useState(false);

  const paymentAmount = paymentType === "deposit" ? invoice.deposit : invoice.total;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent for the selected amount
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: paymentAmount,
        invoiceId: invoice.id,
        paymentType
      });
      
      const { clientSecret } = await response.json();

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/customer-invoice/${invoice.id}?payment=success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>
          Complete your payment securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={paymentType}
          onValueChange={(value) => setPaymentType(value as "deposit" | "full")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="deposit" id="deposit" />
            <Label htmlFor="deposit" className="flex-1">
              <div className="flex justify-between">
                <span>Deposit Payment</span>
                <span className="font-medium">
                  {formatCurrency(invoice.deposit)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Pay deposit to secure your booking
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="full" />
            <Label htmlFor="full" className="flex-1">
              <div className="flex justify-between">
                <span>Full Payment</span>
                <span className="font-medium">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Pay the full amount now
              </div>
            </Label>
          </div>
        </RadioGroup>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          
          <Button 
            type="submit" 
            disabled={!stripe || processing} 
            className="w-full"
          >
            {processing 
              ? "Processing..." 
              : `Pay ${formatCurrency(paymentAmount)}`
            }
          </Button>
        </form>

        <div className="text-xs text-muted-foreground text-center">
          Your payment is secured by Stripe
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomerInvoice() {
  const [, params] = useRoute("/customer-invoice/:invoiceId");
  const invoiceId = params?.invoiceId;
  const { toast } = useToast();

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/invoices/${invoiceId}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch invoice");
      }
      return data.invoice as Invoice;
    },
    enabled: !!invoiceId,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Thank you for your payment. You will receive a confirmation email shortly.",
      });
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-destructive">Invoice Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              The invoice you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Invoice Details - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold">Host Hampton</h1>
              <p className="text-muted-foreground">Invoice #{invoice.id}</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Invoice Details</CardTitle>
                    <CardDescription>
                      Created on {new Date(invoice.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <div className="text-sm space-y-1">
                    <div>{invoice.clientName}</div>
                    <div>{invoice.clientEmail}</div>
                    <div>{invoice.clientPhone}</div>
                  </div>
                </div>

                {/* Event Information */}
                <div>
                  <h3 className="font-semibold mb-2">Event Details:</h3>
                  <div className="text-sm space-y-1">
                    <div>{invoice.eventDetails}</div>
                    {invoice.eventDate && (
                      <div>Date: {new Date(invoice.eventDate).toLocaleDateString()}</div>
                    )}
                    <div>Location: {invoice.eventLocation}</div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold mb-2">Services:</h3>
                  <div className="space-y-2">
                    {invoice.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.total)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.unitPrice)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-primary">
                    <span>Deposit Required:</span>
                    <span className="font-semibold">{formatCurrency(invoice.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(invoice.balanceDue)}</span>
                  </div>
                </div>

                {invoice.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes:</h3>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Module - Right Side */}
          <div className="lg:col-span-1">
            <Elements 
              stripe={stripePromise} 
              options={{
                mode: 'payment',
                amount: invoice.deposit, // Default to deposit amount
                currency: 'usd',
                appearance: {
                  theme: 'stripe',
                }
              }}
            >
              <PaymentForm invoice={invoice} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}