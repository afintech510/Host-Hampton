import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoiceFormData } from "@/pages/invoice";
import { Check, Star } from "lucide-react";

interface PackageStepProps {
  formData: InvoiceFormData;
  updateFormData: (updates: Partial<InvoiceFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  packages: any[];
}

export default function PackageStep({ formData, updateFormData, onNext, onPrev, packages }: PackageStepProps) {
  const packageDetails = [
    {
      level: 1,
      name: "Level 1 Package",
      price: 435,
      maxGuests: 14,
      description: "Perfect starter package for intimate celebrations",
      includes: [
        "Goody Bags ($180 value)",
        "Photo Booth ($150 value)", 
        "3 Extra Guests ($105 value)",
        "Basic party setup"
      ],
      popular: false,
      color: "blue"
    },
    {
      level: 2,
      name: "Level 2 Package", 
      price: 935,
      maxGuests: 15,
      description: "Enhanced experience with premium touches",
      includes: [
        "Everything in Level 1",
        "Upgrade to Premium Activity ($130 value)",
        "Enhanced Goody Bags ($195 value)",
        "Balloon Tower ($195 value)",
        "4 Extra Guests ($140 value)",
        "Curated Birthday Gift Basket ($125 value)"
      ],
      popular: true,
      color: "pink"
    },
    {
      level: 3,
      name: "Level 3 Package",
      price: 1310,
      maxGuests: 16,
      description: "Premium celebration with luxury elements",
      includes: [
        "Everything in Level 2",
        "Premium Goody Bags ($350 value)",
        "Balloon Custom Stack ($100 value)",
        "5 Extra Guests ($175 value)", 
        "Bubbles Drink Package ($75 value)",
        "Enhanced premium activities"
      ],
      popular: false,
      color: "purple"
    },
    {
      level: 4,
      name: "Level 4 Package",
      price: 2124,
      maxGuests: 17,
      description: "Ultimate party experience with everything included",
      includes: [
        "Everything in Level 3",
        "Balloon Garland ($195 value)",
        "6 Extra Guests ($210 value)",
        "Themed Custom Treat Table ($499 value)",
        "Up to $150 in Food Add-ons",
        "Premium everything upgrade"
      ],
      popular: false,
      color: "gold"
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected 
        ? "border-blue-500 bg-blue-50 shadow-lg" 
        : "border-blue-200 hover:border-blue-300",
      pink: isSelected 
        ? "border-pink-500 bg-pink-50 shadow-lg" 
        : "border-pink-200 hover:border-pink-300",
      purple: isSelected 
        ? "border-purple-500 bg-purple-50 shadow-lg" 
        : "border-purple-200 hover:border-purple-300",
      gold: isSelected 
        ? "border-yellow-500 bg-yellow-50 shadow-lg" 
        : "border-yellow-200 hover:border-yellow-300"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Package Level
        </h2>
        <p className="text-gray-600">
          Each level builds on the previous with additional value and experiences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packageDetails.map((pkg) => {
          const isSelected = formData.packageLevel === pkg.level;
          
          return (
            <Card 
              key={pkg.level}
              className={`relative cursor-pointer transition-all duration-200 border-2 ${getColorClasses(pkg.color, isSelected)}`}
              onClick={() => updateFormData({ packageLevel: pkg.level as 1 | 2 | 3 | 4 })}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    {pkg.name}
                  </CardTitle>
                  {isSelected && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {pkg.description}
                </CardDescription>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${pkg.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    up to {pkg.maxGuests} guests
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {pkg.includes.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className={index === 0 && pkg.level > 1 ? "font-semibold text-gray-700" : "text-gray-600"}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                
                {pkg.level > 1 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 font-medium">
                      ACTIVITY UPGRADE INCLUDED:
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      Upgrade any activity to Premium or add additional standard activity
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Package Comparison Info */}
      <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-2">
              📊 How Package Levels Work
            </h3>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Each level includes everything from the previous level plus additional upgrades. 
              Levels 2-4 include activity upgrade allowances, and Level 4 includes food add-on credits.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev}
          className="px-6 py-3"
        >
          ← Back to Theme
        </Button>
        <Button 
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          Continue to Activities →
        </Button>
      </div>
    </div>
  );
}