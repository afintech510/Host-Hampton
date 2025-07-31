import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";

interface EventDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EventDetailsStep({ formData, updateFormData, onNext, onBack }: EventDetailsStepProps) {
  const [eventDescription, setEventDescription] = useState(formData.eventDescription || "");
  const [adultCount, setAdultCount] = useState(formData.adultCount || 0);
  const [childCount, setChildCount] = useState(formData.childCount || 0);
  const [eventLocation, setEventLocation] = useState(formData.eventLocation || "studio");
  const [mobileAddress, setMobileAddress] = useState(formData.mobileAddress || "");

  const handleNext = () => {
    updateFormData({ 
      eventDescription, 
      adultCount, 
      childCount,
      eventLocation,
      mobileAddress: eventLocation === "mobile" ? mobileAddress : ""
    });
    onNext();
  };

  const handleCountChange = (type: 'adult' | 'child', operation: 'increment' | 'decrement') => {
    if (type === 'adult') {
      const newCount = operation === 'increment' 
        ? Math.min(adultCount + 1, 50) 
        : Math.max(adultCount - 1, 0);
      setAdultCount(newCount);
    } else {
      const newCount = operation === 'increment' 
        ? Math.min(childCount + 1, 50) 
        : Math.max(childCount - 1, 0);
      setChildCount(newCount);
    }
  };

  const handleNumberInputChange = (type: 'adult' | 'child', value: string) => {
    const num = parseInt(value) || 0;
    const clampedNum = Math.max(0, Math.min(50, num));
    if (type === 'adult') {
      setAdultCount(clampedNum);
    } else {
      setChildCount(clampedNum);
    }
  };

  const totalGuests = adultCount + childCount;
  const isValid = eventDescription.trim() && 
                  (adultCount > 0 || childCount > 0) && 
                  eventLocation && 
                  (eventLocation === "studio" || (eventLocation === "mobile" && mobileAddress.trim()));

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">🎊</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Tell us about your Event
        </h2>
        <p className="text-gray-600">
          Share details about your celebration so we can create the perfect experience
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Event Description *</Label>
          <Textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Tell us about your Event – are you celebrating a Birthday, Shower, Graduation, Holiday!"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300 min-h-[100px] resize-none"
            rows={4}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Event Location *</Label>
          <Select value={eventLocation} onValueChange={setEventLocation}>
            <SelectTrigger className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">Host Hampton in Speonk, NY</SelectItem>
              <SelectItem value="mobile">Mobile (specify address below)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {eventLocation === "mobile" && (
          <div className="animate-in fade-in duration-300">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Mobile Event Address *</Label>
            <Input
              value={mobileAddress}
              onChange={(e) => setMobileAddress(e.target.value)}
              placeholder="Enter the address for your mobile event"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              How many adults?
            </Label>
            <div className="flex items-center justify-center space-x-4 p-4 border-2 border-gray-200 rounded-xl">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCountChange('adult', 'decrement')}
                disabled={adultCount <= 0}
                className="h-10 w-10 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={adultCount}
                onChange={(e) => handleNumberInputChange('adult', e.target.value)}
                className="text-2xl font-semibold w-16 text-center border-0 bg-transparent focus:ring-0 focus:border-0"
                min="0"
                max="50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCountChange('adult', 'increment')}
                disabled={adultCount >= 50}
                className="h-10 w-10 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              How many children?
            </Label>
            <div className="flex items-center justify-center space-x-4 p-4 border-2 border-gray-200 rounded-xl">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCountChange('child', 'decrement')}
                disabled={childCount <= 0}
                className="h-10 w-10 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={childCount}
                onChange={(e) => handleNumberInputChange('child', e.target.value)}
                className="text-2xl font-semibold w-16 text-center border-0 bg-transparent focus:ring-0 focus:border-0"
                min="0"
                max="50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCountChange('child', 'increment')}
                disabled={childCount >= 50}
                className="h-10 w-10 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {totalGuests > 0 && (
          <div className={`p-4 rounded-xl ${totalGuests > 65 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-sm font-medium ${totalGuests > 65 ? 'text-orange-800' : 'text-green-800'}`}>
              Total guests: {totalGuests}
            </p>
            {totalGuests > 65 && (
              <p className="text-sm text-orange-700 mt-1">
                Note: For parties over 65 people, please call us to discuss venue options.
              </p>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            We recommend our studio for parties up to 65 people
          </p>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <UnifiedButton 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </UnifiedButton>
        <UnifiedButton 
          onClick={handleNext}
          disabled={!isValid}
          variant="primary"
          className="flex-1"
        >
          Continue
        </UnifiedButton>
      </div>
    </div>
  );
}