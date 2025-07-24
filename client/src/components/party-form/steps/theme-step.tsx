import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import partyTimeImage from "@assets/image_1752579930605.png";

interface ThemeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface PartyTheme {
  id: number;
  name: string;
  description: string;
  price: number; // price in cents
  icon: string;
  color: string;
  active: boolean;
}

export function ThemeStep({ formData, updateFormData, onNext, onBack }: ThemeStepProps) {
  const [partyTheme, setPartyTheme] = useState(formData.partyTheme || "");

  // Fetch themes from database
  const { data: themes = [], isLoading } = useQuery({
    queryKey: ["/api/party-themes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/party-themes");
      const data = await response.json();
      return data.success ? data.themes : [];
    },
  });

  const handleNext = () => {
    updateFormData({ partyTheme });
    onNext();
  };

  const isValid = partyTheme;

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-300 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading themes...</p>
      </div>
    );
  }

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
          {themes.map((theme: PartyTheme) => (
            <div
              key={theme.id}
              className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors"
            >
              <RadioGroupItem value={theme.name} id={theme.name} className="mr-4" />
              <Label htmlFor={theme.name} className="flex items-center cursor-pointer flex-1">
                <span className="text-2xl mr-3">{theme.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-lg font-medium">{theme.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <UnifiedButton
        onClick={handleNext}
        disabled={!isValid}
        variant="primary"
        size="lg"
        className="w-full"
      >
        Perfect choice!
      </UnifiedButton>
    </div>
  );
}
