import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
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
  const [customThemeText, setCustomThemeText] = useState(formData.customThemeText || "");

  // Fetch themes from database
  const { data: themes = [], isLoading } = useQuery({
    queryKey: ["/api/party-themes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/party-themes");
      const data = await response.json();
      return data.success ? data.themes : [];
    },
  });

  // Custom theme option
  const customTheme: PartyTheme = {
    id: -1,
    name: "Custom",
    description: "Tell us about your unique party vision!",
    price: 0,
    icon: "🎨",
    color: "#8B5CF6",
    active: true,
  };

  const handleNext = () => {
    updateFormData({ 
      partyTheme,
      customThemeText: partyTheme === "Custom" ? customThemeText : ""
    });
    onNext();
  };

  const isValid = partyTheme && (partyTheme !== "Custom" || (partyTheme === "Custom" && customThemeText.trim()));

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
          
          {/* Custom Theme Option */}
          <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-coral transition-colors">
            <RadioGroupItem value={customTheme.name} id={customTheme.name} className="mr-4" />
            <Label htmlFor={customTheme.name} className="flex items-center cursor-pointer flex-1">
              <span className="text-2xl mr-3">{customTheme.icon}</span>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-lg font-medium">{customTheme.name}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{customTheme.description}</p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {/* Custom Theme Text Input */}
        {partyTheme === "Custom" && (
          <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <Label htmlFor="customThemeText" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your custom party theme:
            </Label>
            <textarea
              id="customThemeText"
              placeholder="e.g., Unicorn and rainbow theme with glitter decorations..."
              value={customThemeText}
              onChange={(e) => setCustomThemeText(e.target.value)}
              className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
            />
          </div>
        )}
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
