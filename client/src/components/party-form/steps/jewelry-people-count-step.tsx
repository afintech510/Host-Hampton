import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface JewelryPeopleCountStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function JewelryPeopleCountStep({ formData, updateFormData, onNext, onBack }: JewelryPeopleCountStepProps) {
  const [visionText, setVisionText] = useState(formData.jewelryVision || "");
  const [peopleCount, setPeopleCount] = useState(formData.jewelryPeopleCount || 4);

  const handleNext = () => {
    updateFormData({ 
      jewelryVision: visionText,
      jewelryPeopleCount: peopleCount 
    });
    onNext();
  };

  const increasePeople = () => {
    setPeopleCount(prev => prev + 1);
  };

  const decreasePeople = () => {
    setPeopleCount(prev => Math.max(1, prev - 1));
  };

  const isValid = peopleCount > 0;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">✨</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          What's your Vision?
        </h2>
        <p className="text-gray-600">
          Tell us about your permanent jewelry experience
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Tell Us More:</Label>
          <Textarea
            value={visionText}
            onChange={(e) => setVisionText(e.target.value)}
            placeholder="Describe your vision for the permanent jewelry experience..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300 min-h-[120px]"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">How many people? *</Label>
          <div className="flex items-center justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={decreasePeople}
              disabled={peopleCount <= 1}
              className="h-12 w-12 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
              {peopleCount}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={increasePeople}
              className="h-12 w-12 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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