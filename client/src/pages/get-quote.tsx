import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormHeader } from "@/components/party-form/form-header";
import { ProgressBar } from "@/components/party-form/progress-bar";
import { StepContainer } from "@/components/party-form/step-container";
import { WelcomeStep } from "@/components/party-form/steps/welcome-step";
import { EventTypeStep } from "@/components/party-form/steps/event-type-step";
import { DateTimeStep } from "@/components/party-form/steps/date-time-step";
import { EventDetailsStep } from "@/components/party-form/steps/event-details-step";
import { CustomDateTimeStep } from "@/components/party-form/steps/custom-date-time-step";
import { CustomAddonsStep } from "@/components/party-form/steps/custom-addons-step";
import { CustomContactStep } from "@/components/party-form/steps/custom-contact-step";
import { CustomInvoiceStep } from "@/components/party-form/steps/custom-invoice-step";
import { JewelryPiecesStep } from "@/components/party-form/steps/jewelry-pieces-step";
import { JewelryPeopleCountStep } from "@/components/party-form/steps/jewelry-people-count-step";
import { JewelryDateTimeStep } from "@/components/party-form/steps/jewelry-date-time-step";
import { JewelryContactStep } from "@/components/party-form/steps/jewelry-contact-step";
import { WorkshopDetailsStep } from "@/components/party-form/steps/workshop-details-step";
import { WorkshopScheduleStep } from "@/components/party-form/steps/workshop-schedule-step";
import { WorkshopAddonsStep } from "@/components/party-form/steps/workshop-addons-step";
import { WorkshopInvoiceStep } from "@/components/party-form/steps/workshop-invoice-step";
import { StudioPurposeStep } from "@/components/party-form/steps/studio-purpose-step";
import { StudioClientsStep } from "@/components/party-form/steps/studio-clients-step";
import { StudioDateTimeStep } from "@/components/party-form/steps/studio-datetime-step";
import { StudioContactStep } from "@/components/party-form/steps/studio-contact-step";
import { ThemeStep } from "@/components/party-form/steps/theme-step";
import { AddonsStep } from "@/components/party-form/steps/addons-step";
import { ChildDetailsStep } from "@/components/party-form/steps/child-details-step";
import { FoodStep } from "@/components/party-form/steps/food-step";
import { ContactStep } from "@/components/party-form/steps/contact-step";
import { SummaryStep } from "@/components/party-form/steps/summary-step";
import { usePartyForm } from "@/hooks/use-party-form";
import { Button } from "@/components/ui/button";
import { LocationDialog } from "@/components/ui/location-dialog";
import { MessageCircle, MapPin, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import allieImage from "@assets/image_1752579343744.png";

const TOTAL_STEPS = 9;

// Custom flow for DIY Party and Private Event (6 steps)
const isCustomFlow = (eventType: string) => {
  return eventType === "diy-party" || eventType === "private-event";
};

// Permanent Jewelry flow (5 steps)
const isJewelryFlow = (eventType: string) => {
  return eventType === "permanent-jewelry";
};

// Workshop/Class flow (6 steps)
const isWorkshopFlow = (eventType: string) => {
  return eventType === "workshop";
};

// Studio Rental flow (4 steps)
const isStudioFlow = (eventType: string) => {
  return eventType === "studio-rental";
};

export default function GetQuote() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [, setLocation] = useLocation();
  const { formData, updateFormData, resetForm } = usePartyForm();
  const { toast } = useToast();

  // Quote submission mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to submit quote");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Submitted!",
        description: "We'll contact you within 24 hours with your custom quote.",
      });
      setLocation("/themed-parties");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuote = async () => {
    const quoteData = { ...formData };
    await submitQuoteMutation.mutateAsync(quoteData);
  };

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

  const handleClose = () => {
    setLocation("/themed-parties");
  };

  const handleLocationClick = () => {
    setShowLocationDialog(true);
  };

  const handleContactClick = () => {
    setShowHelp(true);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    resetForm();
    setCurrentStep(1);
    setShowResetConfirm(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  const renderStep = () => {
    const eventType = formData.eventType || "";
    const customFlow = eventType ? isCustomFlow(eventType) : false;
    const jewelryFlow = eventType ? isJewelryFlow(eventType) : false;
    const workshopFlow = eventType ? isWorkshopFlow(eventType) : false;
    const studioFlow = eventType ? isStudioFlow(eventType) : false;

    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNextStep} />;
      case 2:
        return (
          <EventTypeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        // Custom flow for DIY Party and Private Event
        if (customFlow) {
          return (
            <EventDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Permanent Jewelry flow
        if (jewelryFlow) {
          return (
            <JewelryPiecesStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Workshop flow
        if (workshopFlow) {
          return (
            <WorkshopDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Studio Rental flow
        if (studioFlow) {
          return (
            <StudioPurposeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        return (
          <DateTimeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 4:
        // Custom flow: Date/Time step
        if (customFlow) {
          return (
            <CustomDateTimeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Permanent Jewelry flow: People count
        if (jewelryFlow) {
          return (
            <JewelryPeopleCountStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Workshop flow: Schedule
        if (workshopFlow) {
          return (
            <WorkshopScheduleStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Studio Rental flow: Client count
        if (studioFlow) {
          return (
            <StudioClientsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        return (
          <ThemeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 5:
        // Custom flow: Add-ons step
        if (customFlow) {
          return (
            <CustomAddonsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Permanent Jewelry flow: Date/Time preference
        if (jewelryFlow) {
          return (
            <JewelryDateTimeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Workshop flow: Add-ons
        if (workshopFlow) {
          return (
            <WorkshopAddonsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Studio Rental flow: Date/Time
        if (studioFlow) {
          return (
            <StudioDateTimeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        return (
          <AddonsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 6:
        // Custom flow: Contact step
        if (customFlow) {
          return (
            <CustomContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Permanent Jewelry flow: Contact & Submit
        if (jewelryFlow) {
          return (
            <JewelryContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmitQuote}
              onBack={handlePreviousStep}
            />
          );
        }
        // Workshop flow: Contact
        if (workshopFlow) {
          return (
            <CustomContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Studio Rental flow: Contact & Submit
        if (studioFlow) {
          return (
            <StudioContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmitQuote}
              onBack={handlePreviousStep}
            />
          );
        }
        return (
          <ChildDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 7:
        // Custom flow: Quote step (instead of invoice)
        if (customFlow) {
          return (
            <CustomInvoiceStep
              formData={formData}
              onBack={handlePreviousStep}
              onSubmit={handleSubmitQuote}
              isSubmitting={submitQuoteMutation.isPending}
            />
          );
        }
        // Workshop flow: Quote step (instead of invoice)
        if (workshopFlow) {
          return (
            <WorkshopInvoiceStep
              formData={formData}
              onBack={handlePreviousStep}
              onSubmit={handleSubmitQuote}
              isSubmitting={submitQuoteMutation.isPending}
            />
          );
        }
        return (
          <FoodStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 8:
        return (
          <ContactStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 9:
        return (
          <SummaryStep
            formData={formData}
            onBack={handlePreviousStep}
            onSubmit={handleSubmitQuote}
            isSubmitting={submitQuoteMutation.isPending}
          />
        );
      default:
        return <WelcomeStep onNext={handleNextStep} />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "hsl(210, 20%, 98%)" }}
    >
      <FormHeader
        currentStep={currentStep}
        onBack={handlePreviousStep}
        onClose={handleClose}
      />
      <ProgressBar
        currentStep={currentStep}
        totalSteps={
          formData.eventType && isCustomFlow(formData.eventType)
            ? 6
            : formData.eventType && isJewelryFlow(formData.eventType)
              ? 5
              : formData.eventType && isWorkshopFlow(formData.eventType)
                ? 6
                : formData.eventType && isStudioFlow(formData.eventType)
                  ? 4
                  : TOTAL_STEPS
        }
      />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
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

      {/* Footer bar with help, reset, and contact buttons */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="w-full max-w-md mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleLocationClick}
            className="text-gray-400 hover:text-black hover:bg-gray-100 p-3 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          >
            <MapPin className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            onClick={handleResetClick}
            className="text-gray-400 hover:text-black hover:bg-gray-100 p-3 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            onClick={handleContactClick}
            className="text-gray-400 hover:text-black hover:bg-gray-100 p-3 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      </footer>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-red-600" />
            </div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ fontFamily: "'Libre Baskerville', serif" }}
            >
              Reset Form?
            </h2>
            <p className="text-gray-600 mb-6">
              This will clear all your information and start over. Are you sure?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleResetCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Help Dialog */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <img
              src={allieImage}
              alt="Allie - Your party planning assistant"
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
            />
            <h2
              className="text-xl font-bold mb-3"
              style={{ fontFamily: "'Libre Baskerville', serif" }}
            >
              Need Help?
            </h2>
            <p className="text-gray-600 mb-4">
              We're here to help you plan the perfect event 〜 Contact Allie!
            </p>
            <div className="space-y-2 text-sm text-left">
              <p>
                <strong>Phone:</strong> (757) 295-9098
              </p>
              <p>
                <strong>Email:</strong> hosthampton295@gmail.com
              </p>
              <p>
                <strong>Address:</strong> 709 S Military Hwy, Virginia Beach, VA 23464
              </p>
            </div>
            <Button
              onClick={() => setShowHelp(false)}
              className="w-full mt-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Location Dialog */}
      <LocationDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
      />
    </div>
  );
}