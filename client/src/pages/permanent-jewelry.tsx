import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, Users, Clock, Star, Heart, Sparkles } from "lucide-react";
import { Link } from "wouter";
import goldBraceletsImg from "@assets/generated_images/Gold_permanent_jewelry_bracelets_2cb3619d.png";
import silverCollectionImg from "@assets/generated_images/Silver_permanent_jewelry_collection_77685982.png";
import weldingProcessImg from "@assets/generated_images/Permanent_jewelry_welding_process_3aa3b2b7.png";
import partyExperienceImg from "@assets/generated_images/Permanent_jewelry_party_experience_31a850db.png";

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
      image: goldBraceletsImg,
      alt: "Gold permanent jewelry bracelets"
    },
    {
      name: "Anklets", 
      price: "Starting at $70",
      description: "Elegant ankle jewelry for that perfect touch",
      image: silverCollectionImg,
      alt: "Silver permanent jewelry collection"
    },
    {
      name: "Necklaces",
      price: "Starting at $85",
      description: "Custom length chains that never come off",
      image: weldingProcessImg,
      alt: "Permanent jewelry welding process"
    },
    {
      name: "Ring Stacks",
      price: "Starting at $45",
      description: "Connected rings for a unique look",
      image: partyExperienceImg,
      alt: "Permanent jewelry party experience"
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
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
            <img 
              src={goldBraceletsImg} 
              alt="Permanent Jewelry" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent mb-4">
            Permanent Jewelry
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Create lasting memories with our permanent jewelry service. We custom weld beautiful 
            chains that become a part of you - symbolizing unbreakable bonds and special moments.
          </p>
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent mb-8">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-amber-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="text-amber-600 flex justify-center mb-4">{service.icon}</div>
                  <CardTitle className="text-xl text-gray-800">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center justify-center">
                        <Gem className="w-3 h-3 text-amber-500 mr-2" />
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
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-8">
            Jewelry Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jewelryTypes.map((type, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-gray-200 bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={type.image} 
                      alt={type.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg text-gray-800">{type.name}</CardTitle>
                  <div className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">{type.price}</div>
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
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-8">
            Booking Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative border-gray-200 bg-white/90 backdrop-blur-sm ${pkg.popular ? 'ring-2 ring-amber-400 shadow-xl' : 'hover:shadow-lg'} transition-all duration-300`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-gray-800">{pkg.name}</CardTitle>
                  <CardDescription className="text-gray-600">{pkg.description}</CardDescription>
                  <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent mt-4">{pkg.price}</div>
                  <div className="text-sm text-gray-500">{pkg.duration}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <Gem className="w-3 h-3 text-amber-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/book-event">
                    <Button className="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md">
                      Book Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-white via-amber-50 to-white rounded-xl shadow-xl p-8 text-center border border-amber-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
            <img 
              src={partyExperienceImg} 
              alt="Permanent jewelry experience" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent mb-4">
            Ready for Your Forever Jewelry?
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Book your permanent jewelry experience today. Perfect for celebrating milestones, 
            friendships, love, or just treating yourself to something special that lasts forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-event">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md">
                Schedule Appointment
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-amber-300 text-amber-700 hover:bg-amber-50">
              View Portfolio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}