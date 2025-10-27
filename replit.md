## Overview

This platform is a comprehensive booking and management system for "Host Hampton," a children's party planning service. It features a marketing landing page, a unified booking system for various event types with real-time pricing, and an interactive Kids Party Designer Tool. For business operations, it includes a customer portal with personalized event management and a full-featured admin dashboard for tracking bookings, quotes, payments, and inventory. The system aims to be both a customer-facing tool and a complete business management solution.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom color variables
- **UI Components**: Radix UI primitives via shadcn/ui
- **State Management**: React hooks with TanStack Query
- **Routing**: Wouter
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **UI/UX Decisions**: Modernized rectangular geometric design, 2-column layouts for forms, clean activity displays with icons and labels, focus on real-time pricing and dynamic updates.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful endpoints with JSON responses
- **Authentication**: Session-based authentication using `express-session` with PostgreSQL storage, email-based OTP verification, CSRF protection.

### System Design Choices
- **Data Flow**: Multi-step forms with Zod validation on the frontend, data submitted to backend API, validation and storage in PostgreSQL, toast notifications for responses.
- **Database Schema**: Unified PostgreSQL database with tables for `Event Types`, `Customers`, `Packages`, `Addons`, `Events`, `Invoices`, `Invoice Items`, `Time Slots`, `Staff`, `Communications`, `Campaigns`, `Leads`, `Payments`, `Inventory`, `Customer Preferences`, and `Business Metrics`.
- **API Endpoints**: Comprehensive RESTful API for managing all system aspects including event types, customers, packages, add-ons, events, invoices, product options, and quotes.
- **Frontend Components**: Marketing Landing Page, Unified Booking System, Party Designer Tool, Admin Dashboard for full management, Customer Portal (`/my-events`). Shared components leverage `shadcn/ui`, custom hooks, and API integration utilities.
- **Storage Layer**: Interface-based design using PostgreSQL and Drizzle ORM for production, with in-memory fallback for testing, supporting full CRUD operations.
- **Core Features**:
    - **Party Booking**: Includes 5-star package selection system, activity selection flows (premium, standard, food, cupcakes), quota management, real-time pricing.
    - **Addon Management**: Extensive add-on database with authentic Host Hampton offerings, categorized (food, drink, activity, decor, extra) with per-guest and fixed pricing.
    - **Event Creation**: Multi-step form for creating new events, supporting single/multi-session and workshop configurations with complex pricing scenarios (base price, option modifiers, sibling discounts).
    - **Checkout Experience**: Complete billing address collection, billing information review, Stripe integration, SendGrid email notifications for order confirmation and business alerts, dynamic order item rendering.
    - **Event Management**: Redesigned tab with unified public/private event display, session-based entries, Monday-first calendar view, real-time attendee count, revenue tracking, status filtering, and enhanced event modals.
    - **Studio Rental**: Tiered pricing structure (weekday/weekend, duration-based), updated form field order, and clear pricing summaries.
    - **Quote Management**: "Save as Quote" functionality in booking forms, auto-generated quote numbers, professional quote emails with booking links, `my-events` page segregation for quotes and confirmed bookings, calendar availability checks, and admin quote editing capabilities.
    - **Customer Portal (`/my-events`)**: Comprehensive payment tracking (total, paid, balance due), balance due dates, visual payment indicators, expandable party details, "Request Changes" functionality with a backend API for communication, responsive layout, and status badges.

## External Dependencies

- **Frontend**: React, React DOM, React Hook Form, Radix UI components, Tailwind CSS, TanStack Query, date-fns, clsx, class-variance-authority.
- **Backend**: Express.js, Drizzle ORM, Neon Database client, connect-pg-simple, Stripe (for payment processing), SendGrid (for email notifications).
- **Development Tools**: Vite, TypeScript, ESLint, Prettier, PostCSS, Autoprefixer.