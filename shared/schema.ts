import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const partyBookings = pgTable("party_bookings", {
  id: serial("id").primaryKey(),
  partyDate: text("party_date").notNull(),
  partyTime: text("party_time").notNull(),
  partyTheme: text("party_theme").notNull(),
  partyAddons: text("party_addons").array().default([]),
  childName: text("child_name").notNull(),
  childAge: integer("child_age").notNull(),
  guestCount: integer("guest_count").notNull(),
  foodChoice: text("food_choice").notNull(),
  cupcakeFlavor: text("cupcake_flavor").notNull(),
  parentFirstName: text("parent_first_name").notNull(),
  parentLastName: text("parent_last_name").notNull(),
  parentEmail: text("parent_email").notNull(),
  parentPhone: text("parent_phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  zipCode: text("zip_code").notNull(),
  partyNotes: text("party_notes"),
  totalEstimate: integer("total_estimate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const partyThemes = pgTable("party_themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").default(0).notNull(), // Price in cents
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const partyExtras = pgTable("party_extras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
  pricingType: text("pricing_type").default("flat").notNull(), // "flat" or "per_person"
  icon: text("icon").notNull(),
  active: boolean("active").default(true).notNull(),
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
  active: boolean("active").default(true).notNull(),
});

export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
  perGuest: boolean("per_guest").default(false).notNull(),
  imageUrl: text("image_url"),
  active: boolean("active").default(true).notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventTypeId: integer("event_type_id").notNull(),
  customerId: integer("customer_id").notNull(),
  eventDate: timestamp("event_date").notNull(),
  guestCount: integer("guest_count"),
  status: text("status").default("quote").notNull(), // quote, booked, deposit_paid, final_paid, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  subtotal: integer("subtotal").notNull(), // In cents
  tax: integer("tax").notNull(), // In cents
  total: integer("total").notNull(), // In cents
  deposit: integer("deposit").notNull(), // In cents
  balanceDue: integer("balance_due").notNull(), // In cents
  ccFee: integer("cc_fee").default(0).notNull(), // In cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  eventType: text("event_type"),
  eventDate: timestamp("event_date"),
  guestCount: integer("guest_count"),
  budget: integer("budget"), // In cents
  status: text("status").default("new").notNull(), // "new", "contacted", "quoted", "converted", "lost"
  notes: text("notes"),
  convertedCustomerId: integer("converted_customer_id"), // If lead converted
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  location: text("location").default("Host Hampton Studio").notNull(),
  status: text("status").default("confirmed").notNull(), // "confirmed", "cancelled", "completed"
  notes: text("notes"),
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

export const insertPartyBookingSchema = createInsertSchema(partyBookings).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  reviewDate: true,
});

export const insertPartyThemeSchema = createInsertSchema(partyThemes).omit({
  id: true,
});

export const insertPartyExtraSchema = createInsertSchema(partyExtras).omit({
  id: true,
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

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
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
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });
export const insertEventInventoryUsageSchema = createInsertSchema(eventInventoryUsage).omit({ id: true });
export const insertCustomerPreferencesSchema = createInsertSchema(customerPreferences).omit({ id: true, updatedAt: true });
export const insertBusinessMetricSchema = createInsertSchema(businessMetrics).omit({ id: true });
export const insertEventCalendarSchema = createInsertSchema(eventCalendar).omit({ id: true, createdAt: true });

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // Future: could relate to party bookings if needed
}));

export const partyBookingsRelations = relations(partyBookings, ({ one }) => ({
  // Future: could relate to users if needed
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
  invoice: one(invoices),
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

export const leadsRelations = relations(leads, ({ one }) => ({
  campaign: one(campaigns, { fields: [leads.campaignId], references: [campaigns.id] }),
  convertedCustomer: one(customers, { fields: [leads.convertedCustomerId], references: [customers.id] }),
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
export type InsertPartyBooking = z.infer<typeof insertPartyBookingSchema>;
export type PartyBooking = typeof partyBookings.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertPartyTheme = z.infer<typeof insertPartyThemeSchema>;
export type PartyTheme = typeof partyThemes.$inferSelect;
export type InsertPartyExtra = z.infer<typeof insertPartyExtraSchema>;
export type PartyExtra = typeof partyExtras.$inferSelect;

// New types for the designer tool
export type InsertEventType = z.infer<typeof insertEventTypeSchema>;
export type EventType = typeof eventTypes.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;
export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addons.$inferSelect;
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
