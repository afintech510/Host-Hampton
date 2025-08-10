import { useState, useEffect } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import birthdayStarImage from "@assets/image_1752580458121.png";

interface ChildDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ChildDetailsStep({ formData, updateFormData, onNext, onBack }: ChildDetailsStepProps) {
  const [childAge, setChildAge] = useState(formData.childAge || 5);
  const [guestCount, setGuestCount] = useState(formData.guestCount || 12);
  const [allergies, setAllergies] = useState<string[]>(formData.allergies || []);

  // Save to session storage whenever values change
  useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem('partyFormData') || '{}');
    sessionStorage.setItem('partyFormData', JSON.stringify({
      ...sessionData,
      childAge,
      guestCount,
      allergies
    }));
  }, [childAge, guestCount, allergies]);

  const handleNext = () => {
    updateFormData({ 
      childAge, 
      guestCount,
      allergies
    });
    onNext();
  };

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setAllergies([...allergies, allergy]);
    } else {
      setAllergies(allergies.filter(a => a !== allergy));
    }
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

  const isValid = childAge && guestCount;

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
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Any dietary restrictions or allergies?
          </Label>
          <div className="space-y-3">
            {[
              { id: 'gluten-free', label: '🌾 Gluten-Free', value: 'Gluten-Free' },
              { id: 'dairy-free', label: '🥛 Dairy-Free', value: 'Dairy-Free' },
              { id: 'nut-allergy', label: '🥜 Nut Allergy', value: 'Nut Allergy' }
            ].map((option) => (
              <div key={option.id} className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
                <Checkbox
                  id={option.id}
                  checked={allergies.includes(option.value)}
                  onCheckedChange={(checked) => handleAllergyChange(option.value, checked as boolean)}
                  className="mr-3"
                />
                <Label htmlFor={option.id} className="text-lg cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
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
