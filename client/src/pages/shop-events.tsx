import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ShoppingCart } from "lucide-react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";
import Navigation from "@/components/navigation";

// Helper function to format prices
const formatPrice = (priceInCents: number) => {
  return `$${(priceInCents / 100).toFixed(2)}`;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export default function ShopEvents() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Add to cart - redirect to cart page
  const handleAddToCart = async (product: Product) => {
    try {
      // Get or create session
      let sessionId = localStorage.getItem('shop_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('shop_session_id', sessionId);
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      toast({
        title: "Added to Cart",
        description: "Event added to your cart. Redirecting...",
      });

      // Redirect to cart page
      setTimeout(() => {
        setLocation("/cart");
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
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
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop Events & Workshops</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us for exciting hands-on workshops and special events. Perfect for date nights, 
            girls' trips, or learning new creative skills!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="mb-2">
                    Workshop
                  </Badge>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {product.eventDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      {formatDate(product.eventDate)}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    Host Hampton Studio
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Limited spots available
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <UnifiedButton
                  onClick={() => handleAddToCart(product)}
                  className="w-full"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </UnifiedButton>
              </CardFooter>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Available</h3>
            <p className="text-gray-600">Check back soon for upcoming workshops and events!</p>
          </div>
        )}
      </div>
    </div>
  );
}