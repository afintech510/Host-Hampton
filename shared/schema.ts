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

// Relations (currently no foreign key relationships, but following blueprint pattern)
export const usersRelations = relations(users, ({ many }) => ({
  // Future: could relate to party bookings if needed
}));

export const partyBookingsRelations = relations(partyBookings, ({ one }) => ({
  // Future: could relate to users if needed
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  // Future: could relate to party bookings if needed
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPartyBooking = z.infer<typeof insertPartyBookingSchema>;
export type PartyBooking = typeof partyBookings.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
