import { useState } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gem, Users, Sparkles, Check, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import goldBraceletsImg from "@assets/generated_images/Gold_permanent_jewelry_bracelets_2cb3619d.png";
import silverCollectionImg from "@assets/generated_images/Silver_permanent_jewelry_collection_77685982.png";
import weldingProcessImg from "@assets/generated_images/Permanent_jewelry_welding_process_3aa3b2b7.png";
import partyExperienceImg from "@assets/generated_images/Permanent_jewelry_party_experience_31a850db.png";

export default function PermanentJewelry() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    desiredDate: "",
    desiredTime: "",
    groupSize: "",
    location: "",
    jewelryType: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Connect to backend API for inquiry submissions
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast({
        title: "Inquiry Received!",
        description: "We'll contact you within 24 hours to discuss your permanent jewelry experience.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        desiredDate: "",
        desiredTime: "",
        groupSize: "",
        location: "",
        jewelryType: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Permanent Jewelry
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Create lasting memories with our permanent jewelry service. We custom weld beautiful 
            chains that become a part of you - symbolizing unbreakable bonds and special moments.
          </p>
        </div>

        {/* Trust Bar - Full Width */}
        <div 
          className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-16 overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #B9C9D4 0%, #B9C9D4 20%, #F5F1ED 40%, #F0F0F0 60%, #B9C9D4 80%, #B9C9D4 100%)'
          }}
        >
          <div className="relative py-20 px-4 sm:px-6 lg:px-8">
            {/* Graphic Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <MapPin className="w-96 h-96 text-gray-800 animate-pulse" />
            </div>
            
            {/* Overlay Text */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 drop-shadow-sm">
                Trusted from Manhattan to Montauk
              </h2>
              <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto">
                We bring timeless sparkle anywhere you are.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Bullets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
            <Check className="w-8 h-8 text-[#B9C9D4] mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Fully insured artists</h3>
            <p className="text-sm text-gray-600 text-center">Professional service you can trust</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
            <Check className="w-8 h-8 text-[#B9C9D4] mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Sterling, gold-filled, and solid gold options</h3>
            <p className="text-sm text-gray-600 text-center">Premium materials for lasting beauty</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
            <Check className="w-8 h-8 text-[#B9C9D4] mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Professional, sanitary equipment</h3>
            <p className="text-sm text-gray-600 text-center">Clean and safe welding process</p>
          </div>
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-gray-200 bg-white">
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
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Jewelry Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jewelryTypes.map((type, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-gray-200 bg-white overflow-hidden">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={type.image} 
                      alt={type.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg text-gray-800">{type.name}</CardTitle>
                  <div className="text-lg font-semibold text-amber-600">{type.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Request an Appointment
              </h2>
              <p className="text-gray-600">
                Fill out the form below and we'll contact you to discuss your permanent jewelry experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="groupSize">Group Size *</Label>
                  <Input
                    id="groupSize"
                    type="number"
                    min="1"
                    value={formData.groupSize}
                    onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                    required
                    data-testid="input-group-size"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="desiredDate">Desired Date *</Label>
                  <Input
                    id="desiredDate"
                    type="date"
                    value={formData.desiredDate}
                    onChange={(e) => setFormData({ ...formData, desiredDate: e.target.value })}
                    required
                    data-testid="input-desired-date"
                  />
                </div>
                <div>
                  <Label htmlFor="desiredTime">Desired Time *</Label>
                  <Input
                    id="desiredTime"
                    type="time"
                    value={formData.desiredTime}
                    onChange={(e) => setFormData({ ...formData, desiredTime: e.target.value })}
                    required
                    data-testid="input-desired-time"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                    required
                  >
                    <SelectTrigger id="location" data-testid="select-location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="host-hampton">Host Hampton</SelectItem>
                      <SelectItem value="on-site-mobile">On-site Mobile</SelectItem>
                      <SelectItem value="private-home">Private Home</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jewelryType">Type of Jewelry *</Label>
                  <Select
                    value={formData.jewelryType}
                    onValueChange={(value) => setFormData({ ...formData, jewelryType: value })}
                    required
                  >
                    <SelectTrigger id="jewelryType" data-testid="select-jewelry-type">
                      <SelectValue placeholder="Select jewelry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bracelet">Bracelet</SelectItem>
                      <SelectItem value="necklace">Necklace</SelectItem>
                      <SelectItem value="anklet">Anklet</SelectItem>
                      <SelectItem value="ring">Ring</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message / Special Requests</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  placeholder="Tell us about your event or any special requests..."
                  data-testid="textarea-message"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg py-6"
                disabled={isSubmitting}
                data-testid="button-submit-inquiry"
              >
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
