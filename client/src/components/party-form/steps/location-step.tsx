import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Home, Truck } from "lucide-react";

interface LocationStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function LocationStep({ formData, updateFormData, onNext, onBack }: LocationStepProps) {
  const [selectedLocation, setSelectedLocation] = useState(formData.locationType || "");
  const [address, setAddress] = useState(formData.address || "");
  const [city, setCity] = useState(formData.city || "");
  const [state, setState] = useState(formData.state || "NY");
  const [zipCode, setZipCode] = useState(formData.zipCode || "");

  const locationOptions = [
    {
      id: "host-hampton",
      title: "Host Hampton Studio",
      description: "Party at our beautiful studio location",
      icon: Home,
    },
    {
      id: "mobile",
      title: "Mobile Party",
      description: "We'll come to your location",
      icon: Truck,
    },
  ];

  const handleLocationSelect = (locationType: string) => {
    setSelectedLocation(locationType);
    updateFormData({ 
      locationType,
      // Clear address fields if switching back to studio
      ...(locationType === "host-hampton" && {
        address: "",
        city: "",
        state: "NY",
        zipCode: ""
      })
    });
  };

  const handleNext = () => {
    const locationData: any = { locationType: selectedLocation };
    
    // Include address data if mobile party is selected
    if (selectedLocation === "mobile") {
      locationData.address = address;
      locationData.city = city;
      locationData.state = state;
      locationData.zipCode = zipCode;
    }
    
    updateFormData(locationData);
    onNext();
  };

  const isValid = selectedLocation && (
    selectedLocation === "host-hampton" || 
    (selectedLocation === "mobile" && address && city && state && zipCode)
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-dusty-blue/20 p-3 rounded-full">
            <MapPin className="w-8 h-8 text-dusty-blue" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Where would you like to party?</h2>
        <p className="text-slate-600 text-lg">Choose your preferred party location</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locationOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedLocation === option.id;
          
          return (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? "ring-2 ring-dusty-blue bg-dusty-blue/5 shadow-lg" 
                    : "hover:shadow-md hover:bg-slate-50"
                }`}
                onClick={() => handleLocationSelect(option.id)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`mx-auto p-4 rounded-full ${
                    isSelected ? "bg-dusty-blue text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">{option.title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{option.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Address fields for mobile party */}
      {selectedLocation === "mobile" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 bg-slate-50 p-6 rounded-lg"
        >
          <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-dusty-blue" />
            Party Address
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Hampton"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="NY"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div className="w-1/2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="11946"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="px-8"
        >
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          className="px-8 bg-dusty-blue hover:opacity-90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}