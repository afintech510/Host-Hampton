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
  const [location] = useLocation();

  // Get session ID from localStorage or generate one (consistent with shop-events)
  const getSessionId = () => {
    let sessionId = localStorage.getItem("shop_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("shop_session_id", sessionId);
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

  // Don't show button if cart is empty or on cart/checkout/get-quote pages
  if (
    !cartItems ||
    cartItems.length === 0 ||
    location === "/cart" ||
    location === "/checkout" ||
    location === "/get-quote"
  ) {
    return null;
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total price by looking up product prices
  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      return sum + product.price * item.quantity;
    }
    return sum;
  }, 0);

  // Debug logging
  console.log(
    "FloatingCheckoutButton - cartItems:",
    cartItems,
    "sessionId:",
    getSessionId(),
    "totalItems:",
    totalItems,
    "totalPrice:",
    totalPrice,
  );

  const handleCheckout = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLocation("/checkout");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleCheckout}
        className="relative bg-white hover:bg-gray-50 text-gray-800 shadow-2xl rounded-full p-4 transition-all duration-200 hover:scale-110 border-2 border-gray-200"
        data-testid="button-floating-cart"
        aria-label="View cart"
      >
        <ShoppingCart className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
          {totalItems}
        </span>
      </button>
    </div>
  );
}
