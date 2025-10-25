import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Package, Truck, Store } from "lucide-react";
import Navigation from "@/components/navigation";
import { UnifiedButton } from "@/components/ui/unified-button";
import type { Product, RetailInventory, ProductVariant } from "@shared/schema";

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: inventory = [] } = useQuery<RetailInventory[]>({
    queryKey: ["/api/retail-inventory"],
  });

  // Filter for retail products
  const retailProducts = products.filter(p => 
    p.category && ["gifts", "clothing", "seasonal", "accessories"].includes(p.category)
  );

  const filteredProducts = selectedCategory === "all" 
    ? retailProducts 
    : retailProducts.filter(p => p.category === selectedCategory);

  const categories = [
    { value: "all", label: "All Products" },
    { value: "gifts", label: "Gifts" },
    { value: "clothing", label: "Clothing" },
    { value: "accessories", label: "Accessories" },
    { value: "seasonal", label: "Seasonal" },
  ];

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getInventoryForProduct = (productId: number) => {
    return inventory.find(inv => inv.productId === productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Retail Shop
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover unique gifts, clothing, and seasonal items curated with love for you and your family.
          </p>
        </div>

        {/* Fulfillment Options */}
        <div className="mb-12 bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Shopping Options</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Pickup at Host Hampton</h3>
                <p className="text-gray-600 text-sm">Order online and pickup at our location - no shipping fees!</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Local Delivery</h3>
                <p className="text-gray-600 text-sm">Select items available for local delivery (coming soon)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Browse Products</h2>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
              <p className="text-gray-600">
                Check back soon for new arrivals!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const productInventory = getInventoryForProduct(product.id);
              const inStock = productInventory && productInventory.quantityOnHand > 0;
              const lowStock = productInventory && productInventory.quantityOnHand <= (productInventory.lowStockThreshold || 5) && productInventory.quantityOnHand > 0;

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {product.imageUrl ? (
                    <div className="h-56 overflow-hidden bg-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                      {product.category && (
                        <Badge variant="outline" className="ml-2 capitalize text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      
                      {productInventory && (
                        <div className="text-sm">
                          {!inStock ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : lowStock ? (
                            <Badge className="bg-orange-500">Only {productInventory.quantityOnHand} left</Badge>
                          ) : (
                            <span className="text-green-600 font-medium">In Stock</span>
                          )}
                        </div>
                      )}
                    </div>

                    <UnifiedButton
                      className="w-full"
                      disabled={!inStock}
                      data-testid={`button-add-product-${product.id}`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {!inStock ? "Out of Stock" : "Add to Cart"}
                    </UnifiedButton>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
