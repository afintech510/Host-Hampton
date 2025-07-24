import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { bookingService } from "./booking-service";
import { 
  insertReviewSchema, 
  insertEventTypeSchema, insertCustomerSchema, insertPackageSchema, 
  insertAddonSchema, insertPartyThemeSchema, insertEventSchema, insertInvoiceSchema, insertInvoiceItemSchema 
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // CUSTOMER AUTHENTICATION ENDPOINTS
  app.post("/api/auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: "Email is required" 
        });
      }
      
      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store verification code in database
      await storage.createVerificationCode(email, code);
      
      // TODO: Send email with verification code using SendGrid
      console.log(`Verification code for ${email}: ${code}`);
      
      res.json({
        success: true,
        message: "Verification code sent to your email"
      });
    } catch (error) {
      console.error("Send code error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send verification code"
      });
    }
  });
  
  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: "Email and code are required"
        });
      }
      
      const result = await storage.verifyCode(email, code);
      
      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code"
        });
      }
      
      res.json({
        success: true,
        customerId: result.customerId,
        message: "Authentication successful"
      });
    } catch (error) {
      console.error("Verify code error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify code"
      });
    }
  });
  
  app.get("/api/customer/events", async (req, res) => {
    try {
      const customerId = parseInt(req.query.customerId as string);
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: "Customer ID is required"
        });
      }
      
      const events = await storage.getCustomerEvents(customerId);
      
      res.json({
        success: true,
        events
      });
    } catch (error) {
      console.error("Get customer events error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve events"
      });
    }
  });
  
  // INQUIRY CREATION ENDPOINT - For "Show Price" and contact form submissions
  app.post("/api/create-inquiry", async (req, res) => {
    try {
      console.log("Creating inquiry:", req.body);
      
      const leadData = {
        source: req.body.source || "website",
        name: req.body.customerName || req.body.name,
        email: req.body.customerEmail || req.body.email,
        phone: req.body.customerPhone || req.body.phone,
        eventType: req.body.eventType,
        eventDate: req.body.eventDate ? new Date(req.body.eventDate) : null,
        guestCount: req.body.guestCount || req.body.adultCount + req.body.childCount || null,
        budget: req.body.estimatedBudget ? parseInt(req.body.estimatedBudget) * 100 : null, // Convert to cents
        status: "new",
        notes: JSON.stringify({
          eventDescription: req.body.eventDescription,
          dateChoice: req.body.dateChoice,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          selectedAddons: req.body.selectedAddons,
          rentalPricing: req.body.rentalPricing,
          formType: req.body.formType || "party-booking",
          rawFormData: req.body
        })
      };

      const inquiry = await storage.createLead(leadData);
      
      res.json({
        success: true,
        message: "Inquiry created successfully - we'll contact you within 24 hours",
        inquiryId: inquiry.id
      });
    } catch (error) {
      console.error("Inquiry creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create inquiry"
      });
    }
  });

  // STRIPE PAYMENT INTENT CREATION ENDPOINT
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "usd", metadata = {} } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount should already be in cents
        currency,
        metadata: {
          eventType: metadata.eventType || "",
          customerName: metadata.customerName || "",
          customerEmail: metadata.customerEmail || "",
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({ 
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ 
        success: false,
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // BOOKING WITH PAYMENT ENDPOINT - For "Pay Reservation Deposit" clicks
  app.post("/api/book-with-payment", async (req, res) => {
    try {
      console.log("Processing booking with payment:", req.body);
      
      // First create the full booking
      const bookingResult = await bookingService.processBooking(req.body);
      
      if (!bookingResult.success) {
        return res.status(400).json({
          success: false,
          message: bookingResult.error || "Failed to create booking"
        });
      }
      
      // Create payment intent for the deposit
      const depositAmount = req.body.depositAmount || req.body.rentalPricing?.total || 0;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: depositAmount,
        currency: "usd",
        metadata: {
          eventType: req.body.eventType || "",
          customerName: req.body.customerName || "",
          customerEmail: req.body.customerEmail || "",
          eventId: bookingResult.eventId?.toString() || "",
          invoiceId: bookingResult.invoiceId?.toString() || "",
          bookingType: "reservation_deposit"
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({
        success: true,
        message: "Booking created successfully",
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        bookingData: {
          customerId: bookingResult.customerId,
          eventId: bookingResult.eventId,
          invoiceId: bookingResult.invoiceId
        }
      });
    } catch (error) {
      console.error("Booking with payment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process booking with payment"
      });
    }
  });
  
  // NEW COMPREHENSIVE BOOKING SUBMISSION ENDPOINT
  app.post("/api/submit-booking", async (req, res) => {
    try {
      console.log("Received booking submission:", req.body);
      
      const result = await bookingService.processBooking(req.body);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            customerId: result.customerId,
            eventId: result.eventId,
            invoiceId: result.invoiceId,
            stripeInvoiceUrl: result.stripeInvoiceUrl
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || "Failed to process booking"
        });
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error processing booking"
      });
    }
  });







  // Create a new review
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json({ success: true, review });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid review data", 
          errors: error.errors 
        });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create review" 
      });
    }
  });

  // Get reviews (with optional limit)
  app.get("/api/reviews", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const reviews = await storage.getReviews(limit);
      res.json({ success: true, reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch reviews" 
      });
    }
  });

  // Get featured reviews
  app.get("/api/reviews/featured", async (req, res) => {
    try {
      const reviews = await storage.getFeaturedReviews();
      res.json({ success: true, reviews });
    } catch (error) {
      console.error("Error fetching featured reviews:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch featured reviews" 
      });
    }
  });



  // Get room rental pricing
  app.get("/api/room-rental-pricing", async (req, res) => {
    try {
      const pricing = await storage.getRoomRentalPricing();
      res.json({ success: true, pricing });
    } catch (error) {
      console.error("Error fetching room rental pricing:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch room rental pricing" 
      });
    }
  });

  // Admin Dashboard API Endpoints

  // Events management
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json({ success: true, events });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch events" 
      });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = req.body;
      const event = await storage.createEvent(eventData);
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create event" 
      });
    }
  });

  // Invoices management
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json({ success: true, invoices });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch invoices" 
      });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = req.body;
      const invoice = await storage.createInvoice(invoiceData);
      res.json({ success: true, invoice });
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create invoice" 
      });
    }
  });

  // Leads management
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json({ success: true, leads });
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch leads" 
      });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = req.body;
      const lead = await storage.createLead(leadData);
      res.json({ success: true, lead });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create lead" 
      });
    }
  });

  // Staff management
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json({ success: true, staff });
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch staff" 
      });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const staffData = req.body;
      const staff = await storage.createStaffMember(staffData);
      res.json({ success: true, staff });
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create staff member" 
      });
    }
  });





  // ==== NEW DESIGNER TOOL API ROUTES ====

  // Event Types
  app.get("/api/event-types", async (req, res) => {
    try {
      const eventTypes = await storage.getEventTypes();
      res.json({ success: true, eventTypes });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch event types" });
    }
  });

  app.post("/api/event-types", async (req, res) => {
    try {
      const eventType = insertEventTypeSchema.parse(req.body);
      const created = await storage.createEventType(eventType);
      res.status(201).json({ success: true, eventType: created });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create event type" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json({ success: true, customers });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = insertCustomerSchema.parse(req.body);
      const created = await storage.createCustomer(customer);
      res.status(201).json({ success: true, customer: created });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create customer" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
      res.json({ success: true, customer });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch customer" });
    }
  });

  // Packages
  app.get("/api/packages", async (req, res) => {
    try {
      const { eventTypeId } = req.query;
      const packages = eventTypeId 
        ? await storage.getPackagesByEventType(parseInt(eventTypeId as string))
        : await storage.getPackages();
      res.json({ success: true, packages });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch packages" });
    }
  });

  app.post("/api/packages", async (req, res) => {
    try {
      const pkg = insertPackageSchema.parse(req.body);
      const created = await storage.createPackage(pkg);
      res.status(201).json({ success: true, package: created });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create package" });
    }
  });

  // Add-ons
  app.get("/api/addons", async (req, res) => {
    try {
      const addons = await storage.getAddons();
      res.json({ success: true, addons });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch add-ons" });
    }
  });

  app.post("/api/addons", async (req, res) => {
    try {
      const addon = insertAddonSchema.parse(req.body);
      const created = await storage.createAddon(addon);
      res.status(201).json({ success: true, addon: created });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create add-on" });
    }
  });

  // PARTY THEMES ENDPOINTS
  app.get("/api/party-themes", async (req, res) => {
    try {
      const themes = await storage.getPartyThemes();
      res.json({ success: true, themes });
    } catch (error) {
      console.error("Error fetching party themes:", error);
      res.status(500).json({ success: false, message: "Failed to fetch party themes" });
    }
  });

  app.post("/api/party-themes", async (req, res) => {
    try {
      const theme = insertPartyThemeSchema.parse(req.body);
      const created = await storage.createPartyTheme(theme);
      res.status(201).json({ success: true, theme: created });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create party theme" });
    }
  });

  // Events (Designer Tool Events)
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const event = insertEventSchema.parse(req.body);
      const created = await storage.createEvent(event);
      res.status(201).json({ success: true, event: created });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create event" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      res.json({ success: true, event });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch event" });
    }
  });

  app.patch("/api/events/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateEventStatus(id, status);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      res.json({ success: true, event: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to update event status" });
    }
  });

  // Invoices
  app.post("/api/invoices", async (req, res) => {
    try {
      const invoice = insertInvoiceSchema.parse(req.body);
      const created = await storage.createInvoice(invoice);
      res.status(201).json({ success: true, invoice: created });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create invoice" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      const items = await storage.getInvoiceItems(id);
      res.json({ success: true, invoice: { ...invoice, items } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/events/:eventId/invoice", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const invoice = await storage.getInvoiceByEventId(eventId);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      const items = await storage.getInvoiceItems(invoice.id);
      res.json({ success: true, invoice: { ...invoice, items } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch invoice" });
    }
  });

  // Invoice Items
  app.post("/api/invoice-items", async (req, res) => {
    try {
      const item = insertInvoiceItemSchema.parse(req.body);
      const created = await storage.createInvoiceItem(item);
      res.status(201).json({ success: true, item: created });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create invoice item" });
    }
  });

  app.get("/api/invoices/:invoiceId/items", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      const items = await storage.getInvoiceItems(invoiceId);
      res.json({ success: true, items });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch invoice items" });
    }
  });

  // STRIPE PAYMENT ENDPOINT
  app.post("/api/book-with-payment", async (req, res) => {
    try {
      const { eventId, invoiceId, amount, eventType } = req.body;
      
      console.log("Payment request received:", { eventId, invoiceId, amount, eventType });
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid amount is required"
        });
      }

      // Ensure minimum amount (Stripe requires at least $0.50 for USD)
      const amountInCents = Math.round(amount * 100);
      const minimumAmount = 50; // 50 cents minimum for USD
      
      if (amountInCents < minimumAmount) {
        console.log("Amount too low:", { amount, amountInCents, minimumAmount });
        return res.status(400).json({
          success: false,
          message: `Amount must be at least $0.50. Received: $${amount}`
        });
      }

      console.log("Creating Stripe payment intent:", { amountInCents, currency: "usd" });

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        metadata: {
          eventId: eventId?.toString() || '',
          invoiceId: invoiceId?.toString() || '',
          eventType: eventType || ''
        }
      });

      console.log("Payment intent created successfully:", paymentIntent.id);

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        bookingData: {
          eventId,
          invoiceId,
          eventType
        }
      });
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create payment intent"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
