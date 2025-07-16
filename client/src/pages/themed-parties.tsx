import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Shield, Clock, Users, Sparkles, Gift, Camera, Cake, Music } from "lucide-react";
import { Link } from "wouter";
import { ReviewsSection } from "@/components/reviews-section";

export default function ThemedParties() {
  const themes = [
    {
      name: "The Spa Party",
      description: "Pink robes, manicures, hair styling, makeup, and DIY nail polish activity",
      color: "bg-pink-100 border-pink-300",
      icon: "💅"
    },
    {
      name: "Swiftie Party",
      description: "Taylor Swift theme with karaoke, friendship bracelets, and glitter makeup",
      color: "bg-purple-100 border-purple-300", 
      icon: "🎤"
    },
    {
      name: "Barbie Party",
      description: "Life-size Barbie box photos, dress-up fashion show, and glam styling",
      color: "bg-pink-100 border-pink-300",
      icon: "💖"
    },
    {
      name: "Unicorn Party",
      description: "Unicorn headbands, glitter makeup, unicorn crafts, and rainbow celebration",
      color: "bg-purple-100 border-purple-300",
      icon: "🦄"
    },
    {
      name: "Slime Party",
      description: "Full slime station with take-home containers, glitter, beads, and karaoke",
      color: "bg-green-100 border-green-300",
      icon: "🧪"
    },
    {
      name: "Trucker Hat Party",
      description: "Customize hats with iron-on patches and photo booth with instant texting",
      color: "bg-blue-100 border-blue-300",
      icon: "🎨"
    },
    {
      name: "Sweets-n-Treats Party",
      description: "Apron decorating and dessert decorating - perfect for little bakers",
      color: "bg-yellow-100 border-yellow-300",
      icon: "🍭"
    },
    {
      name: "Toddler Party",
      description: "Soft play area with ball pit, rockers, and safe toddler-friendly activities",
      color: "bg-orange-100 border-orange-300",
      icon: "🧸"
    },
    {
      name: "Glow Party",
      description: "Neon blacklight experience with live DJ, glow face painting, and dance party",
      color: "bg-indigo-100 border-indigo-300",
      icon: "🌟"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Stress-Free Planning",
      description: "We handle all the details so you can focus on celebrating"
    },
    {
      icon: Sparkles,
      title: "Magical Experiences",
      description: "Immersive themed decorations and activities that wow kids"
    },
    {
      icon: Heart,
      title: "Unforgettable Memories",
      description: "Professional photos and moments your family will treasure forever"
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              ✨ Hampton's Premier Party Planners ✨
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Most <span className="text-yellow-300">Magical</span> Kids Parties
              <br />In Hampton!
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Transform your child's special day into an unforgettable adventure with our themed party experiences. Professional planning, magical decorations, and memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/party-booking">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all">
                  Book Your Magic Party 🎉
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-4 rounded-full">
                See Our Themes
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-6xl animate-bounce">🎈</div>
        <div className="absolute top-32 right-20 text-4xl animate-pulse">⭐</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce delay-300">🎂</div>
        <div className="absolute bottom-32 right-10 text-3xl animate-pulse delay-500">🎊</div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Host Hampton Makes Parties <span className="text-purple-600">Extraordinary</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We don't just throw parties – we create magical experiences that kids remember forever
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
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
              From princesses to superheroes, we bring every theme to life with incredible detail
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {themes.map((theme, index) => (
              <Card key={index} className={`${theme.color} border-2 hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer`}>
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">{theme.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{theme.name}</h3>
                  <p className="text-gray-700 text-sm">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/party-booking">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg">
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
              Party Planning Made <span className="text-purple-600">Simple</span>
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
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Theme</h3>
              <p className="text-gray-600">Pick from our magical themes or create a custom experience</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Book Your Date</h3>
              <p className="text-gray-600">Fill out our simple form and we'll handle all the planning</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Celebrate & Enjoy</h3>
              <p className="text-gray-600">Show up and watch your child's face light up with pure joy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <ReviewsSection showFeatured={true} limit={3} />

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Magic?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your child's dream party is just one click away. Let's make their special day extraordinary!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/party-booking">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all">
                Book Your Magic Party Now 🎉
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-4 rounded-full">
              Call Us: (555) 123-PARTY
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}