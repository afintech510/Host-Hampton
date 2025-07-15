import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

export const insertPartyBookingSchema = createInsertSchema(partyBookings).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPartyBooking = z.infer<typeof insertPartyBookingSchema>;
export type PartyBooking = typeof partyBookings.$inferSelect;
