import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { bookingService } from "./booking-service";
import { 
  insertReviewSchema, 
  insertEventTypeSchema, insertCustomerSchema, insertPackageSchema, 
  insertAddonSchema, insertPartyThemeSchema, insertEventSchema, insertInvoiceSchema, insertInvoiceItemSchema,
  insertLeadSchema, insertProductSchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema
} from "@shared/schema";
import { sendEmail, sendTemplateEmail, getEmailTemplates } from "./email-service";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
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
      
      // Send verification email
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: "Host Hampton - Your Verification Code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Host Hampton - Access Your Events</h2>
              <p>Your verification code is:</p>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; border-radius: 8px;">
                ${code}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <p>Best regards,<br>The Host Hampton Team</p>
            </div>
          `
        });

        if (!emailResult.success) {
          console.error("Failed to send verification email:", emailResult.error);
          // Still continue with success response since code is stored in database
        }
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Continue with success response since code is stored in database
      }
      
      // Also log for debugging
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
          leadId: req.body.leadId?.toString() || "",
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

  // Quote submission endpoint - creates lead and sends email notification
  app.post("/api/quotes", async (req, res) => {
    try {
      const quoteData = req.body;
      
      // Debug logging to see what fields are being sent
      console.log("Quote data received:", JSON.stringify(quoteData, null, 2));
      
      // Check for contact information in various field formats
      const firstName = quoteData.firstName || quoteData.parentFirstName || quoteData.customerName;
      const lastName = quoteData.lastName || quoteData.parentLastName || quoteData.customerLastName;
      const email = quoteData.email || quoteData.parentEmail || quoteData.customerEmail;
      const phone = quoteData.phone || quoteData.parentPhone || quoteData.customerPhone;
      const consent = quoteData.consent || quoteData.parentConsent;

      console.log("Field extraction:", { firstName, lastName, email, phone, consent });

      if (!firstName || !lastName || !email || !phone || !consent) {
        console.log("Missing fields check:", { firstName, lastName, email, phone, consent });
        console.log("Available fields in quoteData:", Object.keys(quoteData));
        return res.status(400).json({ 
          success: false, 
          message: "Missing required contact information" 
        });
      }

      // Map service types to event type IDs
      const serviceTypeMapping: { [key: string]: number } = {
        "birthday-party": 1, // Birthday Party
        "studio-rental": 5, // Studio Rental
        "trucker-hat": 1, // Use Birthday Party for now
        "workshop": 2, // Adult Workshop/Classes
        "permanent-jewelry": 3, // Permanent Jewelry Party
        "diy-party": 1, // DIY Party
        "private-event": 1, // Private Event
        "general": 1 // Default to Birthday Party
      };

      // Create lead data with proper timestamp handling
      const eventDateString = quoteData.partyDate || quoteData.studioDate || quoteData.truckerDate || quoteData.workshopDate || quoteData.jewelryDate;
      const eventDate = eventDateString ? new Date(eventDateString) : null;
      
      // Map service types to proper event type names for database
      const eventTypeNames: { [key: string]: string } = {
        "birthday-party": "kids-party", // Fix: Map to kids-party for database
        "studio-rental": "studio-rental",
        "trucker-hat": "trucker-hat",
        "workshop": "workshop",
        "permanent-jewelry": "permanent-jewelry",
        "diy-party": "diy-party",
        "private-event": "private-event",
        "general": "general"
      };

      // Comprehensive field mapping for all event types
      const leadData = {
        source: "website",
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        eventTypeId: serviceTypeMapping[quoteData.serviceType] || 1,
        eventType: eventTypeNames[quoteData.serviceType] || quoteData.serviceType,
        
        // Basic event details
        guestCount: parseInt(quoteData.guestCount || quoteData.attendeeCount || quoteData.studioAttendeeCount || quoteData.truckerAttendeeCount || quoteData.workshopAttendeeCount || quoteData.jewelryAttendeeCount) || null,
        childName: quoteData.childName || null,
        childAge: parseInt(quoteData.childAge) || null,
        eventDate: eventDate,
        isDateUnsure: !eventDateString || quoteData.dateChoice === "unsure" || quoteData.scheduleChoice === "unsure" || quoteData.studioDateFlexible,
        timeSlot: quoteData.partyTime || quoteData.studioTime || quoteData.truckerTime || quoteData.workshopTime || quoteData.jewelryTime || null,
        
        // Enhanced mapping for comprehensive data
        eventDescription: quoteData.eventDescription || quoteData.studioDescription || quoteData.workshopDescription || null,
        adultCount: parseInt(quoteData.adultCount) || null,
        childCount: parseInt(quoteData.childCount) || null,
        attendeeCount: parseInt(quoteData.expectedAttendees || quoteData.studioAttendeeCount || quoteData.jewelryPeopleCount) || null,
        eventLocation: quoteData.eventLocation || (quoteData.studioUsage ? "studio" : null),
        mobileAddress: quoteData.mobileAddress || null,
        startTime: quoteData.startTime || quoteData.studioStartTime || null,
        endTime: quoteData.endTime || quoteData.studioEndTime || null,
        dateFlexible: quoteData.studioDateFlexible || quoteData.scheduleChoice === "unsure" || quoteData.dateChoice === "unsure" || false,
        scheduleNotes: quoteData.unsureDetails || quoteData.scheduleNotes || quoteData.studioTimeNotes || null,
        pricingDetails: quoteData.rentalPricing || null,
        specialRequirements: quoteData.specialNeeds ? [quoteData.specialNeeds].flat() : null,
        workshopType: quoteData.workshopType || null,
        classFormat: quoteData.classFormat || null,
        jewelryPieces: quoteData.selectedJewelryPieces || null,
        studioUsage: quoteData.studioUsage || quoteData.studioSubType || null,
        packageSelection: quoteData.partyPackage || null,
        foodPreferences: {
          foodChoice: quoteData.foodChoice || null,
          cupcakeFlavor: quoteData.cupcakeFlavor || null
        },
        
        // Strategic field mapping for enhanced invoice building
        partyTheme: quoteData.partyTheme || null,
        dateNotes: quoteData.dateNotes || null,
        jewelryVision: quoteData.jewelryVision || null,
        packageTotal: quoteData.packageTotal ? parseInt(quoteData.packageTotal) * 100 : null,
        
        // Standard lead tracking fields
        selectedAddons: quoteData.partyAddons || [],
        estimatedCost: quoteData.totalEstimate ? parseInt(quoteData.totalEstimate) * 100 : null, // Convert to cents
        notes: quoteData.questions || quoteData.partyNotes || quoteData.message || "",
        status: "new",
        leadScore: "warm",
        formStep: "completed",
        formData: quoteData,
        
        // Explicitly set optional timestamp fields to null
        followUpDate: null,
        lastContactedAt: null,
        convertedAt: null
      };

      console.log("Creating lead with data:", leadData);
      console.log("Event date parsed:", eventDate, "from", eventDateString);
      
      // Validate the lead data using the schema before insertion
      const validatedLeadData = insertLeadSchema.parse(leadData);
      const lead = await storage.createLead(validatedLeadData);

      // Send email notification to Host Hampton
      const serviceTypeNames: { [key: string]: string } = {
        "birthday-party": "Kids Birthday Party",
        "studio-rental": "Studio Rental", 
        "trucker-hat": "Trucker Hat Bar",
        "workshop": "Workshop/Class",
        "permanent-jewelry": "Permanent Jewelry",
        "diy-party": "DIY Party",
        "private-event": "Private Event",
        "general": "General Inquiry"
      };

      const serviceName = serviceTypeNames[quoteData.serviceType] || quoteData.serviceType;
      
      // Format quote details for email using the extracted field names
      let quoteDetails = `
        <h3>New Quote Request - ${serviceName}</h3>
        <p><strong>Contact Information:</strong></p>
        <ul>
          <li>Name: ${firstName} ${lastName}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
        </ul>
      `;

      // Add service-specific details
      if (quoteData.serviceType === 'birthday-party') {
        quoteDetails += `
          <p><strong>Birthday Party Details:</strong></p>
          <ul>
            ${quoteData.childName ? `<li>Child's Name: ${quoteData.childName}</li>` : ''}
            ${quoteData.childAge ? `<li>Child's Age: ${quoteData.childAge}</li>` : ''}
            ${quoteData.guestCount ? `<li>Guest Count: ${quoteData.guestCount}</li>` : ''}
            ${quoteData.partyTheme ? `<li>Theme: ${quoteData.partyTheme}</li>` : ''}
            ${quoteData.partyPackage ? `<li>Package: ${quoteData.partyPackage === 'make-it-shine' ? 'Make it Shine (+$25/guest)' : quoteData.partyPackage === 'party-envy' ? 'Party Envy (+$50/guest)' : 'Basic Package'}</li>` : ''}
            ${quoteData.packageTotal ? `<li>Package Total: $${quoteData.packageTotal}</li>` : ''}
            ${quoteData.partyAddons && quoteData.partyAddons.length > 0 ? `<li>Add-ons: ${quoteData.partyAddons.map((addon: any) => addon.name || addon).join(', ')}</li>` : ''}
            ${quoteData.foodChoice ? `<li>Food Choice: ${quoteData.foodChoice}</li>` : ''}
            ${quoteData.cupcakeFlavor ? `<li>Cupcake Flavor: ${quoteData.cupcakeFlavor}</li>` : ''}
            ${quoteData.partyDate ? `<li>Party Date: ${quoteData.partyDate}</li>` : ''}
            ${quoteData.partyTime ? `<li>Party Time: ${quoteData.partyTime}</li>` : ''}
            ${quoteData.partyLocation ? `<li>Party Location: ${quoteData.partyLocation}</li>` : ''}
            ${quoteData.totalEstimate ? `<li>Estimated Total: $${quoteData.totalEstimate}</li>` : ''}
            ${quoteData.specialNeeds && quoteData.specialNeeds.length > 0 ? `<li>Special Needs: ${quoteData.specialNeeds.join(', ')}</li>` : ''}
            ${quoteData.partyNotes ? `<li>Additional Notes: ${quoteData.partyNotes}</li>` : ''}
          </ul>
        `;
      } else if (quoteData.serviceType === 'studio-rental') {
        quoteDetails += `
          <p><strong>Studio Rental Details:</strong></p>
          <ul>
            ${quoteData.studioSubType ? `<li>Rental Type: ${quoteData.studioSubType}${quoteData.customStudioType ? ` (${quoteData.customStudioType})` : ''}</li>` : ''}
            ${quoteData.studioDescription ? `<li>Description: ${quoteData.studioDescription}</li>` : ''}
            ${quoteData.studioAttendeeCount ? `<li>Number of People: ${quoteData.studioAttendeeCount}</li>` : ''}
            ${quoteData.studioGroupType ? `<li>Group Type: ${quoteData.studioGroupType}</li>` : ''}
            ${quoteData.studioDate ? `<li>Preferred Date: ${quoteData.studioDate}</li>` : ''}
            ${quoteData.studioTime ? `<li>Time: ${quoteData.studioTime} - ${quoteData.studioEndTime || 'TBD'}</li>` : ''}
            ${quoteData.studioTimeNotes ? `<li>Time Notes: ${quoteData.studioTimeNotes}</li>` : ''}
          </ul>
        `;
      }

      if (quoteData.message) {
        quoteDetails += `<p><strong>Additional Message:</strong><br>${quoteData.message}</p>`;
      }

      quoteDetails += `<p><strong>Lead ID:</strong> ${lead.id}</p>`;

      try {
        await sendEmail({
          to: "hosthampton295@gmail.com",
          subject: `New Quote Request: ${serviceName} - ${firstName} ${lastName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              ${quoteDetails}
              <hr style="margin: 20px 0;">
              <p><em>This quote request was submitted through the Host Hampton website.</em></p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send quote notification email:", emailError);
        // Continue with success response even if email fails
      }

      res.json({ 
        success: true, 
        message: "Quote request submitted successfully",
        leadId: lead.id 
      });
    } catch (error: any) {
      console.error("Error processing quote:", error);
      console.error("Failed to create lead:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid lead data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Failed to create quote request" 
      });
    }
  });

  // Enhanced lead capture from booking form
  app.post("/api/leads", async (req, res) => {
    try {
      const rawData = req.body;
      
      // Preprocess date fields to handle empty strings and invalid dates
      const processedData = {
        ...rawData,
        eventDate: (() => {
          if (!rawData.eventDate || rawData.eventDate === "" || rawData.isDateUnsure) {
            return null;
          }
          try {
            const date = new Date(rawData.eventDate);
            return isNaN(date.getTime()) ? null : date;
          } catch (e) {
            return null;
          }
        })(),
        // Ensure timestamp fields are properly handled
        followUpDate: rawData.followUpDate ? (rawData.followUpDate === "" ? null : new Date(rawData.followUpDate)) : null,
        lastContactedAt: rawData.lastContactedAt ? (rawData.lastContactedAt === "" ? null : new Date(rawData.lastContactedAt)) : null,
        convertedAt: rawData.convertedAt ? (rawData.convertedAt === "" ? null : new Date(rawData.convertedAt)) : null,
      };
      
      const leadData = insertLeadSchema.parse(processedData);
      
      // Set default values for new leads from website
      const enrichedLead = {
        ...leadData,
        source: "website",
        status: "new",
        leadScore: "warm",
        formStep: rawData.formStep || "contact-info",
        formData: rawData.formData || {}
      };
      
      const lead = await storage.createLead(enrichedLead);
      res.status(201).json({ success: true, lead });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid lead data", 
          errors: error.errors 
        });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create lead" 
      });
    }
  });

  // Update lead (for form progress tracking)
  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const rawUpdates = req.body;
      
      // Preprocess date fields in updates to handle empty strings and invalid dates
      const processedUpdates = {
        ...rawUpdates,
        eventDate: (() => {
          if (rawUpdates.eventDate === undefined) return undefined; // Don't update if not provided
          if (!rawUpdates.eventDate || rawUpdates.eventDate === "" || rawUpdates.isDateUnsure) {
            return null;
          }
          try {
            const date = new Date(rawUpdates.eventDate);
            return isNaN(date.getTime()) ? null : date;
          } catch (e) {
            return null;
          }
        })(),
        // Handle other timestamp fields
        followUpDate: rawUpdates.followUpDate === undefined ? undefined : 
                     (rawUpdates.followUpDate && rawUpdates.followUpDate !== "" ? new Date(rawUpdates.followUpDate) : null),
        lastContactedAt: rawUpdates.lastContactedAt === undefined ? undefined : 
                        (rawUpdates.lastContactedAt && rawUpdates.lastContactedAt !== "" ? new Date(rawUpdates.lastContactedAt) : null),
        convertedAt: rawUpdates.convertedAt === undefined ? undefined : 
                    (rawUpdates.convertedAt && rawUpdates.convertedAt !== "" ? new Date(rawUpdates.convertedAt) : null),
      };
      
      const updatedLead = await storage.updateLead(leadId, processedUpdates);
      
      if (!updatedLead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found"
        });
      }
      
      res.json({ success: true, lead: updatedLead });
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update lead" 
      });
    }
  });

  // Convert lead to event (when payment is made)
  app.post("/api/leads/:id/convert", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { customerId } = req.body;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: "Customer ID is required for conversion"
        });
      }
      
      const result = await storage.convertLeadToEvent(leadId, customerId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Lead or customer not found"
        });
      }
      
      res.json({ 
        success: true, 
        message: "Lead successfully converted to event",
        ...result 
      });
    } catch (error) {
      console.error("Error converting lead:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to convert lead" 
      });
    }
  });

  // Original leads endpoint for backward compatibility
  app.post("/api/leads/legacy", async (req, res) => {
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

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateEvent(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      res.json({ success: true, event: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to update event" });
    }
  });

  // Invoices - Remove duplicate, keep the one with items

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { items, ...updateData } = req.body;
      
      // Get current invoice
      const currentInvoice = await storage.getInvoiceById(id);
      if (!currentInvoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      
      // Update invoice
      const updated = await storage.updateInvoice(id, updateData);
      
      // Update items if provided
      if (items && items.length > 0) {
        // Delete existing items and create new ones
        await storage.deleteInvoiceItems(id);
        for (const item of items) {
          await storage.createInvoiceItem({
            ...item,
            invoiceId: id
          });
        }
        
        // Update Stripe payment link if invoice has one and items changed
        try {
          if (currentInvoice.stripePaymentLinkId) {
            // Deactivate old payment link
            await stripe.paymentLinks.update(currentInvoice.stripePaymentLinkId, {
              active: false
            });

            // Create new payment link
            const stripeLineItems = items.map((item: any) => ({
              price_data: {
                currency: 'usd',
                product_data: {
                  name: item.name,
                  description: `Quantity: ${item.quantity}`
                },
                unit_amount: item.unitPrice,
              },
              quantity: item.quantity
            }));

            const paymentLink = await stripe.paymentLinks.create({
              line_items: stripeLineItems,
              metadata: {
                invoiceId: id.toString(),
                leadId: (updated?.leadId ?? currentInvoice.leadId)?.toString() || '',
                type: 'invoice_payment'
              },
              payment_method_types: ['card'],
              billing_address_collection: 'auto',
              custom_fields: [
                {
                  key: 'payment_type',
                  label: {
                    type: 'custom',
                    custom: 'Payment Type'
                  },
                  type: 'dropdown',
                  dropdown: {
                    options: [
                      { label: `Deposit Payment ($${(updateData.deposit / 100).toFixed(2)})`, value: 'deposit' },
                      { label: `Full Payment ($${(updateData.total / 100).toFixed(2)})`, value: 'full' }
                    ]
                  }
                }
              ]
            });

            // Update with new Stripe info
            await storage.updateInvoice(id, {
              stripePaymentLinkId: paymentLink.id,
              stripeInvoiceUrl: paymentLink.url
            });
          }
        } catch (stripeError: any) {
          console.error('Stripe payment link update failed:', stripeError);
          // Continue without Stripe update
        }
      }
      
      // Get the complete updated invoice
      const completeInvoice = await storage.getInvoiceById(id);
      res.json({ success: true, invoice: completeInvoice });
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ success: false, message: "Failed to update invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      console.log("Creating invoice with data:", req.body);
      
      const { leadId, items, ...invoiceData } = req.body;
      
      // If we have a leadId, get the lead data to create an event first
      if (leadId) {
        const lead = await storage.getLeadById(leadId);
        if (!lead) {
          return res.status(404).json({ success: false, message: "Lead not found" });
        }
        
        console.log("Lead data:", lead);
        console.log("Lead form_data:", lead.formData);
        
        // Map lead form_data to event data
        const formData = lead.formData || {};
        
        // Create an event from the lead data first
        const eventData = {
          eventTypeId: getEventTypeIdFromService(formData.serviceType || 'birthday-party'),
          customerId: invoiceData.customerId,
          leadId: leadId,
          status: 'quoted',
          eventDate: formData.partyDate ? new Date(formData.partyDate) : null,
          startTime: formData.partyTime || null,
          endTime: null,
          location: formData.partyLocation || formData.eventLocation || null,
          guestCount: parseInt(formData.guestCount) || 0,
          notes: formData.partyNotes || formData.message || null,
          estimatedCost: parseFloat(formData.totalEstimate) || 0
        };
        
        console.log("Creating event with data:", eventData);
        const createdEvent = await storage.createEvent(eventData);
        console.log("Created event:", createdEvent);
        
        // Now create the invoice with the event ID
        invoiceData.eventId = createdEvent.id;
        invoiceData.leadId = leadId;
      }
      
      const invoice = insertInvoiceSchema.parse(invoiceData);
      const created = await storage.createInvoice(invoice);
      
      // Create invoice items if provided
      if (items && items.length > 0) {
        for (const item of items) {
          await storage.createInvoiceItem({
            ...item,
            invoiceId: created.id
          });
        }
      }
      
      // Create Stripe payment link
      console.log("Items for Stripe:", items);
      console.log("Items length:", items?.length);
      try {
        if (items && items.length > 0) {
          const stripeLineItems = items.map((item: any) => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                description: `Quantity: ${item.quantity}`
              },
              unit_amount: item.unitPrice, // Already in cents
            },
            quantity: item.quantity
          }));

          const paymentLink = await stripe.paymentLinks.create({
            line_items: stripeLineItems,
            metadata: {
              invoiceId: created.id.toString(),
              leadId: invoiceData.leadId?.toString() || '',
              type: 'invoice_payment'
            },
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            custom_fields: [
              {
                key: 'payment_type',
                label: {
                  type: 'custom',
                  custom: 'Payment Type'
                },
                type: 'dropdown',
                dropdown: {
                  options: [
                    { label: `Deposit Payment ($${(invoiceData.deposit / 100).toFixed(2)})`, value: 'deposit' },
                    { label: `Full Payment ($${(invoiceData.total / 100).toFixed(2)})`, value: 'full' }
                  ]
                }
              }
            ]
          });

          // Update invoice with Stripe information
          const updatedInvoice = await storage.updateInvoice(created.id, {
            stripePaymentLinkId: paymentLink.id,
            stripeInvoiceUrl: paymentLink.url,
            status: 'sent'
          });

          // Get the complete invoice with items
          const completeInvoice = await storage.getInvoiceById(created.id);
          
          res.status(201).json({ 
            success: true, 
            invoice: completeInvoice
          });
        } else {
          res.status(201).json({ success: true, invoice: created });
        }
      } catch (stripeError: any) {
        console.error('Stripe payment link creation failed:', stripeError);
        // Return invoice without Stripe integration
        res.status(201).json({ 
          success: true, 
          invoice: created,
          warning: 'Invoice created but Stripe payment link failed: ' + stripeError.message
        });
      }
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Failed to create invoice" });
    }
  });

  // Helper function to map service types to event type IDs
  function getEventTypeIdFromService(serviceType: string): number {
    const mapping: Record<string, number> = {
      'birthday-party': 1,
      'studio-rental': 2,
      'trucker-hat': 3,
      'workshop': 4,
      'permanent-jewelry': 5,
      'general': 7
    };
    return mapping[serviceType] || 1; // Default to birthday party
  }

  // Get single invoice with customer details and items
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoiceById(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      res.json({ success: true, invoice });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch invoice" });
    }
  });

  // Process payment for invoice
  app.post("/api/invoices/:id/payments", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const paymentData = req.body;
      
      // In a real implementation, this would integrate with Stripe
      // For now, we'll simulate payment processing
      const payment = await storage.processInvoicePayment(invoiceId, paymentData);
      
      if (!payment) {
        return res.status(400).json({
          success: false,
          message: "Payment processing failed"
        });
      }
      
      res.json({ success: true, payment });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process payment" 
      });
    }
  });

  // Get single lead for invoice creation
  app.get("/api/leads/:id", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLeadById(leadId);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found"
        });
      }
      
      res.json({ success: true, lead });
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch lead" 
      });
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

  // Payment success webhook - converts leads to events upon successful payment
  app.post("/api/payment-success", async (req, res) => {
    try {
      const { paymentIntentId, leadId, customerEmail } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: "Payment intent ID is required"
        });
      }

      // Retrieve payment intent to verify success
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: "Payment has not succeeded yet"
        });
      }

      // Extract metadata for lead conversion
      const metadata = paymentIntent.metadata;
      const metadataLeadId = metadata.leadId || leadId;
      const metadataCustomerEmail = metadata.customerEmail || customerEmail;

      // If there's a lead to convert, handle the conversion
      if (metadataLeadId && metadataCustomerEmail) {
        // Find or create customer
        let customer = await storage.getCustomerByEmail(metadataCustomerEmail);
        
        if (!customer) {
          const lead = await storage.getLead(parseInt(metadataLeadId));
          if (lead) {
            customer = await storage.createCustomer({
              name: lead.name || '',
              email: lead.email || '',
              phone: lead.phone || ''
            });
          }
        }

        if (customer) {
          // Convert lead to event
          const result = await storage.convertLeadToEvent(parseInt(metadataLeadId), customer.id);
          
          if (result) {
            console.log(`Lead ${metadataLeadId} successfully converted to event ${result.event.id}`);
            
            // Update event status to deposit_paid
            await storage.updateEventStatus(result.event.id, "deposit_paid", "payment_system", "Deposit payment received via Stripe");
            
            return res.json({
              success: true,
              message: "Payment processed and lead converted to event",
              eventId: result.event.id,
              customerId: customer.id
            });
          }
        }
      }

      res.json({
        success: true,
        message: "Payment processed successfully"
      });
    } catch (error: any) {
      console.error("Payment success processing error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process payment success"
      });
    }
  });

  // Email API endpoints
  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await getEmailTemplates();
      res.json({ success: true, templates });
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch email templates" 
      });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, html, templateId, leadId } = req.body;
      
      let result;
      if (templateId) {
        result = await sendTemplateEmail(templateId, to, req.body);
      } else {
        result = await sendEmail({ to, subject, html });
      }

      if (result.success) {
        // Update last contacted timestamp for lead
        if (leadId) {
          await storage.updateLead(leadId, { 
            lastContactedAt: new Date(),
            status: 'follow_up'
          });
        }
      }

      res.json(result);
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to send email" 
      });
    }
  });

  // E-COMMERCE ENDPOINTS FOR SHOP EVENTS
  
  // Product management
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: validation.error.issues 
        });
      }
      
      const product = await storage.createProduct(validation.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Cart management
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.sessionId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validation = insertCartItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid cart item data", 
          errors: validation.error.issues 
        });
      }
      
      const cartItem = await storage.addToCart(validation.data);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(parseInt(req.params.id), quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      // Check if the ID is a session ID (string) vs cart item ID (number)
      const idParam = req.params.id;
      
      if (idParam.startsWith('session_')) {
        // Clear entire cart by session ID
        await storage.clearCart(idParam);
        res.json({ message: "Cart cleared" });
      } else {
        // Remove individual cart item by ID
        const itemId = parseInt(idParam);
        if (isNaN(itemId)) {
          return res.status(400).json({ message: "Invalid cart item ID" });
        }
        const success = await storage.removeFromCart(itemId);
        if (!success) {
          return res.status(404).json({ message: "Cart item not found" });
        }
        res.json({ message: "Item removed from cart" });
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order management
  app.post("/api/orders", async (req, res) => {
    try {
      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          errors: validation.error.issues 
        });
      }
      
      const orderData = validation.data;
      
      // Create the order
      const order = await storage.createOrder(orderData);
      
      // Get cart items for this session
      if (orderData.sessionId) {
        const cartItems = await storage.getCartItems(orderData.sessionId);
        
        // Create order items from cart items
        for (const cartItem of cartItems) {
          if (cartItem.productId) {
            const product = await storage.getProduct(cartItem.productId);
            if (product) {
              await storage.createOrderItem({
                orderId: order.id,
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                price: product.price // Store price at time of purchase
              });
            }
          }
        }
        
        // Clear the cart after creating order items
        await storage.clearCart(orderData.sessionId);
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedOrder = await storage.updateOrderStatus(orderId, updates.status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send confirmation email when order is completed
      if (updates.status === "completed" && updatedOrder.customerEmail) {
        try {
          // Get order items for email
          const orderItems = await storage.getOrderItems(orderId);
          const orderItemsWithProducts = await Promise.all(
            orderItems.map(async (item) => {
              const product = await storage.getProduct(item.productId!);
              return {
                ...item,
                product
              };
            })
          );
          
          // Send order confirmation email
          const emailResult = await sendTemplateEmail(
            "order_confirmation",
            updatedOrder.customerEmail,
            {
              customerName: updatedOrder.customerName || "Valued Customer",
              orderId: updatedOrder.id,
              orderItems: orderItemsWithProducts,
              totalAmount: (updatedOrder.totalAmount / 100).toFixed(2),
              orderDate: new Date(updatedOrder.createdAt!).toLocaleDateString()
            }
          );
          
          if (emailResult.success) {
            console.log(`Order confirmation email sent to ${updatedOrder.customerEmail}`);
          } else {
            console.error("Failed to send order confirmation email:", emailResult.error);
          }
        } catch (emailError) {
          console.error("Error sending order confirmation email:", emailError);
        }
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Stripe checkout for shop events
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      // Get cart items
      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate subtotal from cart items
      let subtotal = 0;
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId!);
        if (product) {
          subtotal += product.price * item.quantity;
        }
      }

      // Calculate sales tax (8.75%)
      const salesTax = Math.round(subtotal * 0.0875);
      const subtotalWithTax = subtotal + salesTax;
      
      // Calculate credit card fee (3%)
      const creditCardFee = Math.round(subtotalWithTax * 0.03);
      const totalAmount = subtotalWithTax + creditCardFee;

      // Create Stripe payment intent with tax and fees included
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "usd",
        metadata: {
          sessionId,
          type: "shop_event_purchase",
          subtotal: subtotal.toString(),
          salesTax: salesTax.toString(),
          creditCardFee: creditCardFee.toString(),
          taxRate: "8.75",
          ccFeeRate: "3.0"
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        subtotal,
        salesTax,
        creditCardFee
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
