import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface PackageStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PackageStep({ formData, updateFormData, onNext, onBack }: PackageStepProps) {
  const [selectedPackage, setSelectedPackage] = useState(formData.partyPackage || "base");
  const guestCount = parseInt(formData.guestCount) || 11;

  // Fetch packages from database
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/packages");
      const data = await response.json();
      return data.success ? data.packages : [];
    },
  });

  const calculatePackagePrice = (packageData: any) => {
    if (!packageData) return 0;
    
    if (packageData.name === "Base Birthday Party") {
      // Base package: $875 for 11 guests, $35 per additional guest
      const basePrice = 875;
      const additionalGuests = Math.max(0, guestCount - 11);
      return basePrice + (additionalGuests * 35);
    } else {
      // Make it Shine (+$25/guest) or Party Envy (+$50/guest)
      const perGuestPrice = packageData.base_price / 100; // Convert cents to dollars
      return perGuestPrice * guestCount;
    }
  };

  const getPackageTotal = () => {
    const basePackage = packagesData?.find((p: any) => p.name === "Base Birthday Party");
    const selectedPackageData = packagesData?.find((p: any) => p.name.toLowerCase().includes(selectedPackage.replace("-", " ")));
    
    let total = calculatePackagePrice(basePackage);
    
    if (selectedPackage !== "base" && selectedPackageData) {
      total += calculatePackagePrice(selectedPackageData);
    }
    
    return total;
  };

  const handleNext = () => {
    updateFormData({ 
      partyPackage: selectedPackage,
      packageTotal: getPackageTotal()
    });
    onNext();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">🎁</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Your Party Package
        </h2>
        <p className="text-gray-600">
          Select the perfect package for your celebration of {guestCount} guests
        </p>
      </div>

      <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
        <div className="space-y-4">
          {/* Base Package */}
          <div className="relative">
            <div className={`p-6 border-2 rounded-xl transition-all ${
              selectedPackage === "base" 
                ? "border-pink-300 bg-pink-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="base" id="base" />
                <Label htmlFor="base" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Base Birthday Party</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Complete party package with decorations, activities, and setup
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Up to 11 guests (including birthday child), $35 per additional guest
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${calculatePackagePrice(packagesData?.find((p: any) => p.name === "Base Birthday Party"))}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Make it Shine Package */}
          <div className="relative">
            <div className={`p-6 border-2 rounded-xl transition-all ${
              selectedPackage === "make-it-shine" 
                ? "border-pink-300 bg-pink-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="make-it-shine" id="make-it-shine" />
                <Label htmlFor="make-it-shine" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">Make it Shine</h3>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">+$25/guest</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Base package + premium touches and enhanced activities
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${getPackageTotal()}
                      </div>
                      <div className="text-sm text-gray-500">total</div>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Party Envy Package */}
          <div className="relative">
            <div className={`p-6 border-2 rounded-xl transition-all ${
              selectedPackage === "party-envy" 
                ? "border-pink-300 bg-pink-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="party-envy" id="party-envy" />
                <Label htmlFor="party-envy" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">Party Envy</h3>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">+$50/guest</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Ultimate premium package with all the bells and whistles
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${getPackageTotal()}
                      </div>
                      <div className="text-sm text-gray-500">total</div>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </div>
        </div>
      </RadioGroup>

      <div className="space-y-4">
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <UnifiedButton variant="outline" onClick={onBack}>
            Back
          </UnifiedButton>
          <UnifiedButton onClick={handleNext}>
            Continue to Add-ons
          </UnifiedButton>
        </div>
      </div>
    </div>
  );
}