## Overview

This platform is a comprehensive party booking and management system for "Host Hampton," a children's party planning service. It features a marketing landing page, a unified booking system for various event types with real-time pricing, and an interactive Kids Party Designer Tool. For business operations, it includes a customer portal with personalized event management and a full-featured admin dashboard for tracking bookings, quotes, payments, and inventory. The entire system is supported by a unified PostgreSQL database, acting as both a customer-facing tool and a complete business management solution.

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

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful endpoints with JSON responses

### Data Flow
The system processes multi-step party booking forms. Frontend validation uses Zod schemas, with form data submitted to backend API endpoints. The backend validates and stores data in PostgreSQL, and success/error responses are handled with toast notifications.

### Key Components

#### Database Schema
The database (`shared/schema.ts`) includes core tables for reviews and a unified event management system. Key tables for event management are: `Event Types`, `Customers`, `Packages`, `Addons`, `Events`, `Invoices`, and `Invoice Items`. Enhanced business management tables include `Time Slots`, `Staff`, `Event Staff Assignments`, `Communications`, `Campaigns`, `Leads`, `Payments`, `Inventory`, `Event Inventory Usage`, `Customer Preferences`, and `Business Metrics`.

#### API Endpoints
The backend (`server/routes.ts`) provides RESTful endpoints for managing all aspects of the system, including event types, customers, packages, add-ons, events, invoices, and invoice items.

#### Frontend Components
The platform features a marketing Landing Page (`/themed-parties`), a Unified Booking System (`/book-event`), and a Party Designer Tool (`/party-designer`). The Admin Dashboard (`/admin`) offers comprehensive management for bookings, quotes, inventory, payments, and customer communications. Shared components leverage the shadcn/ui library, custom hooks, and API integration utilities.

#### Storage Layer
The storage layer (`server/storage.ts`) uses an interface-based design for abstraction, with PostgreSQL and Drizzle ORM for production, and in-memory fallback for testing. It supports full CRUD operations for reviews and the unified event management system.

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- UI libraries (Radix UI components, Tailwind CSS)
- State management (TanStack Query)
- Utilities (date-fns, clsx, class-variance-authority)

### Backend Dependencies
- Express.js
- Database tools (Drizzle ORM, Neon Database client)
- Session management (connect-pg-simple)
- Stripe for payment processing

### Development Tools
- Vite with React plugin
- TypeScript
- ESLint and Prettier
- PostCSS with Tailwind CSS and Autoprefixer

## Recent Updates (August 2025)

**Complete Addon Database Overhaul (August 10, 2025):**
- ✅ Updated addons table with 47 authentic Host Hampton offerings from business spreadsheet
- ✅ Activities: 9 standard activities ($10 per guest) - Glittery Makeup, Hair Tinsel, Beaded Hair Braid, etc.
- ✅ Premium Activities: 10 premium activities ($20 per guest) - DIY Nail Polish, Slime Making, Canvas Painting, etc.
- ✅ Food & Desserts: 11 options ranging from $28-$200 - Pizza, French Fries, Macarons, Candy Wall
- ✅ Entertainment: 4 professional services ($399-$699) - Face Painting, Character Visit, Magician, DJ
- ✅ Equipment & Decor: 7 items including Photo Booth ($150), Balloon packages ($95-$195), Softplay Area ($300)
- ✅ Drinks: 3 packages from $50-$75 - Basic drinks, Coffee Bar, Bubbles Package
- ✅ Gifts: 3 items including Goodie Bags ($8 per guest), Premium Goodie Bags ($15 per guest), Birthday Gift Basket ($25)
- ✅ Proper categorization with per_guest flags and authentic business pricing across 9 categories
- ✅ 5-star package auto-selection system with activity allowances and budget tracking

**Complete Create New Event System Implementation (August 9, 2025):**
- ✅ Fully revamped Create New Event dialog with comprehensive 3-step form design
- ✅ Step 1: Event type selection with single/multi-session/workshop options
- ✅ Step 2: Pricing configuration with photo upload and sibling discount support
- ✅ Step 3: Session management and workshop option configuration
- ✅ Backend API endpoints for product option categories and options with full CRUD support
- ✅ Database schema enhancements with productOptionCategories and productOptions tables
- ✅ Complex pricing scenarios: base price + option modifiers + sibling discounts
- ✅ Successfully tested workshop creation with material choices (wood types: coaster, cutting board, lazy susan)
- ✅ Full integration between frontend form and backend storage with proper validation
- ✅ Enhanced business model support for workshop customization and variable pricing

**Test Results:**
- Created "Resin Workshop Series" with $80 base price, $60 sibling price
- Added "Wood Type" option category with 3 choices:
  - Coaster: $0 extra (default)
  - Cutting Board: +$15
  - Lazy Susan: +$25
- All API endpoints functioning correctly: /api/products, /api/product-option-categories, /api/product-options

## Recent Updates (August 2025)

**Real Business Data Integration:**
- ✅ Added icon field to addons table with appropriate emoji representations
- ✅ Replaced generic add-ons with authentic Host Hampton business data from current website
- ✅ Integrated 26 real add-ons with accurate pricing: Photo Booth ($150), Candy Wall ($200), Balloon services, Beauty services, Food options, Entertainment packages
- ✅ Properly configured per-guest vs fixed pricing for different add-on types
- ✅ Enhanced /get-quote kids party flow with real business offerings and custom icons
- ✅ Added category field to addons table with 5 categories: food, drink, activity, decor, extra
- ✅ Categorized all add-ons for better organization and future filtering options

**Contact Information Update (January 2025):**
- ✅ Updated phone number site-wide to 631-998-9325
- ✅ Updated email address site-wide to hosthampton295@gmail.com
- ✅ Updated contact information across all components, pages, email templates, and server files
- ✅ Replaced old phone numbers (757, 555, 400-8080) and email addresses (info@hosthampton.com, hello@hosthampton.com, events@hosthampton.com)

**Enhanced Checkout Experience (August 2025):**
- ✅ Complete billing address collection (address, city, state, ZIP code)
- ✅ Billing information review section before payment
- ✅ Auto-populated Stripe payment form with customer billing data
- ✅ Enhanced layout preventing field overlap issues
- ✅ SendGrid email service integration with verified sender authentication
- ✅ Improved upcoming-events page UX (no redirect after adding to cart)
- ✅ Fixed order status update flow - orders now properly complete after successful payment
- ✅ Automated email notifications - customer confirmations and business alerts sent on order completion
- ✅ Streamlined checkout success page with automatic order status processing
- ✅ Enhanced email template engine with JavaScript template literal evaluation
- ✅ Dynamic order item rendering with proper product details and session information

**Event Management System Revamp (August 2025):**
- ✅ Complete Event Management tab redesign with unified public/private event display
- ✅ Session-based event entries for all multi-session products
- ✅ Monday-first calendar view with enhanced weekly display (400px tall columns)
- ✅ Real-time attendee count calculation and revenue tracking
- ✅ Status filtering (defaults to confirmed) with event type categorization
- ✅ Enhanced event modals with attendee management and quote editing
- ✅ Added "Not Miss Rachel" product with $30/$20 sibling pricing structure
- ✅ Created individual events for all product sessions: Kids Summer Classes (6 sessions), Open Soft Play (Tuesday 10am-12pm), Advanced Beginner Mahjong (4 September sessions 6-8pm), plus single events for Sourdough, Spirit Medium, and Not Miss Rachel