import { useState, useEffect } from "react";
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
import { ExtrasStep } from "@/components/party-form/steps/extras-step";
import { CustomInvoiceStep } from "@/components/party-form/steps/custom-invoice-step";
import { JewelryPiecesStep } from "@/components/party-form/steps/jewelry-pieces-step";
import { JewelryPeopleCountStep } from "@/components/party-form/steps/jewelry-people-count-step";
import { JewelryWhenWhereStep } from "@/components/party-form/steps/jewelry-when-where-step";
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
import { StudioUsageStep } from "@/components/party-form/steps/studio-usage-step";
import { StudioDetailsStep } from "@/components/party-form/steps/studio-details-step";
import { ThemeStep } from "@/components/party-form/steps/theme-step";
import { PackageStep } from "@/components/party-form/steps/package-step";
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

// New flow structure based on requirements - using actual event type IDs from EventTypeStep
const getFlowSteps = (eventType: string) => {
  switch (eventType) {
    case "birthday-party":
      return 10; // Welcome → EventType → Theme → Package → Addons → Extras → Date/Time → PartyDetails → Food → Contact
    case "studio-rental":
      return 6; // Welcome → EventType → Usage → Details → Date/Time → Contact
    case "trucker-hat":
      return 5; // Welcome → EventType → Event Details → Date/Time Range → Contact
    case "workshop":
      return 5; // Welcome → EventType → Workshop Details → Schedule → Contact
    case "permanent-jewelry":
      return 6; // Welcome → EventType → Pieces → Vision & People Count → When & Where → Contact

    case "general-inquiry":
      return 3; // Welcome → EventType → Contact
    default:
      return 8;
  }
};

const isKidsPartyFlow = (eventType: string) => eventType === "birthday-party";
const isStudioRentalFlow = (eventType: string) => eventType === "studio-rental";
const isTruckerHatFlow = (eventType: string) => eventType === "trucker-hat";
const isWorkshopFlow = (eventType: string) => eventType === "workshop";
const isJewelryFlow = (eventType: string) => eventType === "permanent-jewelry";

const isGeneralInquiry = (eventType: string) => eventType === "general-inquiry";

export default function GetQuote() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { formData, updateFormData, resetForm, clearFormData } = usePartyForm();

  // Clear form data when component mounts to ensure fresh start
  useEffect(() => {
    clearFormData();
  }, []); // Only run on mount

  // Quote submission mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const response = await apiRequest("POST", "/api/quotes", quoteData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quote Request Submitted! 🎉",
        description: "Review your booking details and secure your reservation.",
      });
      
      // Clear form data after successful submission
      clearFormData();
      
      // Redirect to appropriate reservation page based on event type
      if (data.leadId) {
        if (isTruckerHatFlow(formData.eventType)) {
          setLocation(`/trucker-hat-reservation/${data.leadId}`);
        } else {
          setLocation(`/customer-booking/${data.leadId}`);
        }
      } else {
        setLocation("/themed-parties");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleNextStep = () => {
    const totalSteps = getFlowSteps(formData.eventType || "birthday-party");
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when moving to previous step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitQuote = (contactData?: any) => {
    // Prepare quote data - use contactData if provided, otherwise use formData
    const quoteData = {
      ...formData,
      ...(contactData || {}), // Merge in contact data if provided
      serviceType: formData.eventType,
      // Add any additional processing here
    };
    
    submitQuoteMutation.mutate(quoteData);
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
    // Scroll to top when resetting the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  const renderStep = () => {
    const eventType = formData.eventType || "";

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
        // Kids Themed Party: Select Theme
        if (isKidsPartyFlow(eventType)) {
          return (
            <ThemeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Studio Rental: Usage Selection
        if (isStudioRentalFlow(eventType)) {
          return (
            <StudioUsageStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }

        // Trucker Hat Bar: Attendees Count
        if (isTruckerHatFlow(eventType)) {
          return (
            <EventDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Workshop/Class: Format
        if (isWorkshopFlow(eventType)) {
          return (
            <WorkshopDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Permanent Jewelry: Jewelry Pieces
        if (isJewelryFlow(eventType)) {
          return (
            <JewelryPiecesStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // General Inquiry: Contact Only
        if (isGeneralInquiry(eventType)) {
          return (
            <ContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmitQuote}
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
      case 4:
        // Kids Themed Party: Select Package
        if (isKidsPartyFlow(eventType)) {
          return (
            <PackageStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Studio Rental: Details (Description & People Count)
        if (isStudioRentalFlow(eventType)) {
          return (
            <StudioDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }

        // Trucker Hat Bar: Date & Time Range (like Studio Rental)
        if (isTruckerHatFlow(eventType)) {
          return (
            <StudioDateTimeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Workshop/Class: Schedule
        if (isWorkshopFlow(eventType)) {
          return (
            <WorkshopScheduleStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Permanent Jewelry: People Count
        if (isJewelryFlow(eventType)) {
          return (
            <JewelryPeopleCountStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        break;
      case 5:
        // Kids Themed Party: Select Add-ons
        if (isKidsPartyFlow(eventType)) {
          return (
            <AddonsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Studio Rental: Date/Time
        if (isStudioRentalFlow(eventType)) {
          return (
            <StudioDateTimeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }

        // Trucker Hat Bar: Contact (final step)
        if (isTruckerHatFlow(eventType)) {
          return (
            <ContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmitQuote}
              onBack={handlePreviousStep}
            />
          );
        }
        // Workshop/Class: Contact (final step)
        if (isWorkshopFlow(eventType)) {
          return (
            <ContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmitQuote}
              onBack={handlePreviousStep}
            />
          );
        }
        // Permanent Jewelry: When & Where
        if (isJewelryFlow(eventType)) {
          return (
            <JewelryWhenWhereStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        break;
      case 6:
        // Kids Themed Party: Extras Selection (Decor, Food, Drinks)
        if (isKidsPartyFlow(eventType)) {
          return (
            <ExtrasStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Trucker Hat Bar: No step 6 (flow ends at step 5)
        if (isTruckerHatFlow(eventType)) {
          return null;
        }
        break;
      case 7:
        // Kids Themed Party: Date/Time Selection
        if (isKidsPartyFlow(eventType)) {
          return (
            <DateTimeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Trucker Hat Bar: No step 7 (flow ends at step 5)
        if (isTruckerHatFlow(eventType)) {
          return null;
        }
        // Studio Rental: Contact (final step)
        if (isStudioRentalFlow(eventType)) {
          return (
            <ContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmitQuote}
              onBack={handlePreviousStep}
            />
          );
        }
        // Permanent Jewelry: Contact (final step)
        if (isJewelryFlow(eventType)) {
          return (
            <ContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmitQuote}
              onBack={handlePreviousStep}
            />
          );
        }
        break;
      case 8:
        // Kids Themed Party: Child Details
        if (isKidsPartyFlow(eventType)) {
          return (
            <ChildDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        break;
      case 9:
        // Kids Themed Party: Food & Special Needs
        if (isKidsPartyFlow(eventType)) {
          return (
            <FoodStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        break;
      case 10:
        // Kids Themed Party: Contact (final step)
        if (isKidsPartyFlow(eventType)) {
          return (
            <ContactStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSubmitQuote}
              onBack={handlePreviousStep}
            />
          );
        }
        break;
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
        totalSteps={formData.eventType ? getFlowSteps(formData.eventType) : 7}
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

      {/* Location Dialog */}
      <LocationDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
      />

      {/* Help Dialog */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <img
                src={allieImage}
                alt="Allie"
                className="w-12 h-12 rounded-full mr-3 object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">Hi, I'm Allie!</h3>
                <p className="text-sm text-gray-600">Party Planning Specialist</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Need help with your party planning? I'm here to assist! Feel free to call or text me directly at{" "}
              <a href="tel:631-400-8080" className="text-coral font-medium">
                631-400-8080
              </a>{" "}
              for immediate assistance.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowHelp(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button asChild className="flex-1">
                <a href="tel:631-400-8080">Call Now</a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Reset Form?</h3>
            <p className="text-gray-600 mb-4">
              This will clear all your current selections and start over. Are you sure?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleResetCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetConfirm}
                variant="destructive"
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}