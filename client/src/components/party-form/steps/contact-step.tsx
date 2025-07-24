import { useState, useEffect } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import CnP_15072025_075736 from "@assets/CnP_15072025_075736.png";

interface ContactStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ContactStep({ formData, updateFormData, onNext, onBack }: ContactStepProps) {
  const [parentFirstName, setParentFirstName] = useState(formData.parentFirstName || "");
  const [parentLastName, setParentLastName] = useState(formData.parentLastName || "");
  const [parentEmail, setParentEmail] = useState(formData.parentEmail || "");
  const [parentPhone, setParentPhone] = useState(formData.parentPhone || "");

  // Save to session storage whenever values change
  useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem('partyFormData') || '{}');
    sessionStorage.setItem('partyFormData', JSON.stringify({
      ...sessionData,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone
    }));
  }, [parentFirstName, parentLastName, parentEmail, parentPhone]);

  const handleNext = () => {
    updateFormData({ 
      parentFirstName, 
      parentLastName, 
      parentEmail, 
      parentPhone
    });
    onNext();
  };

  const isValid = parentFirstName && parentLastName && parentEmail && parentPhone;

  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src={CnP_15072025_075736}
          alt="Customer service representative"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">How can we reach you?</h2>
        <p className="text-gray-600">
          We'll need your contact details to confirm the party and send you updates!
        </p>
      </div>
      <div className="space-y-6 text-left">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">First Name</Label>
            <Input
              type="text"
              placeholder="First name"
              value={parentFirstName}
              onChange={(e) => setParentFirstName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</Label>
            <Input
              type="text"
              placeholder="Last name"
              value={parentLastName}
              onChange={(e) => setParentLastName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</Label>
          <Input
            type="email"
            placeholder="your.email@example.com"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</Label>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral"
          />
        </div>

        <UnifiedButton
          onClick={handleNext}
          disabled={!isValid}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Almost done!
        </UnifiedButton>
      </div>
    </div>
  );
}
