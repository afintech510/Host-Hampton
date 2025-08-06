import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import partyDecorImage from "@assets/image_1752580256095.png";
import type { Addon } from "@shared/schema";

interface ExtrasStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExtrasStep({ formData, updateFormData, onNext, onBack }: ExtrasStepProps) {
  const [partyExtras, setPartyExtras] = useState<string[]>(formData.partyExtras || []);

  const { data: addonsData, isLoading } = useQuery({
    queryKey: ["/api/addons"],
    queryFn: async () => {
      const response = await fetch("/api/addons");
      const data = await response.json();
      if (data.success) {
        // Filter for decor, food, and drink add-ons only
        return data.addons.filter((addon: any) => 
          ['decor', 'food', 'drink'].includes(addon.category)
        );
      }
      return [];
    }
  });

  // Group addons by category
  const groupedAddons = addonsData?.reduce((groups: Record<string, Addon[]>, addon: Addon) => {
    const category = (addon as any).category || 'other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(addon);
    return groups;
  }, {}) || {};

  const handleAddonChange = (addonValue: string, checked: boolean) => {
    if (checked) {
      setPartyExtras([...partyExtras, addonValue]);
    } else {
      setPartyExtras(partyExtras.filter(addon => addon !== addonValue));
    }
  };

  const handleNext = () => {
    updateFormData({ partyExtras });
    onNext();
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'decor': return '🎈 Decorations & Photo Props';
      case 'food': return '🍪 Food & Treats';
      case 'drink': return '🥤 Beverages';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'decor': return '🎈';
      case 'food': return '🍪';
      case 'drink': return '🥤';
      default: return '✨';
    }
  };

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src={partyDecorImage}
          alt="Party decorations and extras"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Make it even more special!</h2>
        <p className="text-gray-600">
          Add decorations, treats, and beverages to complete your party
        </p>
      </div>

      <div className="space-y-6 mb-6 text-left">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="text-gray-500">Loading party extras...</div>
          </div>
        ) : (
          Object.entries(groupedAddons).map(([category, addons]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {getCategoryTitle(category)}
              </h3>
              <div className="space-y-2 ml-6">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors"
                  >
                    <Checkbox
                      id={addon.id.toString()}
                      checked={partyExtras.includes(addon.name)}
                      onCheckedChange={(checked) => handleAddonChange(addon.name, checked as boolean)}
                      className="mr-4"
                    />
                    <Label htmlFor={addon.id.toString()} className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{(addon as any).icon || '✨'}</span>
                        <div>
                          <span className="text-base font-medium">{addon.name}</span>
                          {addon.description && (
                            <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-coral ml-4">
                        ${(addon.price / 100).toFixed(0)}
                        {(addon as any).perGuest && ' per guest'}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-4">
        <UnifiedButton
          onClick={onBack}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          Back
        </UnifiedButton>
        <UnifiedButton
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="flex-1"
        >
          Continue
        </UnifiedButton>
      </div>
    </div>
  );
}