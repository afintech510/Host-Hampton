import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ShoppingCart, X, Sparkles } from "lucide-react";
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
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
};

export default function UpcomingEvents() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Product | null>(null);
  const [loadingCart, setLoadingCart] = useState<number | null>(null);

  // Fetch products (events)
  const { data: products = [], isLoading: productsLoading } = useQuery<
    Product[]
  >({
    queryKey: ["/api/products"],
  });

  // Filter for active events only
  const upcomingEvents = products.filter(product => 
    product.isActive && 
    product.eventDate && 
    new Date(product.eventDate) > new Date()
  ).sort((a, b) => 
    new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime()
  );

  // Add to cart
  const handleAddToCart = async (product: Product) => {
    setLoadingCart(product.id);
    try {
      // Get or create session
      let sessionId = localStorage.getItem("shop_session_id");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("shop_session_id", sessionId);
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

      // Invalidate cart cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });

      toast({
        title: "Added to Cart",
        description: `${product.name} added to your cart successfully!`,
      });

      // Redirect to cart and scroll to top
      setTimeout(() => {
        setLocation("/cart");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add event to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCart(null);
    }
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upcoming Events
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join us for amazing workshops, classes, and special events at Host Hampton. 
            Book your spot today and create unforgettable memories!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="w-5 h-5" />
            <span>All events held at Host Hampton Studio</span>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-12">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No upcoming events
            </h3>
            <p className="text-gray-500">
              Check back soon for new workshops and events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Card 
                key={event.id} 
                className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-fit"
              >
                {/* Large Event Image */}
                <div className="relative h-96 md:h-[28rem] lg:h-[32rem] overflow-hidden cursor-pointer">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={event.imageUrl || "/placeholder-event.jpg"}
                        alt={event.name}
                        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 bg-gray-50"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-event.jpg";
                        }}
                        onClick={() => setSelectedEvent(event)}
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[95vh] w-auto h-auto p-0 overflow-hidden border-0">
                      <VisuallyHidden>
                        <DialogTitle>{event.name} - Event Details</DialogTitle>
                        <DialogDescription>
                          Full size view of {event.name} event poster
                        </DialogDescription>
                      </VisuallyHidden>
                      <div className="relative w-full h-[90vh] bg-black flex items-center justify-center">
                        <img
                          src={event.imageUrl || "/placeholder-event.jpg"}
                          alt={event.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-event.jpg";
                          }}
                        />
                        {/* Overlay Add to Cart Button */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                          <div className="flex items-center justify-between text-white">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{event.name}</h3>
                              <div className="flex items-center gap-4 text-sm">
                                {event.eventDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(new Date(event.eventDate))}</span>
                                  </div>
                                )}
                                <span className="pricing-font text-lg font-bold">
                                  {formatPrice(event.price)}
                                </span>
                              </div>
                            </div>
                            <UnifiedButton
                              onClick={() => handleAddToCart(event)}
                              disabled={(event.availableTickets || 0) === 0 || loadingCart === event.id}
                              className={`${
                                (event.availableTickets || 0) === 0 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-600 hover:bg-purple-700'
                              } ${loadingCart === event.id ? 'bg-purple-700' : ''}`}
                              size="lg"
                            >
                              {loadingCart === event.id ? (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                  <span className="animate-pulse">Adding...</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  {(event.availableTickets || 0) === 0 ? 'Sold Out' : 'Add to Cart'}
                                </>
                              )}
                            </UnifiedButton>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <Badge 
                      variant="secondary"
                      className="bg-white/90 text-gray-800 font-medium"
                    >
                      {event.category}
                    </Badge>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 pointer-events-none">
                    <Badge 
                      variant="default"
                      className="bg-purple-600 text-white font-bold text-lg px-3 py-1 pricing-font"
                    >
                      {formatPrice(event.price)}
                    </Badge>
                  </div>

                  {/* Availability Indicator */}
                  {event.availableTickets !== undefined && event.maxTickets !== undefined && (
                    <div className="absolute bottom-4 left-4 pointer-events-none">
                      <Badge 
                        variant={event.availableTickets > 5 ? "default" : "destructive"}
                        className="bg-black/70 text-white"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        {event.availableTickets > 0 
                          ? `${event.availableTickets} spots left`
                          : "Sold Out"
                        }
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Event Title */}
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {event.name}
                    </h3>

                    {/* Date and Time */}
                    {event.eventDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(new Date(event.eventDate))}
                          </div>
                          <div className="text-gray-500">
                            {formatTime(new Date(event.eventDate))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}

                    {/* Description */}
                    {event.description && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    )}

                    {/* Add to Cart Button */}
                    <UnifiedButton
                      onClick={() => handleAddToCart(event)}
                      disabled={(event.availableTickets || 0) === 0 || loadingCart === event.id}
                      className={`w-full mt-4 relative ${
                        (event.availableTickets || 0) === 0 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      } ${loadingCart === event.id ? 'bg-purple-700' : ''}`}
                      size="lg"
                    >
                      {loadingCart === event.id ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          <span className="animate-pulse">Adding...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {(event.availableTickets || 0) === 0 ? 'Sold Out' : 'Add to Cart'}
                        </>
                      )}
                    </UnifiedButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Don't See What You're Looking For?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We offer custom workshops and private events! Contact us to discuss 
            your specific needs and we'll create something special just for you.
          </p>
          <UnifiedButton
            onClick={() => setLocation("/get-quote")}
            variant="outline"
            size="lg"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
          >
            Request Custom Event
          </UnifiedButton>
        </div>
      </div>
    </div>
  );
}