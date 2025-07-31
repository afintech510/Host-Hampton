import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, MapPin } from "lucide-react";

interface JewelryWhenWhereStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function JewelryWhenWhereStep({ formData, updateFormData, onNext, onBack }: JewelryWhenWhereStepProps) {
  const [selectedDate, setSelectedDate] = useState(formData.jewelryDate || "");
  const [selectedTime, setSelectedTime] = useState(formData.jewelryTime || "");
  const [location, setLocation] = useState(formData.jewelryLocation || "host-hampton");
  const [mobileAddress, setMobileAddress] = useState(formData.jewelryMobileAddress || "");

  const handleNext = () => {
    updateFormData({ 
      jewelryDate: selectedDate,
      jewelryTime: selectedTime,
      jewelryLocation: location,
      jewelryMobileAddress: location === "mobile" ? mobileAddress : ""
    });
    onNext();
  };

  const isValid = selectedDate && selectedTime && location && (location !== "mobile" || mobileAddress.trim());

  // Generate time options
  const timeOptions = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
      timeOptions.push({ value: time24, label: time12 });
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto flex items-center justify-center">
          <Calendar className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          When & Where?
        </h2>
        <p className="text-gray-600">
          Let's schedule your permanent jewelry experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Date Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Date *</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Time Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time *</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Location *</Label>
          <RadioGroup value={location} onValueChange={setLocation} className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-colors">
              <RadioGroupItem value="host-hampton" id="host-hampton" />
              <Label htmlFor="host-hampton" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Host Hampton Studio</div>
                    <div className="text-sm text-gray-600">Come to our beautiful studio</div>
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-colors">
              <RadioGroupItem value="mobile" id="mobile" />
              <Label htmlFor="mobile" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Mobile Service</div>
                    <div className="text-sm text-gray-600">We'll come to you</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Mobile Address Field */}
        {location === "mobile" && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Your Address *</Label>
            <Input
              type="text"
              value={mobileAddress}
              onChange={(e) => setMobileAddress(e.target.value)}
              placeholder="Enter your address for mobile service"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
            />
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> We'll confirm your booking details and send calendar invites after receiving your request.
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