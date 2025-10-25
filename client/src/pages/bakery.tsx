import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ShoppingCart, Package } from "lucide-react";
import Navigation from "@/components/navigation";
import { UnifiedButton } from "@/components/ui/unified-button";
import type { Product, ProductDrop } from "@shared/schema";

export default function Bakery() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: drops = [] } = useQuery<ProductDrop[]>({
    queryKey: ["/api/product-drops"],
  });

  // Filter for bakery products
  const bakeryProducts = products.filter(p => p.category === "bakery");

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sourdough Bakery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fresh artisan sourdough bread, baked locally with love. Pre-order for pickup at Host Hampton during our scheduled drops.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-12 bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Choose Your Drop</h3>
              <p className="text-gray-600 text-sm">Select from our upcoming bread drops and add to cart</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Complete Pre-Order</h3>
              <p className="text-gray-600 text-sm">Pay online to secure your loaves (limited quantity)</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Pickup Fresh Bread</h3>
              <p className="text-gray-600 text-sm">Pick up your warm loaves during the scheduled window</p>
            </div>
          </div>
        </div>

        {/* Upcoming Drops */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Upcoming Drops</h2>
          
          {drops.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Drops Scheduled Yet</h3>
                <p className="text-gray-600">
                  Check back soon for our next bread drop announcement!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drops.map((drop) => {
                const product = bakeryProducts.find(p => p.id === drop.productId);
                if (!product) return null;
                
                const isSoldOut = drop.remainingInventory === 0;
                const isLowStock = drop.remainingInventory <= 5 && drop.remainingInventory > 0;

                return (
                  <Card key={drop.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                    {product.imageUrl && (
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{drop.dropName}</CardTitle>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        </div>
                        {isSoldOut && (
                          <Badge variant="destructive" className="ml-2">Sold Out</Badge>
                        )}
                        {isLowStock && !isSoldOut && (
                          <Badge className="ml-2 bg-orange-500">Only {drop.remainingInventory} left!</Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-amber-600" />
                          <span className="font-medium">{formatDate(drop.pickupDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="w-4 h-4 mr-2 text-amber-600" />
                          <span>Pickup: {drop.pickupWindowStart} - {drop.pickupWindowEnd}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {drop.remainingInventory} / {drop.totalInventory} available
                          </div>
                        </div>
                        
                        {drop.perCustomerLimit && (
                          <p className="text-xs text-gray-500">
                            Limit {drop.perCustomerLimit} per customer
                          </p>
                        )}
                      </div>

                      <UnifiedButton
                        className="w-full"
                        disabled={isSoldOut}
                        data-testid={`button-add-drop-${drop.id}`}
                      >
                        {isSoldOut ? "Sold Out" : "Add to Cart"}
                      </UnifiedButton>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Our Baker</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We've partnered with a talented local artisan baker who crafts each loaf with care using traditional sourdough methods. 
            Every loaf is naturally leavened, hand-shaped, and baked to golden perfection.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Due to the artisan nature of these loaves and limited baking capacity, we offer bread through scheduled "drops" - 
            pre-order your loaves online and pick them up fresh at Host Hampton during the designated pickup window.
          </p>
        </div>
      </div>
    </div>
  );
}
