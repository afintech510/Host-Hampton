import { useState, useCallback } from 'react';

export interface InvoiceFormData {
  // Step 1: Theme & Package
  selectedTheme?: 'standard' | 'custom';
  customThemeDescription?: string;
  selectedPackage?: 'none' | 'level1' | 'level2' | 'level3' | 'level4';
  
  // Step 2: Activities  
  selectedActivities?: Array<{
    id: number;
    name: string;
    price: number;
    isPerGuest: boolean;
    tier: 'standard' | 'premium';
  }>;
  
  // Step 3: Food & Dessert
  selectedFood?: {
    base: 'pizza' | 'bagels';
    upgrades?: Array<{
      id: number;
      name: string;
      price: number;
    }>;
  };
  selectedDessert?: {
    base: 'chocolate_cupcakes' | 'vanilla_cupcakes';
    upgrades?: Array<{
      id: number;
      name: string;
      price: number;
    }>;
  };
  
  // Step 4: Add-ons
  selectedAddons?: Array<{
    id: number;
    name: string;
    price: number;
    isPerGuest: boolean;
    category: string;
  }>;
  
  // Step 5: Location & Date
  location?: 'studio' | 'mobile';
  mobileAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  preferredDate?: string;
  timeSlot?: '10am' | '1pm' | '3pm';
  
  // Step 6: Guest Details
  guestCount?: number;
  childName?: string;
  childAge?: number;
  
  // Step 7: Contact & Notes
  hostName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  communicationOptIn?: boolean;
  
  // Pricing calculations (populated after contact info)
  pricing?: {
    themePrice: number;
    packagePrice: number;
    packageValue: number;
    packageSavings: number;
    activitiesTotal: number;
    foodTotal: number;
    addonsTotal: number;
    extraGuestsTotal: number;
    mobileFeePlaceholder: number;
    subtotal: number;
    tax: number;
    total: number;
    deposit: number;
  };
}

const INITIAL_FORM_DATA: InvoiceFormData = {
  guestCount: 10, // Base includes 10 guests
};

export function useInvoiceForm() {
  const [formData, setFormData] = useState<InvoiceFormData>(INITIAL_FORM_DATA);

  const updateFormData = useCallback((updates: Partial<InvoiceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const clearFormData = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  return {
    formData,
    updateFormData,
    resetForm,
    clearFormData,
  };
}