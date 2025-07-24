import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import partyHornImage from "@assets/image_1752580300891.png";
import type { Addon } from "@shared/schema";

interface AddonsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AddonsStep({ formData, updateFormData, onNext, onBack }: AddonsStepProps) {
  const [partyAddons, setPartyAddons] = useState<string[]>(formData.partyAddons || []);

  const { data: addonsData, isLoading } = useQuery({
    queryKey: ["/api/addons"],
    select: (data: any) => data.addons as Addon[]
  });

  const handleAddonChange = (addonValue: string, checked: boolean) => {
    if (checked) {
      setPartyAddons([...partyAddons, addonValue]);
    } else {
      setPartyAddons(partyAddons.filter(addon => addon !== addonValue));
    }
  };

  const handleNext = () => {
    updateFormData({ partyAddons });
    onNext();
  };

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src={partyHornImage}
          alt="Colorful party horn with confetti"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Want to add some extra fun?</h2>
        <p className="text-gray-600">
          Select any add-ons to make the party even more special!
        </p>
      </div>

      <div className="space-y-3 mb-6 text-left">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="text-gray-500">Loading party extras...</div>
          </div>
        ) : (
          addonsData?.map((addon) => (
            <div
              key={addon.id}
              className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors"
            >
              <Checkbox
                id={addon.id.toString()}
                checked={partyAddons.includes(addon.name)}
                onCheckedChange={(checked) => handleAddonChange(addon.name, checked as boolean)}
                className="mr-4"
              />
              <Label htmlFor={addon.id.toString()} className="flex-1 flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <span className="text-xl mr-3">🎉</span>
                  <span className="text-lg">{addon.name}</span>
                </div>
                <span className="text-gray-500 text-sm">+${(addon.price / 100).toFixed(0)}</span>
              </Label>
            </div>
          ))
        )}
      </div>

      <UnifiedButton
        onClick={handleNext}
        variant="primary"
        size="lg"
        className="w-full"
      >
        Looks great!
      </UnifiedButton>
    </div>
  );
}
