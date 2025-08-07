import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Link, useSearch } from "wouter";
import Navigation from "@/components/navigation";
import { UnifiedButton } from "@/components/ui/unified-button";

export default function CheckoutSuccess() {
  const search = useSearch();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const orderIdParam = params.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, [search]);

  // Get order details if we have an order ID
  const { data: order, isLoading } = useQuery<any>({
    queryKey: ['/api/orders', orderId],
    enabled: !!orderId,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Payment Successful!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : order ? (
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <h3 className="font-semibold mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono">#{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{order.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold">
                        ${(order.totalAmount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium capitalize">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">What's Next?</span>
                </div>
                <p className="text-sm text-blue-700">
                  You'll receive a confirmation email with your order details and event information. 
                  We'll also send you a reminder closer to your event date.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/my-events">
                  <UnifiedButton className="w-full sm:w-auto">
                    <span>View My Events</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </UnifiedButton>
                </Link>
                <Link href="/upcoming-events">
                  <UnifiedButton variant="outline" className="w-full sm:w-auto">
                    Continue Shopping
                  </UnifiedButton>
                </Link>
                <Link href="/">
                  <UnifiedButton variant="outline" className="w-full sm:w-auto">
                    Back to Home
                  </UnifiedButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}