import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface WorkshopScheduleStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WorkshopScheduleStep({ formData, updateFormData, onNext, onBack }: WorkshopScheduleStepProps) {
  const [scheduleChoice, setScheduleChoice] = useState(formData.scheduleChoice || "");
  const [preferredDate, setPreferredDate] = useState(formData.preferredDate || "");
  const [startTime, setStartTime] = useState(formData.startTime || "");
  const [endTime, setEndTime] = useState(formData.endTime || "");
  const [scheduleNotes, setScheduleNotes] = useState(formData.scheduleNotes || "");

  const handleNext = () => {
    const scheduleData = scheduleChoice === "unsure" 
      ? { scheduleChoice, preferredDate: "", startTime: "", endTime: "", scheduleNotes }
      : { scheduleChoice, preferredDate, startTime, endTime, scheduleNotes };
    
    updateFormData(scheduleData);
    onNext();
  };

  const isValid = scheduleChoice === "unsure" || (preferredDate && startTime && endTime);
  const isSeries = formData.classFormat === "series";

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">🗓️</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isSeries ? "Schedule your Class Series" : "When would you like your Workshop?"}
        </h2>
        <p className="text-gray-600">
          {isSeries 
            ? "Let us know your timing preferences for the series of classes"
            : "Choose your preferred date and time, or select 'Unsure' to discuss options"
          }
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Schedule Preference</Label>
          <RadioGroup value={scheduleChoice} onValueChange={setScheduleChoice} className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="specific" id="specific-schedule" className="mr-3" />
              <Label htmlFor="specific-schedule" className="text-lg cursor-pointer flex-1">
                {isSeries ? "I have specific dates/times in mind" : "I have a specific date and time in mind"}
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="unsure" id="unsure-schedule" className="mr-3" />
              <Label htmlFor="unsure-schedule" className="text-lg cursor-pointer flex-1">
                I'm unsure - let's discuss options
              </Label>
            </div>
          </RadioGroup>
        </div>

        {scheduleChoice === "specific" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                {isSeries ? "First Class Date" : "Workshop Date"}
              </Label>
              <Input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
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

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Additional Schedule Notes {scheduleChoice === "unsure" ? "*" : "(Optional)"}
          </Label>
          <Textarea
            value={scheduleNotes}
            onChange={(e) => setScheduleNotes(e.target.value)}
            placeholder={
              isSeries 
                ? "For series: How many sessions? Weekly/bi-weekly? Any preferred days of the week? Duration per session?"
                : "Any scheduling preferences, flexibility, or special timing requirements?"
            }
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300 min-h-[80px] resize-none"
            rows={3}
          />
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
          disabled={!isValid || (scheduleChoice === "unsure" && !scheduleNotes.trim())}
          variant="primary"
          className="flex-1"
        >
          Continue
        </UnifiedButton>
      </div>
    </div>
  );
}