import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Mail, Phone, MapPin, Users } from "lucide-react";

interface WorkshopInvoiceStepProps {
  formData: any;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function WorkshopInvoiceStep({ formData, onBack, onSubmit, isSubmitting }: WorkshopInvoiceStepProps) {
  // Workshop add-ons pricing
  const workshopAddons = [
    { id: "av-equipment", name: "AV Equipment Package", price: 100 },
    { id: "catering", name: "Light Refreshments", price: 75 },
    { id: "materials-basic", name: "Basic Supply Package", price: 50 },
    { id: "photography", name: "Event Photography", price: 200 },
    { id: "setup-assistance", name: "Setup & Breakdown Service", price: 125 }
  ];

  // Base pricing for workshops
  const getWorkshopPricing = () => {
    const isSeries = formData.classFormat === "series";
    return {
      basePrice: isSeries ? 600 : 350,
      description: isSeries ? "Workshop Series Package" : "Workshop/Class Package",
      details: isSeries 
        ? "Includes venue space, basic equipment, and support for multiple sessions"
        : "Includes venue space, basic equipment, and full-day support"
    };
  };

  const pricing = getWorkshopPricing();
  
  // Calculate add-ons total
  const selectedAddons = formData.selectedWorkshopAddons || [];
  const addonsTotal = selectedAddons.reduce((total: number, addonId: string) => {
    const addon = workshopAddons.find(a => a.id === addonId);
    return total + (addon?.price || 0);
  }, 0);

  const subtotal = pricing.basePrice + addonsTotal;
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + tax;
  const deposit = Math.round(total * 0.5); // 50% deposit

  const formatScheduleInfo = () => {
    if (formData.scheduleChoice === "unsure") {
      return "Schedule: To be determined";
    }
    
    if (formData.preferredDate && formData.startTime && formData.endTime) {
      const date = new Date(formData.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `${date} from ${formData.startTime} to ${formData.endTime}`;
    }
    
    return "Schedule: Preferences provided in notes";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">📋</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Workshop Quote
        </h2>
        <p className="text-gray-600">
          Review your workshop details and pricing
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
                <p className="font-medium">{formData.workshopType}</p>
                <p className="text-sm text-gray-600">{formatScheduleInfo()}</p>
                {formData.scheduleNotes && (
                  <p className="text-sm text-gray-500 mt-1">Notes: {formData.scheduleNotes}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">Expected Attendees: {formData.expectedAttendees}</p>
                <p className="text-sm text-gray-600">
                  Format: {formData.classFormat === "series" ? "Series of classes" : "One-time workshop"}
                </p>
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
                  const addon = workshopAddons.find(a => a.id === addonId);
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
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <p>Total</p>
              <p>${total}.00</p>
            </div>
            
            <div className="bg-pink-50 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-pink-800">Reservation Deposit (50%)</p>
                  <p className="text-sm text-pink-600">Remaining balance due before workshop</p>
                </div>
                <p className="text-xl font-bold text-pink-800">${deposit}.00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Next Steps:</strong> After payment, we'll contact you within 24 hours to finalize workshop details, discuss materials, and coordinate any special setup requirements.
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