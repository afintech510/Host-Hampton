import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceFormData } from "@/pages/invoice";

interface ThemeStepProps {
  formData: InvoiceFormData;
  updateFormData: (updates: Partial<InvoiceFormData>) => void;
  onNext: () => void;
  addons: any[];
}

export default function ThemeStep({ formData, updateFormData, onNext, addons }: ThemeStepProps) {
  const themeAddons = addons.filter(addon => addon.category === 'theme');
  const standardTheme = themeAddons.find(theme => theme.name.includes('Standard'));
  const customTheme = themeAddons.find(theme => theme.name.includes('Custom'));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Theme & Decor Package
        </h2>
        <p className="text-gray-600">
          Choose your party theme - the foundation for your celebration
        </p>
      </div>

      <Card className="border-2 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎨 Theme Selection
          </CardTitle>
          <CardDescription>
            Select one theme or choose custom to tell us your vision!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.themeType}
            onValueChange={(value: 'standard' | 'custom') => 
              updateFormData({ themeType: value })
            }
            className="space-y-4"
          >
            {/* Standard Theme Option */}
            <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-pink-300 transition-colors">
              <RadioGroupItem value="standard" id="standard" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="standard" className="text-lg font-semibold cursor-pointer">
                  Standard Themes
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Choose from our collection of popular party themes
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-pink-600">
                    ${standardTheme ? (standardTheme.price / 100).toFixed(0) : '875'}
                  </span>
                  <span className="text-sm text-gray-500">base price</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Includes themed decorations, table setup, and backdrop
                </div>
              </div>
            </div>

            {/* Custom Theme Option */}
            <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-purple-300 transition-colors">
              <RadioGroupItem value="custom" id="custom" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="custom" className="text-lg font-semibold cursor-pointer">
                  Custom Theme Package
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Fully customized theme based on your unique vision
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-purple-600">
                    ${customTheme ? (customTheme.price / 100).toFixed(0) : '950'}
                  </span>
                  <span className="text-sm text-gray-500">starting price</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Custom decorations, personalized setup, and unique elements
                </div>
              </div>
            </div>
          </RadioGroup>

          {/* Custom Theme Description */}
          {formData.themeType === 'custom' && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Label htmlFor="themeDescription" className="text-sm font-medium mb-2 block">
                Describe Your Vision
              </Label>
              <Textarea
                id="themeDescription"
                placeholder="Tell us about your dream party theme... colors, characters, style, special elements, etc."
                value={formData.themeDescription || ''}
                onChange={(e) => updateFormData({ themeDescription: e.target.value })}
                className="min-h-[100px] border-purple-300 focus:border-purple-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balloon Add-ons Preview */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">🎈 Balloon Options</CardTitle>
          <CardDescription>
            Enhance your theme with balloon decorations (selected in package level)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addons
              .filter(addon => addon.category === 'decor' && addon.name.includes('Balloon'))
              .map(balloon => (
                <div key={balloon.id} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">{balloon.icon}</div>
                  <div className="font-medium text-sm">{balloon.name}</div>
                  <div className="text-pink-600 font-semibold">
                    ${(balloon.price / 100).toFixed(0)}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          Continue to Package Selection →
        </Button>
      </div>
    </div>
  );
}