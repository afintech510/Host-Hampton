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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, Users, MapPin, CreditCard, Edit } from "lucide-react";
import hostHamptonLogo from "@assets/host-hampton-logo_300_1754200191740.png";

export default function CustomerBooking() {
  const { leadId } = useParams<{ leadId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

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
        notes: booking.notes || ''
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
  const remainingBalance = (booking.estimatedCost || 0) - depositAmount;

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

              {/* Special Notes */}
              <div>
                <Label htmlFor="notes">Special Requests</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    placeholder="Any special requests or dietary restrictions..."
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
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Party Package</span>
                  <span>{formatPrice(booking.estimatedCost || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>{formatPrice(booking.estimatedCost || 0)}</span>
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
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? 'Processing...' : `Pay ${formatPrice(depositAmount)} Deposit`}
                </Button>
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