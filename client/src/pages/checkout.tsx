import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/navigation";
import { UnifiedButton } from "@/components/ui/unified-button";
import type { CartItem, Product, ProductSession } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Form schema for billing information
const checkoutFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

function CheckoutForm({ 
  clientSecret, 
  orderData, 
  onSuccess 
}: { 
  clientSecret: string;
  orderData: CheckoutFormData & { totalAmount: number; sessionId: string };
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    try {
      // First create the order in our database
      const orderResponse = await apiRequest("POST", "/api/orders", {
        sessionId: orderData.sessionId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        totalAmount: orderData.totalAmount,
        status: "pending"
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderResponse.json();

      // Confirm payment with Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderId=${order.id}`,
        },
      });

      if (error) {
        // Update order status to failed
        await apiRequest("PATCH", `/api/orders/${order.id}`, {
          status: "failed"
        });
        
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded, update order status and clear cart
        await apiRequest("PATCH", `/api/orders/${order.id}`, {
          status: "completed"
        });
        
        // Clear the cart after successful payment
        localStorage.removeItem('shop_session_id');
        
        onSuccess();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Information</h3>
        <PaymentElement 
          options={{
            layout: "tabs"
          }}
        />
      </div>

      <Separator />

      {/* Security Notice */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 text-green-800">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Secure Payment</span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Your payment information is encrypted and secure. We use Stripe for payment processing and never store your card details.
        </p>
      </div>

      {/* Submit Button */}
      <UnifiedButton
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
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
            <span>Complete Payment ${(orderData.totalAmount / 100).toFixed(2)}</span>
          </div>
        )}
      </UnifiedButton>
    </form>
  );
}

export default function Checkout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // Form for billing information
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    },
  });

  useEffect(() => {
    const storedSessionId = localStorage.getItem('shop_session_id');
    if (!storedSessionId) {
      toast({
        title: "No items in cart",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      setLocation('/shop-events');
      return;
    }
    setSessionId(storedSessionId);
  }, []);

  // Get cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart', sessionId],
    enabled: !!sessionId,
  });

  // Get products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Get product sessions
  const { data: allSessions = [] } = useQuery<ProductSession[]>({
    queryKey: ['/api/product-sessions'],
  });

  // Calculate totals with tax and credit card fee
  const subtotal = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);
  
  const salesTax = Math.round(subtotal * 0.0875); // 8.75% sales tax
  const subtotalWithTax = subtotal + salesTax;
  const creditCardFee = Math.round(subtotalWithTax * 0.03); // 3% credit card fee
  const totalAmount = subtotalWithTax + creditCardFee;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingPayment(true);
    
    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        sessionId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
      });

      if (!response.ok) {
        throw new Error("Failed to create payment session");
      }

      const result = await response.json();
      setClientSecret(result.clientSecret);
    } catch (error) {
      console.error("Error creating payment session:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Clear cart and redirect to success page
    localStorage.removeItem('shop_session_id');
    setLocation('/checkout/success');
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Link href="/shop-events">
                <UnifiedButton>Continue Shopping</UnifiedButton>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/cart">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    const session = item.productSessionId 
                      ? allSessions.find(s => s.id === item.productSessionId)
                      : null;
                    if (!product) return null;
                    return (
                      <div key={item.id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {session && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                {session.sessionName} • {new Date(session.sessionDate).toLocaleDateString()} • {session.sessionTime}
                              </Badge>
                            </div>
                          )}
                          {product.eventDate && !session && (
                            <p className="text-sm text-gray-600">
                              Date: {new Date(product.eventDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${((product.price || 0) * item.quantity / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${(subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sales Tax (8.75%):</span>
                      <span>${(salesTax / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Credit Card Fee (3%):</span>
                      <span>${(creditCardFee / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>${(totalAmount / 100).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Billing & Payment */}
            <div>
              {!clientSecret ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <UnifiedButton
                          type="submit"
                          disabled={isLoadingPayment}
                          className="w-full"
                        >
                          {isLoadingPayment ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                              <span>Loading Payment...</span>
                            </div>
                          ) : (
                            "Continue to Payment"
                          )}
                        </UnifiedButton>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm 
                        clientSecret={clientSecret}
                        orderData={{
                          ...form.getValues(),
                          totalAmount,
                          sessionId
                        }}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}