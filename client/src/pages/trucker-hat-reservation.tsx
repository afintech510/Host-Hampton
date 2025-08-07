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
import { Calendar, Clock, Users, MapPin, CreditCard, Edit, User } from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";

// Helper function to get ordinal suffix
function getOrdinalSuffix(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod = num % 100;
  return suffixes[mod >= 11 && mod <= 13 ? 0 : num % 10] || suffixes[0];
}

export default function TruckerHatReservation() {
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
    agreeToTerms: false,
    agreeToCommunications: false
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

  // Stripe deposit payment mutation
  const depositMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/create-deposit-payment", {
        leadId: parseInt(leadId!),
        amount: 2000, // $20 booking fee
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
        description: "Failed to create booking fee payment. Please try again.",
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
        title: "Reservation Updated",
        description: "Your trucker hat reservation details have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update reservation. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (booking) {
      // Extract date and time from Trucker Hat form data
      const formData = booking.formData || {};
      const eventDate = formData.studioPreferredDate || booking.eventDate;
      const startTime = formData.studioStartTime || booking.startTime;
      const endTime = formData.studioEndTime || booking.endTime;
      
      // Format time slot for display
      let timeSlot = '';
      if (startTime && endTime) {
        // Convert 24hr format to 12hr format for display
        const formatTime = (time: string) => {
          const [hour, minute] = time.split(':');
          const h = parseInt(hour);
          const ampm = h >= 12 ? 'pm' : 'am';
          const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
          return `${displayHour}${minute !== '00' ? `:${minute}` : ''}${ampm}`;
        };
        timeSlot = `${formatTime(startTime)}-${formatTime(endTime)}`;
      } else if (booking.timeSlot) {
        timeSlot = booking.timeSlot;
      }

      setEditData({
        eventDescription: booking.eventDescription || '',
        adultCount: booking.adultCount || formData.adultCount || 0,
        childCount: booking.childCount || formData.childCount || 0,
        eventLocation: booking.eventLocation || 'studio',
        mobileAddress: booking.mobileAddress || '',
        eventDate: eventDate ? eventDate.split('T')[0] : '',
        timeSlot: timeSlot,
        startTime: startTime || '',
        endTime: endTime || '',
        notes: booking.notes || formData.questions || ''
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

  const handleBookingFeePayment = () => {
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
          <p className="text-gray-600">Loading your reservation details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Reservation Not Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find the reservation you're looking for.</p>
            <Button onClick={() => window.location.href = '/'}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const bookingFeeAmount = 2000; // $20
  
  // Calculate Trucker Hat pricing based on requirements
  const totalPeople = (editData.adultCount || 0) + (editData.childCount || 0);
  const isStudioLocation = (editData.eventLocation || booking?.eventLocation) === 'studio';
  
  let basePrice = 0;
  let hatCount = 0;
  let pricingDescription = '';
  
  if (isStudioLocation) {
    // Studio appointment: 5 hat minimum, $25 each
    hatCount = Math.max(5, totalPeople);
    basePrice = hatCount * 2500; // $25 per hat
    pricingDescription = `Studio Appointment (${hatCount} hats × $25)`;
  } else {
    // Mobile service: $875 minimum for 25 hats, scales down to $25/hat at 200+ hats
    const minHats = 25;
    const minPrice = 87500; // $875
    hatCount = Math.max(minHats, totalPeople);
    
    if (hatCount >= 200) {
      basePrice = hatCount * 2500; // $25 per hat at 200+
      pricingDescription = `Mobile Service (${hatCount} hats × $25)`;
    } else if (hatCount >= minHats) {
      // Scale between $875 for 25 hats and $25/hat at 200 hats
      const pricePerHat = Math.max(2500, minPrice / hatCount);
      basePrice = hatCount * pricePerHat;
      pricingDescription = `Mobile Service (${hatCount} hats × $${(pricePerHat/100).toFixed(0)})`;
    } else {
      basePrice = minPrice;
      pricingDescription = `Mobile Service (25 hat minimum)`;
    }
  }

  // Custom patches: starting at $4 each (estimate 1 patch per person)
  const customPatchPrice = totalPeople * 400; // $4 per patch
  
  const subtotal = basePrice + customPatchPrice;
  const salesTax = Math.round(subtotal * 0.0875); // 8.75% sales tax
  const totalWithTax = subtotal + salesTax;
  const remainingBalance = totalWithTax - bookingFeeAmount;

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trucker Hat Bar Reservation</h1>
          <p className="text-gray-600">Review your details and secure your reservation</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Event Details
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
              {/* Event Info at Top */}
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-orange-900 mb-1 flex items-center gap-2">
                  🧢 Trucker Hat Bar Event
                </h4>
                <p className="text-sm text-orange-700">
                  {totalPeople} people • {isStudioLocation ? 'Studio Location' : 'Mobile Service'}
                </p>
              </div>

              {/* Event Description */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Event Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.eventDescription}
                    onChange={(e) => setEditData({...editData, eventDescription: e.target.value})}
                    placeholder="Describe your event..."
                    className="mt-2"
                  />
                ) : (
                  <p className="text-gray-600 mt-1">{booking.eventDescription || '—'}</p>
                )}
              </div>

              {/* People Count */}
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">People Count</p>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label>Adults</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={editData.adultCount}
                          onChange={(e) => setEditData({...editData, adultCount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label>Children</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={editData.childCount}
                          onChange={(e) => setEditData({...editData, childCount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {editData.adultCount || 0} adults, {editData.childCount || 0} children
                    </p>
                  )}
                </div>
              </div>

              {/* Date & Time */}
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
                      {editData.eventDate ? new Date(editData.eventDate).toLocaleDateString() : 'TBD'} • {editData.timeSlot || 'TBD'}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Location</p>
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <Select value={editData.eventLocation} onValueChange={(value) => setEditData({...editData, eventLocation: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="studio">Host Hampton Studio - Speonk, NY</SelectItem>
                          <SelectItem value="mobile">Mobile Service</SelectItem>
                        </SelectContent>
                      </Select>
                      {editData.eventLocation === 'mobile' && (
                        <Input
                          placeholder="Mobile service address"
                          value={editData.mobileAddress}
                          onChange={(e) => setEditData({...editData, mobileAddress: e.target.value})}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {booking.eventLocation === 'studio' ? 'Host Hampton Studio - Speonk, NY' : 
                       `Mobile Service${booking.mobileAddress ? ` - ${booking.mobileAddress}` : ''}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Questions / Requests */}
              <div>
                <Label htmlFor="notes">Questions / Requests</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    placeholder="Any special requests or questions..."
                    className="mt-2"
                  />
                ) : (
                  <p className="text-gray-600 mt-1">
                    {booking.notes || booking.formData?.questions || '—'}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{pricingDescription}</span>
                  <span>{formatPrice(basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custom Design / Logo Patches ({totalPeople} × $4)</span>
                  <span>{formatPrice(customPatchPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
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
                  <span>Booking Fee (Non-refundable)</span>
                  <span>{formatPrice(bookingFeeAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Remaining Balance</span>
                  <span>{formatPrice(remainingBalance)}</span>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Pricing Information</h4>
                <div className="text-sm text-orange-800 space-y-1">
                  <p>• Studio appointment: 5 hat minimum at $25 each</p>
                  <p>• Mobile service: $875 minimum for 25 hats</p>
                  <p>• Mobile pricing scales down to $25/hat at 200+ hats</p>
                  <p>• Custom patches start at $4 each</p>
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

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Secure Your Reservation</h4>
                <p className="text-sm text-orange-700 mb-4">
                  Pay a {formatPrice(bookingFeeAmount)} non-refundable booking fee to secure your Trucker Hat Bar reservation. 
                  The remaining balance will be due on the day of your event.
                </p>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={handleBookingFeePayment}
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? 'Processing...' : `Pay ${formatPrice(bookingFeeAmount)} Booking Fee`}
                </Button>
                <p className="text-xs text-gray-600 text-center mt-2">
                  * All billing details and agreements are required to proceed
                </p>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>• Booking fee is non-refundable</p>
                <p>• You can modify reservation details after booking</p>
                <p>• Need help? Contact us at info@hosthampton.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}