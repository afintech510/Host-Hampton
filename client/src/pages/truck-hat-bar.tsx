import { useState } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Truck, Calendar, Users, MapPin, Star, Clock, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import longIslandHeroBg from "@assets/long-island-dusty-blue-mobile-hero-bg_1761886362376.webp";

export default function TruckHatBar() {
  const { toast } = useToast();
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    desiredDate: "",
    groupSize: "",
    location: "",
    message: ""
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

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

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Gallery images - using placeholder URLs
  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop", alt: "Trucker hat collection display" },
    { url: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&h=600&fit=crop", alt: "Custom embroidered trucker hats" },
    { url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=600&fit=crop", alt: "Event setup with hat bar" },
    { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop", alt: "Happy guests at hat bar event" },
    { url: "https://images.unsplash.com/photo-1529720317453-c8da503f2051?w=800&h=600&fit=crop", alt: "Vintage trucker hat styles" },
    { url: "https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800&h=600&fit=crop", alt: "Mobile hat bar truck" },
    { url: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&h=600&fit=crop", alt: "Hat customization station" },
    { url: "https://images.unsplash.com/photo-1514498873326-e2eba0b43a85?w=800&h=600&fit=crop", alt: "Event mood board inspiration" },
  ];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation for lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);

    try {
      // TODO: Connect to backend API for inquiry submissions
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast({
        title: "Inquiry Received!",
        description: "We'll contact you within 24 hours to discuss your Hat Bar event.",
      });
      
      // Reset form
      setInquiryForm({
        name: "",
        email: "",
        desiredDate: "",
        groupSize: "",
        location: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navigation />
      
      {/* Hero Section with Long Island Background */}
      <div 
        className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${longIslandHeroBg})`,
          backgroundColor: '#F5F1ED'
        }}
      >
        <div className="relative z-10 text-center px-4 py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Trucker Hat Bar
          </h1>
          <p className="text-lg md:text-xl text-gray-900 max-w-2xl mx-auto mb-8">
            The ultimate mobile hat experience — handcraft style, anywhere from Manhattan to Montauk.
          </p>
          <Link href="/book-event">
            <Button 
              size="lg" 
              className="bg-[#5B9BD5] hover:bg-[#4A8AC4] text-white px-8 py-6 text-lg rounded-md shadow-lg"
              data-testid="button-book-your-event"
            >
              Book Your Event
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

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

        {/* Trust Bar - Full Width */}
        <div 
          className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-16 overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #B9C9D4 0%, #B9C9D4 20%, #F5F1ED 40%, #F0F0F0 60%, #B9C9D4 80%, #B9C9D4 100%)'
          }}
        >
          <div className="relative py-20 px-4 sm:px-6 lg:px-8">
            {/* Long Island Graphic - Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <MapPin className="w-96 h-96 text-gray-800 animate-pulse" />
            </div>
            
            {/* Overlay Text */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 drop-shadow-sm">
                Trusted from Manhattan to Montauk
              </h2>
              <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto">
                We bring the party to you — anywhere across Long Island and beyond.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Header Block */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Inspiration & Proof
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Mobile parties from Manhattan to Montauk. Real hats, real smiles, real events.
          </p>
          
          {/* Trust Bullets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Check className="w-8 h-8 text-[#B9C9D4] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Hundreds of happy hosts</h3>
              <p className="text-sm text-gray-600">Trusted by families and businesses across Long Island</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Check className="w-8 h-8 text-[#B9C9D4] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Clean, on-time setup</h3>
              <p className="text-sm text-gray-600">Professional service you can count on</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Check className="w-8 h-8 text-[#B9C9D4] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Fully insured</h3>
              <p className="text-sm text-gray-600">Complete peace of mind for your event</p>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#B9C9D4] focus:ring-offset-2"
                data-testid={`gallery-image-${index}`}
                aria-label={`Open ${image.alt} in lightbox`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent 
            className="max-w-7xl w-full h-full md:h-auto p-0 bg-black/95"
            onKeyDown={handleKeyDown}
          >
            <VisuallyHidden>
              <DialogTitle>Image Gallery Lightbox</DialogTitle>
            </VisuallyHidden>
            
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                data-testid="lightbox-close"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Previous Button */}
              <button
                onClick={prevImage}
                className="absolute left-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                data-testid="lightbox-prev"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              {/* Image */}
              <div className="max-w-5xl max-h-[80vh] flex items-center justify-center">
                <img
                  src={galleryImages[currentImageIndex].url}
                  alt={galleryImages[currentImageIndex].alt}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>

              {/* Next Button */}
              <button
                onClick={nextImage}
                className="absolute right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                data-testid="lightbox-next"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Inquiry Form */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Request Your Hat Bar Event
              </h2>
              <p className="text-gray-600">
                From Manhattan to Montauk — our mobile Hat Bar brings the fun to you.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="inquiry-name">Name *</Label>
                  <Input
                    id="inquiry-name"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    required
                    data-testid="input-inquiry-name"
                  />
                </div>
                <div>
                  <Label htmlFor="inquiry-email">Email *</Label>
                  <Input
                    id="inquiry-email"
                    type="email"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    required
                    data-testid="input-inquiry-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="inquiry-date">Desired Date *</Label>
                  <Input
                    id="inquiry-date"
                    type="date"
                    value={inquiryForm.desiredDate}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, desiredDate: e.target.value })}
                    required
                    data-testid="input-inquiry-date"
                  />
                </div>
                <div>
                  <Label htmlFor="inquiry-group-size">Group Size *</Label>
                  <Input
                    id="inquiry-group-size"
                    type="number"
                    min="1"
                    value={inquiryForm.groupSize}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, groupSize: e.target.value })}
                    required
                    data-testid="input-inquiry-group-size"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="inquiry-location">Location / Venue Name *</Label>
                <Input
                  id="inquiry-location"
                  value={inquiryForm.location}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, location: e.target.value })}
                  placeholder="Where should we bring the Hat Bar?"
                  required
                  data-testid="input-inquiry-location"
                />
              </div>

              <div>
                <Label htmlFor="inquiry-message">Message / Special Requests</Label>
                <Textarea
                  id="inquiry-message"
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  rows={4}
                  placeholder="Tell us about your event..."
                  data-testid="textarea-inquiry-message"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg py-6"
                disabled={isSubmittingInquiry}
                data-testid="button-submit-hat-bar-inquiry"
              >
                {isSubmittingInquiry ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </form>
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