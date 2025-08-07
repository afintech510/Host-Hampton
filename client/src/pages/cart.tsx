import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/navigation";
import { UnifiedButton } from "@/components/ui/unified-button";
import type { CartItem, Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";



export default function Cart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let storedSessionId = localStorage.getItem('shop_session_id');
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('shop_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart", sessionId],
    enabled: !!sessionId,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const response = await apiRequest("PATCH", "/api/cart", {
        sessionId,
        productId,
        quantity,
      });
      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
    },
    onError: (error) => {
      console.error('Cart update error:', error);
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (cartItemId: number) => {
      await apiRequest("DELETE", `/api/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
      toast({
        title: "Item Removed",
        description: "Item removed from cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });



  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cart/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const salesTax = Math.round(subtotal * 0.0875); // 8.75% sales tax
  const cartTotal = subtotal + salesTax;

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }
    setLocation('/checkout');
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation cartItemCount={0} />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation cartItemCount={cartItems.length} />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/upcoming-events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some workshops or events to get started!</p>
            <Link href="/upcoming-events">
              <UnifiedButton>
                Browse Events
              </UnifiedButton>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;

                return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {product.imageUrl && (
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(product.price)}
                            </span>
                            {product.category && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantityMutation.mutate({
                                productId: product.id,
                                quantity: Math.max(1, item.quantity - 1)
                              })}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantityMutation.mutate({
                                productId: product.id,
                                quantity: Math.max(1, parseInt(e.target.value) || 1)
                              })}
                              className="w-16 text-center quantity-input"
                              style={{ textAlign: 'center' }}
                              disabled={updateQuantityMutation.isPending}
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantityMutation.mutate({
                                productId: product.id,
                                quantity: item.quantity + 1
                              })}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItemMutation.mutate(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Clear Cart Button */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => clearCartMutation.mutate()}
                  disabled={clearCartMutation.isPending}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      if (!product) return null;
                      
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {product.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatPrice(product.price * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <hr />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sales Tax (8.75%)</span>
                      <span className="font-medium">{formatPrice(salesTax)}</span>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(cartTotal)}</span>
                  </div>

                  <div className="pt-4">
                    <UnifiedButton
                      onClick={handleProceedToCheckout}
                      disabled={cartItems.length === 0}
                      className="w-full"
                    >
                      Proceed to Checkout
                    </UnifiedButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}