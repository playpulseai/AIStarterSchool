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

✓ Firebase Authentication Configuration & Error Resolution
✓ Updated Firebase credentials with proper validation and null safety
✓ Fixed critical runtime errors in safety-agents.ts and curriculum-engine.ts
✓ Implemented demo mode fallbacks for all Firebase-dependent features
✓ Corrected API request formatting for lesson and test generation
✓ Application now runs seamlessly in both Firebase and demo modes

✓ Interactive & Memory-Aware Lesson System Upgrade
✓ Integrated Firebase student memory retrieval on lesson start
✓ Added personalized welcome messages based on learning history
✓ Implemented interactive prompt comparison activity (vague vs detailed)
✓ Enhanced session logging to capture student inputs and responses
✓ Added memory updates after lesson completion with learning style inference
✓ Implemented personalized summary feedback showing improvement metrics

✓ Complete AI-Powered Learning Loop Implementation
✓ Enhanced "Start Learning" button with full memory injection from Firebase
✓ Real-time AI lesson delivery with OpenAI integration using student memory context
✓ Voice + text lesson rendering with personalized AI teacher responses
✓ Interactive task completion with dedicated input field and submit functionality
✓ Comprehensive session logging to /session_logs/{userId} for all interactions
✓ Advanced memory updates with learning style inference and pattern recognition
✓ Dynamic personalized feedback system showing specific improvement metrics

✓ Live Curriculum System Finalization
✓ Removed all placeholder and demo content from curriculum interface
✓ Connected Start Learning to live AI interaction with memory-aware system prompts
✓ Real-time lesson delivery using OpenAI with personalized greetings and adaptation
✓ Session logging to Firebase at /session_logs/{userId}/{timestamp} format
✓ Memory updates for lastLessonTopic, missedTestConcepts, and preferredLearningStyle
✓ Personalized welcome messages based on student learning history
✓ Error handling with proper fallback behavior instead of demo content

✓ Phase 7 Complete - AI Playground Feature Deployment
✓ Created /playground route with 3 sandbox tools: Logo Design, Story Generator, Chatbot Builder
✓ Each tool opens in modal with prompt form and OpenAI API generation
✓ Output display with Save to Portfolio, Regenerate, Copy, and Export functionality
✓ Firebase storage integration for /playground_projects/{userId} with proper data structure
✓ Enhanced /projects page with new Playground Projects tab and filtering
✓ Empty state handling with "Go to AI Playground" call-to-action
✓ Complete separation from curriculum system - no badge unlocks or test progression
✓ Guardian, Logger, and Role Validator remain active for all playground interactions

✓ Investor Demo Mode Implementation
✓ Removed traditional login/signup routes and authentication flows
✓ Implemented 4-digit access code gate system (demo code: 2025)
✓ AccessCodeModal component with investor-focused messaging
✓ Protected routes now check localStorage for demo access token
✓ Navigation updated with "Access Demo" buttons instead of "Get Started"
✓ Soft gate displays investor demo messaging for protected content
✓ Clean separation between public marketing pages and demo platform access

✓ AI Teacher Chat System Finalization
✓ Fixed "AI is typing..." placeholder to show real OpenAI responses on lesson start
✓ Implemented live prompt evaluation with real-time feedback instead of static analysis
✓ Added personalized lesson introductions based on student memory context
✓ Enhanced chat UI with scrollable container and proper mobile scaling
✓ Removed "Analyze My Prompt" button in favor of automatic evaluation on submit
✓ Added Enter key support and loading states for better UX
✓ Comprehensive session logging to /session_logs/{userId} for all interactions
✓ Smart memory updates tracking prompt improvement and learning patterns

✓ Curriculum System Bug Fixes & AI Art Lesson 2 Integration
✓ Fixed "Start Learning" button input interaction issues with proper onKeyDown handling
✓ Implemented auto-scrolling chat container with useRef for smooth user experience
✓ Added "Creating Your First AI Artwork" as dedicated Lesson 2 in AI Art curriculum
✓ Integrated DALL-E and DeepArt tutorial content with step-by-step guidance
✓ Added prompt refinement exercises comparing vague vs detailed prompts
✓ Implemented comprehension checks and 3 quiz questions for lesson assessment
✓ Enhanced AI teacher system prompts to handle specialized art creation workflows
✓ Session logging captures all student inputs and AI responses for lesson analytics

✓ Curriculum Access System Fix
✓ Removed prerequisite restrictions from "AI for School", "AI Automation", and "AI Ethics" topics
✓ All curriculum topics now accessible immediately after access code validation
✓ Eliminated lesson gating logic that was incorrectly blocking topic access
✓ Updated isTopicUnlocked function to return true for all topics
✓ Verified "Start Learning" functionality works for all curriculum topics

✓ Grade Band-Specific Curriculum Implementation
✓ Fixed grade band switching logic to trigger curriculum content reload
✓ Implemented distinct teaching styles for Grades 6-8 vs 9-12 in AI teacher prompts
✓ Added grade-specific adaptations for lesson complexity and vocabulary
✓ Enhanced session logging to track grade band in /lesson_sessions/{userId}/{gradeBand}/
✓ Clear lesson state when switching between grade bands to prevent content mixing
✓ Middle school focuses on simple language, games, and practical examples
✓ High school includes technical concepts, career preparation, and advanced topics

✓ Advanced Grade 9-12 Curriculum Content Upgrade
✓ Enhanced AI Ethics lessons with real-world bias cases (COMPAS algorithm, Amazon hiring AI)
✓ Added Educational AI module covering surveillance vs. personalization dilemmas
✓ Upgraded Prompt Engineering to include instruction chaining and sensitivity analysis
✓ Advanced Automation lessons with healthcare, manufacturing, and finance case studies
✓ Integrated scenario-based ethical dilemmas and decision tree frameworks
✓ Added group project ideas and collaborative problem-solving activities
✓ Connected curriculum to current regulatory frameworks (EU AI Act, algorithmic auditing)
✓ All Grade 9-12 content now includes industry applications and career pathway connections

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

✓ Phase 5 Complete - Admin Dashboard System
✓ Role-based access control for admin routes
✓ Session logs monitoring with filtering and search
✓ Flagged content review and clearing system
✓ Test results analysis with pass/fail statistics
✓ Badge history tracking with manual override capability
✓ CSV export functionality for all admin data
✓ Firebase integration for secure data management
✓ Comprehensive moderation tools for safety oversight

✓ Phase 6 Complete - Public Gallery & Launch System
✓ Public gallery showcasing approved student AI projects
✓ Project publishing system with student alias protection
✓ Admin approval workflow for public content
✓ Warning system and confirmation for publishing
✓ Public filtering by topic, type, and grade level
✓ Like system and engagement metrics for public projects
✓ Complete privacy protection with alias-only display
✓ Launch-ready platform with full safety and moderation

🚀 AIStarter School is now fully operational and launch-ready!

✓ Smart Learner Memory System Integration
✓ Personalized AI teaching based on student learning patterns
✓ Memory tracking of lesson progress, test performance, and learning style
✓ Adaptive AI responses using past performance and preferences
✓ Learning insights dashboard showing student strengths and growth areas
✓ Automatic prompt improvement suggestions based on interaction history
✓ Context-aware lesson introductions referencing past topics
✓ Performance-based difficulty adjustment and encouragement

✓ Phase 4 Enhanced - My Projects + Memory Feedback Integration
✓ Smart memory feedback system displaying personalized learning insights
✓ Badge indicators showing earned achievements on projects and generations
✓ Memory tracking updates when students create new projects
✓ Improvement detection for students working on weak areas
✓ Project completion analysis and encouragement system
✓ Firebase-compatible memory storage using student_memory/{userId} format
✓ Guardian and Session Logger agents active across all project interactions

✓ Phase 5 Enhanced - Admin Dashboard + Student Memory Analytics
✓ Comprehensive student memory insights dashboard for administrators
✓ Real-time learning profile analysis with performance metrics
✓ Learning style distribution analytics and pattern recognition
✓ Student support identification based on memory patterns
✓ CSV export functionality for memory insights and analytics
✓ Memory reset capability for debugging and development
✓ Role-based access control protecting all admin memory functions
✓ Integration with existing Guardian and Session Logger systems

## Changelog

```
Changelog:
- June 24, 2025. Initial setup and Phase 1 completion
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```