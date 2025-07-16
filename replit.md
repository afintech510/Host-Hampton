# Replit.md

## Overview

This is a full-stack party booking application built for "Host Hampton" - a children's party planning service. The application features a modern React frontend with both a marketing landing page and a step-by-step booking form, plus an Express.js backend with database integration. The marketing page showcases themed party options and funnels users to the detailed booking form to capture party information including themes, add-ons, child details, and contact information.

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
- **Users Table**: Basic user authentication (currently unused in main flow)
- **Party Bookings Table**: Comprehensive party booking information including:
  - Party details (date, time, theme, add-ons)
  - Child information (name, age, guest count)
  - Food preferences (meal choice, cupcake flavor)
  - Parent contact details and address
  - Total cost estimate

### API Endpoints (`server/routes.ts`)
- `POST /api/party-bookings`: Creates new party booking
- `GET /api/party-bookings`: Retrieves all bookings (admin function)

### Frontend Components
- **Landing Page**: Urban Air-inspired themed parties marketing page with hero section, benefits, theme showcase, social proof, and multiple CTAs
- **Multi-step Form**: 8-step party booking process with progress tracking
- **Step Components**: Modular form steps for different booking aspects
- **UI Components**: Comprehensive shadcn/ui component library
- **Custom Hooks**: Form management and API integration hooks
- **Custom Images**: User-provided themed images for form steps (Allie welcome, party neon, horn, birthday star)

### Storage Layer (`server/storage.ts`)
- **Interface-based Design**: IStorage interface for storage abstraction
- **Database Storage**: PostgreSQL implementation with Drizzle ORM for production
- **Memory Storage**: In-memory fallback implementation for testing
- **Reviews System**: Full CRUD operations for customer reviews with featured/verified flags

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