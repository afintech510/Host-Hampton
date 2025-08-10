import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StepContainer from "@/components/party-form/step-container";
import ProgressBar from "@/components/party-form/progress-bar";
import ThemeStep from "@/components/invoice-form/steps/theme-step";
import PackageStep from "@/components/invoice-form/steps/package-step";
import ActivitiesStep from "@/components/invoice-form/steps/activities-step";
import FoodDessertStep from "@/components/invoice-form/steps/food-dessert-step";
import LocationDateTimeStep from "@/components/invoice-form/steps/location-datetime-step";
import ChildDetailsStep from "@/components/invoice-form/steps/child-details-step";
import ContactReviewStep from "@/components/invoice-form/steps/contact-review-step";

export interface InvoiceFormData {
  // Theme & Package
  themeType: 'standard' | 'custom';
  themeDescription?: string;
  packageLevel: 1 | 2 | 3 | 4;
  
  // Activities
  standardActivities: number[];
  premiumActivities: number[];
  entertainment: number[];
  
  // Food & Desserts
  mainMeal: 'pizza' | 'bagels' | 'chicken_fingers';
  foodAddons: number[];
  drinkAddons: number[];
  dessertType: 'chocolate_cupcakes' | 'vanilla_cupcakes';
  dessertUpgrades: number[];
  allergies: string[];
  
  // Event Details
  location: 'studio' | 'mobile';
  mobileAddress?: string;
  eventDate: string;
  eventTime: '10am-12pm' | '1pm-3pm' | '3pm-5pm';
  
  // Child & Guest Info
  childName: string;
  childAge: number;
  guestCount: number;
  ageRange: string;
  
  // Contact & Special Requests
  customerName: string;
  phone: string;
  email: string;
  specialRequests?: string;
  communicationsAgreement: boolean;
}

const STEPS = [
  { id: 1, title: "Choose Theme & Package", component: "theme" },
  { id: 2, title: "Select Package Level", component: "package" },
  { id: 3, title: "Pick Activities", component: "activities" },
  { id: 4, title: "Food & Desserts", component: "food" },
  { id: 5, title: "Location & Date", component: "location" },
  { id: 6, title: "Party Details", component: "details" },
  { id: 7, title: "Contact & Review", component: "contact" },
];

export default function Invoice() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InvoiceFormData>({
    themeType: 'standard',
    packageLevel: 1,
    standardActivities: [],
    premiumActivities: [],
    entertainment: [],
    mainMeal: 'pizza',
    foodAddons: [],
    drinkAddons: [],
    dessertType: 'chocolate_cupcakes',
    dessertUpgrades: [],
    allergies: [],
    location: 'studio',
    eventDate: '',
    eventTime: '10am-12pm',
    childName: '',
    childAge: 5,
    guestCount: 10,
    ageRange: '4-6',
    customerName: '',
    phone: '',
    email: '',
    communicationsAgreement: false,
  });

  // Fetch required data
  const { data: addons } = useQuery({
    queryKey: ['/api/addons'],
  });

  const { data: packages } = useQuery({
    queryKey: ['/api/packages'],
  });

  const updateFormData = (updates: Partial<InvoiceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    const stepComponent = STEPS[currentStep - 1]?.component;
    
    switch (stepComponent) {
      case "theme":
        return (
          <ThemeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            addons={addons?.addons || []}
          />
        );
      case "package":
        return (
          <PackageStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            packages={packages?.packages || []}
          />
        );
      case "activities":
        return (
          <ActivitiesStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            addons={addons?.addons || []}
          />
        );
      case "food":
        return (
          <FoodDessertStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            addons={addons?.addons || []}
          />
        );
      case "location":
        return (
          <LocationDateTimeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case "details":
        return (
          <ChildDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case "contact":
        return (
          <ContactReviewStep
            formData={formData}
            updateFormData={updateFormData}
            onPrev={prevStep}
            addons={addons?.addons || []}
            packages={packages?.packages || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Party Invoice
          </h1>
          <p className="text-gray-600">
            Design your perfect party with our comprehensive pricing tool
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={STEPS.length}
            steps={STEPS}
          />
          
          <StepContainer>
            {renderStep()}
          </StepContainer>
        </div>
      </div>
    </div>
  );
}