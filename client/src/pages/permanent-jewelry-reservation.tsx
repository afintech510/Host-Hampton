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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CreditCard,
  Edit,
  User,
  Gem,
} from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";

// Helper function to get ordinal suffix
function getOrdinalSuffix(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod = num % 100;
  return suffixes[mod >= 11 && mod <= 13 ? 0 : num % 10] || suffixes[0];
}

interface PermanentJewelryReservationProps {
  leadId?: string | null;
}

export default function PermanentJewelryReservation({
  leadId,
}: PermanentJewelryReservationProps = {}) {
  // Also support legacy URL param approach for backward compatibility
  const { leadId: urlLeadId } = useParams<{ leadId: string }>();
  const effectiveLeadId = leadId || urlLeadId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [billingData, setBillingData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    agreeToTerms: false,
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

  // Stripe deposit payment mutation
  const depositMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/create-deposit-payment", {
        leadId: parseInt(effectiveLeadId!),
        amount: 5000, // $50 booking fee for jewelry session
        bookingData,
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
    },
  });

  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest(
        "PATCH",
        `/api/leads/${effectiveLeadId}`,
        updates,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/leads", effectiveLeadId],
      });
      setIsEditing(false);
      toast({
        title: "Session Updated",
        description:
          "Your permanent jewelry session details have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update session details. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (booking) {
      setEditData({
        jewelryPieces: booking.jewelryPieces || 1,
        attendeeCount: booking.attendeeCount || 1,
        eventDate: booking.eventDate
          ? new Date(booking.eventDate).toISOString().split("T")[0]
          : "",
        startTime: booking.startTime || "",
        notes: booking.notes || "",
        eventLocation: booking.eventLocation || "studio",
      });

      // Pre-fill billing data if available
      if (booking.name || booking.email) {
        const nameParts = booking.name?.split(" ") || [];
        setBillingData((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: booking.email || "",
          phone: booking.phone || "",
        }));
      }
    }
  }, [booking]);

  const handlePayDeposit = () => {
    if (!billingData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      ...billingData,
      leadId: effectiveLeadId,
      bookingType: "permanent-jewelry",
    });
  };

  const handleUpdate = () => {
    updateMutation.mutate(editData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-yellow-800">
            Loading your jewelry session details...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Gem className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find your permanent jewelry session details.
            </p>
            <Button
              onClick={() => (window.location.href = "/get-quote")}
              className="w-full"
            >
              Start New Session Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formData = booking.formData || {};
  const estimatedCost = booking.estimatedCost || 0;
  const jewelryPieces = formData.jewelryPieces || editData.jewelryPieces || 1;
  const attendeeCount = formData.attendeeCount || editData.attendeeCount || 1;
  
  // Get selected jewelry pieces as array and format with commas
  const selectedJewelryPieces = booking.jewelryPieces || [];
  const jewelryPiecesDisplay = Array.isArray(selectedJewelryPieces) 
    ? selectedJewelryPieces.join(", ") 
    : selectedJewelryPieces;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={hostHamptonLogo}
                alt="Host Hampton"
                className="h-12 md:h-14 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Permanent Jewelry Session
                </h1>
                <p className="text-sm text-gray-600">Complete your booking</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              💍 Jewelry Session
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Details */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Session Details</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jewelryPieces">
                        Number of Jewelry Pieces
                      </Label>
                      <Input
                        id="jewelryPieces"
                        type="number"
                        min="1"
                        max="10"
                        value={editData.jewelryPieces || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            jewelryPieces: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="attendeeCount">Number of People</Label>
                      <Input
                        id="attendeeCount"
                        type="number"
                        min="1"
                        max="20"
                        value={editData.attendeeCount || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            attendeeCount: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventDate">Preferred Date</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={editData.eventDate || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            eventDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Preferred Time</Label>
                      <Select
                        value={editData.startTime || ""}
                        onValueChange={(value) =>
                          setEditData({ ...editData, startTime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="13:00">1:00 PM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="location">Session Location</Label>
                      <Select
                        value={editData.eventLocation || "studio"}
                        onValueChange={(value) =>
                          setEditData({ ...editData, eventLocation: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="studio">Host Hampton</SelectItem>
                          <SelectItem value="mobile">
                            Mobile (we come to you)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Special Requests</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special jewelry preferences, allergies, or requests..."
                        value={editData.notes || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, notes: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button
                        onClick={handleUpdate}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending
                          ? "Updating..."
                          : "Update Session"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Gem className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Jewelry Pieces</p>
                        <p className="font-medium">
                          {jewelryPiecesDisplay || `${jewelryPieces} piece${jewelryPieces !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Attendees</p>
                        <p className="font-medium">
                          {attendeeCount} person{attendeeCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Preferred Date</p>
                        <p className="font-medium">
                          {booking.eventDate
                            ? new Date(booking.eventDate).toLocaleDateString()
                            : "To be scheduled"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Preferred Time</p>
                        <p className="font-medium">
                          {booking.timeSlot || booking.startTime || "To be scheduled"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">
                          {booking.eventLocation === "mobile"
                            ? "Mobile Service"
                            : "Host Hampton"}
                        </p>
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">
                          Special Requests
                        </p>
                        <p className="font-medium">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={billingData.address}
                      onChange={(e) =>
                        setBillingData({
                          ...billingData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={billingData.city}
                      onChange={(e) =>
                        setBillingData({ ...billingData, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={billingData.state}
                      onValueChange={(value) =>
                        setBillingData({ ...billingData, state: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="NJ">New Jersey</SelectItem>
                        <SelectItem value="CT">Connecticut</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={billingData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setBillingData({
                          ...billingData,
                          agreeToTerms: !!checked,
                        })
                      }
                    />
                    <label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <a 
                        href="/terms-and-conditions" 
                        target="_blank"
                        className="text-yellow-600 hover:underline"
                      >
                        terms and conditions
                      </a>{" "}
                      *
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="communications"
                      checked={billingData.agreeToCommunications}
                      onCheckedChange={(checked) =>
                        setBillingData({
                          ...billingData,
                          agreeToCommunications: !!checked,
                        })
                      }
                    />
                    <label htmlFor="communications" className="text-sm">
                      I agree to receive{" "}
                      <a 
                        href="/communications-agreement" 
                        target="_blank"
                        className="text-yellow-600 hover:underline"
                      >
                        communications
                      </a>{" "}
                      about my session
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Session Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">
                    Permanent Jewelry Session
                  </h3>
                  {jewelryPiecesDisplay && (
                    <p className="text-sm text-gray-600 mb-3">
                      {jewelryPiecesDisplay}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {attendeeCount} person{attendeeCount !== 1 ? "s" : ""}
                      </span>
                      <span>${200.00.toFixed(2)}</span>
                    </div>
                    {booking.eventLocation === "mobile" && (
                      <div className="flex justify-between">
                        <span>Mobile service fee</span>
                        <span>$50.00</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Estimated Total</span>
                  <span>${(estimatedCost / 100).toFixed(2)}</span>
                </div>

                <div className="text-xs text-gray-600">
                  <p>• Booking fee: $50 (applied to final total)</p>
                  <p>• Final pricing confirmed during session</p>
                  <p>• Additional jewelry pieces available</p>
                </div>

                <Separator />

                <Button
                  onClick={handlePayDeposit}
                  disabled={
                    depositMutation.isPending || !billingData.agreeToTerms
                  }
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {depositMutation.isPending
                    ? "Processing..."
                    : "Pay $50 Booking Fee"}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  Secure payment via Stripe. Booking fee applied to final total.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
