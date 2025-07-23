import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

interface CustomAddonsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const addons = [
  {
    id: "photobooth",
    name: "Photobooth",
    description: "Fun photo experience with props and instant prints",
    price: 150
  },
  {
    id: "candy-wall",
    name: "Candy Wall",
    description: "Interactive candy display wall for sweet treats",
    price: 100
  },
  {
    id: "trucker-hat-bar",
    name: "Trucker Hat Bar",
    description: "Custom hat decorating station",
    price: 200
  },
  {
    id: "permanent-jewelry",
    name: "Permanent Jewelry",
    description: "Custom welded jewelry experience",
    price: 250
  },
  {
    id: "toddler-play-area",
    name: "Toddler Soft Play Area",
    description: "Safe play space designed for little ones",
    price: 125
  }
];

export function CustomAddonsStep({ formData, updateFormData, onNext, onBack }: CustomAddonsStepProps) {
  const [selectedAddons, setSelectedAddons] = useState(formData.selectedAddons || []);

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev: string[]) => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  const handleNext = () => {
    updateFormData({ selectedAddons });
    onNext();
  };

  const totalAddonPrice = selectedAddons.reduce((total: number, addonId: string) => {
    const addon = addons.find(a => a.id === addonId);
    return total + (addon?.price || 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">✨</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Add-Ons
        </h2>
        <p className="text-gray-600">
          Enhance your event with these optional add-ons
        </p>
      </div>

      <div className="space-y-4">
        {addons.map((addon, index) => {
          const isSelected = selectedAddons.includes(addon.id);
          
          return (
            <motion.div
              key={addon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-pink-300 bg-pink-50 shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-25'
                }`}
                onClick={() => handleAddonToggle(addon.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleAddonToggle(addon.id)}
                      className="data-[state=checked]:bg-pink-400 data-[state=checked]:border-pink-400"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {addon.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {addon.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-pink-600">
                            +${addon.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedAddons.length > 0 && (
        <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
          <div className="flex justify-between items-center">
            <p className="font-medium text-pink-800">
              Selected Add-ons ({selectedAddons.length})
            </p>
            <p className="text-lg font-bold text-pink-800">
              +${totalAddonPrice}
            </p>
          </div>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          className="flex-1 bg-pink-300 hover:bg-pink-400 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}