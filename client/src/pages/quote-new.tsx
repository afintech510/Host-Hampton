import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  MapPin,
  Clock,
  Palette,
  Gift,
  Star,
  Crown,
} from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuoteFormData {
  // Service type
  serviceType: string;

  // Contact Information
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  consent?: boolean;

  // Kids Party specific
  partyTheme?: string;
  customTheme?: string;
  partyPackage?: string;
  partyAddons?: string[];
  partyDate?: string;
  childName?: string;
  childAge?: string;
  attendeeCount?: string;
  foodOptions?: string[];
  cupcakeOptions?: string;
  specialNeeds?: string;

  // Studio Rental specific
  studioSubType?: string;
  customStudioType?: string;
  studioDescription?: string;
  studioAttendeeCount?: string;
  studioGroupType?: string;
  studioDate?: string;
  studioTime?: string;
  studioEndTime?: string;
  studioTimeNotes?: string;
  studioDateFlexible?: boolean;

  // Trucker Hat Bar specific
  truckerAttendeeCount?: string;
  truckerAgeRange?: string;
  truckerColorTheme?: string;
  truckerPatchTheme?: string;
  truckerDate?: string;
  truckerTime?: string;
  truckerLocation?: string;
  truckerMobileLocation?: string;
  truckerDateFlexible?: boolean;

  // Workshop/Class specific
  workshopFormat?: string;
  workshopType?: string;
  workshopAttendeeCount?: string;
  workshopDate?: string;
  workshopTime?: string;
  workshopNotes?: string;

  // Permanent Jewelry specific
  jewelryPieces?: string[];
  jewelryAttendeeCount?: string;
  jewelryDate?: string;
  jewelryTime?: string;
}

const PARTY_THEMES = [
  "Princess",
  "Superhero",
  "Unicorn",
  "Dinosaur",
  "Space",
  "Pirate",
  "Mermaid",
  "Football",
  "Basketball",
  "Soccer",
  "Art & Craft",
  "Science",
  "Cooking",
  "Dance",
  "Music",
  "Custom",
];

const PARTY_ADDONS = [
  "Goodie Bags",
  "Balloon Tower",
  "Photo Booth",
  "Extra Activity",
  "Fancy Desserts",
  "Face Painting",
  "Glitter Tattoos",
  "Hair Tinsel",
];

const FOOD_OPTIONS = [
  "Pizza Party Package",
  "Sandwich Platters",
  "Fruit & Veggie Tray",
  "Juice Boxes",
  "Water Bottles",
  "Special Dietary Options",
];

const JEWELRY_PIECES = ["Bracelet", "Anklet", "Necklace", "Ring", "Earrings"];

export default function Quote() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>({ serviceType: "" });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const updateFormData = (updates: Partial<QuoteFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setLocation("/themed-parties");
  };

  const getTotalSteps = () => {
    switch (formData.serviceType) {
      case "kids-party":
        return 7; // service -> theme -> package -> addons -> date/child -> food -> contact
      case "studio-rental":
        return 5; // service -> subtype -> group -> datetime -> contact
      case "trucker-hat":
        return 6; // service -> count/age -> color/patch -> datetime -> location -> contact
      case "workshop":
        return 4; // service -> format/type -> attendees/schedule -> contact
      case "jewelry":
        return 4; // service -> pieces/count -> datetime -> contact
      case "general":
        return 2; // service -> contact
      default:
        return 2;
    }
  };

  // Quote submission mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: QuoteFormData) => {
      const response = await apiRequest("POST", "/api/quotes", quoteData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Quote Request Submitted!",
        description: "We'll email you a custom quote within 24 hours.",
      });
      setTimeout(() => {
        setLocation("/themed-parties");
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuote = () => {
    submitQuoteMutation.mutate(formData);
  };

  const renderServiceSelection = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          What service are you interested in?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: "kids-party",
              title: "Kids Themed Party",
              icon: Gift,
              desc: "Birthday parties with themes, activities & more",
            },
            {
              id: "studio-rental",
              title: "Studio Rental",
              icon: MapPin,
              desc: "Private space for your event or photoshoot",
            },
            {
              id: "trucker-hat",
              title: "Trucker Hat Bar",
              icon: Crown,
              desc: "Custom trucker hat making experience",
            },
            {
              id: "workshop",
              title: "Workshop / Class",
              icon: Star,
              desc: "Educational and creative workshops",
            },
            {
              id: "jewelry",
              title: "Permanent Jewelry",
              icon: Palette,
              desc: "Custom permanent jewelry appointments",
            },
            {
              id: "general",
              title: "General Inquiry",
              icon: Users,
              desc: "Other questions or custom requests",
            },
          ].map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all border-2 hover:border-purple-300 ${
                    formData.serviceType === service.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => updateFormData({ serviceType: service.id })}
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-semibold text-lg mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600">{service.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-end pt-6">
          <Button
            onClick={handleNext}
            disabled={!formData.serviceType}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContactStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <p className="text-gray-600">
          We'll use this information to send you a custom quote
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName || ""}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName || ""}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="Enter email address"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div>
          <Label htmlFor="message">Questions or Special Requests</Label>
          <Textarea
            id="message"
            value={formData.message || ""}
            onChange={(e) => updateFormData({ message: e.target.value })}
            placeholder="Tell us about any special requirements or questions..."
            rows={4}
          />
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="consent"
            checked={formData.consent || false}
            onCheckedChange={(checked) =>
              updateFormData({ consent: checked as boolean })
            }
            required
          />
          <Label htmlFor="consent" className="text-sm leading-relaxed">
            I consent to Host Hampton contacting me via email, phone, or text
            regarding this booking and future events. This helps us provide you
            with updates about your event and information about our services. *
          </Label>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button
            onClick={handleSubmitQuote}
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.phone ||
              !formData.consent ||
              submitQuoteMutation.isPending
            }
            className="bg-purple-600 hover:bg-purple-700"
          >
            {submitQuoteMutation.isPending
              ? "Submitting..."
              : "Submit Quote Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderKidsPartyFlow = () => {
    const step = currentStep - 1; // Adjust for service selection step

    switch (step) {
      case 1: // Theme Selection
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Select Party Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.partyTheme}
                onValueChange={(value) => updateFormData({ partyTheme: value })}
              >
                <div className="grid grid-cols-2 gap-3">
                  {PARTY_THEMES.map((theme) => (
                    <div key={theme} className="flex items-center space-x-2">
                      <RadioGroupItem value={theme} id={theme} />
                      <Label htmlFor={theme}>{theme}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {formData.partyTheme === "Custom" && (
                <div>
                  <Label htmlFor="customTheme">Custom Theme Description</Label>
                  <Input
                    id="customTheme"
                    value={formData.customTheme || ""}
                    onChange={(e) =>
                      updateFormData({ customTheme: e.target.value })
                    }
                    placeholder="Describe your custom theme..."
                  />
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    !formData.partyTheme ||
                    (formData.partyTheme === "Custom" && !formData.customTheme)
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Package Selection
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Choose Your Party Package</CardTitle>
              <p className="text-gray-600">
                Base package starts at $875 for 11 attendees (including birthday
                child)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.partyPackage}
                onValueChange={(value) =>
                  updateFormData({ partyPackage: value })
                }
              >
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="base" id="base" />
                      <Label htmlFor="base" className="text-lg font-semibold">
                        Base Package
                      </Label>
                    </div>
                    <p className="text-gray-600 ml-6">
                      Essential party experience with theme activities and
                      supplies
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem
                        value="make-it-shine"
                        id="make-it-shine"
                      />
                      <Label
                        htmlFor="make-it-shine"
                        className="text-lg font-semibold"
                      >
                        Make it Shine
                      </Label>
                      <span className="text-purple-600 font-medium">
                        +$25 per attendee
                      </span>
                    </div>
                    <p className="text-gray-600 ml-6">
                      Enhanced experience with premium add-ons and decorations
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="party-envy" id="party-envy" />
                      <Label
                        htmlFor="party-envy"
                        className="text-lg font-semibold"
                      >
                        Party Envy
                      </Label>
                      <span className="text-purple-600 font-medium">
                        +$50 per attendee
                      </span>
                    </div>
                    <p className="text-gray-600 ml-6">
                      Ultimate party experience with all premium features and
                      extras
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!formData.partyPackage}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3: // Add-ons Selection
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Select Party Add-ons</CardTitle>
              <p className="text-gray-600">
                Choose additional services to enhance your party
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {PARTY_ADDONS.map((addon) => (
                  <div key={addon} className="flex items-center space-x-2">
                    <Checkbox
                      id={addon}
                      checked={formData.partyAddons?.includes(addon) || false}
                      onCheckedChange={(checked) => {
                        const currentAddons = formData.partyAddons || [];
                        if (checked) {
                          updateFormData({
                            partyAddons: [...currentAddons, addon],
                          });
                        } else {
                          updateFormData({
                            partyAddons: currentAddons.filter(
                              (a) => a !== addon,
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={addon}>{addon}</Label>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4: // Date and Child Details
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Party Date & Child Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="partyDate">Preferred Party Date</Label>
                <Input
                  id="partyDate"
                  type="date"
                  value={formData.partyDate || ""}
                  onChange={(e) =>
                    updateFormData({ partyDate: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childName">Birthday Child's Name</Label>
                  <Input
                    id="childName"
                    value={formData.childName || ""}
                    onChange={(e) =>
                      updateFormData({ childName: e.target.value })
                    }
                    placeholder="Enter child's name"
                  />
                </div>
                <div>
                  <Label htmlFor="childAge">Child's Age</Label>
                  <Input
                    id="childAge"
                    type="number"
                    min="1"
                    max="18"
                    value={formData.childAge || ""}
                    onChange={(e) =>
                      updateFormData({ childAge: e.target.value })
                    }
                    placeholder="Age"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="attendeeCount">
                  Number of Attendees (including birthday child)
                </Label>
                <Input
                  id="attendeeCount"
                  type="number"
                  min="1"
                  value={formData.attendeeCount || ""}
                  onChange={(e) =>
                    updateFormData({ attendeeCount: e.target.value })
                  }
                  placeholder="Enter total number of attendees"
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 5: // Food Options
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Food & Cupcake Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Food Options</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {FOOD_OPTIONS.map((food) => (
                    <div key={food} className="flex items-center space-x-2">
                      <Checkbox
                        id={food}
                        checked={formData.foodOptions?.includes(food) || false}
                        onCheckedChange={(checked) => {
                          const currentFood = formData.foodOptions || [];
                          if (checked) {
                            updateFormData({
                              foodOptions: [...currentFood, food],
                            });
                          } else {
                            updateFormData({
                              foodOptions: currentFood.filter(
                                (f) => f !== food,
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={food}>{food}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="cupcakeOptions">Cupcake Preferences</Label>
                <Select
                  value={formData.cupcakeOptions}
                  onValueChange={(value) =>
                    updateFormData({ cupcakeOptions: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cupcake option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="host-hampton-cupcakes">
                      Host Hampton Custom Cupcakes
                    </SelectItem>
                    <SelectItem value="bring-own">
                      I'll bring my own cupcakes
                    </SelectItem>
                    <SelectItem value="no-cupcakes">
                      No cupcakes needed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialNeeds">
                  Special Dietary Needs or Allergies
                </Label>
                <Textarea
                  id="specialNeeds"
                  value={formData.specialNeeds || ""}
                  onChange={(e) =>
                    updateFormData({ specialNeeds: e.target.value })
                  }
                  placeholder="Please note any allergies or dietary restrictions..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return renderContactStep();
    }
  };

  const renderStudioRentalFlow = () => {
    const step = currentStep - 1;

    switch (step) {
      case 1: // Studio Sub-type Selection
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>What type of studio rental?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.studioSubType}
                onValueChange={(value) =>
                  updateFormData({ studioSubType: value })
                }
              >
                <div className="space-y-3">
                  {[
                    { value: "diy-party", label: "DIY Party" },
                    { value: "private-event", label: "Private Event" },
                    { value: "host-my-client", label: "Host My Client" },
                    { value: "photography", label: "Photography Shoot" },
                    { value: "meeting", label: "Meeting" },
                    { value: "other", label: "Other (please specify)" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {formData.studioSubType === "other" && (
                <div>
                  <Label htmlFor="customStudioType">Please specify</Label>
                  <Input
                    id="customStudioType"
                    value={formData.customStudioType || ""}
                    onChange={(e) =>
                      updateFormData({ customStudioType: e.target.value })
                    }
                    placeholder="Describe your rental purpose..."
                  />
                </div>
              )}

              <div>
                <Label htmlFor="studioDescription">Additional Details</Label>
                <Textarea
                  id="studioDescription"
                  value={formData.studioDescription || ""}
                  onChange={(e) =>
                    updateFormData({ studioDescription: e.target.value })
                  }
                  placeholder="Describe what you plan to do in the studio..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    !formData.studioSubType ||
                    (formData.studioSubType === "other" &&
                      !formData.customStudioType)
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Group Details
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Group Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studioAttendeeCount">How many people?</Label>
                <Input
                  id="studioAttendeeCount"
                  type="number"
                  min="1"
                  value={formData.studioAttendeeCount || ""}
                  onChange={(e) =>
                    updateFormData({ studioAttendeeCount: e.target.value })
                  }
                  placeholder="Number of people"
                />
              </div>

              <div>
                <Label>Group Type</Label>
                <RadioGroup
                  value={formData.studioGroupType}
                  onValueChange={(value) =>
                    updateFormData({ studioGroupType: value })
                  }
                >
                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adults" id="adults" />
                      <Label htmlFor="adults">Adults Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="children" id="children" />
                      <Label htmlFor="children">Children Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Mixed Ages</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3: // Date & Time
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Date & Time Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="studioDateFlexible"
                  checked={formData.studioDateFlexible || false}
                  onCheckedChange={(checked) =>
                    updateFormData({ studioDateFlexible: checked as boolean })
                  }
                />
                <Label htmlFor="studioDateFlexible">
                  Not sure yet / Flexible with dates
                </Label>
              </div>

              {!formData.studioDateFlexible && (
                <>
                  <div>
                    <Label htmlFor="studioDate">Preferred Date</Label>
                    <Input
                      id="studioDate"
                      type="date"
                      value={formData.studioDate || ""}
                      onChange={(e) =>
                        updateFormData({ studioDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studioTime">Start Time</Label>
                      <Input
                        id="studioTime"
                        type="time"
                        value={formData.studioTime || ""}
                        onChange={(e) =>
                          updateFormData({ studioTime: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="studioEndTime">End Time</Label>
                      <Input
                        id="studioEndTime"
                        type="time"
                        value={formData.studioEndTime || ""}
                        onChange={(e) =>
                          updateFormData({ studioEndTime: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="studioTimeNotes">Time Notes</Label>
                <Textarea
                  id="studioTimeNotes"
                  value={formData.studioTimeNotes || ""}
                  onChange={(e) =>
                    updateFormData({ studioTimeNotes: e.target.value })
                  }
                  placeholder="Any specific timing requirements or preferences..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return renderContactStep();
    }
  };

  const renderTruckerHatFlow = () => {
    const step = currentStep - 1;

    switch (step) {
      case 1: // Attendee Count & Age Range
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Trucker Hat Bar Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="truckerAttendeeCount">
                  How many people will be making hats?
                </Label>
                <Input
                  id="truckerAttendeeCount"
                  type="number"
                  min="1"
                  value={formData.truckerAttendeeCount || ""}
                  onChange={(e) =>
                    updateFormData({ truckerAttendeeCount: e.target.value })
                  }
                  placeholder="Number of participants"
                />
              </div>

              <div>
                <Label>Age Range</Label>
                <RadioGroup
                  value={formData.truckerAgeRange}
                  onValueChange={(value) =>
                    updateFormData({ truckerAgeRange: value })
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="kids" id="kids" />
                      <Label htmlFor="kids">Kids (under 13)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teens" id="teens" />
                      <Label htmlFor="teens">Teens (13-17)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adults" id="adults" />
                      <Label htmlFor="adults">Adults</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Mixed Ages</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    !formData.truckerAttendeeCount || !formData.truckerAgeRange
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Color & Patch Theme
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Customize Your Trucker Hats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="truckerColorTheme">
                  Color Theme / Preferences
                </Label>
                <Input
                  id="truckerColorTheme"
                  value={formData.truckerColorTheme || ""}
                  onChange={(e) =>
                    updateFormData({ truckerColorTheme: e.target.value })
                  }
                  placeholder="e.g., Pink & Gold, Team Colors, Rainbow, etc."
                />
              </div>

              <div>
                <Label htmlFor="truckerPatchTheme">
                  Patch Theme / Design Ideas
                </Label>
                <Textarea
                  id="truckerPatchTheme"
                  value={formData.truckerPatchTheme || ""}
                  onChange={(e) =>
                    updateFormData({ truckerPatchTheme: e.target.value })
                  }
                  placeholder="Describe patch designs, themes, or text you'd like (e.g., birthday girl's name, team logo, fun sayings)"
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3: // Date & Time
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="truckerDateFlexible"
                  checked={formData.truckerDateFlexible || false}
                  onCheckedChange={(checked) =>
                    updateFormData({ truckerDateFlexible: checked as boolean })
                  }
                />
                <Label htmlFor="truckerDateFlexible">
                  Not sure yet / Flexible with dates
                </Label>
              </div>

              {!formData.truckerDateFlexible && (
                <>
                  <div>
                    <Label htmlFor="truckerDate">Preferred Date</Label>
                    <Input
                      id="truckerDate"
                      type="date"
                      value={formData.truckerDate || ""}
                      onChange={(e) =>
                        updateFormData({ truckerDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="truckerTime">Preferred Time</Label>
                    <Input
                      id="truckerTime"
                      type="time"
                      value={formData.truckerTime || ""}
                      onChange={(e) =>
                        updateFormData({ truckerTime: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4: // Location
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Location Preference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.truckerLocation}
                onValueChange={(value) =>
                  updateFormData({ truckerLocation: value })
                }
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="host-hampton" id="host-hampton" />
                    <Label htmlFor="host-hampton">At Host Hampton</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile">
                      Mobile Service (We come to you)
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {formData.truckerLocation === "mobile" && (
                <div>
                  <Label htmlFor="truckerMobileLocation">Event Location</Label>
                  <Input
                    id="truckerMobileLocation"
                    value={formData.truckerMobileLocation || ""}
                    onChange={(e) =>
                      updateFormData({ truckerMobileLocation: e.target.value })
                    }
                    placeholder="Enter your event address or venue"
                  />
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    !formData.truckerLocation ||
                    (formData.truckerLocation === "mobile" &&
                      !formData.truckerMobileLocation)
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return renderContactStep();
    }
  };

  const renderWorkshopFlow = () => {
    const step = currentStep - 1;

    switch (step) {
      case 1: // Workshop Format & Type
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Workshop Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Workshop Format</Label>
                <RadioGroup
                  value={formData.workshopFormat}
                  onValueChange={(value) =>
                    updateFormData({ workshopFormat: value })
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-person" id="in-person" />
                      <Label htmlFor="in-person">
                        In-Person at Host Hampton
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile" id="mobile-workshop" />
                      <Label htmlFor="mobile-workshop">
                        Mobile (We come to you)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="virtual" id="virtual" />
                      <Label htmlFor="virtual">Virtual Workshop</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="workshopType">
                  What type of workshop/class?
                </Label>
                <Textarea
                  id="workshopType"
                  value={formData.workshopType || ""}
                  onChange={(e) =>
                    updateFormData({ workshopType: e.target.value })
                  }
                  placeholder="Describe the workshop or class you're interested in (e.g., DIY crafts, painting, jewelry making, team building)"
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!formData.workshopFormat || !formData.workshopType}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Attendees & Schedule
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Attendees & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workshopAttendeeCount">
                  How many attendees?
                </Label>
                <Input
                  id="workshopAttendeeCount"
                  type="number"
                  min="1"
                  value={formData.workshopAttendeeCount || ""}
                  onChange={(e) =>
                    updateFormData({ workshopAttendeeCount: e.target.value })
                  }
                  placeholder="Number of participants"
                />
              </div>

              <div>
                <Label htmlFor="workshopDate">Preferred Date</Label>
                <Input
                  id="workshopDate"
                  type="date"
                  value={formData.workshopDate || ""}
                  onChange={(e) =>
                    updateFormData({ workshopDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="workshopTime">Preferred Time</Label>
                <Input
                  id="workshopTime"
                  type="time"
                  value={formData.workshopTime || ""}
                  onChange={(e) =>
                    updateFormData({ workshopTime: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="workshopNotes">Additional Notes</Label>
                <Textarea
                  id="workshopNotes"
                  value={formData.workshopNotes || ""}
                  onChange={(e) =>
                    updateFormData({ workshopNotes: e.target.value })
                  }
                  placeholder="Any specific requirements, skill levels, or special accommodations needed"
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return renderContactStep();
    }
  };

  const renderJewelryFlow = () => {
    const step = currentStep - 1;

    switch (step) {
      case 1: // Jewelry Pieces & People Count
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Permanent Jewelry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  What jewelry pieces are you interested in?
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {JEWELRY_PIECES.map((piece) => (
                    <div key={piece} className="flex items-center space-x-2">
                      <Checkbox
                        id={piece}
                        checked={
                          formData.jewelryPieces?.includes(piece) || false
                        }
                        onCheckedChange={(checked) => {
                          const currentPieces = formData.jewelryPieces || [];
                          if (checked) {
                            updateFormData({
                              jewelryPieces: [...currentPieces, piece],
                            });
                          } else {
                            updateFormData({
                              jewelryPieces: currentPieces.filter(
                                (p) => p !== piece,
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={piece}>{piece}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="jewelryAttendeeCount">How many people?</Label>
                <Input
                  id="jewelryAttendeeCount"
                  type="number"
                  min="1"
                  value={formData.jewelryAttendeeCount || ""}
                  onChange={(e) =>
                    updateFormData({ jewelryAttendeeCount: e.target.value })
                  }
                  placeholder="Number of people getting jewelry"
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    !formData.jewelryPieces?.length ||
                    !formData.jewelryAttendeeCount
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Date & Time
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Appointment Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jewelryDate">Preferred Date</Label>
                <Input
                  id="jewelryDate"
                  type="date"
                  value={formData.jewelryDate || ""}
                  onChange={(e) =>
                    updateFormData({ jewelryDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="jewelryTime">Preferred Time</Label>
                <Input
                  id="jewelryTime"
                  type="time"
                  value={formData.jewelryTime || ""}
                  onChange={(e) =>
                    updateFormData({ jewelryTime: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return renderContactStep();
    }
  };

  const renderCurrentStep = () => {
    if (currentStep === 1) {
      return renderServiceSelection();
    }

    // Final step is always contact information
    const totalSteps = getTotalSteps();
    if (currentStep === totalSteps) {
      return renderContactStep();
    }

    switch (formData.serviceType) {
      case "kids-party":
        return renderKidsPartyFlow();
      case "studio-rental":
        return renderStudioRentalFlow();
      case "trucker-hat":
        return renderTruckerHatFlow();
      case "workshop":
        return renderWorkshopFlow();
      case "jewelry":
        return renderJewelryFlow();
      case "general":
        return renderContactStep();
      default:
        return renderContactStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Your Quote
          </h1>
          <p className="text-gray-600">
            Tell us about your event and we'll create a custom quote for you
          </p>
        </div>

        {/* Progress Bar */}
        {formData.serviceType && (
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Step {currentStep} of {getTotalSteps()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        {/* Close Button */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-gray-500"
          >
            Close and return to main site
          </Button>
        </div>
      </div>
    </div>
  );
}
