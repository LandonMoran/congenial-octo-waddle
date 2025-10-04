# Epic Games Friends Manager

A web application for managing Epic Games Store friends with selective removal capabilities.

## Overview

This application allows users to:
- Authenticate with Epic Games using device code OAuth flow
- View their complete friends list
- Search and filter friends
- Select specific friends to remove
- Bulk selection controls (select all, invert selection)
- Confirmation dialogs before destructive actions

## Project Architecture

### Frontend (React + TypeScript)
- **AuthFlow Component**: Handles OAuth device code flow with clickable authentication link
- **FriendsManager Component**: Main interface for viewing and managing friends
- **Design System**: Epic Games blue branding (220 85% 48/58%), card-based layouts, responsive grid

### Backend (Express + TypeScript)
- **OAuth Flow**: Device code generation and verification
- **Friends API**: Fetch friends list from Epic Games API
- **Friend Removal**: Selective friend removal with batch operations
- **Session Management**: Cookie-based session handling

## Recent Changes

**2025-10-03**: Initial implementation
- Complete OAuth device code flow with Epic Games
- Friends list management with selective removal
- Search and filtering capabilities
- Responsive design with dark mode support
- Session management with secure cookies

## Environment Variables

### Optional (with fallback values provided)
- `EPIC_CLIENT_ID`: Epic Games OAuth client ID (default provided)
- `EPIC_CLIENT_SECRET`: Epic Games OAuth client secret (default provided)

**Note**: The default credentials are from the original Python script and are publicly available in Epic Games documentation for testing purposes. For production use, you should obtain your own OAuth credentials from Epic Games.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI, Wouter (routing), TanStack Query
- **Backend**: Express, TypeScript, Epic Games API integration
- **Storage**: In-memory session storage (MemStorage)

## User Preferences

None specified yet.
