import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPartyBookingSchema, insertReviewSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
