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
import { MessageCircle, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
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

export default function BookEvent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [, setLocation] = useLocation();
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

  const handleClose = () => {
    setLocation("/themed-parties");
  };

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleContactClick = () => {
    setShowHelp(true);
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
              onNext={submitBooking}
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
              onNext={submitBooking}
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
        // Custom flow: Invoice step
        if (customFlow) {
          return (
            <CustomInvoiceStep
              formData={formData}
              onBack={handlePreviousStep}
              onSubmit={submitBooking}
              isSubmitting={isSubmitting}
            />
          );
        }
        // Workshop flow: Invoice step
        if (workshopFlow) {
          return (
            <WorkshopInvoiceStep
              formData={formData}
              onBack={handlePreviousStep}
              onSubmit={submitBooking}
              isSubmitting={isSubmitting}
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
      <FormHeader 
        currentStep={currentStep} 
        onBack={handlePreviousStep} 
        onClose={handleClose}
      />
      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={
          formData.eventType && isCustomFlow(formData.eventType) ? 6 : 
          formData.eventType && isJewelryFlow(formData.eventType) ? 5 : 
          formData.eventType && isWorkshopFlow(formData.eventType) ? 6 : 
          formData.eventType && isStudioFlow(formData.eventType) ? 4 : 
          TOTAL_STEPS
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

      {/* Footer bar with help and contact buttons */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="w-full max-w-md mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleHelpClick}
            className="text-gray-400 hover:text-black hover:bg-gray-100 p-3 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          >
            <HelpCircle className="w-6 h-6" />
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

      {/* Help Dialog */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <img
              src={allieImage}
              alt="Allie - Your party planning assistant"
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
            />
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Libre Baskerville', serif" }}>Need Help?</h2>
            <p className="text-gray-600 mb-4">
              We're here to help you plan the perfect event!<br />
              Contact Allie!
            </p>
            <div className="space-y-2 text-sm text-left">
              <p><strong>Phone:</strong> (631) 998-9325</p>
              <p><strong>Email:</strong> hosthampton295@gmail.com</p>
              <p><strong>Hours:</strong> By Appointment Only</p>
            </div>
            <Button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-dusty-blue hover:bg-dusty-blue hover:opacity-90 text-white rounded-full"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
