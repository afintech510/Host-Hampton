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

// New flow structure based on requirements - using actual event type IDs from EventTypeStep
const getFlowSteps = (eventType: string) => {
  switch (eventType) {
    case "birthday-party":
      return 8; // Welcome → EventType → Theme → Package → Addons → PartyDetails → Food → Contact
    case "studio-rental":
      return 5; // Welcome → EventType → Purpose → Details → Contact
    case "trucker-hat":
      return 7; // Welcome → EventType → Attendees → Age Range → Theme → DateTime → Contact
    case "workshop":
      return 7; // Welcome → EventType → Format → Type → Attendees → Schedule → Contact
    case "permanent-jewelry":
      return 5; // Welcome → EventType → Pieces → People Count → Contact
    case "diy-party":
      return 5; // Welcome → EventType → Details → DateTime → Contact
    case "private-event":
      return 5; // Welcome → EventType → Details → DateTime → Contact
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
const isDiyPartyFlow = (eventType: string) => eventType === "diy-party";
const isPrivateEventFlow = (eventType: string) => eventType === "private-event";
const isGeneralInquiry = (eventType: string) => eventType === "general-inquiry";

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
    // Map form data to the expected quote format
    const quoteData = {
      ...formData,
      serviceType: formData.eventType, // Map eventType to serviceType
      consent: true // Add required consent field
    };
    console.log("Submitting quote data:", quoteData);
    await submitQuoteMutation.mutateAsync(quoteData);
  };

  const handleNextStep = () => {
    const maxSteps = formData.eventType ? getFlowSteps(formData.eventType) : 7;
    if (currentStep < maxSteps) {
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

    // Handle General Inquiry (single step) - but this should be handled in step logic, not here
    // Removed to fix step progression

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
        // Studio Rental: Purpose Selection
        if (isStudioRentalFlow(eventType)) {
          return (
            <StudioPurposeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // DIY Party & Private Event: Event Details
        if (isDiyPartyFlow(eventType) || isPrivateEventFlow(eventType)) {
          return (
            <EventDetailsStep
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
            <AddonsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Studio Rental: Details (People, Group Type)
        if (isStudioRentalFlow(eventType)) {
          return (
            <StudioClientsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // DIY Party & Private Event: Date/Time
        if (isDiyPartyFlow(eventType) || isPrivateEventFlow(eventType)) {
          return (
            <CustomDateTimeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Trucker Hat Bar: Age Range
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
        // Workshop/Class: Type  
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
        return (
          <DateTimeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 5:
        // Kids Themed Party: Add-ons
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
        // Trucker Hat Bar: Color/Patch Theme
        if (isTruckerHatFlow(eventType)) {
          return (
            <ThemeStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          );
        }
        // Workshop/Class: Attendees
        if (isWorkshopFlow(eventType)) {
          return (
            <EventDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
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
        return (
          <AddonsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 6:
        // Kids Themed Party: Party Details (Date, Child Info, Count)
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
        // Trucker Hat Bar: Date/Time
        if (isTruckerHatFlow(eventType)) {
          return (
            <DateTimeStep
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
        // Studio Rental: Contact & Submit (Final Step)
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
        // Permanent Jewelry: Contact & Submit (Final Step)
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
        return (
          <ChildDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 7:
        // Kids Themed Party: Food Selection
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
        // Trucker Hat Bar: Location (Final Step)
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
        // Workshop/Class: Notes (Final Step)
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
        return (
          <FoodStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 8:
        // Kids Themed Party: Contact Information (Final Step)
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
        return (
          <ContactStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleSubmitQuote}
            onBack={handlePreviousStep}
          />
        );
      case 9:
        // No case 9 needed - all flows should end at contact step
        return (
          <ContactStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleSubmitQuote}
            onBack={handlePreviousStep}
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