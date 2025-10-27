import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Users,
  Camera,
  BookOpen,
  Heart,
  PartyPopper,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { useQuery } from "@tanstack/react-query";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
}

export default function OurSpace() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch upcoming events from products
  const { data: productsData } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const upcomingEvents = productsData || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-advance slider
  useEffect(() => {
    if (upcomingEvents.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % upcomingEvents.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [upcomingEvents.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % upcomingEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length
    );
  };

  const useCases = [
    {
      icon: PartyPopper,
      title: "DIY Parties",
      description:
        "Bring your vision to life! Rent our beautiful space and create your own party experience with full flexibility and creative freedom.",
      color: "from-pink-500 to-purple-500",
    },
    {
      icon: BookOpen,
      title: "Adult Classes & Workshops",
      description:
        "Host engaging workshops, creative classes, or skill-building sessions in our inspiring, fully-equipped studio environment.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Users,
      title: "Children's Events",
      description:
        "Perfect for birthday parties, playdates, and special celebrations. Safe, supervised, and designed for unforgettable kid-friendly fun.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Calendar,
      title: "Weekly Meetups",
      description:
        "Establish your community group, book club, or recurring gathering in a welcoming space that feels like home.",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Camera,
      title: "Photography Sessions",
      description:
        "Beautiful natural light, versatile backdrops, and a professional setting for photoshoots, content creation, and portraits.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Heart,
      title: "Special Occasions",
      description:
        "Baby showers, bridal events, anniversaries, and milestone celebrations deserve a space as special as the moment.",
      color: "from-red-500 to-pink-500",
    },
  ];

  const amenities = [
    "2,000 sq ft open floor plan",
    "Natural lighting & professional photo backdrops",
    "Tables, chairs & party supplies included",
    "Full kitchen access",
    "Sound system & entertainment setup",
    "Soft play area for children",
    "Parking available",
    "Climate controlled year-round",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-ivory via-soft-blush-pink to-warm-ivory">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-mauve-rose text-white text-lg px-6 py-2">
              ✦ Your Versatile Event Space
            </Badge>
            <h1
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-black"
              style={{ fontFamily: "'Libre Baskerville', serif" }}
            >
              One Space.
              <br />
              Endless Possibilities.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed">
              From intimate gatherings to creative workshops, Host Hampton
              transforms to match your vision. Your event, your way.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 text-4xl text-mauve-rose animate-pulse">
          ✦
        </div>
        <div className="absolute bottom-20 left-20 text-3xl text-mauve-rose animate-pulse [animation-delay:-1s]">
          ✦
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perfect For Every <span className="text-purple-600">Occasion</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're planning, hosting, or creating, our space adapts to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${useCase.color}`}></div>
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${useCase.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <useCase.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Slider */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Upcoming <span className="text-purple-600">Events</span>
              </h2>
              <p className="text-xl text-gray-600">
                Join us for these exciting experiences at Host Hampton
              </p>
            </div>

            <div className="max-w-4xl mx-auto relative">
              {/* Slider */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Card className="border-0">
                  <CardContent className="p-0">
                    <div className="relative h-96 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                      {upcomingEvents[currentSlide] && (
                        <div className="text-center p-8">
                          <Badge className="mb-4 bg-purple-600 text-white text-sm px-4 py-1">
                            {upcomingEvents[currentSlide].category || "Event"}
                          </Badge>
                          <h3 className="text-3xl font-bold text-gray-900 mb-4">
                            {upcomingEvents[currentSlide].name}
                          </h3>
                          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                            {upcomingEvents[currentSlide].description}
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <div className="text-2xl font-bold text-purple-600">
                              ${upcomingEvents[currentSlide].basePrice}
                            </div>
                            <Link href="/get-quote">
                              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                Book Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Arrows */}
                {upcomingEvents.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                      data-testid="slider-prev"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                      data-testid="slider-next"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>
                  </>
                )}
              </div>

              {/* Dots Indicator */}
              {upcomingEvents.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {upcomingEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide
                          ? "bg-purple-600 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      data-testid={`slider-dot-${index}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Amenities Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need <span className="text-purple-600">Included</span>
              </h2>
              <p className="text-xl text-gray-600">
                Our space comes fully equipped for your success
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                >
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 font-medium">{amenity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Make Your Event Happen?
            </h2>
            <p className="text-xl mb-12 opacity-90">
              Choose the perfect option for your celebration
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Party Planning CTA */}
              <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PartyPopper className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Book a Hosted Party
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Let us handle everything! Choose a themed party package with activities, decor, and entertainment included.
                  </p>
                  <Link href="/themed-parties">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      data-testid="button-book-party"
                    >
                      Explore Party Options
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Studio Rental CTA */}
              <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Rent Our Space
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your own experience! Book our versatile studio space and bring your unique vision to life.
                  </p>
                  <Link href="/get-quote">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                      data-testid="button-rent-space"
                    >
                      Book Studio Rental
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12">
              <p className="text-lg opacity-90 mb-4">
                Questions? We're here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:631-998-9325"
                  className="text-white hover:text-purple-100 font-semibold"
                >
                  📞 631-998-9325
                </a>
                <a
                  href="mailto:hosthampton295@gmail.com"
                  className="text-white hover:text-purple-100 font-semibold"
                >
                  ✉️ hosthampton295@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
