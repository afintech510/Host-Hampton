import { useState, useEffect } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberWheel } from "@/components/ui/number-wheel";
import birthdayStarImage from "@assets/image_1752580458121.png";

interface ChildDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ChildDetailsStep({ formData, updateFormData, onNext, onBack }: ChildDetailsStepProps) {
  const [childName, setChildName] = useState(formData.childName || "");
  const [childAge, setChildAge] = useState(formData.childAge?.toString() || "");
  const [guestCount, setGuestCount] = useState(formData.guestCount?.toString() || "");

  // Save to session storage whenever values change
  useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem('partyFormData') || '{}');
    sessionStorage.setItem('partyFormData', JSON.stringify({
      ...sessionData,
      childName,
      childAge: childAge ? parseInt(childAge) : undefined,
      guestCount: guestCount ? parseInt(guestCount) : undefined
    }));
  }, [childName, childAge, guestCount]);

  const handleNext = () => {
    updateFormData({ 
      childName, 
      childAge: parseInt(childAge), 
      guestCount: parseInt(guestCount) 
    });
    onNext();
  };

  const isValid = childName && childAge && guestCount;

  // Age options for wheel selector
  const ageOptions = Array.from({ length: 15 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1} year${i + 1 > 1 ? 's' : ''} old`
  }));

  // Guest count options for wheel selector - numerical from 5 to 35
  const guestOptions = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 5).toString(),
    label: (i + 5).toString()
  }));

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src={birthdayStarImage}
          alt="Cute birthday star with party hat"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Tell us about the birthday star!</h2>
        <p className="text-gray-600">
          We want to make sure everything is perfect for your little one.
        </p>
      </div>

      <div className="space-y-6 text-left">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Birthday child's first name
          </Label>
          <Input
            type="text"
            placeholder="Enter their name"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            How old are they turning?
          </Label>
          <NumberWheel
            value={childAge}
            onValueChange={setChildAge}
            options={ageOptions}
            placeholder="Select age"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            How many kids will attend? (including birthday child)
          </Label>
          <NumberWheel
            value={guestCount}
            onValueChange={setGuestCount}
            options={guestOptions}
            placeholder="Select number (5-35)"
          />
        </div>

        <UnifiedButton
          onClick={handleNext}
          disabled={!isValid}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Continue
        </UnifiedButton>
      </div>
    </div>
  );
}
