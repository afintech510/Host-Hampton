import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Sparkles, Palette, Gift } from "lucide-react";
import { Link } from "wouter";

const PartyDesigner = () => {
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);

  const eventTypes = [
    {
      id: "birthday",
      name: "Kids Birthday Party",
      description: "Full-service themed birthday celebrations with decorations, activities, and entertainment",
      icon: "🎂",
      gradient: "from-pink-400 to-purple-600",
      features: ["Themed decorations", "Activities & games", "Party favors", "Professional setup"]
    },
    {
      id: "trucker-hat",
      name: "Trucker Hat Bar",
      description: "Interactive custom hat designing experience for parties and events",
      icon: "🧢",
      gradient: "from-blue-400 to-indigo-600",
      features: ["Custom designs", "Various colors", "Iron-on patches", "Take home creation"]
    },
    {
      id: "permanent-jewelry",
      name: "Permanent Jewelry",
      description: "Welded bracelet and anklet experiences for lasting memories",
      icon: "💎",
      gradient: "from-yellow-400 to-orange-600",
      features: ["14k gold chains", "Custom sizing", "Welded on-site", "Lifetime wear"]
    },
    {
      id: "studio-full",
      name: "Full Studio Rental",
      description: "Complete studio space for your private event with all amenities",
      icon: "🏢",
      gradient: "from-green-400 to-teal-600",
      features: ["Entire studio", "4-hour rental", "Setup included", "Capacity 30+"]
    },
    {
      id: "studio-partial",
      name: "Partial Studio Rental",
      description: "Shared studio space perfect for smaller gatherings and workshops",
      icon: "🎨",
      gradient: "from-purple-400 to-pink-600",
      features: ["Shared space", "2-hour rental", "Setup included", "Capacity 15"]
    },
    {
      id: "workshop",
      name: "Workshop/Class",
      description: "Educational and creative workshops for kids and adults",
      icon: "📚",
      gradient: "from-indigo-400 to-blue-600",
      features: ["Expert instruction", "All materials", "Take home projects", "Group activities"]
    }
  ];

  if (selectedEventType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedEventType(null)}
              className="mb-4"
            >
              ← Back to Event Types
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Design Your Perfect Event
            </h1>
            <p className="text-xl text-gray-600">
              You selected: <span className="text-purple-600 font-semibold">
                {eventTypes.find(type => type.id === selectedEventType)?.name}
              </span>
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-6">🚧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Multi-Step Designer Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                The interactive party designer tool is currently under development. 
                This will include a 4-step wizard for event details, package selection, 
                billing info, and payment processing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/party-booking">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Use Current Booking Form
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedEventType(null)}
                >
                  Choose Different Event Type
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[hsl(15,25%,85%)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/attached_assets/host-hampton-logo_1920_1753312301680.png" 
                alt="Host Hampton" 
                className="h-8 object-contain"
              />
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-[hsl(155,40%,25%)] hover:bg-[hsl(15,25%,90%)]">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[hsl(45,60%,85%)] text-[hsl(155,40%,25%)] border-[hsl(45,60%,70%)] text-lg px-6 py-2">
            ✦ Interactive Planning Tool
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-[hsl(155,40%,25%)] mb-4">
            What Type of Event Are You Planning?
          </h1>
          <p className="text-lg text-[hsl(155,20%,45%)] max-w-2xl mx-auto">
            Choose your event type below to start designing your perfect celebration. 
            Get real-time pricing and book with just a deposit.
          </p>
        </div>

        {/* Event Type Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {eventTypes.map((eventType) => (
            <Card 
              key={eventType.id}
              className="group cursor-pointer border-2 border-[hsl(15,25%,85%)] hover:border-[hsl(155,40%,25%)] hover:shadow-xl transition-all transform hover:scale-105 bg-white rounded-2xl"
              onClick={() => setSelectedEventType(eventType.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(15,40%,95%)] to-[hsl(45,40%,90%)] opacity-30 rounded-2xl"></div>
              <CardHeader className="relative z-10">
                <div className="text-center">
                  <div className="text-4xl mb-3">{eventType.icon}</div>
                  <CardTitle className="text-xl text-[hsl(155,40%,25%)] group-hover:text-[hsl(155,40%,20%)] transition-colors">
                    {eventType.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <p className="text-[hsl(155,20%,45%)] text-sm mb-4 text-center">
                  {eventType.description}
                </p>
                <div className="space-y-2">
                  {eventType.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-[hsl(155,20%,40%)]">
                      <div className="w-1.5 h-1.5 bg-[hsl(45,60%,70%)] rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button 
                    className="bg-[hsl(155,40%,25%)] text-white hover:bg-[hsl(155,40%,20%)] w-full group-hover:shadow-lg transition-all rounded-full"
                  >
                    Start Planning
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why Use Our Designer Tool?
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Pricing</h3>
              <p className="text-gray-600 text-sm">See costs update live as you add services and options</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Booking</h3>
              <p className="text-gray-600 text-sm">Reserve your date with just a small deposit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Options</h3>
              <p className="text-gray-600 text-sm">Personalize every detail to match your vision</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All-Inclusive</h3>
              <p className="text-gray-600 text-sm">Everything you need for an amazing celebration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyDesigner;