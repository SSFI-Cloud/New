# SSFI Event Management System

This package contains the complete Event Management System for the Skating Sports Federation of India platform.

## 📁 File Structure

```
ssfi-event-management/
├── ssfi-backend/
│   └── src/
│       ├── controllers/
│       │   └── event.controller.ts      # HTTP handlers for events & registrations
│       ├── services/
│       │   └── event.service.ts         # Business logic, eligibility checks
│       ├── routes/
│       │   ├── index.ts                 # Updated main router
│       │   └── event.routes.ts          # Event API endpoints
│       └── validators/
│           └── event.validator.ts       # Zod schemas for validation
│
└── ssfi-frontend/
    └── src/
        ├── app/
        │   └── (public)/
        │       └── events/
        │           ├── page.tsx         # Events listing page
        │           └── [id]/
        │               └── page.tsx     # Event detail page
        ├── components/
        │   └── events/
        │       ├── EventCard.tsx        # Event card for listings
        │       ├── EventRegistrationModal.tsx  # Registration modal
        │       └── index.ts             # Export barrel
        ├── lib/
        │   └── hooks/
        │       └── useEvents.ts         # API hooks for events
        └── types/
            └── event.ts                 # TypeScript types & constants
```

## 🔌 API Endpoints

### Event Management
```
GET    /api/v1/events                    - List all events (public)
GET    /api/v1/events/upcoming           - Get upcoming events (public)
GET    /api/v1/events/:id                - Get event details (public)
POST   /api/v1/events                    - Create event (Admin/Secretary)
PUT    /api/v1/events/:id                - Update event
PUT    /api/v1/events/:id/status         - Update event status
PUT    /api/v1/events/:id/publish        - Publish event
PUT    /api/v1/events/:id/open-registration   - Open registration
PUT    /api/v1/events/:id/close-registration  - Close registration
GET    /api/v1/events/:id/stats          - Get event statistics
```

### Event Registration
```
POST   /api/v1/events/:id/register       - Register for event
POST   /api/v1/events/:id/bulk-register  - Bulk register students
GET    /api/v1/events/:id/registrations  - Get event registrations
GET    /api/v1/events/my-registrations   - Get student's registrations
GET    /api/v1/events/registrations/:id  - Get registration details
PUT    /api/v1/events/registrations/:id/status  - Update registration status
DELETE /api/v1/events/registrations/:id  - Cancel registration
```

## 🎯 Features

### Backend
- ✅ Complete CRUD for events
- ✅ Event status workflow (Draft → Published → Registration Open → Closed → Ongoing → Completed)
- ✅ Student eligibility checking (age category, state/district restrictions)
- ✅ Bulk registration support for club owners
- ✅ Late fee calculation
- ✅ Event statistics aggregation
- ✅ Auto event code generation (NAT-CHA-25-0001)
- ✅ Registration approval workflow

### Frontend
- ✅ Events listing page with filters
- ✅ Search by name, venue, city
- ✅ Filter by level, type, discipline, state
- ✅ Sort by date, name, registration deadline
- ✅ Beautiful event cards with status badges
- ✅ Detailed event page with all info
- ✅ Registration modal with discipline/category selection
- ✅ Fee breakdown display
- ✅ Registration countdown indicator

## 📊 Event Types & Levels

### Event Levels
- National
- State
- District
- Club
- Inter-School
- Open

### Event Types
- Championship
- Tournament
- Competition
- Training Camp
- Workshop
- Exhibition

### Disciplines
- 🏃 Speed Skating
- 💃 Artistic Skating
- 🏒 Roller Hockey
- 🎿 Inline Freestyle
- 🛹 Aggressive Skating
- ⛷️ Downhill

### Age Categories
- U-6, U-8, U-10, U-12, U-14, U-16, U-18, U-21
- Senior
- Masters
- Open

## 🔒 Event Status Workflow

```
DRAFT ──────► PUBLISHED ──────► REGISTRATION_OPEN ──────► REGISTRATION_CLOSED
                                       │                          │
                                       ▼                          ▼
                                   CANCELLED                    ONGOING
                                                                  │
                                                                  ▼
                                                              COMPLETED
```

## 🚀 Integration Instructions

### Backend Integration

1. **Copy files to your backend project:**
```bash
cp -r ssfi-backend/src/* /path/to/your/ssfi-backend/src/
```

2. **Routes are auto-registered** in the updated `routes/index.ts`

3. **Ensure Prisma schema has Event and EventRegistration models**

### Frontend Integration

1. **Copy files to your frontend project:**
```bash
cp -r ssfi-frontend/src/* /path/to/your/ssfi-frontend/src/
```

2. **Add navigation link:**
```tsx
<Link href="/events">Events</Link>
```

3. **Update home page FeaturedEvents component** to use the new hooks:
```tsx
import { useUpcomingEvents } from '@/lib/hooks/useEvents';
```

## 📝 Eligibility Rules

The system automatically checks:
1. **Age Category** - Student's age must match event's allowed categories
2. **State Eligibility** - If event restricts states, student must belong to an eligible state
3. **District Eligibility** - If event restricts districts, student must belong to an eligible district
4. **Membership Status** - Student must have active (non-expired) membership
5. **Registration Status** - Student must be approved
6. **Duplicate Check** - Prevents double registration

## 💰 Fee Calculation

- Base entry fee applied to all registrations
- Late fee added if current date > lateFeeStartDate
- Total fee = entryFee + (lateFee if applicable)

## 🎨 UI Features

- Responsive design for all screen sizes
- Animated cards and transitions
- Status-based color coding
- Registration deadline progress bar
- Filter panel with clear all option
- Pagination for large event lists
- Modal for registration flow

## ⏭️ Next Steps

After integrating this module, you can proceed with:
1. Payment Integration (Razorpay)
2. Certificate Generation
3. Dashboard for all 5 roles
4. CMS System

---

**Created:** January 27, 2026  
**Version:** 1.0.0  
**Compatible with:** SSFI Platform v1.0
