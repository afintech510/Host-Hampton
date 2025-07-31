import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Lock, CheckCircle } from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1753333962128.png";

interface Invoice {
  id: number;
  invoiceNumber: string;
  description: string;
  eventDate: string;
  totalAmount: number;
  depositAmount: number;
  balanceDue: number;
  customer: {
    name: string;
    email: string;
  };
}

export default function InvoicePayment() {
  const { invoiceId } = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const paymentType = searchParams.get('type') || 'deposit'; // deposit, balance, full

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch invoice data
  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/invoices/${invoiceId}`);
      const data = await response.json();
      return data.success ? data.invoice : null;
    }
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentPayload: any) => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/payments`, paymentPayload);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully."
        });
        navigate(`/invoice/${invoiceId}/payment-success?type=${paymentType}`);
      } else {
        toast({
          title: "Payment Failed",
          description: data.message || "Payment processing failed. Please try again.",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getPaymentAmount = () => {
    if (!invoice) return 0;
    switch (paymentType) {
      case 'full': return invoice.totalAmount;
      case 'balance': return invoice.balanceDue;
      case 'deposit':
      default: return invoice.depositAmount;
    }
  };

  const getPaymentDescription = () => {
    switch (paymentType) {
      case 'full': return 'Full Payment';
      case 'balance': return 'Balance Payment';
      case 'deposit':
      default: return 'Deposit Payment';
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Basic validation
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required payment fields.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    const paymentPayload = {
      paymentType,
      amount: getPaymentAmount(),
      paymentMethod: 'card',
      cardDetails: {
        // In a real implementation, this would be tokenized by Stripe
        last4: paymentData.cardNumber.slice(-4),
        cardholderName: paymentData.cardholderName
      },
      billingAddress: paymentData.billingAddress
    };

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      processPaymentMutation.mutate(paymentPayload);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">The invoice you're trying to pay doesn't exist.</p>
        </div>
      </div>
    );
  }

  const paymentAmount = getPaymentAmount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/invoice/${invoiceId}`)}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <img src={hostHamptonLogo} alt="Host Hampton" className="h-8" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Secure Payment</h1>
                  <p className="text-gray-600 text-sm">Invoice #{invoice.invoiceNumber}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Secured by SSL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      value={paymentData.cardholderName}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: formatExpiryDate(e.target.value) }))}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Billing Address</h3>
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={paymentData.billingAddress.street}
                        onChange={(e) => setPaymentData(prev => ({
                          ...prev,
                          billingAddress: { ...prev.billingAddress, street: e.target.value }
                        }))}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={paymentData.billingAddress.city}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            billingAddress: { ...prev.billingAddress, city: e.target.value }
                          }))}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={paymentData.billingAddress.state}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            billingAddress: { ...prev.billingAddress, state: e.target.value }
                          }))}
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={paymentData.billingAddress.zipCode}
                        onChange={(e) => setPaymentData(prev => ({
                          ...prev,
                          billingAddress: { ...prev.billingAddress, zipCode: e.target.value }
                        }))}
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ${paymentAmount.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Your payment information is secured with industry-standard encryption.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{invoice.description}</h3>
                  <p className="text-gray-600 text-sm">
                    {new Date(invoice.eventDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm">
                    For: {invoice.customer.name}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Invoice Total:</span>
                    <span>${invoice.totalAmount.toFixed(2)}</span>
                  </div>
                  {paymentType !== 'full' && (
                    <div className="flex justify-between">
                      <span>Deposit Amount:</span>
                      <span>${invoice.depositAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentType === 'balance' && (
                    <div className="flex justify-between">
                      <span>Previous Payments:</span>
                      <span>${invoice.depositAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>{getPaymentDescription()}:</span>
                  <span>${paymentAmount.toFixed(2)}</span>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Secure Payment</p>
                      <p className="text-blue-700">
                        Your payment is processed securely and your information is encrypted.
                      </p>
                    </div>
                  </div>
                </div>

                {paymentType === 'deposit' && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This is a deposit payment. The remaining balance of 
                      ${invoice.balanceDue.toFixed(2)} will be due before your event.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}