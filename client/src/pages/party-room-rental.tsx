import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, MapPin, Wifi, Camera, Music, Utensils } from "lucide-react";
import { Link } from "wouter";

export default function PartyRoomRental() {
  const amenities = [
    { icon: <Users className="w-5 h-5" />, text: "Capacity up to 50 guests" },
    { icon: <Wifi className="w-5 h-5" />, text: "Free high-speed WiFi" },
    { icon: <Camera className="w-5 h-5" />, text: "Photo backdrop area" },
    { icon: <Music className="w-5 h-5" />, text: "Sound system & microphone" },
    { icon: <Utensils className="w-5 h-5" />, text: "Kitchen facilities available" },
    { icon: <MapPin className="w-5 h-5" />, text: "Prime Hampton location" },
  ];

  const packages = [
    {
      name: "Basic Rental",
      price: "$400",
      duration: "3 hours",
      description: "Perfect for intimate gatherings",
      features: [
        "Room rental for 3 hours",
        "Tables and chairs included",
        "Basic sound system",
        "Cleanup included"
      ]
    },
    {
      name: "Standard Rental", 
      price: "$550",
      duration: "4 hours",
      description: "Most popular choice for parties",
      features: [
        "Room rental for 4 hours",
        "Tables, chairs & linens",
        "Full sound system & mic",
        "Photo backdrop setup",
        "Cleanup included"
      ],
      popular: true
    },
    {
      name: "Premium Rental",
      price: "$700",
      duration: "5 hours", 
      description: "Ultimate party experience",
      features: [
        "Room rental for 5 hours",
        "Premium table settings",
        "Full A/V equipment",
        "Photo backdrop & props",
        "Kitchen access",
        "Dedicated party coordinator",
        "Cleanup included"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Party Room Rental
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rent our beautiful party space for your special celebration. Perfect for birthdays, 
            workshops, corporate events, and private gatherings in the heart of Hampton.
          </p>
        </div>

        {/* Amenities Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What's Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600">{amenity.icon}</div>
                <span className="text-gray-700">{amenity.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Packages */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Rental Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="text-3xl font-bold text-blue-600 mt-4">{pkg.price}</div>
                  <div className="text-sm text-gray-500">{pkg.duration}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/book-event">
                    <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                      Book This Package
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Reserve Your Date?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our party room books up quickly, especially on weekends. Secure your date today 
            with a reservation deposit. Weekend rates may apply.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-event">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Check Availability
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Schedule Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}