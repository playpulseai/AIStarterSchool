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

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```