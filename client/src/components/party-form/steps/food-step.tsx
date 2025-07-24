import { useState, useEffect } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

import CnP_15072025_075558 from "@assets/CnP_15072025_075558.png";

interface FoodStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FoodStep({ formData, updateFormData, onNext, onBack }: FoodStepProps) {
  const [foodChoice, setFoodChoice] = useState(formData.foodChoice || "");
  const [cupcakeFlavor, setCupcakeFlavor] = useState(formData.cupcakeFlavor || "");
  const [specialNeeds, setSpecialNeeds] = useState<string[]>(formData.specialNeeds || []);

  // Save to session storage whenever values change
  useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem('partyFormData') || '{}');
    sessionStorage.setItem('partyFormData', JSON.stringify({
      ...sessionData,
      foodChoice,
      cupcakeFlavor,
      specialNeeds
    }));
  }, [foodChoice, cupcakeFlavor, specialNeeds]);

  const handleNext = () => {
    updateFormData({ foodChoice, cupcakeFlavor, specialNeeds });
    onNext();
  };

  const handleSpecialNeedsChange = (need: string, checked: boolean) => {
    if (checked) {
      setSpecialNeeds([...specialNeeds, need]);
    } else {
      setSpecialNeeds(specialNeeds.filter(n => n !== need));
    }
  };

  const isValid = foodChoice && cupcakeFlavor;

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src={CnP_15072025_075558}
          alt="Party food and treats"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">What about the yummy stuff?</h2>
        <p className="text-gray-600">
          Let's pick some delicious food and treats for the party!
        </p>
      </div>
      <div className="space-y-6 text-left">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Food Selection</Label>
          <RadioGroup value={foodChoice} onValueChange={setFoodChoice} className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="pizza" id="pizza" className="mr-3" />
              <Label htmlFor="pizza" className="text-lg cursor-pointer flex-1">
                🍕 Pizza
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="bagels" id="bagels" className="mr-3" />
              <Label htmlFor="bagels" className="text-lg cursor-pointer flex-1">
                🥯 Bagels
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="none" id="food-none" className="mr-3" />
              <Label htmlFor="food-none" className="text-lg cursor-pointer flex-1">
                ❌ None
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Cupcake Flavor</Label>
          <RadioGroup value={cupcakeFlavor} onValueChange={setCupcakeFlavor} className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="vanilla" id="vanilla" className="mr-3" />
              <Label htmlFor="vanilla" className="text-lg cursor-pointer flex-1">
                🧁 Vanilla
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="chocolate" id="chocolate" className="mr-3" />
              <Label htmlFor="chocolate" className="text-lg cursor-pointer flex-1">
                🍫 Chocolate
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="none" id="cupcake-none" className="mr-3" />
              <Label htmlFor="cupcake-none" className="text-lg cursor-pointer flex-1">
                ❌ None
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Special Needs (Select all that apply)</Label>
          <div className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
              <Checkbox
                id="gluten-free"
                checked={specialNeeds.includes("gluten-free")}
                onCheckedChange={(checked) => handleSpecialNeedsChange("gluten-free", checked as boolean)}
                className="mr-3"
              />
              <Label htmlFor="gluten-free" className="text-lg cursor-pointer flex-1">
                🌾 Gluten-Free
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <Checkbox
                id="dairy-free"
                checked={specialNeeds.includes("dairy-free")}
                onCheckedChange={(checked) => handleSpecialNeedsChange("dairy-free", checked as boolean)}
                className="mr-3"
              />
              <Label htmlFor="dairy-free" className="text-lg cursor-pointer flex-1">
                🥛 Dairy-Free
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 transition-colors">
              <Checkbox
                id="nut-allergy"
                checked={specialNeeds.includes("nut-allergy")}
                onCheckedChange={(checked) => handleSpecialNeedsChange("nut-allergy", checked as boolean)}
                className="mr-3"
              />
              <Label htmlFor="nut-allergy" className="text-lg cursor-pointer flex-1">
                🥜 Nut Allergy
              </Label>
            </div>
          </div>
        </div>

        <UnifiedButton
          onClick={handleNext}
          disabled={!isValid}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Tasty choices!
        </UnifiedButton>
      </div>
    </div>
  );
}
