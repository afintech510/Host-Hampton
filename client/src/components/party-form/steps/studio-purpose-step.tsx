import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StudioPurposeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const commonPurposes = [
  { id: "photoshoot", label: "Photography/Photoshoot" },
  { id: "video", label: "Video Recording/Production" },
  { id: "meeting", label: "Business Meeting/Presentation" },
  { id: "workshop", label: "Private Workshop/Training" },
  { id: "art", label: "Art/Creative Project" },
  { id: "event", label: "Small Private Event" },
  { id: "other", label: "Other (please specify)" }
];

export function StudioPurposeStep({ formData, updateFormData, onNext, onBack }: StudioPurposeStepProps) {
  const [selectedPurpose, setSelectedPurpose] = useState(formData.studioPurpose || "");
  const [customPurpose, setCustomPurpose] = useState(formData.customStudioPurpose || "");
  const [purposeDescription, setPurposeDescription] = useState(formData.studioPurposeDescription || "");

  const handleNext = () => {
    updateFormData({ 
      studioPurpose: selectedPurpose,
      customStudioPurpose: selectedPurpose === "other" ? customPurpose : "",
      studioPurposeDescription: purposeDescription
    });
    onNext();
  };

  const isValid = selectedPurpose && 
    (selectedPurpose !== "other" || customPurpose.trim()) && 
    purposeDescription.trim();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">🏢</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Why do you need the space?
        </h2>
        <p className="text-gray-600">
          Tell us about your studio rental needs so we can prepare the perfect space for you
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Purpose of Rental *</Label>
          <RadioGroup value={selectedPurpose} onValueChange={setSelectedPurpose} className="space-y-3">
            {commonPurposes.map((purpose) => (
              <div key={purpose.id} className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
                <RadioGroupItem value={purpose.id} id={purpose.id} className="mr-3" />
                <Label htmlFor={purpose.id} className="text-base cursor-pointer flex-1">
                  {purpose.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {selectedPurpose === "other" && (
          <div className="animate-in fade-in duration-300">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Please specify your purpose *</Label>
            <Input
              type="text"
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
              placeholder="Describe your studio rental purpose"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
            />
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Additional Details *</Label>
          <Textarea
            value={purposeDescription}
            onChange={(e) => setPurposeDescription(e.target.value)}
            placeholder="Please provide more details about your needs: What equipment will you bring? Any special setup requirements? Duration of use? Any other important information?"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300 min-h-[120px] resize-none"
            rows={5}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Studio Features:</strong> Our space includes professional lighting, backdrop options, sound system, tables, chairs, and basic AV equipment. Kitchen facilities and restrooms are available.
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