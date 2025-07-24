import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StudioDateTimeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}



export function StudioDateTimeStep({ formData, updateFormData, onNext, onBack }: StudioDateTimeStepProps) {
  const [preferredDate, setPreferredDate] = useState(formData.studioPreferredDate || "");
  const [startTime, setStartTime] = useState(formData.studioStartTime || "");
  const [endTime, setEndTime] = useState(formData.studioEndTime || "");
  const [timeNotes, setTimeNotes] = useState(formData.studioTimeNotes || "");

  const handleNext = () => {
    updateFormData({ 
      studioPreferredDate: preferredDate,
      studioStartTime: startTime,
      studioEndTime: endTime,
      studioTimeNotes: timeNotes
    });
    onNext();
  };

  const isValid = preferredDate && startTime && endTime;

  // Calculate duration
  const calculateDuration = () => {
    if (!startTime || !endTime) return "";
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end <= start) return "Invalid time range";
    
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 1) {
      const diffMins = Math.round(diffMs / (1000 * 60));
      return `${diffMins} minutes`;
    } else if (diffHrs === Math.floor(diffHrs)) {
      return `${Math.floor(diffHrs)} hour${Math.floor(diffHrs) === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(diffHrs);
      const minutes = Math.round((diffHrs - hours) * 60);
      return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minutes`;
    }
  };

  const duration = calculateDuration();
  const isLongRental = startTime && endTime && (() => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffHrs = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diffHrs > 8;
  })();



  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">🕐</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Date & Time Range
        </h2>
        <p className="text-gray-600">
          When would you like to use our studio space?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Date *</Label>
          <Input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time *</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">End Time *</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
            />
          </div>
        </div>

        {duration && duration !== "Invalid time range" && (
          <div className={`p-4 rounded-xl ${isLongRental ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-sm font-medium ${isLongRental ? 'text-blue-800' : 'text-green-800'}`}>
              Rental Duration: {duration}
            </p>
            {isLongRental && (
              <p className="text-sm text-blue-700 mt-1">
                Extended rental: We offer special rates for full-day bookings (8+ hours).
              </p>
            )}
          </div>
        )}



        {duration === "Invalid time range" && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-800 font-medium">
              Please ensure end time is after start time.
            </p>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Additional Timing Notes (Optional)
          </Label>
          <Textarea
            value={timeNotes}
            onChange={(e) => setTimeNotes(e.target.value)}
            placeholder="Any flexibility with timing? Setup/breakdown time needed? Multiple date options? Any other scheduling preferences?"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300 min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Hours:</strong> Our studio is available 7 days a week from 8 AM to 10 PM. Setup and breakdown time can be included in your rental period.
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