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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, Users, MapPin, CreditCard, User, Phone, Mail, Palette, Sparkles, DollarSign, Star, Plus, Minus } from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";

// Helper function to get ordinal suffix
function getOrdinalSuffix(num: number): string {
  if (num >= 11 && num <= 13) return 'th';
  switch (num % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
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
    price: 0, // Base pricing is handled separately ($875/$950)
    maxGuests: 10,
    premiumActivities: 1,
    standardActivities: 2, // Can choose 1 premium + 1 standard OR 3 standard
    foodBudget: 0,
    description: "Includes birthday child + 10 guests, exclusive studio use, theme decorated, personalized evite, boho table, juice/water, cupcakes, treat cart, pizza or bagels",
    includes: ["Exclusive Studio Use", "Theme Decorated", "Personalized Evite", "Boho Table", "Honest Juice Boxes & Mini Waters", "Cupcakes", "Treat Cart", "Pizza or Bagels", "2 Activities (1 Premium + 1 Standard OR 3 Standard)"]
  },
  star2: {
    name: "2-Star Package",
    price: 350,
    maxGuests: 13,
    premiumActivities: 1,
    standardActivities: 2,
    foodBudget: 0,
    description: "All 1-star plus goody bags and photo booth",
    includes: ["All from 1-Star", "Goody Bags", "Photo Booth", "Up to 13 Guests"]
  },
  star3: {
    name: "3-Star Package", 
    price: 695,
    maxGuests: 14,
    premiumActivities: 2, // Can upgrade to premium or add standard
    standardActivities: 2,
    foodBudget: 0,
    description: "All 2-star plus balloon budget, gift basket, and activity upgrade",
    includes: ["All from 2-Star", "Upgrade to Premium Activity or Add Standard", "Balloon Budget", "Gift Basket for Birthday Child", "Up to 14 Guests"]
  },
  star4: {
    name: "4-Star Package",
    price: 925,
    maxGuests: 15,
    premiumActivities: 2,
    standardActivities: 2,
    foodBudget: 100,
    description: "All 3-star plus premium goody bags, balloon tower, custom balloon stack, and $100 food budget",
    includes: ["All from 3-Star", "Premium Goody Bags", "Balloon Tower", "Balloon Custom Stack", "$100 Food/Drink/Dessert Budget", "Up to 15 Guests"]
  },
  star5: {
    name: "5-Star Package",
    price: 1375,
    maxGuests: 16,
    premiumActivities: 2,
    standardActivities: 2,
    foodBudget: 200,
    description: "Ultimate package with all features plus balloon garland, themed treat table, and $200 food budget",
    includes: ["All from 4-Star", "Balloon Garland", "Themed Custom Treat Table", "$200 Food/Drink/Dessert Budget", "Up to 16 Guests"]
  }
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
  const [showBillingInfo, setShowBillingInfo] = useState(false);
  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    agreeToTerms: false,
    agreeToCommunications: false
  });

  // Fetch lead/booking data
  const { data: booking, isLoading } = useQuery({
    queryKey: ["/api/leads", effectiveLeadId],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${effectiveLeadId}`);
      const data = await response.json();
      return data.success ? data.lead : null;
    },
    enabled: !!effectiveLeadId
  });

  // Fetch all available add-ons for editing
  const { data: allAddons } = useQuery({
    queryKey: ["/api/addons"],
    queryFn: async () => {
      const response = await fetch("/api/addons");
      const data = await response.json();
      return data.success ? data.addons : [];
    }
  });

  // Fetch all themes for editing
  const { data: allThemes } = useQuery({
    queryKey: ["/api/party-themes"],
    queryFn: async () => {
      const response = await fetch("/api/party-themes");
      const data = await response.json();
      return data.success ? data.themes : [];
    }
  });

  // Fetch all packages for editing
  const { data: allPackages } = useQuery({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const response = await fetch("/api/packages");
      const data = await response.json();
      return data.success ? data.packages : [];
    }
  });

  // Update booking mutation - NO QUERY INVALIDATION to prevent re-renders during typing
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", `/api/leads/${effectiveLeadId}`, updates);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the cache directly instead of invalidating to prevent re-renders
      queryClient.setQueryData(["/api/leads", effectiveLeadId], (oldData: any) => {
        if (oldData) {
          return { ...oldData, ...variables };
        }
        return oldData;
      });
      // Silent update - no toast notifications
    },
    onError: () => {
      toast({
        title: "Update Failed", 
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Separate timeout refs for different fields to prevent interference
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout | null>>({});
  
  // Immediate update for non-text fields
  const handleRealTimeUpdate = (field: string, value: any) => {
    updateMutation.mutate({ [field]: value });
  };
  
  // Debounced update for text inputs with local state update for immediate UI feedback
  const handleTextInputUpdate = (field: string, value: any) => {
    // Update local cache immediately for UI responsiveness
    queryClient.setQueryData(["/api/leads", effectiveLeadId], (oldData: any) => {
      if (oldData) {
        return { ...oldData, [field]: value };
      }
      return oldData;
    });
    
    // Clear existing timeout for this specific field
    if (timeoutRefs.current[field]) {
      clearTimeout(timeoutRefs.current[field]!);
    }
    
    // Set new timeout for server sync
    timeoutRefs.current[field] = setTimeout(() => {
      updateMutation.mutate({ [field]: value });
      timeoutRefs.current[field] = null;
    }, 2000); // 2 second debounce for text inputs
  };

  // Cleanup effect to clear all timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Stripe deposit payment mutation
  const depositMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/create-deposit-payment", {
        leadId: parseInt(effectiveLeadId!),
        amount: 20000, // $200 deposit
        bookingData
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
    }
  });

  // Calculate pricing
  const calculatePricing = () => {
    if (!booking) return { basePrice: 850, packagePrice: 0, addonsTotal: 0, total: 850 };

    // Check if DIY (Studio Rental) or Full Service
    const isDIY = booking.partyType === 'diy';
    let basePrice = 0;

    if (!isDIY) {
      // Full Service - Star-level pricing structure
      const isCustom = booking.partyTheme === 'custom';
      const starPrices = {
        1: isCustom ? 950 : 850,
        2: isCustom ? 1350 : 1250,
        3: isCustom ? 1650 : 1550,
        4: isCustom ? 1900 : 1800,
        5: isCustom ? 2325 : 2225
      };

      // Get star level from package selection
      const packageKey = booking.packageSelection?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      let starLevel = 1; // Default
      if (packageKey.includes('1star') || packageKey.includes('star1')) starLevel = 1;
      else if (packageKey.includes('2star') || packageKey.includes('star2')) starLevel = 2;
      else if (packageKey.includes('3star') || packageKey.includes('star3')) starLevel = 3;
      else if (packageKey.includes('4star') || packageKey.includes('star4')) starLevel = 4;
      else if (packageKey.includes('5star') || packageKey.includes('star5')) starLevel = 5;
      
      basePrice = starPrices[starLevel as keyof typeof starPrices];
    } else {
      // DIY (Studio Rental) - base price is 0, only add-ons
      basePrice = 0;
    }

    // Calculate add-ons total from new structure
    let addonsTotal = 0;
    
    // Food add-ons
    const foodPrices = {
      'Fruit Tray': 45,
      'Tray of Chicken Fingers': 65, 
      'Tray of French Fries': 35,
      'Regular Pizza (Adults)': 28,
      'Specialty Pizza': 35,
      'Popcorn Bar': 75
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
      'Macarons': 24,
      'Chocolate Covered Pretzels': 18,
      'Chocolate Covered Rice Krispies': 20, 
      'Decorated Sugar Cookies': 30,
      'Candy Wall': 200,
      'Custom Treat Table': 150
    };
    if (booking.selectedSweetAddons) {
      Object.entries(booking.selectedSweetAddons).forEach(([name, quantity]) => {
        const qty = Number(quantity);
        if (qty > 0 && sweetPrices[name as keyof typeof sweetPrices]) {
          addonsTotal += sweetPrices[name as keyof typeof sweetPrices] * qty;
        }
      });
    }

    // Drink add-ons
    const drinkPrices = {
      'Bubbles Drink Package': 75,
      'Coffee Bar': 75,
      'Drinks Package': 50
    };
    if (booking.selectedDrinkAddons) {
      Object.entries(booking.selectedDrinkAddons).forEach(([name, quantity]) => {
        const qty = Number(quantity);
        if (qty > 0 && drinkPrices[name as keyof typeof drinkPrices]) {
          addonsTotal += drinkPrices[name as keyof typeof drinkPrices] * qty;
        }
      });
    }

    // Legacy selectedAddons - DISABLED to prevent massive pricing issues
    // The new system uses selectedFoodAddons, selectedSweetAddons, selectedDrinkAddons instead

    const total = basePrice + addonsTotal;

    return { basePrice: basePrice, packagePrice: 0, addonsTotal, total };
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
      const packageKey = booking.packageSelection?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      if (packageKey.includes('1star') || packageKey.includes('star1')) setSelectedStars(1);
      else if (packageKey.includes('2star') || packageKey.includes('star2')) setSelectedStars(2);
      else if (packageKey.includes('3star') || packageKey.includes('star3')) setSelectedStars(3);
      else if (packageKey.includes('4star') || packageKey.includes('star4')) setSelectedStars(4);
      else if (packageKey.includes('5star') || packageKey.includes('star5')) setSelectedStars(5);
      else setSelectedStars(1); // Default to 1-star
      
      setBillingData({
        firstName: booking.name?.split(' ')[0] || '',
        lastName: booking.name?.split(' ').slice(1).join(' ') || '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: booking.phone || '',
        email: booking.email || '',
        agreeToTerms: false,
        agreeToCommunications: false
      });
    }
  }, [booking]);

  // Validation function
  const validateRequiredFields = () => {
    const missingFields: string[] = [];
    if (!billingData.firstName.trim()) missingFields.push('firstName');
    if (!billingData.lastName.trim()) missingFields.push('lastName');
    if (!billingData.address.trim()) missingFields.push('address');
    if (!billingData.city.trim()) missingFields.push('city');
    if (!billingData.state.trim()) missingFields.push('state');
    if (!billingData.zipCode.trim()) missingFields.push('zipCode');
    if (!billingData.phone.trim()) missingFields.push('phone');
    if (!billingData.email.trim()) missingFields.push('email');
    if (!billingData.agreeToTerms) missingFields.push('agreeToTerms');
    if (!billingData.agreeToCommunications) missingFields.push('agreeToCommunications');
    return missingFields;
  };

  const handleDepositPayment = () => {
    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate(billingData);
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
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-600">Booking not found.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/get-quote'}>
              Create New Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={hostHamptonLogo} alt="Host Hampton" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Design Your Party</h1>
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
                {/* Child Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Child's First Name</Label>
                      <Input
                        value={booking.childName || ''}
                        onChange={(e) => handleTextInputUpdate('childName', e.target.value)}
                        className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500 text-sm"
                        placeholder="Enter child's name"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Age</Label>
                      <Input
                        type="number"
                        min="1"
                        max="18"
                        value={booking.childAge || ''}
                        onChange={(e) => handleRealTimeUpdate('childAge', parseInt(e.target.value))}
                        className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500 text-sm"
                        placeholder="Age"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Date & Time
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Event Date</Label>
                      <Input
                        type="date"
                        value={booking.eventDate ? booking.eventDate.split('T')[0] : ''}
                        onChange={(e) => handleRealTimeUpdate('eventDate', e.target.value)}
                        className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Time Slot</Label>
                      <Select value={booking.timeSlot || ''} onValueChange={(value) => handleRealTimeUpdate('timeSlot', value)}>
                        <SelectTrigger className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          <SelectItem value="10am-12pm">10am - 12pm</SelectItem>
                          <SelectItem value="1pm-3pm">1pm - 3pm</SelectItem>
                          <SelectItem value="4pm-6pm">4pm - 6pm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Guest Count & Location */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Party Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Guest Count</Label>
                      <Input
                        type="number"
                        min="1"
                        value={booking.guestCount || ''}
                        onChange={(e) => handleRealTimeUpdate('guestCount', parseInt(e.target.value))}
                        className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500"
                        placeholder="Number of guests"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Location</Label>
                      <Select value={booking.eventLocation || 'studio'} onValueChange={(value) => handleRealTimeUpdate('eventLocation', value)}>
                        <SelectTrigger className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500">
                          <SelectValue placeholder="Choose location" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          <SelectItem value="studio">Host Hampton Studio</SelectItem>
                          <SelectItem value="mobile">Mobile (Your Address)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {booking.eventLocation === 'mobile' && (
                    <div className="mt-2">
                      <Label className="text-sm font-semibold text-gray-700">Mobile Address</Label>
                      <Input
                        value={booking.mobileAddress || ''}
                        onChange={(e) => handleTextInputUpdate('mobileAddress', e.target.value)}
                        className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500"
                        placeholder="Enter your full address"
                      />
                    </div>
                  )}
                </div>

                {/* DIY vs Full Service Choice */}
                <div className="space-y-4 border-t-2 border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-800 text-lg">Choose Your Party Style</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => handleRealTimeUpdate('partyType', 'diy')}
                      className={`border-2 p-4 cursor-pointer transition-all ${
                        booking.partyType === 'diy'
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🎨</div>
                        <h4 className="font-semibold text-gray-800 mb-1">DIY (Studio Rental)</h4>
                        <p className="text-xs text-gray-600">You handle the activities & setup</p>
                      </div>
                    </div>
                    <div
                      onClick={() => handleRealTimeUpdate('partyType', 'full-service')}
                      className={`border-2 p-4 cursor-pointer transition-all ${
                        booking.partyType === 'full-service'
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">✨</div>
                        <h4 className="font-semibold text-gray-800 mb-1">Let Us Handle It!</h4>
                        <p className="text-xs text-gray-600">Full-service party with activities</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Party Theme
                  </h3>
                  
                  {/* DIY decor option text */}
                  {booking.partyType === 'diy' && (
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      Want us to decorate? Select a theme and we'll set it up for you!
                    </p>
                  )}
                  
                  {!selectedTheme ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allThemes?.map((theme: any) => (
                        <div
                          key={theme.id}
                          onClick={() => {
                            setSelectedTheme(theme.name);
                            handleRealTimeUpdate('partyTheme', theme.name);
                          }}
                          className="border-2 border-gray-200 p-3 cursor-pointer transition-all hover:border-purple-400 bg-white hover:bg-gray-50 min-h-[60px] flex items-center"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="text-2xl">{theme.icon}</div>
                            <div className="text-sm font-medium text-gray-700 flex-1">{theme.name}</div>
                          </div>
                        </div>
                      ))}
                      <div 
                        className="border-2 border-gray-200 p-3 cursor-pointer transition-all hover:border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 min-h-[60px] flex items-center"
                        onClick={() => {
                          setSelectedTheme('custom');
                          handleRealTimeUpdate('partyTheme', 'custom');
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="text-2xl">✨</div>
                          <div className="text-sm font-medium text-gray-700 flex-1">Custom Theme</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-purple-500 bg-purple-50 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {selectedTheme === 'custom' ? '✨' : allThemes?.find((t: any) => t.name === selectedTheme)?.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {selectedTheme === 'custom' ? 'Custom Theme' : selectedTheme}
                            </div>
                            {selectedTheme === 'custom' && (
                              <Input
                                value={booking.customTheme || ''}
                                onChange={(e) => handleTextInputUpdate('customTheme', e.target.value)}
                                className="mt-2 border-2 border-gray-200 rounded-none focus:border-purple-500"
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
                {booking.partyType === 'full-service' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Package Level</h3>
                  
                  {/* 5-Star Horizontal Rating */}
                  <div className="flex items-center justify-center gap-2 py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setSelectedStars(star);
                          const starKeys = ['star1', 'star2', 'star3', 'star4', 'star5'];
                          const selectedPackageKey = starKeys[star - 1];
                          const selectedPackage = packageDefinitions[selectedPackageKey as keyof typeof packageDefinitions];
                          if (selectedPackage) {
                            handleRealTimeUpdate('packageSelection', selectedPackage.name);
                          }
                        }}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          star <= selectedStars 
                            ? 'border-purple-500 bg-purple-500 text-white' 
                            : 'border-gray-300 bg-white text-gray-400 hover:border-purple-300'
                        }`}
                      >
                        <Star className={`w-6 h-6 mx-auto ${star <= selectedStars ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>

                  {/* Package Details & Add-ons Below Stars */}
                  {selectedStars > 0 && selectedStars <= 5 && (
                    <div className="space-y-4">
                      {/* Package Summary */}
                      <div className="border-2 border-purple-500 bg-purple-50 p-4">
                        {(() => {
                          const starKeys = ['star1', 'star2', 'star3', 'star4', 'star5'];
                          const selectedPackageKey = starKeys[selectedStars - 1];
                          const selectedPackage = packageDefinitions[selectedPackageKey as keyof typeof packageDefinitions];
                          return (
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <div className="font-medium text-gray-800">{selectedPackage.name}</div>
                                <div className="text-lg font-bold text-purple-600">
                                  {selectedPackage.price > 0 ? `+${formatPrice(selectedPackage.price)}` : 'Base Package'}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                Up to {selectedPackage.maxGuests} guests
                                {selectedPackage.premiumActivities > 0 && ` • ${selectedPackage.premiumActivities} premium activities`}
                                {selectedPackage.standardActivities > 0 && ` • ${selectedPackage.standardActivities} standard activities`}
                                {selectedPackage.foodBudget && ` • $${selectedPackage.foodBudget} food budget`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {selectedPackage.description}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Structured Activity & Food Selection */}
                      <div className="space-y-4">
                        {(() => {
                          const starKeys = ['star1', 'star2', 'star3', 'star4', 'star5'];
                          const selectedPackageKey = starKeys[selectedStars - 1];
                          const selectedPackage = packageDefinitions[selectedPackageKey as keyof typeof packageDefinitions];
                          
                          // Get currently selected activities
                          const currentPremiumActivities = booking.selectedPremiumActivities || [];
                          const currentStandardActivities = booking.selectedStandardActivities || [];
                          const currentFood = booking.selectedFood || 'pizza';
                          const currentCupcakeFlavor = booking.selectedCupcakeFlavor || 'vanilla';
                          const hasChickenUpgrade = booking.hasChickenUpgrade || false;

                          const premiumActivitiesData = allAddons?.filter((addon: any) => 
                            addon.category === 'premium activity'
                          ) || [];
                          
                          const standardActivitiesData = allAddons?.filter((addon: any) => 
                            addon.category === 'activity'
                          ) || [];

                          const premiumQuotaReached = currentPremiumActivities.length >= selectedPackage.premiumActivities;
                          const standardQuotaReached = currentStandardActivities.length >= selectedPackage.standardActivities;

                          return (
                            <>
                              {/* Premium Activities Section */}
                              {selectedPackage.premiumActivities > 0 && (
                                <div className="border-2 border-gray-200 p-4">
                                  <h4 className="font-medium text-gray-800 mb-2">
                                    Select Premium Activities ({currentPremiumActivities.length}/{selectedPackage.premiumActivities})
                                  </h4>
                                  
                                  {premiumQuotaReached ? (
                                    <div className="space-y-2">
                                      <p className="text-sm text-green-600 mb-2">✓ Premium activity selection complete</p>
                                      {currentPremiumActivities.map((activityName: string) => {
                                        const activity = premiumActivitiesData.find((a: any) => a.name === activityName);
                                        if (!activity) return null;
                                        return (
                                          <div key={activity.id} className="border-2 border-green-500 bg-green-50 p-3">
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-2">
                                                <span className="text-lg">{activity.icon}</span>
                                                <span className="font-medium">{activity.name}</span>
                                              </div>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  const updated = currentPremiumActivities.filter((name: string) => name !== activity.name);
                                                  handleRealTimeUpdate('selectedPremiumActivities', updated);
                                                }}
                                              >
                                                Change
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      {premiumActivitiesData.map((addon: any) => {
                                        const isSelected = currentPremiumActivities.includes(addon.name);
                                        
                                        return (
                                          <div
                                            key={addon.id}
                                            onClick={() => {
                                              if (isSelected) {
                                                const updated = currentPremiumActivities.filter((name: string) => name !== addon.name);
                                                handleRealTimeUpdate('selectedPremiumActivities', updated);
                                              } else if (!premiumQuotaReached) {
                                                const updated = [...currentPremiumActivities, addon.name];
                                                handleRealTimeUpdate('selectedPremiumActivities', updated);
                                              }
                                            }}
                                            className={`border-2 p-3 cursor-pointer transition-all text-sm ${
                                              isSelected 
                                                ? 'border-purple-500 bg-purple-50' 
                                                : 'border-gray-200 bg-white hover:border-purple-300'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">{addon.icon}</span>
                                              <span className="font-medium">{addon.name}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Standard Activities Section */}
                              {selectedPackage.standardActivities > 0 && (
                                <div className="border-2 border-gray-200 p-4">
                                  <h4 className="font-medium text-gray-800 mb-2">
                                    Select Standard Activities ({currentStandardActivities.length}/{selectedPackage.standardActivities})
                                  </h4>
                                  
                                  {standardQuotaReached ? (
                                    <div className="space-y-2">
                                      <p className="text-sm text-green-600 mb-2">✓ Standard activity selection complete</p>
                                      {currentStandardActivities.map((activityName: string) => {
                                        const activity = standardActivitiesData.find((a: any) => a.name === activityName);
                                        if (!activity) return null;
                                        return (
                                          <div key={activity.id} className="border-2 border-green-500 bg-green-50 p-3">
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-2">
                                                <span className="text-lg">{activity.icon}</span>
                                                <span className="font-medium">{activity.name}</span>
                                              </div>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  const updated = currentStandardActivities.filter((name: string) => name !== activity.name);
                                                  handleRealTimeUpdate('selectedStandardActivities', updated);
                                                }}
                                              >
                                                Change
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      {standardActivitiesData.map((addon: any) => {
                                        const isSelected = currentStandardActivities.includes(addon.name);
                                        
                                        return (
                                          <div
                                            key={addon.id}
                                            onClick={() => {
                                              if (isSelected) {
                                                const updated = currentStandardActivities.filter((name: string) => name !== addon.name);
                                                handleRealTimeUpdate('selectedStandardActivities', updated);
                                              } else if (!standardQuotaReached) {
                                                const updated = [...currentStandardActivities, addon.name];
                                                handleRealTimeUpdate('selectedStandardActivities', updated);
                                              }
                                            }}
                                            className={`border-2 p-3 cursor-pointer transition-all text-sm ${
                                              isSelected 
                                                ? 'border-purple-500 bg-purple-50' 
                                                : 'border-gray-200 bg-white hover:border-purple-300'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">{addon.icon}</span>
                                              <span className="font-medium">{addon.name}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Food Selection */}
                              <div className="border-2 border-gray-200 p-4">
                                <h4 className="font-medium text-gray-800 mb-3">Food Selection</h4>
                                
                                {/* Base Food Selection */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                  <div
                                    onClick={() => handleRealTimeUpdate('selectedFood', 'pizza')}
                                    className={`border-2 p-3 cursor-pointer transition-all text-sm text-center ${
                                      currentFood === 'pizza'
                                        ? 'border-purple-500 bg-purple-50' 
                                        : 'border-gray-200 bg-white hover:border-purple-300'
                                    }`}
                                  >
                                    <div className="font-medium">🍕 Pizza</div>
                                  </div>
                                  <div
                                    onClick={() => handleRealTimeUpdate('selectedFood', 'bagels')}
                                    className={`border-2 p-3 cursor-pointer transition-all text-sm text-center ${
                                      currentFood === 'bagels'
                                        ? 'border-purple-500 bg-purple-50' 
                                        : 'border-gray-200 bg-white hover:border-purple-300'
                                    }`}
                                  >
                                    <div className="font-medium">🥯 Bagels</div>
                                  </div>
                                </div>

                                {/* Food Add-ons */}
                                <div className="border-t pt-3">
                                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Add-ons:</h5>
                                  <div className="space-y-2">
                                    {[
                                      { name: 'Fruit Tray', icon: '🍓' },
                                      { name: 'Tray of Chicken Fingers', icon: '🍗' },
                                      { name: 'Tray of French Fries', icon: '🍟' },
                                      { name: 'Regular Pizza (Adults)', icon: '🍕' },
                                      { name: 'Specialty Pizza', icon: '🍕' },
                                      { name: 'Popcorn Bar', icon: '🍿' }
                                    ].map((addon) => {
                                      const currentFoodAddons = booking.selectedFoodAddons || {};
                                      const quantity = currentFoodAddons[addon.name] || 0;
                                      
                                      return (
                                        <div key={addon.name} className="flex items-center justify-between border-2 border-gray-200 p-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">{addon.icon}</span>
                                            <span className="text-sm font-medium">{addon.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                const updated = { ...currentFoodAddons };
                                                if (quantity > 0) {
                                                  updated[addon.name] = quantity - 1;
                                                  if (updated[addon.name] === 0) delete updated[addon.name];
                                                }
                                                handleRealTimeUpdate('selectedFoodAddons', updated);
                                              }}
                                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                            >
                                              <Minus className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center text-sm">{quantity}</span>
                                            <button
                                              onClick={() => {
                                                const updated = { ...currentFoodAddons, [addon.name]: quantity + 1 };
                                                handleRealTimeUpdate('selectedFoodAddons', updated);
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
                              <div className="border-2 border-gray-200 p-4">
                                <h4 className="font-medium text-gray-800 mb-3">Sweets & Treats</h4>
                                
                                {/* Base Cupcakes (Included) */}
                                <div className="mb-4">
                                  <p className="text-xs text-gray-600 mb-2">Included:</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['vanilla', 'chocolate'].map((flavor) => (
                                      <div
                                        key={flavor}
                                        onClick={() => handleRealTimeUpdate('selectedCupcakeFlavor', flavor)}
                                        className={`border-2 p-3 cursor-pointer transition-all text-sm text-center ${
                                          currentCupcakeFlavor === flavor 
                                            ? 'border-purple-500 bg-purple-50' 
                                            : 'border-gray-200 bg-white hover:border-purple-300'
                                        }`}
                                      >
                                        <div className="font-medium">
                                          {flavor === 'vanilla' ? '🧁' : '🍫'} {flavor.charAt(0).toUpperCase() + flavor.slice(1)} Cupcakes
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Sweet Add-ons */}
                                <div className="border-t pt-3">
                                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Add-ons:</h5>
                                  <div className="space-y-2">
                                    {[
                                      { name: 'Macarons', icon: '🧡' },
                                      { name: 'Chocolate Covered Pretzels', icon: '🥨' },
                                      { name: 'Chocolate Covered Rice Krispies', icon: '🍚' },
                                      { name: 'Decorated Sugar Cookies', icon: '🍪' },
                                      { name: 'Candy Wall', icon: '🍭' },
                                      { name: 'Custom Treat Table', icon: '🍰' }
                                    ].map((addon) => {
                                      const currentSweetAddons = booking.selectedSweetAddons || {};
                                      const quantity = currentSweetAddons[addon.name] || 0;
                                      
                                      return (
                                        <div key={addon.name} className="flex items-center justify-between border-2 border-gray-200 p-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">{addon.icon}</span>
                                            <span className="text-sm font-medium">{addon.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                const updated = { ...currentSweetAddons };
                                                if (quantity > 0) {
                                                  updated[addon.name] = quantity - 1;
                                                  if (updated[addon.name] === 0) delete updated[addon.name];
                                                }
                                                handleRealTimeUpdate('selectedSweetAddons', updated);
                                              }}
                                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                            >
                                              <Minus className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center text-sm">{quantity}</span>
                                            <button
                                              onClick={() => {
                                                const updated = { ...currentSweetAddons, [addon.name]: quantity + 1 };
                                                handleRealTimeUpdate('selectedSweetAddons', updated);
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

                              {/* Drinks Module */}
                              <div className="border-2 border-gray-200 p-4">
                                <h4 className="font-medium text-gray-800 mb-3">Drinks</h4>
                                
                                {/* Included Drinks */}
                                <div className="mb-4">
                                  <p className="text-xs text-gray-600 mb-2">Included:</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200">
                                      <span className="text-lg">🧃</span>
                                      <span className="text-sm font-medium">Honest Juice Boxes</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200">
                                      <span className="text-lg">💧</span>
                                      <span className="text-sm font-medium">Mini Water Bottles</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Drink Add-ons */}
                                <div className="border-t pt-3">
                                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Add-ons:</h5>
                                  <div className="space-y-2">
                                    {[
                                      { name: 'Bubbles Drink Package', icon: '🫧' },
                                      { name: 'Coffee Bar', icon: '☕' },
                                      { name: 'Drinks Package', icon: '💧' }
                                    ].map((addon) => {
                                      const currentDrinkAddons = booking.selectedDrinkAddons || {};
                                      const quantity = currentDrinkAddons[addon.name] || 0;
                                      
                                      return (
                                        <div key={addon.name} className="flex items-center justify-between border-2 border-gray-200 p-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">{addon.icon}</span>
                                            <span className="text-sm font-medium">{addon.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                const updated = { ...currentDrinkAddons };
                                                if (quantity > 0) {
                                                  updated[addon.name] = quantity - 1;
                                                  if (updated[addon.name] === 0) delete updated[addon.name];
                                                }
                                                handleRealTimeUpdate('selectedDrinkAddons', updated);
                                              }}
                                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-400 transition-colors"
                                            >
                                              <Minus className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center text-sm">{quantity}</span>
                                            <button
                                              onClick={() => {
                                                const updated = { ...currentDrinkAddons, [addon.name]: quantity + 1 };
                                                handleRealTimeUpdate('selectedDrinkAddons', updated);
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

                              {/* Allergy Module */}
                              <div className="border-2 border-gray-200 p-4">
                                <h4 className="font-medium text-gray-800 mb-3">Allergies & Dietary Restrictions</h4>
                                <div className="space-y-3">
                                  {['Gluten-Free', 'Dairy-Free', 'Nut Allergy'].map((allergy) => {
                                    const currentAllergies = booking.selectedAllergies || [];
                                    const isSelected = currentAllergies.includes(allergy);
                                    
                                    return (
                                      <div
                                        key={allergy}
                                        onClick={() => {
                                          const updated = isSelected 
                                            ? currentAllergies.filter((a: string) => a !== allergy)
                                            : [...currentAllergies, allergy];
                                          handleRealTimeUpdate('selectedAllergies', updated);
                                        }}
                                        className={`border-2 p-3 cursor-pointer transition-all text-sm text-center ${
                                          isSelected
                                            ? 'border-red-500 bg-red-50' 
                                            : 'border-gray-200 bg-white hover:border-red-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-center gap-2">
                                          <span className="text-lg">
                                            {allergy === 'Gluten-Free' ? '🌾' : 
                                             allergy === 'Dairy-Free' ? '🥛' : '🥜'}
                                          </span>
                                          <span className="font-medium">{allergy}</span>
                                          {isSelected && <span className="text-red-600">✓</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {(booking.selectedAllergies?.length > 0) && (
                                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-xs text-yellow-800">
                                      <strong>Note:</strong> Please notify us of any allergies when placing your order. 
                                      We'll ensure all food and activities are safe and suitable.
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
                    <Label htmlFor="contactFirstName" className="text-sm">First Name *</Label>
                    <Input
                      id="contactFirstName"
                      data-testid="input-first-name"
                      value={billingData.firstName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBillingData({...billingData, firstName: value});
                        handleTextInputUpdate('firstName', value);
                      }}
                      className="mt-1"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactLastName" className="text-sm">Last Name *</Label>
                    <Input
                      id="contactLastName"
                      data-testid="input-last-name"
                      value={billingData.lastName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBillingData({...billingData, lastName: value});
                        handleTextInputUpdate('lastName', value);
                      }}
                      className="mt-1"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="contactEmail" className="text-sm">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={billingData.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBillingData({...billingData, email: value});
                      handleTextInputUpdate('email', value);
                    }}
                    className="mt-1"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone" className="text-sm">Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={billingData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBillingData({...billingData, phone: value});
                      handleTextInputUpdate('phone', value);
                    }}
                    className="mt-1"
                    placeholder="(555) 555-5555"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="contactCommunications"
                    checked={billingData.agreeToCommunications}
                    onCheckedChange={(checked) => {
                      setBillingData({...billingData, agreeToCommunications: checked as boolean});
                      handleRealTimeUpdate('agreeToCommunications', checked);
                    }}
                  />
                  <Label htmlFor="contactCommunications" className="text-sm cursor-pointer">
                    I agree to receive communications about my event *
                  </Label>
                </div>
              </CardContent>
            </Card>
            
            {/* Pricing Summary - Sticky */}
            <div className="lg:sticky lg:top-4 z-10">
              <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Quotation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Party Details Header */}
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-bold text-purple-800">
                    {booking.childName || 'Child'} turning {booking.childAge || 'Age'} Birthday Party! 🎉
                  </h3>
                </div>

                {/* Party Information */}
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium">{booking.partyDate || 'To be scheduled'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-medium">{booking.partyTime || 'To be scheduled'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium">{booking.eventLocation === 'studio' ? 'Host Hampton Studio' : 'Mobile Service'}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Theme:</span>
                    <p className="font-medium">{selectedTheme || booking.partyTheme || 'To be selected'}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Expected Guests:</span>
                    <p className="font-medium">{booking.guestCount || 10} children</p>
                  </div>
                </div>

                <Separator />

                {/* Package/Service Details */}
                {booking.partyType === 'diy' ? (
                  <div className="space-y-2">
                        <h4 className="font-semibold text-purple-700">🎨 DIY Studio Rental</h4>
                        
                        {/* DIY Info */}
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs font-medium text-blue-800 mb-1">Studio Access:</p>
                          <ul className="text-xs text-blue-700 space-y-0.5">
                            <li>• Private studio space</li>
                            <li>• Bring your own decorations & activities</li>
                            <li>• Add food & drinks below</li>
                          </ul>
                        </div>

                        {/* DIY Add-ons */}
                        {(booking.selectedFoodAddons || booking.selectedSweetAddons || booking.selectedDrinkAddons) && (
                          <div className="bg-amber-50 p-2 rounded">
                            <p className="text-xs font-medium text-amber-800 mb-1">+ Selected Items:</p>
                            <ul className="text-xs text-amber-700 space-y-0.5">
                              {booking.selectedFoodAddons && Object.entries(booking.selectedFoodAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>• {name} (×{qty})</li>
                                ))}
                              {booking.selectedSweetAddons && Object.entries(booking.selectedSweetAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>• {name} (×{qty})</li>
                                ))}
                              {booking.selectedDrinkAddons && Object.entries(booking.selectedDrinkAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>• {name} (×{qty})</li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-purple-700">⭐ {selectedStars}-Star Package (up to 12 guests)</h4>
                        
                        {/* Included Items */}
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs font-medium text-green-800 mb-1">✓ Included:</p>
                          <ul className="text-xs text-green-700 space-y-0.5">
                            <li>• 2-hour party celebration</li>
                            <li>• Dedicated party host</li>
                            <li>• All party supplies & decorations</li>
                            <li>• Themed activities & games</li>
                            {selectedStars >= 2 && <li>• Photo booth with props</li>}
                            {selectedStars >= 3 && <li>• Professional face painting</li>}
                            {selectedStars >= 4 && <li>• Character visit</li>}
                            {selectedStars >= 5 && <li>• DJ & sound system</li>}
                          </ul>
                        </div>

                        {/* Selected Activities */}
                        {(booking.selectedStandardActivities?.length > 0 || booking.selectedPremiumActivities?.length > 0) && (
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-xs font-medium text-blue-800 mb-1">🎨 Selected Activities:</p>
                            <ul className="text-xs text-blue-700 space-y-0.5">
                              {booking.selectedPremiumActivities?.map((activity: string) => (
                                <li key={activity}>• {activity} (Premium)</li>
                              ))}
                              {booking.selectedStandardActivities?.map((activity: string) => (
                                <li key={activity}>• {activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Extra Add-ons */}
                        {(booking.selectedFoodAddons || booking.selectedSweetAddons || booking.selectedDrinkAddons) && (
                          <div className="bg-amber-50 p-2 rounded">
                            <p className="text-xs font-medium text-amber-800 mb-1">+ Extra Items:</p>
                            <ul className="text-xs text-amber-700 space-y-0.5">
                              {booking.selectedFoodAddons && Object.entries(booking.selectedFoodAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>• {name} (×{qty})</li>
                                ))}
                              {booking.selectedSweetAddons && Object.entries(booking.selectedSweetAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>• {name} (×{qty})</li>
                                ))}
                              {booking.selectedDrinkAddons && Object.entries(booking.selectedDrinkAddons)
                                .filter(([name, qty]) => Number(qty) > 0)
                                .map(([name, qty]) => (
                                  <li key={name}>• {name} (×{qty})</li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    {/* Pricing Breakdown */}
                    <div className="space-y-2 text-sm">
                      {booking.partyType === 'diy' ? (
                        <div className="flex justify-between">
                          <span className="text-gray-600">DIY Studio Rental</span>
                          <span className="font-semibold">Contact for pricing</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{selectedStars}-Star Package</span>
                          <span className="font-semibold">{formatPrice(pricing.basePrice)}</span>
                        </div>
                      )}
                      
                      {(booking.guestCount && booking.guestCount > 12) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Additional guests ({booking.guestCount - 12})</span>
                          <span className="font-semibold">+{formatPrice((booking.guestCount - 12) * 25)}</span>
                        </div>
                      )}
                      
                      {pricing.addonsTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Extra Items & Activities</span>
                          <span className="font-semibold">+{formatPrice(pricing.addonsTotal)}</span>
                        </div>
                      )}
                      
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Party Cost</span>
                        <span className="text-purple-600">{formatPrice(pricing.total)}</span>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Deposit to Secure Date:</strong> $200
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-600">
                    <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-semibold mb-2">Get Your Quote</p>
                    <p className="text-sm mb-4">
                      Please provide your contact information below to see pricing details.
                    </p>
                  </div>
                )}
                
                {/* Email and Communications - Always visible */}
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label htmlFor="quoteEmail" className="text-sm font-medium">Email Address *</Label>
                    <Input
                      id="quoteEmail"
                      type="email"
                      value={billingData.email}
                      onChange={(e) => setBillingData({...billingData, email: e.target.value})}
                      className="mt-1"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="quoteCommunications"
                      checked={billingData.agreeToCommunications}
                      onCheckedChange={(checked) => setBillingData({...billingData, agreeToCommunications: checked as boolean})}
                    />
                    <Label htmlFor="quoteCommunications" className="text-sm">
                      I agree to receive communications about my event *
                    </Label>
                  </div>
                </div>
                
                {/* Contact Info - Show when email & communications agreed */}
                {billingData.email && billingData.agreeToCommunications && (
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Contact Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="contactFirstName" className="text-sm">First Name *</Label>
                        <Input
                          id="contactFirstName"
                          data-testid="input-first-name"
                          value={billingData.firstName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setBillingData({...billingData, firstName: value});
                            handleTextInputUpdate('firstName', value);
                          }}
                          className="mt-1"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactLastName" className="text-sm">Last Name *</Label>
                        <Input
                          id="contactLastName"
                          data-testid="input-last-name"
                          value={billingData.lastName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setBillingData({...billingData, lastName: value});
                            handleTextInputUpdate('lastName', value);
                          }}
                          className="mt-1"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show/Hide Additional Billing Checkbox */}
                {billingData.email && billingData.agreeToCommunications && billingData.firstName && billingData.lastName && (
                  <div className="border-t pt-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBillingInfo}
                        onChange={(e) => setShowBillingInfo(e.target.checked)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">Show additional billing information</span>
                    </label>
                  </div>
                )}
              </CardContent>
              </Card>
            </div>

            {/* Billing Information - Conditional */}
            {showBillingInfo && (
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={billingData.firstName}
                      onChange={(e) => setBillingData({...billingData, firstName: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={billingData.lastName}
                      onChange={(e) => setBillingData({...billingData, lastName: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={billingData.address}
                    onChange={(e) => setBillingData({...billingData, address: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={billingData.city}
                      onChange={(e) => setBillingData({...billingData, city: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={billingData.state}
                      onChange={(e) => setBillingData({...billingData, state: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={billingData.zipCode}
                      onChange={(e) => setBillingData({...billingData, zipCode: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={billingData.phone}
                      onChange={(e) => setBillingData({...billingData, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={billingData.agreeToTerms}
                      onCheckedChange={(checked) => setBillingData({...billingData, agreeToTerms: checked as boolean})}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the terms and conditions *
                    </Label>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Secure Your Reservation</h4>
                  <p className="text-sm text-purple-700 mb-4">
                    Pay a {formatPrice(depositAmount)} deposit to lock in your party date. 
                    The remaining balance will be due on the day of your event.
                  </p>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleDepositPayment}
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending ? 'Processing...' : <>Pay {formatPrice(depositAmount)} Deposit</>}
                  </Button>
                  <p className="text-xs text-gray-600 text-center mt-2">
                    * All billing details and agreements are required to proceed
                  </p>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>• Deposits are fully refundable up to 48 hours before your event</p>
                  <p>• You can modify party details after booking</p>
                  <p>• Need help? Contact us at hosthampton295@gmail.com</p>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}