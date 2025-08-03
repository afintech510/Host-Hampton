// Type-safe utility functions for lead operations
import type { Lead } from '../schema';
import type { LeadStatus, LeadScore, EventType, LeadFilters } from '../types/lead';
import { 
  calculateLeadAge, 
  formatLeadEventDate, 
  getLeadPriorityColor, 
  getStatusColor,
  calculateQualificationScore,
  searchLeads,
  sortLeads
} from '../types/lead';

/**
 * Filters leads based on criteria with type safety
 */
export const filterLeads = (leads: Lead[], filters: LeadFilters): Lead[] => {
  let filtered = [...leads];

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(lead => lead.status === filters.status);
  }

  // Event type filter
  if (filters.eventType && filters.eventType !== 'all') {
    filtered = filtered.filter(lead => lead.eventType === filters.eventType);
  }

  // Date range filter
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    filtered = filtered.filter(lead => {
      if (!lead.eventDate) return false;
      const eventDate = new Date(lead.eventDate);
      return eventDate >= start && eventDate <= end;
    });
  }

  // Score filter
  if (filters.scoreFilter && filters.scoreFilter !== 'all') {
    filtered = filtered.filter(lead => lead.leadScore === filters.scoreFilter);
  }

  // Search term filter
  if (filters.searchTerm) {
    filtered = searchLeads(filtered, filters.searchTerm);
  }

  return filtered;
};

/**
 * Enhanced lead with computed properties
 */
export const enhanceLead = (lead: Lead): Lead & {
  estimatedCostFormatted: string;
  eventDateFormatted: string;
  daysSinceCreated: number;
  qualificationScore: number;
} => {
  return {
    ...lead,
    estimatedCostFormatted: lead.estimatedCost 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.estimatedCost / 100)
      : 'TBD',
    eventDateFormatted: formatLeadEventDate(lead.eventDate),
    daysSinceCreated: calculateLeadAge(lead.createdAt!),
    qualificationScore: calculateQualificationScore(lead)
  };
};

/**
 * Validates lead data for completeness
 */
export const validateLeadData = (lead: Partial<Lead>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!lead.name?.trim()) errors.push('Name is required');
  if (!lead.email?.trim()) errors.push('Email is required');
  if (lead.email && !isValidEmail(lead.email)) errors.push('Valid email is required');
  if (!lead.phone?.trim()) errors.push('Phone number is required');
  if (!lead.eventType?.trim()) errors.push('Event type is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Email validation helper
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Determines the next best action for a lead
 */
export const getLeadNextAction = (lead: Lead): {
  action: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
} => {
  const daysSinceCreated = calculateLeadAge(lead.createdAt!);
  const qualificationScore = calculateQualificationScore(lead);

  // High priority actions
  if (lead.status === 'new' && daysSinceCreated === 0) {
    return {
      action: 'send_initial_contact',
      priority: 'high',
      description: 'Send initial contact email within 1 hour'
    };
  }

  if (lead.status === 'quote_sent' && daysSinceCreated >= 3) {
    return {
      action: 'follow_up',
      priority: 'high',
      description: 'Follow up on quote sent 3+ days ago'
    };
  }

  if (lead.eventDate) {
    const eventDate = new Date(lead.eventDate);
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent <= 7 && lead.status !== 'converted') {
      return {
        action: 'urgent_follow_up',
        priority: 'high',
        description: 'Event is within 7 days - urgent follow up needed'
      };
    }
  }

  // Medium priority actions
  if (qualificationScore >= 70 && lead.status === 'new') {
    return {
      action: 'send_quote',
      priority: 'medium',
      description: 'High-qualified lead - send quote'
    };
  }

  if (lead.status === 'contacted' && daysSinceCreated >= 2) {
    return {
      action: 'follow_up',
      priority: 'medium',
      description: 'Follow up on initial contact'
    };
  }

  // Low priority actions
  if (qualificationScore < 50) {
    return {
      action: 'nurture',
      priority: 'low',
      description: 'Low qualification score - add to nurture campaign'
    };
  }

  return {
    action: 'monitor',
    priority: 'low',
    description: 'Continue monitoring lead status'
  };
};

/**
 * Calculates lead conversion probability
 */
export const calculateConversionProbability = (lead: Lead): number => {
  let probability = 0;

  // Base score from qualification
  const qualificationScore = calculateQualificationScore(lead);
  probability += qualificationScore * 0.3; // 30% weight

  // Status progression bonus
  const statusScores: Record<string, number> = {
    'new': 10,
    'contacted': 25,
    'qualified': 40,
    'quote_sent': 60,
    'follow_up': 70,
    'converted': 100,
    'lost': 0
  };
  probability += (statusScores[lead.status!] || 0) * 0.4; // 40% weight

  // Lead score bonus
  const scoreBonus: Record<string, number> = {
    'hot': 20,
    'warm': 10,
    'cold': 0
  };
  probability += scoreBonus[lead.leadScore!] || 0; // 20% weight

  // Time factor (events soon are more likely to convert)
  if (lead.eventDate) {
    const eventDate = new Date(lead.eventDate);
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent > 0 && daysUntilEvent <= 30) {
      probability += 10; // Bonus for events within 30 days
    }
  }

  // Budget factor
  if (lead.estimatedCost && lead.estimatedCost >= 50000) { // $500+
    probability += 10;
  }

  return Math.min(Math.max(probability, 0), 100); // Clamp between 0-100
};

/**
 * Groups leads by a specified field
 */
export const groupLeadsByField = (leads: Lead[], field: keyof Lead): Record<string, Lead[]> => {
  return leads.reduce((groups, lead) => {
    const key = String(lead[field] || 'Unknown');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(lead);
    return groups;
  }, {} as Record<string, Lead[]>);
};

/**
 * Generates lead summary statistics
 */
export const generateLeadStats = (leads: Lead[]): {
  total: number;
  byStatus: Record<string, number>;
  byScore: Record<string, number>;
  byEventType: Record<string, number>;
  averageQualification: number;
  averageConversion: number;
  totalEstimatedValue: number;
} => {
  const stats = {
    total: leads.length,
    byStatus: {} as Record<string, number>,
    byScore: {} as Record<string, number>,
    byEventType: {} as Record<string, number>,
    averageQualification: 0,
    averageConversion: 0,
    totalEstimatedValue: 0
  };

  let totalQualification = 0;
  let totalConversion = 0;

  leads.forEach(lead => {
    // Count by status
    const status = lead.status || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    // Count by score
    const score = lead.leadScore || 'unknown';
    stats.byScore[score] = (stats.byScore[score] || 0) + 1;

    // Count by event type
    const eventType = lead.eventType || 'unknown';
    stats.byEventType[eventType] = (stats.byEventType[eventType] || 0) + 1;

    // Accumulate for averages
    totalQualification += calculateQualificationScore(lead);
    totalConversion += calculateConversionProbability(lead);

    // Add to total estimated value
    stats.totalEstimatedValue += lead.estimatedCost || 0;
  });

  if (leads.length > 0) {
    stats.averageQualification = Math.round(totalQualification / leads.length);
    stats.averageConversion = Math.round(totalConversion / leads.length);
  }

  return stats;
};

/**
 * Formats lead data for export
 */
export const formatLeadForExport = (lead: Lead): Record<string, any> => {
  const enhanced = enhanceLead(lead);
  
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    eventType: lead.eventType,
    eventDate: enhanced.eventDateFormatted,
    guestCount: lead.guestCount,
    estimatedCost: enhanced.estimatedCostFormatted,
    status: lead.status,
    leadScore: lead.leadScore,
    qualificationScore: enhanced.qualificationScore,
    conversionProbability: `${calculateConversionProbability(lead)}%`,
    daysSinceCreated: enhanced.daysSinceCreated,
    source: lead.source,
    notes: lead.notes,
    childName: lead.childName,
    childAge: lead.childAge,
    specialRequirements: Array.isArray(lead.specialRequirements) 
      ? lead.specialRequirements.join(', ') 
      : lead.specialRequirements,
    createdAt: lead.createdAt
  };
};