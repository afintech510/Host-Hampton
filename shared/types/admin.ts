// Type-safe interfaces for admin dashboard and management
import { z } from 'zod';
import type { LeadStatus, LeadScore, EventType } from './lead';

// Dashboard statistics interface
export interface DashboardStats {
  totalLeads: number;
  totalEvents: number;
  totalRevenue: number; // In cents
  conversionRate: number; // Percentage
  
  // Period comparisons
  leadsThisMonth: number;
  leadsLastMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  
  // Lead breakdown by status
  leadsByStatus: Record<LeadStatus, number>;
  
  // Event breakdown by type
  eventsByType: Record<EventType, number>;
  
  // Recent activity counts
  recentLeads: number; // Last 7 days
  upcomingEvents: number; // Next 30 days
  overdueFollowUps: number;
}

// Email template interface
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  variables: string[];
  category: 'lead' | 'booking' | 'follow_up' | 'reminder' | 'marketing';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Email sending interface
export interface EmailSendRequest {
  to: string;
  subject: string;
  html: string;
  leadId?: number;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface EmailSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Lead management interface for admin operations
export interface LeadManagementOperation {
  type: 'update_status' | 'add_note' | 'schedule_follow_up' | 'convert' | 'delete';
  leadId: number;
  data: Record<string, any>;
  userId?: string;
  timestamp: string;
}

// Bulk operations interface
export interface BulkLeadOperation {
  operation: 'update_status' | 'add_tag' | 'export' | 'delete';
  leadIds: number[];
  data?: Record<string, any>;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

// Admin user interface
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: Permission[];
  lastLogin: string;
  active: boolean;
}

export type Permission = 
  | 'view_leads' 
  | 'edit_leads' 
  | 'delete_leads'
  | 'view_events' 
  | 'edit_events' 
  | 'delete_events'
  | 'view_invoices' 
  | 'create_invoices' 
  | 'edit_invoices'
  | 'send_emails' 
  | 'view_analytics' 
  | 'manage_users'
  | 'system_settings';

// Event management interfaces
export interface EventManagementData {
  id: number;
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: EventType;
  status: 'confirmed' | 'tentative' | 'cancelled' | 'completed';
  guestCount: number;
  location: string;
  notes: string;
  totalAmount: number; // In cents
  depositPaid: number; // In cents
  balanceDue: number; // In cents
}

// Calendar event interface for admin dashboard
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  eventType: EventType;
  status: 'confirmed' | 'tentative' | 'cancelled';
  customerName: string;
  guestCount: number;
  location: string;
  color: string; // For calendar display
}

// Report generation interfaces
export interface ReportConfig {
  type: 'leads' | 'events' | 'revenue' | 'performance';
  dateRange: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  groupBy?: 'day' | 'week' | 'month' | 'event_type' | 'status';
  format: 'csv' | 'pdf' | 'json';
}

export interface ReportData {
  config: ReportConfig;
  data: Record<string, any>[];
  summary: Record<string, number>;
  generatedAt: string;
  downloadUrl?: string;
}

// Communication tracking
export interface CommunicationRecord {
  id: number;
  leadId?: number;
  eventId?: number;
  type: 'email' | 'phone' | 'sms' | 'in_person';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'opened' | 'failed';
  sentAt: string;
  sentBy: string;
}

// Form validation schemas
export const dashboardStatsSchema = z.object({
  totalLeads: z.number().nonnegative(),
  totalEvents: z.number().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  conversionRate: z.number().min(0).max(100),
  leadsThisMonth: z.number().nonnegative(),
  leadsLastMonth: z.number().nonnegative(),
  revenueThisMonth: z.number().nonnegative(),
  revenueLastMonth: z.number().nonnegative()
});

export const emailSendSchema = z.object({
  to: z.string().email('Valid email address required'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'Email content is required'),
  leadId: z.number().optional(),
  templateId: z.string().optional()
});

export const bulkOperationSchema = z.object({
  operation: z.enum(['update_status', 'add_tag', 'export', 'delete']),
  leadIds: z.array(z.number()).min(1, 'At least one lead must be selected'),
  data: z.record(z.any()).optional()
});

export const reportConfigSchema = z.object({
  type: z.enum(['leads', 'events', 'revenue', 'performance']),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }),
  filters: z.record(z.any()).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'event_type', 'status']).optional(),
  format: z.enum(['csv', 'pdf', 'json'])
});

// Type guards
export const isValidEmailSend = (data: any): data is EmailSendRequest => {
  return emailSendSchema.safeParse(data).success;
};

export const isValidBulkOperation = (data: any): data is BulkLeadOperation => {
  return bulkOperationSchema.safeParse(data).success;
};

export const isValidReportConfig = (data: any): data is ReportConfig => {
  return reportConfigSchema.safeParse(data).success;
};

// Helper functions for admin operations
export const calculateConversionRate = (totalLeads: number, convertedLeads: number): number => {
  if (totalLeads === 0) return 0;
  return Math.round((convertedLeads / totalLeads) * 100 * 100) / 100; // Round to 2 decimal places
};

export const formatRevenue = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
};

export const getEventStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'text-green-600 bg-green-100';
    case 'tentative': return 'text-yellow-600 bg-yellow-100';
    case 'cancelled': return 'text-red-600 bg-red-100';
    case 'completed': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Admin navigation and permissions
export interface AdminNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiredPermissions: Permission[];
  badge?: number; // For notification counts
}

export const getAdminNavigation = (userPermissions: Permission[]): AdminNavItem[] => {
  const allNavItems: AdminNavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      path: '/admin',
      requiredPermissions: ['view_leads']
    },
    {
      id: 'leads',
      label: 'Lead Management',
      icon: 'Users',
      path: '/admin/leads',
      requiredPermissions: ['view_leads']
    },
    {
      id: 'events',
      label: 'Event Management',
      icon: 'Calendar',
      path: '/admin/events',
      requiredPermissions: ['view_events']
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: 'FileText',
      path: '/admin/invoices',
      requiredPermissions: ['view_invoices']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'BarChart',
      path: '/admin/analytics',
      requiredPermissions: ['view_analytics']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      path: '/admin/settings',
      requiredPermissions: ['system_settings']
    }
  ];

  return allNavItems.filter(item => 
    item.requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    )
  );
};

// Export utility types
export type AdminAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'import' 
  | 'send_email'
  | 'bulk_update';

export interface AdminActionResult {
  success: boolean;
  message: string;
  data?: any;
  redirectTo?: string;
}