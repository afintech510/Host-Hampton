import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import birthdayStarImage from "@assets/image_1752580458121.png";

interface ChildDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ChildDetailsStep({ formData, updateFormData, onNext, onBack }: ChildDetailsStepProps) {
  const [childName, setChildName] = useState(formData.childName || "");
  const [childAge, setChildAge] = useState(formData.childAge || "");
  const [guestCount, setGuestCount] = useState(formData.guestCount || "");

  const handleNext = () => {
    updateFormData({ 
      childName, 
      childAge: parseInt(childAge), 
      guestCount: parseInt(guestCount) 
    });
    onNext();
  };

  const isValid = childName && childAge && guestCount;

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src={birthdayStarImage}
          alt="Cute birthday star with party hat"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Tell us about the birthday star!</h2>
        <p className="text-gray-600">
          We want to make sure everything is perfect for your little one.
        </p>
      </div>

      <div className="space-y-6 text-left">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Birthday child's first name
          </Label>
          <Input
            type="text"
            placeholder="Enter their name"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            How old are they turning?
          </Label>
          <Select value={childAge} onValueChange={setChildAge}>
            <SelectTrigger className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral">
              <SelectValue placeholder="Select age" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age} year{age > 1 ? 's' : ''} old
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            How many kids will attend? (including birthday child)
          </Label>
          <Select value={guestCount} onValueChange={setGuestCount}>
            <SelectTrigger className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral">
              <SelectValue placeholder="Select number" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 children</SelectItem>
              <SelectItem value="8">8 children</SelectItem>
              <SelectItem value="10">10 children</SelectItem>
              <SelectItem value="12">12 children</SelectItem>
              <SelectItem value="15">15 children</SelectItem>
              <SelectItem value="18">18 children</SelectItem>
              <SelectItem value="20">20 children</SelectItem>
              <SelectItem value="25">25 children (max)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full bg-coral hover:bg-coral text-white py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
