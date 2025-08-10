import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "@/components/party-form/progress-bar";
import { StepContainer } from "@/components/party-form/step-container";
import { PartyQuoteThemePackageStep } from "@/components/party-quote-form/steps/party-quote-theme-package-step";
import { usePartyQuoteForm } from "@/hooks/use-party-quote-form";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TOTAL_STEPS = 1; // Start with just step 1 for now

const stepTitles = [
  "Theme & Package"
];

export default function PartyQuote() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { formData, updateFormData, resetForm, clearFormData } = usePartyQuoteForm();

  // Clear form data when component mounts to ensure fresh start
  useEffect(() => {
    clearFormData();
  }, []);

  // Generate random 12-character ID for quote permalink
  const generateQuoteId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Quote submission mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const quoteId = generateQuoteId();
      const response = await apiRequest("POST", "/api/party-quotes", {
        ...quoteData,
        quoteId
      });
      return { ...response.json(), quoteId };
    },
    onSuccess: (data) => {
      toast({
        title: "Quote Created!",
        description: "Review your quote and pay deposit to secure your booking.",
      });
      
      // Redirect to quote permalink with random ID
      if (data.quoteId) {
        setLocation(`/party-quote?id=${data.quoteId}`);
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
        return <PartyQuoteThemePackageStep formData={formData} updateFormData={updateFormData} />;
      default:
        return <PartyQuoteThemePackageStep formData={formData} updateFormData={updateFormData} />;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.selectedTheme;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Party Quote & Booking</h1>
          <p className="text-xl text-gray-600">Design your perfect party experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Step {currentStep}: {stepTitles[currentStep - 1] || "Theme & Package"}
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