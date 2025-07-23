import { 
  users, partyBookings, reviews, partyThemes, partyExtras,
  eventTypes, customers, packages, addons, events, invoices, invoiceItems, eventCalendar,
  type User, type InsertUser, type PartyBooking, type InsertPartyBooking, 
  type Review, type InsertReview, type PartyTheme, type PartyExtra,
  type EventType, type InsertEventType, type Customer, type InsertCustomer,
  type Package, type InsertPackage, type Addon, type InsertAddon,
  type Event, type InsertEvent, type Invoice, type InsertInvoice,
  type InvoiceItem, type InsertInvoiceItem, type EventCalendar, type InsertEventCalendar
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Existing methods
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
  
  // New Designer Tool methods
  getEventTypes(): Promise<EventType[]>;
  createEventType(eventType: InsertEventType): Promise<EventType>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getPackages(): Promise<Package[]>;
  getPackagesByEventType(eventTypeId: number): Promise<Package[]>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  getAddons(): Promise<Addon[]>;
  createAddon(addon: InsertAddon): Promise<Addon>;
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  updateEventStatus(id: number, status: string): Promise<Event | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByEventId(eventId: number): Promise<Invoice | undefined>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  
  // Enhanced methods for new functionality
  createCommunication(communication: any): Promise<any>;
  getTimeSlots(date?: string): Promise<any[]>;
  createTimeSlot(slot: any): Promise<any>;
  getStaff(): Promise<any[]>;
  createStaff(staff: any): Promise<any>;
  createLead(lead: any): Promise<any>;
  getLeads(): Promise<any[]>;
  createPayment(payment: any): Promise<any>;
  getPayments(invoiceId?: number): Promise<any[]>;
  createEventCalendar(calendarEntry: InsertEventCalendar): Promise<EventCalendar>;
  getEventCalendar(): Promise<EventCalendar[]>;
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
      partyTheme: insertReview.partyTheme || null,
      platform: insertReview.platform || "Google",
      verified: insertReview.verified !== undefined ? insertReview.verified : true,
      featured: insertReview.featured !== undefined ? insertReview.featured : false,
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

  // Placeholder implementations for legacy system methods
  async getPartyThemes(): Promise<PartyTheme[]> {
    return [];
  }

  async getPartyExtras(): Promise<PartyExtra[]> {
    return [];
  }

  // New Designer Tool methods - placeholder implementations
  async getEventTypes(): Promise<EventType[]> {
    return [];
  }

  async createEventType(eventType: InsertEventType): Promise<EventType> {
    throw new Error("Not implemented in MemStorage");
  }

  async getCustomers(): Promise<Customer[]> {
    return [];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    throw new Error("Not implemented in MemStorage");
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return undefined;
  }

  async getPackages(): Promise<Package[]> {
    return [];
  }

  async getPackagesByEventType(eventTypeId: number): Promise<Package[]> {
    return [];
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    throw new Error("Not implemented in MemStorage");
  }

  async getAddons(): Promise<Addon[]> {
    return [];
  }

  async createAddon(addon: InsertAddon): Promise<Addon> {
    throw new Error("Not implemented in MemStorage");
  }

  async getEvents(): Promise<Event[]> {
    return [];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    throw new Error("Not implemented in MemStorage");
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return undefined;
  }

  async updateEventStatus(id: number, status: string): Promise<Event | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    throw new Error("Not implemented in MemStorage");
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return undefined;
  }

  async getInvoiceByEventId(eventId: number): Promise<Invoice | undefined> {
    return undefined;
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    throw new Error("Not implemented in MemStorage");
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return [];
  }

  // Enhanced methods for new functionality (placeholder implementations)
  async createCommunication(communication: any): Promise<any> {
    console.log('Communication logged:', communication);
    return communication;
  }

  async getTimeSlots(date?: string): Promise<any[]> {
    return [];
  }

  async createTimeSlot(slot: any): Promise<any> {
    return slot;
  }

  async getStaff(): Promise<any[]> {
    return [];
  }

  async createStaff(staff: any): Promise<any> {
    return staff;
  }

  async createLead(lead: any): Promise<any> {
    return lead;
  }

  async getLeads(): Promise<any[]> {
    return [];
  }

  async createPayment(payment: any): Promise<any> {
    return payment;
  }

  async getPayments(invoiceId?: number): Promise<any[]> {
    return [];
  }

  async createEventCalendar(calendarEntry: InsertEventCalendar): Promise<EventCalendar> {
    throw new Error("Not implemented in MemStorage");
  }

  async getEventCalendar(): Promise<EventCalendar[]> {
    return [];
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

  // New Designer Tool methods - Database implementations
  async getEventTypes(): Promise<EventType[]> {
    return await db.select().from(eventTypes).where(eq(eventTypes.active, true));
  }

  async createEventType(eventType: InsertEventType): Promise<EventType> {
    const [created] = await db.insert(eventTypes).values(eventType).returning();
    return created;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async getPackages(): Promise<Package[]> {
    return await db.select().from(packages).where(eq(packages.active, true));
  }

  async getPackagesByEventType(eventTypeId: number): Promise<Package[]> {
    return await db.select().from(packages).where(eq(packages.eventTypeId, eventTypeId));
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const [created] = await db.insert(packages).values(pkg).returning();
    return created;
  }

  async getAddons(): Promise<Addon[]> {
    return await db.select().from(addons).where(eq(addons.active, true));
  }

  async createAddon(addon: InsertAddon): Promise<Addon> {
    const [created] = await db.insert(addons).values(addon).returning();
    return created;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async updateEventStatus(id: number, status: string): Promise<Event | undefined> {
    const [updated] = await db.update(events).set({ status }).where(eq(events.id, id)).returning();
    return updated || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoiceByEventId(eventId: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.eventId, eventId));
    return invoice || undefined;
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [created] = await db.insert(invoiceItems).values(item).returning();
    return created;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  // Enhanced methods for comprehensive business management
  async createCommunication(communication: any): Promise<any> {
    // TODO: Implement with communications table
    return communication;
  }

  async getTimeSlots(date?: string): Promise<any[]> {
    // TODO: Implement with timeSlots table
    return [];
  }

  async createTimeSlot(slot: any): Promise<any> {
    // TODO: Implement with timeSlots table
    return slot;
  }

  async getStaff(): Promise<any[]> {
    // TODO: Implement with staff table
    return [];
  }

  async createStaff(staff: any): Promise<any> {
    // TODO: Implement with staff table
    return staff;
  }

  async createLead(lead: any): Promise<any> {
    // TODO: Implement with leads table
    return lead;
  }

  async getLeads(): Promise<any[]> {
    // TODO: Implement with leads table
    return [];
  }

  async createPayment(payment: any): Promise<any> {
    // TODO: Implement with payments table
    return payment;
  }

  async getPayments(invoiceId?: number): Promise<any[]> {
    // TODO: Implement with payments table
    return [];
  }

  async createEventCalendar(calendarEntry: InsertEventCalendar): Promise<EventCalendar> {
    const [created] = await db.insert(eventCalendar).values(calendarEntry).returning();
    return created;
  }

  async getEventCalendar(): Promise<EventCalendar[]> {
    return await db.select().from(eventCalendar).orderBy(eventCalendar.eventDate);
  }
}

export const storage = new DatabaseStorage();
