import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1753333962128.png";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "Shop Events", href: "/shop-events" },
    { name: "Theme Parties", href: "/themed-parties" },
    { name: "Party Room Rental", href: "/party-room-rental" },
    { name: "Trucker Hat Bar", href: "/truck-hat-bar" },
    { name: "Permanent Jewelry", href: "/permanent-jewelry" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <img
                  src={hostHamptonLogo}
                  alt="Host Hampton"
                  className="h-12 md:h-14 w-auto object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Right side - Book Now Button and Menu Button */}
          <div className="flex items-center space-x-4">
            <Link href="/book-event">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                Book Now
              </Button>
            </Link>

            {/* Menu button - now visible on all screen sizes */}
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
