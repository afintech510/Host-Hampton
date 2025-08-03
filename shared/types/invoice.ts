// Type-safe interfaces for invoice management
import { z } from 'zod';

// Base invoice item interface
export interface InvoiceItem {
  id: number;
  type: 'theme' | 'addon' | 'package' | 'custom';
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number; // In dollars (frontend representation)
  total: number; // In dollars (frontend representation)
  isCustom: boolean;
  customDescription: string;
}

// Invoice data interface for form state
export interface InvoiceFormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  eventDate: string; // YYYY-MM-DD format for HTML input
  eventDetails: string;
  eventStartTime: string; // HH:MM format
  eventEndTime: string; // HH:MM format
  eventLocation: string;
  depositAmount: number; // In dollars
  dueDate: string; // YYYY-MM-DD format, auto-calculated
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

// Location type for invoice creation
export type LocationType = 'host-hampton' | 'mobile';

// Mobile address interface
export interface MobileAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

// Invoice calculation results
export interface InvoiceCalculation {
  subtotal: number; // In dollars
  tax: number; // In dollars (8.75%)
  total: number; // In dollars
  deposit: number; // In dollars
  balanceDue: number; // In dollars
}

// Predefined item interface for dropdowns
export interface PredefinedItem {
  value: string; // e.g., 'theme-1', 'addon-2', 'package-3', 'custom'
  label: string; // Display name
  price: number; // In dollars
  type: 'theme' | 'addon' | 'package' | 'custom';
}

// Invoice creation payload for API
export interface InvoiceCreatePayload {
  eventId: number | null; // Nullable for lead-to-invoice workflow
  subtotal: number; // In cents for database
  tax: number; // In cents for database
  total: number; // In cents for database
  deposit: number; // In cents for database
  balanceDue: number; // In cents for database
  notes: string;
  items: InvoiceItemPayload[];
}

// Invoice item payload for API
export interface InvoiceItemPayload {
  type: string;
  name: string;
  quantity: number;
  unitPrice: number; // In cents for database
  total: number; // In cents for database
}

// Invoice validation schemas
export const invoiceItemSchema = z.object({
  id: z.number(),
  type: z.enum(['theme', 'addon', 'package', 'custom']),
  itemId: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  total: z.number().min(0, 'Total cannot be negative'),
  isCustom: z.boolean(),
  customDescription: z.string()
});

export const invoiceFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientPhone: z.string().min(1, 'Phone number is required'),
  clientEmail: z.string().email('Valid email is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventDetails: z.string().min(1, 'Event details are required'),
  eventStartTime: z.string().min(1, 'Start time is required'),
  eventEndTime: z.string().min(1, 'End time is required'),
  eventLocation: z.string().min(1, 'Location is required'),
  depositAmount: z.number().min(0, 'Deposit cannot be negative'),
  dueDate: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
});

export const mobileAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required')
});

// Type guards for runtime type checking
export const isInvoiceItem = (item: any): item is InvoiceItem => {
  return invoiceItemSchema.safeParse(item).success;
};

export const isInvoiceFormData = (data: any): data is InvoiceFormData => {
  return invoiceFormSchema.safeParse(data).success;
};

// Helper functions for invoice calculations
export const calculateInvoiceTotal = (items: InvoiceItem[]): InvoiceCalculation => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.0875; // 8.75% tax rate
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total,
    deposit: 200, // Default deposit
    balanceDue: total - 200
  };
};

// Convert dollars to cents for database storage
export const toCents = (dollars: number): number => Math.round(dollars * 100);

// Convert cents to dollars for display
export const toDollars = (cents: number): number => cents / 100;

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};