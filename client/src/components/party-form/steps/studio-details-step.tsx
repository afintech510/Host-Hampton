import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface StudioDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StudioDetailsStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: StudioDetailsStepProps) {
  const [eventDescription, setEventDescription] = useState(formData.eventDescription || "");
  const [adultCount, setAdultCount] = useState(formData.adultCount || 0);
  const [childCount, setChildCount] = useState(formData.childCount || 0);
  const [eventLocation, setEventLocation] = useState(formData.eventLocation || "studio");
  const [mobileAddress, setMobileAddress] = useState(formData.mobileAddress || "");

  const handleNext = () => {
    updateFormData({
      eventDescription,
      adultCount,
      childCount,
      eventLocation,
      mobileAddress,
    });
    onNext();
  };

  const isValid = eventDescription.trim() !== "" && (adultCount > 0 || childCount > 0);

  const incrementCount = (type: 'adult' | 'child') => {
    if (type === 'adult') {
      setAdultCount(Math.min(adultCount + 1, 50));
    } else {
      setChildCount(Math.min(childCount + 1, 50));
    }
  };

  const decrementCount = (type: 'adult' | 'child') => {
    if (type === 'adult') {
      setAdultCount(Math.max(adultCount - 1, 0));
    } else {
      setChildCount(Math.max(childCount - 1, 0));
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">📝</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Tell us about your event
        </h2>
        <p className="text-gray-600">
          Help us understand your needs so we can prepare the perfect space
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Event Description *
          </Label>
          <Textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Tell us about your event - what will you be doing in the studio?"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300 min-h-[120px] resize-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Number of Adults *
            </Label>
            <div className="flex items-center justify-center space-x-4 p-4 border-2 border-gray-200 rounded-xl">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => decrementCount('adult')}
                disabled={adultCount <= 0}
                className="h-10 w-10 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={adultCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setAdultCount(Math.max(0, Math.min(50, value)));
                }}
                className="text-2xl font-semibold w-16 text-center border-0 bg-transparent focus:ring-0 focus:border-0"
                min="0"
                max="50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => incrementCount('adult')}
                disabled={adultCount >= 50}
                className="h-10 w-10 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Number of Children
            </Label>
            <div className="flex items-center justify-center space-x-4 p-4 border-2 border-gray-200 rounded-xl">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => decrementCount('child')}
                disabled={childCount <= 0}
                className="h-10 w-10 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={childCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setChildCount(Math.max(0, Math.min(50, value)));
                }}
                className="text-2xl font-semibold w-16 text-center border-0 bg-transparent focus:ring-0 focus:border-0"
                min="0"
                max="50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => incrementCount('child')}
                disabled={childCount >= 50}
                className="h-10 w-10 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Location Preference *
          </Label>
          <Select value={eventLocation} onValueChange={setEventLocation}>
            <SelectTrigger className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">At Host Hampton Studio</SelectItem>
              <SelectItem value="mobile">Mobile Service (We come to you)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {eventLocation === "mobile" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="animate-in fade-in duration-300"
          >
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Address *
            </Label>
            <Textarea
              value={mobileAddress}
              onChange={(e) => setMobileAddress(e.target.value)}
              placeholder="Please provide your full address including city, state, and zip code"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
              rows={3}
            />
          </motion.div>
        )}

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Our Studio Features:</strong> Professional lighting, backdrop options, sound system, tables, chairs, basic AV equipment, kitchen facilities, and restrooms available.
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
          disabled={!isValid || (eventLocation === "mobile" && !mobileAddress.trim())}
          variant="primary"
          className="flex-1"
        >
          Continue
        </UnifiedButton>
      </div>
    </div>
  );
}