import { Link } from "wouter";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1753333962128.png";

export default function Footer() {
  const navigationLinks = [
    { name: "Theme Parties", href: "/themed-parties" },
    { name: "Party Room Rental", href: "/party-room-rental" },
    { name: "Trucker Hat Bar", href: "/trucker-hat-bar" },
    { name: "Permanent Jewelry", href: "/permanent-jewelry" },
    { name: "Our Venue", href: "/our-space" },
    { name: "Shop Events", href: "/shop-events" },
    { name: "My Events", href: "/my-events" },
  ];

  const serviceLinks = [
    { name: "Get Quote", href: "/get-quote" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Gallery", href: "/gallery" },
    { name: "Reviews", href: "/reviews" },
  ];

  const legalLinks = [
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cancellation Policy", href: "/cancellation-policy" },
    { name: "Communications Agreement", href: "/communications-agreement" },
    { name: "FAQ", href: "/faq" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com/hosthampton",
      icon: Facebook,
      color: "hover:text-blue-600"
    },
    {
      name: "Instagram", 
      href: "https://instagram.com/hosthampton",
      icon: Instagram,
      color: "hover:text-pink-600"
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-warm-ivory via-soft-blush-pink to-warm-ivory border-t border-mauve-rose/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <img
                src={hostHamptonLogo}
                alt="Host Hampton"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Creating magical party experiences for children and memorable moments for families. 
              One space, endless celebrations.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-mauve-rose" />
                <span>631-998-9325</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-mauve-rose" />
                <span>hosthampton295@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-mauve-rose" />
                <span>295 Montauk Hwy, Speonk, NY 11972</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-500 ${social.color} transition-colors duration-200`}
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Services</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span 
                      className="text-gray-600 hover:text-mauve-rose transition-colors duration-200 cursor-pointer text-sm"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span 
                      className="text-gray-600 hover:text-mauve-rose transition-colors duration-200 cursor-pointer text-sm"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span 
                      className="text-gray-600 hover:text-mauve-rose transition-colors duration-200 cursor-pointer text-sm"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-mauve-rose/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Host Hampton. All rights reserved.
          </div>
          
          {/* Quick Links */}
          <div className="flex space-x-6 text-sm">
            <Link href="/get-quote">
              <span 
                className="text-mauve-rose hover:text-dusty-blue font-medium cursor-pointer transition-colors duration-200"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Get Instant Quote
              </span>
            </Link>
            <Link href="/contact">
              <span 
                className="text-mauve-rose hover:text-dusty-blue font-medium cursor-pointer transition-colors duration-200"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Contact Us
              </span>
            </Link>
            <Link href="/shop-events">
              <span 
                className="text-mauve-rose hover:text-dusty-blue font-medium cursor-pointer transition-colors duration-200"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Upcoming Events
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="relative">
        <div className="absolute bottom-4 right-8 text-2xl text-mauve-rose/30 animate-pulse">
          ✦
        </div>
        <div className="absolute bottom-12 left-8 text-xl text-mauve-rose/30 animate-pulse [animation-delay:-1s]">
          ✦
        </div>
      </div>
    </footer>
  );
}