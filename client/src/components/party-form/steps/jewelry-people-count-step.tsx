import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JewelryPeopleCountStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function JewelryPeopleCountStep({ formData, updateFormData, onNext, onBack }: JewelryPeopleCountStepProps) {
  const [peopleCount, setPeopleCount] = useState(formData.jewelryPeopleCount || "");

  const handleNext = () => {
    updateFormData({ jewelryPeopleCount: parseInt(peopleCount) || 0 });
    onNext();
  };

  const isValid = peopleCount && parseInt(peopleCount) > 0;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">👥</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          How many people?
        </h2>
        <p className="text-gray-600">
          Let us know how many people will be getting permanent jewelry
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Number of People *</Label>
          <Input
            type="number"
            value={peopleCount}
            onChange={(e) => setPeopleCount(e.target.value)}
            placeholder="Enter number of people"
            min="1"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Each person can select multiple jewelry pieces during the experience.
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