# AIStarter School - Architecture Overview

## Overview

AIStarter School is a modern full-stack web application built for AI-powered education. The platform serves students in grades 6-12 with personalized learning experiences, featuring autonomous AI teachers, voice-powered lessons, and real-time feedback systems. The application uses a React-based frontend with an Express.js backend, integrated with Firebase for authentication and PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds
- **Authentication**: Firebase Authentication integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: In-memory storage with planned PostgreSQL persistence

## Key Components

### Authentication System
- Firebase Authentication for user management
- Protected routes with authentication guards
- Login/signup flows with form validation
- Session persistence and logout functionality

### Database Schema
- **Users Table**: Basic user information (id, username, password)
- Extensible schema design using Drizzle ORM
- Type-safe database operations with Zod validation

### UI Components
- Comprehensive component library using Radix UI primitives
- Consistent design system with CSS variables
- Dark mode support built-in
- Responsive design for mobile and desktop

### Development Environment
- Hot module replacement with Vite
- TypeScript strict mode enabled
- Path aliases for clean imports
- Replit-optimized development setup

## Data Flow

1. **User Authentication**: Firebase handles user registration and login
2. **Route Protection**: Custom hooks verify authentication status
3. **API Communication**: TanStack Query manages server state and caching
4. **Database Operations**: Drizzle ORM provides type-safe database interactions
5. **UI Updates**: React components re-render based on authentication and data state

## External Dependencies

### Core Technologies
- React ecosystem (React, React DOM, React Router alternative)
- Express.js for backend API
- PostgreSQL database with Neon serverless hosting
- Firebase for authentication services

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI for accessible component primitives
- Lucide React for consistent iconography
- Custom CSS variables for theming

### Development Tools
- Vite for fast development and optimized builds
- TypeScript for type safety
- ESBuild for backend bundling
- Drizzle Kit for database migrations

## Deployment Strategy

### Development
- Replit-hosted development environment
- Hot reload enabled for frontend and backend
- PostgreSQL module integrated for database access
- Port 5000 configured for local development

### Production
- Autoscale deployment target on Replit
- Static asset serving from Express
- Environment variable configuration for database connection
- Build process separates frontend and backend bundles

### Database Management
- Drizzle migrations for schema changes
- Environment-based database URL configuration
- Connection pooling through Neon serverless

## Recent Changes

✓ Phase 1 Complete - Built AIStarter School's public site and authentication system
✓ Home page with hero section and stats
✓ About page with mission and AI fluency importance
✓ Features page showcasing 6 key platform capabilities
✓ Login/signup pages with Firebase email/password authentication
✓ Protected dashboard route for authenticated users
✓ Navigation with proper routing and mobile responsiveness
✓ Fixed DOM nesting issues in navigation components

✓ Autonomous AI Teacher System Implementation
✓ Interactive lessons page with grade-level targeting (6-8, 9-12)
✓ Embedded AI teacher system prompt with autonomous operation
✓ Voice-powered lesson simulation with real-time feedback
✓ Knowledge testing system with adaptive questions
✓ AI project portfolio management
✓ User profile with achievements and badges
✓ Mobile-responsive footer navigation for dashboard sections

✓ Phase 2 Complete - Background Safety Agents & OpenAI Integration
✓ Guardian Agent for input/output filtering with Firebase logging
✓ Session Logger Agent tracking all student activities
✓ Role Validator Agent enforcing grade-band access control
✓ OpenAI GPT-4o integration for autonomous AI teacher responses
✓ Real-time content filtering and safety monitoring
✓ Firebase Firestore integration for activity and violation logging
✓ Grade-level appropriate content delivery (6-8 vs 9-12)

✓ Phase 3 Complete - Curriculum Engine & Test System
✓ Dynamic curriculum with 5 structured topics (Prompting, AI Art, School, Automation, Ethics)
✓ Curriculum Generator Agent creating progressive 5-lesson sequences
✓ Test Generator Agent with automatic grading and badge unlock system
✓ Firebase progress tracking for individual student advancement
✓ Prerequisite system ensuring proper learning progression
✓ Comprehensive curriculum page with lesson and test management
✓ Badge system rewarding topic completion with 70%+ test scores

✓ Phase 4 Complete - AI Portfolio System
✓ Enhanced My Projects page with AI generations management
✓ Display of earned topic badges with scores and dates
✓ AI-generated content viewing with prompts and responses
✓ Favorite system for important generations
✓ Copy to clipboard and export functionality
✓ Guardian and Session Logger agents active on all interactions
✓ Comprehensive portfolio management for student work

## Changelog

```
Changelog:
- June 24, 2025. Initial setup and Phase 1 completion
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```