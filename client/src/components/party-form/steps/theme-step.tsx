import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import partyTimeImage from "@assets/image_1752579930605.png";

interface ThemeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const themes = [
  { value: "slime", label: "Slime Party", emoji: "🧪" },
  { value: "taylor-swift", label: "Taylor Swift", emoji: "🎤" },
  { value: "barbie", label: "Barbie", emoji: "💗" },
  { value: "spa", label: "Spa Party", emoji: "🧘‍♀️" },
  { value: "unicorn", label: "Unicorn Magic", emoji: "🦄" },
  { value: "trucker-hat", label: "Trucker Hat / Pouch", emoji: "🧢" },
  { value: "sweets-treats", label: "Sweets & Treats", emoji: "🍭" },
  { value: "toddler", label: "Toddler", emoji: "👶" },
  { value: "custom", label: "Custom Theme", emoji: "🎨" },
];

export function ThemeStep({ formData, updateFormData, onNext, onBack }: ThemeStepProps) {
  const [partyTheme, setPartyTheme] = useState(formData.partyTheme || "");

  const handleNext = () => {
    updateFormData({ partyTheme });
    onNext();
  };

  const isValid = partyTheme;

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src={partyTimeImage}
          alt="Party time neon decorations"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">What's your party vibe?</h2>
        <p className="text-gray-600">
          Choose a theme that'll make your little one's day extra special!
        </p>
      </div>

      <div className="space-y-4 mb-6 text-left">
        <RadioGroup value={partyTheme} onValueChange={setPartyTheme} className="space-y-4">
          {themes.map((theme) => (
            <div
              key={theme.value}
              className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors"
            >
              <RadioGroupItem value={theme.value} id={theme.value} className="mr-4" />
              <Label htmlFor={theme.value} className="flex items-center cursor-pointer flex-1">
                <span className="text-2xl mr-3">{theme.emoji}</span>
                <span className="text-lg font-medium">{theme.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button
        onClick={handleNext}
        disabled={!isValid}
        className="w-full bg-coral hover:bg-coral text-white py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        Perfect choice!
      </Button>
    </div>
  );
}
