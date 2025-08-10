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
  const [selectedStars, setSelectedStars] = useState<number>(formData.selectedStars || 1);
  const guestCount = parseInt(formData.guestCount) || 11;

  // Fetch packages from database (ordered by star rating)
  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/packages");
      const data = await response.json();
      return data.success ? data.packages.sort((a: Package, b: Package) => a.id - b.id) : [];
    },
  });

  // Fetch addons from database to show activity lists
  const { data: addons = [], isLoading: addonsLoading } = useQuery({
    queryKey: ["/api/addons"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/addons");
      const data = await response.json();
      return data.success ? data.addons : [];
    },
  });

  // Base party includes (always included)
  const baseIncludes = [
    "E-vite invitation",
    "Choice of pizza or bagels", 
    "Chocolate or vanilla cupcakes",
    "Up to 3 activities (only 1 premium)"
  ];

  // Get cumulative addons for selected star level
  const getCumulativeAddons = (starLevel: number): string[] => {
    const allAddons: string[] = [];
    
    for (let i = 1; i <= starLevel && i <= packages.length; i++) {
      const pkg = packages[i - 1];
      if (pkg && pkg.includedAddons) {
        pkg.includedAddons.forEach((addonId: number) => {
          const addon = addons.find((a: Addon) => a.id === addonId);
          if (addon && !allAddons.includes(addon.name)) {
            allAddons.push(addon.name);
          }
        });
      }
    }
    
    return allAddons;
  };

  // Separate premium and standard activities
  const premiumActivities = addons.filter((addon: Addon) => 
    addon.category === 'activity' || addon.name.includes('Coffee') || addon.name.includes('Photo')
  );
  
  const standardActivities = addons.filter((addon: Addon) => 
    addon.category === 'equipment' && !addon.name.includes('Photo')
  );

  const handleNext = () => {
    const selectedPackageData = packages[selectedStars - 1];
    updateFormData({ 
      selectedStars: selectedStars,
      selectedPackageId: selectedPackageData?.id,
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

      {/* Star Rating Selector */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Party Experience</h3>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((stars) => (
              <button
                key={stars}
                onClick={() => setSelectedStars(stars)}
                className={`text-3xl transition-all ${
                  stars <= selectedStars 
                    ? 'text-yellow-400 scale-110' 
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {selectedStars} Star{selectedStars !== 1 ? 's' : ''} Selected
          </p>
        </div>

        {/* Package Features Display */}
        <div className="space-y-4">
          {/* Base Includes */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Base Party Includes:</h4>
            <div className="flex flex-wrap gap-2">
              {baseIncludes.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Progressive Addons */}
          {selectedStars > 1 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Added with {selectedStars} Star{selectedStars !== 1 ? 's' : ''}:
              </h4>
              <div className="flex flex-wrap gap-2">
                {getCumulativeAddons(selectedStars).map((addon, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {addon}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activities List */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Premium Activities */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-bold text-purple-800 mb-3">🌟 Premium Activities</h4>
          <div className="space-y-1">
            {premiumActivities.map((activity: Addon) => (
              <div key={activity.id} className="text-xs text-purple-700">
                • {activity.name}
              </div>
            ))}
          </div>
        </div>

        {/* Standard Activities */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-bold text-gray-700 mb-3">⚡ Standard Activities</h4>
          <div className="space-y-1">
            {standardActivities.map((activity: Addon) => (
              <div key={activity.id} className="text-xs text-gray-600">
                • {activity.name}
              </div>
            ))}
          </div>
        </div>
      </div>

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