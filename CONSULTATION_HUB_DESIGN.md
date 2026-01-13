# Consultation Hub System Design

**Design Date:** December 18, 2025  
**Author:** Senior System Architect  
**Version:** 1.0 - Complete System Specification

---

## EXECUTIVE SUMMARY

**Purpose:** Standalone consultation booking and management system connecting clients with expert consultants.

**Core Principle:** Complete independence from LMS - consultations are a separate service line.

**Key Features:**
- 🎯 Consultation request and matching
- 👤 Expert profile management
- 📅 Availability and scheduling
- 💬 Session notes and file sharing
- 💰 Payment processing (modular)
- 📊 Reporting and analytics
- 🔒 GDPR-compliant data handling
- 📝 Full audit trail

---

## 1. FEATURE MAP

### 1.1 Feature Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│               CONSULTATION HUB SYSTEM                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  CLIENT FEATURES   │  │  EXPERT FEATURES   │            │
│  ├────────────────────┤  ├────────────────────┤            │
│  │ • Browse Experts   │  │ • Profile Setup    │            │
│  │ • Request Session  │  │ • Availability Mgmt│            │
│  │ • Schedule Meeting │  │ • Request Review   │            │
│  │ • Upload Files     │  │ • Session Prep     │            │
│  │ • View Notes       │  │ • Note Taking      │            │
│  │ • Payment          │  │ • Client History   │            │
│  │ • History          │  │ • Earnings Report  │            │
│  └────────────────────┘  └────────────────────┘            │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  ADMIN FEATURES    │  │  SYSTEM FEATURES   │            │
│  ├────────────────────┤  ├────────────────────┤            │
│  │ • Expert Approval  │  │ • Matching Engine  │            │
│  │ • Session Monitor  │  │ • Notifications    │            │
│  │ • Dispute Handle   │  │ • Calendar Sync    │            │
│  │ • Revenue Track    │  │ • File Storage     │            │
│  │ • Reporting        │  │ • Audit Logging    │            │
│  │ • GDPR Requests    │  │ • Email/SMS        │            │
│  └────────────────────┘  └────────────────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Feature List by Role

#### Client (UMKM User)
1. **Discovery**
   - Browse expert profiles
   - Filter by expertise, rating, price
   - View availability calendar
   - Read reviews

2. **Booking**
   - Request consultation
   - Select date/time
   - Specify topic and goals
   - Upload supporting documents
   - Make payment (if paid)

3. **Session Management**
   - Receive confirmation
   - Join video call
   - Access session notes
   - Download resources
   - Submit feedback/review

4. **History & Tracking**
   - View past consultations
   - Download invoices
   - Track action items
   - Re-book with same expert

#### Expert (Consultant)
1. **Profile Management**
   - Create/update profile
   - Set expertise areas
   - Upload credentials
   - Set hourly rates
   - Define service packages

2. **Availability**
   - Set weekly schedule
   - Block time slots
   - Define buffer times
   - Set max sessions per day
   - Vacation mode

3. **Request Handling**
   - View incoming requests
   - Accept/decline requests
   - Propose alternative times
   - Request more information

4. **Session Delivery**
   - Prepare session materials
   - Conduct consultation
   - Take session notes
   - Assign action items
   - Upload resources
   - Submit completion report

5. **Business Management**
   - View earnings dashboard
   - Track session metrics
   - Monitor client feedback
   - Manage payout preferences

#### Admin
1. **Expert Management**
   - Review expert applications
   - Verify credentials
   - Approve/reject profiles
   - Suspend accounts
   - Manage commission rates

2. **Session Oversight**
   - Monitor all sessions
   - Handle disputes
   - Review quality complaints
   - Enforce policies

3. **Financial Management**
   - Track revenue
   - Process payouts
   - Manage refunds
   - Generate tax reports

4. **Analytics & Reporting**
   - Utilization metrics
   - Revenue analytics
   - Expert performance
   - Client satisfaction scores

5. **Compliance**
   - GDPR data export
   - Right to be forgotten
   - Audit log review
   - Security monitoring

---

## 2. USER FLOWS (TEXTUAL)

### 2.1 Client Flow: Request Consultation

```
[START] Client needs business advice
   │
   ├─ Step 1: Browse Experts
   │    • Navigate to /consultation/experts
   │    • Filter by: expertise, price, rating, availability
   │    • View expert profiles (bio, reviews, rates)
   │
   ├─ Step 2: Select Expert
   │    • Click "Book Consultation"
   │    • View detailed profile
   │    • Check availability calendar
   │
   ├─ Step 3: Request Session
   │    • Fill request form:
   │       - Consultation type (e.g., Marketing Strategy)
   │       - Preferred date/time
   │       - Session goal/description
   │       - Upload supporting files (optional)
   │       - Select duration (30min/60min/90min)
   │    • Submit request
   │
   ├─ Step 4: Payment (if paid consultation)
   │    • Review pricing
   │    • Select payment method
   │    • Complete payment
   │    • Receive invoice
   │
   ├─ Step 5: Await Confirmation
   │    • Expert reviews request
   │    • Option A: Expert accepts → Move to Step 6
   │    • Option B: Expert proposes new time → Client approves/rejects
   │    • Option C: Expert declines → Client finds another expert
   │
   ├─ Step 6: Confirmed Session
   │    • Receive confirmation email
   │    • Add to calendar (iCal link)
   │    • Receive reminder 24h before
   │    • Receive reminder 1h before
   │
   ├─ Step 7: Join Session
   │    • Click "Join Session" link
   │    • Video call opens (Zoom/Google Meet)
   │    • Consultation proceeds
   │
   ├─ Step 8: Post-Session
   │    • Expert uploads session notes
   │    • Expert uploads resources
   │    • Client receives notification
   │    • Client downloads materials
   │
   ├─ Step 9: Feedback
   │    • Client rates session (1-5 stars)
   │    • Client writes review
   │    • Submit feedback
   │
   └─ Step 10: Follow-Up
        • Option to book next session
        • Track action items
        • Access session history
   
[END] Consultation complete
```

### 2.2 Expert Flow: Manage Availability & Sessions

```
[START] Expert joins platform
   │
   ├─ Onboarding: Setup Profile
   │    • Create expert profile
   │    • Upload credentials (certifications, resume)
   │    • Set expertise areas
   │    • Define service packages & rates
   │    • Submit for admin approval
   │    • Wait for verification
   │
   ├─ Approved: Configure Availability
   │    • Set weekly schedule (e.g., Mon-Fri 9AM-5PM)
   │    • Define time slot duration (30/60/90 min)
   │    • Set buffer time between sessions (15 min default)
   │    • Set max sessions per day
   │    • Block specific dates (vacations)
   │
   ├─ Receive Request
   │    • Notification: New consultation request
   │    • Review request details:
   │       - Client info (name, business type)
   │       - Topic and goals
   │       - Preferred time
   │       - Uploaded files
   │    • Decision:
   │       - Accept → Confirmed
   │       - Propose alternative time → Client must approve
   │       - Decline with reason → Notify client
   │
   ├─ Prepare for Session
   │    • Review client background
   │    • Download uploaded files
   │    • Prepare agenda/materials
   │    • Set reminder
   │
   ├─ Conduct Session
   │    • Start video call
   │    • Take live notes
   │    • Screen share (if needed)
   │    • Assign action items
   │
   ├─ Post-Session Documentation
   │    • Upload session notes
   │    • Upload resources/templates
   │    • Mark action items
   │    • Mark session as completed
   │    • (Optional) Schedule follow-up
   │
   ├─ Receive Feedback
   │    • View client rating
   │    • Read review
   │    • Reply to review (optional)
   │
   └─ Track Earnings
        • View earnings dashboard
        • Download payout statements
        • Update payment preferences
   
[END] Expert workflow complete
```

### 2.3 Admin Flow: Expert Verification

```
[START] New expert application received
   │
   ├─ Review Application
   │    • View expert profile
   │    • Check credentials
   │    • Verify certifications (if uploaded)
   │    • Check references (if provided)
   │
   ├─ Background Check (if applicable)
   │    • Verify identity
   │    • Check for previous violations
   │    • Validate expertise claims
   │
   ├─ Decision
   │    • Approve:
   │       - Send welcome email
   │       - Activate expert profile
   │       - Expert can now accept requests
   │    • Request more info:
   │       - Send follow-up questions
   │       - Expert provides additional docs
   │       - Re-review
   │    • Reject:
   │       - Send rejection email with reason
   │       - Archive application
   │
   └─ Ongoing Monitoring
        • Monitor session quality
        • Review complaints
        • Suspend if violations occur
   
[END] Expert vetted
```

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables

#### 3.1.1 Expert Profiles

```sql
CREATE TABLE expert_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Profile Information
    title VARCHAR(255), -- e.g., "Senior Business Strategist"
    tagline VARCHAR(500), -- Short pitch
    bio TEXT,
    video_intro_url VARCHAR(500), -- Intro video
    
    -- Expertise
    expertise_areas TEXT[], -- Array: ["Marketing", "Finance", "Digital Transformation"]
    industries TEXT[], -- Array: ["F&B", "Retail", "Manufacturing"]
    languages TEXT[] DEFAULT ARRAY['Indonesian'], -- ["Indonesian", "English"]
    
    -- Experience
    years_experience INT,
    certifications JSONB, -- [{ name, issuer, year, file_url }]
    education JSONB, -- [{ degree, institution, year }]
    previous_roles JSONB, -- [{ title, company, years }]
    
    -- Rates & Packages
    hourly_rate DECIMAL(10,2), -- Base hourly rate
    packages JSONB, -- [{ name, duration, price, description }]
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Settings
    is_accepting_new_clients BOOLEAN DEFAULT true,
    max_sessions_per_day INT DEFAULT 5,
    buffer_time_minutes INT DEFAULT 15, -- Between sessions
    cancellation_policy TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, suspended, rejected
    verification_status VARCHAR(50) DEFAULT 'unverified', -- unverified, verified, flagged
    is_featured BOOLEAN DEFAULT false, -- For homepage display
    
    -- Metrics (cached for performance)
    total_sessions INT DEFAULT 0,
    total_hours DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 100, -- % of requests responded to within 24h
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    
    -- GDPR
    data_retention_consent BOOLEAN DEFAULT true,
    marketing_consent BOOLEAN DEFAULT false,
    
    CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5),
    CONSTRAINT valid_response_rate CHECK (response_rate >= 0 AND response_rate <= 100)
);

CREATE INDEX idx_expert_status ON expert_profiles(status) WHERE status = 'approved';
CREATE INDEX idx_expert_expertise ON expert_profiles USING GIN(expertise_areas);
CREATE INDEX idx_expert_rating ON expert_profiles(average_rating DESC);
CREATE INDEX idx_expert_featured ON expert_profiles(is_featured) WHERE is_featured = true;
```

#### 3.1.2 Availability Schedules

```sql
CREATE TABLE expert_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    
    -- Recurring Availability
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NOTNULL,
    is_recurring BOOLEAN DEFAULT true,
    
    -- One-Time Availability (overrides recurring)
    specific_date DATE, -- For special availability on a date
    is_available BOOLEAN DEFAULT true, -- false = blocked time
    
    -- Metadata
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    notes TEXT, -- e.g., "Available for urgent sessions only"
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    CONSTRAINT recurring_or_specific CHECK (
        (is_recurring = true AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
        (is_recurring = false AND specific_date IS NOT NULL)
    )
);

CREATE INDEX idx_availability_expert ON expert_availability(expert_id);
CREATE INDEX idx_availability_day ON expert_availability(day_of_week) WHERE is_recurring = true;
CREATE INDEX idx_availability_date ON expert_availability(specific_date) WHERE specific_date IS NOT NULL;
```

#### 3.1.3 Consultation Types (Service Catalog)

```sql
CREATE TABLE consultation_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL, -- e.g., "Marketing Strategy Session"
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    
    -- Categorization
    category VARCHAR(100), -- digital, financial, legal, marketing, etc.
    tags TEXT[], -- Array for filtering
    
    -- Pricing
    base_price DECIMAL(10,2) DEFAULT 0, -- 0 = free consultation
    recommended_duration INT DEFAULT 60, -- minutes
    is_premium BOOLEAN DEFAULT false,
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    requires_preparation BOOLEAN DEFAULT false, -- If true, client must upload docs
    allow_instant_booking BOOLEAN DEFAULT false, -- If true, skip approval step
    
    -- Display
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consultation_type_category ON consultation_types(category);
CREATE INDEX idx_consultation_type_active ON consultation_types(is_active) WHERE is_active = true;
```

#### 3.1.4 Consultation Requests (Bookings)

```sql
CREATE TABLE consultation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parties
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES expert_profiles(id),
    consultation_type_id UUID REFERENCES consultation_types(id),
    
    -- Scheduling
    requested_date DATE NOT NULL,
    requested_start_time TIME NOT NULL,
    requested_end_time TIME NOT NULL,
    duration_minutes INT NOT NULL, -- 30, 60, 90, etc.
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    
    -- Request Details
    topic VARCHAR(500) NOT NULL, -- What they want to discuss
    description TEXT, -- Detailed description of needs/goals
    urgency VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    preparation_notes TEXT, -- What client has prepared
    
    -- Status Flow
    status VARCHAR(50) DEFAULT 'pending', 
    -- pending → approved/rejected/rescheduled/cancelled
    status_reason TEXT, -- Why rejected/cancelled
    
    -- Pricing
    quoted_price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    is_paid BOOLEAN DEFAULT false,
    payment_id UUID, -- Reference to payment table (separate module)
    
    -- Meeting Details (filled after approval)
    meeting_url VARCHAR(500), -- Zoom/Meet link
    meeting_password VARCHAR(100),
    calendar_event_id VARCHAR(255), -- For calendar integration
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id), -- Who cancelled
    
    -- Notifications
    client_notified_at TIMESTAMP,
    expert_notified_at TIMESTAMP,
    reminder_sent_at TIMESTAMP,
    
    CONSTRAINT valid_time_range CHECK (requested_start_time < requested_end_time),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'rescheduled', 'cancelled', 'completed'))
);

CREATE INDEX idx_request_client ON consultation_requests(client_id);
CREATE INDEX idx_request_expert ON consultation_requests(expert_id);
CREATE INDEX idx_request_status ON consultation_requests(status);
CREATE INDEX idx_request_date ON consultation_requests(requested_date);
CREATE INDEX idx_request_upcoming ON consultation_requests(requested_date, requested_start_time) 
    WHERE status = 'approved' AND requested_date >= CURRENT_DATE;
```

#### 3.1.5 Consultation Sessions

```sql
CREATE TABLE consultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID UNIQUE NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
    
    -- Session Execution
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    actual_duration_minutes INT, -- Actual session length
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled', 
    -- scheduled → in_progress → completed → disputed
    
    -- Quality Metrics
    was_successful BOOLEAN, -- Expert marks if session achieved goals
    client_attended BOOLEAN DEFAULT true,
   expert_attended BOOLEAN DEFAULT true,
    connection_quality VARCHAR(50), -- excellent, good, poor (self-reported)
    
    -- Session Data
    session_notes TEXT, -- Expert's private notes
    client_visible_notes TEXT, -- Shared with client
    action_items JSONB, -- [{ task, due_date, status }]
    key_takeaways TEXT[], -- Array of main points
    
    -- Follow-up
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    CONSTRAINT valid_session_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'disputed', 'no_show'))
);

CREATE INDEX idx_session_status ON consultation_sessions(status);
CREATE INDEX idx_session_completed ON consultation_sessions(completed_at) WHERE completed_at IS NOT NULL;
```

#### 3.1.6 Session Files

```sql
CREATE TABLE session_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES consultation_sessions(id) ON DELETE CASCADE,
    request_id UUID REFERENCES consultation_requests(id) ON DELETE CASCADE,
    
    -- File Info
    file_name VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size BIGINT, -- bytes
    mime_type VARCHAR(100),
    
    -- Categorization
    file_type VARCHAR(50), -- preparation, resource, transcript, recording
    uploaded_by UUID NOT NULL REFERENCES users(id),
    is_client_visible BOOLEAN DEFAULT true,
    
    -- Metadata
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    
    -- GDPR
    expires_at TIMESTAMP, -- Auto-delete after certain period
    is_sensitive BOOLEAN DEFAULT false,
    
    CONSTRAINT session_or_request CHECK (
        (session_id IS NOT NULL AND request_id IS NULL) OR
        (session_id IS NULL AND request_id IS NOT NULL)
    )
);

CREATE INDEX idx_file_session ON session_files(session_id);
CREATE INDEX idx_file_request ON session_files(request_id);
CREATE INDEX idx_file_expiry ON session_files(expires_at) WHERE expires_at IS NOT NULL;
```

#### 3.1.7 Reviews & Ratings

```sql
CREATE TABLE consultation_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES consultation_sessions(id) ON DELETE CASCADE,
    
    -- Reviewer
    client_id UUID NOT NULL REFERENCES users(id),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id),
    
    -- Rating (1-5 scale)
    overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    expertise_rating INT CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    professionalism_rating INT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Feedback
    comment TEXT,
    tags TEXT[], -- helpful, knowledgeable, responsive, etc.
    would_recommend BOOLEAN,
    
    -- Visibility
    is_published BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, -- Admin verified it's genuine
    is_featured BOOLEAN DEFAULT false, -- Show on homepage
    
    -- Expert Response
    expert_response TEXT,
    expert_response_at TIMESTAMP,
    
    -- Moderation
    flagged_reason TEXT, -- If flagged for review
    moderation_status VARCHAR(50) DEFAULT 'approved', -- pending, approved, rejected
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_review_expert ON consultation_reviews(expert_id) WHERE is_published = true;
CREATE INDEX idx_review_rating ON consultation_reviews(overall_rating DESC);
CREATE INDEX idx_review_featured ON consultation_reviews(is_featured) WHERE is_featured = true;
```

### 3.2 Supporting Tables

#### 3.2.1 Reschedule Requests

```sql
CREATE TABLE reschedule_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_request_id UUID NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
    
    requested_by UUID NOT NULL REFERENCES users(id), -- client or expert
    requested_to UUID NOT NULL REFERENCES users(id), -- the other party
    
    -- New Proposed Time
    new_date DATE NOT NULL,
    new_start_time TIME NOT NULL,
    new_end_time TIME NOT NULL,
    
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
    
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reschedule_request ON reschedule_requests(consultation_request_id);
```

#### 3.2.2 Expert Blocked Dates

```sql
CREATE TABLE expert_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    
    blocked_date DATE NOT NULL,
    reason VARCHAR(255), -- vacation, conference, personal
    is_all_day BOOLEAN DEFAULT true,
    
    -- If not all day
    start_time TIME,
    end_time TIME,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(expert_id, blocked_date, start_time)
);

CREATE INDEX idx_blocked_dates_expert ON expert_blocked_dates(expert_id);
CREATE INDEX idx_blocked_dates_date ON expert_blocked_dates(blocked_date);
```

#### 3.2.3 Audit Log (Consultation-Specific)

```sql
CREATE TABLE consultation_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What happened
    entity_type VARCHAR(50) NOT NULL, -- expert_profile, request, session, etc.
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- created, updated, approved, cancelled, etc.
    
    -- Who did it
    actor_id UUID REFERENCES users(id),
    actor_role VARCHAR(50), -- client, expert, admin, system
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON consultation_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON consultation_audit_logs(actor_id);
CREATE INDEX idx_audit_created ON consultation_audit_logs(created_at DESC);
```

#### 3.2.4 Data Export Requests (GDPR)

```sql
CREATE TABLE gdpr_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    request_type VARCHAR(50) NOT NULL, -- export_data, delete_data
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    
    -- Export Details
    export_url VARCHAR(1000), -- S3 URL for download
    export_expires_at TIMESTAMP, -- Link expires after 7 days
    
    -- Deletion Details
    deletion_scope TEXT[], -- What to delete: ["profile", "sessions", "reviews"]
    deleted_at TIMESTAMP,
    
    -- Audit
    requested_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_gdpr_user ON gdpr_export_requests(user_id);
CREATE INDEX idx_gdpr_status ON gdpr_export_requests(status);
```

---

## 4. VALIDATION RULES

### 4.1 Expert Profile Validation

| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| `title` | Max 255 chars, required | "Professional title is required" |
| `bio` | Min 100 chars, max 2000 chars | "Bio must be between 100-2000 characters" |
| `expertise_areas` | At least 1, max 10 | "Select 1-10 areas of expertise" |
| `hourly_rate` | >= 0, max 10,000,000 IDR | "Invalid hourly rate" |
| `years_experience` | >= 0, max 50 | "Experience must be 0-50 years" |
| `max_sessions_per_day` | 1-20 | "Sessions per day must be 1-20" |
| `buffer_time_minutes` | 0,5,10,15,30 | "Buffer time must be 0, 5, 10, 15, or 30 minutes" |

### 4.2 Availability Validation

| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| `start_time` | Must be < end_time | "Start time must be before end time" |
| `end_time` | Must be > start_time | "End time must be after start time" |
| `day_of_week` | 0-6 if recurring | "Invalid day of week" |
| `specific_date` | Cannot be in past | "Cannot set availability for past dates" |
| Time overlap | No overlapping slots | "Time slot overlaps with existing availability" |

### 4.3 Consultation Request Validation

| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| `topic` | Required, max 500 chars | "Please describe your consultation topic" |
| `description` | Min 50 chars, max 2000 | "Description must be 50-2000 characters" |
| `requested_date` | Must be >= today + 24h | "Must book at least 24 hours in advance" |
| `duration_minutes` | 30, 60, 90, 120 only | "Invalid duration. Choose 30, 60, 90, or 120 minutes" |
| Expert availability | Must be within expert's available slots | "Expert is not available at this time" |
| Payment | If paid, payment must be completed | "Payment required to confirm booking" |

### 4.4 Session Validation

| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| `started_at` | Cannot start before scheduled time - 10min | "Session cannot start more than 10 min early" |
| `actual_duration_minutes` | Max 200% of scheduled duration | "Session duration exceeds maximum allowed" |
| `client_visible_notes` | Max 5000 chars | "Notes too long (max 5000 characters)" |
| File upload | Max 50MB per file | "File size exceeds  50MB limit" |
| File type | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP only | "Invalid file type" |

### 4.5 Review Validation

| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| `overall_rating` | Required, 1-5 | "Please provide an overall rating" |
| `comment` | Max 1000 chars | "Review comment too long" |
| Timing | Can only review after session completed | "Can only review completed sessions" |
| One review per session | User can only review once | "You have already reviewed this session" |

### 4.6 Business Logic Validation

**Booking Conflicts:**
```
- Expert cannot have overlapping sessions
- Client cannot book multiple sessions at same time
- Blocked dates cannot be booked
- Past dates cannot be booked
```

**Cancellation Rules:**
```
- Can cancel up to 12 hours before session: Full refund
- Cancel 6-12 hours before: 50% refund
- Cancel <6 hours before: No refund
- Expert cancellation: Full refund + compensation
```

**Reschedule Rules:**
```
- Can reschedule up to 24 hours before
- Max 2 reschedules per booking
- Both parties must approve reschedule
```

---

## 5. ROLE-BASED ACCESS CONTROL (RBAC)

### 5.1 Permission Taxonomy

**Consultation Permissions:**
```
consultation:
├── expert:
│   ├── view_own_profile
│   ├── edit_own_profile
│   ├── view_requests
│   ├── accept_request
│   ├── reject_request
│   ├── reschedule_request
│   ├── manage_availability
│   ├── view_sessions
│   ├── create_session_notes
│   ├── upload_files
│   ├── view_earnings
│   └── reply_to_reviews
├── client:
│   ├── browse_experts
│   ├── create_request
│   ├── cancel_request
│   ├── request_reschedule
│   ├── view_own_sessions
│   ├── download_files
│   ├── create_review
│   └── view_history
└── admin:
    ├── view_all_experts
    ├── approve_expert
    ├── suspend_expert
    ├── view_all_requests
    ├── view_all_sessions
    ├── moderate_reviews
    ├── handle_disputes
    ├── manage_payouts
    ├── view_analytics
    ├── export_reports
    └── process_gdpr_requests
```

### 5.2 Role Definitions

| Role | Inherits From | Description | Key Permissions |
|------|--------------|-------------|-----------------|
| `consultation_client` | `user` | UMKM seeking advice | browse, book, review |
| `consultation_expert` | `user` | Business consultant | manage profile, conduct sessions |
| `consultation_admin` | `admin` | System administrator | Full oversight |
| `consultation_moderator` | `admin` | Content moderator | Review moderation only |
| `consultation_finance` | `admin` | Finance team | View payments, process payouts |

### 5.3 Permission Matrix

| Action | Client | Expert | Admin | Finance | Moderator |
|--------|--------|--------|-------|---------|-----------|
| Browse experts | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create request | ✅ | ❌ | ✅ | ❌ | ❌ |
| Accept/reject request | ❌ | ✅ | ✅ | ❌ | ❌ |
| Manage own availability | ❌ | ✅ | ✅ | ❌ | ❌ |
| View all sessions | ❌ | ❌ | ✅ | ❌ | ❌ |
| Create session notes | ❌ | ✅ | ✅ | ❌ | ❌ |
| Submit review | ✅ | ❌ | ✅ | ❌ | ❌ |
| Moderate reviews | ❌ | ❌ | ✅ | ❌ | ✅ |
| Approve experts | ❌ | ❌ | ✅ | ❌ | ❌ |
| View earnings | ❌ | ✅ (own) | ✅ (all) | ✅ (all) | ❌ |
| Process payouts | ❌ | ❌ | ✅ | ✅ | ❌ |
| Export data (GDPR) | ✅ (own) | ✅ (own) | ✅ (all) | ❌ | ❌ |

### 5.4 Row-Level Security Examples

```sql
-- Experts can only view their own requests
CREATE POLICY expert_view_own_requests ON consultation_requests
    FOR SELECT
    USING (expert_id IN (
        SELECT id FROM expert_profiles WHERE user_id = current_user_id()
    ));

-- Clients can only view their own sessions
CREATE POLICY client_view_own_sessions ON consultation_sessions
    FOR SELECT
    USING (request_id IN (
        SELECT id FROM consultation_requests WHERE client_id = current_user_id()
    ));

-- Admins can view everything
CREATE POLICY admin_view_all ON consultation_sessions
    FOR SELECT
    USING (has_permission(current_user_id(), 'consultation.admin.view_all_sessions'));
```

---

## 6. API CONTRACT OUTLINE

### 6.1 API Structure

**Base URL:** `/api/v1/consultation`

**Authentication:** All endpoints require JWT token (except public browse)

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-18T10:00:00Z",
    "version": "1.0"
  },
  "error": null
}
```

### 6.2 Expert Endpoints

#### Expert Profile

```
POST   /experts/profile
GET    /experts/profile/:id
PATCH  /experts/profile
DELETE /experts/profile
GET    /experts/public (public, list approved experts)
GET    /experts/search (public, filter/search)
```

**Example: Create Profile**
```http
POST /api/v1/consultation/experts/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Senior Marketing Consultant",
  "tagline": "15 years helping SMEs grow through digital marketing",
  "bio": "...",
  "expertise_areas": ["Marketing", "Digital Strategy", "Branding"],
  "industries": ["F&B", "Retail"],
  "hourly_rate": 500000,
  "packages": [
    {
      "name": "Quick Consult",
      "duration": 30,
      "price": 250000,
      "description": "30-min strategy session"
    }
  ],
  "certifications": [...],
  "profile_photo": <file>
}
```

#### Availability Management

```
GET    /experts/availability
POST   /experts/availability
PATCH  /experts/availability/:id
DELETE /experts/availability/:id
POST   /experts/availability/block-dates
```

**Example: Set Availability**
```http
POST /api/v1/consultation/experts/availability

{
  "is_recurring": true,
  "day_of_week": 1, // Monday
  "start_time": "09:00",
  "end_time": "17:00",
  "timezone": "Asia/Jakarta"
}
```

### 6.3 Client Endpoints

#### Browsing

```
GET /experts (list with filters)
GET /experts/:id (detail)
GET /experts/:id/reviews
GET /experts/:id/availability
```

**Example: Browse Experts**
```http
GET /api/v1/consultation/experts?expertise=Marketing&min_rating=4&max_price=1000000&available_on=2025-12-20

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Senior Marketing Consultant",
      "expertise_areas": ["Marketing", "Digital"],
      "average_rating": 4.8,
      "total_reviews": 45,
      "hourly_rate": 500000,
      "is_accepting_new_clients": true,
      "next_available": "2025-12-20T10:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10
  }
}
```

#### Booking

```
POST   /requests
GET    /requests (my requests)
GET    /requests/:id
PATCH  /requests/:id (update topic/notes)
DELETE /requests/:id (cancel)
POST   /requests/:id/reschedule
GET    /requests/:id/status
```

**Example: Create Request**
```http
POST /api/v1/consultation/requests

{
  "expert_id": "uuid",
  "consultation_type_id": "uuid",
  "requested_date": "2025-12-25",
  "requested_start_time": "10:00",
  "duration_minutes": 60,
  "topic": "Need help with Instagram marketing strategy",
  "description": "My business is...",
  "urgency": "normal",
  "uploaded_files": ["file_id_1", "file_id_2"]
}
```

#### Sessions

```
GET /sessions (my sessions)
GET /sessions/:id
GET /sessions/:id/files
POST /sessions/:id/upload
```

#### Reviews

```
POST /sessions/:id/review
GET /sessions/:id/review
PATCH /reviews/:id
```

### 6.4 Expert Request Management

```
GET    /expert/requests (incoming requests)
GET    /expert/requests/:id
POST   /expert/requests/:id/accept
POST   /expert/requests/:id/reject
POST   /expert/requests/:id/propose-time
```

**Example: Accept Request**
```http
POST /api/v1/consultation/expert/requests/:id/accept

{
  "meeting_url": "https://zoom.us/j/123456",
  "preparation_notes": "Please review the attached slides before our session"
}
```

### 6.5 Session Management

```
GET    /expert/sessions
POST   /sessions/:id/start
POST   /sessions/:id/complete
POST   /sessions/:id/notes
POST   /sessions/:id/action-items
```

**Example: Complete Session**
```http
POST /api/v1/consultation/sessions/:id/complete

{
  "client_visible_notes": "We discussed...",
  "action_items": [
    {
      "task": "Create Instagram content calendar",
      "due_date": "2026-01-05",
      "priority": "high"
    }
  ],
  "key_takeaways": [
    "Focus on reels for engagement",
    "Post 3x per week minimum"
  ],
  "was_successful": true,
  "follow_up_needed": true,
  "follow_up_date": "2026-01-15"
}
```

### 6.6 Admin Endpoints

```
GET    /admin/experts (all)
POST   /admin/experts/:id/approve
POST   /admin/experts/:id/reject
POST   /admin/experts/:id/suspend
GET    /admin/requests (all)
GET    /admin/sessions (all)
GET    /admin/reviews (pending moderation)
POST   /admin/reviews/:id/approve
POST   /admin/reviews/:id/reject
GET    /admin/analytics
POST   /admin/payouts/process
```

### 6.7 Payment Integration Points

**Note:** Payment is a separate module, but consultation needs these hooks:

```
POST   /requests/:id/payment/create
GET    /requests/:id/payment/status
POST   /requests/:id/payment/refund
GET    /expert/earnings
GET    /expert/payouts
POST   /expert/payouts/request
```

### 6.8 GDPR Endpoints

```
GET    /gdpr/export (request data export)
POST   /gdpr/delete (request account deletion)
GET    /gdpr/requests/:id/status
GET    /gdpr/requests/:id/download
```

---

## 7. PAYMENT INTEGRATION DESIGN

### 7.1 Payment Flow

```
Client books consultation
    ↓
If consultation_type.base_price > 0:
    ↓
Create payment intent
    ↓
Redirect to payment gateway (Midtrans/Xendit)
    ↓
Payment successful → Update request status to 'payment_confirmed'
    ↓
Payment failed → Request status remains 'pending_payment'
    ↓
After 24h: Auto-cancel unpaid requests
```

### 7.2 Payment Table (Separate Module)

```sql
CREATE TABLE consultation_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_request_id UUID UNIQUE NOT NULL REFERENCES consultation_requests(id),
    
    -- Amount
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2), -- e.g., 10% commission
    expert_payout DECIMAL(10,2), -- amount - platform_fee
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Gateway
    payment_gateway VARCHAR(50), -- midtrans, xendit, stripe
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', 
    -- pending, processing, completed, failed, refunded
    
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7.3 Payout Table

```sql
CREATE TABLE expert_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id),
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Amounts
    total_sessions INT,
    gross_earnings DECIMAL(10,2),
    platform_fees DECIMAL(10,2),
    net_payout DECIMAL(10,2),
    
    -- Payout Details
    payout_method VARCHAR(50), -- bank_transfer, paypal, etc.
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(100),
    account_holder_name VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', 
    -- pending, processing, completed, failed
    
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. GDPR COMPLIANCE FEATURES

### 8.1 Data Subject Rights

**Right to Access:**
- Endpoint: `GET /gdpr/export`
- Generates JSON export of all user data
- Includes: profile, requests, sessions, reviews, payments
- Expires after 7 days

**Right to be Forgotten:**
- Endpoint: `POST /gdpr/delete`
- Soft delete: Mark records as `deleted`
- Hard delete after 30-day grace period
- Cannot delete if active unpaid sessions exist

**Right to Rectification:**
- Users can edit own data via profile endpoints
- Audit log tracks all changes

**Right to Data Portability:**
- Export format: JSON (machine-readable)
- Download link valid for 7 days

### 8.2 Data Retention Policy

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Active expert profiles | Indefinite | Business requirement |
| Inactive expert profiles | 2 years | Re-activation possibility |
| Completed sessions | 5 years | Legal/tax requirements |
| Session files | 1 year | Storage cost optimization |
| Payment records | 7 years | Tax compliance (Indonesia) |
| Audit logs | 3 years | Security compliance |
| Deleted user data | 30 days (soft delete) | Grace period for recovery |

### 8.3 Consent Management

```sql
ALTER TABLE expert_profiles ADD COLUMN data_retention_consent BOOLEAN DEFAULT true;
ALTER TABLE expert_profiles ADD COLUMN marketing_consent BOOLEAN DEFAULT false;

-- Consent audit trail
CREATE TABLE consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    consent_type VARCHAR(50), -- data_retention, marketing, analytics
    granted BOOLEAN,
    granted_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

---

## 9. AUDIT LOGGING REQUIREMENTS

### 9.1 Events to Log

**Expert Profile Events:**
- Profile created
- Profile updated (track field changes)
- Profile approved/rejected
- Profile suspended

**Request Events:**
- Request created
- Request accepted/rejected
- Request rescheduled
- Request cancelled (by whom)
- Payment completed

**Session Events:**
- Session started
- Session completed
- Notes added
- Files uploaded/downloaded

**Review Events:**
- Review submitted
- Review moderated
- Expert response added

### 9.2 Audit Log Schema

```sql
CREATE TABLE consultation_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What
    entity_type VARCHAR(50) NOT NULL, -- expert_profile, request, session, review
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- created, updated, deleted, approved, etc.
    
    -- Who
    actor_id UUID REFERENCES users(id),
    actor_role VARCHAR(50), -- client, expert, admin, system
    
    -- When
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- How
    ip_address INET,
    user_agent TEXT,
    
    -- Details
    old_values JSONB,
    new_values JSONB,
    metadata JSONB -- Additional context
);

CREATE INDEX idx_audit_entity ON consultation_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON consultation_audit_logs(created_at DESC);
```

---

## 10. REPORTING STRUCTURE

### 10.1 Key Metrics

**Platform Metrics:**
- Total active experts
- Total consultations conducted
- Total revenue
- Average session rating
- Session completion rate

**Expert Metrics:**
- Sessions per expert (this month)
- Earnings per expert
- Average rating per expert
- Response time to requests
- Cancellation rate

**Client Metrics:**
- Repeat booking rate
- Client satisfaction score
- Most requested expertise areas
- Geographic distribution

### 10.2 Report Types

**Executive Dashboard:**
```sql
-- Real-time KPIs
SELECT 
    COUNT(DISTINCT expert_id) as total_experts,
    COUNT(*) FILTER (WHERE status = 'approved') as active_requests,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
    AVG(overall_rating) as avg_rating,
    SUM(quoted_price) as total_revenue
FROM consultation_requests cr
LEFT JOIN consultation_sessions cs ON cs.request_id = cr.id
LEFT JOIN consultation_reviews rv ON rv.session_id = cs.id
WHERE cr.created_at >= NOW() - INTERVAL '30 days';
```

**Expert Performance Report:**
```sql
SELECT 
    ep.user_id,
    u.full_name,
    COUNT(DISTINCT cr.id) as total_sessions,
    AVG(cs.actual_duration_minutes) as avg_duration,
    AVG(cr.quoted_price) as avg_price,
    SUM(cr.quoted_price) as total_earnings,
    AVG(rv.overall_rating) as avg_rating,
    COUNT(rv.id) as total_reviews
FROM expert_profiles ep
JOIN users u ON u.id = ep.user_id
LEFT JOIN consultation_requests cr ON cr.expert_id = ep.id
LEFT JOIN consultation_sessions cs ON cs.request_id = cr.id
LEFT JOIN consultation_reviews rv ON rv.session_id = cs.id
WHERE cr.status = 'completed'
GROUP BY ep.user_id, u.full_name
ORDER BY total_earnings DESC;
```

---

## 11. SCALABILITY CONSIDERATIONS

### 11.1 Database Optimization

**Indexing Strategy:**
- Index on foreign keys (expert_id, client_id)
- Composite index on (requested_date, status) for upcoming sessions
- GIN index on expertise_areas for expert search
- Index on average_rating for sorting

**Partitioning:**
- Partition consultation_requests by requested_date (monthly partitions)
- Partition audit_logs by created_at (quarterly partitions)

**Caching:**
- Cache expert profiles (Redis, TTL 1 hour)
- Cache availability schedules (Redis, TTL 15 minutes)
- Cache review aggregations (Redis, invalidate on new review)

### 11.2 API Rate Limiting

| Endpoint | Rate Limit | Reason |
|----------|-----------|--------|
| /experts (public) | 100/hour | Prevent scraping |
| /requests (create) | 10/hour | Prevent spam |
| /reviews (create) | 5/hour | Prevent abuse |
| /expert/availability | 60/hour | Frequent updates allowed |
| /admin/* | No limit | Trusted users |

### 11.3 File Storage

**Strategy:** Use cloud storage (AWS S3 / Google Cloud Storage)
- Session files stored in S3
- Generate presigned URLs for downloads
- Set lifecycle policy: Delete files after 1 year

---

## 12. NOTIFICATION SYSTEM

### 12.1 Notification Triggers

| Event | Recipient | Channel | Timing |
|-------|-----------|---------|--------|
| Request created | Expert | Email + In-app | Immediate |
| Request approved | Client | Email + In-app | Immediate |
| Request rejected | Client | Email + In-app | Immediate |
| Session reminder | Both | Email + SMS | 24h + 1h before |
| Session completed | Client | Email | After expert marks complete |
| Review submitted | Expert | In-app | Immediate |
| Payout processed | Expert | Email | When admin processes |

### 12.2 Email Templates

**Request Confirmation (Client):**
```
Subject: Consultation Request Submitted - [Expert Name]

Hi [Client Name],

Your consultation request has been submitted to [Expert Name].

Details:
- Topic: [Topic]
- Date: [Date] at [Time]
- Duration: [Duration] minutes
- Price: Rp [Price]

The expert will review your request within 24 hours.

Track status: [Link]
```

**Session Reminder:**
```
Subject: Reminder: Consultation with [Name] in 1 hour

Your consultation is starting soon!

Join link: [Meeting URL]
Time: [Time]
Expert/Client: [Name]

Prepare by reviewing: [Preparation notes]
```

---

## 13. FUTURE ENHANCEMENTS

### 13.1 Phase 2 Features

1. **Recurring Consultations**
   - Clients can book monthly/weekly sessions
   - Auto-scheduling based on expert availability
   - Subscription pricing model

2. **Group Consultations**
   - Expert can host group sessions (e.g., webinars)
   - Multiple clients per session
   - Discounted pricing

3. **Consultation Packages**
   - Bundle of sessions (e.g., "3-month growth program")
   - Milestone tracking
   - Long-term engagement

4. **AI Matching**
   - Recommend experts based on client needs
   - Machine learning on successful matches
   - Expertise score calculation

5. **Video Call Integration**
   - Embedded video calls (no external Zoom)
   - In-app recording
   - Live transcription

---

## CONCLUSION

This Consultation Hub design is:

✅ **Fully Independent** - Zero coupling with LMS  
✅ **Scalable** - Partitioning, caching, cloud storage ready  
✅ **GDPR-Compliant** - Data export, deletion, consent tracking  
✅ **Audit-Ready** - Comprehensive logging of all actions  
✅ **Payment-Ready** - Modular integration points defined  
✅ **Production-Ready** - Complete schema, API, validation rules  

**Next Steps:**
1. Review and approve this design
2. Create database migration scripts
3. Implement backend API (Phase 1: Core features)
4. Implement frontend UI
5. Integrate payment gateway
6. Launch beta with limited experts

---

**Document End**

**Status:** ✅ **READY FOR IMPLEMENTATION**
