import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { PartyPopper, Home, Gem, Shirt } from "lucide-react";

export default function Pricing() {
  const services = [
    {
      title: "Theme Party",
      description: "Full-service themed birthday parties with activities, decorations, and entertainment",
      icon: PartyPopper,
      color: "from-pink-500 to-purple-600",
      link: "/my-theme-party",
      features: ["Custom themes", "Activities & games", "Decorations included", "Party host"]
    },
    {
      title: "Studio Rental",
      description: "DIY party space rental - bring your own decorations and setup",
      icon: Home,
      color: "from-blue-500 to-cyan-600",
      link: "/my-studio-rental",
      features: ["Flexible hours", "Private space", "Tables & chairs", "Setup included"]
    },
    {
      title: "Permanent Jewelry",
      description: "Custom-welded bracelets, anklets, and necklaces for you and your guests",
      icon: Gem,
      color: "from-yellow-500 to-orange-600",
      link: "/my-permanent-jewelry",
      features: ["Custom designs", "High-quality chains", "Professional welding", "Party packages"]
    },
    {
      title: "Trucker Hat Bar",
      description: "Interactive hat customization station with patches, embroidery, and more",
      icon: Shirt,
      color: "from-green-500 to-teal-600",
      link: "/my-trucker-hat",
      features: ["Custom patches", "Embroidery options", "Multiple hat styles", "Fun for all ages"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            Choose Your Experience
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Select a service to get started with your custom quote
          </p>
        </div>

        {/* Service Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link 
                key={service.title} 
                href={service.link}
                onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
              >
                <Card 
                  className="group cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 hover:shadow-xl h-full"
                  data-testid={`card-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${service.color} p-6 md:p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="bg-white bg-opacity-20 rounded-full p-3 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold">{service.title}</h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm md:text-base text-gray-700">
                          <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-purple-600 font-semibold group-hover:text-purple-700 text-sm md:text-base">
                        Get Quote
                      </span>
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16 px-4">
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            Not sure which option is right for you?
          </p>
          <Link href="/contact">
            <button className="bg-black hover:bg-gray-800 text-white rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold transition-all hover:scale-105 text-sm md:text-base">
              Contact Us for Help
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
