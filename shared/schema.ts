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
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const partyExtras = pgTable("party_extras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
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
