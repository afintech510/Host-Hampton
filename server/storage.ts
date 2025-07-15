import { users, partyBookings, type User, type InsertUser, type PartyBooking, type InsertPartyBooking } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPartyBooking(booking: InsertPartyBooking): Promise<PartyBooking>;
  getPartyBooking(id: number): Promise<PartyBooking | undefined>;
  getAllPartyBookings(): Promise<PartyBooking[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private partyBookings: Map<number, PartyBooking>;
  private currentUserId: number;
  private currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.partyBookings = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
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
}

export const storage = new MemStorage();
