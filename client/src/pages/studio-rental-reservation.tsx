import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Camera,
  Palette,
  Music,
  Coffee,
  Plus,
  Minus,
} from "lucide-react";
import Navigation from "@/components/navigation";

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
  const leadId = searchParams.get("leadId");
  const { toast } = useToast();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [billingData, setBillingData] = useState<BillingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    billingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    agreeToTerms: false,
    agreeToCommunications: false,
  });

  // Studio rental specific data
  const [studioData, setStudioData] = useState({
    rentalDuration: 3, // hours
    guestCount: 11,
    eventDate: "",
    startTime: "12:00 PM",
    studioUsage: "",
    addOns: [] as string[],
  });

  // Fetch lead data
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ["/api/leads", leadId],
    enabled: !!leadId,
  });

  // Populate form with lead data
  useEffect(() => {
    if (lead && typeof lead === "object" && "lead" in lead) {
      const leadData = (lead as any).lead;
      setBillingData((prev) => ({
        ...prev,
        firstName: leadData.name?.split(" ")[0] || "",
        lastName: leadData.name?.split(" ").slice(1).join(" ") || "",
        email: leadData.email || "",
        phone: leadData.phone || "",
      }));

      setStudioData((prev) => ({
        ...prev,
        guestCount: leadData.guestCount || leadData.attendeeCount || 11,
        eventDate: leadData.eventDate
          ? new Date(leadData.eventDate).toISOString().split("T")[0]
          : "",
        startTime: leadData.startTime || leadData.arrivalTime || "12:00 PM",
        studioUsage: leadData.studioUsage || leadData.notes || "",
        rentalDuration: leadData.rentalDuration
          ? parseInt(leadData.rentalDuration)
          : 3,
      }));
    }
  }, [lead]);

  // Check if date is selected and determine if it's a weekend
  const isDateSelected = !!studioData.eventDate;
  const isWeekend = isDateSelected
    ? (() => {
        const date = new Date(studioData.eventDate);
        const day = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
        return day === 0 || day === 5 || day === 6;
      })()
    : false;

  // Tiered pricing based on duration - Weekend vs Weekday
  const getBasePrice = (hours: number, isWeekend: boolean) => {
    if (!isDateSelected) return 0;

    if (isWeekend) {
      // Weekend pricing
      if (hours === 3) return 500;
      if (hours === 4) return 600;
      if (hours === 5) return 700;
      if (hours >= 6) return 800;
      // For 1-2 hours, use proportional pricing based on 3hr rate
      return Math.round((500 / 3) * hours);
    } else {
      // Weekday pricing
      if (hours === 3) return 400;
      if (hours === 4) return 475;
      if (hours === 5) return 550;
      if (hours >= 6) return 625;
      // For 1-2 hours, use proportional pricing based on 3hr rate
      return Math.round((400 / 3) * hours);
    }
  };

  const basePrice = getBasePrice(studioData.rentalDuration, isWeekend);

  // Updated add-on pricing per requirements
  const addOnPrices = {
    Photobooth: 75,
    "Soft Play": 300,
    "Coffee Bar Setup": 75,
    "Popcorn Bar": 125,
    "Candy Wall": 200,
    "Party Helper": 75, // Per hour
  };

  const cleaningFee = 25; // Always included
  const addOnTotal = studioData.addOns.reduce(
    (sum, addOn) => sum + (addOnPrices[addOn as keyof typeof addOnPrices] || 0),
    0,
  );
  const subtotal = isDateSelected ? basePrice + addOnTotal + cleaningFee : 0;
  const salesTax = subtotal * 0.0875; // 8.75% tax
  const totalWithTax = subtotal + salesTax;
  const securityDepositAmount = 200; // $200 security deposit
  const remainingBalance = totalWithTax - securityDepositAmount;

  const formatPrice = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Payment mutation
  const depositMutation = useMutation({
    mutationFn: async () => {
      const paymentData = {
        leadId: leadId ? parseInt(leadId) : null,
        bookingType: "studio-rental",
        amount: Math.round(securityDepositAmount * 100), // Convert to cents
        billingData,
        studioData: {
          ...studioData,
          basePrice: Math.round(basePrice * 100),
          addOnTotal: Math.round(addOnTotal * 100),
          totalWithTax: Math.round(totalWithTax * 100),
        },
      };

      const response = await apiRequest(
        "POST",
        "/api/studio-booking-payment",
        paymentData,
      );
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
        description:
          error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  // Save as Quote mutation
  const saveQuoteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/leads/${leadId}/save-quote`, {});
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
      const response = await apiRequest("POST", `/api/leads/${leadId}/send-quote-email`, {});
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

  const handleBookingFeePayment = () => {
    if (!billingData.agreeToTerms || !billingData.agreeToCommunications) {
      toast({
        title: "Required Agreements",
        description:
          "Please agree to the terms and communications agreement to proceed.",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate();
  };

  const handleSaveQuote = () => {
    if (!billingData.agreeToTerms || !billingData.agreeToCommunications) {
      toast({
        title: "Required Agreements",
        description:
          "Please agree to the terms and communications agreement to save your quote.",
        variant: "destructive",
      });
      return;
    }
    saveQuoteMutation.mutate();
  };

  const handleAddOnToggle = (addOn: string) => {
    setStudioData((prev) => ({
      ...prev,
      addOns: prev.addOns.includes(addOn)
        ? prev.addOns.filter((a) => a !== addOn)
        : [...prev.addOns, addOn],
    }));
  };

  // Helper functions for +/- buttons
  const adjustRentalDuration = (delta: number) => {
    setStudioData((prev) => ({
      ...prev,
      rentalDuration: Math.max(1, Math.min(12, prev.rentalDuration + delta)),
    }));
  };

  const adjustGuestCount = (delta: number) => {
    setStudioData((prev) => ({
      ...prev,
      guestCount: Math.max(1, Math.min(85, prev.guestCount + delta)),
    }));
  };

  // Get tomorrow's date for min date validation
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Studio Rental Reservation
            </h1>
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
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      min={getTomorrowDate()}
                      value={studioData.eventDate}
                      onChange={(e) =>
                        setStudioData((prev) => ({
                          ...prev,
                          eventDate: e.target.value,
                        }))
                      }
                      className="text-center"
                      data-testid="input-event-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select
                      value={studioData.startTime}
                      onValueChange={(value) =>
                        setStudioData((prev) => ({ ...prev, startTime: value }))
                      }
                    >
                      <SelectTrigger className="text-center">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7:00 AM">7:00 AM</SelectItem>
                        <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                        <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                        <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                        <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                        <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                        <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                        <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                        <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                        <SelectItem value="5:00 PM">5:00 PM</SelectItem>
                        <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                        <SelectItem value="7:00 PM">7:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Rental Duration with +/- buttons */}
                  <div>
                    <Label htmlFor="rentalDuration">
                      Rental Duration (Hours)
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full shrink-0"
                        onClick={() => adjustRentalDuration(-1)}
                        data-testid="button-decrease-duration"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="rentalDuration"
                        type="number"
                        min="1"
                        max="12"
                        value={studioData.rentalDuration}
                        onChange={(e) =>
                          setStudioData((prev) => ({
                            ...prev,
                            rentalDuration: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="text-center"
                        data-testid="input-rental-duration"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full shrink-0"
                        onClick={() => adjustRentalDuration(1)}
                        data-testid="button-increase-duration"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Guest Count with +/- buttons */}
                  <div>
                    <Label htmlFor="guestCount">Guest Count</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full shrink-0"
                        onClick={() => adjustGuestCount(-1)}
                        data-testid="button-decrease-guests"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="guestCount"
                        type="number"
                        min="1"
                        max="85"
                        value={studioData.guestCount}
                        onChange={(e) =>
                          setStudioData((prev) => ({
                            ...prev,
                            guestCount: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="text-center"
                        data-testid="input-guest-count"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full shrink-0"
                        onClick={() => adjustGuestCount(1)}
                        data-testid="button-increase-guests"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="studioUsage">Studio Usage Description</Label>
                  <Textarea
                    id="studioUsage"
                    placeholder="private-event"
                    value={studioData.studioUsage}
                    onChange={(e) =>
                      setStudioData((prev) => ({
                        ...prev,
                        studioUsage: e.target.value,
                      }))
                    }
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
                    <div
                      key={addOn}
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      <Checkbox
                        id={addOn}
                        checked={studioData.addOns.includes(addOn)}
                        onCheckedChange={() => handleAddOnToggle(addOn)}
                      />
                      <Label htmlFor={addOn} className="flex-1 cursor-pointer">
                        <div className="font-medium">{addOn}</div>
                        <div className="text-sm text-gray-600">
                          {addOn === "Party Helper"
                            ? `${formatPrice(price)}/hr`
                            : formatPrice(price)}
                        </div>
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
                      onChange={(e) =>
                        setBillingData({
                          ...billingData,
                          firstName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={billingData.lastName}
                      onChange={(e) =>
                        setBillingData({
                          ...billingData,
                          lastName: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setBillingData({
                          ...billingData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={billingData.phone}
                      onChange={(e) =>
                        setBillingData({
                          ...billingData,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="billingAddress">Address *</Label>
                  <Input
                    id="billingAddress"
                    value={billingData.billingAddress}
                    onChange={(e) =>
                      setBillingData({
                        ...billingData,
                        billingAddress: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={billingData.city}
                      onChange={(e) =>
                        setBillingData({ ...billingData, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={billingData.state}
                      onChange={(e) =>
                        setBillingData({
                          ...billingData,
                          state: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isDateSelected ? (
                <div className="bg-yellow-50 p-6 rounded-lg text-center">
                  <Calendar className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Select Event Date
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Please select your event date to view pricing. Weekend rates
                    (Fri-Sun) differ from weekday rates (Mon-Thu).
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Studio Rental ({studioData.rentalDuration} hrs)</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  {isWeekend && (
                    <div className="text-xs text-orange-600 -mt-2">
                      Weekend pricing (Fri-Sun)
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Cleaning Fee</span>
                    <span>{formatPrice(cleaningFee)}</span>
                  </div>

                  {studioData.addOns.length > 0 &&
                    studioData.addOns.map((addOn) => (
                      <div key={addOn} className="flex justify-between text-sm">
                        <span>{addOn}</span>
                        <span>
                          {formatPrice(
                            addOnPrices[addOn as keyof typeof addOnPrices] || 0,
                          )}
                        </span>
                      </div>
                    ))}

                  <Separator />

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
                  <div className="flex justify-between text-blue-600">
                    <span>Security Deposit</span>
                    <span>{formatPrice(securityDepositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Remaining Balance</span>
                    <span>{formatPrice(remainingBalance)}</span>
                  </div>
                </div>
              )}

              {/* Pricing Details */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Studio Rental Information
                </h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <div>
                    <p className="font-semibold">Weekday (Mon-Thu):</p>
                    <p>3hrs: $400 | 4hrs: $475 | 5hrs: $550 | 6-12hrs: $625</p>
                  </div>
                  <div>
                    <p className="font-semibold">Weekend (Fri-Sun):</p>
                    <p>3hrs: $500 | 4hrs: $600 | 5hrs: $700 | 6-12hrs: $800</p>
                  </div>
                  <p>• Minimum 1-hour rental, maximum 12 hours</p>
                  <p>
                    • Rental duration should include setup and clean-up time.
                  </p>
                  <p>• Includes tables, chairs, & bluetooth sound system</p>
                  <p>• Security deposit is $200 (refundable)</p>
                </div>
              </div>

              {/* Required Agreements */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={billingData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setBillingData({
                        ...billingData,
                        agreeToTerms: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm leading-relaxed"
                  >
                    I agree to the{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Terms and Conditions
                    </a>{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToCommunications"
                    checked={billingData.agreeToCommunications}
                    onCheckedChange={(checked) =>
                      setBillingData({
                        ...billingData,
                        agreeToCommunications: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor="agreeToCommunications"
                    className="text-sm leading-relaxed"
                  >
                    I agree to the{" "}
                    <a
                      href="/communications-agreement"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Communications Agreement
                    </a>{" "}
                    (email, phone, and text notifications for booking reminders,
                    updates, and marketing){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Secure Your Reservation
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                  Pay a {formatPrice(securityDepositAmount)} security deposit to
                  secure your studio rental. The remaining balance will be due
                  on the day of your event.
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleBookingFeePayment}
                    disabled={depositMutation.isPending}
                    data-testid="button-pay-security-deposit"
                  >
                    {depositMutation.isPending
                      ? "Processing..."
                      : `Pay ${formatPrice(securityDepositAmount)} Security Deposit`}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={handleSaveQuote}
                    disabled={saveQuoteMutation.isPending || sendQuoteEmailMutation.isPending}
                    data-testid="button-save-quote"
                  >
                    {saveQuoteMutation.isPending || sendQuoteEmailMutation.isPending
                      ? "Saving..."
                      : "Save as Quote"}
                  </Button>
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  * All billing details and agreements are required to proceed
                </p>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>• Security deposit: $200</p>
                <p>• You can modify reservation details after booking</p>
                <p>• Need help? Contact us at hosthampton295@gmail.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
