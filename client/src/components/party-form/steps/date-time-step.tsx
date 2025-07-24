import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DateTimeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DateTimeStep({ formData, updateFormData, onNext, onBack }: DateTimeStepProps) {
  const [partyDate, setPartyDate] = useState(formData.partyDate || "");
  const [partyTime, setPartyTime] = useState(formData.partyTime || "");

  const handleNext = () => {
    updateFormData({ partyDate, partyTime });
    onNext();
  };

  const isValid = partyDate && partyTime;

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
          alt="Birthday party setup"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">When would you like to party?</h2>
        <p className="text-gray-600">
          We're available Saturdays and Sundays with flexible time slots!
        </p>
      </div>

      <div className="space-y-6 text-left">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Party Date</Label>
          <Input
            type="date"
            value={partyDate}
            onChange={(e) => setPartyDate(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Time Slot</Label>
          <RadioGroup value={partyTime} onValueChange={setPartyTime} className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="10am-12pm" id="time1" className="mr-3" />
              <Label htmlFor="time1" className="text-lg cursor-pointer flex-1">
                10:00 AM - 12:00 PM
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="1pm-3pm" id="time2" className="mr-3" />
              <Label htmlFor="time2" className="text-lg cursor-pointer flex-1">
                1:00 PM - 3:00 PM
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
              <RadioGroupItem value="4pm-6pm" id="time3" className="mr-3" />
              <Label htmlFor="time3" className="text-lg cursor-pointer flex-1">
                4:00 PM - 6:00 PM
              </Label>
            </div>
          </RadioGroup>
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
