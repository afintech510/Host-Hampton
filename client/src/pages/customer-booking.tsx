import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, Users, MapPin, CreditCard, Edit, User, Phone, Mail, MapPinIcon } from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";

// Helper function to get ordinal suffix
function getOrdinalSuffix(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod = num % 100;
  return suffixes[mod >= 11 && mod <= 13 ? 0 : num % 10] || suffixes[0];
}

// Helper function to determine auto-selected items based on package selection
function getAutoSelectedItemsForPackage(packageName: string, allAddons: any[]) {
  const result = {
    selectedAddons: [] as string[],
    lockedAddons: [] as string[],
    balloonBudget: 0,
    foodBudget: 0,
    activityAllowances: {
      premiumCount: 0,
      standardCount: 0,
      canUpgradeToPremium: false
    }
  };

  if (!allAddons) return result;

  switch (packageName) {
    case '⭐ Base Package':
      // Base package - includes base activities: 1 premium + 1 standard OR 3 standard
      result.activityAllowances = {
        premiumCount: 1,
        standardCount: 1,
        canUpgradeToPremium: false,
        alternativeStandard: 3 // Can choose 3 standard instead of 1 premium + 1 standard
      };
      break;

    case '⭐⭐ Enhanced Package':
      // Level 1: $350 - Goody Bags, Photo Booth, 3 Extra Guests (activities same as base)
      result.selectedAddons = ['Goodie Bags', 'Photo Booth'];
      result.lockedAddons = ['Goodie Bags', 'Photo Booth'];
      result.activityAllowances = {
        premiumCount: 1,
        standardCount: 1,
        canUpgradeToPremium: false,
        alternativeStandard: 3
      };
      break;

    case '⭐⭐⭐ Premium Package':
      // Level 2: $695 - Upgrade to Premium Activity or add Standard
      result.selectedAddons = ['Goodie Bags', 'Balloon Tower', 'Photo Booth', 'Birthday Gift Basket'];
      result.lockedAddons = ['Goodie Bags', 'Balloon Tower', 'Photo Booth', 'Birthday Gift Basket'];
      result.activityAllowances = {
        premiumCount: 1,
        standardCount: 1,
        canUpgradeToPremium: true, // Can upgrade 1 standard to premium OR add 1 more standard
        alternativeStandard: 3
      };
      break;

    case '⭐⭐⭐⭐ Deluxe Package':
      // Level 3: $925 - Upgrade to Premium Activity or add Standard
      result.selectedAddons = ['Premium Goodie Bags', 'Balloon Tower', 'Photo Booth', 'Balloon Custom Stack', 'Birthday Gift Basket', 'Bubbles Drink Package'];
      result.lockedAddons = ['Premium Goodie Bags', 'Balloon Tower', 'Photo Booth', 'Balloon Custom Stack', 'Birthday Gift Basket', 'Bubbles Drink Package'];
      result.activityAllowances = {
        premiumCount: 1,
        standardCount: 1,
        canUpgradeToPremium: true, // Can upgrade 1 standard to premium OR add 1 more standard
        alternativeStandard: 3
      };
      break;

    case '⭐⭐⭐⭐⭐ Ultimate Package':
      // Level 4: $1,375 - Upgrade to Premium Activity or add Standard
      result.selectedAddons = ['Premium Goodie Bags', 'Balloon Tower', 'Photo Booth', 'Balloon Garland', 'Birthday Gift Basket', 'Themed Custom Treat Table', 'Bubbles Drink Package'];
      result.lockedAddons = ['Premium Goodie Bags', 'Balloon Tower', 'Photo Booth', 'Balloon Garland', 'Birthday Gift Basket', 'Themed Custom Treat Table', 'Bubbles Drink Package'];
      result.foodBudget = 15000; // $150 in cents for food add-ons
      result.activityAllowances = {
        premiumCount: 1,
        standardCount: 1,
        canUpgradeToPremium: true, // Can upgrade 1 standard to premium OR add 1 more standard
        alternativeStandard: 3
      };
      break;

    default:
      // No package or unknown package
      result.activityAllowances = {
        premiumCount: 0,
        standardCount: 0,
        canUpgradeToPremium: false
      };
      break;
  }

  return result;
}

interface CustomerBookingProps {
  leadId?: string | null;
}

export default function CustomerBooking({ leadId }: CustomerBookingProps = {}) {
  // Also support legacy URL param approach for backward compatibility
  const { leadId: urlLeadId } = useParams<{ leadId: string }>();
  const effectiveLeadId = leadId || urlLeadId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showCustomTheme, setShowCustomTheme] = useState(false);
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

  // Check if quote is locked
  const isLocked = booking?.locked || booking?.lockedAt;

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
        // Redirect to Stripe payment link
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

  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", `/api/leads/${leadId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", leadId] });
      setIsEditing(false);
      toast({
        title: "Booking Updated",
        description: "Your party details have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (booking) {
      setEditData({
        guestCount: booking.guestCount || 0,
        eventDate: booking.eventDate ? booking.eventDate.split('T')[0] : '',
        timeSlot: booking.timeSlot || '',
        notes: booking.notes || '',
        partyTheme: booking.partyTheme || '',
        customTheme: booking.customTheme || '',
        packageSelection: booking.packageSelection || '',
        selectedAddons: booking.selectedAddons || [],
        foodPreferences: booking.foodPreferences || {},
        specialRequirements: booking.specialRequirements || []
      });
      
      // Initialize custom theme display state
      setShowCustomTheme(booking.partyTheme === 'custom');
      
      // Pre-fill billing data from booking
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

  const handleSaveChanges = () => {
    updateMutation.mutate(editData);
  };

  // Validation function to check required fields
  const validateRequiredFields = () => {
    const missingFields: string[] = [];
    
    // Check billing details
    if (!billingData.firstName.trim()) missingFields.push('firstName');
    if (!billingData.lastName.trim()) missingFields.push('lastName');
    if (!billingData.address.trim()) missingFields.push('address');
    if (!billingData.city.trim()) missingFields.push('city');
    if (!billingData.state.trim()) missingFields.push('state');
    if (!billingData.zipCode.trim()) missingFields.push('zipCode');
    if (!billingData.phone.trim()) missingFields.push('phone');
    if (!billingData.email.trim()) missingFields.push('email');
    
    // Check agreements
    if (!billingData.agreeToTerms) missingFields.push('agreeToTerms');
    if (!billingData.agreeToCommunications) missingFields.push('agreeToCommunications');
    
    return missingFields;
  };

  // Function to scroll to first missing field
  const scrollToMissingField = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      element.focus();
    }
  };

  const handleDepositPayment = () => {
    const missingFields = validateRequiredFields();
    
    if (missingFields.length > 0) {
      // Show error message
      toast({
        title: "Missing Required Information",
        description: "Please complete all required fields before proceeding with payment.",
        variant: "destructive",
      });
      
      // Scroll to first missing field
      scrollToMissingField(missingFields[0]);
      return;
    }
    
    // All validation passed, proceed with payment
    depositMutation.mutate(booking);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find the booking you're looking for.</p>
            <Button onClick={() => window.location.href = '/'}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const depositAmount = 20000; // $200

  // Calculate pricing with new theme + star structure
  const isCustomTheme = booking?.partyTheme === 'custom' || booking?.customTheme;
  const baseThemePrice = isCustomTheme ? 95000 : 87500; // $950 or $875
  
  // Calculate star package cost based on new pricing structure
  let packageCost = 0;
  if (booking?.packageSelection) {
    const packagePrices: { [key: string]: number } = {
      '⭐ Base Package': 0, // 1 star is the base package (875 or 950)
      '⭐⭐ Enhanced Package': 35000, // +$350
      '⭐⭐⭐ Premium Package': 69500, // +$695  
      '⭐⭐⭐⭐ Deluxe Package': 92500, // +$925
      '⭐⭐⭐⭐⭐ Ultimate Package': 137500, // +$1,375
    };
    packageCost = packagePrices[booking.packageSelection] || 0;
  }
  
  const basePackagePrice = baseThemePrice + packageCost;
  
  // Calculate extra guests based on package inclusions
  const baseGuestCount = 10;
  let packageIncludedGuests = 0;
  
  // Determine how many extra guests are included in the package
  switch (booking?.packageSelection) {
    case '⭐⭐ Enhanced Package':
      packageIncludedGuests = 3; // Level 1 includes 3 extra guests
      break;
    case '⭐⭐⭐ Premium Package':
      packageIncludedGuests = 4; // Level 2 includes 4 extra guests
      break;
    case '⭐⭐⭐⭐ Deluxe Package':
      packageIncludedGuests = 5; // Level 3 includes 5 extra guests
      break;
    case '⭐⭐⭐⭐⭐ Ultimate Package':
      packageIncludedGuests = 6; // Level 4 includes 6 extra guests
      break;
    default:
      packageIncludedGuests = 0; // Base package includes no extra guests
      break;
  }
  
  const totalIncludedGuests = baseGuestCount + packageIncludedGuests;
  const extraGuests = Math.max(0, (booking?.guestCount || 0) - totalIncludedGuests);
  const extraChildGuestAddon = allAddons?.find((addon: any) => addon.name === 'Extra Child Guest');
  const extraGuestPrice = extraGuests * (extraChildGuestAddon?.price || 3500); // Default to $35 if not found
  
  // Get locked/included items for this package
  const packageAutoItems = getAutoSelectedItemsForPackage(booking?.packageSelection || '', allAddons);
  const lockedAddons = packageAutoItems.lockedAddons;

  // First, calculate total food/dessert cost for food budget application
  const selectedFoodItems = booking?.selectedAddons?.filter((name: string) => {
    const addon = allAddons?.find((a: any) => a.name === name);
    return addon && (addon.category === 'food' || addon.category === 'dessert') && !lockedAddons.includes(name);
  }) || [];
  
  const totalFoodCost = selectedFoodItems.reduce((total: number, addonName: string) => {
    const addon = allAddons?.find((a: any) => a.name === addonName);
    if (addon) {
      const itemPrice = addon.perGuest ? addon.price * (booking.guestCount || 0) : addon.price;
      return total + itemPrice;
    }
    return total;
  }, 0);
  
  const foodBudgetDiscount = packageAutoItems.foodBudget > 0 ? Math.min(totalFoodCost, packageAutoItems.foodBudget) : 0;

  // Calculate add-on total (excluding star package included items and base activities)
  const addonTotal = booking?.selectedAddons?.reduce((total: number, addonName: string) => {
    // Skip locked/included items - they shouldn't add to the price
    if (lockedAddons.includes(addonName)) {
      return total;
    }
    
    const addon = allAddons?.find((a: any) => a.name === addonName);
    if (!addon) return total;
    
    // Handle activity pricing - all parties include base activities (1 premium + 1 standard OR 3 standard)
    if (addon.category === 'activity' || addon.category === 'premium_activity') {
      const selectedActivities = booking.selectedAddons?.filter((name: string) => {
        const a = allAddons?.find((addon: any) => addon.name === name);
        return a && (a.category === 'activity' || a.category === 'premium_activity');
      }) || [];
      
      const premiumActivities = selectedActivities.filter((name: string) => {
        const a = allAddons?.find((addon: any) => addon.name === name);
        return a && a.category === 'premium_activity';
      });
      const standardActivities = selectedActivities.filter((name: string) => {
        const a = allAddons?.find((addon: any) => addon.name === name);
        return a && a.category === 'activity';
      });
      
      const isPremium = addon.category === 'premium_activity';
      
      // Base inclusions for all packages: 1 premium + 1 standard OR 3 standard
      if (isPremium) {
        const premiumIndex = premiumActivities.indexOf(addonName);
        if (premiumIndex === 0) {
          return total; // First premium activity is always included
        }
      } else {
        const standardIndex = standardActivities.indexOf(addonName);
        const totalPremiums = premiumActivities.length;
        
        // If choosing 1 premium + standard combo: first standard is free
        // If choosing all standard combo: first 3 standards are free
        if (totalPremiums > 0) {
          // Premium + standard combo: first standard is included
          if (standardIndex === 0) {
            return total;
          }
        } else {
          // All standard combo: first 3 are included
          if (standardIndex < 3) {
            return total;
          }
        }
      }
      
      // For packages 3, 4, 5: can upgrade OR add additional
      if (packageAutoItems.activityAllowances.canUpgradeToPremium) {
        // Additional upgrade allowances for higher packages
        const totalIncludedActivities = Math.max(premiumActivities.length, 0) + Math.max(standardActivities.length, 0);
        const baseIncluded = premiumActivities.length > 0 ? 2 : 3; // 1P+1S=2 or 3S=3
        
        if (totalIncludedActivities <= baseIncluded + 1) { // +1 upgrade/additional allowed
          return total;
        }
      }
    }
    
    // Charge for non-activity addons or activities beyond allowances
    return total + (addon.perGuest ? addon.price * (booking.guestCount || 0) : addon.price);
  }, 0) || 0;
  
  // Apply food budget discount to the total
  const finalAddonTotal = addonTotal - foodBudgetDiscount;

  // Calculate correct subtotal: base package + extra guests + non-included addons (with food budget applied)
  const subtotal = basePackagePrice + extraGuestPrice + finalAddonTotal;
  const salesTax = Math.round(subtotal * 0.0875); // 8.75% sales tax
  const totalWithTax = subtotal + salesTax;
  const remainingBalance = totalWithTax - depositAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={hostHamptonLogo} 
            alt="Host Hampton" 
            className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white shadow-lg"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Party Booking</h1>
          <p className="text-gray-600">Review your details and secure your reservation</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto relative">
          {/* Party Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Party Details
                </div>
                {!isLocked && (
                  <div className="flex gap-2">
                    {isEditing && (
                      <Button
                        size="sm"
                        onClick={handleSaveChanges}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Child Info at Top */}
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-purple-900 mb-1">
                  {booking.childName || 'Birthday Child'}'s {booking.childAge ? `${booking.childAge}${getOrdinalSuffix(booking.childAge)} ` : ''}Birthday Party
                </h4>
                <p className="text-sm text-purple-700">
                  {booking.partyTheme || 'Custom Theme'} • {booking.guestCount || 0} guests
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  {(isEditing && !isLocked) ? (
                    <div className="space-y-2 mt-2">
                      <Input
                        type="date"
                        value={editData.eventDate}
                        onChange={(e) => setEditData({...editData, eventDate: e.target.value})}
                      />
                      <Select value={editData.timeSlot} onValueChange={(value) => setEditData({...editData, timeSlot: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10am-12pm">10am - 12pm</SelectItem>
                          <SelectItem value="1pm-3pm">1pm - 3pm</SelectItem>
                          <SelectItem value="4pm-6pm">4pm - 6pm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'TBD'} 
                      {booking.timeSlot && ` at ${booking.timeSlot}`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Guest Count</p>
                  {(isEditing && !isLocked) ? (
                    <Input
                      type="number"
                      min="1"
                      value={editData.guestCount}
                      onChange={(e) => setEditData({...editData, guestCount: parseInt(e.target.value)})}
                      className="mt-2 w-24"
                    />
                  ) : (
                    <p className="text-gray-600">{booking.guestCount || 0} guests</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">
                    {(() => {
                      // Show location based on booking data
                      if (booking?.eventLocation === 'mobile' && booking?.mobileAddress) {
                        // For mobile parties, show "Mobile - <address>"
                        return `Mobile - ${booking.mobileAddress}`;
                      } else if (booking?.location === 'customer_location' && booking?.customerAddress) {
                        // For customer location parties using customerAddress JSON field
                        const addr = booking.customerAddress;
                        const address = [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
                        return `Mobile - ${address}`;
                      } else {
                        // For studio parties or when no location type is specified (legacy)
                        return 'Host Hampton, Speonk NY';
                      }
                    })()}
                  </p>
                </div>
              </div>

              {/* Party Package - Display Only */}
              {!isEditing && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Party Package</h4>
                    
                    {/* Theme Pill */}
                    <div className="mb-3">
                      <Badge variant="outline" className="mr-2 bg-white">
                        {booking.partyTheme === 'custom' && booking.customTheme ? 
                          `✨ ${booking.customTheme}` : 
                          `${allThemes?.find((theme: any) => theme.name === booking.partyTheme)?.icon || '🎉'} ${booking.partyTheme || 'Party Theme'}`
                        }
                      </Badge>
                    </div>

                    {/* Package Pill */}
                    <div className="mb-3">
                      <Badge variant="outline" className="mr-2 bg-white">
                        {booking.packageSelection === 'Make it Shine Add-On' ? '✨ Make it Shine ⭐' :
                         booking.packageSelection === 'Party Envy Add-On' ? '👑 Party Envy 💎' :
                         '🎉 Base Birthday Party'}
                      </Badge>
                    </div>

                    {/* Selected Add-ons Pills */}
                    {booking.selectedAddons && booking.selectedAddons.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Add-ons</h5>
                        <div className="flex flex-wrap gap-2">
                          {booking.selectedAddons.map((addonName: string, index: number) => {
                            const addon = allAddons?.find((a: any) => a.name === addonName);
                            return (
                              <Badge key={index} variant="outline" className="text-xs bg-white relative group cursor-pointer">
                                {addon?.icon || '🎉'} {addonName}
                                <button 
                                  className="ml-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const updatedAddons = booking.selectedAddons.filter((name: string) => name !== addonName);
                                    updateMutation.mutate({
                                      selectedAddons: updatedAddons
                                    });
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Food Choice Display */}
                    {booking.foodPreferences?.foodChoice && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Food Choice</h5>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          🍕 {booking.foodPreferences.foodChoice === 'none' ? 'No Food' : booking.foodPreferences.foodChoice.charAt(0).toUpperCase() + booking.foodPreferences.foodChoice.slice(1)}
                        </Badge>
                      </div>
                    )}

                    {/* Cupcake Flavor Display */}
                    {booking.foodPreferences?.cupcakeFlavor && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Cupcake Flavor</h5>
                        <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                          🧁 {booking.foodPreferences.cupcakeFlavor === 'none' ? 'No Cupcakes' : booking.foodPreferences.cupcakeFlavor.charAt(0).toUpperCase() + booking.foodPreferences.cupcakeFlavor.slice(1)}
                        </Badge>
                      </div>
                    )}

                    {/* Special Requirements Display */}
                    {booking.specialRequirements && booking.specialRequirements.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Special Requirements</h5>
                        <div className="flex flex-wrap gap-2">
                          {booking.specialRequirements.map((requirement: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              ⚠️ {requirement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Enhanced Editing Options */}
              {isEditing && !isLocked && (
                <div className="space-y-4">
                  <Separator />
                  <h4 className="font-semibold text-gray-800">Party Theme & Package</h4>
                  
                  {/* Theme Selection */}
                  <div>
                    <Label htmlFor="theme">Party Theme</Label>
                    <Select value={editData.partyTheme} onValueChange={(value) => {
                      if (value === 'custom') {
                        setShowCustomTheme(true);
                        setEditData({...editData, partyTheme: 'custom'});
                      } else {
                        setShowCustomTheme(false);
                        setEditData({...editData, partyTheme: value, customTheme: ''});
                      }
                    }}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {allThemes?.map((theme: any) => (
                          <SelectItem key={theme.id} value={theme.name}>
                            {theme.icon} {theme.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">
                          ✨ Custom Theme
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {(showCustomTheme || editData.partyTheme === 'custom') && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter your custom theme name"
                          value={editData.customTheme || ''}
                          onChange={(e) => setEditData({...editData, customTheme: e.target.value})}
                        />
                      </div>
                    )}
                  </div>

                  {/* Package Selection */}
                  <div>
                    <Label>Party Package</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allPackages?.map((pkg: any) => {
                        // Calculate display price based on package type
                        let displayPrice = '';
                        if (pkg.name === '⭐ Base Package') {
                          displayPrice = 'Base Price';
                        } else if (pkg.name === '⭐⭐ Enhanced Package') {
                          displayPrice = '+$350';
                        } else if (pkg.name === '⭐⭐⭐ Premium Package') {
                          displayPrice = '+$695';
                        } else if (pkg.name === '⭐⭐⭐⭐ Deluxe Package') {
                          displayPrice = '+$925';
                        } else if (pkg.name === '⭐⭐⭐⭐⭐ Ultimate Package') {
                          displayPrice = '+$1,375';
                        } else {
                          displayPrice = `$${(pkg.basePrice / 100).toFixed(0)}`;
                        }
                        
                        return (
                          <Button
                            key={pkg.id}
                            type="button"
                            variant={editData.packageSelection === pkg.name ? "default" : "outline"}
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              const newData = {...editData, packageSelection: pkg.name};
                              // Auto-select items based on package
                              const autoSelectedItems = getAutoSelectedItemsForPackage(pkg.name, allAddons);
                              newData.selectedAddons = autoSelectedItems.selectedAddons;
                              newData.lockedAddons = autoSelectedItems.lockedAddons;
                              newData.balloonBudget = autoSelectedItems.balloonBudget;
                              newData.foodBudget = autoSelectedItems.foodBudget;
                              newData.activityAllowances = autoSelectedItems.activityAllowances;
                              setEditData(newData);
                            }}
                          >
                            📦 {pkg.name} (<span className="pricing-font">{displayPrice}</span>)
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activity Allowances Display */}
                  {editData.activityAllowances && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">🎪 Activity Allowances</h5>
                      <div className="text-xs text-blue-700 space-y-1">
                        <div>Premium Activities: {editData.activityAllowances.premiumCount}</div>
                        <div>Standard Activities: {editData.activityAllowances.standardCount}</div>
                        {editData.activityAllowances.canUpgradeToPremium && (
                          <div className="text-blue-600 font-medium">✨ Can upgrade to 2nd premium activity or add another standard activity</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Budget Display */}
                  {(editData.balloonBudget > 0 || editData.foodBudget > 0) && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <h5 className="text-sm font-medium text-green-800 mb-2">💰 Package Budgets</h5>
                      <div className="text-xs text-green-700 space-y-1">
                        {editData.balloonBudget > 0 && (
                          <div>🎈 Balloon Budget: ${(editData.balloonBudget / 100).toFixed(0)}</div>
                        )}
                        {editData.foodBudget > 0 && (
                          <div>🍕 Food Budget: ${(editData.foodBudget / 100).toFixed(0)}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add-ons Selection - Organized Structure */}
                  <div>
                    <Label>Selected Add-ons</Label>
                    <div className="mt-2 space-y-6">
                      
                      {/* Premium Activities Section */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Premium Activities</h5>
                        <p className="text-xs text-gray-500 mb-2">
                          Select {editData.activityAllowances?.premiumCount || 1} premium activity{(editData.activityAllowances?.premiumCount || 1) > 1 ? 'ies' : ''}
                          {editData.activityAllowances?.canUpgradeToPremium && ' (or upgrade to 2 premium)'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {allAddons?.filter((addon: any) => addon.category === 'premium activity').map((addon: any) => {
                            const isSelected = editData.selectedAddons?.includes(addon.name);
                            const selectedPremiumCount = editData.selectedAddons?.filter((name: string) => 
                              allAddons?.find((a: any) => a.name === name && a.category === 'premium activity')
                            ).length || 0;
                            const maxPremium = editData.activityAllowances?.canUpgradeToPremium ? 2 : (editData.activityAllowances?.premiumCount || 1);
                            const canSelect = selectedPremiumCount < maxPremium || isSelected;
                            
                            return (
                              <Button
                                key={addon.id}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs"
                                disabled={!canSelect}
                                onClick={() => {
                                  const current = editData.selectedAddons || [];
                                  if (current.includes(addon.name)) {
                                    setEditData({...editData, selectedAddons: current.filter((name: string) => name !== addon.name)});
                                  } else {
                                    setEditData({...editData, selectedAddons: [...current, addon.name]});
                                  }
                                }}
                              >
                                {addon.icon} {addon.name} (<span className="pricing-font">${(addon.price / 100).toFixed(0)}</span> pp)
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Standard Activities Section */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Activities</h5>
                        <p className="text-xs text-gray-500 mb-2">
                          Select max {editData.activityAllowances?.standardCount || 2} standard activities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {allAddons?.filter((addon: any) => addon.category === 'activity').map((addon: any) => {
                            const isSelected = editData.selectedAddons?.includes(addon.name);
                            const selectedStandardCount = editData.selectedAddons?.filter((name: string) => 
                              allAddons?.find((a: any) => a.name === name && a.category === 'activity')
                            ).length || 0;
                            const maxStandard = editData.activityAllowances?.standardCount || 2;
                            const canSelect = selectedStandardCount < maxStandard || isSelected;
                            
                            return (
                              <Button
                                key={addon.id}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs"
                                disabled={!canSelect}
                                onClick={() => {
                                  const current = editData.selectedAddons || [];
                                  if (current.includes(addon.name)) {
                                    setEditData({...editData, selectedAddons: current.filter((name: string) => name !== addon.name)});
                                  } else {
                                    setEditData({...editData, selectedAddons: [...current, addon.name]});
                                  }
                                }}
                              >
                                {addon.icon} {addon.name} (<span className="pricing-font">${(addon.price / 100).toFixed(0)}</span> pp)
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Food Section */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Food</h5>
                        <div className="space-y-3">
                          {/* Base Food Choice */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Includes Pizza or Bagels (select one):</p>
                            <div className="flex flex-wrap gap-2">
                              {['pizza', 'bagels'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={editData.foodPreferences?.foodChoice === option ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 text-xs capitalize"
                                  onClick={() => setEditData({
                                    ...editData, 
                                    foodPreferences: {...editData.foodPreferences, foodChoice: option}
                                  })}
                                >
                                  {option === 'pizza' ? '🍕' : '🥯'} {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Food Add-ons */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Food add-ons:</p>
                            <div className="flex flex-wrap gap-2">
                              {allAddons?.filter((addon: any) => addon.category === 'food').map((addon: any) => {
                                const isSelected = editData.selectedAddons?.includes(addon.name);
                                
                                return (
                                  <Button
                                    key={addon.id}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                      const current = editData.selectedAddons || [];
                                      if (current.includes(addon.name)) {
                                        setEditData({...editData, selectedAddons: current.filter((name: string) => name !== addon.name)});
                                      } else {
                                        setEditData({...editData, selectedAddons: [...current, addon.name]});
                                      }
                                    }}
                                  >
                                    {addon.icon} {addon.name} (<span className="pricing-font">${(addon.price / 100).toFixed(0)}</span>)
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dessert Section */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Dessert</h5>
                        <div className="space-y-3">
                          {/* Cupcake Flavor Choice */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Choose cupcake flavor:</p>
                            <div className="flex flex-wrap gap-2">
                              {['chocolate', 'vanilla', 'none'].map((flavor) => (
                                <Button
                                  key={flavor}
                                  type="button"
                                  variant={editData.foodPreferences?.cupcakeFlavor === flavor ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 text-xs capitalize"
                                  onClick={() => setEditData({
                                    ...editData, 
                                    foodPreferences: {...editData.foodPreferences, cupcakeFlavor: flavor}
                                  })}
                                >
                                  {flavor === 'chocolate' ? '🍫' : flavor === 'vanilla' ? '🧁' : '🚫'} {flavor === 'none' ? 'No Cupcakes' : flavor}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Dessert Add-ons */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Dessert add-ons:</p>
                            <div className="flex flex-wrap gap-2">
                              {allAddons?.filter((addon: any) => addon.category === 'dessert').map((addon: any) => {
                                const isSelected = editData.selectedAddons?.includes(addon.name);
                                
                                return (
                                  <Button
                                    key={addon.id}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                      const current = editData.selectedAddons || [];
                                      if (current.includes(addon.name)) {
                                        setEditData({...editData, selectedAddons: current.filter((name: string) => name !== addon.name)});
                                      } else {
                                        setEditData({...editData, selectedAddons: [...current, addon.name]});
                                      }
                                    }}
                                  >
                                    {addon.icon} {addon.name} (<span className="pricing-font">${(addon.price / 100).toFixed(0)}</span>)
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drink Options */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Drink Options</h5>
                        <div className="space-y-2">
                          {/* Always Included */}
                          <div className="bg-green-50 p-2 rounded border border-green-200">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              🔒 🧃 Juice Boxes and Waters - Always Included
                            </Badge>
                          </div>
                          
                          {/* Other Drink Options */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Additional drink options:</p>
                            <div className="flex flex-wrap gap-2">
                              {allAddons?.filter((addon: any) => addon.category === 'drink').map((addon: any) => {
                                const isLocked = editData.lockedAddons?.includes(addon.name);
                                const isSelected = editData.selectedAddons?.includes(addon.name);
                                
                                return (
                                  <Button
                                    key={addon.id}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className={`h-8 text-xs ${isLocked ? 'bg-orange-100 border-orange-300 text-orange-800' : ''}`}
                                    disabled={isLocked}
                                    onClick={() => {
                                      if (isLocked) return;
                                      const current = editData.selectedAddons || [];
                                      if (current.includes(addon.name)) {
                                        setEditData({...editData, selectedAddons: current.filter((name: string) => name !== addon.name)});
                                      } else {
                                        setEditData({...editData, selectedAddons: [...current, addon.name]});
                                      }
                                    }}
                                  >
                                    {isLocked && '🔒 '}
                                    {addon.icon} {addon.name} (<span className="pricing-font">${(addon.price / 100).toFixed(0)}</span>)
                                    {isLocked && ' - Included'}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Decor Options */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Decor Options</h5>
                        <div className="flex flex-wrap gap-2">
                          {allAddons?.filter((addon: any) => addon.category === 'decor').map((addon: any) => {
                            const isSelected = editData.selectedAddons?.includes(addon.name);
                            
                            return (
                              <Button
                                key={addon.id}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  const current = editData.selectedAddons || [];
                                  if (current.includes(addon.name)) {
                                    setEditData({...editData, selectedAddons: current.filter((name: string) => name !== addon.name)});
                                  } else {
                                    setEditData({...editData, selectedAddons: [...current, addon.name]});
                                  }
                                }}
                              >
                                {addon.icon} {addon.name} (<span className="pricing-font">${(addon.price / 100).toFixed(0)}</span>)
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Extras Section */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Extras</h5>
                        <div className="space-y-3">
                          {['equipment', 'entertainment', 'gift'].map((category) => {
                            const categoryAddons = allAddons?.filter((addon: any) => addon.category === category);
                            if (!categoryAddons || categoryAddons.length === 0) return null;
                            
                            return (
                              <div key={category}>
                                <p className="text-xs text-gray-500 mb-2 capitalize">{category}:</p>
                                <div className="flex flex-wrap gap-2">
                                  {categoryAddons.map((addon: any) => {
                                    const isLocked = editData.lockedAddons?.includes(addon.name);
                                    const isSelected = editData.selectedAddons?.includes(addon.name);
                                    
                                    return (
                                      <Button
                                        key={addon.id}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        className={`h-8 text-xs ${isLocked ? 'bg-orange-100 border-orange-300 text-orange-800' : ''}`}
                                        disabled={isLocked}
                                        onClick={() => {
                                          if (isLocked) return;
                                          const current = editData.selectedAddons || [];
                                          if (current.includes(addon.name)) {
                                            setEditData({...editData, selectedAddons: current.filter((name: string) => name !== addon.name)});
                                          } else {
                                            setEditData({...editData, selectedAddons: [...current, addon.name]});
                                          }
                                        }}
                                      >
                                        {isLocked && '🔒 '}
                                        {addon.icon} {addon.name} (<span className="pricing-font">${(addon.price / 100).toFixed(0)}</span>{addon.perGuest ? ' pp' : ''})
                                        {isLocked && ' - Included'}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                    </div>
                  </div>



                  {/* Special Requirements */}
                  <div>
                    <Label>Special Requirements</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Gluten Free', 'Dairy Free', 'Nut Allergy'].map((requirement) => (
                        <Button
                          key={requirement}
                          type="button"
                          variant={editData.specialRequirements?.includes(requirement) ? "default" : "outline"}
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            const current = editData.specialRequirements || [];
                            if (current.includes(requirement)) {
                              setEditData({
                                ...editData, 
                                specialRequirements: current.filter((req: string) => req !== requirement)
                              });
                            } else {
                              setEditData({
                                ...editData, 
                                specialRequirements: [...current, requirement]
                              });
                            }
                          }}
                        >
                          {requirement}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />
                </div>
              )}

              {/* Questions / Requests */}
              <div>
                <Label htmlFor="notes">Questions / Requests</Label>
                {(isEditing && !isLocked) ? (
                  <Textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    placeholder="Any special requests, dietary restrictions, or questions..."
                    className="mt-2"
                  />
                ) : (
                  <p className="text-gray-600 mt-1">
                    {booking.notes || booking.formData?.questions || '—'}
                  </p>
                )}
              </div>

              {isEditing && !isLocked && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={handleSaveChanges} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}

              {/* Billing Details Section */}
              <Separator className="my-6" />
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Billing Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={billingData.firstName}
                      onChange={(e) => setBillingData({...billingData, firstName: e.target.value})}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={billingData.lastName}
                      onChange={(e) => setBillingData({...billingData, lastName: e.target.value})}
                      placeholder="Last name"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={billingData.address}
                      onChange={(e) => setBillingData({...billingData, address: e.target.value})}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={billingData.city}
                      onChange={(e) => setBillingData({...billingData, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={billingData.state}
                      onChange={(e) => setBillingData({...billingData, state: e.target.value})}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      value={billingData.zipCode}
                      onChange={(e) => setBillingData({...billingData, zipCode: e.target.value})}
                      placeholder="Zip code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={billingData.phone}
                      onChange={(e) => setBillingData({...billingData, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={billingData.email}
                      onChange={(e) => setBillingData({...billingData, email: e.target.value})}
                      placeholder="Email address"
                    />
                  </div>
                </div>
                

              </div>
            </CardContent>
          </Card>

          {/* Quote Summary */}
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Quote Summary
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              {/* Party Summary Header */}
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <div className="space-y-2">
                  <h3 className="font-bold text-purple-900">
                    {booking?.childName || 'Birthday Child'}'s {booking?.childAge ? `${booking.childAge}${getOrdinalSuffix(booking.childAge)} ` : ''}Birthday Party
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <span className="flex items-center gap-1">
                      {(() => {
                        const theme = allThemes?.find((t: any) => t.name === booking?.partyTheme);
                        return (
                          <>
                            {booking?.partyTheme === 'custom' && booking?.customTheme ? '✨' : (theme?.icon || '🎉')}
                            {booking?.partyTheme === 'custom' && booking?.customTheme ? booking.customTheme : (booking?.partyTheme || 'Party Theme')}
                          </>
                        );
                      })()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {booking?.guestCount || 0} guests
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {booking?.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'TBD'}
                    </span>
                    {booking?.timeSlot && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.timeSlot}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-purple-700">
                    <MapPin className="w-3 h-3" />
                    {(() => {
                      // Show location based on booking data
                      if (booking?.eventLocation === 'mobile' && booking?.mobileAddress) {
                        // For mobile parties, show "Mobile - <address>"
                        return `Mobile - ${booking.mobileAddress}`;
                      } else if (booking?.location === 'customer_location' && booking?.customerAddress) {
                        // For customer location parties using customerAddress JSON field
                        const addr = booking.customerAddress;
                        const address = [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
                        return `Mobile - ${address}`;
                      } else if (booking?.eventLocation === 'studio' || booking?.location === 'studio' || !booking?.eventLocation) {
                        // For studio parties or when no location type is specified (legacy)
                        return 'Host Hampton, Speonk NY';
                      } else {
                        // Fallback
                        return 'Host Hampton, Speonk NY';
                      }
                    })()}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-purple-700">
                    {(() => {
                      const packageIcon = booking?.packageSelection === 'Make it Shine Add-On' ? '✨' :
                                         booking?.packageSelection === 'Party Envy Add-On' ? '👑' :
                                         '🎉';
                      return (
                        <>
                          {packageIcon} {booking?.packageSelection || 'Base Birthday Party'}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{isCustomTheme ? 'Custom' : 'Standard'} Theme</span>
                  <span className="pricing-font">{formatPrice(baseThemePrice)}</span>
                </div>
                {packageCost > 0 && (
                  <div className="flex justify-between">
                    <span>{booking?.packageSelection}</span>
                    <span className="pricing-font">{formatPrice(packageCost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Package Total ({baseGuestCount} guests)</span>
                  <span className="pricing-font">{formatPrice(basePackagePrice)}</span>
                </div>
                {packageIncludedGuests > 0 && (
                  <div className="flex justify-between text-green-700 bg-green-50 px-2 py-1 rounded">
                    <span>🔒 Extra Guests Included ({packageIncludedGuests})</span>
                    <span>Included</span>
                  </div>
                )}
                {extraGuests > 0 && (
                  <div className="flex justify-between">
                    <span>Additional Extra Guests ({extraGuests} × <span className="pricing-font">$35</span>)</span>
                    <span className="pricing-font">{formatPrice(extraGuestPrice)}</span>
                  </div>
                )}

                {booking?.selectedAddons && booking.selectedAddons.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Selected Add-ons:</div>
                    {booking.selectedAddons.map((addonName: string) => {
                      const addon = allAddons?.find((a: any) => a.name === addonName);
                      if (!addon) return null;
                      
                      const isPackageIncluded = lockedAddons.includes(addonName);
                      const itemPrice = addon.perGuest ? addon.price * (booking.guestCount || 0) : addon.price;
                      
                      // Check if this is a base activity that should be included
                      let isActivityIncluded = false;
                      if (addon.category === 'activity' || addon.category === 'premium_activity') {
                        const selectedActivities = booking.selectedAddons?.filter((name: string) => {
                          const a = allAddons?.find((addon: any) => addon.name === name);
                          return a && (a.category === 'activity' || a.category === 'premium_activity');
                        }) || [];
                        
                        const premiumActivities = selectedActivities.filter((name: string) => {
                          const a = allAddons?.find((addon: any) => addon.name === name);
                          return a && a.category === 'premium_activity';
                        });
                        const standardActivities = selectedActivities.filter((name: string) => {
                          const a = allAddons?.find((addon: any) => addon.name === name);
                          return a && a.category === 'activity';
                        });
                        
                        const isPremium = addon.category === 'premium_activity';
                        if (isPremium) {
                          const premiumIndex = premiumActivities.indexOf(addonName);
                          isActivityIncluded = premiumIndex === 0; // First premium is included
                        } else {
                          const standardIndex = standardActivities.indexOf(addonName);
                          const totalPremiums = premiumActivities.length;
                          if (totalPremiums > 0) {
                            isActivityIncluded = standardIndex === 0; // First standard in premium combo
                          } else {
                            isActivityIncluded = standardIndex < 3; // First 3 in all-standard combo
                          }
                        }
                      }
                      
                      // Check if this is food/dessert that benefits from budget discount
                      let hasFoodBudgetSavings = false;
                      let displayPrice = itemPrice;
                      if ((addon.category === 'food' || addon.category === 'dessert') && packageAutoItems.foodBudget > 0 && !isPackageIncluded) {
                        hasFoodBudgetSavings = foodBudgetDiscount > 0;
                        // For display purposes, show proportional discount if there's a food budget
                        if (hasFoodBudgetSavings) {
                          const discountRatio = foodBudgetDiscount / totalFoodCost;
                          const itemDiscount = Math.round(itemPrice * discountRatio);
                          displayPrice = Math.max(0, itemPrice - itemDiscount);
                        }
                      }
                      
                      const isIncluded = isPackageIncluded || isActivityIncluded;
                      
                      return (
                        <div key={addonName} className={`flex justify-between text-sm pl-4 ${isIncluded ? 'text-green-700 bg-green-50 px-2 py-1 rounded' : ''}`}>
                          <span>
                            {isIncluded && '🔒 '}{addon.icon} {addon.name}
                            {addon.perGuest && ` (`}<span className="pricing-font">{addon.perGuest && `${formatPrice(addon.price)}`}</span>{addon.perGuest && ` pp)`}
                            {isIncluded && ' - Included'}
                            {hasFoodBudgetSavings && !isIncluded && ' - Food Budget Applied'}
                          </span>
                          <span className="pricing-font">
                            {isIncluded ? 'Included' : (
                              hasFoodBudgetSavings ? (
                                <span>
                                  <span className="line-through text-gray-400">{formatPrice(itemPrice)}</span>
                                  {' '}
                                  <span className="text-green-600">{formatPrice(displayPrice)}</span>
                                </span>
                              ) : formatPrice(itemPrice)
                            )}
                          </span>
                        </div>
                      );
                    })}
                    {foodBudgetDiscount > 0 && (
                      <div className="flex justify-between text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                        <span>🔒 Food Budget Applied ({formatPrice(packageAutoItems.foodBudget)} included)</span>
                        <span className="pricing-font">-{formatPrice(foodBudgetDiscount)}</span>
                      </div>
                    )}
                    {finalAddonTotal > 0 && (
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Add-ons Subtotal:</span>
                        <span className="pricing-font">{formatPrice(finalAddonTotal)}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="pricing-font">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (8.75%)</span>
                  <span className="pricing-font">{formatPrice(salesTax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="pricing-font">{formatPrice(totalWithTax)}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Deposit Required</span>
                  <span className="pricing-font">{formatPrice(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Remaining Balance</span>
                  <span className="pricing-font">{formatPrice(remainingBalance)}</span>
                </div>
              </div>

              {/* Required Agreements */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={billingData.agreeToTerms}
                    onCheckedChange={(checked) => setBillingData({...billingData, agreeToTerms: checked as boolean})}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <a href="/terms-and-conditions" target="_blank" className="text-purple-600 hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToCommunications"
                    checked={billingData.agreeToCommunications}
                    onCheckedChange={(checked) => setBillingData({...billingData, agreeToCommunications: checked as boolean})}
                  />
                  <Label htmlFor="agreeToCommunications" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <a href="/communications-agreement" target="_blank" className="text-purple-600 hover:underline">
                      Communications Agreement
                    </a>{" "}
                    (email, phone, and text notifications for event reminders, updates, and marketing communications){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Secure Your Reservation</h4>
                <p className="text-sm text-purple-700 mb-4">
                  Pay a <span className="pricing-font">{formatPrice(depositAmount)}</span> deposit to lock in your party date. 
                  The remaining balance will be due on the day of your event.
                </p>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleDepositPayment}
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? 'Processing...' : <>Pay <span className="pricing-font">{formatPrice(depositAmount)}</span> Deposit</>}
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
          </div>
        </div>
      </div>
    </div>
  );
}