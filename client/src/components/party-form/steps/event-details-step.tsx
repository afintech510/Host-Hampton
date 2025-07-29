import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NumberWheel } from "@/components/ui/number-wheel";

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

  const handleNext = () => {
    updateFormData({ 
      eventDescription, 
      adultCount, 
      childCount 
    });
    onNext();
  };

  const totalGuests = adultCount + childCount;
  const isValid = eventDescription.trim() && (adultCount > 0 || childCount > 0);

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">How many adults?</Label>
            <NumberWheel
              value={adultCount.toString()}
              onValueChange={(value) => setAdultCount(parseInt(value) || 0)}
              options={Array.from({ length: 21 }, (_, i) => ({ value: i.toString(), label: i.toString() }))}
              placeholder="Select number"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">How many children?</Label>
            <NumberWheel
              value={childCount.toString()}
              onValueChange={(value) => setChildCount(parseInt(value) || 0)}
              options={Array.from({ length: 21 }, (_, i) => ({ value: i.toString(), label: i.toString() }))}
              placeholder="Select number"
            />
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