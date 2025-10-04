# Design Guidelines: Epic Games Friends Manager Web App

## Design Approach
**Selected System:** Material Design with Gaming Platform Influences  
**Rationale:** This utility-focused application requires clear information hierarchy, efficient interaction patterns, and reliable functionality. We'll draw inspiration from Discord and Steam's friend management interfaces while maintaining Material Design's proven patterns for data-heavy applications.

**Key Design Principles:**
- Clarity over decoration - every element serves a purpose
- Fast, efficient friend selection and removal workflow
- Clear authentication state and progress indicators
- Gaming aesthetic without sacrificing usability

## Core Design Elements

### A. Color Palette

**Dark Mode Primary (Default):**
- Background: 220 20% 12%
- Surface: 220 18% 16%
- Surface Elevated: 220 16% 20%
- Primary Action: 220 85% 58% (Epic Games blue)
- Destructive: 0 72% 51%
- Success: 142 71% 45%
- Text Primary: 0 0% 98%
- Text Secondary: 220 10% 70%
- Border: 220 15% 25%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary Action: 220 85% 48%
- Text Primary: 220 20% 12%
- Text Secondary: 220 10% 40%

### B. Typography
**Font Family:** Inter (Google Fonts) for UI, Outfit for headings  
**Scale:**
- H1 (Page Title): 2.5rem/600
- H2 (Section): 1.5rem/600
- Body: 1rem/400
- Small/Meta: 0.875rem/400
- Button: 0.9375rem/500

### C. Layout System
**Spacing Units:** Tailwind scale - primary units of 2, 4, 6, 8, 12, 16 for consistency  
**Container:** max-w-6xl centered with px-4 responsive padding  
**Grid:** Friend cards in responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

### D. Component Library

**Authentication Flow:**
- Prominent card with step indicator
- Large, clickable authentication link (text-lg font-semibold with external link icon)
- OAuth URL displayed as interactive button with copy functionality
- Loading states with animated spinners during verification

**Friend List Display:**
- Card-based grid layout showing friend avatars, display names, and account IDs
- Checkbox selection on each card (top-left corner with hover state)
- Bulk selection controls: "Select All", "Deselect All", "Invert Selection"
- Selected count badge prominently displayed
- Search/filter bar at top for finding specific friends

**Friend Cards:**
- Avatar placeholder (gradient circles with initials if no image)
- Display name as heading
- Account ID as secondary text
- Last online status (if available from API)
- Checkbox with custom styling matching Epic blue theme
- Hover state: subtle elevation and border highlight

**Action Bar:**
- Sticky footer when friends selected
- Selected count display
- Primary danger button: "Remove Selected Friends" with count badge
- Secondary cancel button
- Confirmation modal before destructive action

**Navigation/Header:**
- App branding with Epic Games colors
- Logged-in user display name and avatar
- Logout button
- Friend count total in badge

**Modals:**
- Confirmation modal for friend removal with list preview
- Success modal with animation
- Error states with retry options

**Status Indicators:**
- Connection status badge
- Authentication progress stepper
- Loading skeletons for friend list while fetching
- Toast notifications for actions (removed X friends, session killed, etc.)

### E. Interactions & Animations
**Minimal, Purposeful Only:**
- Card hover: slight scale (1.02) and shadow increase
- Checkbox: smooth check animation
- Button: subtle scale on active state
- Modal: fade in with slight scale from 95%
- Toast: slide in from top-right
- NO gratuitous scroll effects or page transitions

## Page Structure

**Layout:** Single-page application with state-based views

**View 1 - Authentication:**
- Centered card (max-w-md)
- Epic Games logo/branding
- Step indicator (1: Get Code, 2: Authorize, 3: Verify)
- Large clickable link with icon and copy button
- Polling status indicator during verification

**View 2 - Friend Manager:**
- Header with user info and logout
- Filter/search bar with live results
- Bulk action controls strip
- Friend cards grid (3 columns desktop, 2 tablet, 1 mobile)
- Sticky action bar when selections active
- Empty state if no friends (illustration + message)

**View 3 - Confirmation Modal:**
- Overlay backdrop (backdrop-blur-sm)
- Centered modal with selected friends preview (max 5 shown, "+X more")
- Warning message about permanent action
- Confirm/Cancel buttons

**Responsive Breakpoints:**
- Mobile: Full-width cards, stacked layout
- Tablet (768px+): 2-column grid
- Desktop (1024px+): 3-column grid, expanded controls

## Images
No large hero images required for this utility application. Use:
- Epic Games logo in header (SVG, brand assets)
- Avatar placeholders with gradient backgrounds
- Icon set: Heroicons for UI elements (search, external link, check, x, logout)
- Empty state illustration when no friends (simple SVG graphic)