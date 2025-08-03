// Type-safe interfaces for lead management
import { z } from 'zod';
import type { Lead } from '../schema';

// Lead status types for better type safety
export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'quote_sent' 
  | 'follow_up' 
  | 'converted' 
  | 'lost';

export type LeadScore = 'hot' | 'warm' | 'cold';

export type EventType = 
  | 'kids-party' 
  | 'studio-rental' 
  | 'trucker-hat' 
  | 'workshop' 
  | 'permanent-jewelry' 
  | 'diy-party' 
  | 'private-event' 
  | 'general';

// Enhanced lead interface with calculated properties
export interface EnhancedLead extends Lead {
  // Computed properties for display
  estimatedCostFormatted?: string;
  eventDateFormatted?: string;
  daysSinceCreated?: number;
  
  // Form data parsing helpers
  parsedFormData?: Record<string, any>;
  
  // Contact preferences
  preferredContactMethod?: 'email' | 'phone' | 'text';
  
  // Lead qualification
  qualificationScore?: number;
  qualificationNotes?: string;
}

// Lead filtering and sorting options
export interface LeadFilters {
  status?: LeadStatus | 'all';
  eventType?: EventType | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  scoreFilter?: LeadScore | 'all';
}

export type LeadSortField = 
  | 'createdAt' 
  | 'eventDate' 
  | 'estimatedCost' 
  | 'name' 
  | 'status' 
  | 'leadScore';

export type SortDirection = 'asc' | 'desc';

export interface LeadSortOptions {
  field: LeadSortField;
  direction: SortDirection;
}

// Lead update payload for API calls
export interface LeadUpdatePayload {
  leadId: number;
  updates: Partial<Lead>;
}

// Lead email template variables
export interface LeadTemplateVariables {
  customerName: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  totalAmount: string;
  childName?: string;
  childAge?: string;
  specialRequirements?: string[];
}

// Lead conversion interface
export interface LeadConversionData {
  leadId: number;
  customerId: number;
  eventId?: number;
  invoiceId?: number;
  conversionDate: string;
  conversionNotes?: string;
}

// Form data structure for different event types
export interface BirthdayPartyFormData {
  childName: string;
  childAge: number;
  guestCount: number;
  partyTheme: string;
  partyPackage: string;
  partyAddons: string[];
  foodChoice: string;
  cupcakeFlavor?: string;
  partyDate: string;
  partyTime: string;
  partyLocation: string;
  specialNeeds: string[];
  partyNotes: string;
}

export interface StudioRentalFormData {
  studioSubType: string;
  customStudioType?: string;
  studioDescription: string;
  studioAttendeeCount: number;
  studioGroupType: string;
  studioDate: string;
  studioTime: string;
  studioDateFlexible: boolean;
  studioUsage: string;
  rentalPricing: {
    duration: number;
    basePrice: number;
    total: number;
  };
}

export interface WorkshopFormData {
  workshopType: string;
  classFormat: string;
  workshopDescription: string;
  workshopAttendeeCount: number;
  workshopDate: string;
  workshopTime: string;
  expectedAttendees: number;
}

export interface JewelryFormData {
  selectedJewelryPieces: string[];
  jewelryPeopleCount: number;
  jewelryDate: string;
  jewelryTime: string;
  jewelryAttendeeCount: number;
}

export type EventFormData = 
  | BirthdayPartyFormData 
  | StudioRentalFormData 
  | WorkshopFormData 
  | JewelryFormData;

// Lead validation schemas
export const leadStatusSchema = z.enum([
  'new', 'contacted', 'qualified', 'quote_sent', 
  'follow_up', 'converted', 'lost'
]);

export const leadScoreSchema = z.enum(['hot', 'warm', 'cold']);

export const eventTypeSchema = z.enum([
  'kids-party', 'studio-rental', 'trucker-hat', 
  'workshop', 'permanent-jewelry', 'diy-party', 
  'private-event', 'general'
]);

export const leadFiltersSchema = z.object({
  status: z.union([leadStatusSchema, z.literal('all')]).optional(),
  eventType: z.union([eventTypeSchema, z.literal('all')]).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  searchTerm: z.string().optional(),
  scoreFilter: z.union([leadScoreSchema, z.literal('all')]).optional()
});

export const leadUpdateSchema = z.object({
  leadId: z.number(),
  updates: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    status: leadStatusSchema.optional(),
    leadScore: leadScoreSchema.optional(),
    notes: z.string().optional(),
    eventDate: z.string().optional(),
    guestCount: z.number().optional(),
    estimatedCost: z.number().optional()
  })
});

// Type guards for runtime validation
export const isLeadStatus = (status: string): status is LeadStatus => {
  return leadStatusSchema.safeParse(status).success;
};

export const isLeadScore = (score: string): score is LeadScore => {
  return leadScoreSchema.safeParse(score).success;
};

export const isEventType = (type: string): type is EventType => {
  return eventTypeSchema.safeParse(type).success;
};

// Helper functions for lead management
export const calculateLeadAge = (createdAt: Date): number => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatLeadEventDate = (eventDate: string | Date | null): string => {
  if (!eventDate) return 'TBD';
  const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getLeadPriorityColor = (score: LeadScore): string => {
  switch (score) {
    case 'hot': return 'text-red-600 bg-red-100';
    case 'warm': return 'text-yellow-600 bg-yellow-100';
    case 'cold': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusColor = (status: LeadStatus): string => {
  switch (status) {
    case 'new': return 'text-blue-600 bg-blue-100';
    case 'contacted': return 'text-purple-600 bg-purple-100';
    case 'qualified': return 'text-green-600 bg-green-100';
    case 'quote_sent': return 'text-yellow-600 bg-yellow-100';
    case 'follow_up': return 'text-orange-600 bg-orange-100';
    case 'converted': return 'text-green-700 bg-green-200';
    case 'lost': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Lead qualification scoring algorithm
export const calculateQualificationScore = (lead: Lead): number => {
  let score = 0;
  
  // Contact information completeness (30 points)
  if (lead.name) score += 10;
  if (lead.email) score += 10;
  if (lead.phone) score += 10;
  
  // Event details completeness (40 points)
  if (lead.eventDate) score += 15;
  if (lead.guestCount && lead.guestCount > 0) score += 10;
  if (lead.eventType) score += 10;
  if (lead.notes && lead.notes.length > 10) score += 5;
  
  // Budget/cost indicators (20 points)
  if (lead.estimatedCost && lead.estimatedCost > 50000) score += 20; // $500+
  else if (lead.estimatedCost && lead.estimatedCost > 25000) score += 15; // $250+
  else if (lead.estimatedCost && lead.estimatedCost > 0) score += 10;
  
  // Urgency factors (10 points)
  if (lead.eventDate) {
    const eventDate = new Date(lead.eventDate);
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent <= 30 && daysUntilEvent > 0) score += 10; // Event within 30 days
    else if (daysUntilEvent <= 60 && daysUntilEvent > 0) score += 5; // Event within 60 days
  }
  
  return Math.min(score, 100); // Cap at 100
};

// Lead search functionality
export const searchLeads = (leads: Lead[], searchTerm: string): Lead[] => {
  if (!searchTerm.trim()) return leads;
  
  const term = searchTerm.toLowerCase();
  return leads.filter(lead => 
    lead.name?.toLowerCase().includes(term) ||
    lead.email?.toLowerCase().includes(term) ||
    lead.phone?.includes(term) ||
    lead.eventType?.toLowerCase().includes(term) ||
    lead.notes?.toLowerCase().includes(term) ||
    lead.childName?.toLowerCase().includes(term)
  );
};

// Lead sorting functionality
export const sortLeads = (leads: Lead[], sortOptions: LeadSortOptions): Lead[] => {
  return [...leads].sort((a, b) => {
    const { field, direction } = sortOptions;
    let aValue: any = a[field];
    let bValue: any = b[field];
    
    // Handle date fields
    if (field === 'createdAt' || field === 'eventDate') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;
    
    // Compare values
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};