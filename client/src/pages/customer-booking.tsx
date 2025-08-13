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
import { Calendar, Clock, Users, MapPin, CreditCard, User, Phone, Mail, Palette, Sparkles, DollarSign } from "lucide-react";
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

// Package definitions for calculations
const packageDefinitions = {
  level1: {
    name: "Level 1 ($350)",
    price: 350,
    extras: 3,
    premiumCount: 0,
    standardCount: 1,
    canUpgradeToPremium: false
  },
  level2: {
    name: "Level 2 ($695)",
    price: 695,
    extras: 4,
    premiumCount: 0,
    standardCount: 1,
    canUpgradeToPremium: true
  },
  level3: {
    name: "Level 3 ($925)",
    price: 925,
    extras: 5,
    premiumCount: 1,
    standardCount: 1,
    canUpgradeToPremium: true
  },
  level4: {
    name: "Level 4 ($1,375)",
    price: 1375,
    extras: 6,
    premiumCount: 1,
    standardCount: 1,
    canUpgradeToPremium: true,
    foodBudget: 150
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
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", `/api/leads/${effectiveLeadId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", effectiveLeadId] });
      toast({
        title: "Updated",
        description: "Party details updated successfully.",
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

  // Real-time update handler (debounced)
  const handleRealTimeUpdate = (field: string, value: any) => {
    clearTimeout(updateTimeoutRef.current!);
    updateTimeoutRef.current = setTimeout(() => {
      updateMutation.mutate({ [field]: value });
    }, 800);
  };

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
    if (!booking) return { basePrice: 875, packagePrice: 0, addonsTotal: 0, total: 875 };

    const basePriceStandard = 875;
    const basePriceCustom = 950;
    const basePrice = booking.partyTheme === 'custom' ? basePriceCustom : basePriceStandard;

    // Get package details
    const packageKey = booking.packageSelection?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    const packageObj = Object.values(packageDefinitions).find(pkg => 
      pkg.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(packageKey)
    );
    const packagePrice = packageObj?.price || 0;

    // Calculate add-ons total (excluding package-included items)
    let addonsTotal = 0;
    if (booking.selectedAddons && booking.selectedAddons.length > 0) {
      addonsTotal = booking.selectedAddons.reduce((total: number, addonName: string) => {
        const addon = allAddons?.find((a: any) => a.name === addonName);
        if (!addon) return total;

        let addonPrice = addon.per_guest ? (addon.price_per_guest * (booking.guestCount || 10)) : addon.price;
        
        // Apply Ultimate Package food budget if applicable
        if (packageObj?.foodBudget && ['food', 'drink'].includes(addon.category)) {
          addonPrice = Math.max(0, addonPrice - packageObj.foodBudget);
        }

        return total + addonPrice;
      }, 0);
    }

    const total = basePrice + packagePrice + addonsTotal;

    return { basePrice, packagePrice, addonsTotal, total };
  };

  const pricing = calculatePricing();
  const depositAmount = 200;

  useEffect(() => {
    if (booking) {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Design Form */}
          <div className="lg:col-span-2">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Child's First Name</Label>
                      <Input
                        value={booking.childName || ''}
                        onChange={(e) => handleRealTimeUpdate('childName', e.target.value)}
                        className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500"
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
                        className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500"
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
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
                        onChange={(e) => handleRealTimeUpdate('mobileAddress', e.target.value)}
                        className="mt-1 border-2 border-gray-200 rounded-none focus:border-purple-500"
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
                  <div className="grid grid-cols-2 gap-3">
                    {allThemes?.slice(0, 6).map((theme: any) => (
                      <div
                        key={theme.id}
                        onClick={() => handleRealTimeUpdate('partyTheme', theme.name)}
                        className={`border-2 border-gray-200 p-4 cursor-pointer transition-all hover:border-purple-400 ${
                          booking.partyTheme === theme.name ? 'border-purple-500 bg-purple-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{theme.icon}</div>
                          <div className="text-sm font-medium text-gray-700">{theme.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div 
                    className="border-2 border-gray-200 p-4 cursor-pointer transition-all hover:border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50"
                    onClick={() => handleRealTimeUpdate('partyTheme', 'custom')}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">✨</div>
                      <div className="text-sm font-medium text-gray-700">Custom Theme</div>
                    </div>
                  </div>
                  {booking.partyTheme === 'custom' && (
                    <Input
                      value={booking.customTheme || ''}
                      onChange={(e) => handleRealTimeUpdate('customTheme', e.target.value)}
                      className="mt-2 border-2 border-gray-200 rounded-none focus:border-purple-500"
                      placeholder="Describe your custom theme..."
                    />
                  )}
                </div>

                {/* Package Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Package Level</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(packageDefinitions).map(([key, pkg]) => (
                      <div
                        key={key}
                        onClick={() => handleRealTimeUpdate('packageSelection', pkg.name)}
                        className={`border-2 border-gray-200 p-4 cursor-pointer transition-all hover:border-purple-400 ${
                          booking.packageSelection === pkg.name ? 'border-purple-500 bg-purple-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">{pkg.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {pkg.extras} extra guests • {pkg.standardCount} standard activity
                              {pkg.premiumCount > 0 && ` • ${pkg.premiumCount} premium activity`}
                              {pkg.foodBudget && ` • $${pkg.foodBudget} food budget`}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-purple-600">
                            +{formatPrice(pkg.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quotation & Billing */}
          <div className="space-y-6">
            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Quotation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Party Price</span>
                    <span className="font-semibold">{formatPrice(pricing.basePrice)}</span>
                  </div>
                  {pricing.packagePrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package Add-on</span>
                      <span className="font-semibold">+{formatPrice(pricing.packagePrice)}</span>
                    </div>
                  )}
                  {pricing.addonsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Extras</span>
                      <span className="font-semibold">+{formatPrice(pricing.addonsTotal)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-purple-600">{formatPrice(pricing.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingData.email}
                    onChange={(e) => setBillingData({...billingData, email: e.target.value})}
                    className="mt-1"
                  />
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToCommunications"
                      checked={billingData.agreeToCommunications}
                      onCheckedChange={(checked) => setBillingData({...billingData, agreeToCommunications: checked as boolean})}
                    />
                    <Label htmlFor="agreeToCommunications" className="text-sm">
                      I agree to receive communications about my event *
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
          </div>
        </div>
      </div>
    </div>
  );
}