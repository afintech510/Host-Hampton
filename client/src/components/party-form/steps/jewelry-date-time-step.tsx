import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface JewelryDateTimeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function JewelryDateTimeStep({ formData, updateFormData, onNext, onBack }: JewelryDateTimeStepProps) {
  const [dateChoice, setDateChoice] = useState(formData.jewelryDateChoice || "");
  const [preferredDate, setPreferredDate] = useState(formData.jewelryPreferredDate || "");
  const [preferredTime, setPreferredTime] = useState(formData.jewelryPreferredTime || "");

  const handleNext = () => {
    const dateData = dateChoice === "unsure" 
      ? { jewelryDateChoice: dateChoice, jewelryPreferredDate: "", jewelryPreferredTime: "" }
      : { jewelryDateChoice: dateChoice, jewelryPreferredDate: preferredDate, jewelryPreferredTime: preferredTime };
    
    updateFormData(dateData);
    onNext();
  };

  const isValid = dateChoice === "unsure" || (preferredDate && preferredTime);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">📅</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Date & time preference
        </h2>
        <p className="text-gray-600">
          When would you like to schedule your permanent jewelry experience?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Date Preference</Label>
          <RadioGroup value={dateChoice} onValueChange={setDateChoice} className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="specific" id="jewelry-specific" className="mr-3" />
              <Label htmlFor="jewelry-specific" className="text-lg cursor-pointer flex-1">
                I have a specific date & time preference
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="unsure" id="jewelry-unsure" className="mr-3" />
              <Label htmlFor="jewelry-unsure" className="text-lg cursor-pointer flex-1">
                I'm unsure - let's discuss options
              </Label>
            </div>
          </RadioGroup>
        </div>

        {dateChoice === "specific" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Date</Label>
              <Input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Time</Label>
              <Input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          className="flex-1 bg-pink-300 hover:bg-pink-400 text-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}