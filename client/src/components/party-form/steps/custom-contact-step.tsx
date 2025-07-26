import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomContactStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CustomContactStep({ formData, updateFormData, onNext, onBack }: CustomContactStepProps) {
  const [name, setName] = useState(formData.customerName || "");
  const [email, setEmail] = useState(formData.customerEmail || "");
  const [phone, setPhone] = useState(formData.customerPhone || "");
  const [consentChecked, setConsentChecked] = useState(formData.consentChecked || false);

  const handleNext = () => {
    updateFormData({ 
      customerName: name, 
      customerEmail: email, 
      customerPhone: phone,
      consentChecked: consentChecked
    });
    onNext();
  };

  const isValid = name.trim() && email.trim() && phone.trim() && consentChecked;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">👤</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Contact Information
        </h2>
        <p className="text-gray-600">
          Please provide your contact details so we can send you pricing and event information
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Full Name *</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Email Address *</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
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
          />
        </div>

        <div className="border-t pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
              className="mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="consent" 
              className="text-sm text-gray-700 leading-relaxed cursor-pointer"
            >
              I consent to Host Hampton contacting me via email, phone, or text regarding this booking and future events. This helps us provide you with updates about your event and information about our services. *
            </Label>
          </div>
        </div>
      </div>

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
          disabled={!isValid}
          className="flex-1 bg-pink-300 hover:bg-pink-400 text-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          {consentChecked ? "Show Price" : "Please check consent to continue"}
        </Button>
      </div>
    </div>
  );
}