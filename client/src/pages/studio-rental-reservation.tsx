import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, Clock, Users, CreditCard, Camera, Palette, Music, Coffee } from "lucide-react";

interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  agreeToTerms: boolean;
  agreeToCommunications: boolean;
}

export default function StudioRentalReservationPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const leadId = searchParams.get('leadId');
  const { toast } = useToast();
  
  const [billingData, setBillingData] = useState<BillingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    agreeToTerms: false,
    agreeToCommunications: false,
  });

  // Studio rental specific data
  const [studioData, setStudioData] = useState({
    rentalDuration: 2, // hours
    guestCount: 10,
    eventDate: '',
    startTime: '10:00',
    studioUsage: '',
    specialRequirements: [] as string[],
    addOns: [] as string[],
  });

  // Fetch lead data
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['/api/leads', leadId],
    enabled: !!leadId,
  });

  // Populate form with lead data
  useEffect(() => {
    if (lead && typeof lead === 'object' && 'lead' in lead) {
      const leadData = (lead as any).lead;
      setBillingData(prev => ({
        ...prev,
        firstName: leadData.name?.split(' ')[0] || '',
        lastName: leadData.name?.split(' ').slice(1).join(' ') || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
      }));

      setStudioData(prev => ({
        ...prev,
        guestCount: leadData.guestCount || leadData.attendeeCount || 10,
        eventDate: leadData.eventDate ? new Date(leadData.eventDate).toISOString().split('T')[0] : '',
        startTime: leadData.startTime || '10:00',
        studioUsage: leadData.studioUsage || '',
        specialRequirements: leadData.specialRequirements || [],
      }));
    }
  }, [lead]);

  // Pricing calculations
  const hourlyRate = 150; // $150/hour for studio rental
  const basePrice = studioData.rentalDuration * hourlyRate;
  
  // Add-on pricing
  const addOnPrices = {
    'Photography Package': 200,
    'Backdrop Setup': 100,
    'Sound System': 75,
    'Lighting Package': 125,
    'Refreshment Setup': 50,
    'Equipment Cleaning': 25,
  };

  const addOnTotal = studioData.addOns.reduce((sum, addOn) => sum + (addOnPrices[addOn as keyof typeof addOnPrices] || 0), 0);
  const subtotal = basePrice + addOnTotal;
  const salesTax = subtotal * 0.0875; // 8.75% tax
  const totalWithTax = subtotal + salesTax;
  const bookingFeeAmount = 50; // $50 booking fee
  const remainingBalance = totalWithTax - bookingFeeAmount;

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Payment mutation
  const depositMutation = useMutation({
    mutationFn: async () => {
      const paymentData = {
        leadId: parseInt(leadId!),
        bookingType: 'studio-rental',
        amount: bookingFeeAmount * 100, // Convert to cents
        billingData,
        studioData: {
          ...studioData,
          basePrice: basePrice * 100,
          addOnTotal: addOnTotal * 100,
          totalWithTax: totalWithTax * 100,
        }
      };
      
      const response = await apiRequest("POST", "/api/studio-booking-payment", paymentData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        toast({
          title: "Booking Confirmed! 🎉",
          description: "Your studio rental has been successfully booked.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleBookingFeePayment = () => {
    if (!billingData.agreeToTerms || !billingData.agreeToCommunications) {
      toast({
        title: "Required Agreements",
        description: "Please agree to the terms and communications agreement to proceed.",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate();
  };

  const handleAddOnToggle = (addOn: string) => {
    setStudioData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addOn) 
        ? prev.addOns.filter(a => a !== addOn)
        : [...prev.addOns, addOn]
    }));
  };

  if (leadLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your studio rental details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Studio Rental Reservation</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete your studio rental booking with secure payment processing
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Studio Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Studio Rental Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rentalDuration">Rental Duration (Hours)</Label>
                    <Input
                      id="rentalDuration"
                      type="number"
                      min="1"
                      max="12"
                      value={studioData.rentalDuration}
                      onChange={(e) => setStudioData(prev => ({...prev, rentalDuration: parseInt(e.target.value) || 1}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestCount">Guest Count</Label>
                    <Input
                      id="guestCount"
                      type="number"
                      min="1"
                      max="50"
                      value={studioData.guestCount}
                      onChange={(e) => setStudioData(prev => ({...prev, guestCount: parseInt(e.target.value) || 1}))}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={studioData.eventDate}
                      onChange={(e) => setStudioData(prev => ({...prev, eventDate: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select value={studioData.startTime} onValueChange={(value) => setStudioData(prev => ({...prev, startTime: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="studioUsage">Studio Usage Description</Label>
                  <Textarea
                    id="studioUsage"
                    placeholder="Describe what you'll be using the studio for (photoshoot, filming, workshop, etc.)"
                    value={studioData.studioUsage}
                    onChange={(e) => setStudioData(prev => ({...prev, studioUsage: e.target.value}))}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Add-Ons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Studio Add-Ons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(addOnPrices).map(([addOn, price]) => (
                    <div key={addOn} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={addOn}
                        checked={studioData.addOns.includes(addOn)}
                        onCheckedChange={() => handleAddOnToggle(addOn)}
                      />
                      <Label htmlFor={addOn} className="flex-1 cursor-pointer">
                        <div className="font-medium">{addOn}</div>
                        <div className="text-sm text-gray-600">{formatPrice(price * 100)}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={billingData.firstName}
                      onChange={(e) => setBillingData({...billingData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={billingData.lastName}
                      onChange={(e) => setBillingData({...billingData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={billingData.email}
                      onChange={(e) => setBillingData({...billingData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={billingData.phone}
                      onChange={(e) => setBillingData({...billingData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="billingAddress">Address *</Label>
                  <Input
                    id="billingAddress"
                    value={billingData.billingAddress}
                    onChange={(e) => setBillingData({...billingData, billingAddress: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={billingData.city}
                      onChange={(e) => setBillingData({...billingData, city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={billingData.state}
                      onChange={(e) => setBillingData({...billingData, state: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  <span>Studio Rental ({studioData.rentalDuration} hrs × $150/hr)</span>
                  <span>{formatPrice(basePrice * 100)}</span>
                </div>
                {studioData.addOns.length > 0 && studioData.addOns.map(addOn => (
                  <div key={addOn} className="flex justify-between text-sm">
                    <span>{addOn}</span>
                    <span>{formatPrice((addOnPrices[addOn as keyof typeof addOnPrices] || 0) * 100)}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (8.75%)</span>
                  <span>{formatPrice(salesTax * 100)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>{formatPrice(totalWithTax * 100)}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Booking Fee (Non-refundable)</span>
                  <span>{formatPrice(bookingFeeAmount * 100)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Remaining Balance</span>
                  <span>{formatPrice(remainingBalance * 100)}</span>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Studio Rental Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Professional studio space: $150/hour</p>
                  <p>• Minimum 1-hour rental, maximum 12 hours</p>
                  <p>• Includes basic lighting and backdrops</p>
                  <p>• Booking fee is $50 and non-refundable</p>
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
                    <a href="/terms-and-conditions" target="_blank" className="text-blue-600 hover:underline">
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
                    <a href="/communications-agreement" target="_blank" className="text-blue-600 hover:underline">
                      Communications Agreement
                    </a>{" "}
                    (email, phone, and text notifications for booking reminders, updates, and marketing communications){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Secure Your Reservation</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Pay a {formatPrice(bookingFeeAmount * 100)} non-refundable booking fee to secure your studio rental. 
                  The remaining balance will be due on the day of your event.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleBookingFeePayment}
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? 'Processing...' : `Pay ${formatPrice(bookingFeeAmount * 100)} Booking Fee`}
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