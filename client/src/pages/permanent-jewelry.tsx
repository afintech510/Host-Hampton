import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, Users, Clock, Star, Heart, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function PermanentJewelry() {
  const services = [
    {
      title: "Custom Welding",
      description: "Professional jewelry welding with premium metals",
      icon: <Sparkles className="w-8 h-8" />,
      details: ["14k gold chains", "Sterling silver options", "Custom sizing", "Permanent application"]
    },
    {
      title: "Group Events",
      description: "Perfect for parties, celebrations, and bonding experiences",
      icon: <Users className="w-8 h-8" />,
      details: ["Bridal parties", "Birthday celebrations", "Girls' nights", "Mother-daughter events"]
    },
    {
      title: "Mobile Service",
      description: "We bring the jewelry studio to your location",
      icon: <Gem className="w-8 h-8" />,
      details: ["In-home service", "Venue setup", "Corporate events", "Full equipment included"]
    }
  ];

  const jewelryTypes = [
    {
      name: "Bracelets",
      price: "Starting at $65",
      description: "Delicate chains welded perfectly to your wrist",
      image: "✨"
    },
    {
      name: "Anklets", 
      price: "Starting at $70",
      description: "Elegant ankle jewelry for that perfect touch",
      image: "👸"
    },
    {
      name: "Necklaces",
      price: "Starting at $85",
      description: "Custom length chains that never come off",
      image: "💎"
    },
    {
      name: "Ring Stacks",
      price: "Starting at $45",
      description: "Connected rings for a unique look",
      image: "💍"
    }
  ];

  const packages = [
    {
      name: "Individual Session",
      price: "$65-$150",
      duration: "30 minutes",
      description: "Personal jewelry experience",
      features: [
        "One piece of jewelry",
        "Choice of 14k gold or sterling silver",
        "Custom chain selection",
        "Professional welding",
        "Aftercare instructions"
      ]
    },
    {
      name: "Party Package",
      price: "$200 minimum",
      duration: "2-3 hours",
      description: "Perfect for groups of 4-8 people",
      features: [
        "Mobile service to your location",
        "Group rates available", 
        "Multiple jewelry options",
        "Photo opportunities",
        "Champagne service option",
        "Custom party favors"
      ],
      popular: true
    },
    {
      name: "Bridal Experience",
      price: "$300 minimum", 
      duration: "3-4 hours",
      description: "Luxury experience for your special day",
      features: [
        "Bridal party jewelry",
        "Premium gold options",
        "Matching sets available",
        "Professional photography",
        "Luxury gift boxes",
        "Complimentary touch-ups"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">💎✨</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Permanent Jewelry
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create lasting memories with our permanent jewelry service. We custom weld beautiful 
            chains that become a part of you - symbolizing unbreakable bonds and special moments.
          </p>
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-rose-600 flex justify-center mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center justify-center">
                        <Heart className="w-3 h-3 text-rose-500 mr-2" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Jewelry Types */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Jewelry Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jewelryTypes.map((type, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{type.image}</div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <div className="text-lg font-semibold text-rose-600">{type.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Packages */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Booking Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-rose-500' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-rose-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="text-2xl font-bold text-rose-600 mt-4">{pkg.price}</div>
                  <div className="text-sm text-gray-500">{pkg.duration}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <Gem className="w-3 h-3 text-rose-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/book-event">
                    <Button className="w-full mt-6 bg-rose-600 hover:bg-rose-700">
                      Book Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">💕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready for Your Forever Jewelry?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Book your permanent jewelry experience today. Perfect for celebrating milestones, 
            friendships, love, or just treating yourself to something special that lasts forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-event">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                Schedule Appointment
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              View Portfolio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}