// Type-safe utility functions for invoice operations
import type { InvoiceItem, InvoiceCalculation, InvoiceFormData } from '../types/invoice';
import { toCents, toDollars, formatCurrency } from '../types/invoice';

/**
 * Validates invoice form data completeness
 */
export const validateInvoiceData = (data: Partial<InvoiceFormData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.clientName?.trim()) errors.push('Client name is required');
  if (!data.clientEmail?.trim()) errors.push('Client email is required');
  if (!data.clientPhone?.trim()) errors.push('Client phone is required');
  if (!data.eventDate?.trim()) errors.push('Event date is required');
  if (!data.eventDetails?.trim()) errors.push('Event details are required');
  if (!data.eventStartTime?.trim()) errors.push('Start time is required');
  if (!data.eventEndTime?.trim()) errors.push('End time is required');
  if (!data.eventLocation?.trim()) errors.push('Location is required');
  if (data.depositAmount === undefined || data.depositAmount < 0) errors.push('Valid deposit amount is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates invoice items for completeness and consistency
 */
export const validateInvoiceItems = (items: InvoiceItem[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push('At least one invoice item is required');
    return { isValid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.description?.trim() && !item.customDescription?.trim()) {
      errors.push(`Item ${index + 1}: Description is required`);
    }
    
    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    }
    
    if (item.unitPrice < 0) {
      errors.push(`Item ${index + 1}: Unit price cannot be negative`);
    }
    
    // Validate total calculation
    const expectedTotal = item.quantity * item.unitPrice;
    if (Math.abs(item.total - expectedTotal) > 0.01) {
      errors.push(`Item ${index + 1}: Total calculation is incorrect`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Auto-calculates due date as day before event date
 */
export const calculateDueDate = (eventDate: string): string => {
  try {
    const event = new Date(eventDate);
    const due = new Date(event);
    due.setDate(due.getDate() - 1);
    return due.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } catch {
    // Fallback to 30 days from now
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 30);
    return fallback.toISOString().split('T')[0];
  }
};

/**
 * Creates predefined invoice items from database entities
 */
export const createPredefinedItems = (
  themes: any[], 
  addons: any[], 
  packages: any[]
): Array<{ value: string; label: string; price: number; type: 'theme' | 'addon' | 'package' | 'custom' }> => {
  const items = [
    {
      value: 'custom',
      label: 'Custom Item',
      price: 0,
      type: 'custom' as const
    },
    ...themes.map((theme: any) => ({
      value: `theme-${theme.id}`,
      label: theme.name,
      price: toDollars(theme.price || 0),
      type: 'theme' as const
    })),
    ...addons.map((addon: any) => ({
      value: `addon-${addon.id}`,
      label: addon.name,
      price: toDollars(addon.price || 0),
      type: 'addon' as const
    })),
    ...packages.map((pkg: any) => ({
      value: `package-${pkg.id}`,
      label: pkg.name,
      price: toDollars(pkg.basePrice || 0),
      type: 'package' as const
    }))
  ];

  return items;
};

/**
 * Auto-populates invoice data from lead information
 */
export const populateInvoiceFromLead = (lead: any): Partial<InvoiceFormData> => {
  return {
    clientName: lead.name || '',
    clientPhone: lead.phone || '',
    clientEmail: lead.email || '',
    eventDate: lead.eventDate ? new Date(lead.eventDate).toISOString().split('T')[0] : '',
    eventDetails: lead.eventDescription || lead.notes || `${lead.eventType || 'Event'} for ${lead.guestCount || 'TBD'} guests`,
    eventStartTime: lead.startTime || '10:00',
    eventEndTime: lead.endTime || '13:00',
    eventLocation: lead.eventLocation || 'Host Hampton, Speonk NY',
    depositAmount: 200, // Default deposit
    dueDate: lead.eventDate ? calculateDueDate(lead.eventDate) : '',
    status: 'draft'
  };
};

/**
 * Creates initial invoice items based on lead data
 */
export const createInitialInvoiceItems = (lead: any): InvoiceItem[] => {
  const items: InvoiceItem[] = [];
  
  // Add base party package if this is a kids party
  if (lead.eventType === 'kids-party' || lead.eventType === 'Theme Party') {
    items.push({
      id: Date.now(),
      type: 'package',
      itemId: 'package-base',
      description: 'Kids Birthday Party Package',
      quantity: 1,
      unitPrice: 875, // Base price
      total: 875,
      isCustom: false,
      customDescription: ''
    });

    // Add additional guests if more than base count
    const baseGuests = 12;
    const totalGuests = lead.guestCount || baseGuests;
    if (totalGuests > baseGuests) {
      const additionalGuests = totalGuests - baseGuests;
      items.push({
        id: Date.now() + 1,
        type: 'addon',
        itemId: 'addon-additional-guest',
        description: 'Additional Guest',
        quantity: additionalGuests,
        unitPrice: 35,
        total: additionalGuests * 35,
        isCustom: false,
        customDescription: ''
      });
    }
  }

  // Add selected packages if available
  if (lead.packageSelection && typeof lead.packageSelection === 'string') {
    const packagePrice = lead.packageSelection.includes('Party Envy') ? 50 : 
                        lead.packageSelection.includes('Make it Shine') ? 25 : 0;
    
    if (packagePrice > 0) {
      items.push({
        id: Date.now() + 2,
        type: 'addon',
        itemId: 'addon-package-upgrade',
        description: lead.packageSelection,
        quantity: 1,
        unitPrice: packagePrice,
        total: packagePrice,
        isCustom: false,
        customDescription: ''
      });
    }
  }

  return items;
};

/**
 * Formats invoice summary for display
 */
export const formatInvoiceSummary = (calculation: InvoiceCalculation): string => {
  return `
Subtotal: ${formatCurrency(calculation.subtotal)}
Tax (8.75%): ${formatCurrency(calculation.tax)}
Total: ${formatCurrency(calculation.total)}
Deposit: ${formatCurrency(calculation.deposit)}
Balance Due: ${formatCurrency(calculation.balanceDue)}
  `.trim();
};

/**
 * Generates invoice notes based on event details
 */
export const generateInvoiceNotes = (lead: any, items: InvoiceItem[]): string => {
  const notes = [];
  
  notes.push(`Invoice for ${lead.eventType || 'Event'} - ${lead.name}`);
  
  if (lead.eventDate) {
    notes.push(`Event Date: ${new Date(lead.eventDate).toLocaleDateString()}`);
  }
  
  if (lead.guestCount) {
    notes.push(`Guest Count: ${lead.guestCount}`);
  }
  
  if (lead.specialRequirements && lead.specialRequirements.length > 0) {
    notes.push(`Special Requirements: ${lead.specialRequirements.join(', ')}`);
  }
  
  if (lead.childName && lead.childAge) {
    notes.push(`Birthday Child: ${lead.childName} (Age ${lead.childAge})`);
  }
  
  const itemNames = items.map(item => 
    item.isCustom ? item.customDescription : item.description
  ).filter(Boolean);
  
  if (itemNames.length > 0) {
    notes.push(`Services: ${itemNames.join(', ')}`);
  }
  
  return notes.join('\n');
};