import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Palette, Shirt, Plus } from "lucide-react";

interface HatDesignStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function HatDesignStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: HatDesignStepProps) {
  const handleNext = () => {
    onNext();
  };

  const handleCustomPatchesToggle = (enabled: boolean) => {
    updateFormData({ 
      hasCustomPatches: enabled,
      customPatchQuantity: enabled ? (formData.customPatchQuantity || 1) : 0
    });
  };

  const handlePatchQuantityChange = (value: string) => {
    const quantity = Math.max(0, parseInt(value) || 0);
    updateFormData({ customPatchQuantity: quantity });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Palette className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Design Your Hats</h2>
        </div>
        <p className="text-gray-600">Tell us about your vision for the trucker hats</p>
      </div>

      {/* Hat Theme/Color Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-purple-600" />
            Hat Theme & Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              id="hatTheme"
              placeholder="e.g., Marvel Comic theme with white and red hats, or Navy blue with gold accents..."
              value={formData.hatTheme || ''}
              onChange={(e) => updateFormData({ hatTheme: e.target.value })}
              className="mt-2 min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-2">
              Describe your preferred hat colors, themes, or any specific design elements
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Patches Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Custom Patches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="customPatches"
              checked={formData.hasCustomPatches || false}
              onCheckedChange={handleCustomPatchesToggle}
            />
            <Label htmlFor="customPatches" className="text-sm font-medium">
              Add Custom Patches (+$5 each)
            </Label>
          </div>

          {formData.hasCustomPatches && (
            <div className="space-y-3 pl-6 border-l-2 border-green-200">
              <div>
                <Label htmlFor="patchQuantity" className="text-sm font-medium">
                  Number of Custom Patches
                </Label>
                <Input
                  id="patchQuantity"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.customPatchQuantity || 1}
                  onChange={(e) => handlePatchQuantityChange(e.target.value)}
                  className="mt-2 w-32"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total patch cost: ${((formData.customPatchQuantity || 1) * 5).toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="patchDescription" className="text-sm font-medium">
                  Patch Design Description
                </Label>
                <Textarea
                  id="patchDescription"
                  placeholder="Describe your custom patch design, text, logos, or images..."
                  value={formData.patchDescription || ''}
                  onChange={(e) => updateFormData({ patchDescription: e.target.value })}
                  className="mt-2 min-h-[80px]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
        >
          Continue to Date & Time
        </Button>
      </div>
    </div>
  );
}