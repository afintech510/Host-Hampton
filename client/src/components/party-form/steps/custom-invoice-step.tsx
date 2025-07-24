import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Mail, Phone, MapPin } from "lucide-react";

interface CustomInvoiceStepProps {
  formData: any;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function CustomInvoiceStep({ formData, onBack, onSubmit, isSubmitting }: CustomInvoiceStepProps) {
  // Add-ons pricing
  const addons = [
    { id: "photobooth", name: "Photobooth", price: 150 },
    { id: "candy-wall", name: "Candy Wall", price: 100 },
    { id: "trucker-hat-bar", name: "Trucker Hat Bar", price: 200 },
    { id: "permanent-jewelry", name: "Permanent Jewelry", price: 250 },
    { id: "toddler-play-area", name: "Toddler Soft Play Area", price: 125 }
  ];

  // Calculate pricing based on rental pricing or event type fallback
  const getEventPricing = () => {
    // Use rental pricing if available (from specific date/time selection)
    if (formData.rentalPricing) {
      const rentalPricing = formData.rentalPricing;
      return {
        basePrice: rentalPricing.basePrice / 100, // Convert from cents to dollars
        securityDeposit: rentalPricing.securityDeposit / 100,
        description: `Space Rental (${rentalPricing.hours} hour${rentalPricing.hours > 1 ? 's' : ''})`,
        details: `${rentalPricing.isWeekend ? 'Weekend' : 'Weekday'} rate - Studio space rental`,
        hasRentalPricing: true
      };
    }

    // Fallback to event type pricing (for "unsure" dates or other scenarios)
    switch (formData.eventType) {
      case "diy-party":
        return {
          basePrice: 250,
          description: "DIY Party Package",
          details: "Includes studio space, basic supplies, and 2-hour rental",
          hasRentalPricing: false
        };
      case "private-event":
        return {
          basePrice: 400,
          description: "Private Event Package", 
          details: "Exclusive venue access with full amenities",
          hasRentalPricing: false
        };
      default:
        return {
          basePrice: 300,
          description: "Custom Event Package",
          details: "Tailored experience for your special event",
          hasRentalPricing: false
        };
    }
  };

  const pricing = getEventPricing();
  
  // Calculate add-ons total
  const selectedAddons = formData.selectedAddons || [];
  const addonsTotal = selectedAddons.reduce((total: number, addonId: string) => {
    const addon = addons.find(a => a.id === addonId);
    return total + (addon?.price || 0);
  }, 0);

  // Calculate totals differently for rental pricing vs package pricing
  const subtotal = pricing.basePrice + addonsTotal;
  const securityDeposit = pricing.hasRentalPricing ? pricing.securityDeposit : 0;
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + tax + securityDeposit;
  const deposit = pricing.hasRentalPricing ? securityDeposit : Math.round(total * 0.5); // For rental: security deposit, otherwise 50% deposit

  const formatEventType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDateTime = () => {
    if (formData.dateChoice === "unsure") {
      return "Date & Time: To be determined";
    }
    
    if (formData.partyDate && formData.startTime && formData.endTime) {
      const date = new Date(formData.partyDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `${date} from ${formData.startTime} to ${formData.endTime}`;
    }
    
    return "Date & Time: Not specified";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">💰</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Event Quotation</h2>
        <p className="text-gray-600">
          Review your event details and pricing
        </p>
      </div>
      <Card className="border-2 border-gray-200">
        <CardHeader className="bg-pink-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-pink-400" />
            Host Hampton - 295 Montauk Hwy, Speonk, NY 11972
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">{formData.customerName}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {formData.customerEmail}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {formData.customerPhone}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">{formatEventType(formData.eventType)}</p>
                <p className="text-sm text-gray-600">{formatDateTime()}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{pricing.description}</p>
                <p className="text-sm text-gray-600">{pricing.details}</p>
              </div>
              <p className="font-medium">${pricing.basePrice}.00</p>
            </div>
            
            {selectedAddons.length > 0 && (
              <>
                {selectedAddons.map((addonId: string) => {
                  const addon = addons.find(a => a.id === addonId);
                  if (!addon) return null;
                  return (
                    <div key={addonId} className="flex justify-between text-sm">
                      <p className="text-gray-600">{addon.name}</p>
                      <p className="text-gray-600">${addon.price}.00</p>
                    </div>
                  );
                })}
                <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                  <p>Subtotal</p>
                  <p>${subtotal}.00</p>
                </div>
              </>
            )}
            
            <div className="flex justify-between text-sm">
              <p className="text-gray-600">Tax (8%)</p>
              <p className="text-gray-600">${tax}.00</p>
            </div>
            
            {pricing.hasRentalPricing && securityDeposit > 0 && (
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Security Deposit</p>
                <p className="text-gray-600">${securityDeposit}.00</p>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <p>Total</p>
              <p>${total}.00</p>
            </div>
            
            <div className="bg-pink-50 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  {pricing.hasRentalPricing ? (
                    <>
                      <p className="font-medium text-pink-800">Security Deposit Due</p>
                      <p className="text-sm text-pink-600">Refundable after event completion</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-pink-800">Reservation Deposit (50%)</p>
                      <p className="text-sm text-pink-600">Remaining balance due before event</p>
                    </>
                  )}
                </div>
                <p className="text-xl font-bold text-pink-800">${deposit}.00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="bg-blue-50 p-4 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Next Steps:</strong> After payment, we'll contact you within 24 hours to finalize event details and discuss any special requirements.
        </p>
      </div>
      <div className="flex space-x-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-pink-400 hover:bg-pink-500 text-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          {isSubmitting ? "Processing..." : "Pay Reservation Deposit"}
        </Button>
      </div>
    </div>
  );
}