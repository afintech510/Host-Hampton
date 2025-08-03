# Replit.md

## Overview

This is a comprehensive party booking and management platform built for "Host Hampton" - a children's party planning service. The application features:

1. **Marketing Landing Page**: Showcases themed party options with service tiles and contact modules
2. **Unified Booking System**: Single modern booking system at `/book-event` with event type selection and real-time pricing
3. **Kids Party Designer Tool**: Alternative interactive event designer with advanced customization options
4. **Customer Portal**: Email-based authentication system with personalized event management at `/my-events`
5. **Admin Dashboard**: Complete management system for tracking bookings, quotes, payments, and inventory
6. **Database Integration**: Unified PostgreSQL schema supporting the modern event management system

The platform serves as both a customer-facing booking tool and a comprehensive business management solution with full system unification completed.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom color variables
- **UI Components**: Radix UI primitives via shadcn/ui component library
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth transitions
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful endpoints with JSON responses
- **Development**: Hot module replacement via Vite integration

### Data Flow
1. User fills out multi-step party booking form
2. Frontend validates input using Zod schemas
3. Form data is submitted to backend API endpoints
4. Backend validates and stores data in PostgreSQL database
5. Success/error responses are handled with toast notifications

## Key Components

### Database Schema (`shared/schema.ts`)
**Core Tables:**
- **Users Table**: Basic user authentication (currently unused in main flow)
- **Reviews Table**: Customer reviews with verification and featured flags for marketing

**Unified Event Management System Tables:**
- **Event Types**: Categorizes different service types - now populated with 7 active event types:
  - Birthday Party, Adult Workshop/Classes, Permanent Jewelry Party, Permanent Jewelry Pop-Up, Studio Rental, Host Your Client, Permanent Jewelry Appointment
- **Customers**: Customer information with billing details
- **Packages**: Service packages with pricing and event type associations
- **Addons**: Additional services with per-guest or flat pricing options
- **Events**: Core event/booking records with status tracking
- **Invoices**: Financial tracking with tax, deposits, and balance calculations
- **Invoice Items**: Line-item breakdown for detailed billing

**Enhanced Business Management Tables:**
- **Time Slots**: Calendar and availability management with capacity tracking
- **Staff**: Employee management with roles and hourly rates
- **Event Staff Assignments**: Staff scheduling and hours tracking per event
- **Communications**: Email/SMS tracking with delivery status and provider integration
- **Campaigns**: Marketing campaign management with targeting and scheduling
- **Leads**: Lead tracking from source to conversion with pipeline management
- **Payments**: Payment transaction history with processor integration
- **Inventory**: Supply and material management with stock levels
- **Event Inventory Usage**: Cost tracking for supplies used per event
- **Customer Preferences**: Contact preferences, marketing opt-ins, and special needs
- **Business Metrics**: Analytics and reporting data for business intelligence

### API Endpoints (`server/routes.ts`)
**Legacy Endpoints:**
- `GET /api/reviews/featured`: Fetches featured customer reviews

**New Management System Endpoints:**
- `GET/POST /api/event-types`: Event type management
- `GET/POST /api/customers`: Customer management with individual lookups
- `GET/POST /api/packages`: Package management with event type filtering
- `GET/POST /api/addons`: Add-on service management
- `GET/POST /api/events`: Event/booking management with status updates
- `GET/POST /api/invoices`: Invoice management with item details
- `GET/POST /api/invoice-items`: Line-item management for invoices

### Frontend Components
**Landing Page (`/themed-parties`)**: Marketing page with hero section, service tiles, contact modules, and navigation to both booking systems

**Unified Booking System (`/book-event`)**: Modern multi-step form with event type selection, real-time pricing, and payment integration

**New Management System:**
- **Party Designer Tool (`/party-designer`)**: Interactive event type selection with detailed service options
- **Admin Dashboard (`/admin`)**: Comprehensive management interface with:
  - Booking and quote tracking with status management
  - Package and add-on inventory management
  - Payment tracking and invoice generation
  - Customer management and communication tools
  - Real-time stats and financial reporting

**Shared Components**: shadcn/ui component library, custom hooks, form management, and API integration utilities

### Storage Layer (`server/storage.ts`)
- **Interface-based Design**: IStorage interface for storage abstraction
- **Database Storage**: PostgreSQL implementation with Drizzle ORM for production
- **Memory Storage**: In-memory fallback implementation for testing
- **Reviews System**: Full CRUD operations for customer reviews with featured/verified flags
- **Unified Event System**: Complete CRUD operations for the modern event management system
- **Legacy Code Removal**: All legacy party booking methods and references completely removed

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- UI libraries (Radix UI components, Tailwind CSS)
- State management (TanStack Query)
- Utilities (date-fns, clsx, class-variance-authority)
- Development tools (Vite, TypeScript)

### Backend Dependencies
- Express.js with TypeScript support
- Database tools (Drizzle ORM, Neon Database client)
- Session management (connect-pg-simple)
- Development utilities (tsx for TypeScript execution)

### Development Tools
- Vite with React plugin and runtime error overlay
- TypeScript with strict configuration
- ESLint and Prettier (implied by setup)
- PostCSS with Tailwind CSS and Autoprefixer

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations in `./migrations` directory

### Environment Configuration
- Database URL required via `DATABASE_URL` environment variable
- Development and production modes supported
- Replit-specific optimizations included

### Scripts
- `npm run dev`: Development mode with hot reloading
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Deploy database schema changes

### Architecture Benefits
1. **Type Safety**: End-to-end TypeScript ensures data consistency
2. **Developer Experience**: Hot reloading, error overlays, and modern tooling
3. **Scalability**: Modular architecture supports easy feature additions
4. **Database Flexibility**: ORM abstraction allows easy database switching
5. **Component Reusability**: shadcn/ui provides consistent, accessible components
6. **Performance**: Vite bundling and React Query caching optimize user experience

The application is specifically designed for Replit deployment with appropriate configurations for the platform's constraints and features.

## Recent System Unification (January 2025)

**Brand Update (January 2025):**
- ✅ Updated all instances of "Host Hampton Studio" to "Host Hampton" throughout the application
- ✅ Changed branding in location dialogs, admin forms, email templates, storage defaults, and database schemas
- ✅ Maintained consistent brand naming across frontend and backend components

## Recent System Unification (January 2025)

**Complete Legacy System Removal:**
- ✅ Deleted all legacy database tables (partyBookings, partyThemes, partyExtras)
- ✅ Removed all legacy API endpoints (/api/party-bookings, /api/party-themes, /api/party-extras)
- ✅ Removed all legacy storage methods (createPartyBooking, getAllPartyBookings, getPartyThemes, getPartyExtras)
- ✅ Deleted legacy party-booking.tsx page and removed from routing
- ✅ Updated all navigation links from /party-booking to /book-event
- ✅ Cleaned up all import statements and type references
- ✅ Updated booking service to route birthday parties through modern event system

**System Status:**
- All booking types now use the unified events table
- Single modern booking flow at `/book-event`
- Complete elimination of duplicate functionality
- Server running successfully with no legacy code remaining

**Recent Fixes (January 2025):**
- ✅ Fixed verification email sending via SendGrid with proper message IDs and delivery tracking
- ✅ Fixed Clear Cart functionality - removed session ID parsing bug that caused NaN errors
- ✅ Resolved duplicate storage method implementations that were overriding database functions
- ✅ Improved error handling for cart operations and email delivery
- ✅ Enhanced customer authentication system with proper code verification

**Phase 1 Quote System Completion (January 2025):**
- ✅ Successfully restructured /get-quote form with 6 distinct service flows
- ✅ Fixed step progression issues and progress bar calculations
- ✅ Resolved JavaScript errors in NumberWheel component
- ✅ Fixed email template field mapping (parentFirstName → firstName)
- ✅ Enhanced birthday party email templates with comprehensive details
- ✅ Quote submissions now work properly with lead creation and email notifications
- ✅ All service types properly mapped: birthday-party, studio-rental, trucker-hat, workshop, permanent-jewelry, diy-party, private-event

**Phase 2 System Optimization (January 2025):**
- ✅ Enhanced leads database with 18+ comprehensive fields for complete event data mapping
- ✅ Updated backend field extraction to map ALL form data from every event type:
  * Event details: description, adult/child counts, location, timing
  * Workshop specifics: type, format, attendee count  
  * Jewelry details: selected pieces, people count
  * Studio rental: usage type, flexible scheduling
  * Special requirements: allergies, dietary needs, special requests
  * Pricing structures: rental pricing, package selection, food preferences
- ✅ Enhanced invoice auto-building to utilize comprehensive mapped fields and formData
- ✅ Generated 5 test leads covering all event types to validate system (IDs 79-84)
- ✅ Implemented business pricing logic: $875 base + packages (Make it Shine +$25, Party Envy +$50)
- ✅ Added $200 deposit system and 8.75% tax rate
- ✅ Enhanced admin dashboard with lead-to-invoice conversion
- ✅ Completed type-safe TypeScript interfaces for invoice and lead management:
  * shared/types/invoice.ts - Complete invoice data types with validation schemas
  * shared/types/lead.ts - Enhanced lead types with helper functions
  * shared/types/admin.ts - Admin dashboard and management types
  * shared/utils/invoice.ts - Type-safe invoice utility functions
  * shared/utils/lead.ts - Lead processing and analytics utilities
- ✅ Added strategic missing fields to leads schema (January 2025):
  * partyTheme: Birthday party theme selection for better filtering
  * dateNotes: Notes when users select "not sure" for dates
  * jewelryVision: Permanent jewelry event vision/description
  * packageTotal: Calculated package totals in cents for accurate invoicing
- ✅ Enhanced admin dashboard lead display to prioritize structured fields over JSON parsing
- ✅ **COMPLETE Stripe Payment Integration (August 2025):**
  * Fixed duplicate route issue preventing Stripe integration execution
  * Automatic customer creation/lookup from lead data for proper database relationships
  * PaymentIntent creation with invoice metadata (`pi_3RruWvQ53Rr11tnv2Bq5huWM`)
  * Payment link generation with customer checkout flow
  * Invoice status auto-update from 'draft' to 'sent' with Stripe data
  * Complete lead-to-invoice conversion with payment processing integration
  * Admin dashboard payment link display next to SMS delivery button
- 🔄 Calendar conflict detection for studio bookings vs mobile services

**Database Enhancement Validation (January 2025):**
- ✅ 18 new fields successfully added to leads table
- ✅ Comprehensive data mapping working across all 6 event types:
  * Birthday parties: theme, food preferences, special needs
  * Studio rentals: usage type, timing, corporate details  
  * Workshops: type, format, class details
  * Permanent jewelry: selected pieces, attendee counts
  * Trucker hat events: mobile locations, complex pricing
  * DIY parties: craft details, pricing structures
- ✅ All form data preserved in both structured fields and complete formData JSON
- ✅ Invoice auto-building enhanced to pull from mapped fields for detailed event information