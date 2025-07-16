import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import partyHornImage from "@assets/image_1752580300891.png";
import type { PartyExtra } from "@shared/schema";

interface AddonsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AddonsStep({ formData, updateFormData, onNext, onBack }: AddonsStepProps) {
  const [partyAddons, setPartyAddons] = useState<string[]>(formData.partyAddons || []);

  const { data: extrasData, isLoading } = useQuery({
    queryKey: ["/api/party-extras"],
    select: (data: any) => data.extras as PartyExtra[]
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
          extrasData?.map((extra) => (
            <div
              key={extra.id}
              className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors"
            >
              <Checkbox
                id={extra.id.toString()}
                checked={partyAddons.includes(extra.name)}
                onCheckedChange={(checked) => handleAddonChange(extra.name, checked as boolean)}
                className="mr-4"
              />
              <Label htmlFor={extra.id.toString()} className="flex-1 flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{extra.icon}</span>
                  <span className="text-lg">{extra.name}</span>
                </div>
                <span className="text-gray-500 text-sm">+${(extra.price / 100).toFixed(0)}</span>
              </Label>
            </div>
          ))
        )}
      </div>

      <Button
        onClick={handleNext}
        className="w-full bg-coral hover:bg-coral text-white py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-200"
      >
        Looks great!
      </Button>
    </div>
  );
}
