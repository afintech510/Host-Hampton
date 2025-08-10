import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Palette, Gift } from "lucide-react";
import { InvoiceFormData } from "@/hooks/use-invoice-form";

interface Props {
  formData: InvoiceFormData;
  updateFormData: (updates: Partial<InvoiceFormData>) => void;
}

const packageData = {
  level1: {
    name: "Level 1 Package",
    price: 350,
    value: 435,
    savings: 85,
    savingsPercent: 19.5,
    includes: ["Goody Bags", "Photo Booth", "3 Extra Guests"],
    description: "Perfect starter package for intimate celebrations"
  },
  level2: {
    name: "Level 2 Package", 
    price: 695,
    value: 935,
    savings: 240,
    savingsPercent: 25.7,
    includes: ["Premium Activities", "Balloon Tower", "Gift Basket", "4 Extra Guests"],
    description: "Enhanced experience with premium touches"
  },
  level3: {
    name: "Level 3 Package",
    price: 925,
    value: 1310,
    savings: 385,
    savingsPercent: 29.4,
    includes: ["Premium Goody Bags", "Multiple Balloons", "5 Extra Guests", "Drinks Package"],
    description: "Comprehensive party experience"
  },
  level4: {
    name: "Level 4 Package",
    price: 1375,
    value: 2124,
    savings: 749,
    savingsPercent: 35.3,
    includes: ["Custom Treat Table", "Food Allowances", "6 Extra Guests", "Ultimate Experience"],
    description: "The complete luxury party package"
  }
};

export function InvoiceThemePackageStep({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-pink-500" />
          Choose Your Theme
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              formData.selectedTheme === 'standard' ? 'ring-2 ring-pink-500 shadow-lg' : ''
            }`}
            onClick={() => updateFormData({ selectedTheme: 'standard' })}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Standard Theme</h4>
                    <p className="text-sm text-gray-600">Choose from our collection</p>
                  </div>
                </div>
                {formData.selectedTheme === 'standard' && (
                  <Check className="h-5 w-5 text-pink-500" />
                )}
              </div>
              <p className="text-2xl font-bold text-pink-600 mb-2">$875</p>
              <p className="text-sm text-gray-600">
                Select from our curated themes including Princess, Unicorn, Superhero, and more
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              formData.selectedTheme === 'custom' ? 'ring-2 ring-purple-500 shadow-lg' : ''
            }`}
            onClick={() => updateFormData({ selectedTheme: 'custom' })}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Custom Theme</h4>
                    <p className="text-sm text-gray-600">Bring your vision to life</p>
                  </div>
                </div>
                {formData.selectedTheme === 'custom' && (
                  <Check className="h-5 w-5 text-purple-500" />
                )}
              </div>
              <p className="text-2xl font-bold text-purple-600 mb-2">From $950</p>
              <p className="text-sm text-gray-600">
                Completely customized decorations and setup based on your unique vision
              </p>
            </CardContent>
          </Card>
        </div>

        {formData.selectedTheme === 'custom' && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Describe your custom theme vision
            </label>
            <Textarea
              placeholder="Tell us about your dream theme - colors, characters, style, special elements..."
              value={formData.customThemeDescription || ''}
              onChange={(e) => updateFormData({ customThemeDescription: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        )}
      </div>

      {/* Package Selection */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-pink-500" />
          Choose Your Package Level
        </h3>
        
        <div className="mb-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              formData.selectedPackage === 'none' ? 'ring-2 ring-gray-400 shadow-md' : ''
            }`}
            onClick={() => updateFormData({ selectedPackage: 'none' })}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">No Package</h4>
                  <p className="text-sm text-gray-600">Build your party à la carte</p>
                </div>
                {formData.selectedPackage === 'none' && (
                  <Check className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(packageData).map(([key, pkg]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                formData.selectedPackage === key ? 'ring-2 ring-pink-500 shadow-lg' : ''
              }`}
              onClick={() => updateFormData({ selectedPackage: key as any })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{pkg.name}</h4>
                    <Badge variant="secondary" className="mt-1">
                      Save {pkg.savingsPercent}%
                    </Badge>
                  </div>
                  {formData.selectedPackage === key && (
                    <Check className="h-5 w-5 text-pink-500" />
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold text-pink-600 mb-1">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Value: ${pkg.value}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    You save ${pkg.savings}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {pkg.description}
                </p>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">What's included:</p>
                  {pkg.includes.map((item) => (
                    <div key={item} className="text-xs text-gray-600 flex items-center gap-1">
                      <div className="w-1 h-1 bg-pink-400 rounded-full" />
                      {item}
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                >
                  Customize
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          <strong>Package Benefits:</strong> Packages offer significant savings and include popular add-ons. 
          You can still add more items - anything over the package value will be priced individually.
        </p>
      </div>
    </div>
  );
}