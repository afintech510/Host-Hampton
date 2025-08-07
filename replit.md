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