import { storage } from "./storage";
import { 
  InsertCustomer, InsertEvent, InsertInvoice, InsertInvoiceItem, 
  InsertEventCalendar, InsertCommunication
} from "@shared/schema";

export interface BookingData {
  // Common fields
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  
  // Event fields
  eventType: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  notes?: string;
  
  // Flow-specific fields
  [key: string]: any;
}

export interface BookingResult {
  success: boolean;
  customerId?: number;
  eventId?: number;
  invoiceId?: number;
  stripeInvoiceUrl?: string;
  message?: string;
  error?: string;
}

class BookingService {
  
  /**
   * Main booking handler - routes to appropriate flow based on event type
   */
  async processBooking(bookingData: BookingData): Promise<BookingResult> {
    try {
      console.log(`Processing booking for ${bookingData.eventType}`);
      
      switch (bookingData.eventType) {
        case "birthday-party":
          return await this.processBirthdayParty(bookingData);
        
        case "diy-party":
        case "private-event":
          return await this.processCustomEvent(bookingData);
        
        case "workshop":
          return await this.processWorkshopEvent(bookingData);
        
        case "permanent-jewelry":
          return await this.processJewelryRequest(bookingData);
        
        case "studio-rental":
          return await this.processStudioRental(bookingData);
        
        default:
          return { success: false, error: "Unknown event type" };
      }
    } catch (error) {
      console.error("Booking processing error:", error);
      return { success: false, error: "Failed to process booking" };
    }
  }



  /**
   * Birthday party events - paid events with theme and addons
   */
  private async processBirthdayParty(data: BookingData): Promise<BookingResult> {
    try {
      console.log("Processing birthday party booking:", data);
      
      // Create or get customer
      const customer = await this.createOrGetCustomer({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        billingAddress: null,
      });

      // Create event with proper date handling
      const eventDate = data.partyDate || data.eventDate;
      const startTime = data.startTime || '14:00';
      const eventDateTime = eventDate ? new Date(eventDate + 'T' + startTime) : new Date();
      
      const event = await storage.createEvent({
        eventTypeId: await this.getEventTypeId("birthday-party"),
        customerId: customer.id,
        eventDate: eventDateTime,
        guestCount: data.guestCount || 0,
        status: "confirmed", // Birthday parties are confirmed immediately
        notes: `Theme: ${data.partyTheme}${data.partyAddons?.length ? ', Add-ons: ' + data.partyAddons.join(', ') : ''}`,
      });

      // Create invoice with birthday party pricing
      const invoiceResult = await this.createBirthdayPartyInvoice(event.id, data);
      
      // Send confirmation email
      await this.sendConfirmationEmail(data, event.id, "birthday-party");
      
      return {
        success: true,
        customerId: customer.id,
        eventId: event.id,
        invoiceId: invoiceResult.invoiceId,
        message: "Birthday party booked successfully!"
      };
    } catch (error) {
      console.error("Birthday party booking error:", error);
      return { success: false, error: "Failed to create birthday party booking" };
    }
  }

  /**
   * Custom events (DIY Party, Private Event) - paid events with invoicing
   */
  private async processCustomEvent(data: BookingData): Promise<BookingResult> {
    try {
      // Create or get customer
      const customer = await this.createOrGetCustomer({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        billingAddress: null,
      });

      // Create event with proper date handling
      const eventDate = data.partyDate || data.eventDate;
      const startTime = data.startTime || '14:00';
      const eventDateTime = eventDate ? new Date(eventDate + 'T' + startTime) : new Date();
      
      const event = await storage.createEvent({
        eventTypeId: await this.getEventTypeId(data.eventType),
        customerId: customer.id,
        eventDate: eventDateTime,
        guestCount: (data.adultCount || 0) + (data.childCount || 0) || data.guestCount || 0,
        status: "quote",
        notes: data.eventDescription || data.notes || "",
      });

      // Create invoice with pricing
      const invoiceResult = await this.createInvoice(event.id, data);
      
      // Send confirmation email
      await this.sendConfirmationEmail(data, event.id, data.eventType);
      
      return {
        success: true,
        customerId: customer.id,
        eventId: event.id,
        invoiceId: invoiceResult.invoiceId,
        message: "Event booking created with invoice"
      };
    } catch (error) {
      console.error("Custom event booking error:", error);
      return { success: false, error: "Failed to create custom event booking" };
    }
  }

  /**
   * Workshop events - paid events with educational focus
   */
  private async processWorkshopEvent(data: BookingData): Promise<BookingResult> {
    try {
      // Create or get customer
      const customer = await this.createOrGetCustomer({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        billingAddress: null,
      });

      // Create event
      const event = await storage.createEvent({
        eventTypeId: await this.getEventTypeId("workshop"),
        customerId: customer.id,
        eventDate: data.preferredDate ? new Date(data.preferredDate + 'T' + (data.startTime || '10:00')) : new Date(),
        guestCount: data.expectedAttendees || 0,
        status: "quote",
        notes: `${data.workshopType}: ${data.workshopDescription}`,
      });

      // Create invoice with workshop pricing
      const invoiceResult = await this.createWorkshopInvoice(event.id, data);
      
      // Send confirmation email
      await this.sendConfirmationEmail(data, event.id, "workshop");
      
      return {
        success: true,
        customerId: customer.id,
        eventId: event.id,
        invoiceId: invoiceResult.invoiceId,
        message: "Workshop booking created with invoice"
      };
    } catch (error) {
      console.error("Workshop booking error:", error);
      return { success: false, error: "Failed to create workshop booking" };
    }
  }

  /**
   * Permanent jewelry - request only, no payment
   */
  private async processJewelryRequest(data: BookingData): Promise<BookingResult> {
    try {
      // Create or get customer
      const customer = await this.createOrGetCustomer({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        billingAddress: null,
      });

      // Create event as request
      const event = await storage.createEvent({
        eventTypeId: await this.getEventTypeId("permanent-jewelry"),
        customerId: customer.id,
        eventDate: data.jewelryPreferredDate ? new Date(data.jewelryPreferredDate + 'T' + (data.jewelryPreferredTime || '14:00')) : new Date(),
        guestCount: data.jewelryPeopleCount || 0,
        status: "quote", // Will remain as quote until manually converted
        notes: `Jewelry pieces: ${data.selectedJewelryPieces?.join(', ') || 'None specified'}`,
      });

      // Send request confirmation email
      await this.sendRequestConfirmationEmail(data, event.id, "permanent-jewelry");
      
      return {
        success: true,
        customerId: customer.id,
        eventId: event.id,
        message: "Jewelry request submitted successfully"
      };
    } catch (error) {
      console.error("Jewelry request error:", error);
      return { success: false, error: "Failed to submit jewelry request" };
    }
  }

  /**
   * Studio rental - request only, no payment
   */
  private async processStudioRental(data: BookingData): Promise<BookingResult> {
    try {
      // Create or get customer
      const customer = await this.createOrGetCustomer({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        billingAddress: null,
      });

      // Create event as request
      const event = await storage.createEvent({
        eventTypeId: await this.getEventTypeId("studio-rental"),
        customerId: customer.id,
        eventDate: new Date(data.studioPreferredDate + 'T' + (data.studioStartTime || '09:00')),
        guestCount: data.studioClientCount || 0,
        status: "quote", // Will remain as quote until manually converted
        notes: `Purpose: ${data.studioPurpose === 'other' ? data.customStudioPurpose : data.studioPurpose}. ${data.studioPurposeDescription}`,
      });

      // Send request confirmation email
      await this.sendRequestConfirmationEmail(data, event.id, "studio-rental");
      
      return {
        success: true,
        customerId: customer.id,
        eventId: event.id,
        message: "Studio rental request submitted successfully"
      };
    } catch (error) {
      console.error("Studio rental request error:", error);
      return { success: false, error: "Failed to submit studio rental request" };
    }
  }

  /**
   * Create or get existing customer
   */
  private async createOrGetCustomer(customerData: InsertCustomer) {
    // Try to find existing customer by email
    const existingCustomer = await storage.getCustomerByEmail?.(customerData.email);
    
    if (existingCustomer) {
      return existingCustomer;
    }
    
    // Create new customer
    return await storage.createCustomer(customerData);
  }

  /**
   * Get event type ID by name
   */
  private async getEventTypeId(eventType: string): Promise<number> {
    // For now, return hardcoded IDs - in production these would be looked up
    const eventTypeMap: { [key: string]: number } = {
      "birthday-party": 1,
      "diy-party": 2,
      "private-event": 3,
      "workshop": 4,
      "permanent-jewelry": 5,
      "studio-rental": 6,
    };
    
    return eventTypeMap[eventType] || 1;
  }

  /**
   * Create invoice for birthday party events
   */
  private async createBirthdayPartyInvoice(eventId: number, data: BookingData) {
    const basePrice = 80000; // $800 base price for birthday parties
    
    // Calculate addon costs
    let addonTotal = 0;
    if (data.partyAddons && Array.isArray(data.partyAddons)) {
      const addonPrices: { [key: string]: number } = {
        "Face Painting": 7500,
        "Balloon Animals": 5000,
        "Magic Show": 12000,
        "Photo Booth": 8500,
        "Character Visit": 15000,
        "Craft Station": 6000,
        "Goodie Bags": 800, // per child
        "Extra Hour": 10000
      };
      
      addonTotal = data.partyAddons.reduce((total: number, addonName: string) => {
        const price = addonPrices[addonName] || 0;
        // Special handling for per-child addons
        if (addonName === "Goodie Bags") {
          return total + (price * (data.guestCount || 1));
        }
        return total + price;
      }, 0);
    }
    
    const subtotal = basePrice + addonTotal;
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + tax;
    const deposit = Math.round(total * 0.50); // 50% deposit
    
    const invoice = await storage.createInvoice({
      eventId,
      subtotal,
      tax,
      total,
      deposit,
      balanceDue: total - deposit,
      notes: "",
      ccFee: 0
    });
    
    // Create invoice items
    await storage.createInvoiceItem({
      invoiceId: invoice.id,
      name: "Birthday Party - Theme: " + (data.partyTheme || "Standard"),
      type: "package",
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice
    });
    
    // Add addon items
    if (data.partyAddons && Array.isArray(data.partyAddons)) {
      for (const addonName of data.partyAddons) {
        const price = {
          "Face Painting": 7500,
          "Balloon Animals": 5000,
          "Magic Show": 12000,
          "Photo Booth": 8500,
          "Character Visit": 15000,
          "Craft Station": 6000,
          "Goodie Bags": 800,
          "Extra Hour": 10000
        }[addonName as keyof typeof addonPrices] || 0;
        
        if (price > 0) {
          const quantity = addonName === "Goodie Bags" ? (data.guestCount || 1) : 1;
          await storage.createInvoiceItem({
            invoiceId: invoice.id,
            name: addonName,
            type: "addon",
            quantity,
            unitPrice: price,
            total: price * quantity
          });
        }
      }
    }
    
    return { invoiceId: invoice.id };
  }

  /**
   * Create invoice for custom events
   */
  private async createInvoice(eventId: number, data: BookingData) {
    const basePrice = data.eventType === "diy-party" ? 25000 : 40000; // $250 or $400
    const addonTotal = (data.selectedCustomAddons || []).reduce((total: number, addonId: string) => {
      const addonPrices: { [key: string]: number } = {
        "photography": 20000, // $200
        "extra-decorations": 7500, // $75
        "party-favors": 5000, // $50
        "balloon-arch": 15000, // $150
        "custom-backdrop": 10000, // $100
      };
      return total + (addonPrices[addonId] || 0);
    }, 0);

    const subtotal = basePrice + addonTotal;
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + tax;
    const deposit = Math.round(total * 0.5); // 50% deposit

    const invoice = await storage.createInvoice({
      eventId,
      subtotal,
      tax,
      total,
      deposit,
      balanceDue: total - deposit,
      ccFee: 0,
      notes: "",
    });

    // Create invoice items
    await storage.createInvoiceItem({
      invoiceId: invoice.id,
      type: "package",
      name: data.eventType === "diy-party" ? "DIY Party Package" : "Private Event Package",
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice,
    });

    // Add addon items
    for (const addonId of (data.selectedCustomAddons || [])) {
      const addonNames: { [key: string]: string } = {
        "photography": "Professional Photography",
        "extra-decorations": "Extra Decorations",
        "party-favors": "Party Favors",
        "balloon-arch": "Balloon Arch",
        "custom-backdrop": "Custom Backdrop",
      };
      const addonPrices: { [key: string]: number } = {
        "photography": 20000,
        "extra-decorations": 7500,
        "party-favors": 5000,
        "balloon-arch": 15000,
        "custom-backdrop": 10000,
      };

      await storage.createInvoiceItem({
        invoiceId: invoice.id,
        type: "addon",
        name: addonNames[addonId] || addonId,
        quantity: 1,
        unitPrice: addonPrices[addonId] || 0,
        total: addonPrices[addonId] || 0,
      });
    }

    return { invoiceId: invoice.id, total, deposit };
  }

  /**
   * Create invoice for workshop events
   */
  private async createWorkshopInvoice(eventId: number, data: BookingData) {
    const basePrice = data.classFormat === "series" ? 60000 : 35000; // $600 or $350
    const addonTotal = (data.selectedWorkshopAddons || []).reduce((total: number, addonId: string) => {
      const addonPrices: { [key: string]: number } = {
        "av-equipment": 10000, // $100
        "catering": 7500, // $75
        "materials-basic": 5000, // $50
        "photography": 20000, // $200
        "setup-assistance": 12500, // $125
      };
      return total + (addonPrices[addonId] || 0);
    }, 0);

    const subtotal = basePrice + addonTotal;
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + tax;
    const deposit = Math.round(total * 0.5); // 50% deposit

    const invoice = await storage.createInvoice({
      eventId,
      subtotal,
      tax,
      total,
      deposit,
      balanceDue: total - deposit,
      ccFee: 0,
      notes: "",
    });

    return { invoiceId: invoice.id, total, deposit };
  }

  /**
   * Send confirmation email for paid events
   */
  private async sendConfirmationEmail(data: BookingData, eventId: number, eventType: string) {
    // This would integrate with SendGrid
    // For now, just log the communication
    console.log(`Sending confirmation email to ${data.customerEmail} for ${eventType} event ${eventId}`);
    
    // TODO: Implement SendGrid integration
    // await this.sendEmail({
    //   to: data.customerEmail,
    //   subject: `${eventType} Booking Confirmation`,
    //   template: 'booking-confirmation',
    //   data: { ...data, eventId }
    // });
  }

  /**
   * Send request confirmation email for request-only events
   */
  private async sendRequestConfirmationEmail(data: BookingData, eventId: number, eventType: string) {
    console.log(`Sending request confirmation email to ${data.customerEmail} for ${eventType} request ${eventId}`);
    
    // TODO: Implement SendGrid integration for request confirmations
  }

  /**
   * Create event calendar entry after payment
   */
  async createCalendarEntry(eventId: number, paymentId: number): Promise<void> {
    try {
      // Get event details
      const event = await storage.getEvent(eventId);
      if (!event) return;

      const customer = await storage.getCustomer(event.customerId);
      if (!customer) return;

      // Create calendar entry
      const calendarEntry: InsertEventCalendar = {
        eventId: event.id,
        title: `${event.status} - ${customer.name}`,
        eventDate: event.eventDate,
        startTime: "14:00", // Default start time, should be extracted from event data
        endTime: "18:00", // Default end time
        eventType: "event", // This should map from eventTypeId
        customerName: customer.name,
        guestCount: event.guestCount,
        location: "Host Hampton",
        status: "confirmed",
        notes: event.notes,
      };

      await storage.createEventCalendar?.(calendarEntry);
      
      console.log(`Created calendar entry for event ${eventId} after payment ${paymentId}`);
    } catch (error) {
      console.error("Failed to create calendar entry:", error);
    }
  }
}

export const bookingService = new BookingService();