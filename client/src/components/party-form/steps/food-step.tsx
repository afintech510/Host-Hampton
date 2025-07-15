import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

  const handleNext = () => {
    updateFormData({ foodChoice, cupcakeFlavor });
    onNext();
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
          </RadioGroup>
        </div>

        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full bg-coral hover:bg-coral text-white py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Tasty choices!
        </Button>
      </div>
    </div>
  );
}
