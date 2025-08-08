import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface CartItem {
  id: number;
  sessionId: string;
  productId: number;
  productSessionId?: number;
  quantity: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  siblingPrice: number;
}

export default function FloatingCheckoutButton() {
  const [, setLocation] = useLocation();
  
  // Get session ID from localStorage or generate one (consistent with shop-events)
  const getSessionId = () => {
    let sessionId = localStorage.getItem('shop_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('shop_session_id', sessionId);
    }
    return sessionId;
  };

  // Get cart items
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: [`/api/cart/${getSessionId()}`],
    refetchInterval: 2000, // Refresh cart every 2 seconds
  });

  // Get products data to calculate prices
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Don't show button if cart is empty
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price by looking up product prices
  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      return sum + (product.price * item.quantity);
    }
    return sum;
  }, 0);

  // Debug logging
  console.log('FloatingCheckoutButton - cartItems:', cartItems, 'sessionId:', getSessionId(), 'totalItems:', totalItems, 'totalPrice:', totalPrice);

  const handleCheckout = () => {
    setLocation('/checkout');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleCheckout}
        size="lg"
        className="bg-blue-300 hover:bg-blue-400 text-white shadow-lg rounded-full px-6 py-3 flex items-center gap-3 transition-all duration-200 hover:scale-105 border-2 border-black"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center p-0 text-xs"
          >
            {totalItems}
          </Badge>
        </div>
        <span className="text-sm font-medium">Proceed to Checkout</span>
      </Button>
    </div>
  );
}