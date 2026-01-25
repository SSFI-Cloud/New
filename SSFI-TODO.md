# SSFI Digital Platform - Development Todo List

> **Comprehensive task breakdown based on:**
> - SSFI-Design Doc (UI/UX Guidelines)
> - SSFI-PRD Doc (Product Requirements)
> - SSFI-Tech Stack Doc (Architecture)
> - SSFI-Backend Structure Doc (Hierarchy & Permissions)

---

## Phase 1: Foundation (Weeks 1-2)

### 1.1 Project Setup & Configuration
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS with custom theme (SSFI brand colors)
- [ ] Set up Prisma ORM with MySQL connection
- [ ] Configure ESLint and Prettier for code quality
- [ ] Set up folder structure (pages, components, api, lib, utils)
- [ ] Configure environment variables (.env)

### 1.2 Database Setup
- [ ] Review existing `schema.sql` file structure
- [ ] Set up MySQL database on Hostinger VPS
- [ ] Run Prisma introspection on existing schema
- [ ] Create migration folder structure

### 1.3 Database Migrations
- [ ] **Migration 001**: `001_add_auth_fields.sql`
  - [ ] Add `otp_verified` boolean field to users
  - [ ] Add `role` enum field (GLOBAL_ADMIN, STATE_ADMIN, DISTRICT_ADMIN, CLUB_ADMIN, STUDENT)
  - [ ] Add `expiry_date` timestamp field
- [ ] **Migration 002**: `002_add_skater_details.sql`
  - [ ] Add `nominee_name` field to students table
  - [ ] Add `nominee_age` field to students table
  - [ ] Add `school_name` field to students table
  - [ ] Add `coach_name` field to students table
  - [ ] Add `coach_mobile` field to students table
- [ ] **Migration 003**: `003_create_cms_tables.sql`
  - [ ] Create `sliders` table (image, caption, order, active)
  - [ ] Create `gallery_albums` table (title, cover_image, date)
  - [ ] Create `gallery_images` table (album_id, image_url, caption)
  - [ ] Create `sponsors` table (name, logo, website_url, order)
  - [ ] Create `news_ticker` table (message, active, priority)

### 1.4 Authentication API
- [ ] Create `/api/auth/login` endpoint
  - [ ] Implement email/phone + password verification
  - [ ] Return JWT token with role information
  - [ ] Check `expiry_date` and redirect to renewal if expired
- [ ] Create `/api/auth/register` endpoint
  - [ ] Validate input using Zod
  - [ ] Generate OTP for phone verification
- [ ] Create `/api/auth/verify-otp` endpoint
  - [ ] Verify OTP and set `otp_verified` to true
- [ ] Create `/api/auth/forgot-password` endpoint
- [ ] Create `/api/auth/reset-password` endpoint
- [ ] Implement JWT middleware for protected routes
- [ ] Create `expiry_date` check middleware for renewal lockout

---

## Phase 2: Entity Management (Weeks 3-4)

### 2.1 State Secretary Registration
- [ ] Create State Secretary registration form
  - [ ] Personal info: Name, Gender, Email, Mobile
  - [ ] Address: Full residential address
  - [ ] Documents: Aadhaar Number input with validation
  - [ ] File uploads: Profile Photo, Identity Proof (drag-and-drop zone)
  - [ ] State dropdown selection
- [ ] Implement form validation (Zod schema)
- [ ] Create `/api/secretaries/state/register` endpoint
- [ ] Generate Unique ID: `SSFI-[STATE_CODE]-[0001]`

### 2.2 District Secretary Registration
- [ ] Create District Secretary registration form
  - [ ] Personal info: Name, Gender, Email, Mobile
  - [ ] Address: Full residential address
  - [ ] Documents: Aadhaar Number, Profile Photo, Identity Proof
  - [ ] State dropdown (auto-filtered to approved states)
  - [ ] District dropdown (dynamic based on state selection)
- [ ] Create `/api/secretaries/district/register` endpoint
- [ ] Generate Unique ID: `SSFI-[STATE_CODE]-[DIST_CODE]-[0001]`

### 2.3 Club Registration
- [ ] Create Club registration form
  - [ ] Club details: Name, Address, Contact Email, Phone
  - [ ] Owner details: Name, Gender, Email, Mobile
  - [ ] Location: State > District dropdown cascade
  - [ ] Club logo upload
- [ ] Create `/api/clubs/register` endpoint
- [ ] Generate Unique ID: `SSFI-[STATE_CODE]-[DIST_CODE]-[CLUB_CODE]-[0001]`

### 2.4 Approval Workflow System
- [ ] Create `/api/approvals/pending` endpoint (filtered by role level)
- [ ] Create `/api/approvals/approve/:id` endpoint
- [ ] Create `/api/approvals/reject/:id` endpoint
- [ ] Implement approval notification system
- [ ] State Admin approves District registrations
- [ ] District Admin approves Club registrations
- [ ] Build Approval Dashboard UI component
  - [ ] Pending approvals list with status badges
  - [ ] Approve/Reject action buttons
  - [ ] Approval history log

---

## Phase 3: Skater & Events (Weeks 5-7)

### 3.1 Student (Skater) Registration
- [ ] Create multi-step registration form with progress stepper
- [ ] **Step 1 - Personal Information**
  - [ ] Name (as per Aadhaar)
  - [ ] Date of Birth (for age category calculation)
  - [ ] Gender dropdown
  - [ ] Blood Group dropdown
- [ ] **Step 2 - Family & School**
  - [ ] Father's Name
  - [ ] School Name
  - [ ] Academic Board (State/CBSE/ICSE/Others)
- [ ] **Step 3 - Insurance Nominee**
  - [ ] Nominee Name
  - [ ] Nominee Age
  - [ ] Relation (Father/Mother/Guardian)
- [ ] **Step 4 - Coaching Details**
  - [ ] Coach Name
  - [ ] Coach Mobile Number
  - [ ] Select Club (dropdown from registered clubs)
- [ ] **Step 5 - Documents**
  - [ ] Aadhaar Number (12-digit validation)
  - [ ] Aadhaar Card Scan upload (drag-and-drop)
  - [ ] Profile Photo upload (cropper tool)
- [ ] Implement green checkmarks for completed steps
- [ ] Create `/api/students/register` endpoint
- [ ] Generate Unique ID: `SSFI-[STATE_CODE]-[DIST_CODE]-[CLUB_CODE]-[STUDENT_NUM]`

### 3.2 Image Processing Pipeline (Sharp)
- [ ] Install and configure Sharp library
- [ ] Create `uploadMiddleware.ts` with Multer
- [ ] Implement image processing service
  - [ ] Auto-resize to max 800px width
  - [ ] Compress to 80% quality
  - [ ] Convert to WebP format
- [ ] Secure Aadhaar uploads to private directory
- [ ] Implement Signed URL generation for private documents

### 3.3 Event Creation Wizard
- [ ] Create Event Creation Form (Admin only)
- [ ] **Event Details Section**
  - [ ] Event Title
  - [ ] Event Type (National/State/District)
  - [ ] Event Date picker
  - [ ] Registration Start Date
  - [ ] Registration End Date
- [ ] **Targeting Section**
  - [ ] Target Level (All India / Specific State / Specific District)
  - [ ] State dropdown (if State/District level)
  - [ ] District dropdown (if District level)
- [ ] **Fee Configuration**
  - [ ] Entry Fee input (₹)
  - [ ] Early bird discount (optional)
- [ ] **Certificate Configuration**
  - [ ] Championship Title
  - [ ] Association Name
  - [ ] Registration Number
  - [ ] Venue
  - [ ] Secretary Signature upload
  - [ ] President Signature upload
- [ ] Create `/api/events/create` endpoint
- [ ] Create `/api/events/update/:id` endpoint
- [ ] Create `/api/events/delete/:id` endpoint

### 3.4 Event Registration (For Students)
- [ ] Create Event listing page with card-based grid
- [ ] Implement Event Card component
  - [ ] Top half: Event image/category icon
  - [ ] Middle: Title, Date, Venue with map pin icon
  - [ ] Bottom: Status badge (Open/Closing Soon/Completed)
  - [ ] "View Details" button
- [ ] Create Event Details page
- [ ] Implement Eligibility Engine
  - [ ] Location check (Karnataka student can't register for TN event)
  - [ ] Age Category calculation using `season_cut_off_date`
  - [ ] Auto-assign to U-10, U-14, etc. categories
- [ ] Create `/api/events/register` endpoint
- [ ] Show registration confirmation with event details

### 3.5 Certificate Generation
- [ ] Create certificate template (HTML/Canvas)
- [ ] Implement certificate preview with live data
- [ ] Create `/api/certificates/generate` endpoint
  - [ ] Use Puppeteer/html-pdf for PDF generation
  - [ ] Include uploaded signatures
- [ ] Add "Download PDF" button
- [ ] Add "Print" functionality

---

## Phase 4: CMS & Frontend (Weeks 8-9)

### 4.1 Public Website - Home Page
- [ ] **Hero Section**
  - [ ] Full-width slider with skater action images
  - [ ] Overlay text: "Empowering the Future of Indian Skating"
  - [ ] Primary CTA: "Register for Events" (Green button)
  - [ ] Secondary CTA: "View Rankings" (Outline button)
- [ ] **News Ticker**
  - [ ] Scrolling bar below hero for urgent updates
  - [ ] Admin-editable content
- [ ] **"Why Join SSFI" Section**
  - [ ] 3-column grid with icons
  - [ ] "Official ID Card" / "National Recognition" / "Insurance Cover"
- [ ] **Stats Counter**
  - [ ] Animated numbers: "28 States", "500+ Clubs", "10,000+ Skaters"
- [ ] **Sponsors Section**
  - [ ] Auto-scrolling greyscale logos
  - [ ] Color on hover effect

### 4.2 Public Website - Events Page
- [ ] Card-based event grid layout
- [ ] Event filtering (by status, date, location)
- [ ] Event search functionality
- [ ] Responsive cards (stacking on mobile)

### 4.3 Public Website - Gallery Page
- [ ] Masonry/Pinterest-style layout
- [ ] Album folders with cover images
- [ ] Lightbox slideshow for images
- [ ] YouTube video embed support

### 4.4 Public Website - About Page
- [ ] Rich text content from CMS
- [ ] Federation history timeline
- [ ] Leadership team section

### 4.5 Admin CMS Dashboard
- [ ] **Home Page Editor**
  - [ ] Add/Edit/Delete Hero Sliders
  - [ ] Upload slider images with captions
  - [ ] Set slider order (drag-and-drop)
  - [ ] Edit News Ticker content
- [ ] **Content Editor**
  - [ ] Rich Text Editor (TipTap/Quill) for About Us
  - [ ] Federation History editor
- [ ] **Gallery Manager**
  - [ ] Create/Edit/Delete Albums
  - [ ] Bulk photo upload
  - [ ] Add YouTube video links
- [ ] **Sponsors Manager**
  - [ ] Add sponsor logo + website URL
  - [ ] Reorder sponsors

### 4.6 Payment Gateway Integration
- [ ] Install Razorpay/Stripe SDK
- [ ] Create `/api/payments/create-order` endpoint
- [ ] Create `/api/payments/verify` webhook endpoint
- [ ] Implement payment success/failure handlers
- [ ] Update user `expiry_date` on successful renewal
- [ ] Transaction history logging

---

## Phase 5: Dashboard UIs (Weeks 8-9 continued)

### 5.1 Global Admin Dashboard
- [ ] **Sidebar Navigation** (dark blue, collapsible)
  - [ ] Dashboard / Members / Events / Certificates / CMS / Settings
- [ ] **Top Bar**
  - [ ] Welcome message with user name
  - [ ] Notification bell (renewals, approvals)
  - [ ] Profile dropdown
- [ ] **Overview Cards**
  - [ ] Total States (with trend arrow)
  - [ ] Total Districts
  - [ ] Total Clubs
  - [ ] Total Students
  - [ ] Upcoming Events
  - [ ] Pending Approvals
- [ ] **Action Center**
  - [ ] Quick links: Add Event, Manage Fees, Open/Close Registration

### 5.2 State Admin Dashboard
- [ ] State profile overview
- [ ] Districts list with stats
- [ ] Clubs within state (view only)
- [ ] Students count aggregation
- [ ] State-level event management

### 5.3 District Admin Dashboard
- [ ] District profile overview
- [ ] Clubs list with approval status
- [ ] Students within district
- [ ] District-level event management

### 5.4 Club Admin Dashboard
- [ ] Club profile management
- [ ] Students list (registered to club)
- [ ] Student verification workflow
- [ ] Affiliation renewal payment

### 5.5 Student Dashboard
- [ ] Profile view with Unique ID
- [ ] Edit personal details (Address, Photo)
- [ ] Event registration history
- [ ] Certificate downloads
- [ ] Membership renewal payment

---

## Phase 6: UI/UX Polish

### 6.1 Brand Identity Implementation
- [ ] Configure Tailwind theme with SSFI colors
  - [ ] Primary: #003399 (Deep Royal Blue)
  - [ ] Secondary: #28A745 (Vibrant Green)
  - [ ] Accent: Alert Red
  - [ ] Backgrounds: #FFFFFF (public), #F4F7F6 (dashboard)
- [ ] Set up typography (Montserrat headings, Open Sans body)
- [ ] Create consistent icon set (SVG format)

### 6.2 Form Enhancements
- [ ] Floating labels for inputs
- [ ] Real-time validation feedback
- [ ] Required field indicators (*)
- [ ] Drag-and-drop file upload zones
- [ ] Image preview on upload

### 6.3 Mobile Responsiveness
- [ ] Hamburger menu for mobile navigation
- [ ] Card-based tables on mobile (no horizontal scroll)
- [ ] Full-width thumb-friendly buttons
- [ ] Bottom-positioned action buttons

### 6.4 Animations & Micro-interactions
- [ ] Configure Framer Motion
- [ ] Smooth page transitions
- [ ] Card hover effects
- [ ] Loading spinners and skeletons
- [ ] Success/Error toast notifications

---

## Phase 7: SEO & Performance

### 7.1 SEO Implementation
- [ ] Configure Next.js metadata for all pages
- [ ] Dynamic meta tags for events/news
- [ ] Implement OG image generation
- [ ] Create sitemap.xml auto-generation script
- [ ] Add robots.txt configuration
- [ ] Implement structured data (JSON-LD)

### 7.2 Performance Optimization
- [ ] Image optimization (next/image)
- [ ] Lazy loading for gallery images
- [ ] Code splitting for dashboard routes
- [ ] API response caching
- [ ] Database query optimization (indexes)

---

## Phase 8: Infrastructure & Deployment (Week 10)

### 8.1 Hostinger VPS Setup
- [ ] Provision Hostinger VPS (KVM)
- [ ] Install Node.js (LTS version)
- [ ] Install MySQL 8.0+
- [ ] Install and configure Nginx as reverse proxy
- [ ] Install PM2 process manager
- [ ] Configure SSL with Let's Encrypt

### 8.2 Deployment Pipeline
- [ ] Set up Git repository
- [ ] Configure PM2 ecosystem file
- [ ] Set up production environment variables
- [ ] Configure Nginx for Next.js
- [ ] Set up automatic deployments (optional: CI/CD)

### 8.3 Security Hardening
- [ ] Configure firewall (UFW)
- [ ] Set up fail2ban for SSH
- [ ] Secure private file uploads directory
- [ ] Implement rate limiting on APIs
- [ ] Configure CORS properly

---

## Phase 9: UAT & Launch (Week 10)

### 9.1 User Acceptance Testing
- [ ] Test all registration flows with SSFI team
- [ ] Verify approval workflows
- [ ] Test event creation and registration
- [ ] Validate payment integration
- [ ] Test certificate generation
- [ ] Mobile responsiveness testing

### 9.2 Data Migration
- [ ] Export existing data (if any)
- [ ] Create data migration scripts
- [ ] Validate migrated data integrity

### 9.3 Final Launch Checklist
- [ ] DNS configuration
- [ ] SSL verification
- [ ] Backup strategy implementation
- [ ] Monitoring setup (uptime, errors)
- [ ] Documentation for admin users
- [ ] Go-live!

---

## Additional Features (Future Scope)

### Coach Training Module
- [ ] Create training programs (Date, Venue, Duration, Price)
- [ ] Coach registration
- [ ] Training certificate generation

### Fee Split Ledger
- [ ] Implement fee split logic (₹500 → ₹100 National + ₹400 State)
- [ ] Transaction ledger for each level
- [ ] Settlement reports

### 3D Hero Section
- [ ] Install React Three Fiber
- [ ] Create 3D skating animation
- [ ] Optimize for performance (lazy loading)

### Advanced Reporting
- [ ] Export data to Excel/PDF
- [ ] Analytics dashboard
- [ ] Registration trends charts

---

## Notes

> **Key Constraints:**
> - Backend must be built upon existing `schema.sql` structure
> - Aadhaar numbers are PII - store securely
> - Dashboard must load within 2 seconds for 50,000+ records
> - Handle high traffic during registration windows

> **File Path References:**
> - Design Doc: `/Website/Design/SSFI-Design Doc.docx`
> - PRD Doc: `/Website/Design/SSFI-PRD.docx`
> - Tech Stack: `/Website/Design/SSFI-Tech Stack.docx`
> - Backend Structure: `/Website/Design/SSFI-Backend Structure.docx`
