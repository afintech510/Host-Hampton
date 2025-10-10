import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});



export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text").notNull(),
  partyTheme: text("party_theme"), // Optional - which theme they booked
  reviewDate: timestamp("review_date").defaultNow().notNull(),
  platform: text("platform").default("Google").notNull(), // Google, Facebook, etc.
  verified: boolean("verified").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(), // For highlighting special reviews
});



// New tables for the Kids Party Designer Tool
export const eventTypes = pgTable("event_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  billingAddress: json("billing_address"), // Store address object
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: integer("base_price").notNull(), // Price in cents
  maxGuests: integer("max_guests"),
  imageUrl: text("image_url"),
  eventTypeId: integer("event_type_id"),
  includedAddons: json("included_addons").default([]).notNull(), // Array of addon IDs included in package
  active: boolean("active").default(true).notNull(),
});

export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
  perGuest: boolean("per_guest").default(false).notNull(),
  imageUrl: text("image_url"),
  icon: text("icon"), // Emoji or icon representation
  category: text("category"), // "food", "drink", "activity", "decor", "extra"
  active: boolean("active").default(true).notNull(),
});

export const partyThemes = pgTable("party_themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id"), // Reference to original lead if converted
  eventTypeId: integer("event_type_id").notNull(),
  customerId: integer("customer_id").notNull(),
  eventDate: timestamp("event_date"),
  startTime: text("start_time"), // "14:00"
  endTime: text("end_time"), // "18:00"
  guestCount: integer("guest_count"),
  status: text("status").default("inquiry").notNull(), // inquiry, quote_requested, quote_sent, follow_up, deposit_paid, confirmed, planning, completed, follow_up_sent, reviewed, cancelled
  inquirySource: text("inquiry_source").default("website").notNull(), // website, phone, referral, social, campaign
  leadScore: text("lead_score").default("warm").notNull(), // hot, warm, cold
  statusHistory: json("status_history").default([]).notNull(), // Track all status changes with timestamps
  followUpDate: timestamp("follow_up_date"),
  completedAt: timestamp("completed_at"),
  reviewRequestSent: boolean("review_request_sent").default(false).notNull(),
  selectedPackageId: integer("selected_package_id"), // Reference to chosen package
  selectedAddons: json("selected_addons").default([]).notNull(), // Array of addon IDs and quantities
  partyThemeId: integer("party_theme_id"), // For theme parties
  estimatedCost: integer("estimated_cost"), // In cents, calculated from selections
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"), // Made nullable for lead-to-invoice workflow
  leadId: integer("lead_id"), // Link back to the original lead
  
  // Client Information
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  
  // Event Information
  eventDate: timestamp("event_date"),
  eventDetails: text("event_details"),
  eventLocation: text("event_location"),
  
  // Financial Information
  subtotal: integer("subtotal").notNull(), // In cents
  tax: integer("tax").notNull(), // In cents
  total: integer("total").notNull(), // In cents
  deposit: integer("deposit").notNull(), // In cents
  balanceDue: integer("balance_due").notNull(), // In cents
  ccFee: integer("cc_fee").default(0).notNull(), // In cents
  
  // Stripe Integration
  stripeInvoiceId: text("stripe_invoice_id"), // Stripe invoice ID
  stripePaymentLinkId: text("stripe_payment_link_id"), // Stripe payment link ID
  stripeInvoiceUrl: text("stripe_invoice_url"), // URL for payment page
  depositPaid: boolean("deposit_paid").default(false).notNull(), // Track deposit payment
  
  // Status and Metadata
  status: text("status").default("draft").notNull(), // draft, sent, viewed, paid, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  type: text("type").notNull(), // package, addon, custom
  name: text("name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").notNull(), // In cents
  total: integer("total").notNull(), // In cents
});

// Enhanced tables for comprehensive business management

// Calendar and availability management
export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "13:00"
  maxCapacity: integer("max_capacity").default(1).notNull(),
  bookedCapacity: integer("booked_capacity").default(0).notNull(),
  available: boolean("available").default(true).notNull(),
  blockReason: text("block_reason"), // "maintenance", "holiday", etc.
});

// Staff management and scheduling
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull(), // "host", "setup", "manager", "admin"
  hourlyRate: integer("hourly_rate"), // In cents
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventStaffAssignments = pgTable("event_staff_assignments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  staffId: integer("staff_id").notNull(),
  role: text("role").notNull(), // "lead_host", "assistant", "setup", "cleanup"
  hoursWorked: integer("hours_worked"), // In minutes
  payRate: integer("pay_rate"), // In cents per hour
});

// Communication tracking for emails and SMS
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  eventId: integer("event_id"), // Optional - can be general marketing
  type: text("type").notNull(), // "email", "sms", "call"
  direction: text("direction").notNull(), // "inbound", "outbound"
  subject: text("subject"),
  content: text("content").notNull(),
  status: text("status").notNull(), // "sent", "delivered", "failed", "opened", "clicked"
  provider: text("provider"), // "sendgrid", "twilio", etc.
  externalId: text("external_id"), // Provider's message ID
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
});

// Marketing campaigns and lead tracking
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "email", "sms", "social", "referral"
  status: text("status").default("draft").notNull(), // "draft", "active", "paused", "completed"
  subject: text("subject"),
  content: text("content"),
  targetAudience: json("target_audience"), // Criteria for targeting
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // "website", "referral", "social", "campaign"
  campaignId: integer("campaign_id"), // If from a campaign
  
  // Contact Information
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  
  // Event Details from form
  eventTypeId: integer("event_type_id"), // Maps to eventTypes table
  eventType: text("event_type"), // "Theme Party", "Room Rental", "Appointment", "HH Event"
  eventDate: timestamp("event_date"),
  isDateUnsure: boolean("is_date_unsure").default(false).notNull(),
  timeSlot: text("time_slot"), // "10am-12pm", "1pm-3pm", "4pm-6pm"
  arrivalTime: text("arrival_time"), // For DIY rentals
  rentalDuration: text("rental_duration"), // "3", "4", "5", "6", "all-day" for DIY rentals
  guestCount: integer("guest_count"),
  
  // Party Details (for Theme Parties)
  childName: text("child_name"),
  childAge: integer("child_age"),
  partyThemeId: integer("party_theme_id"),
  partyTheme: text("party_theme"), // Theme name for display
  customTheme: text("custom_theme"), // Custom theme name when user selects 'custom'
  
  // Package and Add-ons Selection
  selectedPackageId: integer("selected_package_id"),
  selectedAddons: json("selected_addons").default([]).notNull(), // [{id: number, quantity: number, name: string}]
  
  // Location and Setup
  location: text("location"), // "studio", "customer_location"
  customerAddress: json("customer_address"), // {street, city, state, zip}
  
  // Pricing Information
  estimatedCost: integer("estimated_cost"), // In cents, calculated total
  budget: integer("budget"), // In cents, customer's budget range
  
  // Lead Tracking
  status: text("status").default("new").notNull(), // "new", "contacted", "quoted", "converted", "lost"
  leadScore: text("lead_score").default("warm").notNull(), // "hot", "warm", "cold"
  followUpDate: timestamp("follow_up_date"),
  lastContactedAt: timestamp("last_contacted_at"),
  
  // Conversion Tracking  
  convertedCustomerId: integer("converted_customer_id"), // If lead converted to customer
  convertedEventId: integer("converted_event_id"), // If lead converted to event
  convertedAt: timestamp("converted_at"),
  
  // Form metadata
  formStep: text("form_step"), // Track which step user reached
  formData: json("form_data"), // Complete form data for recovery
  
  // Enhanced fields for comprehensive event data mapping (for auto-invoice building)
  eventDescription: text("event_description"), // General event description for all non-birthday events
  adultCount: integer("adult_count"), // Number of adults attending
  childCount: integer("child_count"), // Number of children attending (different from birthday child)
  attendeeCount: integer("attendee_count"), // Generic attendee count for workshops, jewelry, etc.
  eventLocation: text("event_location"), // "studio", "mobile", "client-location"
  mobileAddress: text("mobile_address"), // Address for mobile events
  startTime: text("start_time"), // Event start time "14:00"
  endTime: text("end_time"), // Event end time "18:00"
  dateFlexible: boolean("date_flexible").default(false), // If date/time is flexible
  scheduleNotes: text("schedule_notes"), // Date/time flexibility notes
  pricingDetails: json("pricing_details"), // Complex pricing structures (rental pricing, etc.)
  specialRequirements: json("special_requirements"), // Allergies, dietary restrictions, special needs
  workshopType: text("workshop_type"), // For workshops: "Art", "Craft", etc.
  classFormat: text("class_format"), // For workshops: "single", "series"
  jewelryPieces: json("jewelry_pieces"), // For permanent jewelry: selected pieces
  studioUsage: text("studio_usage"), // For studio rental: specific usage type
  packageSelection: text("package_selection"), // Selected package name/type
  foodPreferences: json("food_preferences"), // Food choices, cupcake flavors, etc.
  
  // Strategic missing fields for enhanced invoice building and admin display
  dateNotes: text("date_notes"), // Notes when user selects "not sure" for dates
  jewelryVision: text("jewelry_vision"), // Permanent jewelry event vision/description
  packageTotal: integer("package_total"), // Calculated package total in cents
  
  // Quote locking functionality
  isLocked: boolean("is_locked").default(false).notNull(), // Whether quote is locked for editing
  lockedBy: text("locked_by"), // Username/ID of person who locked the quote
  lockedAt: timestamp("locked_at"), // When the quote was locked
  
  // My Theme Party specific fields for /my-theme-party booking flow
  firstName: text("first_name"), // Customer first name
  lastName: text("last_name"), // Customer last name
  partyType: text("party_type"), // "diy" or "full-service"
  selectedStars: integer("selected_stars"), // 1-5 star package level
  selectedPremiumActivities: json("selected_premium_activities").default([]).notNull(), // Array of activity names
  selectedStandardActivities: json("selected_standard_activities").default([]).notNull(), // Array of activity names
  selectedFood: text("selected_food"), // "pizza" or "bagels"
  selectedFoodAddons: json("selected_food_addons").default({}).notNull(), // {addonName: quantity}
  selectedCupcakeFlavor: text("selected_cupcake_flavor"), // "vanilla" or "chocolate"
  selectedSweetAddons: json("selected_sweet_addons").default({}).notNull(), // {addonName: quantity}
  selectedDrinkAddons: json("selected_drink_addons").default({}).notNull(), // {addonName: quantity}
  selectedAllergies: json("selected_allergies").default([]).notNull(), // Array of allergy types
  agreedToCommunications: boolean("agreed_to_communications").default(false).notNull(), // User agreed to receive communications
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment tracking and transaction history
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  amount: integer("amount").notNull(), // In cents
  type: text("type").notNull(), // "deposit", "final", "refund"
  method: text("method").notNull(), // "card", "cash", "check", "venmo"
  status: text("status").default("pending").notNull(), // "pending", "completed", "failed", "refunded"
  processorId: text("processor_id"), // Stripe/Square transaction ID
  processorFee: integer("processor_fee").default(0).notNull(), // In cents
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory management for supplies and materials
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "decorations", "supplies", "food", "equipment"
  sku: text("sku"),
  currentStock: integer("current_stock").default(0).notNull(),
  minStock: integer("min_stock").default(0).notNull(),
  costPerUnit: integer("cost_per_unit"), // In cents
  supplier: text("supplier"),
  lastRestocked: timestamp("last_restocked"),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
});

export const eventInventoryUsage = pgTable("event_inventory_usage", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  inventoryId: integer("inventory_id").notNull(),
  quantityUsed: integer("quantity_used").notNull(),
  costPerUnit: integer("cost_per_unit").notNull(), // In cents at time of use
  totalCost: integer("total_cost").notNull(), // In cents
});

// Customer lifecycle and preferences
export const customerPreferences = pgTable("customer_preferences", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  preferredContactMethod: text("preferred_contact_method").default("email").notNull(),
  marketingOptIn: boolean("marketing_opt_in").default(true).notNull(),
  smsOptIn: boolean("sms_opt_in").default(false).notNull(),
  preferredEventTypes: text("preferred_event_types").array().default([]),
  budgetRange: text("budget_range"), // "under_500", "500_1000", "1000_plus"
  specialRequests: text("special_requests"),
  allergies: text("allergies").array().default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer authentication table
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event calendar for tracking confirmed/booked events
export const eventCalendar = pgTable("event_calendar", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  title: text("title").notNull(),
  eventDate: timestamp("event_date").notNull(),
  startTime: text("start_time").notNull(), // "14:00"
  endTime: text("end_time").notNull(), // "18:00"
  eventType: text("event_type").notNull(), // "birthday", "private-event", "workshop", etc.
  customerName: text("customer_name").notNull(),
  guestCount: integer("guest_count"),
  location: text("location").default("Host Hampton").notNull(),
  status: text("status").default("confirmed").notNull(), // "confirmed", "cancelled", "completed"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event status tracking and automation
export const eventStatusHistory = pgTable("event_status_history", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"), // Optional - can be null for lead-only tracking
  leadId: integer("lead_id"), // Track status changes for leads too
  oldStatus: text("old_status"),
  newStatus: text("new_status").notNull(),
  changedBy: text("changed_by"), // "system", "admin", "customer"
  automationTriggered: boolean("automation_triggered").default(false).notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const eventStageTemplates = pgTable("event_stage_templates", {
  id: serial("id").primaryKey(),
  stage: text("stage").notNull(), // "inquiry", "quote_sent", "follow_up", "confirmation", "reminder", "completion"
  eventTypeId: integer("event_type_id"), // Null for all event types
  templateType: text("template_type").notNull(), // "email", "sms"
  subject: text("subject"),
  content: text("content").notNull(),
  triggerDaysOffset: integer("trigger_days_offset").default(0).notNull(), // Days before/after event
  autoSend: boolean("auto_send").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Business analytics and reporting
export const businessMetrics = pgTable("business_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  metric: text("metric").notNull(), // "revenue", "bookings", "leads", "conversion_rate"
  value: integer("value").notNull(),
  category: text("category"), // "daily", "weekly", "monthly"
  metadata: json("metadata"), // Additional context
});

// Room rental pricing
export const roomRentalPricing = pgTable("room_rental_pricing", {
  id: serial("id").primaryKey(),
  duration: integer("duration").notNull(), // Duration in hours
  weekendPrice: integer("weekend_price").notNull(), // Price in cents for Fri-Sun
  weekdayPrice: integer("weekday_price").notNull(), // Price in cents for Mon-Thurs
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  reviewDate: true,
});

// New insert schemas for the designer tool
export const insertEventTypeSchema = createInsertSchema(eventTypes).omit({
  id: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
});

export const insertAddonSchema = createInsertSchema(addons).omit({
  id: true,
});

export const insertPartyThemeSchema = createInsertSchema(partyThemes).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

// Enhanced schemas for new tables
export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({ id: true });
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, createdAt: true });
export const insertEventStaffAssignmentSchema = createInsertSchema(eventStaffAssignments).omit({ id: true });
export const insertCommunicationSchema = createInsertSchema(communications).omit({ id: true, sentAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });
export const insertEventInventoryUsageSchema = createInsertSchema(eventInventoryUsage).omit({ id: true });
export const insertCustomerPreferencesSchema = createInsertSchema(customerPreferences).omit({ id: true, updatedAt: true });
export const insertBusinessMetricSchema = createInsertSchema(businessMetrics).omit({ id: true });
export const insertEventCalendarSchema = createInsertSchema(eventCalendar).omit({ id: true, createdAt: true });
export const insertRoomRentalPricingSchema = createInsertSchema(roomRentalPricing).omit({ id: true, createdAt: true });
export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({ id: true, createdAt: true });
export const insertEventStatusHistorySchema = createInsertSchema(eventStatusHistory).omit({ id: true, timestamp: true });
export const insertEventStageTemplateSchema = createInsertSchema(eventStageTemplates).omit({ id: true, createdAt: true });

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // Future: could relate to party bookings if needed
}));



export const reviewsRelations = relations(reviews, ({ one }) => ({
  // Future: could relate to party bookings if needed
}));

export const eventTypesRelations = relations(eventTypes, ({ many }) => ({
  packages: many(packages),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  events: many(events),
}));

export const packagesRelations = relations(packages, ({ one }) => ({
  eventType: one(eventTypes, { fields: [packages.eventTypeId], references: [eventTypes.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  eventType: one(eventTypes, { fields: [events.eventTypeId], references: [eventTypes.id] }),
  customer: one(customers, { fields: [events.customerId], references: [customers.id] }),
  lead: one(leads, { fields: [events.leadId], references: [leads.id] }),
  selectedPackage: one(packages, { fields: [events.selectedPackageId], references: [packages.id] }),
  partyTheme: one(partyThemes, { fields: [events.partyThemeId], references: [partyThemes.id] }),
  invoice: one(invoices),
  statusHistory: many(eventStatusHistory),
  calendarEntry: one(eventCalendar),
  staffAssignments: many(eventStaffAssignments),
  communications: many(communications),
  inventoryUsage: many(eventInventoryUsage),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  event: one(events, { fields: [invoices.eventId], references: [events.id] }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

// Enhanced relations for new tables
export const staffRelations = relations(staff, ({ many }) => ({
  eventAssignments: many(eventStaffAssignments),
}));

export const eventStaffAssignmentsRelations = relations(eventStaffAssignments, ({ one }) => ({
  event: one(events, { fields: [eventStaffAssignments.eventId], references: [events.id] }),
  staff: one(staff, { fields: [eventStaffAssignments.staffId], references: [staff.id] }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  customer: one(customers, { fields: [communications.customerId], references: [customers.id] }),
  event: one(events, { fields: [communications.eventId], references: [events.id] }),
}));

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [leads.campaignId], references: [campaigns.id] }),
  eventType: one(eventTypes, { fields: [leads.eventTypeId], references: [eventTypes.id] }),
  partyTheme: one(partyThemes, { fields: [leads.partyThemeId], references: [partyThemes.id] }),
  selectedPackage: one(packages, { fields: [leads.selectedPackageId], references: [packages.id] }),
  convertedCustomer: one(customers, { fields: [leads.convertedCustomerId], references: [customers.id] }),
  convertedEvent: one(events, { fields: [leads.convertedEventId], references: [events.id] }),
  statusHistory: many(eventStatusHistory),
  communications: many(communications),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));

export const inventoryRelations = relations(inventory, ({ many }) => ({
  eventUsage: many(eventInventoryUsage),
}));

export const eventInventoryUsageRelations = relations(eventInventoryUsage, ({ one }) => ({
  event: one(events, { fields: [eventInventoryUsage.eventId], references: [events.id] }),
  inventory: one(inventory, { fields: [eventInventoryUsage.inventoryId], references: [inventory.id] }),
}));

export const customerPreferencesRelations = relations(customerPreferences, ({ one }) => ({
  customer: one(customers, { fields: [customerPreferences.customerId], references: [customers.id] }),
}));

export const eventCalendarRelations = relations(eventCalendar, ({ one }) => ({
  event: one(events, { fields: [eventCalendar.eventId], references: [events.id] }),
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// New types for the designer tool
export type InsertEventType = z.infer<typeof insertEventTypeSchema>;
export type EventType = typeof eventTypes.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;
export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addons.$inferSelect;
export type InsertPartyTheme = z.infer<typeof insertPartyThemeSchema>;
export type PartyTheme = typeof partyThemes.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Enhanced types for new tables
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertEventStaffAssignment = z.infer<typeof insertEventStaffAssignmentSchema>;
export type EventStaffAssignment = typeof eventStaffAssignments.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Communication = typeof communications.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertEventInventoryUsage = z.infer<typeof insertEventInventoryUsageSchema>;
export type EventInventoryUsage = typeof eventInventoryUsage.$inferSelect;
export type InsertCustomerPreferences = z.infer<typeof insertCustomerPreferencesSchema>;
export type CustomerPreferences = typeof customerPreferences.$inferSelect;
export type InsertBusinessMetric = z.infer<typeof insertBusinessMetricSchema>;
export type BusinessMetric = typeof businessMetrics.$inferSelect;
export type InsertEventCalendar = z.infer<typeof insertEventCalendarSchema>;
export type EventCalendar = typeof eventCalendar.$inferSelect;
export type InsertRoomRentalPricing = z.infer<typeof insertRoomRentalPricingSchema>;
export type RoomRentalPricing = typeof roomRentalPricing.$inferSelect;
export type InsertEventStatusHistory = z.infer<typeof insertEventStatusHistorySchema>;
export type EventStatusHistory = typeof eventStatusHistory.$inferSelect;
export type InsertEventStageTemplate = z.infer<typeof insertEventStageTemplateSchema>;
export type EventStageTemplate = typeof eventStageTemplates.$inferSelect;

// E-commerce Products for Shop Events
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents (first ticket price)
  siblingPrice: integer("sibling_price"), // Price in cents for additional siblings (null if no sibling discount)
  hasSiblingDiscount: boolean("has_sibling_discount").default(false),
  imageUrl: text("image_url"),
  category: text("category"),
  eventDate: timestamp("event_date"),
  location: text("location"),
  maxTickets: integer("max_tickets"),
  availableTickets: integer("available_tickets"),
  hasMultipleSessions: boolean("has_multiple_sessions").default(false), // True if event has multiple date/time options
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event sessions for products with multiple date/time options
export const productSessions = pgTable("product_sessions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  sessionName: text("session_name"), // e.g., "Canvas Bag Painting", "Tuesday Morning Session"
  sessionDate: timestamp("session_date").notNull(),
  sessionTime: text("session_time"), // e.g., "5:00 AM", "Morning"
  maxTickets: integer("max_tickets"),
  availableTickets: integer("available_tickets"),
  priceOverride: integer("price_override"), // Override product price for this session if needed
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product option categories (e.g., "Wood Type", "Size")
export const productOptionCategories = pgTable("product_option_categories", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  name: text("name").notNull(), // e.g., "Wood Type", "Size"
  description: text("description"),
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual options within a category (e.g., "Coaster", "Cutting Board", "Lazy Susan")
export const productOptions = pgTable("product_options", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => productOptionCategories.id),
  name: text("name").notNull(), // e.g., "Coaster", "Cutting Board"
  description: text("description"),
  priceModifier: integer("price_modifier").default(0), // Price difference in cents (+/- from base price)
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping Cart
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").references(() => products.id),
  productSessionId: integer("product_session_id").references(() => productSessions.id), // For events with multiple sessions
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders for completed purchases
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  billingAddress: text("billing_address"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingZip: text("billing_zip"),
  totalAmount: integer("total_amount").notNull(), // Amount in cents
  status: text("status").default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  productSessionId: integer("product_session_id").references(() => productSessions.id), // For events with multiple sessions
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // Price in cents at time of purchase
  createdAt: timestamp("created_at").defaultNow(),
});

// E-commerce types
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type ProductSession = typeof productSessions.$inferSelect;
export type InsertProductSession = typeof productSessions.$inferInsert;
export type ProductOptionCategory = typeof productOptionCategories.$inferSelect;
export type InsertProductOptionCategory = typeof productOptionCategories.$inferInsert;
export type ProductOption = typeof productOptions.$inferSelect;
export type InsertProductOption = typeof productOptions.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Enhanced order item type with product and session information for admin display
export type EnhancedOrderItem = OrderItem & {
  productName?: string | null;
  sessionName?: string | null;
};

// E-commerce schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSessionSchema = createInsertSchema(productSessions).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductOptionCategorySchema = createInsertSchema(productOptionCategories).omit({
  id: true,
  createdAt: true,
});

export const insertProductOptionSchema = createInsertSchema(productOptions).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});
