import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, Clock, CreditCard, Download, Check } from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1753333962128.png";

interface Invoice {
  id: number;
  invoiceNumber: string;
  leadId: number;
  customerId: number;
  description: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  eventLocation: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount: number;
  balanceDue: number;
  depositPercentage: number;
  taxRate: number;
  status: string;
  dueDate: string;
  termsAndConditions: string;
  items: InvoiceItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function InvoiceView() {
  const { invoiceId } = useParams();
  const [location, navigate] = useLocation();
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch invoice data
  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/invoices/${invoiceId}`);
      const data = await response.json();
      return data.success ? data.invoice : null;
    }
  });

  const handlePayDeposit = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }
    navigate(`/invoice/${invoiceId}/pay?type=deposit`);
  };

  const handlePayBalance = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }
    navigate(`/invoice/${invoiceId}/pay?type=balance`);
  };

  const handlePayFull = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }
    navigate(`/invoice/${invoiceId}/pay?type=full`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">The invoice you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'deposit_paid': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isDepositPaid = invoice.status === 'deposit_paid' || invoice.status === 'paid';
  const isFullyPaid = invoice.status === 'paid';
  const isOverdue = new Date(invoice.dueDate) < new Date() && !isFullyPaid;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={hostHamptonLogo} alt="Host Hampton" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Invoice #{invoice.invoiceNumber}
                </h1>
                <p className="text-gray-600">{invoice.description}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {isOverdue && (
                <div className="text-red-600 text-sm mt-1">
                  Overdue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold">{invoice.customer.name}</p>
                  <p className="text-gray-600">{invoice.customer.email}</p>
                  <p className="text-gray-600">{invoice.customer.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {new Date(invoice.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p>{invoice.eventStartTime} - {invoice.eventEndTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p>{invoice.eventLocation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.items.map((item: InvoiceItem) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Terms and Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {invoice.termsAndConditions}
                  </pre>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm">
                    I have read and agree to the terms and conditions
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary and Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>${invoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${invoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Deposit ({invoice.depositPercentage}%):</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${invoice.depositAmount.toFixed(2)}</span>
                      {isDepositPaid && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Balance Due:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${invoice.balanceDue.toFixed(2)}</span>
                      {isFullyPaid && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                  {isOverdue && (
                    <p className="text-sm text-red-600 font-medium">
                      This invoice is overdue
                    </p>
                  )}
                </div>

                {!isFullyPaid && (
                  <div className="space-y-3 pt-4">
                    {!isDepositPaid && (
                      <>
                        <Button
                          onClick={handlePayDeposit}
                          disabled={!termsAccepted}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Deposit (${invoice.depositAmount.toFixed(2)})
                        </Button>
                        
                        <Button
                          onClick={handlePayFull}
                          disabled={!termsAccepted}
                          variant="outline"
                          className="w-full"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Full Amount (${invoice.totalAmount.toFixed(2)})
                        </Button>
                      </>
                    )}
                    
                    {isDepositPaid && !isFullyPaid && (
                      <Button
                        onClick={handlePayBalance}
                        disabled={!termsAccepted}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Balance (${invoice.balanceDue.toFixed(2)})
                      </Button>
                    )}
                  </div>
                )}

                {isFullyPaid && (
                  <div className="text-center py-4">
                    <div className="bg-green-100 p-4 rounded-lg">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">Fully Paid</p>
                      <p className="text-green-700 text-sm">Thank you for your payment!</p>
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}