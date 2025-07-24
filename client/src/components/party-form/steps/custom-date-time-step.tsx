import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";

interface CustomDateTimeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface RoomRentalPricing {
  id: number;
  duration: number;
  weekendPrice: number;
  weekdayPrice: number;
  active: boolean;
  createdAt: Date;
}

interface PricingResponse {
  success: boolean;
  pricing: RoomRentalPricing[];
}

export function CustomDateTimeStep({ formData, updateFormData, onNext, onBack }: CustomDateTimeStepProps) {
  const [dateChoice, setDateChoice] = useState(formData.dateChoice || "");
  const [partyDate, setPartyDate] = useState(formData.partyDate || "");
  const [startTime, setStartTime] = useState(formData.startTime || "");
  const [endTime, setEndTime] = useState(formData.endTime || "");

  // Fetch room rental pricing from the database
  const { data: pricingData, isLoading } = useQuery<PricingResponse>({
    queryKey: ['/api/room-rental-pricing'],
    queryFn: undefined // Using default fetcher
  });

  // Calculate duration and pricing based on date and time
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

  // Calculate pricing based on duration and day of week
  const calculatePricing = () => {
    if (!startTime || !endTime || !partyDate || !pricingData?.success || !pricingData?.pricing) return null;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffHrs = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffHrs <= 0) return null;
    
    // Get the day of the week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(partyDate).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Find the pricing tier based on duration
    let pricing = null;
    for (const tier of pricingData.pricing) {
      if (diffHrs <= tier.duration) {
        pricing = tier;
        break;
      }
    }
    
    // If duration exceeds all tiers, use the highest tier
    if (!pricing) {
      pricing = pricingData.pricing[pricingData.pricing.length - 1];
    }
    
    const basePrice = isWeekend ? pricing.weekendPrice : pricing.weekdayPrice;
    const securityDeposit = 20000; // $200 in cents
    
    return {
      basePrice,
      securityDeposit,
      total: basePrice + securityDeposit,
      isWeekend,
      hours: Math.ceil(diffHrs),
      pricePerHour: Math.round(basePrice / pricing.duration)
    };
  };

  const duration = calculateDuration();
  const pricing = calculatePricing();

  const handleNext = () => {
    const dateData = dateChoice === "unsure" 
      ? { dateChoice, partyDate: "", startTime: "", endTime: "", rentalPricing: null }
      : { dateChoice, partyDate, startTime, endTime, rentalPricing: pricing };
    
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

            {/* Duration and Pricing Display */}
            {dateChoice === "specific" && duration && duration !== "Invalid time range" && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-sm font-medium text-green-800">
                  Event Duration: {duration}
                </p>
              </div>
            )}

            {dateChoice === "specific" && duration === "Invalid time range" && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <p className="text-sm text-red-800 font-medium">
                  Please ensure end time is after start time.
                </p>
              </div>
            )}

            {dateChoice === "specific" && pricing && (
              <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-xl border border-pink-200">
                <h3 className="font-semibold text-pink-800 mb-3">Pricing Estimate</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Space Rental ({pricing.hours} hour{pricing.hours > 1 ? 's' : ''})</span>
                    <span className="font-medium text-gray-900">${(pricing.basePrice / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-medium text-gray-900">${(pricing.securityDeposit / 100).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Total Due</span>
                      <span className="font-bold text-lg text-pink-700">${(pricing.total / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {pricing.isWeekend ? 'Weekend rate' : 'Weekday rate'} applied. 
                    Approx. ${(pricing.pricePerHour / 100).toFixed(0)}/hour
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
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