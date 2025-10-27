import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Palette,
  Sparkles,
  DollarSign,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";
import { DIYAddons, type DIYAddon } from "@/components/diy-addons";
import Navigation from "@/components/navigation";

// Helper function to get ordinal suffix
function getOrdinalSuffix(num: number): string {
  if (num >= 11 && num <= 13) return "th";
  switch (num % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Helper function to format pricing
function formatPrice(amount: number): string {
  return `$${amount.toFixed(0)}`;
}

// Package definitions for calculations - 5-Star System
const packageDefinitions = {
  star1: {
    name: "1-Star Package",
    price: 0, // Base pricing is handled separately ($650/$750)
    maxGuests: 10,
    premiumActivities: 1,
    standardActivities: 2, // Can choose 1 premium + 1 standard OR 3 standard
    foodBudget: 0,
    description:
      "Includes birthday child + 10 guests, exclusive studio use, theme decorated, personalized evite, boho table, juice/water, cupcakes, treat cart, pizza or bagels",
    includes: [
      "Exclusive Studio Use",
      "Theme Decorated",
      "Personalized Evite",
      "Boho Table",
      "Honest Juice Boxes & Mini Waters",
      "Cupcakes",
      "Treat Cart",
      "Pizza or Bagels",
      "2 Activities (1 Premium + 1 Standard OR 3 Standard)",
    ],
  },
  star2: {
    name: "2-Star Package",
    price: 350,
    maxGuests: 13,
    premiumActivities: 1,
    standardActivities: 2,
    foodBudget: 0,
    description: "All 1-star plus goody bags and photo booth",
    includes: [
      "All from 1-Star",
      "Goody Bags",
      "Photo Booth",
      "Up to 13 Guests",
    ],
  },
  star3: {
    name: "3-Star Package",
    price: 695,
    maxGuests: 14,
    premiumActivities: 2, // Can upgrade to premium or add standard
    standardActivities: 2,
    foodBudget: 0,
    description:
      "All 2-star plus balloon budget, gift basket, and activity upgrade",
    includes: [
      "All from 2-Star",
      "Upgrade to Premium Activity or Add Standard",
      "Balloon Budget",
      "Gift Basket for Birthday Child",
      "Up to 14 Guests",
    ],
  },
  star4: {
    name: "4-Star Package",
    price: 925,
    maxGuests: 15,
    premiumActivities: 2,
    standardActivities: 2,
    foodBudget: 100,
    description:
      "All 3-star plus premium goody bags, balloon tower, custom balloon stack, and $100 food budget",
    includes: [
      "All from 3-Star",
      "Premium Goody Bags",
      "Balloon Tower",
      "Balloon Custom Stack",
      "$100 Food/Drink/Dessert Budget",
      "Up to 15 Guests",
    ],
  },
  star5: {
    name: "5-Star Package",
    price: 1375,
    maxGuests: 16,
    premiumActivities: 2,
    standardActivities: 2,
    foodBudget: 200,
    description:
      "Ultimate package with all features plus balloon garland, themed treat table, and $200 food budget",
    includes: [
      "All from 4-Star",
      "Balloon Garland",
      "Themed Custom Treat Table",
      "$200 Food/Drink/Dessert Budget",
      "Up to 16 Guests",
    ],
  },
};

interface CustomerBookingProps {
  leadId?: string;
}

export default function CustomerBooking({ leadId }: CustomerBookingProps) {
  const { leadId: urlLeadId } = useParams<{ leadId: string }>();
  const effectiveLeadId = leadId || urlLeadId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedStars, setSelectedStars] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    agreeToCommunications: false,
  });

  // Fetch lead/booking data
  const { data: booking, isLoading } = useQuery({
    queryKey: ["/api/leads", effectiveLeadId],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${effectiveLeadId}`);
      const data = await response.json();
      return data.success ? data.lead : null;
    },
    enabled: !!effectiveLeadId,
  });

  // Fetch all available add-ons for editing
  const { data: allAddons } = useQuery({
    queryKey: ["/api/addons"],
    queryFn: async () => {
      const response = await fetch("/api/addons");
      const data = await response.json();
      return data.success ? data.addons : [];
    },
  });

  // Fetch all themes for editing
  const { data: allThemes } = useQuery({
    queryKey: ["/api/party-themes"],
    queryFn: async () => {
      const response = await fetch("/api/party-themes");
      const data = await response.json();
      return data.success ? data.themes : [];
    },
  });

  // Fetch all packages for editing
  const { data: allPackages } = useQuery({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const response = await fetch("/api/packages");
      const data = await response.json();
      return data.success ? data.packages : [];
    },
  });

  // Update booking mutation - NO QUERY INVALIDATION to prevent re-renders during typing
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest(
        "PATCH",
        `/api/leads/${effectiveLeadId}`,
        updates,
      );
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the cache directly instead of invalidating to prevent re-renders
      queryClient.setQueryData(
        ["/api/leads", effectiveLeadId],
        (oldData: any) => {
          if (oldData) {
            return { ...oldData, ...variables };
          }
          return oldData;
        },
      );
      // Silent update - no toast notifications
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Separate timeout refs for different fields to prevent interference
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout | null>>({});

  // Optimized update with debouncing for all fields to prevent lag
  const handleRealTimeUpdate = (field: string, value: any) => {
    // Update local cache immediately for UI responsiveness
    queryClient.setQueryData(
      ["/api/leads", effectiveLeadId],
      (oldData: any) => {
        if (oldData) {
          return { ...oldData, [field]: value };
        }
        return oldData;
      },
    );

    // Clear existing timeout for this specific field
    if (timeoutRefs.current[field]) {
      clearTimeout(timeoutRefs.current[field]!);
    }

    // Set new timeout for server sync
    timeoutRefs.current[field] = setTimeout(() => {
      updateMutation.mutate({ [field]: value });
      timeoutRefs.current[field] = null;
    }, 500); // 500ms debounce to reduce server calls
  };

  // Debounced update for text inputs with local state update for immediate UI feedback
  const handleTextInputUpdate = (field: string, value: any) => {
    // Update local cache immediately for UI responsiveness
    queryClient.setQueryData(
      ["/api/leads", effectiveLeadId],
      (oldData: any) => {
        if (oldData) {
          return { ...oldData, [field]: value };
        }
        return oldData;
      },
    );

    // Clear existing timeout for this specific field
    if (timeoutRefs.current[field]) {
      clearTimeout(timeoutRefs.current[field]!);
    }

    // Set new timeout for server sync
    timeoutRefs.current[field] = setTimeout(() => {
      updateMutation.mutate({ [field]: value });
      timeoutRefs.current[field] = null;
    }, 500); // 500ms debounce for text inputs
  };

  // Cleanup effect to clear all timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Auto-set location to studio when DIY is selected
  useEffect(() => {
    if (booking?.partyType === "diy" && booking?.eventLocation !== "studio") {
      handleRealTimeUpdate("eventLocation", "studio");
    }
  }, [booking?.partyType]);

  // Stripe deposit payment mutation
  const depositMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/create-deposit-payment", {
        leadId: parseInt(effectiveLeadId!),
        amount: 20000, // $200 deposit
        bookingData,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: "Failed to create deposit payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save as Quote mutation
  const saveQuoteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/leads/${effectiveLeadId}/save-quote`, {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Quote Saved",
          description: `Your quote #${data.quoteNumber} has been saved! Check your email for details.`,
        });
        // Send quote email
        sendQuoteEmailMutation.mutate();
      }
    },
    onError: (error) => {
      toast({
        title: "Save Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send quote email mutation
  const sendQuoteEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/leads/${effectiveLeadId}/send-quote-email`, {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Email Sent",
          description: "Quote details have been sent to your email!",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to send quote email:", error);
      // Don't show error to user as the quote was still saved
    },
  });

  // Calculate pricing
  const calculatePricing = () => {
    if (!booking)
      return { basePrice: 650, packagePrice: 0, addonsTotal: 0, total: 650 };

    // Check if DIY (Studio Rental) or Full Service
    const isDIY = booking.partyType === "diy";
    let basePrice = 0;

    if (!isDIY) {
      // Full Service - Use package base_price from database
      // Get star level from package selection
      const packageKey =
        booking.packageSelection?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
      let starLevel = 1; // Default
      if (packageKey.includes("1star") || packageKey.includes("star1"))
        starLevel = 1;
      else if (packageKey.includes("2star") || packageKey.includes("star2"))
        starLevel = 2;
      else if (packageKey.includes("3star") || packageKey.includes("star3"))
        starLevel = 3;
      else if (packageKey.includes("4star") || packageKey.includes("star4"))
        starLevel = 4;
      else if (packageKey.includes("5star") || packageKey.includes("star5"))
        starLevel = 5;

      // Find the package from the database
      const selectedPackage = allPackages?.find((pkg: any) => {
        const pkgName = pkg.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          pkgName.includes(`${starLevel}star`) ||
          pkgName.includes(`star${starLevel}`)
        );
      });

      // Use base_price from database or fallback
      basePrice = selectedPackage?.basePrice || 0;

      // Add theme markup if applicable
      if (booking.partyTheme && booking.partyTheme !== "no-thanks") {
        const selectedThemeData = allThemes?.find(
          (t: any) => t.name === booking.partyTheme,
        );
        const themeMarkup = selectedThemeData?.price || 0;
        basePrice += themeMarkup;
      }

      // Add per-guest pricing for additional guests
      const guestCount = booking.guestCount || 0;
      const maxGuests = selectedPackage?.maxGuests || 10;
      const additionalGuests = Math.max(0, guestCount - maxGuests);

      if (additionalGuests > 0) {
        // Per-guest pricing based on star level
        let perGuestPrice = 35; // Default for 1-2 star
        if (starLevel === 1 || starLevel === 2) {
          perGuestPrice = 35;
        } else if (starLevel === 3 || starLevel === 4) {
          perGuestPrice = 45;
        } else if (starLevel === 5) {
          perGuestPrice = 50;
        }
        basePrice += additionalGuests * perGuestPrice;
      }
    } else {
      // DIY (Studio Rental) - charge based on rental duration and day of week
      const duration = booking.rentalDuration || "3";
      const eventDate = booking.eventDate;

      // Determine if weekend (Fri, Sat, Sun)
      let isWeekend = false;
      if (eventDate) {
        const date = new Date(eventDate);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
        isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      }

      const weekendPrices: Record<string, number> = {
        "3": 500,
        "4": 600,
        "5": 700,
        "all-day": 800,
      };

      const weekdayPrices: Record<string, number> = {
        "3": 400,
        "4": 475,
        "5": 550,
        "all-day": 625,
      };

      const prices = isWeekend ? weekendPrices : weekdayPrices;
      basePrice =
        prices[duration as keyof typeof prices] || (isWeekend ? 500 : 400);
    }

    // Calculate add-ons total from new structure
    let addonsTotal = 0;

    // Food add-ons
    const foodPrices = {
      "Fruit Tray": 45,
      "Tray of Chicken Fingers": 65,
      "Tray of French Fries": 35,
      "Regular Pizza (Adults)": 28,
      "Specialty Pizza": 35,
      "Popcorn Bar": 75,
      "Charcuterie Board": 75,
    };
    if (booking.selectedFoodAddons) {
      Object.entries(booking.selectedFoodAddons).forEach(([name, quantity]) => {
        const qty = Number(quantity);
        if (qty > 0 && foodPrices[name as keyof typeof foodPrices]) {
          addonsTotal += foodPrices[name as keyof typeof foodPrices] * qty;
        }
      });
    }

    // Sweet add-ons
    const sweetPrices = {
      Macarons: 24,
      "Chocolate Covered Pretzels": 18,
      "Chocolate Covered Rice Krispies": 20,
      "Decorated Sugar Cookies": 30,
      "Candy Wall": 200,
      "Custom Treat Table": 150,
    };
    if (booking.selectedSweetAddons) {
      Object.entries(booking.selectedSweetAddons).forEach(
        ([name, quantity]) => {
          const qty = Number(quantity);
          if (qty > 0 && sweetPrices[name as keyof typeof sweetPrices]) {
            addonsTotal += sweetPrices[name as keyof typeof sweetPrices] * qty;
          }
        },
      );
    }

    // Drink add-ons
    const drinkPrices = {
      "Soda & Seltzers Package": 75,
      "Bubbles Drink Package": 75, // Legacy support
      "Coffee Bar": 75,
    };
    if (booking.selectedDrinkAddons) {
      Object.entries(booking.selectedDrinkAddons).forEach(
        ([name, quantity]) => {
          const qty = Number(quantity);
          if (qty > 0 && drinkPrices[name as keyof typeof drinkPrices]) {
            addonsTotal += drinkPrices[name as keyof typeof drinkPrices] * qty;
          }
        },
      );
    }

    // Party Extras add-ons
    const partyExtrasPrices = {
      "Goodie Bags": 8,
      "Premium Goodie Bags": 15,
      "Balloon Tower": 95,
      "Balloon Garland 6ft": 95,
      "Balloon Arch": 195,
      "Marquee Number": 50,
      "Curated Birthday Gift": 25,
    };
    if (booking.selectedPartyExtras) {
      Object.entries(booking.selectedPartyExtras).forEach(
        ([name, quantity]) => {
          const qty = Number(quantity);
          if (
            qty > 0 &&
            partyExtrasPrices[name as keyof typeof partyExtrasPrices]
          ) {
            addonsTotal +=
              partyExtrasPrices[name as keyof typeof partyExtrasPrices] * qty;
          }
        },
      );
    }

    // Legacy selectedAddons - DISABLED to prevent massive pricing issues
    // The new system uses selectedFoodAddons, selectedSweetAddons, selectedDrinkAddons instead

    // DIY Add-ons (separate from full-service)
    if (isDIY) {
      // DIY Food add-ons
      if (booking.selectedDIYFood && Array.isArray(booking.selectedDIYFood)) {
        booking.selectedDIYFood.forEach((addon: DIYAddon) => {
          addonsTotal += addon.price;
        });
      }

      // DIY Drink add-ons
      if (
        booking.selectedDIYDrinks &&
        Array.isArray(booking.selectedDIYDrinks)
      ) {
        booking.selectedDIYDrinks.forEach((addon: DIYAddon) => {
          addonsTotal += addon.price;
        });
      }

      // DIY Extra add-ons
      if (
        booking.selectedDIYExtras &&
        Array.isArray(booking.selectedDIYExtras)
      ) {
        booking.selectedDIYExtras.forEach((addon: DIYAddon) => {
          addonsTotal += addon.price;
        });
      }

      // DIY Goodie Bags
      if (booking.diyGoodieBagQty) {
        addonsTotal += booking.diyGoodieBagQty * 8;
      }

      // DIY Premium Goodie Bags
      if (booking.diyPremiumGoodieBagQty) {
        addonsTotal += booking.diyPremiumGoodieBagQty * 15;
      }

      // DIY Birthday Gift Basket
      if (booking.diyBirthdayGiftBasket) {
        addonsTotal += 25;
      }
    }

    const total = basePrice + addonsTotal;

    return {
      basePrice: basePrice,
      packagePrice: 0,
      addonsTotal,
      total,
    };
  };

  const pricing = calculatePricing();
  const depositAmount = 200;

  useEffect(() => {
    if (booking) {
      // Initialize selected theme state
      if (booking.partyTheme) {
        setSelectedTheme(booking.partyTheme);
      }

      // Initialize star rating based on package
      const packageKey =
        booking.packageSelection?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
      if (packageKey.includes("1star") || packageKey.includes("star1"))
        setSelectedStars(1);
      else if (packageKey.includes("2star") || packageKey.includes("star2"))
        setSelectedStars(2);
      else if (packageKey.includes("3star") || packageKey.includes("star3"))
        setSelectedStars(3);
      else if (packageKey.includes("4star") || packageKey.includes("star4"))
        setSelectedStars(4);
      else if (packageKey.includes("5star") || packageKey.includes("star5"))
        setSelectedStars(5);
      else setSelectedStars(1); // Default to 1-star

      setContactData({
        firstName: booking.firstName || booking.name?.split(" ")[0] || "",
        lastName:
          booking.lastName || booking.name?.split(" ").slice(1).join(" ") || "",
        phone: booking.phone || "",
        email: booking.email || "",
        agreeToCommunications: booking.agreeToCommunications || false,
      });
    }
  }, [booking]);

  // Check if contact info is complete (for enabling the agreement button)
  const isContactInfoComplete = () => {
    return (
      contactData.firstName.trim() !== "" &&
      contactData.lastName.trim() !== "" &&
      contactData.phone.trim() !== "" &&
      contactData.email.trim() !== ""
    );
  };

  const handleDepositPayment = () => {
    if (!isContactInfoComplete()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all contact information",
        variant: "destructive",
      });
      return;
    }

    if (!contactData.agreeToCommunications) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate(contactData);
  };

  const handleSaveQuote = () => {
    if (!isContactInfoComplete()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all contact information to save your quote",
        variant: "destructive",
      });
      return;
    }

    saveQuoteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your party details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your party booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={hostHamptonLogo}
            alt="Host Hampton"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Design Your Party
          </h1>
          <p className="text-gray-600">Complete your booking details below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Design Form */}
          <div className="order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* DIY vs Full Service Choice */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Choose Your Party Style
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() =>
                        handleRealTimeUpdate("partyType", "full-service")
                      }
                      className={`border-2 p-4 cursor-pointer transition-all rounded-2xl ${
                        booking.partyType === "full-service"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">✨</div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          Let Us Handle It!
                        </h4>
                        <p className="text-xs text-gray-600">
                          Full-service party with activities
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => handleRealTimeUpdate("partyType", "diy")}
                      className={`border-2 p-4 cursor-pointer transition-all rounded-2xl ${
                        booking.partyType === "diy"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🎨</div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          DIY (Studio Rental)
                        </h4>
                        <p className="text-xs text-gray-600">
                          You handle the activities & setup
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Child Details - Only for Full Service */}
                {booking.partyType === "full-service" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Child's First Name
                        </Label>
                        <Input
                          value={booking.childName || ""}
                          onChange={(e) =>
                            handleTextInputUpdate("childName", e.target.value)
                          }
                          className="mt-1 border-2 border-gray-200 rounded-full focus:border-purple-500 text-sm text-center"
                          placeholder="Enter child's name"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Age
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full shrink-0"
                            onClick={() => {
                              const newAge = Math.max(
                                1,
                                (booking.childAge || 1) - 1,
                              );
                              handleRealTimeUpdate("childAge", newAge);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max="18"
                            value={booking.childAge || ""}
                            onChange={(e) =>
                              handleRealTimeUpdate(
                                "childAge",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="text-center border-2 border-gray-200 rounded-full focus:border-purple-500 text-sm"
                            placeholder="Age"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full shrink-0"
                            onClick={() => {
                              const newAge = Math.min(
                                18,
                                (booking.childAge || 1) + 1,
                              );
                              handleRealTimeUpdate("childAge", newAge);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date & Time */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Date & Time
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Event Date
                      </Label>
                      <Input
                        type="date"
                        min={(() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return tomorrow.toISOString().split("T")[0];
                        })()}
                        value={
                          booking.eventDate
                            ? booking.eventDate.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleRealTimeUpdate("eventDate", e.target.value)
                        }
                        className="mt-1 border-2 border-gray-200 rounded-full focus:border-purple-500"
                      />
                    </div>
                    <div>
                      {booking.partyType === "diy" ? (
                        <>
                          <Label className="text-sm font-semibold text-gray-700">
                            Arrival Time
                          </Label>
                          <Select
                            value={booking.arrivalTime || ""}
                            onValueChange={(value) =>
                              handleRealTimeUpdate("arrivalTime", value)
                            }
                          >
                            <SelectTrigger className="mt-1 border-2 border-gray-200 rounded-full focus:border-purple-500">
                              <SelectValue placeholder="Select arrival time" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="7:00am">7:00am</SelectItem>
                              <SelectItem value="8:00am">8:00am</SelectItem>
                              <SelectItem value="9:00am">9:00am</SelectItem>
                              <SelectItem value="10:00am">10:00am</SelectItem>
                              <SelectItem value="11:00am">11:00am</SelectItem>
                              <SelectItem value="12:00pm">12:00pm</SelectItem>
                              <SelectItem value="1:00pm">1:00pm</SelectItem>
                              <SelectItem value="2:00pm">2:00pm</SelectItem>
                              <SelectItem value="3:00pm">3:00pm</SelectItem>
                              <SelectItem value="4:00pm">4:00pm</SelectItem>
                              <SelectItem value="5:00pm">5:00pm</SelectItem>
                              <SelectItem value="6:00pm">6:00pm</SelectItem>
                              <SelectItem value="7:00pm">7:00pm</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <>
                          <Label className="text-sm font-semibold text-gray-700">
                            Party Start Time
                          </Label>
                          {(() => {
                            // Check if weekend (Saturday or Sunday only)
                            const isWeekend = booking.eventDate
                              ? (() => {
                                  const date = new Date(booking.eventDate);
                                  const dayOfWeek = date.getDay();
                                  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
                                })()
                              : false;

                            return isWeekend ? (
                              // Weekend: Only 10am, 1pm, 4pm options
                              <Select
                                value={booking.arrivalTime || ""}
                                onValueChange={(value) =>
                                  handleRealTimeUpdate("arrivalTime", value)
                                }
                              >
                                <SelectTrigger className="mt-1 border-2 border-gray-200 rounded-full focus:border-purple-500 text-center">
                                  <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                  <SelectItem value="10:00am">
                                    10:00 AM
                                  </SelectItem>
                                  <SelectItem value="1:00pm">
                                    1:00 PM
                                  </SelectItem>
                                  <SelectItem value="4:00pm">
                                    4:00 PM
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              // Weekday: Custom time selection
                              <Select
                                value={booking.arrivalTime || ""}
                                onValueChange={(value) =>
                                  handleRealTimeUpdate("arrivalTime", value)
                                }
                              >
                                <SelectTrigger className="mt-1 border-2 border-gray-200 rounded-full focus:border-purple-500 text-center">
                                  <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                  <SelectItem value="9:00am">
                                    9:00 AM
                                  </SelectItem>
                                  <SelectItem value="10:00am">
                                    10:00 AM
                                  </SelectItem>
                                  <SelectItem value="11:00am">
                                    11:00 AM
                                  </SelectItem>
                                  <SelectItem value="12:00pm">
                                    12:00 PM
                                  </SelectItem>
                                  <SelectItem value="1:00pm">
                                    1:00 PM
                                  </SelectItem>
                                  <SelectItem value="2:00pm">
                                    2:00 PM
                                  </SelectItem>
                                  <SelectItem value="3:00pm">
                                    3:00 PM
                                  </SelectItem>
                                  <SelectItem value="4:00pm">
                                    4:00 PM
                                  </SelectItem>
                                  <SelectItem value="5:00pm">
                                    5:00 PM
                                  </SelectItem>
                                  <SelectItem value="6:00pm">
                                    6:00 PM
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rental Duration - DIY Only */}
                {booking.partyType === "diy" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        Rental Duration
                      </h3>
                      <span className="text-sm font-semibold text-gray-800">
                        {(() => {
                          const duration = booking.rentalDuration || "3";
                          const eventDate = booking.eventDate;

                          // Determine if weekend (Fri, Sat, Sun)
                          let isWeekend = false;
                          if (eventDate) {
                            const date = new Date(eventDate);
                            const dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
                            isWeekend =
                              dayOfWeek === 0 ||
                              dayOfWeek === 5 ||
                              dayOfWeek === 6;
                          }

                          const weekendPrices: Record<string, number> = {
                            "3": 500,
                            "4": 600,
                            "5": 700,
                            "all-day": 800,
                          };

                          const weekdayPrices: Record<string, number> = {
                            "3": 400,
                            "4": 475,
                            "5": 550,
                            "all-day": 625,
                          };

                          const prices = isWeekend
                            ? weekendPrices
                            : weekdayPrices;
                          return `$${prices[duration] || (isWeekend ? 500 : 400)}`;
                        })()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {booking.rentalDuration === "all-day"
                            ? "All Day"
                            : `${booking.rentalDuration || "3"} Hours`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {["3", "4", "5", "all-day"].map((duration) => (
                          <button
                            key={duration}
                            onClick={() =>
                              handleRealTimeUpdate("rentalDuration", duration)
                            }
                            className={`flex-1 py-2 px-3 border-2 transition-all text-sm font-medium rounded-full ${
                              (booking.rentalDuration || "3") === duration
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-purple-300"
                            }`}
                          >
                            {duration === "all-day"
                              ? "All Day"
                              : `${duration}h`}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        *Include setup and clean time in the Rental Duration.
                      </p>
                    </div>
                  </div>
                )}

                {/* Guest Count & Location */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Party Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Guest Count *
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full shrink-0"
                          onClick={() => {
                            const newCount = Math.max(
                              1,
                              (booking.guestCount || 1) - 1,
                            );
                            handleRealTimeUpdate("guestCount", newCount);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={booking.guestCount || ""}
                          onChange={(e) =>
                            handleRealTimeUpdate(
                              "guestCount",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="text-center border-2 border-gray-200 rounded-full focus:border-purple-500"
                          placeholder="Number of guests"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full shrink-0"
                          onClick={() => {
                            const newCount = (booking.guestCount || 1) + 1;
                            handleRealTimeUpdate("guestCount", newCount);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 italic">
                        * do not include birthday child
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Location
                      </Label>
                      {booking.partyType === "diy" ? (
                        <Input
                          value="Host Hampton Studio"
                          disabled
                          className="mt-1 border-2 border-gray-200 rounded-full bg-gray-50 text-gray-600 text-center"
                        />
                      ) : (
                        <Select
                          value={booking.eventLocation || "studio"}
                          onValueChange={(value) =>
                            handleRealTimeUpdate("eventLocation", value)
                          }
                        >
                          <SelectTrigger className="mt-1 border-2 border-gray-200 rounded-full focus:border-purple-500 text-center">
                            <SelectValue placeholder="Choose location" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="studio">
                              Host Hampton Studio
                            </SelectItem>
                            <SelectItem value="mobile">
                              Mobile (Your Address)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  {booking.eventLocation === "mobile" &&
                    booking.partyType !== "diy" && (
                      <div className="mt-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Mobile Address
                        </Label>
                        <Input
                          value={booking.mobileAddress || ""}
                          onChange={(e) => {
                            // Update local cache immediately for UI responsiveness
                            queryClient.setQueryData(
                              ["/api/leads", effectiveLeadId],
                              (oldData: any) => {
                                if (oldData) {
                                  return {
                                    ...oldData,
                                    mobileAddress: e.target.value,
                                  };
                                }
                                return oldData;
                              },
                            );
                          }}
                          onBlur={(e) => {
                            // Update server only on blur to prevent lag
                            updateMutation.mutate({
                              mobileAddress: e.target.value,
                            });
                          }}
                          className="mt-1 border-2 border-gray-200 rounded-full focus:border-purple-500"
                          placeholder="Enter your full address"
                        />
                      </div>
                    )}
                </div>

                {/* Theme Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Party Theme
                  </h3>

                  {/* DIY decor option text */}
                  {booking.partyType === "diy" && (
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      Want us to decorate? Select a theme and we'll set it up
                      for you!
                    </p>
                  )}

                  {!selectedTheme ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* No Thanks option - DIY only */}
                      {booking.partyType === "diy" && (
                        <div
                          className="border-2 border-gray-200 p-3 cursor-pointer transition-all hover:border-purple-400 bg-gray-50 hover:bg-gray-100 min-h-[60px] flex items-center rounded-2xl"
                          onClick={() => {
                            setSelectedTheme("no-thanks");
                            handleRealTimeUpdate("partyTheme", "no-thanks");
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="text-2xl">👎</div>
                            <div className="text-sm font-medium text-gray-700 flex-1">
                              No Thanks
                            </div>
                          </div>
                        </div>
                      )}
                      {allThemes?.map((theme: any) => (
                        <div
                          key={theme.id}
                          onClick={() => {
                            setSelectedTheme(theme.name);
                            handleRealTimeUpdate("partyTheme", theme.name);
                          }}
                          className="border-2 border-gray-200 p-3 cursor-pointer transition-all hover:border-purple-400 bg-white hover:bg-gray-50 min-h-[60px] flex items-center rounded-2xl"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="text-2xl">{theme.icon}</div>
                            <div className="text-sm font-medium text-gray-700 flex-1">
                              {theme.name}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div
                        className="border-2 border-gray-200 p-3 cursor-pointer transition-all hover:border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 min-h-[60px] flex items-center rounded-2xl"
                        onClick={() => {
                          setSelectedTheme("custom");
                          handleRealTimeUpdate("partyTheme", "custom");
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="text-2xl">✨</div>
                          <div className="text-sm font-medium text-gray-700 flex-1">
                            Custom Theme
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-purple-500 bg-purple-50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {selectedTheme === "custom"
                              ? "✨"
                              : selectedTheme === "no-thanks"
                                ? "👎"
                                : allThemes?.find(
                                    (t: any) => t.name === selectedTheme,
                                  )?.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">
                                {selectedTheme === "custom"
                                  ? "Custom Theme"
                                  : selectedTheme === "no-thanks"
                                    ? "No Thanks"
                                    : selectedTheme}
                              </span>
                              {(() => {
                                const themePrice =
                                  allThemes?.find(
                                    (t: any) => t.name === selectedTheme,
                                  )?.price || 0;
                                return themePrice > 0 ? (
                                  <span className="text-sm font-semibold text-purple-600">
                                    +${themePrice}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                            {selectedTheme === "custom" && (
                              <Input
                                value={booking.customTheme || ""}
                                onChange={(e) =>
                                  handleTextInputUpdate(
                                    "customTheme",
                                    e.target.value,
                                  )
                                }
                                className="mt-2 border-2 border-gray-200 rounded-full focus:border-purple-500"
                                placeholder="Describe your custom theme..."
                              />
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTheme(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5-Star Package Selection - Only for Full Service */}
                {booking.partyType === "full-service" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">
                      Package Level
                    </h3>

                    {/* 5-Star Horizontal Rating */}
                    <div className="flex items-center justify-center gap-2 py-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => {
                            setSelectedStars(star);
                            const starKeys = [
                              "star1",
                              "star2",
                              "star3",
                              "star4",
                              "star5",
                            ];
                            const selectedPackageKey = starKeys[star - 1];
                            const selectedPackage =
                              packageDefinitions[
                                selectedPackageKey as keyof typeof packageDefinitions
                              ];
                            if (selectedPackage) {
                              handleRealTimeUpdate(
                                "packageSelection",
                                selectedPackage.name,
                              );
                            }
                          }}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            star <= selectedStars
                              ? "border-purple-500 bg-purple-500 text-white"
                              : "border-gray-300 bg-white text-gray-400 hover:border-purple-300"
                          }`}
                        >
                          <Star
                            className={`w-6 h-6 mx-auto ${star <= selectedStars ? "fill-current" : ""}`}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Package Details & Add-ons Below Stars */}
                    {selectedStars > 0 && selectedStars <= 5 && (
                      <div className="space-y-4">
                        {/* Package Summary */}
                        <div className="border-2 border-purple-500 bg-purple-50 p-4 rounded-2xl">
                          {(() => {
                            const starKeys = [
                              "star1",
                              "star2",
                              "star3",
                              "star4",
                              "star5",
                            ];
                            const selectedPackageKey =
                              starKeys[selectedStars - 1];
                            const selectedPackage =
                              packageDefinitions[
                                selectedPackageKey as keyof typeof packageDefinitions
                              ];

                            // Get the database package for pricing
                            const dbPackage = allPackages?.find((pkg: any) => {
                              const pkgName = pkg.name
                                .toLowerCase()
                                .replace(/[^a-z0-9]/g, "");
                              return (
                                pkgName.includes(`${selectedStars}star`) ||
                                pkgName.includes(`star${selectedStars}`)
                              );
                            });
                            const displayPrice = dbPackage?.basePrice || 0;

                            return (
                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <div className="font-medium text-gray-800">
                                    {selectedPackage.name}
                                  </div>
                                  <div className="text-lg font-bold text-purple-600">
                                    {displayPrice > 0
                                      ? `${formatPrice(displayPrice)}`
                                      : "Base Package"}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  Up to {selectedPackage.maxGuests} guests
                                  {selectedPackage.premiumActivities > 0 &&
                                    ` • ${selectedPackage.premiumActivities} premium activities`}
                                  {selectedPackage.standardActivities > 0 &&
                                    ` • ${selectedPackage.standardActivities} standard activities`}
                                  {selectedPackage.foodBudget &&
                                    ` • $${selectedPackage.foodBudget} food budget`}
                                </div>
                                <div className="text-xs text-gray-500 mb-3">
                                  {selectedPackage.description}
                                </div>
                                <div className="border-t border-purple-200 pt-3 mt-3">
                                  <div className="text-xs font-semibold text-gray-700 mb-2">
                                    Package Includes:
                                  </div>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {selectedPackage.includes.map(
                                      (item: string, index: number) => (
                                        <li
                                          key={index}
                                          className="flex items-start gap-2"
                                        >
                                          <span className="text-purple-500 mt-0.5">
                                            ✓
                                          </span>
                                          <span>{item}</span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Structured Activity & Food Selection */}
                        <div className="space-y-4">
                          {(() => {
                            const starKeys = [
                              "star1",
                              "star2",
                              "star3",
                              "star4",
                              "star5",
                            ];
                            const selectedPackageKey =
                              starKeys[selectedStars - 1];
                            const selectedPackage =
                              packageDefinitions[
                                selectedPackageKey as keyof typeof packageDefinitions
                              ];

                            // Get currently selected activities
                            const currentPremiumActivities =
                              booking.selectedPremiumActivities || [];
                            const currentStandardActivities =
                              booking.selectedStandardActivities || [];
                            const currentFood = booking.selectedFood || "pizza";
                            const currentCupcakeFlavor =
                              booking.selectedCupcakeFlavor || "vanilla";
                            const hasChickenUpgrade =
                              booking.hasChickenUpgrade || false;

                            const premiumActivitiesData =
                              allAddons?.filter(
                                (addon: any) =>
                                  addon.category === "premium activity",
                              ) || [];

                            const standardActivitiesData =
                              allAddons?.filter(
                                (addon: any) => addon.category === "activity",
                              ) || [];

                            const premiumQuotaReached =
                              currentPremiumActivities.length >=
                              selectedPackage.premiumActivities;
                            const standardQuotaReached =
                              currentStandardActivities.length >=
                              selectedPackage.standardActivities;

                            return (
                              <>
                                {/* Premium Activities Section */}
                                {selectedPackage.premiumActivities > 0 && (
                                  <div className="border-2 border-gray-200 p-4 rounded-2xl">
                                    <h4 className="font-medium text-gray-800 mb-2">
                                      Select Premium Activities (
                                      {currentPremiumActivities.length}/
                                      {selectedPackage.premiumActivities})
                                    </h4>

                                    {premiumQuotaReached ? (
                                      <div className="space-y-2">
                                        <p className="text-sm text-green-600 mb-2">
                                          ✓ Premium activity selection complete
                                        </p>
                                        {currentPremiumActivities.map(
                                          (activityName: string) => {
                                            const activity =
                                              premiumActivitiesData.find(
                                                (a: any) =>
                                                  a.name === activityName,
                                              );
                                            if (!activity) return null;
                                            return (
                                              <div
                                                key={activity.id}
                                                className="border-2 border-green-500 bg-green-50 p-3 rounded-2xl"
                                              >
                                                <div className="flex justify-between items-center">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-lg">
                                                      {activity.icon}
                                                    </span>
                                                    <span className="font-medium">
                                                      {activity.name}
                                                    </span>
                                                  </div>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                      const updated =
                                                        currentPremiumActivities.filter(
                                                          (name: string) =>
                                                            name !==
                                                            activity.name,
                                                        );
                                                      handleRealTimeUpdate(
                                                        "selectedPremiumActivities",
                                                        updated,
                                                      );
                                                    }}
                                                  >
                                                    Change
                                                  </Button>
                                                </div>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-2">
                                        {premiumActivitiesData.map(
                                          (addon: any) => {
                                            const isSelected =
                                              currentPremiumActivities.includes(
                                                addon.name,
                                              );

                                            return (
                                              <div
                                                key={addon.id}
                                                onClick={() => {
                                                  if (isSelected) {
                                                    const updated =
                                                      currentPremiumActivities.filter(
                                                        (name: string) =>
                                                          name !== addon.name,
                                                      );
                                                    handleRealTimeUpdate(
                                                      "selectedPremiumActivities",
                                                      updated,
                                                    );
                                                  } else if (
                                                    !premiumQuotaReached
                                                  ) {
                                                    const updated = [
                                                      ...currentPremiumActivities,
                                                      addon.name,
                                                    ];
                                                    handleRealTimeUpdate(
                                                      "selectedPremiumActivities",
                                                      updated,
                                                    );
                                                  }
                                                }}
                                                className={`border-2 p-3 cursor-pointer transition-all text-sm rounded-full ${
                                                  isSelected
                                                    ? "border-purple-500 bg-purple-50"
                                                    : "border-gray-200 bg-white hover:border-purple-300"
                                                }`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <span className="text-lg">
                                                    {addon.icon}
                                                  </span>
                                                  <span className="font-medium">
                                                    {addon.name}
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Standard Activities Section */}
                                {selectedPackage.standardActivities > 0 && (
                                  <div className="border-2 border-gray-200 p-4 rounded-2xl">
                                    <h4 className="font-medium text-gray-800 mb-2">
                                      Select Standard Activities (
                                      {currentStandardActivities.length}/
                                      {selectedPackage.standardActivities})
                                    </h4>

                                    {standardQuotaReached ? (
                                      <div className="space-y-2">
                                        <p className="text-sm text-green-600 mb-2">
                                          ✓ Standard activity selection complete
                                        </p>
                                        {currentStandardActivities.map(
                                          (activityName: string) => {
                                            const activity =
                                              standardActivitiesData.find(
                                                (a: any) =>
                                                  a.name === activityName,
                                              );
                                            if (!activity) return null;
                                            return (
                                              <div
                                                key={activity.id}
                                                className="border-2 border-green-500 bg-green-50 p-3 rounded-2xl"
                                              >
                                                <div className="flex justify-between items-center">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-lg">
                                                      {activity.icon}
                                                    </span>
                                                    <span className="font-medium">
                                                      {activity.name}
                                                    </span>
                                                  </div>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                      const updated =
                                                        currentStandardActivities.filter(
                                                          (name: string) =>
                                                            name !==
                                                            activity.name,
                                                        );
                                                      handleRealTimeUpdate(
                                                        "selectedStandardActivities",
                                                        updated,
                                                      );
                                                    }}
                                                  >
                                                    Change
                                                  </Button>
                                                </div>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-2">
                                        {standardActivitiesData.map(
                                          (addon: any) => {
                                            const isSelected =
                                              currentStandardActivities.includes(
                                                addon.name,
                                              );

                                            return (
                                              <div
                                                key={addon.id}
                                                onClick={() => {
                                                  if (isSelected) {
                                                    const updated =
                                                      currentStandardActivities.filter(
                                                        (name: string) =>
                                                          name !== addon.name,
                                                      );
                                                    handleRealTimeUpdate(
                                                      "selectedStandardActivities",
                                                      updated,
                                                    );
                                                  } else if (
                                                    !standardQuotaReached
                                                  ) {
                                                    const updated = [
                                                      ...currentStandardActivities,
                                                      addon.name,
                                                    ];
                                                    handleRealTimeUpdate(
                                                      "selectedStandardActivities",
                                                      updated,
                                                    );
                                                  }
                                                }}
                                                className={`border-2 p-3 cursor-pointer transition-all text-sm rounded-full ${
                                                  isSelected
                                                    ? "border-purple-500 bg-purple-50"
                                                    : "border-gray-200 bg-white hover:border-purple-300"
                                                }`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <span className="text-lg">
                                                    {addon.icon}
                                                  </span>
                                                  <span className="font-medium">
                                                    {addon.name}
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Party Extras */}
                                <div className="border-2 border-gray-200 p-4 rounded-2xl">
                                  <h4 className="font-medium text-gray-800 mb-3">
                                    Party Extras
                                  </h4>

                                  {/* Gift Items - Boolean Select Buttons */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
                                    {[
                                      {
                                        name: "Goodie Bags",
                                        icon: "🎁",
                                        label: "Goodie Bags",
                                      },
                                      {
                                        name: "Premium Goodie Bags",
                                        icon: "🎀",
                                        label: "Premium Goodie Bags",
                                      },
                                      {
                                        name: "Curated Birthday Gift",
                                        icon: "🎁",
                                        label:
                                          "Personalized Birthday Gift Basket",
                                      },
                                    ].map((item) => {
                                      const currentPartyExtras =
                                        booking.selectedPartyExtras || {};
                                      const isSelected =
                                        !!currentPartyExtras[item.name] &&
                                        Number(currentPartyExtras[item.name]) >
                                          0;

                                      return (
                                        <div
                                          key={item.name}
                                          onClick={() => {
                                            const updated = {
                                              ...currentPartyExtras,
                                            };
                                            if (isSelected) {
                                              delete updated[item.name];
                                            } else {
                                              // If selecting Goodie Bags, remove Premium Goodie Bags
                                              if (
                                                item.name === "Goodie Bags" &&
                                                updated["Premium Goodie Bags"]
                                              ) {
                                                delete updated[
                                                  "Premium Goodie Bags"
                                                ];
                                              }
                                              // If selecting Premium Goodie Bags, remove Goodie Bags
                                              if (
                                                item.name ===
                                                  "Premium Goodie Bags" &&
                                                updated["Goodie Bags"]
                                              ) {
                                                delete updated["Goodie Bags"];
                                              }
                                              updated[item.name] = 1;
                                            }
                                            handleRealTimeUpdate(
                                              "selectedPartyExtras",
                                              updated,
                                            );
                                          }}
                                          className={`border-2 p-3 cursor-pointer transition-all text-sm rounded-full ${
                                            isSelected
                                              ? "border-green-500 bg-green-50"
                                              : "border-gray-200 bg-white hover:border-green-300"
                                          }`}
                                          data-testid={`party-extra-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                              {item.icon}
                                            </span>
                                            <span className="font-medium">
                                              {item.label}
                                            </span>
                                            {isSelected && (
                                              <span className="ml-auto text-green-600">
                                                ✓
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Balloon & Decor Items - +/- Selectors */}
                                  <div className="space-y-2">
                                    {[
                                      { name: "Balloon Tower", icon: "🎈" },
                                      {
                                        name: "Balloon Garland 6ft",
                                        icon: "🎈",
                                      },
                                      { name: "Balloon Arch", icon: "🎈" },
                                      { name: "Marquee Number", icon: "✨" },
                                    ].map((extra) => {
                                      const currentPartyExtras =
                                        booking.selectedPartyExtras || {};
                                      const quantity =
                                        currentPartyExtras[extra.name] || 0;

                                      return (
                                        <div
                                          key={extra.name}
                                          className="flex items-center justify-between p-3"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                              {extra.icon}
                                            </span>
                                            <span className="text-sm font-medium">
                                              {extra.name}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                const updated = {
                                                  ...currentPartyExtras,
                                                };
                                                if (quantity > 0) {
                                                  updated[extra.name] =
                                                    quantity - 1;
                                                  if (updated[extra.name] === 0)
                                                    delete updated[extra.name];
                                                }
                                                handleRealTimeUpdate(
                                                  "selectedPartyExtras",
                                                  updated,
                                                );
                                              }}
                                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                            >
                                              <Minus className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center text-sm">
                                              {quantity}
                                            </span>
                                            <button
                                              onClick={() => {
                                                const updated = {
                                                  ...currentPartyExtras,
                                                  [extra.name]: quantity + 1,
                                                };
                                                handleRealTimeUpdate(
                                                  "selectedPartyExtras",
                                                  updated,
                                                );
                                              }}
                                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                            >
                                              <Plus className="w-4 h-4 text-gray-600" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Food Selection */}
                                <div className="border-2 border-gray-200 p-4 rounded-2xl">
                                  <h4 className="font-medium text-gray-800 mb-3">
                                    Food Selection
                                  </h4>

                                  {/* Base Food Selection */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <div
                                      onClick={() =>
                                        handleRealTimeUpdate(
                                          "selectedFood",
                                          "pizza",
                                        )
                                      }
                                      className={`border-2 p-3 cursor-pointer transition-all text-sm text-center rounded-full ${
                                        currentFood === "pizza"
                                          ? "border-green-500 bg-green-50"
                                          : "border-gray-200 bg-white hover:border-green-300"
                                      }`}
                                    >
                                      <div className="font-medium flex items-center justify-center gap-2">
                                        🍕 Pizza
                                        {currentFood === "pizza" && (
                                          <span className="text-green-600">
                                            ✓
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      onClick={() =>
                                        handleRealTimeUpdate(
                                          "selectedFood",
                                          "bagels",
                                        )
                                      }
                                      className={`border-2 p-3 cursor-pointer transition-all text-sm text-center rounded-full ${
                                        currentFood === "bagels"
                                          ? "border-green-500 bg-green-50"
                                          : "border-gray-200 bg-white hover:border-green-300"
                                      }`}
                                    >
                                      <div className="font-medium flex items-center justify-center gap-2">
                                        🥯 Bagels
                                        {currentFood === "bagels" && (
                                          <span className="text-green-600">
                                            ✓
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      onClick={() =>
                                        handleRealTimeUpdate(
                                          "selectedFood",
                                          "none",
                                        )
                                      }
                                      className={`border-2 p-3 cursor-pointer transition-all text-sm text-center rounded-full ${
                                        currentFood === "none"
                                          ? "border-green-500 bg-green-50"
                                          : "border-gray-200 bg-white hover:border-green-300"
                                      }`}
                                    >
                                      <div className="font-medium flex items-center justify-center gap-2">
                                        🚫 None
                                        {currentFood === "none" && (
                                          <span className="text-green-600">
                                            ✓
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Food Add-ons */}
                                  <div className="border-t pt-3">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                      Add-ons:
                                    </h5>
                                    <div className="space-y-2">
                                      {[
                                        { name: "Fruit Tray", icon: "🍓" },
                                        {
                                          name: "Tray of Chicken Fingers",
                                          icon: "🍗",
                                        },
                                        {
                                          name: "Tray of French Fries",
                                          icon: "🍟",
                                        },
                                        {
                                          name: "Regular Pizza (Adults)",
                                          icon: "🍕",
                                        },
                                        { name: "Specialty Pizza", icon: "🍕" },
                                        {
                                          name: "Charcuterie Board",
                                          icon: "🧀",
                                        },
                                      ].map((addon) => {
                                        const currentFoodAddons =
                                          booking.selectedFoodAddons || {};
                                        const quantity =
                                          currentFoodAddons[addon.name] || 0;

                                        return (
                                          <div
                                            key={addon.name}
                                            className="flex items-center justify-between p-3"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">
                                                {addon.icon}
                                              </span>
                                              <span className="text-sm font-medium">
                                                {addon.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => {
                                                  const updated = {
                                                    ...currentFoodAddons,
                                                  };
                                                  if (quantity > 0) {
                                                    updated[addon.name] =
                                                      quantity - 1;
                                                    if (
                                                      updated[addon.name] === 0
                                                    )
                                                      delete updated[
                                                        addon.name
                                                      ];
                                                  }
                                                  handleRealTimeUpdate(
                                                    "selectedFoodAddons",
                                                    updated,
                                                  );
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                              >
                                                <Minus className="w-4 h-4 text-gray-600" />
                                              </button>
                                              <span className="w-8 text-center text-sm">
                                                {quantity}
                                              </span>
                                              <button
                                                onClick={() => {
                                                  const updated = {
                                                    ...currentFoodAddons,
                                                    [addon.name]: quantity + 1,
                                                  };
                                                  handleRealTimeUpdate(
                                                    "selectedFoodAddons",
                                                    updated,
                                                  );
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                              >
                                                <Plus className="w-4 h-4 text-gray-600" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Sweets & Treats */}
                                <div className="border-2 border-gray-200 p-4 rounded-2xl">
                                  <h4 className="font-medium text-gray-800 mb-3">
                                    Sweets & Treats
                                  </h4>

                                  {/* Base Cupcakes (Included) */}
                                  <div className="mb-4">
                                    <p className="text-xs text-gray-600 mb-2">
                                      Included:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {["vanilla", "chocolate", "none"].map(
                                        (flavor) => (
                                          <div
                                            key={flavor}
                                            onClick={() =>
                                              handleRealTimeUpdate(
                                                "selectedCupcakeFlavor",
                                                flavor,
                                              )
                                            }
                                            className={`border-2 p-3 cursor-pointer transition-all text-sm text-center rounded-full ${
                                              currentCupcakeFlavor === flavor
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 bg-white hover:border-green-300"
                                            }`}
                                          >
                                            <div className="font-medium flex items-center justify-center gap-2">
                                              {flavor === "none"
                                                ? "🚫 None"
                                                : flavor === "vanilla"
                                                  ? "🧁 Vanilla Cupcakes"
                                                  : "🍫 Chocolate Cupcakes"}
                                              {currentCupcakeFlavor ===
                                                flavor && (
                                                <span className="text-green-600">
                                                  ✓
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  {/* Sweet Add-ons */}
                                  <div className="border-t pt-3">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                      Add-ons (per dozen):
                                    </h5>
                                    <div className="space-y-2">
                                      {[
                                        { name: "Macarons", icon: "🧡" },
                                        {
                                          name: "Chocolate Covered Pretzels",
                                          icon: "🥨",
                                        },
                                        {
                                          name: "Chocolate Covered Rice Krispies",
                                          icon: "🍚",
                                        },
                                        {
                                          name: "Decorated Sugar Cookies",
                                          icon: "🍪",
                                        },
                                      ].map((addon) => {
                                        const currentSweetAddons =
                                          booking.selectedSweetAddons || {};
                                        const quantity =
                                          currentSweetAddons[addon.name] || 0;

                                        return (
                                          <div
                                            key={addon.name}
                                            className="flex items-center justify-between p-3"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">
                                                {addon.icon}
                                              </span>
                                              <span className="text-sm font-medium">
                                                {addon.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => {
                                                  const updated = {
                                                    ...currentSweetAddons,
                                                  };
                                                  if (quantity > 0) {
                                                    updated[addon.name] =
                                                      quantity - 1;
                                                    if (
                                                      updated[addon.name] === 0
                                                    )
                                                      delete updated[
                                                        addon.name
                                                      ];
                                                  }
                                                  handleRealTimeUpdate(
                                                    "selectedSweetAddons",
                                                    updated,
                                                  );
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                              >
                                                <Minus className="w-4 h-4 text-gray-600" />
                                              </button>
                                              <span className="w-8 text-center text-sm">
                                                {quantity}
                                              </span>
                                              <button
                                                onClick={() => {
                                                  const updated = {
                                                    ...currentSweetAddons,
                                                    [addon.name]: quantity + 1,
                                                  };
                                                  handleRealTimeUpdate(
                                                    "selectedSweetAddons",
                                                    updated,
                                                  );
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                              >
                                                <Plus className="w-4 h-4 text-gray-600" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Specialty Items */}
                                <div className="border-2 border-gray-200 p-4 rounded-2xl">
                                  <h4 className="font-medium text-gray-800 mb-3">
                                    Specialty Items
                                  </h4>
                                  <div className="space-y-2">
                                    {[
                                      { name: "Popcorn Bar", icon: "🍿" },
                                      { name: "Candy Wall", icon: "🍭" },
                                      {
                                        name: "Custom Treat Table",
                                        icon: "🍰",
                                      },
                                    ].map((item) => {
                                      const currentFoodAddons =
                                        booking.selectedFoodAddons || {};
                                      const currentSweetAddons =
                                        booking.selectedSweetAddons || {};
                                      const isSelected =
                                        (item.name === "Popcorn Bar" &&
                                          currentFoodAddons[item.name]) ||
                                        ((item.name === "Candy Wall" ||
                                          item.name === "Custom Treat Table") &&
                                          currentSweetAddons[item.name]);

                                      return (
                                        <div
                                          key={item.name}
                                          onClick={() => {
                                            if (item.name === "Popcorn Bar") {
                                              const updated = {
                                                ...currentFoodAddons,
                                              };
                                              if (isSelected) {
                                                delete updated[item.name];
                                              } else {
                                                updated[item.name] = 1;
                                              }
                                              handleRealTimeUpdate(
                                                "selectedFoodAddons",
                                                updated,
                                              );
                                            } else {
                                              const updated = {
                                                ...currentSweetAddons,
                                              };
                                              if (isSelected) {
                                                delete updated[item.name];
                                              } else {
                                                updated[item.name] = 1;
                                              }
                                              handleRealTimeUpdate(
                                                "selectedSweetAddons",
                                                updated,
                                              );
                                            }
                                          }}
                                          className={`border-2 p-3 cursor-pointer transition-all text-sm rounded-full ${
                                            isSelected
                                              ? "border-green-500 bg-green-50"
                                              : "border-gray-200 bg-white hover:border-green-300"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                              {item.icon}
                                            </span>
                                            <span className="font-medium">
                                              {item.name}
                                            </span>
                                            {isSelected && (
                                              <span className="ml-auto text-green-600">
                                                ✓
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Drinks Module */}
                                <div className="border-2 border-gray-200 p-4 rounded-2xl">
                                  <h4 className="font-medium text-gray-800 mb-3">
                                    Drinks
                                  </h4>

                                  {/* Included Drinks */}
                                  <div className="mb-4">
                                    <p className="text-xs text-gray-600 mb-2">
                                      Included:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200">
                                        <span className="text-lg">🧃</span>
                                        <span className="text-sm font-medium">
                                          Honest Juice Boxes
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200">
                                        <span className="text-lg">💧</span>
                                        <span className="text-sm font-medium">
                                          Mini Water Bottles
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Drink Add-ons */}
                                  <div className="border-t pt-3">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                      Add-ons:
                                    </h5>
                                    <div className="space-y-2">
                                      {[
                                        {
                                          name: "Soda & Seltzers Package",
                                          icon: "🥤",
                                          oldName: "Bubbles Drink Package",
                                        },
                                        { name: "Coffee Bar", icon: "☕" },
                                      ].map((addon) => {
                                        const currentDrinkAddons =
                                          booking.selectedDrinkAddons || {};
                                        // Check both new and old name for backwards compatibility
                                        const isSelected =
                                          currentDrinkAddons[addon.name] ||
                                          (addon.oldName &&
                                            currentDrinkAddons[addon.oldName]);

                                        return (
                                          <div
                                            key={addon.name}
                                            onClick={() => {
                                              const updated = {
                                                ...currentDrinkAddons,
                                              };
                                              // Remove old name if exists
                                              if (
                                                addon.oldName &&
                                                updated[addon.oldName]
                                              ) {
                                                delete updated[addon.oldName];
                                              }
                                              // Toggle new name
                                              if (isSelected) {
                                                delete updated[addon.name];
                                              } else {
                                                updated[addon.name] = 1;
                                              }
                                              handleRealTimeUpdate(
                                                "selectedDrinkAddons",
                                                updated,
                                              );
                                            }}
                                            className={`border-2 p-3 cursor-pointer transition-all text-sm rounded-full ${
                                              isSelected
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 bg-white hover:border-green-300"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">
                                                {addon.icon}
                                              </span>
                                              <span className="font-medium">
                                                {addon.name}
                                              </span>
                                              {isSelected && (
                                                <span className="ml-auto text-green-600">
                                                  ✓
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Allergy Module */}
                                <div className="border-2 border-gray-200 p-4 rounded-2xl">
                                  <h4 className="font-medium text-gray-800 mb-3">
                                    Allergies & Dietary Restrictions
                                  </h4>
                                  <div className="space-y-3">
                                    {[
                                      "Gluten-Free",
                                      "Dairy-Free",
                                      "Nut Allergy",
                                    ].map((allergy) => {
                                      const currentAllergies =
                                        booking.selectedAllergies || [];
                                      const isSelected =
                                        currentAllergies.includes(allergy);

                                      return (
                                        <div
                                          key={allergy}
                                          onClick={() => {
                                            const updated = isSelected
                                              ? currentAllergies.filter(
                                                  (a: string) => a !== allergy,
                                                )
                                              : [...currentAllergies, allergy];
                                            handleRealTimeUpdate(
                                              "selectedAllergies",
                                              updated,
                                            );
                                          }}
                                          className={`border-2 p-3 cursor-pointer transition-all text-sm text-center rounded-full ${
                                            isSelected
                                              ? "border-red-500 bg-red-50"
                                              : "border-gray-200 bg-white hover:border-red-300"
                                          }`}
                                        >
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="text-lg">
                                              {allergy === "Gluten-Free"
                                                ? "🌾"
                                                : allergy === "Dairy-Free"
                                                  ? "🥛"
                                                  : "🥜"}
                                            </span>
                                            <span className="font-medium">
                                              {allergy}
                                            </span>
                                            {isSelected && (
                                              <span className="text-red-600">
                                                ✓
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {booking.selectedAllergies?.length > 0 && (
                                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                      <p className="text-xs text-yellow-800">
                                        <strong>Note:</strong> Please notify us
                                        of any allergies when placing your
                                        order. We'll ensure all food and
                                        activities are safe and suitable.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DIY Add-ons Section */}
                {booking.partyType === "diy" && (
                  <div className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Party Add-ons
                    </h3>
                    <DIYAddons
                      selectedFood={booking.selectedDIYFood || []}
                      selectedDrinks={booking.selectedDIYDrinks || []}
                      selectedExtras={booking.selectedDIYExtras || []}
                      onAddFood={(addon) => {
                        const current = booking.selectedDIYFood || [];
                        handleRealTimeUpdate("selectedDIYFood", [
                          ...current,
                          addon,
                        ]);
                      }}
                      onRemoveFood={(addonId) => {
                        const current = booking.selectedDIYFood || [];
                        handleRealTimeUpdate(
                          "selectedDIYFood",
                          current.filter((a: DIYAddon) => a.id !== addonId),
                        );
                      }}
                      onAddDrink={(addon) => {
                        const current = booking.selectedDIYDrinks || [];
                        handleRealTimeUpdate("selectedDIYDrinks", [
                          ...current,
                          addon,
                        ]);
                      }}
                      onRemoveDrink={(addonId) => {
                        const current = booking.selectedDIYDrinks || [];
                        handleRealTimeUpdate(
                          "selectedDIYDrinks",
                          current.filter((a: DIYAddon) => a.id !== addonId),
                        );
                      }}
                      onAddExtra={(addon) => {
                        const current = booking.selectedDIYExtras || [];
                        handleRealTimeUpdate("selectedDIYExtras", [
                          ...current,
                          addon,
                        ]);
                      }}
                      onRemoveExtra={(addonId) => {
                        const current = booking.selectedDIYExtras || [];
                        handleRealTimeUpdate(
                          "selectedDIYExtras",
                          current.filter((a: DIYAddon) => a.id !== addonId),
                        );
                      }}
                      onUpdateGoodieBagQuantity={(quantity) => {
                        handleRealTimeUpdate("diyGoodieBagQty", quantity);
                      }}
                      onUpdatePremiumGoodieBagQuantity={(quantity) => {
                        handleRealTimeUpdate(
                          "diyPremiumGoodieBagQty",
                          quantity,
                        );
                      }}
                      onUpdateBirthdayGiftBasket={(hasBasket) => {
                        handleRealTimeUpdate(
                          "diyBirthdayGiftBasket",
                          hasBasket,
                        );
                      }}
                      goodieBagQuantity={booking.diyGoodieBagQty || 0}
                      premiumGoodieBagQuantity={
                        booking.diyPremiumGoodieBagQty || 0
                      }
                      hasBirthdayGiftBasket={
                        booking.diyBirthdayGiftBasket || false
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quotation & Billing */}
          <div className="space-y-6 order-2">
            {/* Contact Information Module */}
            <Card className="bg-white border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contactFirstName" className="text-sm">
                      First Name *
                    </Label>
                    <Input
                      id="contactFirstName"
                      data-testid="input-first-name"
                      value={contactData.firstName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setContactData({ ...contactData, firstName: value });
                        handleTextInputUpdate("firstName", value);
                      }}
                      className="mt-1 rounded-full"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactLastName" className="text-sm">
                      Last Name *
                    </Label>
                    <Input
                      id="contactLastName"
                      data-testid="input-last-name"
                      value={contactData.lastName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setContactData({ ...contactData, lastName: value });
                        handleTextInputUpdate("lastName", value);
                      }}
                      className="mt-1 rounded-full"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactEmail" className="text-sm">
                    Email Address *
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    data-testid="input-email"
                    value={contactData.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setContactData({ ...contactData, email: value });
                      handleTextInputUpdate("email", value);
                    }}
                    className="mt-1 rounded-full"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone" className="text-sm">
                    Phone *
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    data-testid="input-phone"
                    value={contactData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      setContactData({ ...contactData, phone: value });
                      handleTextInputUpdate("phone", value);
                    }}
                    className="mt-1 rounded-full"
                    placeholder="(555) 555-5555"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    disabled={!isContactInfoComplete()}
                    variant={
                      contactData.agreeToCommunications ? "default" : "outline"
                    }
                    className={`w-full justify-start text-left h-auto py-3 ${
                      contactData.agreeToCommunications
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : isContactInfoComplete()
                          ? "border-2 border-gray-300 hover:border-purple-500"
                          : "border-2 border-gray-200 opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (isContactInfoComplete()) {
                        const newValue = !contactData.agreeToCommunications;
                        setContactData({
                          ...contactData,
                          agreeToCommunications: newValue,
                        });
                        handleRealTimeUpdate("agreeToCommunications", newValue);
                      }
                    }}
                    data-testid="button-agree-terms"
                  >
                    <div className="flex items-center gap-2">
                      {contactData.agreeToCommunications && (
                        <span className="text-white">✓</span>
                      )}
                      <span className="text-sm">
                        I agree to the terms and conditions *
                      </span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary - Sticky */}
            <div className="lg:sticky lg:top-4 z-10">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🎉</span>
                    Party Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Party Details Header - Only for Full Service */}
                  {booking.partyType === "full-service" && (
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <h3 className="text-lg font-bold text-purple-800">
                        {booking.childName || "Child"}’s Birthday ⭐ Turning{" "}
                        {booking.childAge || "Age"}! 🥳
                      </h3>
                    </div>
                  )}

                  {/* Party Information */}
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">
                          {booking.eventDate
                            ? new Date(booking.eventDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "To be scheduled"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {booking.partyType === "diy" ? "Arrival:" : "Time:"}
                        </span>
                        <p className="font-medium">
                          {booking.partyType === "diy"
                            ? booking.arrivalTime || "To be scheduled"
                            : booking.timeSlot || "To be scheduled"}
                        </p>
                      </div>
                    </div>

                    {booking.partyType === "diy" && (
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">
                          {booking.rentalDuration === "all-day"
                            ? "All Day"
                            : `${booking.rentalDuration || "3"} Hours`}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">
                        {(booking.eventLocation || "studio") === "studio"
                          ? "Host Hampton Studio"
                          : "Mobile Service"}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-600">Theme:</span>
                      <p className="font-medium">
                        {selectedTheme === "no-thanks"
                          ? "No Thanks"
                          : selectedTheme === "custom"
                            ? booking.customTheme || "Custom Theme"
                            : selectedTheme ||
                              booking.partyTheme ||
                              "To be selected"}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-600">Expected Guests:</span>
                      <p className="font-medium">
                        {booking.guestCount || 10}{" "}
                        {booking.partyType === "diy" ? "guests" : "children"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Package/Service Details */}
                  {booking.partyType === "diy" ? (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-700">
                        🎨 DIY Studio Rental
                      </h4>

                      {/* DIY Info */}
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs font-medium text-blue-800 mb-1">
                          Studio Access:
                        </p>
                        <ul className="text-xs text-blue-700 space-y-0.5">
                          <li>• Private studio space</li>
                          <li>• Bring your own decorations & activities</li>
                          <li>• Add food & drinks below</li>
                        </ul>
                      </div>

                      {/* DIY Add-ons */}
                      {(booking.selectedFoodAddons ||
                        booking.selectedSweetAddons ||
                        booking.selectedDrinkAddons) && (
                        <div className="bg-amber-50 p-2 rounded">
                          <p className="text-xs font-medium text-amber-800 mb-1">
                            + Selected Items:
                          </p>
                          <ul className="text-xs text-amber-700 space-y-0.5">
                            {booking.selectedFoodAddons &&
                              Object.entries(booking.selectedFoodAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>
                                    • {name} (×{String(qty)})
                                  </li>
                                ))}
                            {booking.selectedSweetAddons &&
                              Object.entries(booking.selectedSweetAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>
                                    • {name} (×{String(qty)})
                                  </li>
                                ))}
                            {booking.selectedDrinkAddons &&
                              Object.entries(booking.selectedDrinkAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>
                                    • {name} (×{String(qty)})
                                  </li>
                                ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-700">
                        ⭐ {selectedStars}-Star Package (up to 12 guests)
                      </h4>

                      {/* Included Items */}
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs font-medium text-green-800 mb-1">
                          ✓ Included:
                        </p>
                        <ul className="text-xs text-green-700 space-y-0.5">
                          <li>• 2-hour party celebration</li>
                          <li>• Dedicated party host</li>
                          <li>• All party supplies & decorations</li>
                          <li>• Themed activities & games</li>
                          {selectedStars >= 2 && (
                            <li>• Photo booth with props</li>
                          )}
                          {selectedStars >= 3 && (
                            <li>• Professional face painting</li>
                          )}
                          {selectedStars >= 4 && <li>• Character visit</li>}
                          {selectedStars >= 5 && <li>• DJ & sound system</li>}
                        </ul>
                      </div>

                      {/* Selected Activities */}
                      {(booking.selectedStandardActivities?.length > 0 ||
                        booking.selectedPremiumActivities?.length > 0) && (
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs font-medium text-blue-800 mb-1">
                            🎨 Selected Activities:
                          </p>
                          <ul className="text-xs text-blue-700 space-y-0.5">
                            {booking.selectedPremiumActivities?.map(
                              (activity: string) => (
                                <li key={activity}>• {activity} (Premium)</li>
                              ),
                            )}
                            {booking.selectedStandardActivities?.map(
                              (activity: string) => (
                                <li key={activity}>• {activity}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Extra Add-ons */}
                      {(booking.selectedFoodAddons ||
                        booking.selectedSweetAddons ||
                        booking.selectedDrinkAddons) && (
                        <div className="bg-amber-50 p-2 rounded">
                          <p className="text-xs font-medium text-amber-800 mb-1">
                            + Extra Items:
                          </p>
                          <ul className="text-xs text-amber-700 space-y-0.5">
                            {booking.selectedFoodAddons &&
                              Object.entries(booking.selectedFoodAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>
                                    • {name} (×{String(qty)})
                                  </li>
                                ))}
                            {booking.selectedSweetAddons &&
                              Object.entries(booking.selectedSweetAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>
                                    • {name} (×{String(qty)})
                                  </li>
                                ))}
                            {booking.selectedDrinkAddons &&
                              Object.entries(booking.selectedDrinkAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>
                                    • {name} (×{String(qty)})
                                  </li>
                                ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Conditional Pricing Display - Hidden until agreement accepted */}
                  {!contactData.agreeToCommunications ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 text-sm">
                        Fill out contact info and accept terms below to see
                        final pricing
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Pricing Breakdown */}
                      <div className="space-y-2 text-sm">
                        {booking.partyType === "diy" ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Studio Rental (
                                {booking.rentalDuration === "all-day"
                                  ? "All Day"
                                  : `${booking.rentalDuration || "3"} hrs`}
                                )
                              </span>
                              <span className="font-semibold">
                                {formatPrice(pricing.basePrice)}
                              </span>
                            </div>

                            {/* DIY Food Add-ons */}
                            {booking.selectedDIYFood &&
                              Array.isArray(booking.selectedDIYFood) &&
                              booking.selectedDIYFood.map(
                                (addon: DIYAddon, index: number) => (
                                  <div
                                    key={`food-${index}`}
                                    className="flex justify-between"
                                  >
                                    <span className="text-gray-600">
                                      {addon.icon} {addon.name}
                                    </span>
                                    <span className="font-semibold">
                                      +{formatPrice(addon.price)}
                                    </span>
                                  </div>
                                ),
                              )}

                            {/* DIY Drink Add-ons */}
                            {booking.selectedDIYDrinks &&
                              Array.isArray(booking.selectedDIYDrinks) &&
                              booking.selectedDIYDrinks.map(
                                (addon: DIYAddon, index: number) => (
                                  <div
                                    key={`drink-${index}`}
                                    className="flex justify-between"
                                  >
                                    <span className="text-gray-600">
                                      {addon.icon} {addon.name}
                                    </span>
                                    <span className="font-semibold">
                                      +{formatPrice(addon.price)}
                                    </span>
                                  </div>
                                ),
                              )}

                            {/* DIY Extra Add-ons */}
                            {booking.selectedDIYExtras &&
                              Array.isArray(booking.selectedDIYExtras) &&
                              booking.selectedDIYExtras.map(
                                (addon: DIYAddon, index: number) => (
                                  <div
                                    key={`extra-${index}`}
                                    className="flex justify-between"
                                  >
                                    <span className="text-gray-600">
                                      {addon.icon} {addon.name}
                                    </span>
                                    <span className="font-semibold">
                                      +{formatPrice(addon.price)}
                                    </span>
                                  </div>
                                ),
                              )}
                          </>
                        ) : (
                          <>
                            {(() => {
                              // Find the selected package from database
                              const selectedPackage = allPackages?.find(
                                (pkg: any) => {
                                  const pkgName = pkg.name
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, "");
                                  return (
                                    pkgName.includes(`${selectedStars}star`) ||
                                    pkgName.includes(`star${selectedStars}`)
                                  );
                                },
                              );

                              const packageBasePrice =
                                selectedPackage?.basePrice || 0;
                              const maxGuests =
                                selectedPackage?.maxGuests || 10;
                              const guestCount = booking.guestCount || 0;
                              const additionalGuests = Math.max(
                                0,
                                guestCount - maxGuests,
                              );

                              // Calculate per-guest price based on star level
                              let perGuestPrice = 35;
                              if (selectedStars === 1 || selectedStars === 2) {
                                perGuestPrice = 35;
                              } else if (
                                selectedStars === 3 ||
                                selectedStars === 4
                              ) {
                                perGuestPrice = 45;
                              } else if (selectedStars === 5) {
                                perGuestPrice = 50;
                              }

                              // Calculate theme price if applicable
                              let themePrice = 0;
                              if (
                                booking.partyTheme &&
                                booking.partyTheme !== "no-thanks"
                              ) {
                                const selectedThemeData = allThemes?.find(
                                  (t: any) => t.name === booking.partyTheme,
                                );
                                themePrice = selectedThemeData?.price || 0;
                              }

                              return (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      {selectedStars}-Star Package
                                    </span>
                                    <span className="font-semibold">
                                      {formatPrice(packageBasePrice)}
                                    </span>
                                  </div>
                                  {themePrice > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Party Theme
                                      </span>
                                      <span className="font-semibold">
                                        +{formatPrice(themePrice)}
                                      </span>
                                    </div>
                                  )}
                                  {additionalGuests > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Additional guests ({additionalGuests})
                                      </span>
                                      <span className="font-semibold">
                                        +
                                        {formatPrice(
                                          additionalGuests * perGuestPrice,
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </>
                        )}

                        {/* Individual Add-on Pricing */}
                        {allAddons && (
                          <>
                            {booking.selectedFoodAddons &&
                              Object.entries(booking.selectedFoodAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => {
                                  const foodPrices: Record<string, number> = {
                                    "Fruit Tray": 45,
                                    "Tray of Chicken Fingers": 65,
                                    "Tray of French Fries": 35,
                                    "Regular Pizza (Adults)": 28,
                                    "Specialty Pizza": 35,
                                    "Popcorn Bar": 75,
                                    "Charcuterie Board": 75,
                                  };

                                  const addon = allAddons.find(
                                    (a: any) => a.name === name,
                                  );
                                  const itemPrice = addon
                                    ? addon.per_guest
                                      ? (addon.price *
                                          (booking.guestCount || 10) *
                                          Number(qty)) /
                                        100
                                      : (addon.price * Number(qty)) / 100
                                    : (foodPrices[name] || 0) * Number(qty);

                                  return (
                                    <div
                                      key={name}
                                      className="flex justify-between"
                                    >
                                      <span className="text-gray-600">
                                        {name}{" "}
                                        {Number(qty) > 1 ? `(×${qty})` : ""}
                                      </span>
                                      <span className="font-semibold">
                                        +{formatPrice(itemPrice)}
                                      </span>
                                    </div>
                                  );
                                })}
                            {booking.selectedSweetAddons &&
                              Object.entries(booking.selectedSweetAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => {
                                  const sweetPrices: Record<string, number> = {
                                    Macarons: 24,
                                    "Chocolate Covered Pretzels": 18,
                                    "Chocolate Covered Rice Krispies": 20,
                                    "Decorated Sugar Cookies": 30,
                                    "Candy Wall": 200,
                                    "Custom Treat Table": 150,
                                  };

                                  const addon = allAddons.find(
                                    (a: any) => a.name === name,
                                  );
                                  const itemPrice = addon
                                    ? addon.per_guest
                                      ? (addon.price *
                                          (booking.guestCount || 10) *
                                          Number(qty)) /
                                        100
                                      : (addon.price * Number(qty)) / 100
                                    : (sweetPrices[name] || 0) * Number(qty);

                                  return (
                                    <div
                                      key={name}
                                      className="flex justify-between"
                                    >
                                      <span className="text-gray-600">
                                        {name}{" "}
                                        {Number(qty) > 1 ? `(×${qty})` : ""}
                                      </span>
                                      <span className="font-semibold">
                                        +{formatPrice(itemPrice)}
                                      </span>
                                    </div>
                                  );
                                })}
                            {booking.selectedDrinkAddons &&
                              Object.entries(booking.selectedDrinkAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => {
                                  const drinkPrices: Record<string, number> = {
                                    "Soda & Seltzers Package": 75,
                                    "Bubbles Drink Package": 75,
                                    "Coffee Bar": 75,
                                  };

                                  const addon = allAddons.find(
                                    (a: any) => a.name === name,
                                  );
                                  const itemPrice = addon
                                    ? addon.per_guest
                                      ? (addon.price *
                                          (booking.guestCount || 10) *
                                          Number(qty)) /
                                        100
                                      : (addon.price * Number(qty)) / 100
                                    : (drinkPrices[name] || 0) * Number(qty);

                                  return (
                                    <div
                                      key={name}
                                      className="flex justify-between"
                                    >
                                      <span className="text-gray-600">
                                        {name}{" "}
                                        {Number(qty) > 1 ? `(×${qty})` : ""}
                                      </span>
                                      <span className="font-semibold">
                                        +{formatPrice(itemPrice)}
                                      </span>
                                    </div>
                                  );
                                })}
                            {booking.selectedPartyExtras &&
                              Object.entries(booking.selectedPartyExtras)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => {
                                  const partyExtrasPrices: Record<
                                    string,
                                    number
                                  > = {
                                    "Goodie Bags": 8,
                                    "Premium Goodie Bags": 15,
                                    "Balloon Tower": 95,
                                    "Balloon Garland 6ft": 95,
                                    "Balloon Arch": 195,
                                    "Marquee Number": 50,
                                    "Curated Birthday Gift": 25,
                                  };

                                  const addon = allAddons.find(
                                    (a: any) => a.name === name,
                                  );
                                  const itemPrice = addon
                                    ? addon.per_guest
                                      ? (addon.price *
                                          (booking.guestCount || 10) *
                                          Number(qty)) /
                                        100
                                      : (addon.price * Number(qty)) / 100
                                    : (partyExtrasPrices[name] || 0) *
                                      Number(qty);

                                  return (
                                    <div
                                      key={name}
                                      className="flex justify-between"
                                    >
                                      <span className="text-gray-600">
                                        {name}{" "}
                                        {Number(qty) > 1 ? `(×${qty})` : ""}
                                      </span>
                                      <span className="font-semibold">
                                        +{formatPrice(itemPrice)}
                                      </span>
                                    </div>
                                  );
                                })}
                          </>
                        )}

                        <Separator />

                        {/* Subtotal */}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">
                            {formatPrice(pricing.total)}
                          </span>
                        </div>

                        {/* Sales Tax (8.75% for NY) */}
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Sales Tax (8.75%)
                          </span>
                          <span className="font-semibold">
                            +{formatPrice(pricing.total * 0.0875)}
                          </span>
                        </div>

                        {/* Security Deposit (DIY only) */}
                        {booking.partyType === "diy" && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Security Deposit{" "}
                              <span className="text-xs">
                                * fully refundable
                              </span>
                            </span>
                            <span className="font-semibold">
                              +{formatPrice(200)}
                            </span>
                          </div>
                        )}

                        <Separator />

                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Party Cost</span>
                          <span className="text-purple-600">
                            {formatPrice(
                              pricing.total +
                                pricing.total * 0.0875 +
                                (booking.partyType === "diy" ? 200 : 0),
                            )}
                          </span>
                        </div>

                        {/* Deposit and Balance Due */}
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Deposit to Secure Reservation
                            </span>
                            <span className="font-semibold text-purple-600">
                              {formatPrice(200)}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Balance Due
                              {booking.eventDate &&
                                ` by ${(() => {
                                  const partyDate = new Date(booking.eventDate);
                                  const dueDate = new Date(partyDate);
                                  dueDate.setDate(partyDate.getDate() - 2);
                                  return dueDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  });
                                })()}`}
                            </span>
                            <span className="font-semibold">
                              {formatPrice(
                                pricing.total +
                                  pricing.total * 0.0875 +
                                  (booking.partyType === "diy" ? 200 : 0) -
                                  200,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Secure Your Reservation Section */}
                      <div className="bg-purple-50 p-4 rounded-lg mt-4">
                        <h4 className="font-semibold text-purple-900 mb-2">
                          Secure Your Reservation
                        </h4>
                        <p className="text-sm text-purple-700 mb-4">
                          Pay a {formatPrice(depositAmount)} deposit to lock in
                          your party date. The remaining balance will be due on
                          the day of your event.
                        </p>
                        <div className="space-y-2">
                          <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={handleDepositPayment}
                            disabled={depositMutation.isPending}
                            data-testid="button-pay-deposit"
                          >
                            {depositMutation.isPending
                              ? "Processing..."
                              : `Pay ${formatPrice(depositAmount)} Deposit`}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                            onClick={handleSaveQuote}
                            disabled={saveQuoteMutation.isPending || sendQuoteEmailMutation.isPending}
                            data-testid="button-save-quote"
                          >
                            {saveQuoteMutation.isPending || sendQuoteEmailMutation.isPending
                              ? "Saving..."
                              : "Save as Quote"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 text-center mt-3">
                          * All billing details and agreements are required to
                          proceed
                        </p>
                        <div className="text-xs text-gray-500 text-center mt-3 space-y-1">
                          <p>
                            • Deposits are fully refundable up to 48 hours
                            before your event
                          </p>
                          <p>• You can modify party details after booking</p>
                          <p>
                            • Need help? Contact us at hosthampton295@gmail.com
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
