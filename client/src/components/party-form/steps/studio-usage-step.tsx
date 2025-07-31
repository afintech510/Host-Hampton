import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { useState } from "react";

interface StudioUsageStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const usageOptions = [
  {
    id: "diy-party",
    title: "DIY Party",
    description: "Host your own celebration in our beautiful space"
  },
  {
    id: "private-event",
    title: "Private Event",
    description: "Corporate events, meetings, or special gatherings"
  },
  {
    id: "partial-studio-rental",
    title: "Partial Studio Rental",
    description: "Rent part of our studio for your specific needs"
  }
];

export function StudioUsageStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: StudioUsageStepProps) {
  const [selectedUsage, setSelectedUsage] = useState(formData.studioUsage || "");

  const handleUsageSelect = (usage: string) => {
    setSelectedUsage(usage);
    updateFormData({ studioUsage: usage });
  };

  const handleNext = () => {
    if (selectedUsage) {
      onNext();
    }
  };

  const isValid = selectedUsage !== "";

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">🏢</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          What type of studio usage?
        </h2>
        <p className="text-gray-600">
          Choose the option that best describes your studio rental needs
        </p>
      </div>

      <div className="space-y-4">
        <RadioGroup value={selectedUsage} onValueChange={handleUsageSelect} className="space-y-3">
          {usageOptions.map((option, index) => {
            const isSelected = selectedUsage === option.id;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-pink-300 bg-pink-50"
                    : "border-gray-200 hover:border-pink-200 bg-white"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="text-lg font-medium cursor-pointer">
                      {option.title}
                    </Label>
                    <p className="text-gray-600 mt-1 text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </RadioGroup>
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