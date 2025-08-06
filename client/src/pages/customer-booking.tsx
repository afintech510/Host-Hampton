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

export default function CustomerBooking() {
  const { leadId } = useParams<{ leadId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    agreeToTerms: false
  });

  // Fetch lead/booking data
  const { data: booking, isLoading } = useQuery({
    queryKey: ["/api/leads", leadId],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${leadId}`);
      const data = await response.json();
      return data.success ? data.lead : null;
    },
    enabled: !!leadId
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

  // Stripe deposit payment mutation
  const depositMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/create-deposit-payment", {
        leadId: parseInt(leadId!),
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
        packageSelection: booking.packageSelection || '',
        selectedAddons: booking.selectedAddons || [],
        foodPreferences: booking.foodPreferences || {},
        specialRequirements: booking.specialRequirements || []
      });
      
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
        agreeToTerms: false
      });
    }
  }, [booking]);

  const handleSaveChanges = () => {
    updateMutation.mutate(editData);
  };

  const handleDepositPayment = () => {
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
  const salesTax = Math.round((booking?.estimatedCost || 0) * 0.0875); // 8.75% sales tax
  const totalWithTax = (booking?.estimatedCost || 0) + salesTax;
  const remainingBalance = totalWithTax - depositAmount;

  // Calculate base package pricing
  const baseGuestCount = 10;
  const basePackagePrice = booking?.packageTotal || 0;
  const extraGuests = Math.max(0, (booking?.guestCount || 0) - baseGuestCount);
  const extraGuestPrice = extraGuests * 2500; // $25 per extra guest
  
  // Calculate add-on total
  const addonTotal = booking?.selectedAddons?.reduce((total: number, addonName: string) => {
    const addon = allAddons?.find((a: any) => a.name === addonName);
    if (addon) {
      return total + (addon.perGuest ? addon.price * (booking.guestCount || 0) : addon.price);
    }
    return total;
  }, 0) || 0;

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

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Party Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Party Details
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
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
                  {isEditing ? (
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
                  {isEditing ? (
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
                  <p className="text-gray-600">Host Hampton Studio, Speonk NY</p>
                </div>
              </div>

              {/* Party Theme & Package */}
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Party Package</h4>
                <Badge variant="secondary" className="mb-2">
                  {booking.partyTheme || 'Custom Theme'}
                </Badge>
                <p className="text-sm text-gray-600">
                  Package: {booking.packageSelection || 'Standard'}
                </p>
              </div>

              {/* Selected Add-ons */}
              {booking.selectedAddons && booking.selectedAddons.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Selected Add-ons</h4>
                  <div className="space-y-1">
                    {booking.selectedAddons.map((addon: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {addon}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Editing Options */}
              {isEditing && (
                <div className="space-y-4">
                  <Separator />
                  <h4 className="font-semibold text-gray-800">Party Theme & Package</h4>
                  
                  {/* Theme Selection */}
                  <div>
                    <Label htmlFor="theme">Party Theme</Label>
                    <Select value={editData.partyTheme} onValueChange={(value) => setEditData({...editData, partyTheme: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {allThemes?.map((theme: any) => (
                          <SelectItem key={theme.id} value={theme.name}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Package Selection */}
                  <div>
                    <Label htmlFor="package">Party Package</Label>
                    <Select value={editData.packageSelection} onValueChange={(value) => setEditData({...editData, packageSelection: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPackages?.map((pkg: any) => (
                          <SelectItem key={pkg.id} value={pkg.name}>
                            {pkg.name} - ${(pkg.price / 100).toFixed(0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add-ons Selection */}
                  <div>
                    <Label>Selected Add-ons</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                      {allAddons?.filter((addon: any) => addon.name !== 'Extra Child Guest').map((addon: any) => (
                        <div key={addon.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`addon-${addon.id}`}
                            checked={editData.selectedAddons?.includes(addon.name) || false}
                            onCheckedChange={(checked) => {
                              const current = editData.selectedAddons || [];
                              if (checked) {
                                setEditData({...editData, selectedAddons: [...current, addon.name]});
                              } else {
                                setEditData({...editData, selectedAddons: current.filter((name: string) => name !== addon.name)});
                              }
                            }}
                          />
                          <Label htmlFor={`addon-${addon.id}`} className="text-sm">
                            {addon.icon} {addon.name} (${(addon.price / 100).toFixed(0)})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Food Preferences */}
                  <div>
                    <Label htmlFor="foodChoice">Food Choice</Label>
                    <Select 
                      value={editData.foodPreferences?.foodChoice || ''} 
                      onValueChange={(value) => setEditData({
                        ...editData, 
                        foodPreferences: {...editData.foodPreferences, foodChoice: value}
                      })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select food option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pizza">Pizza</SelectItem>
                        <SelectItem value="bagels">Bagels</SelectItem>
                        <SelectItem value="sandwiches">Sandwiches</SelectItem>
                        <SelectItem value="none">No food</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cupcake Flavor */}
                  <div>
                    <Label htmlFor="cupcakeFlavor">Cupcake Flavor</Label>
                    <Select 
                      value={editData.foodPreferences?.cupcakeFlavor || ''} 
                      onValueChange={(value) => setEditData({
                        ...editData, 
                        foodPreferences: {...editData.foodPreferences, cupcakeFlavor: value}
                      })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select cupcake flavor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vanilla">Vanilla</SelectItem>
                        <SelectItem value="chocolate">Chocolate</SelectItem>
                        <SelectItem value="strawberry">Strawberry</SelectItem>
                        <SelectItem value="funfetti">Funfetti</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                </div>
              )}

              {/* Questions / Requests */}
              <div>
                <Label htmlFor="notes">Questions / Requests</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    placeholder="Any special requests, dietary restrictions, or questions..."
                    className="mt-2"
                  />
                ) : (
                  <p className="text-gray-600 mt-1">
                    {booking.notes || booking.formData?.questions || 'None specified'}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
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
                  <div>
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
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="terms"
                    checked={billingData.agreeToTerms}
                    onCheckedChange={(checked) => setBillingData({...billingData, agreeToTerms: checked as boolean})}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <a href="/terms-and-conditions" target="_blank" className="text-purple-600 hover:underline">
                      Terms and Conditions
                    </a>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Party Package ({baseGuestCount} guests)</span>
                  <span>{formatPrice(basePackagePrice)}</span>
                </div>
                {extraGuests > 0 && (
                  <div className="flex justify-between">
                    <span>Extra Guests ({extraGuests} × $25)</span>
                    <span>{formatPrice(extraGuestPrice)}</span>
                  </div>
                )}
                {booking?.selectedAddons && booking.selectedAddons.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Selected Add-ons:</div>
                    {booking.selectedAddons.map((addonName: string) => {
                      const addon = allAddons?.find((a: any) => a.name === addonName);
                      if (!addon) return null;
                      const itemPrice = addon.perGuest ? addon.price * (booking.guestCount || 0) : addon.price;
                      return (
                        <div key={addonName} className="flex justify-between text-sm pl-4">
                          <span>
                            {addon.icon} {addon.name}
                            {addon.perGuest && ` (${booking.guestCount || 0} guests)`}
                          </span>
                          <span>{formatPrice(itemPrice)}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Add-ons Subtotal:</span>
                      <span>{formatPrice(addonTotal)}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(booking?.estimatedCost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (8.75%)</span>
                  <span>{formatPrice(salesTax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>{formatPrice(totalWithTax)}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Deposit Required</span>
                  <span>{formatPrice(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Remaining Balance</span>
                  <span>{formatPrice(remainingBalance)}</span>
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
                  disabled={depositMutation.isPending || !billingData.agreeToTerms}
                >
                  {depositMutation.isPending ? 'Processing...' : `Pay ${formatPrice(depositAmount)} Deposit`}
                </Button>
                {!billingData.agreeToTerms && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    Please complete billing details and accept terms to continue
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>• Deposits are fully refundable up to 48 hours before your event</p>
                <p>• You can modify party details after booking</p>
                <p>• Need help? Contact us at info@hosthampton.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}