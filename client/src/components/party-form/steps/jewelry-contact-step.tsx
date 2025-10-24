import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface JewelryContactStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: (contactData?: any) => void;
  onBack: () => void;
}

export function JewelryContactStep({ formData, updateFormData, onNext, onBack }: JewelryContactStepProps) {
  const [firstName, setFirstName] = useState(formData.parentFirstName || "");
  const [lastName, setLastName] = useState(formData.parentLastName || "");
  const [email, setEmail] = useState(formData.parentEmail || "");
  const [phone, setPhone] = useState(formData.parentPhone || "");
  const [consent, setConsent] = useState(formData.consent || false);

  const handleNext = () => {
    const contactData = {
      parentFirstName: firstName, 
      parentLastName: lastName, 
      parentEmail: email, 
      parentPhone: phone,
      consent
    };
    
    updateFormData(contactData);
    
    // Pass contact data directly to onNext if it accepts parameters (for submit case)
    if (onNext.length > 0) {
      onNext(contactData);
    } else {
      onNext();
    }
  };

  const isValid = firstName.trim() && lastName.trim() && email.trim() && phone.trim() && consent;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">📞</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Contact Information
        </h2>
        <p className="text-gray-600">
          Please provide your contact details so we can schedule your permanent jewelry experience
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">First Name *</Label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
              data-testid="input-first-name"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Last Name *</Label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
              data-testid="input-last-name"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Email Address *</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
            data-testid="input-email"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number *</Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
            data-testid="input-phone"
          />
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="jewelry-consent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked as boolean)}
            className="mt-1"
            data-testid="checkbox-consent"
          />
          <Label htmlFor="jewelry-consent" className="text-sm text-gray-600 leading-relaxed">
            I agree to receive communication about my permanent jewelry experience via email and phone. 
            Host Hampton may contact me to confirm details and provide updates.
          </Label>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <UnifiedButton 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
          data-testid="button-back"
        >
          Back
        </UnifiedButton>
        <UnifiedButton 
          onClick={handleNext}
          disabled={!isValid}
          variant="primary"
          className="flex-1"
          data-testid="button-submit"
        >
          Submit Request
        </UnifiedButton>
      </div>
    </div>
  );
}
