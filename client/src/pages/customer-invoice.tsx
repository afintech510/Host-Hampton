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
import { Download, MapPin, Phone, Mail, Sparkles } from "lucide-react";
import logoUrl from "@assets/host-hampton-logo_300_1754200191740.png";

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
          return_url: `${window.location.origin}/docs/inv/${invoice.id}?payment=success`,
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
    <Card className="h-fit bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Payment
        </CardTitle>
        <CardDescription className="text-purple-100">
          Complete your payment securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
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

        <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Your payment is secured by Stripe
          <Sparkles className="w-3 h-3 text-purple-400" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomerInvoice() {
  const [, params] = useRoute("/docs/inv/:invoiceId");
  const invoiceId = params?.invoiceId;
  const { toast } = useToast();

  const downloadPDF = () => {
    // Simple PDF download - opens print dialog
    window.print();
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 print:bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logo and Business Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 print:shadow-none print:rounded-none">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Host Hampton" className="h-16 w-auto" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Host Hampton
                </h1>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Creating Magical Moments</span>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>295 Montauk Hwy, Speonk NY 11972</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>631-998-9325</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>hosthampton295@gmail.com</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-lg text-purple-600 font-semibold">#{invoice.id}</p>
            </div>
            <Button
              onClick={downloadPDF}
              variant="outline"
              className="print:hidden border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Invoice Details - Left Side */}
          <div className="lg:col-span-2 space-y-6">

            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">Invoice Details</CardTitle>
                    <CardDescription className="text-purple-100">
                      Created on {new Date(invoice.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                    className="bg-white/20 text-white border-white/30"
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Customer Information */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-purple-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Bill To:
                  </h3>
                  <div className="text-sm space-y-1">
                    <div className="font-medium text-gray-900">{invoice.clientName}</div>
                    <div className="text-gray-600">{invoice.clientEmail}</div>
                    <div className="text-gray-600">{invoice.clientPhone}</div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Event Details:
                  </h3>
                  <div className="text-sm space-y-2">
                    <div className="font-medium text-gray-900">{invoice.eventDetails}</div>
                    {invoice.eventDate && (
                      <div className="text-gray-600">
                        <span className="font-medium">Date:</span> {new Date(invoice.eventDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="text-gray-600">
                      <span className="font-medium">Location:</span> {invoice.eventLocation}
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Services:
                  </h3>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {invoice.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-3 border-b border-purple-200/50 last:border-b-0">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-purple-700">{formatCurrency(item.total)}</div>
                            <div className="text-sm text-gray-600">
                              {formatCurrency(item.unitPrice)} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-purple-100">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-purple-100">
                      <span>Tax:</span>
                      <span>{formatCurrency(invoice.tax)}</span>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="flex justify-between text-yellow-200">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Deposit Required:
                      </span>
                      <span className="font-semibold">{formatCurrency(invoice.deposit)}</span>
                    </div>
                    <div className="flex justify-between text-blue-100">
                      <span>Balance Due:</span>
                      <span className="font-medium">{formatCurrency(invoice.balanceDue)}</span>
                    </div>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 text-yellow-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Notes:
                    </h3>
                    <p className="text-sm text-yellow-700">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Module - Right Side */}
          <div className="lg:col-span-1 print:hidden">
            <Elements 
              stripe={stripePromise} 
              options={{
                mode: 'payment',
                amount: invoice.deposit, // Default to deposit amount
                currency: 'usd',
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#8b5cf6',
                    colorBackground: '#fefefe',
                    colorText: '#1f2937',
                    borderRadius: '8px',
                  }
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