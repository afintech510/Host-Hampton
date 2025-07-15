import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPartyBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new party booking
  app.post("/api/party-bookings", async (req, res) => {
    try {
      const validatedData = insertPartyBookingSchema.parse(req.body);
      const booking = await storage.createPartyBooking(validatedData);
      
      // Here you would normally send an email confirmation
      // For now, we'll just log it
      console.log(`New party booking created for ${booking.childName} on ${booking.partyDate}`);
      
      res.json({ 
        success: true, 
        booking: {
          id: booking.id,
          childName: booking.childName,
          partyDate: booking.partyDate,
          partyTime: booking.partyTime,
          totalEstimate: booking.totalEstimate
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to create booking" 
        });
      }
    }
  });

  // Get all party bookings (for admin purposes)
  app.get("/api/party-bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllPartyBookings();
      res.json({ success: true, bookings });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch bookings" 
      });
    }
  });

  // Get a specific party booking
  app.get("/api/party-bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getPartyBooking(id);
      
      if (!booking) {
        res.status(404).json({ 
          success: false, 
          message: "Booking not found" 
        });
        return;
      }
      
      res.json({ success: true, booking });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch booking" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
