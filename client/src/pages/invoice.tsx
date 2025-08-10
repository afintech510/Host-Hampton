import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormHeader } from "@/components/party-form/form-header";
import { ProgressBar } from "@/components/party-form/progress-bar";
import { StepContainer } from "@/components/party-form/step-container";
import { InvoiceThemePackageStep } from "@/components/invoice-form/steps/invoice-theme-package-step";
import { InvoiceActivitiesStep } from "@/components/invoice-form/steps/invoice-activities-step";
import { InvoiceFoodDessertStep } from "@/components/invoice-form/steps/invoice-food-dessert-step";
import { InvoiceAddonsStep } from "@/components/invoice-form/steps/invoice-addons-step";
import { InvoiceLocationDateTimeStep } from "@/components/invoice-form/steps/invoice-location-datetime-step";
import { InvoiceGuestsStep } from "@/components/invoice-form/steps/invoice-guests-step";
import { InvoiceContactNotesStep } from "@/components/invoice-form/steps/invoice-contact-notes-step";
import { InvoiceReviewQuoteStep } from "@/components/invoice-form/steps/invoice-review-quote-step";
import { useInvoiceForm } from "@/hooks/use-invoice-form";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TOTAL_STEPS = 8;

const stepTitles = [
  "Theme & Package",
  "Activities", 
  "Food & Dessert",
  "Add-ons",
  "Location & Date",
  "Guest Details",
  "Contact & Notes",
  "Review & Quote"
];

export default function Invoice() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { formData, updateFormData, resetForm, clearFormData } = useInvoiceForm();

  // Clear form data when component mounts to ensure fresh start
  useEffect(() => {
    clearFormData();
  }, []);

  // Quote submission mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const response = await apiRequest("POST", "/api/invoice-quotes", quoteData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quote Created! 🎉",
        description: "Review your quote and pay deposit to secure your booking.",
      });
      
      // Redirect to invoice view page
      if (data.invoiceId) {
        setLocation(`/invoice/${data.invoiceId}`);
      }
    },
    onError: (error) => {
      console.error("Quote submission error:", error);
      toast({
        title: "Quote Error",
        description: "There was an error creating your quote. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit quote
      submitQuoteMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    resetForm();
    setCurrentStep(1);
    setShowResetConfirm(false);
    toast({
      title: "Form Reset",
      description: "All selections have been cleared.",
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <InvoiceThemePackageStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <InvoiceActivitiesStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <InvoiceFoodDessertStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <InvoiceAddonsStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <InvoiceLocationDateTimeStep formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <InvoiceGuestsStep formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <InvoiceContactNotesStep formData={formData} updateFormData={updateFormData} />;
      case 8:
        return <InvoiceReviewQuoteStep formData={formData} updateFormData={updateFormData} />;
      default:
        return <InvoiceThemePackageStep formData={formData} updateFormData={updateFormData} />;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.selectedTheme;
      case 2:
        return formData.selectedActivities?.length > 0;
      case 3:
        return formData.selectedFood || formData.selectedDessert;
      case 4:
        return true; // Add-ons are optional
      case 5:
        return formData.location && formData.preferredDate;
      case 6:
        return formData.guestCount > 0 && formData.childName && formData.childAge;
      case 7:
        return formData.hostName && formData.email && formData.phone;
      case 8:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <FormHeader 
          title="Party Quote & Booking" 
          subtitle="Design your perfect party experience"
        />

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Step {currentStep}: {stepTitles[currentStep - 1]}
          </h2>
          <p className="text-gray-600">
            {currentStep < TOTAL_STEPS ? "Complete this step to continue" : "Review your selections and get your quote"}
          </p>
        </div>

        {/* Step Content */}
        <StepContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </StepContainer>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Help
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || submitQuoteMutation.isPending}
              className="min-w-[120px]"
            >
              {submitQuoteMutation.isPending ? "Creating Quote..." : 
               currentStep === TOTAL_STEPS ? "Get Quote" : "Next"}
            </Button>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-blue-50 rounded-lg p-4"
          >
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-800 text-sm mb-3">
              This step-by-step form helps you design your perfect party. 
              Pricing is shown after you complete your contact information.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <MapPin className="h-4 w-4" />
              <span>Call us at 631-998-9325 for immediate assistance</span>
            </div>
          </motion.div>
        )}

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Reset Form?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to reset the form? All your selections will be lost.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                >
                  Reset Form
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}