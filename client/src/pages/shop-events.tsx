import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Product, CartItem } from "@shared/schema";
import Navigation from "@/components/navigation";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Generate a session ID for the cart
const getSessionId = () => {
  let sessionId = localStorage.getItem('shop_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('shop_session_id', sessionId);
  }
  return sessionId;
};

function CheckoutForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/shop-events?success=true",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your tickets have been purchased!",
      });
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <UnifiedButton 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Complete Purchase"}
      </UnifiedButton>
    </form>
  );
}

export default function ShopEvents() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const sessionId = getSessionId();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/cart/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, productId, quantity }),
      });
      if (!response.ok) throw new Error("Failed to add to cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
      toast({
        title: "Added to Cart",
        description: "Event ticket added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await fetch(`/api/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error("Failed to update cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove from cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
      toast({
        title: "Removed from Cart",
        description: "Item removed from your cart",
      });
    },
  });

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!response.ok) throw new Error("Failed to create checkout session");
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setCheckoutOpen(true);
    },
    onError: () => {
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceInCents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const onCheckoutSuccess = () => {
    setCheckoutOpen(false);
    setClientSecret(null);
    queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
    localStorage.removeItem('shop_session_id');
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation cartItemCount={cartItems.length} />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop Events & Workshops</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us for exciting hands-on workshops and special events. Perfect for date nights, 
            girls' trips, or learning new creative skills!
          </p>
        </div>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="mb-8 p-4 bg-primary/5 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">
                  Cart: {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} - {formatPrice(cartTotal)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCartOpen(true)}>
                  View Cart
                </Button>
                <UnifiedButton
                  onClick={() => checkoutMutation.mutate()}
                  disabled={cartItems.length === 0 || checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? "Processing..." : "Checkout"}
                </UnifiedButton>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            {product.imageUrl && (
              <div className="aspect-video bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <div className="text-2xl font-bold text-primary mt-2">
                    {formatPrice(product.price)}
                  </div>
                </div>
                {product.category && (
                  <Badge variant="secondary">{product.category}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <CardDescription className="text-gray-600">
                  {product.description}
                </CardDescription>
              )}
              
              {product.eventDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(product.eventDate)}
                </div>
              )}
              
              {product.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {product.location}
                </div>
              )}
              
              {product.availableTickets !== null && product.maxTickets && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {product.availableTickets} of {product.maxTickets} spots available
                </div>
              )}
            </CardContent>
            <CardFooter>
              <UnifiedButton
                onClick={() => addToCartMutation.mutate({ productId: product.id })}
                disabled={product.availableTickets === 0 || addToCartMutation.isPending}
                className="w-full"
              >
                {product.availableTickets === 0 ? "Sold Out" : addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </UnifiedButton>
            </CardFooter>
          </Card>
        ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Available</h3>
            <p className="text-gray-600">Check back soon for upcoming workshops and events!</p>
          </div>
        )}

        {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
            <DialogDescription>
              Review your selected events before checkout
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cartItems.map((item) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              
              return (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">{formatPrice(product.price)} each</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartMutation.mutate({ 
                        id: item.id, 
                        quantity: Math.max(0, item.quantity - 1) 
                      })}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartMutation.mutate({ 
                        id: item.id, 
                        quantity: item.quantity + 1 
                      })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(product.price * item.quantity)}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCartMutation.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {cartItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold mb-4">
                <span>Total:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <UnifiedButton
                onClick={() => {
                  setCartOpen(false);
                  checkoutMutation.mutate();
                }}
                disabled={checkoutMutation.isPending}
                className="w-full"
              >
                {checkoutMutation.isPending ? "Processing..." : "Proceed to Checkout"}
              </UnifiedButton>
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>
              Enter your payment information to complete your purchase
            </DialogDescription>
          </DialogHeader>
          
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} onSuccess={onCheckoutSuccess} />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}