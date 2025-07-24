import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Calendar, Users, MapPin, Star, Clock } from "lucide-react";
import { Link } from "wouter";

export default function TruckHatBar() {
  const services = [
    {
      title: "Mobile Hat Bar",
      description: "We bring the hat bar experience directly to your event location",
      icon: <Truck className="w-8 h-8" />,
      features: ["Full mobile setup", "Professional styling", "Custom hats available", "All ages welcome"]
    },
    {
      title: "Hat Customization",
      description: "Personalize hats with patches, pins, and custom embroidery",
      icon: <Star className="w-8 h-8" />,
      features: ["Custom embroidery", "Patch selection", "Pin collection", "On-site styling"]
    },
    {
      title: "Event Coordination",
      description: "Full event management with hat bar as the main attraction",
      icon: <Calendar className="w-8 h-8" />,
      features: ["Event planning", "Setup & breakdown", "Photo opportunities", "Take-home keepsakes"]
    }
  ];

  const packages = [
    {
      name: "Basic Mobile Bar",
      price: "$299",
      duration: "2 hours",
      guests: "Up to 15 people",
      description: "Perfect for small gatherings",
      features: [
        "Mobile hat bar setup",
        "Selection of 20+ hats",
        "Basic customization supplies",
        "2-hour event duration"
      ]
    },
    {
      name: "Premium Experience",
      price: "$449", 
      duration: "3 hours",
      guests: "Up to 25 people",
      description: "Most popular choice",
      features: [
        "Full mobile hat bar",
        "40+ hat styles",
        "Premium customization",
        "Photo booth setup",
        "Professional styling assistance",
        "3-hour event duration"
      ],
      popular: true
    },
    {
      name: "Deluxe Package",
      price: "$599",
      duration: "4 hours", 
      guests: "Up to 40 people",
      description: "Ultimate hat bar experience",
      features: [
        "Luxury mobile setup",
        "60+ designer hats",
        "Custom embroidery on-site",
        "Professional photographer",
        "Styling consultant",
        "Custom take-home boxes",
        "4-hour event duration"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🚛👒</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trucker Hat Bar
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bring the ultimate trucker hat bar experience to your event! Our mobile trucker hat bar 
            comes directly to you with a curated collection of trendy trucker hats and custom styling services.
          </p>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-amber-600 flex justify-center mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center justify-center">
                        <Star className="w-3 h-3 text-amber-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Packages Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Choose Your Package
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-amber-500' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="text-3xl font-bold text-amber-600 mt-4">{pkg.price}</div>
                  <div className="text-sm text-gray-500">{pkg.duration} • {pkg.guests}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-3 h-3 text-amber-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/book-event">
                    <Button className="w-full mt-6 bg-amber-600 hover:bg-amber-700">
                      Book This Package
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Roll Up to Your Event?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our truck hat bar is perfect for birthday parties, corporate events, festivals, 
            and any celebration where you want to add a unique, interactive experience!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-event">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                Book Your Event
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              View Gallery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}