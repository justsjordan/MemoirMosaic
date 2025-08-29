# Overview

This is a personal photo journaling application called "My Stories" that allows users to create and manage photo stories with text content. The application provides a private space for users to upload photos, write stories, organize content with tags, and access their memories from anywhere. It features a clean, modern UI with a gradient design theme and focuses on simplicity and user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript using a modern component-based architecture. It uses Vite as the build tool and bundler for fast development and optimized production builds. The UI components are built with Radix UI primitives and styled with Tailwind CSS for consistent design and accessibility. React Query (@tanstack/react-query) handles server state management and API caching. The application uses Wouter for lightweight client-side routing.

Key frontend patterns:
- Component composition with Radix UI primitives
- CSS variables for consistent theming and design tokens
- Custom hooks for reusable logic (authentication, mobile detection, toast notifications)
- Centralized API request handling with error management
- Responsive design with mobile-first approach

## Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API design. It uses a modular architecture separating concerns into distinct layers:

- **Routes layer**: Handles HTTP request routing and validation
- **Storage layer**: Abstracts database operations with a clean interface
- **Authentication layer**: Manages Replit OAuth integration and session handling
- **File handling**: Manages photo uploads with Multer and Sharp for image processing

The backend uses dependency injection patterns and interface abstractions to maintain clean separation between business logic and data persistence.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. Neon Database is used as the PostgreSQL provider with connection pooling for scalability.

Database schema includes:
- Users table for authentication data
- Stories table for text content and metadata
- Photos table for image information and relationships
- Sessions table for authentication session storage

The schema supports relational data with foreign key constraints and includes proper indexing for performance.

## Authentication and Authorization
Authentication is handled through Replit's OAuth system using OpenID Connect. The implementation includes:

- Session-based authentication with PostgreSQL session storage
- Automatic token refresh and user session management
- Protected routes requiring authentication
- User profile data synchronization

Authorization is role-based with users only able to access and modify their own content. All API endpoints validate user ownership before allowing operations.

## File Management
Photo uploads are handled through a multi-step process:
- Client-side file selection with drag-and-drop support
- Server-side validation and processing with Multer
- Image optimization and resizing with Sharp
- Static file serving for uploaded images
- File cleanup and error handling

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL hosting with connection pooling and WebSocket support
- **Drizzle ORM**: Type-safe database operations and migrations

## Authentication Services
- **Replit OAuth**: OpenID Connect authentication provider
- **Express Session**: Session management with PostgreSQL storage

## Image Processing
- **Sharp**: High-performance image processing for resizing and optimization
- **Multer**: Multipart form data handling for file uploads

## UI Framework
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire application
- **Replit Plugins**: Development environment integration and error handling