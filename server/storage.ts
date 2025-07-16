import { users, partyBookings, reviews, partyThemes, partyExtras, type User, type InsertUser, type PartyBooking, type InsertPartyBooking, type Review, type InsertReview, type PartyTheme, type PartyExtra } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPartyBooking(booking: InsertPartyBooking): Promise<PartyBooking>;
  getPartyBooking(id: number): Promise<PartyBooking | undefined>;
  getAllPartyBookings(): Promise<PartyBooking[]>;
  createReview(review: InsertReview): Promise<Review>;
  getReviews(limit?: number): Promise<Review[]>;
  getFeaturedReviews(): Promise<Review[]>;
  getPartyThemes(): Promise<PartyTheme[]>;
  getPartyExtras(): Promise<PartyExtra[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private partyBookings: Map<number, PartyBooking>;
  private reviews: Map<number, Review>;
  private currentUserId: number;
  private currentBookingId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.partyBookings = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPartyBooking(insertBooking: InsertPartyBooking): Promise<PartyBooking> {
    const id = this.currentBookingId++;
    const booking: PartyBooking = { 
      ...insertBooking,
      partyAddons: Array.isArray(insertBooking.partyAddons) ? insertBooking.partyAddons : [],
      partyNotes: insertBooking.partyNotes || null,
      id,
      createdAt: new Date()
    };
    this.partyBookings.set(id, booking);
    return booking;
  }

  async getPartyBooking(id: number): Promise<PartyBooking | undefined> {
    return this.partyBookings.get(id);
  }

  async getAllPartyBookings(): Promise<PartyBooking[]> {
    return Array.from(this.partyBookings.values());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = { 
      ...insertReview, 
      id, 
      reviewDate: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviews(limit: number = 10): Promise<Review[]> {
    const allReviews = Array.from(this.reviews.values());
    return allReviews.sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime()).slice(0, limit);
  }

  async getFeaturedReviews(): Promise<Review[]> {
    const featuredReviews = Array.from(this.reviews.values()).filter(review => review.featured);
    return featuredReviews.sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime());
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createPartyBooking(insertBooking: InsertPartyBooking): Promise<PartyBooking> {
    const [booking] = await db
      .insert(partyBookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async getPartyBooking(id: number): Promise<PartyBooking | undefined> {
    const [booking] = await db.select().from(partyBookings).where(eq(partyBookings.id, id));
    return booking || undefined;
  }

  async getAllPartyBookings(): Promise<PartyBooking[]> {
    return await db.select().from(partyBookings);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getReviews(limit: number = 10): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(reviews.reviewDate).limit(limit);
  }

  async getFeaturedReviews(): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.featured, true)).orderBy(reviews.reviewDate);
  }

  async getPartyThemes(): Promise<PartyTheme[]> {
    return await db.select().from(partyThemes).where(eq(partyThemes.active, true));
  }

  async getPartyExtras(): Promise<PartyExtra[]> {
    return await db.select().from(partyExtras).where(eq(partyExtras.active, true));
  }
}

export const storage = new DatabaseStorage();
