import { useState, useEffect } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import birthdayStarImage from "@assets/image_1752580458121.png";

interface ChildDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ChildDetailsStep({ formData, updateFormData, onNext, onBack }: ChildDetailsStepProps) {
  const [childName, setChildName] = useState(formData.childName || "");
  const [childAge, setChildAge] = useState(formData.childAge || 1);
  const [guestCount, setGuestCount] = useState(formData.guestCount || 5);

  // Save to session storage whenever values change
  useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem('partyFormData') || '{}');
    sessionStorage.setItem('partyFormData', JSON.stringify({
      ...sessionData,
      childName,
      childAge,
      guestCount
    }));
  }, [childName, childAge, guestCount]);

  const handleNext = () => {
    updateFormData({ 
      childName, 
      childAge, 
      guestCount 
    });
    onNext();
  };

  const incrementAge = () => {
    setChildAge(Math.min(childAge + 1, 15));
  };

  const decrementAge = () => {
    setChildAge(Math.max(childAge - 1, 1));
  };

  const incrementGuestCount = () => {
    setGuestCount(Math.min(guestCount + 1, 35));
  };

  const decrementGuestCount = () => {
    setGuestCount(Math.max(guestCount - 1, 5));
  };

  const isValid = childName && childAge && guestCount;

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
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            How old are they turning?
          </Label>
          <div className="flex items-center justify-center space-x-4 p-4 border-2 border-gray-200 rounded-xl">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={decrementAge}
              disabled={childAge <= 1}
              className="h-10 w-10 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={childAge}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setChildAge(Math.max(1, Math.min(15, value)));
              }}
              className="text-2xl font-semibold w-16 text-center border-0 bg-transparent focus:ring-0 focus:border-0"
              min="1"
              max="15"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={incrementAge}
              disabled={childAge >= 15}
              className="h-10 w-10 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            How many kids will attend? (including birthday child)
          </Label>
          <div className="flex items-center justify-center space-x-4 p-4 border-2 border-gray-200 rounded-xl">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={decrementGuestCount}
              disabled={guestCount <= 5}
              className="h-10 w-10 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={guestCount}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 5;
                setGuestCount(Math.max(5, Math.min(35, value)));
              }}
              className="text-2xl font-semibold w-16 text-center border-0 bg-transparent focus:ring-0 focus:border-0"
              min="5"
              max="35"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={incrementGuestCount}
              disabled={guestCount >= 35}
              className="h-10 w-10 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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
