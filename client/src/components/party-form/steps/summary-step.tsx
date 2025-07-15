import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface SummaryStepProps {
  formData: any;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ADDON_PRICES: Record<string, number> = {
  "photo-booth": 50,
  "candy-wall": 75,
  "balloons": 25,
  "karaoke": 40,
  "glitter-makeup": 30,
  "hair-tinsel": 25,
  "beaded-hair-braid": 35,
  "glitter-tattoo": 20,
  "manicure": 40,
  "bracelet-making": 30,
};

const ADDON_LABELS: Record<string, string> = {
  "photo-booth": "Photo Booth",
  "candy-wall": "Candy Wall",
  "balloons": "Extra Balloons",
  "karaoke": "Karaoke",
  "glitter-makeup": "Glittery Makeup",
  "hair-tinsel": "Hair Tinsel",
  "beaded-hair-braid": "Beaded Hair Braid",
  "glitter-tattoo": "Glitter Tattoo",
  "manicure": "Manicure",
  "bracelet-making": "Bracelet Making",
};

const THEME_LABELS: Record<string, string> = {
  "slime": "Slime Party",
  "taylor-swift": "Taylor Swift",
  "barbie": "Barbie",
  "spa": "Spa Party",
  "unicorn": "Unicorn Magic",
  "trucker-hat": "Trucker Hat / Pouch",
  "sweets-treats": "Sweets & Treats",
  "toddler": "Toddler",
  "custom": "Custom Theme",
};

export function SummaryStep({ formData, onBack, onSubmit, isSubmitting }: SummaryStepProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const timeMap: Record<string, string> = {
      "10am-12pm": "10:00 AM - 12:00 PM",
      "1pm-3pm": "1:00 PM - 3:00 PM",
      "4pm-6pm": "4:00 PM - 6:00 PM",
    };
    return timeMap[timeString] || timeString;
  };

  const calculateTotal = () => {
    const basePrice = 400; // Base party package price
    const addonTotal = (formData.partyAddons || []).reduce((total: number, addon: string) => {
      return total + (ADDON_PRICES[addon] || 0);
    }, 0);
    return basePrice + addonTotal;
  };

  const totalPrice = calculateTotal();

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src="https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
          alt="Party celebration setup"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Perfect! Let's review everything</h2>
        <p className="text-gray-600">
          Here's your amazing party plan. Ready to make it official?
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 text-left">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="font-medium text-gray-900">Party Details</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">
                {formatDate(formData.partyDate)} • {formatTime(formData.partyTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Theme:</span>
              <span className="font-medium">{THEME_LABELS[formData.partyTheme] || formData.partyTheme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Birthday Star:</span>
              <span className="font-medium">{formData.childName}, turning {formData.childAge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guest Count:</span>
              <span className="font-medium">{formData.guestCount} children</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Food:</span>
              <span className="font-medium">
                {formData.foodChoice === 'pizza' ? 'Pizza' : 'Bagels'} & {formData.cupcakeFlavor === 'vanilla' ? 'Vanilla' : 'Chocolate'} Cupcakes
              </span>
            </div>
          </div>

          {formData.partyAddons && formData.partyAddons.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Add-ons</span>
              </div>
              <div className="space-y-2 text-sm">
                {formData.partyAddons.map((addon: string) => (
                  <div key={addon} className="flex justify-between">
                    <span className="text-gray-600">{ADDON_LABELS[addon] || addon}</span>
                    <span className="font-medium">+${ADDON_PRICES[addon] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total Estimate</span>
              <span className="font-bold text-xl text-coral">${totalPrice}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              $200 deposit required • Final price confirmed at booking
            </p>
          </div>
        </div>
      </div>

      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-left">
          <h4 className="font-medium text-yellow-800 mb-1">Before we continue</h4>
          <p className="text-sm text-yellow-700">
            By submitting this booking, you agree to our terms & conditions and understand that a $200 non-refundable deposit is required to secure your date.
          </p>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-coral hover:bg-coral text-white py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-200"
        >
          {isSubmitting ? "Booking Your Party... 🎉" : "Book Our Party! 🎉"}
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full text-gray-600 py-3 px-6 rounded-2xl text-base font-medium border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
        >
          ← Go Back
        </Button>
      </div>
    </div>
  );
}
