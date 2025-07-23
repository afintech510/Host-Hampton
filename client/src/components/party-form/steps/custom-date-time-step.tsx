import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CustomDateTimeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CustomDateTimeStep({ formData, updateFormData, onNext, onBack }: CustomDateTimeStepProps) {
  const [dateChoice, setDateChoice] = useState(formData.dateChoice || "");
  const [partyDate, setPartyDate] = useState(formData.partyDate || "");
  const [startTime, setStartTime] = useState(formData.startTime || "");
  const [endTime, setEndTime] = useState(formData.endTime || "");

  const handleNext = () => {
    const dateData = dateChoice === "unsure" 
      ? { dateChoice, partyDate: "", startTime: "", endTime: "" }
      : { dateChoice, partyDate, startTime, endTime };
    
    updateFormData(dateData);
    onNext();
  };

  const isValid = dateChoice === "unsure" || (partyDate && startTime && endTime);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">📅</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          When would you like your event?
        </h2>
        <p className="text-gray-600">
          Let us know your preferred date and time, or select "Unsure" if you'd like to discuss options
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Date Preference</Label>
          <RadioGroup value={dateChoice} onValueChange={setDateChoice} className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="specific" id="specific" className="mr-3" />
              <Label htmlFor="specific" className="text-lg cursor-pointer flex-1">
                I have a specific date in mind
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="unsure" id="unsure" className="mr-3" />
              <Label htmlFor="unsure" className="text-lg cursor-pointer flex-1">
                I'm unsure - let's discuss options
              </Label>
            </div>
          </RadioGroup>
        </div>

        {dateChoice === "specific" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Event Date</Label>
              <Input
                type="date"
                value={partyDate}
                onChange={(e) => setPartyDate(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
                />
              </div>
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