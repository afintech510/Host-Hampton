import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormHeader } from "@/components/party-form/form-header";
import { ProgressBar } from "@/components/party-form/progress-bar";
import { StepContainer } from "@/components/party-form/step-container";
import { WelcomeStep } from "@/components/party-form/steps/welcome-step";
import { DateTimeStep } from "@/components/party-form/steps/date-time-step";
import { ThemeStep } from "@/components/party-form/steps/theme-step";
import { AddonsStep } from "@/components/party-form/steps/addons-step";
import { ChildDetailsStep } from "@/components/party-form/steps/child-details-step";
import { FoodStep } from "@/components/party-form/steps/food-step";
import { ContactStep } from "@/components/party-form/steps/contact-step";
import { SummaryStep } from "@/components/party-form/steps/summary-step";
import { usePartyForm } from "@/hooks/use-party-form";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle } from "lucide-react";

const TOTAL_STEPS = 8;

export default function PartyBooking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const { formData, updateFormData, submitBooking, isSubmitting } = usePartyForm();

  const handleNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNextStep} />;
      case 2:
        return (
          <DateTimeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return (
          <ThemeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 4:
        return (
          <AddonsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 5:
        return (
          <ChildDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 6:
        return (
          <FoodStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 7:
        return (
          <ContactStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 8:
        return (
          <SummaryStep
            formData={formData}
            onBack={handlePreviousStep}
            onSubmit={submitBooking}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return <WelcomeStep onNext={handleNextStep} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(210, 20%, 98%)' }}>
      <FormHeader currentStep={currentStep} onBack={handlePreviousStep} />
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <StepContainer>{renderStep()}</StepContainer>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setShowHelp(true)}
          className="bg-white text-coral border-2 border-gray-200 rounded-full p-4 shadow-lg hover:shadow-xl hover:border-coral transition-all duration-200"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Help Dialog */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-3">Need help? 🤗</h3>
            <p className="text-gray-600 mb-4">
              We're here to help you plan the perfect party! Contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Phone:</strong> (555) 123-PARTY</p>
              <p><strong>Email:</strong> info@hosthampton.com</p>
              <p><strong>Hours:</strong> Mon-Fri 9am-6pm</p>
            </div>
            <Button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-coral hover:bg-coral text-white"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
