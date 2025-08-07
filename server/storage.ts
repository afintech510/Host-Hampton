import { 
  users, reviews, eventTypes, customers, packages, addons, partyThemes, events, invoices, invoiceItems, eventCalendar,
  roomRentalPricing, verificationCodes, leads, eventStatusHistory, products, cartItems, orders, orderItems,
  type User, type InsertUser, type Review, type InsertReview,
  type EventType, type InsertEventType, type Customer, type InsertCustomer,
  type Package, type InsertPackage, type Addon, type InsertAddon,
  type PartyTheme, type InsertPartyTheme,
  type Event, type InsertEvent, type Invoice, type InsertInvoice,
  type InvoiceItem, type InsertInvoiceItem, type EventCalendar, type InsertEventCalendar,
  type RoomRentalPricing, type Lead, type InsertLead, type EventStatusHistory, type InsertEventStatusHistory,
  type Product, type InsertProduct, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReviews(limit?: number): Promise<Review[]>;
  getFeaturedReviews(): Promise<Review[]>;
  
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
  getPartyThemes(): Promise<PartyTheme[]>;
  createPartyTheme(theme: InsertPartyTheme): Promise<PartyTheme>;
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  updateEvent(id: number, updates: any): Promise<Event | undefined>;
  updateEventStatus(id: number, status: string): Promise<Event | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  updateInvoice(id: number, updates: any): Promise<Invoice | undefined>;
  getInvoices(): Promise<Invoice[]>;
  getInvoiceByEventId(eventId: number): Promise<Invoice | undefined>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  deleteInvoiceItems(invoiceId: number): Promise<void>;
  
  // Enhanced methods for new functionality
  createCommunication(communication: any): Promise<any>;
  getTimeSlots(date?: string): Promise<any[]>;
  createTimeSlot(slot: any): Promise<any>;
  getStaff(): Promise<any[]>;
  createStaffMember(staff: any): Promise<any>;
  
  // Lead management methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  convertLeadToEvent(leadId: number, customerId: number): Promise<{ lead: Lead; event: Event; customer: Customer } | undefined>;
  
  // Event status tracking
  updateEventStatus(id: number, status: string, changedBy?: string, notes?: string): Promise<Event | undefined>;
  createEventStatusHistory(history: InsertEventStatusHistory): Promise<EventStatusHistory>;
  getEventStatusHistory(eventId: number): Promise<EventStatusHistory[]>;
  
  createPayment(payment: any): Promise<any>;
  getPayments(invoiceId?: number): Promise<any[]>;
  createEventCalendar(calendarEntry: InsertEventCalendar): Promise<EventCalendar>;
  getEventCalendar(): Promise<EventCalendar[]>;
  
  // E-commerce methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart management
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  updateCartItemByProduct(sessionId: string, productId: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;
  
  // Order management
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  getRoomRentalPricing(): Promise<RoomRentalPricing[]>;
  
  // Customer authentication methods
  createVerificationCode(email: string, code: string): Promise<void>;
  verifyCode(email: string, code: string): Promise<{ customerId: number } | null>;
  getCustomerEvents(customerId: number): Promise<any[]>;
  
  // Enhanced invoice and lead methods
  getInvoiceById(id: number): Promise<any | null>;
  processInvoicePayment(invoiceId: number, paymentData: any): Promise<any | null>;
  getLeadById(id: number): Promise<any | null>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reviews: Map<number, Review>;
  private partyThemes: Map<number, PartyTheme>;
  private leads: Map<number, Lead>;
  private currentUserId: number;
  private currentLeadId: number;
  private currentReviewId: number;
  private currentThemeId: number;
  private addons: Map<number, Addon>;
  private currentAddonId: number;
  private customers: Map<number, Customer>;
  private events: Map<number, Event>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private currentCustomerId: number;
  private currentEventId: number;
  private currentInvoiceId: number;
  private currentInvoiceItemId: number;

  constructor() {
    this.users = new Map();
    this.reviews = new Map();
    this.partyThemes = new Map();
    this.addons = new Map();
    this.customers = new Map();
    this.events = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.leads = new Map();
    this.currentUserId = 1;
    this.currentReviewId = 1;
    this.currentThemeId = 1;
    this.currentAddonId = 1;
    this.currentCustomerId = 1;
    this.currentEventId = 1;
    this.currentInvoiceId = 1;
    this.currentInvoiceItemId = 1;
    this.currentLeadId = 1;
    
    // Initialize party themes and addons
    this.initializePartyThemes();
    this.initializeAddons();
  }
  
  private initializePartyThemes() {
    const themes = [
      { name: "Princess Party", description: "Magical princess adventure with tiaras and fairy tales", price: 15000, icon: "👑", color: "pink" },
      { name: "Superhero Party", description: "Action-packed hero training with capes and masks", price: 15000, icon: "🦸", color: "blue" },
      { name: "Dinosaur Party", description: "Prehistoric adventure with fossil hunts and dino games", price: 15000, icon: "🦕", color: "green" },
      { name: "Unicorn Party", description: "Enchanted unicorn party with rainbow decorations", price: 15000, icon: "🦄", color: "purple" },
      { name: "Space Party", description: "Cosmic adventure with planets and rocket ships", price: 15000, icon: "🚀", color: "navy" },
      { name: "Mermaid Party", description: "Under the sea adventure with shells and treasures", price: 15000, icon: "🧜", color: "teal" },
      { name: "Safari Party", description: "Wild animal adventure with jungle decorations", price: 15000, icon: "🦁", color: "orange" },
      { name: "Art Party", description: "Creative art studio with painting and crafts", price: 12000, icon: "🎨", color: "yellow" }
    ];
    
    themes.forEach(theme => {
      const id = this.currentThemeId++;
      this.partyThemes.set(id, { 
        ...theme, 
        id,
        active: true,
        description: theme.description || null,
        icon: theme.icon,
        color: theme.color
      });
    });
  }
  
  private initializeAddons() {
    const addons = [
      { name: "Face Painting", description: "Professional face painting for all guests", price: 7500, imageUrl: null, perGuest: false, active: true },
      { name: "Balloon Animals", description: "Balloon twisting and animal sculptures", price: 5000, imageUrl: null, perGuest: false, active: true },
      { name: "Magic Show", description: "45-minute interactive magic performance", price: 12000, imageUrl: null, perGuest: false, active: true },
      { name: "Photo Booth", description: "Props and backdrop for memorable photos", price: 8500, imageUrl: null, perGuest: false, active: true },
      { name: "Character Visit", description: "Themed character appearance for 30 minutes", price: 15000, imageUrl: null, perGuest: false, active: true },
      { name: "Craft Station", description: "DIY craft activities with supplies included", price: 6000, imageUrl: null, perGuest: false, active: true },
      { name: "Goodie Bags", description: "Pre-filled party favor bags per child", price: 800, imageUrl: null, perGuest: true, active: true },
      { name: "Extra Hour", description: "Extend your party by one additional hour", price: 10000, imageUrl: null, perGuest: false, active: true }
    ];
    
    addons.forEach(addon => {
      const id = this.currentAddonId++;
      this.addons.set(id, { 
        ...addon, 
        id,
        description: addon.description || null,
        icon: null,
        category: null
      });
    });
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

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      billingAddress: insertCustomer.billingAddress || null,
      createdAt: new Date()
    };
    // Store in a customers map (add if missing)
    if (!this.customers) {
      this.customers = new Map();
    }
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    for (const customer of Array.from(this.customers.values())) {
      if (customer.email === email) {
        return customer;
      }
    }
    return undefined;
  }

  async getCustomerEvents(customerId: number): Promise<any[]> {
    const events = await this.getEvents();
    return events.filter(event => event.customerId === customerId);
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
    return Array.from(this.addons.values()).filter(addon => addon.active);
  }

  async createAddon(insertAddon: InsertAddon): Promise<Addon> {
    const id = this.currentAddonId++;
    const addon: Addon = { 
      ...insertAddon, 
      id,
      description: insertAddon.description || null,
      icon: insertAddon.icon || null,
      imageUrl: insertAddon.imageUrl || null,
      active: insertAddon.active !== undefined ? insertAddon.active : true,
      perGuest: insertAddon.perGuest !== undefined ? insertAddon.perGuest : false,
      category: insertAddon.category || null
    };
    this.addons.set(id, addon);
    return addon;
  }

  async getPartyThemes(): Promise<PartyTheme[]> {
    return Array.from(this.partyThemes.values()).filter(theme => theme.active);
  }

  async createPartyTheme(insertTheme: InsertPartyTheme): Promise<PartyTheme> {
    const id = this.currentThemeId++;
    const theme: PartyTheme = { 
      ...insertTheme, 
      id,
      description: insertTheme.description || null,
      active: insertTheme.active !== undefined ? insertTheme.active : true
    };
    this.partyThemes.set(id, theme);
    return theme;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...insertEvent,
      id,
      leadId: insertEvent.leadId || null,
      eventDate: insertEvent.eventDate || null,
      status: insertEvent.status || "pending",
      guestCount: insertEvent.guestCount || 0,
      notes: insertEvent.notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).concat([
      {
        id: 1,
        eventTypeId: 1,
        customerId: 1,
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        guestCount: 12,
        status: "confirmed",
        notes: "Disney Princess theme, outdoor setup preferred",
        createdAt: new Date(),
        // Additional admin dashboard properties
        eventTime: "2:00 PM",
        totalAmount: 48600, // $486.00 in cents
        customerName: "Sarah Smith",
        eventTypeName: "Birthday Party"
      } as any,
      {
        id: 2,
        eventTypeId: 3,
        customerId: 2,
        eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        guestCount: 8,
        status: "pending",
        notes: "First time booking, interested in jewelry options",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        // Additional admin dashboard properties
        eventTime: "6:00 PM",
        totalAmount: 34560, // $345.60 in cents
        customerName: "Jessica Miller",
        eventTypeName: "Permanent Jewelry Party"
      } as any,
      {
        id: 3,
        eventTypeId: 5,
        customerId: 3,
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        guestCount: 20,
        status: "quote",
        notes: "Corporate team building event",
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        // Additional admin dashboard properties
        eventTime: "1:00 PM",
        totalAmount: 75000, // $750.00 in cents
        customerName: "Amanda Rodriguez",
        eventTypeName: "Studio Rental"
      } as any
    ]);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      leadId: insertInvoice.leadId || null,
      status: insertInvoice.status || "draft",
      notes: insertInvoice.notes || null,
      ccFee: insertInvoice.ccFee || 0,
      depositPaid: insertInvoice.depositPaid || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async createInvoiceItem(insertInvoiceItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.currentInvoiceItemId++;
    const invoiceItem: InvoiceItem = {
      ...insertInvoiceItem,
      id,
      quantity: insertInvoiceItem.quantity || 1
    };
    this.invoiceItems.set(id, invoiceItem);
    return invoiceItem;
  }

  // createEvent is already implemented above

  async getEvent(id: number): Promise<Event | undefined> {
    const events = await this.getEvents();
    return events.find(event => event.id === id);
  }

  async updateEvent(id: number, updates: any): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (event) {
      Object.assign(event, updates);
      return event;
    }
    return undefined;
  }

  async updateEventStatus(id: number, status: string): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (event) {
      event.status = status;
      return event;
    }
    return undefined;
  }

  // createInvoice is already implemented above

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const invoices = await this.getInvoices();
    return invoices.find(invoice => invoice.id === id);
  }

  async updateInvoice(id: number, updates: any): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (invoice) {
      Object.assign(invoice, updates);
      return invoice;
    }
    return undefined;
  }



  async getInvoiceByEventId(eventId: number): Promise<Invoice | undefined> {
    return undefined;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === invoiceId);
  }

  // getInvoiceItems is already implemented above

  async getInvoices(): Promise<Invoice[]> {
    // Sample invoice data for demonstration
    return [
      {
        id: 1,
        eventId: 1,
        subtotal: 45000, // $450.00 in cents
        tax: 3600, // $36.00 in cents
        total: 48600, // $486.00 in cents
        deposit: 15000, // $150.00 in cents
        balanceDue: 33600, // $336.00 in cents
        ccFee: 0,
        notes: "Birthday party for Emma - Disney Princess theme",
        createdAt: new Date(),
        // Additional admin dashboard properties
        invoiceNumber: "INV-001",
        totalAmount: 48600,
        taxAmount: 3600,
        depositAmount: 15000,
        status: "pending",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        customerName: "Sarah Smith"
      } as any,
      {
        id: 2,
        eventId: 2,
        subtotal: 32000, // $320.00 in cents
        tax: 2560, // $25.60 in cents
        total: 34560, // $345.60 in cents
        deposit: 10000, // $100.00 in cents
        balanceDue: 24560, // $245.60 in cents
        ccFee: 0,
        notes: "Permanent jewelry workshop",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        // Additional admin dashboard properties
        invoiceNumber: "INV-002",
        totalAmount: 34560,
        taxAmount: 2560,
        depositAmount: 10000,
        status: "paid",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        customerName: "Jessica Miller"
      } as any
    ];
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
    // Sample staff data for demonstration
    return [
      {
        id: 1,
        name: "Sarah Johnson",
        role: "Lead Host",
        hourlyRate: 2500, // $25.00 in cents
        active: true
      },
      {
        id: 2,
        name: "Mike Davis",
        role: "Assistant Host",
        hourlyRate: 2000, // $20.00 in cents
        active: true
      },
      {
        id: 3,
        name: "Emma Wilson",
        role: "Setup Coordinator",
        hourlyRate: 1800, // $18.00 in cents
        active: true
      }
    ];
  }

  async createStaffMember(staff: any): Promise<any> {
    return { ...staff, id: Date.now() };
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Lead;
    this.leads.set(id, newLead);
    return newLead;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...updates, updatedAt: new Date() };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async convertLeadToEvent(leadId: number, customerId: number): Promise<{ lead: Lead; event: Event; customer: Customer } | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async createEventStatusHistory(history: InsertEventStatusHistory): Promise<EventStatusHistory> {
    throw new Error("Not implemented in MemStorage");
  }

  async getEventStatusHistory(eventId: number): Promise<EventStatusHistory[]> {
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

  async getRoomRentalPricing(): Promise<RoomRentalPricing[]> {
    // Return sample pricing data for room rentals
    return [
      {
        id: 1,
        duration: 3,
        weekendPrice: 50000, // $500 in cents
        weekdayPrice: 40000, // $400 in cents
        active: true,
        createdAt: new Date()
      },
      {
        id: 2,
        duration: 4,
        weekendPrice: 60000, // $600 in cents
        weekdayPrice: 47500, // $475 in cents
        active: true,
        createdAt: new Date()
      },
      {
        id: 3,
        duration: 5,
        weekendPrice: 70000, // $700 in cents
        weekdayPrice: 55000, // $550 in cents
        active: true,
        createdAt: new Date()
      },
      {
        id: 4,
        duration: 6,
        weekendPrice: 80000, // $800 in cents
        weekdayPrice: 62500, // $625 in cents
        active: true,
        createdAt: new Date()
      }
    ];
  }
  
  // Customer authentication methods (in-memory placeholder)



  // E-commerce methods for MemStorage (placeholder implementations)
  async getProducts(): Promise<Product[]> {
    // Return sample products for demonstration
    return [
      {
        id: 1,
        name: "Permanent Jewelry Workshop",
        description: "Join us for a fun permanent jewelry making workshop where you'll create beautiful, lasting pieces.",
        price: 7500, // $75.00 in cents
        imageUrl: "/images/permanent-jewelry.jpg",
        category: "Workshop",
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        location: "Host Hampton",
        maxTickets: 12,
        availableTickets: 8,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: "Holiday Charm Bracelet Class",
        description: "Create festive charm bracelets perfect for the holiday season. All materials included.",
        price: 5500, // $55.00 in cents
        imageUrl: "/images/charm-bracelet.jpg",
        category: "Class",
        eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        location: "Host Hampton",
        maxTickets: 15,
        availableTickets: 12,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async deleteProduct(id: number): Promise<boolean> {
    throw new Error("Not implemented in MemStorage");
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return [];
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateCartItemByProduct(sessionId: string, productId: number, quantity: number): Promise<CartItem | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async removeFromCart(id: number): Promise<boolean> {
    throw new Error("Not implemented in MemStorage");
  }

  async clearCart(sessionId: string): Promise<void> {
    // No-op in memory
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    throw new Error("Not implemented in MemStorage");
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return undefined;
  }

  async getOrders(): Promise<Order[]> {
    return [];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    throw new Error("Not implemented in MemStorage");
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return [];
  }

  // Customer authentication methods
  async createVerificationCode(email: string, code: string): Promise<void> {
    // In-memory implementation would need a verification codes storage
    // For now, just log it
    console.log(`Verification code for ${email}: ${code}`);
  }

  async verifyCode(email: string, code: string): Promise<{ customerId: number } | null> {
    // In-memory implementation would check against stored codes
    // For demo purposes, accept any 6-digit code
    if (code.length === 6) {
      const customer = await this.getCustomerByEmail(email);
      return customer ? { customerId: customer.id } : null;
    }
    return null;
  }



  // Enhanced invoice and lead methods
  async getInvoiceById(id: number): Promise<any | null> {
    const invoice = this.invoices.get(id);
    if (!invoice) return null;
    
    // Get customer details by checking if we have clientEmail or via event
    let customer = null;
    if (invoice.clientEmail) {
      customer = await this.getCustomerByEmail(invoice.clientEmail);
    }
    
    // Get invoice items
    const items = Array.from(this.invoiceItems.values())
      .filter(item => item.invoiceId === id);
    
    return {
      ...invoice,
      customer: customer ? {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      } : null,
      items
    };
  }

  async deleteInvoiceItems(invoiceId: number): Promise<void> {
    // Remove all items for this invoice
    const itemsToDelete = Array.from(this.invoiceItems.entries())
      .filter(([_, item]) => item.invoiceId === invoiceId)
      .map(([id, _]) => id);
    
    itemsToDelete.forEach(id => this.invoiceItems.delete(id));
  }

  async processInvoicePayment(invoiceId: number, paymentData: any): Promise<any | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    // Update invoice status based on payment type
    let newStatus = 'paid';
    if (paymentData.paymentType === 'deposit') {
      newStatus = 'deposit_paid';
    }

    const updatedInvoice = {
      ...invoice,
      status: newStatus,
      updatedAt: new Date()
    };

    this.invoices.set(invoiceId, updatedInvoice);

    // Return payment confirmation
    return {
      id: Date.now(),
      invoiceId,
      amount: paymentData.amount,
      paymentType: paymentData.paymentType,
      status: 'completed',
      processedAt: new Date()
    };
  }

  async getLeadById(id: number): Promise<any | null> {
    return this.leads.get(id) || null;
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

  async getPartyThemes(): Promise<PartyTheme[]> {
    const results = await db.select().from(partyThemes).where(eq(partyThemes.active, true));
    return results;
  }

  async createPartyTheme(insertTheme: InsertPartyTheme): Promise<PartyTheme> {
    const [theme] = await db.insert(partyThemes).values(insertTheme).returning();
    return theme;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.eventDate);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async updateEvent(id: number, updates: any): Promise<Event | undefined> {
    const [updated] = await db.update(events).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(events.id, id)).returning();
    return updated || undefined;
  }

  async updateEventStatus(id: number, status: string, changedBy: string = "system", notes?: string): Promise<Event | undefined> {
    const [updated] = await db.update(events).set({ 
      status,
      updatedAt: new Date(),
      statusHistory: db.select().from(events).where(eq(events.id, id))
    }).where(eq(events.id, id)).returning();
    
    // Create status history record
    if (updated) {
      await this.createEventStatusHistory({
        eventId: id,
        newStatus: status,
        changedBy,
        notes: notes || `Status changed to ${status}`,
        automationTriggered: changedBy === "system"
      });
    }
    
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

  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
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

  async deleteInvoiceItems(invoiceId: number): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
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

  async createStaffMember(staff: any): Promise<any> {
    // TODO: Implement with staff table
    return staff;
  }

  // Lead management methods - Complete implementation
  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    
    // TODO: Create lead status history tracking (separate from event status history)
    // For now, just return the created lead without status history
    
    return created;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updated] = await db.update(leads).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(leads.id, id)).returning();
    
    // TODO: Track lead status change with proper lead status history
    // if (updates.status && updated) {
    //   await this.createLeadStatusHistory({
    //     leadId: id,
    //     newStatus: updates.status,
    //     changedBy: "admin",
    //     notes: `Lead status updated to ${updates.status}`,
    //     automationTriggered: false
    //   });
    // }
    
    return updated || undefined;
  }

  async convertLeadToEvent(leadId: number, customerId: number): Promise<{ lead: Lead; event: Event; customer: Customer } | undefined> {
    const lead = await this.getLead(leadId);
    const customer = await this.getCustomer(customerId);
    
    if (!lead || !customer) return undefined;
    
    // Create event from lead data
    const eventData: InsertEvent = {
      leadId: leadId,
      eventTypeId: lead.eventTypeId || 1,
      customerId: customerId,
      eventDate: lead.eventDate,
      startTime: lead.timeSlot?.split('-')[0] || null,
      endTime: lead.timeSlot?.split('-')[1] || null,
      guestCount: lead.guestCount,
      status: "quote_requested",
      inquirySource: lead.source,
      leadScore: lead.leadScore,
      selectedPackageId: lead.selectedPackageId,
      selectedAddons: lead.selectedAddons,
      partyThemeId: lead.partyThemeId,
      estimatedCost: lead.estimatedCost,
      notes: lead.notes
    };
    
    const event = await this.createEvent(eventData);
    
    // Update lead to mark as converted
    const updatedLead = await this.updateLead(leadId, {
      status: "converted",
      convertedCustomerId: customerId,
      convertedEventId: event.id,
      convertedAt: new Date()
    });
    
    if (!updatedLead) return undefined;
    
    return { lead: updatedLead, event, customer };
  }



  async updateInvoice(id: number, updates: any): Promise<Invoice | undefined> {
    console.log("updateInvoice called with id:", id, "updates:", updates);
    try {
      const [updated] = await db.update(invoices).set({
        ...updates,
        updatedAt: new Date()
      }).where(eq(invoices.id, id)).returning();
      console.log("Update result:", updated ? "Success" : "No result");
      return updated || undefined;
    } catch (error: any) {
      console.error("updateInvoice error:", error.message);
      throw error;
    }
  }

  async createEventStatusHistory(history: InsertEventStatusHistory): Promise<EventStatusHistory> {
    const [created] = await db.insert(eventStatusHistory).values(history).returning();
    return created;
  }

  async getEventStatusHistory(eventId: number): Promise<EventStatusHistory[]> {
    return await db.select().from(eventStatusHistory).where(eq(eventStatusHistory.eventId, eventId));
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

  async getRoomRentalPricing(): Promise<RoomRentalPricing[]> {
    return await db.select().from(roomRentalPricing).where(eq(roomRentalPricing.active, true)).orderBy(roomRentalPricing.duration);
  }
  
  // Customer authentication methods
  async createVerificationCode(email: string, code: string): Promise<void> {
    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await db.insert(verificationCodes).values({
      email,
      code,
      expiresAt,
      used: false
    });
  }
  
  async verifyCode(email: string, code: string): Promise<{ customerId: number } | null> {
    // Find valid, unused code that hasn't expired
    const [verificationRecord] = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.used, false)
        )
      )
      .orderBy(verificationCodes.createdAt);
    
    if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
      return null;
    }
    
    // Mark code as used
    await db
      .update(verificationCodes)
      .set({ used: true })
      .where(eq(verificationCodes.id, verificationRecord.id));
    
    // Find or create customer
    let customer = await this.getCustomerByEmail(email);
    if (!customer) {
      // Create new customer with minimal info
      customer = await this.createCustomer({
        name: "Customer", // Will be updated when they provide more info
        email,
        phone: "", // Will be updated when they provide more info
        billingAddress: null
      });
    }
    
    return { customerId: customer.id };
  }
  
  async getCustomerEvents(customerId: number): Promise<any[]> {
    // Get customer's events with related data
    const customerEvents = await db
      .select({
        id: events.id,
        eventDate: events.eventDate,
        status: events.status,
        notes: events.notes,
        eventType: eventTypes.name,
        guestCount: events.guestCount,
        totalAmount: invoices.total,
        paidAmount: invoices.deposit,
        description: eventTypes.description
      })
      .from(events)
      .leftJoin(eventTypes, eq(events.eventTypeId, eventTypes.id))
      .leftJoin(invoices, eq(events.id, invoices.eventId))
      .where(eq(events.customerId, customerId))
      .orderBy(events.eventDate);
    
    return customerEvents.map(event => ({
      id: event.id,
      eventType: event.eventType || "Unknown Event",
      eventDate: event.eventDate,
      status: event.status,
      totalAmount: event.totalAmount || 0,
      paidAmount: event.paidAmount || 0,
      description: event.description || event.notes || "",
      guestCount: event.guestCount,
      location: "Host Hampton" // Default location
    }));
  }

  // E-commerce methods implementation
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(products.createdAt);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));
    return result.count > 0;
  }

  // Cart management
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItems = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, cartItem.sessionId),
          eq(cartItems.productId, cartItem.productId!)
        )
      );

    if (existingItems.length > 0) {
      // Update quantity if item exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItems[0].quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItems[0].id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async updateCartItemByProduct(sessionId: string, productId: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.sessionId, sessionId),
          eq(cartItems.productId, productId)
        )
      )
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return true; // Assume success since Drizzle doesn't return rowCount for deletes
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Order management
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(orders.createdAt);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async getInvoiceById(id: number): Promise<any | null> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    
    if (!invoice) return null;
    
    // Get invoice items
    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));
    
    // Get customer details if we have clientEmail
    let customer = null;
    if (invoice.clientEmail) {
      customer = await this.getCustomerByEmail(invoice.clientEmail);
    }
    
    return {
      ...invoice,
      customer: customer ? {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      } : null,
      items
    };
  }



  async processInvoicePayment(invoiceId: number, paymentData: any): Promise<any | null> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) return null;

    // Update invoice status based on payment type
    let newStatus = 'paid';
    if (paymentData.paymentType === 'deposit') {
      newStatus = 'deposit_paid';
    }

    await db
      .update(invoices)
      .set({ 
        status: newStatus,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, invoiceId));

    // In a real implementation, you'd also create a payment record
    // Return payment confirmation
    return {
      id: Date.now(),
      invoiceId,
      amount: paymentData.amount,
      paymentType: paymentData.paymentType,
      status: 'completed',
      processedAt: new Date()
    };
  }

  async getLeadById(id: number): Promise<any | null> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id));
    
    return lead || null;
  }
}

// Use DatabaseStorage for both development and production since we have a real database
export const storage: IStorage = new DatabaseStorage();
