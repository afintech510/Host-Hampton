import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Heart,
  Shield,
  Clock,
  Users,
  Sparkles,
  Gift,
  Camera,
  Cake,
  Music,
} from "lucide-react";
import { Link } from "wouter";
import { ReviewsSection } from "@/components/reviews-section";
import toddlerImage from "@assets/image_1752647828958.png";
import preschoolImage from "@assets/image_1752648592321.png";
import elementaryImage from "@assets/image_1752649999301.png";
import tweensImage from "@assets/image_1752648836877.png";

export default function ThemedParties() {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const expandingElement = document.getElementById('expanding-cta');
      if (!expandingElement) return;

      const rect = expandingElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate when the element is in view and how much
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Start expanding when element reaches 80% from top
      const triggerPoint = windowHeight * 0.8;
      
      if (elementTop <= triggerPoint && elementTop > -elementHeight) {
        // Element is in the expansion zone
        const progress = Math.max(0, Math.min(1, (triggerPoint - elementTop) / (windowHeight * 0.6)));
        setScrollProgress(progress);
      } else {
        // Element is out of expansion zone
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Please fill in all required fields",
        description: "Name, email, and message are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Here you would typically send to your backend
      // For now, we'll just show a success message
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form and close dialog
      setContactForm({ name: "", email: "", phone: "", message: "" });
      setIsContactDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again or call us directly.",
        variant: "destructive"
      });
    }
  };
  const themes = [
    {
      name: "The Spa Party",
      description:
        "Pink robes, manicures, hair styling, makeup, and DIY nail polish activity",
      color: "bg-pink-100 border-pink-300",
      icon: "💅",
    },
    {
      name: "Swiftie Party",
      description:
        "Taylor Swift theme with karaoke, friendship bracelets, and glitter makeup",
      color: "bg-purple-100 border-purple-300",
      icon: "🎤",
    },
    {
      name: "Barbie Party",
      description:
        "Life-size Barbie box photos, dress-up fashion show, and glam styling",
      color: "bg-pink-100 border-pink-300",
      icon: "💖",
    },
    {
      name: "Unicorn Party",
      description:
        "Unicorn headbands, glitter makeup, unicorn crafts, and rainbow celebration",
      color: "bg-purple-100 border-purple-300",
      icon: "🦄",
    },
    {
      name: "Slime Party",
      description:
        "Full slime station with take-home containers, glitter, beads, and karaoke",
      color: "bg-green-100 border-green-300",
      icon: "🧪",
    },
    {
      name: "cta-tile",
      description: "Call to action tile",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      icon: "🎉",
      isCTA: true,
    },
    {
      name: "Trucker Hat Party",
      description:
        "Customize hats with iron-on patches and photo booth with instant texting",
      color: "bg-blue-100 border-blue-300",
      icon: "🎨",
    },
    {
      name: "Sweets-n-Treats Party",
      description:
        "Apron decorating and dessert decorating - perfect for little bakers",
      color: "bg-yellow-100 border-yellow-300",
      icon: "🍭",
    },
    {
      name: "Toddler Party",
      description:
        "Soft play area with ball pit, rockers, and safe toddler-friendly activities",
      color: "bg-orange-100 border-orange-300",
      icon: "🧸",
    },
    {
      name: "Glow Party",
      description:
        "Neon blacklight experience with live DJ, glow face painting, and dance party",
      color: "bg-indigo-100 border-indigo-300",
      icon: "🌟",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Stress-Free Planning",
      description: "We handle all the details so you can focus on celebrating",
    },
    {
      icon: Sparkles,
      title: "Magical Experiences",
      description: "Immersive themed decorations and activities that wow kids",
    },
    {
      icon: Heart,
      title: "Unforgettable Memories",
      description:
        "Professional photos and moments your family will treasure forever",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              ✨ Let Us Plan Your Party 🎉
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Most <span className="text-yellow-300">Magical</span> Kids
              Parties
              <br />
              In Hampton!
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Transform your child's special day into an unforgettable adventure
              with our themed party experiences. Professional planning, magical
              decorations, and memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/party-booking">
                <Button
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all"
                >
                  Book Your Magic Party 🎉
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-4 rounded-full"
              >
                See Our Themes
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-6xl animate-bounce">
          🎈
        </div>
        <div className="absolute top-32 right-20 text-4xl animate-pulse">
          ⭐
        </div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce delay-300">
          🎂
        </div>
        <div className="absolute bottom-32 right-10 text-3xl animate-pulse delay-500">
          🎊
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Host Hampton Makes Parties{" "}
              <span className="text-purple-600">Extraordinary</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We don't just throw parties – we create magical experiences that
              kids remember forever
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-gray-50"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Party Themes Showcase */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="text-purple-600">Adventure</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From princesses to superheroes, we bring every theme to life with
              incredible detail
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {themes.map((theme, index) => {
              if (theme.isCTA) {
                return (
                  <Link key={index} href="/party-booking">
                    <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-purple-300 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-white">
                      <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                        <div className="text-6xl mb-4">{theme.icon}</div>
                        <h3 className="text-xl font-bold mb-2">
                          Ready to Book?
                        </h3>
                        <p className="text-purple-100 text-sm mb-4">
                          Click here to start planning your perfect celebration!
                        </p>
                        <div className="bg-white text-purple-600 px-4 py-2 rounded-full text-sm font-semibold inline-block">
                          Start Planning →
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              }

              return (
                <Card
                  key={index}
                  className={`${theme.color} border-2 hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4">{theme.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {theme.name}
                    </h3>
                    <p className="text-gray-700 text-sm">{theme.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/party-booking">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg"
              >
                Start Planning Your Theme Party
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Party Planning Made{" "}
              <span className="text-purple-600">Simple</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three easy steps to the most magical party your child has ever had
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Choose Your Theme
              </h3>
              <p className="text-gray-600">
                Pick from our magical themes or create a custom experience
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Book Your Date
              </h3>
              <p className="text-gray-600">
                Fill out our simple form and we'll handle all the planning
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Celebrate & Enjoy
              </h3>
              <p className="text-gray-600">
                Show up and watch your child's face light up with pure joy
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Age Groups Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Party Magic for{" "}
                <span className="text-purple-600">Every Age</span>
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-pink-500 text-2xl">✨</span>
                <span className="text-purple-500 text-2xl">✨</span>
                <span className="text-pink-500 text-2xl">✨</span>
              </div>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From tiny toddlers to trendy teens, we create age-perfect
                celebrations that capture every milestone moment. Our expert
                team crafts activities, themes, and experiences that match your
                child's interests and developmental stage perfectly.
              </p>
              <Link href="/party-booking">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg"
                >
                  Plan Your Perfect Party
                </Button>
              </Link>
            </div>

            <div className="lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-yellow-300 hover:shadow-lg transition-all transform hover:scale-105 overflow-hidden relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${toddlerImage})`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                      <span className="text-2xl">🧸</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Toddlers
                    </h3>
                    <p className="text-sm text-white/90">Ages 1-3</p>
                    <p className="text-xs text-white/80 mt-2">
                      Soft play, sensory fun, safe adventures
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-pink-300 hover:shadow-lg transition-all transform hover:scale-105 overflow-hidden relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${preschoolImage})`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Preschool
                    </h3>
                    <p className="text-sm text-white/90">Ages 4-5</p>
                    <p className="text-xs text-white/80 mt-2">
                      Creative crafts, themed play, imagination
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-300 hover:shadow-lg transition-all transform hover:scale-105 overflow-hidden relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${elementaryImage})`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                      <span className="text-2xl">🎭</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Elementary
                    </h3>
                    <p className="text-sm text-white/90">Ages 6-10</p>
                    <p className="text-xs text-white/80 mt-2">
                      Interactive games, themed adventures
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-indigo-300 hover:shadow-lg transition-all transform hover:scale-105 overflow-hidden relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${tweensImage})`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                      <span className="text-2xl">🌟</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Tweens & Teens
                    </h3>
                    <p className="text-sm text-white/90">Ages 11+</p>
                    <p className="text-xs text-white/80 mt-2">
                      Trendy themes, social experiences
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Drive Time Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Us in <span className="text-purple-600">Speonk</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conveniently located on Long Island, serving families across
              Suffolk County
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Location Info */}
            <div className="space-y-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Host Hampton Studio
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                        <span className="text-purple-600">📍</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Address</p>
                        <p className="text-gray-600">
                          123 Main Street
                          <br />
                          Speonk, NY 11972
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                        <span className="text-purple-600">📞</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Phone</p>
                        <p className="text-gray-600">(555) 123-PARTY</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                        <span className="text-purple-600">🕒</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Hours</p>
                        <p className="text-gray-600">
                          Mon-Fri: 10am-6pm
                          <br />
                          Sat-Sun: 9am-8pm
                          <br />
                          Parties by appointment
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      Calculate Your Drive Time
                    </h4>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter your address or zip code"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6">
                        Get Directions
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      We'll show you the quickest route and estimated drive time
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Serving These Areas
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-700">• Westhampton</p>
                      <p className="text-gray-700">• Hampton Bays</p>
                      <p className="text-gray-700">• Eastport</p>
                      <p className="text-gray-700">• Remsenburg</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-700">• Moriches</p>
                      <p className="text-gray-700">• Center Moriches</p>
                      <p className="text-gray-700">• East Moriches</p>
                      <p className="text-gray-700">• Manorville</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map Placeholder */}
            <div className="lg:h-full">
              <Card className="border-0 shadow-lg h-full min-h-[500px]">
                <CardContent className="p-0 h-full">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Map placeholder with visual elements */}
                    <div className="absolute inset-0 opacity-10">
                      {/* Road lines */}
                      <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-400 transform rotate-12"></div>
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 transform -rotate-6"></div>
                      <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-400 transform rotate-3"></div>
                      <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-gray-400 transform rotate-12"></div>
                      <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-gray-400 transform -rotate-12"></div>
                    </div>

                    {/* Location marker */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white text-2xl">📍</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">
                        Host Hampton
                      </h3>
                      <p className="text-gray-600">Speonk, NY</p>
                      <p className="text-sm text-gray-500 mt-4">
                        Interactive map coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <ReviewsSection showFeatured={true} limit={3} />
      
      {/* Got More Questions Section */}
      <section className="relative overflow-hidden">
        <div 
          className="bg-gradient-to-r from-pink-500 to-teal-400 py-16 px-4"
          style={{
            clipPath: "polygon(0 15%, 100% 0%, 100% 85%, 0% 100%)"
          }}
        >
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-white lg:text-left text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Got More Questions?
                </h2>
                <p className="text-lg md:text-xl leading-relaxed max-w-2xl">
                  We are your party planner and your party venue. If you've got 
                  questions, chances are, we've already answered them in our FAQs, 
                  but you can always contact us too!
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all"
                >
                  View FAQs
                </Button>
                
                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-pink-500 font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all"
                    >
                      Contact Us
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        Contact Host Hampton
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Tell us about your party needs or ask any questions..."
                          className="mt-1 min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsContactDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          Send Message
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Expanding CTA Section */}
      <section 
        id="expanding-cta"
        className="relative py-20"
      >
        {/* Fixed overlay that expands */}
        <div 
          className="fixed inset-0 z-40 pointer-events-none transition-all duration-700 ease-out"
          style={{
            opacity: scrollProgress,
            visibility: scrollProgress > 0 ? 'visible' : 'hidden',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: `url(${preschoolImage})`,
              }}
            ></div>
            <div className="absolute inset-0 bg-purple-900/60"></div>
          </div>
        </div>

        {/* Regular content when not expanded */}
        <div 
          className="relative z-50"
          style={{
            opacity: scrollProgress > 0.3 ? 0 : 1,
            transition: 'opacity 0.5s ease-out',
          }}
        >
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-xl overflow-hidden relative">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                  backgroundImage: `url(${preschoolImage})`,
                }}
              ></div>
              <div className="relative z-10 py-16 px-8 text-white">
                <div className="text-6xl mb-6">🎂</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Don't Miss Out!
                </h2>
                <h3 className="text-xl md:text-2xl font-bold mb-8">
                  Lock In Your Party Today!
                </h3>
                <Link href="/party-booking">
                  <Button
                    size="lg"
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg px-12 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all"
                  >
                    Book Your Party Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded overlay content */}
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center text-white text-center px-4"
          style={{
            opacity: scrollProgress,
            visibility: scrollProgress > 0 ? 'visible' : 'hidden',
            transform: `scale(${0.8 + (scrollProgress * 0.2)})`,
            transition: 'all 0.7s ease-out',
            pointerEvents: scrollProgress > 0 ? 'auto' : 'none',
          }}
        >
          <div>
            <div className="text-8xl mb-8">🎂</div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Don't Miss Out!
            </h2>
            <h3 className="text-2xl md:text-4xl font-bold mb-12">
              Lock In Your Party Today!
            </h3>
            
            <div className="space-y-6">
              <Link href="/party-booking">
                <Button
                  size="lg"
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-xl px-16 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all"
                >
                  Book Your Party Now
                </Button>
              </Link>
              
              {scrollProgress > 0.7 && (
                <div 
                  style={{
                    animation: 'fadeInUp 0.6s ease-out',
                  }}
                >
                  <p className="text-xl mb-6 max-w-2xl mx-auto">
                    Your child's dream party is just one click away. Let's make their special day extraordinary!
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold text-lg px-8 py-4 rounded-full"
                  >
                    Call Us: (555) 123-PARTY
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
