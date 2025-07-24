import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function ShopEvents() {
  const events = [
    {
      id: 1,
      title: "Birthday Party Package",
      description: "Complete birthday party experience with decorations, activities, and cake",
      price: "$299",
      duration: "2 hours",
      capacity: "Up to 15 kids",
      image: "🎂"
    },
    {
      id: 2,
      title: "Princess Party",
      description: "Magical princess-themed party with dress-up, games, and royal treatment",
      price: "$349",
      duration: "2.5 hours", 
      capacity: "Up to 12 kids",
      image: "👑"
    },
    {
      id: 3,
      title: "Art & Craft Workshop",
      description: "Creative workshop where kids make their own masterpieces to take home",
      price: "$199",
      duration: "1.5 hours",
      capacity: "Up to 20 kids",
      image: "🎨"
    },
    {
      id: 4,
      title: "Dance Party",
      description: "High-energy dance party with music, choreography, and performance",
      price: "$249",
      duration: "2 hours",
      capacity: "Up to 25 kids",
      image: "💃"
    },
    {
      id: 5,
      title: "Science Adventure",
      description: "Fun science experiments and discoveries that amaze and educate",
      price: "$279",
      duration: "2 hours",
      capacity: "Up to 18 kids",
      image: "🔬"
    },
    {
      id: 6,
      title: "Superhero Training",
      description: "Action-packed superhero training camp with obstacle courses and missions",
      price: "$319",
      duration: "2.5 hours",
      capacity: "Up to 16 kids", 
      image: "🦸"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shop Events
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our collection of amazing party packages and experiences. 
            Each event is carefully crafted to create unforgettable memories for your child.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-4 text-center">{event.image}</div>
                <CardTitle className="text-xl text-center">{event.title}</CardTitle>
                <CardDescription className="text-center">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {event.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {event.capacity}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600 mb-4">{event.price}</div>
                  <Link href="/book-event">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">
                      Book This Event
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-gray-600 mb-6">
              We create custom events tailored to your child's interests and your budget. 
              Let's chat about making their dream party come true!
            </p>
            <Link href="/book-event">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                Custom Event Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}