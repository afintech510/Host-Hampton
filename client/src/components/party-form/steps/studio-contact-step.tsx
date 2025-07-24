import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudioContactStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StudioContactStep({ formData, updateFormData, onNext, onBack }: StudioContactStepProps) {
  const [name, setName] = useState(formData.customerName || "");
  const [email, setEmail] = useState(formData.customerEmail || "");
  const [phone, setPhone] = useState(formData.customerPhone || "");
  const [company, setCompany] = useState(formData.customerCompany || "");

  const handleNext = () => {
    updateFormData({ 
      customerName: name, 
      customerEmail: email, 
      customerPhone: phone,
      customerCompany: company
    });
    onNext();
  };

  const isValid = name.trim() && email.trim() && phone.trim();

  // Get rental summary for display
  const getRentalSummary = () => {
    const purpose = formData.studioPurpose === "other" ? formData.customStudioPurpose : 
                   formData.studioPurpose?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    
    const date = formData.studioPreferredDate ? 
      new Date(formData.studioPreferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : "";
    
    const timeRange = formData.studioStartTime && formData.studioEndTime ? 
      `${formData.studioStartTime} - ${formData.studioEndTime}` : "";
    
    return { purpose, date, timeRange };
  };

  const { purpose, date, timeRange } = getRentalSummary();

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
          We'll use this information to finalize your studio rental
        </p>
      </div>

      {/* Rental Summary */}
      <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-xl border border-pink-200">
        <h3 className="font-semibold text-pink-800 mb-3">Studio Rental Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Purpose:</span>
            <span className="font-medium text-gray-900">{purpose}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Clients:</span>
            <span className="font-medium text-gray-900">{formData.studioClientCount} people</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">{date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium text-gray-900">{timeRange}</span>
          </div>
          {formData.studioRentalPricing && (
            <>
              <div className="border-t mt-3 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Studio Rental:</span>
                  <span className="font-medium text-gray-900">${(formData.studioRentalPricing.basePrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-medium text-gray-900">${(formData.studioRentalPricing.securityDeposit / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2 font-semibold">
                  <span className="text-gray-700">Total Due:</span>
                  <span className="text-pink-700">${(formData.studioRentalPricing.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
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

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Company/Organization (Optional)</Label>
          <Input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your company or organization name"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Next Steps:</strong> After submitting this request, we'll contact you within 24 hours with pricing details and to confirm availability for your preferred date and time.
        </p>
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
          Submit Rental Request
        </Button>
      </div>
    </div>
  );
}