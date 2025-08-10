import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";

interface PackageStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Package {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  includedAddons: number[];
  active: boolean;
}

interface Addon {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export function PackageStep({ formData, updateFormData, onNext, onBack }: PackageStepProps) {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(formData.selectedPackageId || null);
  const guestCount = parseInt(formData.guestCount) || 11;

  // Fetch packages from database
  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/packages");
      const data = await response.json();
      return data.success ? data.packages : [];
    },
  });

  // Fetch addons from database to show included addon details
  const { data: addons = [], isLoading: addonsLoading } = useQuery({
    queryKey: ["/api/addons"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/addons");
      const data = await response.json();
      return data.success ? data.addons : [];
    },
  });

  const getIncludedAddonNames = (packageData: Package): string[] => {
    if (!packageData.includedAddons || packageData.includedAddons.length === 0) {
      return [];
    }
    
    return packageData.includedAddons
      .map(addonId => {
        const addon = addons.find((a: Addon) => a.id === addonId);
        return addon ? addon.name : null;
      })
      .filter(Boolean) as string[];
  };

  const handleNext = () => {
    const selectedPackageData = packages.find((pkg: Package) => pkg.id === selectedPackage);
    updateFormData({ 
      selectedPackageId: selectedPackage,
      selectedPackage: selectedPackageData,
      // Don't store pricing information here - will be calculated after contact info
    });
    onNext();
  };

  const isLoading = packagesLoading || addonsLoading;

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

      <RadioGroup 
        value={selectedPackage?.toString() || ""} 
        onValueChange={(value) => setSelectedPackage(parseInt(value))}
      >
        <div className="space-y-4">
          {packages.map((pkg: Package) => {
            const includedAddons = getIncludedAddonNames(pkg);
            const isSelected = selectedPackage === pkg.id;
            
            return (
              <div key={pkg.id} className="relative">
                <div className={`p-6 border-2 rounded-xl transition-all ${
                  isSelected
                    ? "border-pink-300 bg-pink-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value={pkg.id.toString()} id={pkg.id.toString()} className="mt-1" />
                    <Label htmlFor={pkg.id.toString()} className="flex-1 cursor-pointer">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 mb-3">
                          {pkg.description}
                        </p>
                        
                        {/* Show included addons if any */}
                        {includedAddons.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Included:</p>
                            <div className="flex flex-wrap gap-2">
                              {includedAddons.map((addonName, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                >
                                  {addonName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-3">
                          Up to {pkg.maxGuests} guests included
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </RadioGroup>

      <div className="space-y-4">
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <UnifiedButton variant="outline" onClick={onBack}>
            Back
          </UnifiedButton>
          <UnifiedButton 
            onClick={handleNext}
            disabled={selectedPackage === null}
          >
            Continue to Add-ons
          </UnifiedButton>
        </div>
      </div>
    </div>
  );
}