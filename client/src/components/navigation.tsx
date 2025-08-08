import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";
import type { CartItem } from "@shared/schema";

interface NavigationProps {
  cartItemCount?: number;
}

export default function Navigation({ cartItemCount }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const storedSessionId = localStorage.getItem("shop_session_id");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  // Fetch cart items to get actual count
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await fetch(`/api/cart/${sessionId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!sessionId,
  });

  const actualCartCount = cartItemCount ?? cartItems.length;

  const menuItems = [
    { name: "Theme Parties", href: "/themed-parties" },
    { name: "Party Room Rental", href: "/party-room-rental" },
    { name: "Trucker Hat Bar", href: "/trucker-hat-bar" },
    { name: "Permanent Jewelry", href: "/permanent-jewelry" },
    { name: "Shop Events", href: "/upcoming-events" },
    { name: "Cart", href: "/cart" },
    { name: "My Events", href: "/my-events" },
    { name: "admin", href: "/admin" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout: Stacked with logo centered above buttons */}
        <div className="block sm:hidden">
          {/* Logo Row */}
          <div className="flex justify-center py-3">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <img
                  src="/images/host-hampton-logo.png"
                  alt="Host Hampton"
                  className="h-12 w-auto object-contain max-w-[200px]"
                  onError={(e) => {
                    console.log("Logo failed to load from public path");
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={() => {
                    console.log("Logo loaded successfully from public path");
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Buttons Row */}
          <div className="px-4 pb-3">
            <div className="flex space-x-2 mb-3">
              <Link href="/get-quote" className="flex-1">
                <Button className="bg-black hover:bg-gray-800 text-white rounded-full text-sm px-4 py-3 w-full">
                  Instant Quote
                </Button>
              </Link>

              <Link href="/upcoming-events" className="flex-1">
                <Button className="bg-black hover:bg-gray-800 text-white rounded-full text-sm px-4 py-3 w-full">
                  Upcoming Events
                </Button>
              </Link>
            </div>

            <div className="flex justify-center items-center space-x-4">
              {/* Shopping Cart Icon */}
              <Link href="/cart">
                <div className="relative cursor-pointer">
                  <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-pink-600" />
                  {actualCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {actualCartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Horizontal */}
        <div className="hidden sm:flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <img
                  src="/images/host-hampton-logo.png"
                  alt="Host Hampton"
                  className="h-12 md:h-14 w-auto object-contain max-w-[200px]"
                  onError={(e) => {
                    console.log("Logo failed to load from public path");
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={() => {
                    console.log("Logo loaded successfully from public path");
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Right side - Instant Quote, Upcoming Events Button, Cart Icon and Menu Button */}
          <div className="flex items-center space-x-4">
            <Link href="/get-quote">
              <Button className="bg-black hover:bg-gray-800 text-white rounded-full text-sm px-4 py-2">
                Instant Quote
              </Button>
            </Link>

            <Link href="/upcoming-events">
              <Button className="bg-black hover:bg-gray-800 text-white rounded-full text-sm px-4 py-2">
                Upcoming Events
              </Button>
            </Link>

            {/* Shopping Cart Icon */}
            <Link href="/cart">
              <div className="relative cursor-pointer">
                <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-pink-600" />
                {actualCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {actualCartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Menu - now shows on all screen sizes when hamburger is clicked */}
        {isMenuOpen && (
          <div>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {menuItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span
                    className="text-gray-600 hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium cursor-pointer text-right"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
