import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StudioClientsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StudioClientsStep({ formData, updateFormData, onNext, onBack }: StudioClientsStepProps) {
  const [clientCount, setClientCount] = useState(formData.studioClientCount || "");
  const [groupType, setGroupType] = useState(formData.studioGroupType || "");

  const handleNext = () => {
    updateFormData({ 
      studioClientCount: parseInt(clientCount) || 0,
      studioGroupType: groupType
    });
    onNext();
  };

  const totalClients = parseInt(clientCount) || 0;
  const isValid = clientCount && totalClients > 0 && groupType;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">👥</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          How many clients will you host?
        </h2>
        <p className="text-gray-600">
          Help us understand the size of your group for space planning
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Number of Clients/Participants *</Label>
          <Input
            type="number"
            value={clientCount}
            onChange={(e) => setClientCount(e.target.value)}
            placeholder="Enter number of people"
            min="1"
            max="65"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Group Type *</Label>
          <RadioGroup value={groupType} onValueChange={setGroupType} className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="adults-only" id="adults-only" className="mr-3" />
              <Label htmlFor="adults-only" className="text-lg cursor-pointer flex-1">
                Adults only
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="mixed-ages" id="mixed-ages" className="mr-3" />
              <Label htmlFor="mixed-ages" className="text-lg cursor-pointer flex-1">
                Mixed ages (adults and children)
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="children-focused" id="children-focused" className="mr-3" />
              <Label htmlFor="children-focused" className="text-lg cursor-pointer flex-1">
                Children-focused event
              </Label>
            </div>
          </RadioGroup>
        </div>

        {totalClients > 0 && (
          <div className={`p-4 rounded-xl ${totalClients > 65 ? 'bg-orange-50 border border-orange-200' : totalClients > 45 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-sm font-medium ${totalClients > 65 ? 'text-orange-800' : totalClients > 45 ? 'text-yellow-800' : 'text-green-800'}`}>
              Group size: {totalClients} people
            </p>
            {totalClients > 65 && (
              <p className="text-sm text-orange-700 mt-1">
                Note: Groups over 65 people may require additional planning and setup. We'll discuss options with you.
              </p>
            )}
            {totalClients > 45 && totalClients <= 65 && (
              <p className="text-sm text-yellow-700 mt-1">
                Large group: We'll ensure optimal seating and space arrangement for your event.
              </p>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Capacity:</strong> Our studio comfortably accommodates up to 65 people with flexible seating arrangements and standing areas.
          </p>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <UnifiedButton 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </UnifiedButton>
        <UnifiedButton 
          onClick={handleNext}
          disabled={!isValid}
          variant="primary"
          className="flex-1"
        >
          Continue
        </UnifiedButton>
      </div>
    </div>
  );
}