import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import partyHornImage from "@assets/image_1752580300891.png";

interface AddonsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const addons = [
  { value: "photo-booth", label: "Photo Booth", emoji: "📸", price: 50 },
  { value: "candy-wall", label: "Candy Wall", emoji: "🍭", price: 75 },
  { value: "balloons", label: "Extra Balloons", emoji: "🎈", price: 25 },
  { value: "karaoke", label: "Karaoke", emoji: "🎤", price: 40 },
  { value: "glitter-makeup", label: "Glittery Makeup", emoji: "✨", price: 30 },
  { value: "hair-tinsel", label: "Hair Tinsel", emoji: "💫", price: 25 },
  { value: "beaded-hair-braid", label: "Beaded Hair Braid", emoji: "🔮", price: 35 },
  { value: "glitter-tattoo", label: "Glitter Tattoo", emoji: "⭐", price: 20 },
  { value: "manicure", label: "Manicure", emoji: "💅", price: 40 },
  { value: "bracelet-making", label: "Bracelet Making", emoji: "📿", price: 30 },
];

export function AddonsStep({ formData, updateFormData, onNext, onBack }: AddonsStepProps) {
  const [partyAddons, setPartyAddons] = useState<string[]>(formData.partyAddons || []);

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
        {addons.map((addon) => (
          <div
            key={addon.value}
            className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors"
          >
            <Checkbox
              id={addon.value}
              checked={partyAddons.includes(addon.value)}
              onCheckedChange={(checked) => handleAddonChange(addon.value, checked as boolean)}
              className="mr-4"
            />
            <Label htmlFor={addon.value} className="flex-1 flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <span className="text-xl mr-3">{addon.emoji}</span>
                <span className="text-lg">{addon.label}</span>
              </div>
              <span className="text-gray-500 text-sm">+${addon.price}</span>
            </Label>
          </div>
        ))}
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
