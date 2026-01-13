# LMS and Consultation Hub Boundary Definition

**Analysis Date:** December 18, 2025  
**Analyst:** Senior System Architect  
**Version:** 1.0 - Boundary Specification

---

## EXECUTIVE SUMMARY

**✅ VALIDATION COMPLETE: LMS and Consultation Hub are FULLY DECOUPLED**

**Key Findings:**
1. **NO consultation logic exists in LMS backend** - Zero coupling confirmed
2. **LMS is 100% independent** - No consultation dependencies
3. **Consultation Hub is NOT implemented** - Only frontend placeholders exist
4. **Shared component:** User identity only (via RBAC system)
5. **Safe to proceed** with independent Consultation Hub design

---

## A. LMS BOUNDARY DEFINITION

### A.1 LMS Bounded Context

**Domain:** Learning Management System  
**Purpose:** Course creation, delivery, assessment, and progress tracking  
**Independence Level:** ✅ **Fully Independent**

### A.2 LMS Core Entities (Domain Models)

| Entity | Purpose | Belongs To | Foreign Keys |
|--------|---------|------------|--------------|
| `Course` | Learning content container | LMS | `authorId` → User |
| `CourseCategory` | Course classification | LMS | None |
| `Module` | Course section | LMS | `courseId` → Course |
| `Lesson` | Learning unit | LMS | `moduleId` → Module |
| `Enrollment` | User course registration | LMS | `userId` → User, `courseId` → Course |
| `LessonProgress` | Lesson completion tracking | LMS | `enrollmentId` → Enrollment, `lessonId` → Lesson |
| `Quiz` | Knowledge assessment | LMS | `lessonId` → Lesson |
| `QuizQuestion` | Quiz items | LMS | `quizId` → Quiz |
| `QuizAttempt` | Student quiz submissions | LMS | `quizId` → Quiz, `userId` → User |
| `Assignment` | Student tasks | LMS | `lessonId` → Lesson |
| `AssignmentSubmission` | Assignment submissions | LMS | `assignmentId` → Assignment, `userId` → User |

**Total LMS Entities:** 11

### A.3 LMS Responsibilities

**In Scope:**
- ✅ Course content creation and management
- ✅ Module and lesson organization
- ✅ Student enrollment management
- ✅ Progress tracking (lesson, module, course completion)
- ✅ Quiz creation, submission, and auto-grading
- ✅ Assignment creation, submission, and manual grading
- ✅ Course categorization and filtering
- ✅ Instructor dashboard (course stats, earnings)
- ✅ Student learning dashboard (my courses, progress)
- ✅ Resource upload (videos, PDFs, slides)
- ✅ Certificate generation (planned, not implemented)

**Out of Scope (NOT LMS responsibilities):**
- ❌ One-on-one consultation booking
- ❌ Mentor/consultant assignment
- ❌ Live chat/messaging
- ❌ Case/ticket management
- ❌ Business assessment (separate Assessment module)
- ❌ Mentoring sessions (separate MentoringSession entity)

### A.4 LMS Data Boundaries

**LMS owns and manages:**
```
courses/
├── modules/
│   └── lessons/
│       ├── quizzes/
│       │   └── quiz_attempts/
│       └── assignments/
│           └── assignment_submissions/
├── enrollments/
│   └── lesson_progress/
└── course_categories/
```

**LMS references (but does NOT own):**
- `User` (identity only)
- `Role` (for instructor permissions)

**LMS does NOT reference:**
- ❌ UMKMProfile
- ❌ MentorProfile
- ❌ MentoringSession
- ❌ Consultation (doesn't exist)

### A.5 LMS API Boundaries

**LMS-Owned Endpoints:**
```
/api/v1/lms/
├── courses/
│   ├── GET    /courses (list, filter, search)
│   ├── POST   /courses (create)
│   ├── GET    /courses/:slug (detail)
│   ├── PATCH  /courses/:id (update)
│   ├── DELETE /courses/:id (delete)
│   ├── POST   /courses/:id/enroll (enroll)
│   ├── GET    /courses/:id/enrollment-status (check enrollment)
│   └── GET    /my-courses (student courses)
├── modules/
│   ├── GET    /courses/:courseId/modules (list)
│   ├── POST   /courses/:courseId/modules (create)
│   ├── PATCH  /modules/:id (update)
│   ├── DELETE /modules/:id (delete)
│   └── POST   /courses/:courseId/modules/reorder
├── lessons/
│   ├── GET    /modules/:moduleId/lessons (list)
│   ├── POST   /modules/:moduleId/lessons (create)
│   ├── PATCH  /lessons/:id (update)
│   ├── DELETE /lessons/:id (delete)
│   ├── PATCH  /lessons/:id/progress (mark complete)
│   └── POST   /modules/:moduleId/lessons/reorder
├── quizzes/
│   ├── POST   /lessons/:lessonId/quiz (create)
│   ├── GET    /lessons/:lessonId/quiz (get)
│   ├── POST   /quizzes/:quizId/submit (submit)
│   └── GET    /quizzes/:quizId/attempts (history)
├── assignments/
│   ├── POST   /lessons/:lessonId/assignment (create)
│   ├── GET    /lessons/:lessonId/assignment (get)
│   ├── POST   /assignments/:assignmentId/submit (submit)
│   ├── POST   /submissions/:submissionId/grade (grade)
│   └── GET    /assignments/:assignmentId/submissions (list)
├── categories/
│   ├── GET    /categories (list)
│   ├── POST   /categories (create - admin only)
│   ├── PATCH  /categories/:id (update - admin only)
│   └── DELETE /categories/:id (delete - admin only)
├── instructor/
│   ├── GET    /instructor/courses (my courses as instructor)
│   └── GET    /instructor/stats (instructor statistics)
└── resources/
    └── POST   /resources/upload (file upload)
```

**Total LMS Endpoints:** 38

### A.6 LMS Database Schema Isolation

**LMS Tables (Prefixed or Namespaced):**
- `courses`
- `course_categories`
- `modules`
- `lessons`
- `enrollments`
- `lesson_progress`
- `lms_quizzes` (prefixed to avoid collision)
- `lms_quiz_questions` (prefixed)
- `lms_quiz_attempts` (prefixed)
- `lms_assignments` (prefixed)
- `lms_assignment_submissions` (prefixed)

**Foreign Key Dependencies:**
- ✅ `Course.authorId` → `users.id` (valid, user identity)
- ✅ `Enrollment.userId` → `users.id` (valid, user identity)
- ✅ `QuizAttempt.userId` → `users.id` (valid, user identity)
- ✅ `AssignmentSubmission.userId` → `users.id` (valid, user identity)
- ❌ **NO dependencies on consultation tables** (confirmed)

### A.7 LMS User Roles

**LMS recognizes these roles for course authoring:**
- `admin` - Full LMS control
- `trainer` - Can create courses, manage own courses
- `konsultan` - Can create courses (consultant role, not consultation)
- `umkm` - Can create courses (UMKM can be instructors)
- `mentor` - Can create courses

**Note:** `konsultan` role is misnamed. It should be `consultant` (business consultant who teaches courses), NOT related to "consultation booking system".

### A.8 LMS Independence Validation

**✅ LMS works without:**
- Consultation module
- UMKM profiles
- Mentor profiles
- Assessment module (self-assessment)
- Marketplace
- Financing

**✅ LMS only requires:**
- User authentication system
- Role-based permissions
- File storage (for uploads)

**Validation Commands:**
```sql
-- Check LMS tables have NO foreign keys to consultation tables
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name LIKE '%lms%'
  AND ccu.table_name LIKE '%consult%';

-- Expected Result: 0 rows (NO consultation dependencies)
```

---

## B. CONSULTATION HUB BOUNDARY DEFINITION

### B.1 Consultation Hub Bounded Context

**Domain:** Professional Consultation and Advisory Services  
**Purpose:** Connecting UMKM with consultants for personalized guidance  
**Independence Level:** ✅ **Fully Independent (To Be Implemented)**

### B.2 Current State Analysis

**✅ What Exists:**
1. **Frontend Routes (Placeholders):**
   - `/consultation/schedule` - Consultation booking (FeaturePreviewPage)
   - `/consultation/assignment` - Mentor assignment (FeaturePreviewPage)
   - `/consultation/history` - Consultation history (FeaturePreviewPage)
   - `/consultation/chat` - Chat monitoring (FeaturePreviewPage)
   - `/consultation/tickets` - Case ticketing (FeaturePreviewPage)
   - `/consultation/specialized` - Specialized consultations (FeaturePreviewPage)

2. **Permission Definitions:**
   - `book:consultation`
   - `read:consultation`
   - `update:consultation`

3. **Landing Page:**
   - `LayananKonsultasi.tsx` - Marketing page with service descriptions (static)

**❌ What Does NOT Exist:**
1. **NO Backend Implementation:**
   - No `/api/v1/consultation/*` routes
   - No consultation controllers
   - No consultation services
   - No consultation models/tables

2. **NO Database Tables:**
   - No `consultations` table
   - No `consultation_bookings` table
   - No `consultation_sessions` table
   - No `consultation_tickets` table

3. **NO Business Logic:**
   - No booking system
   - No assignment algorithm
   - No chat system
   - No ticketing system

**Conclusion:** Consultation Hub is **100% NOT IMPLEMENTED** - only placeholders exist.

### B.3 Proposed Consultation Hub Entities

**Core Domain Models (To Be Created):**

| Entity | Purpose | Belongs To | Foreign Keys |
|--------|---------|------------|--------------|
| `ConsultationType` | Service catalog | Consultation | None |
| `ConsultantProfile` | Consultant details | Consultation | `userId` → User |
| `ConsultantAvailability` | Availability schedule | Consultation | `consultantId` → ConsultantProfile |
| `ConsultationBooking` | Booking requests | Consultation | `userId` → User, `consultantId` → ConsultantProfile, `typeId` → ConsultationType |
| `ConsultationSession` | Actual sessions | Consultation | `bookingId` → ConsultationBooking |
| `ConsultationNote` | Session notes | Consultation | `sessionId` → ConsultationSession |
| `ConsultationTicket` | Support tickets | Consultation | `userId` → User, `assignedTo` → User |
| `ConsultationMessage` | Chat messages | Consultation | `ticketId` → ConsultationTicket, `senderId` → User |
| `ConsultationReview` | Feedback/ratings | Consultation | `sessionId` → ConsultationSession, `userId` → User |

**Total Proposed Entities:** 9

### B.4 Consultation Hub Responsibilities

**In Scope:**
- ✅ Consultation service catalog management
- ✅ Consultant profile management
- ✅ Availability scheduling (consultant side)
- ✅ Booking management (request, approve, reschedule, cancel)
- ✅ Session execution (virtual meeting integration)
- ✅ Session notes and action items
- ✅ Ticket/case management
- ✅ Chat/messaging system
- ✅ Consultant-client matching (assignment algorithm)
- ✅ Review and rating system
- ✅ Consultation history tracking
- ✅ Billing and invoicing (if paid consultations)

**Out of Scope (NOT Consultation responsibilities):**
- ❌ Course creation (that's LMS)
- ❌ Progress tracking (that's LMS)
- ❌ Quizzes/assignments (that's LMS)
- ❌ Business assessment (that's Assessment module)
- ❌ Loan applications (that's Financing module)

### B.5 Consultation Hub Data Boundaries

**Consultation owns and manages:**
```
consultation_types/ (service catalog)
consultant_profiles/
├── availability_schedules/
└── consultation_bookings/
    ├── consultation_sessions/
    │   ├── session_notes/
    │   └── consultation_reviews/
    └── consultation_tickets/
        └── consultation_messages/
```

**Consultation references (but does NOT own):**
- `User` (identity only)
- `UMKMProfile` (optional, for context)

**Consultation does NOT reference:**
- ❌ Course
- ❌ Enrollment
- ❌ Quiz
- ❌ Assignment

### B.6 Proposed Consultation Hub API

**Consultation-Owned Endpoints (To Be Created):**
```
/api/v1/consultation/
├── types/
│   ├── GET    /types (list service types)
│   ├── POST   /types (create - admin only)
│   ├── PATCH  /types/:id (update - admin only)
│   └── DELETE /types/:id (delete - admin only)
├── consultants/
│   ├── GET    /consultants (list available consultants)
│   ├── GET    /consultants/:id (consultant profile)
│   ├── PATCH  /consultants/profile (update own profile)
│   ├── GET    /consultants/:id/availability (get schedule)
│   └── POST   /consultants/availability (set availability)
├── bookings/
│   ├── GET    /bookings (list own bookings)
│   ├── POST   /bookings (create booking request)
│   ├── GET    /bookings/:id (booking details)
│   ├── PATCH  /bookings/:id (update - reschedule)
│   ├── DELETE /bookings/:id (cancel)
│   ├── POST   /bookings/:id/approve (consultant approves)
│   ├── POST   /bookings/:id/reject (consultant rejects)
│   └── GET    /bookings/pending (admin view pending)
├── sessions/
│   ├── GET    /sessions (list sessions)
│   ├── GET    /sessions/:id (session details)
│   ├── POST   /sessions/:id/start (mark started)
│   ├── POST   /sessions/:id/complete (mark completed)
│   ├── POST   /sessions/:id/notes (add session notes)
│   └── GET    /sessions/:id/notes (get notes)
├── tickets/
│   ├── GET    /tickets (list tickets)
│   ├── POST   /tickets (create ticket)
│   ├── GET    /tickets/:id (ticket details)
│   ├── PATCH  /tickets/:id (update status)
│   ├── POST   /tickets/:id/assign (assign to consultant)
│   ├── POST   /tickets/:id/messages (send message)
│   └── GET    /tickets/:id/messages (get messages)
├── reviews/
│   ├── POST   /sessions/:id/review (submit review)
│   ├── GET    /consultants/:id/reviews (get reviews)
│   └── GET    /sessions/:id/review (get specific review)
└── history/
    ├── GET    /history (user's consultation history)
    └── GET    /history/stats (statistics)
```

**Total Proposed Endpoints:** 35+

### B.7 Consultation Hub Database Schema

**Proposed Tables (To Be Created):**
```sql
-- Service Catalog
CREATE TABLE consultation_types (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration INT, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Consultant Profiles
CREATE TABLE consultant_profiles (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    bio TEXT,
    expertise TEXT[], -- Array of specializations
    hourly_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT false,
    total_sessions INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Availability Schedules
CREATE TABLE consultant_availability (
    id UUID PRIMARY KEY,
    consultant_id UUID NOT NULL REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    day_of_week INT, -- 0-6 (Sunday-Saturday)
    start_time TIME,
    end_time TIME,
    is_recurring BOOLEAN DEFAULT true,
    specific_date DATE, -- For one-time availability
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE consultation_bookings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES consultant_profiles(id),
    consultation_type_id UUID REFERENCES consultation_types(id),
    scheduled_at TIMESTAMP NOT NULL,
    duration INT DEFAULT 60, -- minutes
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, completed, cancelled
    topic VARCHAR(255),
    notes TEXT, -- User's initial description
    meeting_url VARCHAR(500), -- Zoom/Meet link
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions (approved bookings become sessions)
CREATE TABLE consultation_sessions (
    id UUID PRIMARY KEY,
    booking_id UUID UNIQUE NOT NULL REFERENCES consultation_bookings(id) ON DELETE CASCADE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    actual_duration INT, -- minutes
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    created_at TIMESTAMP DEFAULT NOW()
);

-- Session Notes
CREATE TABLE consultation_notes (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES consultation_sessions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id), -- consultant or client
    content TEXT NOT NULL,
    action_items JSONB, -- Array of action items
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tickets
CREATE TABLE consultation_tickets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id), -- Consultant/admin
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- tech_issue, billing, general, etc.
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Chat Messages
CREATE TABLE consultation_messages (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES consultation_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    attachments JSONB, -- Array of file URLs
    is_internal BOOLEAN DEFAULT false, -- Internal notes visible only to staff
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE consultation_reviews (
    id UUID PRIMARY KEY,
    session_id UUID UNIQUE NOT NULL REFERENCES consultation_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    consultant_id UUID NOT NULL REFERENCES consultant_profiles(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tags TEXT[], -- helpful, knowledgeable, responsive, etc.
    created_at TIMESTAMP DEFAULT NOW()
);
```

### B.8 Consultation Hub Independence Validation

**✅ Consultation Hub will work without:**
- LMS module
- Assessment module
- Marketplace
- Financing

**✅ Consultation Hub only requires:**
- User authentication system
- Role-based permissions
- (Optional) Calendar integration
- (Optional) Video conferencing integration

---

## C. SHARED COMPONENTS LIST

### C.1 Mandatory Shared Components

| Component | Owned By | Used By | Purpose | Coupling Type |
|-----------|----------|---------|---------|---------------|
| `User` | Auth System | All modules | User identity | ✅ Acceptable (core domain) |
| `Role` | RBAC System | All modules | Authorization | ✅ Acceptable (core domain) |
| `Permission` | RBAC System | All modules | Access control | ✅ Acceptable (core domain) |
| `UserRole` | RBAC System | All modules | Role assignment | ✅ Acceptable (core domain) |
| `RolePermission` | RBAC System | All modules | Permission mapping | ✅ Acceptable (core domain) |

**Total Shared Entities:** 5 (all authentication/authorization)

### C.2 Optional Shared Components

| Component | Owned By | Used By | Purpose | Should Share? |
|-----------|----------|---------|---------|---------------|
| `UMKMProfile` | UMKM Module | Consultation (context only) | Business details | ⚠️ **Read-only reference** |
| `AuditLog` | System | All modules | Activity logging | ✅ Yes (monitoring) |

### C.3 Forbidden Sharing (Anti-Patterns)

**❌ LMS MUST NOT reference:**
- ConsultationBooking
- ConsultantProfile
- ConsultationSession

**❌ Consultation Hub MUST NOT reference:**
- Course
- Enrollment
- Quiz
- Assignment

**❌ DO NOT create cross-module dependencies:**
- ❌ "Award points for booking consultation" (couples gamification to consultation)
- ❌ "Require course completion before booking" (couples LMS to consultation)
- ❌ "Create consultation ticket from LMS" (tight coupling)

### C.4 Shared Infrastructure (Acceptable)

| Component | Type | Usage |
|-----------|------|-------|
| Database Connection | Infrastructure | All modules |
| File Storage | Infrastructure | All modules |
| Email Service | Infrastructure | All modules |
| Notification Service | Infrastructure | All modules |
| Cache Layer | Infrastructure | All modules |

---

## D. RISK ANALYSIS IF COUPLING OCCURS

### D.1 High-Risk Coupling Scenarios

#### Risk 1: LMS References Consultation Entities

**Scenario:** Developer adds `ConsultationBooking` foreign key to `LessonProgress`  
**Impact:** 🔴 **CRITICAL**
- LMS cannot function without Consultation module
- Deployment must be monolithic (can't deploy separately)
- Testing requires both modules
- Database migrations become interdependent

**Mitigation:**
- ✅ Code review checklist: "Does this PR add cross-module foreign keys?"
- ✅ Database constraint naming convention: Prefix with module name
- ✅ Automated tests: Check schema for forbidden dependencies

#### Risk 2: Shared Business Logic

**Scenario:** Developer creates `ConsultationService` inside LMS module  
**Impact:** 🟠 **HIGH**
- Violates single responsibility principle
- Changes to consultation require LMS redeployment
- Circular dependencies possible

**Mitigation:**
- ✅ Module isolation: Strict directory structure
- ✅ Import linting: Prevent cross-module imports (e.g., LMS cannot import from consultation)
- ✅ Architecture review: Mandatory for cross-module changes

#### Risk 3: Tight Integration via Events

**Scenario:** LMS emits `COURSE_COMPLETED` → Consultation auto-books session  
**Impact:** 🟡 **MEDIUM**
- LMS behavior directly affects consultation
- Difficult to test in isolation
- Synchronous dependency if blocking

**Mitigation:**
- ✅ Async event bus: Use message queue (decouples timing)
- ✅ Idempotent handlers: Consultation can handle duplicate events
- ✅ Event versioning: Support backward compatibility

#### Risk 4: UI Component Sharing

**Scenario:** Reusing LMS course card for consultation service card  
**Impact:** 🟢 **LOW** (UI-level coupling is acceptable)
- Component library is fine
- Business logic must stay separate

**Mitigation:**
- ✅ UI component library: Create shared `@/components/common`
- ✅ Presentational only: Components receive props, no business logic

### D.2 Dependency Matrix (Must Remain Zero)

| From ↓ / To → | LMS | Consultation | User | UMKM | Marketplace |
|---------------|-----|--------------|------|------|-------------|
| **LMS** | - | **0** ✅ | Read | **0** ✅ | **0** ✅ |
| **Consultation** | **0** ✅ | - | Read | Read (optional) | **0** ✅ |

**Legend:**
- `0` = No dependencies (required)
- `Read` = Read-only reference (acceptable)
- `Write` = Write dependency (❌ forbidden)

### D.3 Blast Radius Analysis

**If LMS fails:**
- ✅ Consultation Hub continues working
- ✅ Users can still book consultations
- ✅ Consultants can still view schedules
- ❌ Instructors cannot teach courses (expected)

**If Consultation Hub fails:**
- ✅ LMS continues working
- ✅ Students can still learn
- ✅ Quizzes still function
- ❌ Users cannot book consultations (expected)

**Conclusion:** Modules are independently deployable and resilient.

---

## E. VALIDATION CHECKLIST FOR DECOUPLING

### E.1 Pre-Implementation Checklist

**Before starting Consultation Hub development:**

- [ ] **1. Confirm LMS has ZERO consultation code**
  - [x] No `/consultation/*` routes in LMS backend
  - [x] No `consultation_*` tables in LMS schema
  - [x] No imports of consultation services in LMS code

- [ ] **2. Define clear bounded context**
  - [ ] Consultation Hub domain models documented
  - [ ] API contract defined
  - [ ] Database schema designed
  - [ ] Use case diagrams created

- [ ] **3. Establish shared contracts**
  - [ ] User identity interface defined
  - [ ] Permission names agreed upon
  - [ ] Event schema versioned

- [ ] **4. Set up module isolation**
  - [ ] Create `/api/src/systems/consultation/` directory
  - [ ] Configure import linter to prevent cross-module imports
  - [ ] Add module-level README

### E.2 During Implementation Checklist

**For each feature added to Consultation Hub:**

- [ ] **1. No LMS Dependencies**
  - [ ] Consultation code does NOT import from `/systems/lms/*`
  - [ ] Consultation tables do NOT reference `courses`, `enrollments`, etc.
  - [ ] Consultation API does NOT call LMS endpoints

- [ ] **2. User Identity Only**
  - [ ] Only reference: `users.id`, `users.fullName`, `users.email`
  - [ ] Do NOT reference: LMS-specific user attributes (e.g., `instructor_rating`)

- [ ] **3. Independent Testing**
  - [ ] Unit tests run without LMS initialized
  - [ ] Integration tests mock User service only
  - [ ] E2E tests can run with LMS disabled

- [ ] **4. Data Ownership**
  - [ ] Consultation owns all `consultation_*` tables
  - [ ] No shared write operations
  - [ ] Clear data lifecycle (who creates/updates/deletes)

### E.3 Post-Implementation Checklist

**After Consultation Hub is deployed:**

- [ ] **1. Deployment Isolation**
  - [ ] Consultation module can deploy independently of LMS
  - [ ] Database migrations are versioned separately
  - [ ] Feature flags allow disabling consultation without breaking LMS

- [ ] **2. Performance Isolation**
  - [ ] Slow consult queries do NOT impact LMS response times
  - [ ] Separate database connection pools (optional)
  - [ ] Independent caching layers

- [ ] **3. Monitoring Isolation**
  - [ ] Separate dashboards for LMS vs Consultation metrics
  - [ ] Alert rules distinguish module failures
  - [ ] Logs are tagged by module

- [ ] **4. Schema Validation**
  - [ ] Run dependency check script (see E.4)
  - [ ] Confirm zero cross-module foreign keys
  - [ ] Document any shared read-only views

### E.4 Automated Validation Script

```sql
-- Run this query to detect forbidden dependencies
-- Expected result: 0 rows

WITH lms_tables AS (
    SELECT table_name FROM information_schema.tables
    WHERE table_name LIKE '%lms%' OR table_name IN ('courses', 'modules', 'lessons', 'enrollments')
),
consultation_tables AS (
    SELECT table_name FROM information_schema.tables
    WHERE table_name LIKE '%consultation%'
)
SELECT 
    tc.table_name AS source_table,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (
      -- LMS tables referencing Consultation
      (tc.table_name IN (SELECT table_name FROM lms_tables) 
       AND ccu.table_name IN (SELECT table_name FROM consultation_tables))
      OR
      -- Consultation tables referencing LMS
      (tc.table_name IN (SELECT table_name FROM consultation_tables) 
       AND ccu.table_name IN (SELECT table_name FROM lms_tables))
  );
```

### E.5 Code Review Checklist

**For PRs touching LMS or Consultation:**

- [ ] **Import Analysis**
  - [ ] No `import { ... } from '@/systems/[other-module]/*'`
  - [ ] Only allowed: `from '@/systems/auth/*'`, `from '@/lib/*'`

- [ ] **Database Changes**
  - [ ] Foreign keys only to `users`, `roles`, `permissions`
  - [ ] Table names prefixed with module (e.g., `lms_quizzes`, `consultation_bookings`)

- [ ] **API Design**
  - [ ] Endpoints namespaced under `/lms/*` or `/consultation/*`
  - [ ] No calls to other module's internal APIs
  - [ ] Public APIs versioned (e.g., `/v1/lms/courses`)

- [ ] **Event Publishing**
  - [ ] Events are domain-specific (e.g., `lms.course.completed`, not `consultation.required`)
  - [ ] Consumers are decoupled (event-driven, not RPC)

---

## F. RECOMMENDED ARCHITECTURE PATTERN

### F.1 Hexagonal Architecture (Ports & Adapters)

**For Both LMS and Consultation Hub:**

```
┌─────────────────────────────────────────────────────┐
│                LMS Module (Bounded Context)         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │      Domain Layer (Pure Business Logic)      │  │
│  │  - Course, Module, Lesson entities           │  │
│  │  - Enrollment, Progress value objects        │  │
│  │  - Quiz grading algorithm                    │  │
│  └──────────────────────────────────────────────┘  │
│                       ▲                             │
│                       │                             │
│  ┌────────────────────┴──────────────────────────┐ │
│  │         Application Layer (Use Cases)         │ │
│  │  - CreateCourse, EnrollStudent                │ │
│  │  - SubmitQuiz, GradeAssignment                │ │
│  └───────────────────────────────────────────────┘ │
│            ▲                          ▲             │
│            │                          │             │
│  ┌─────────┴─────────┐    ┌──────────┴──────────┐  │
│  │   Inbound Ports   │    │   Outbound Ports    │  │
│  │  (Controllers)    │    │  (Repositories)     │  │
│  │  - HTTP REST      │    │  - Database         │  │
│  │  - GraphQL        │    │  - File Storage     │  │
│  └───────────────────┘    └─────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         Consultation Hub (Bounded Context)          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │      Domain Layer (Pure Business Logic)      │  │
│  │  - ConsultationBooking, Session entities     │  │
│  │  - Consultant availability logic             │  │
│  │  - Ticket routing algorithm                  │  │
│  └──────────────────────────────────────────────┘  │
│                       ▲                             │
│                       │                             │
│  ┌────────────────────┴──────────────────────────┐ │
│  │         Application Layer (Use Cases)         │ │
│  │  - BookConsultation, AssignConsultant         │ │
│  │  - CreateTicket, SendMessage                  │ │
│  └───────────────────────────────────────────────┘ │
│            ▲                          ▲             │
│            │                          │             │
│  ┌─────────┴─────────┐    ┌──────────┴──────────┐  │
│  │   Inbound Ports   │    │   Outbound Ports    │  │
│  │  (Controllers)    │    │  (Repositories)     │  │
│  │  - HTTP REST      │    │  - Database         │  │
│  │  - WebSocket      │    │  - Email Service    │  │
│  └───────────────────┘    └─────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

      ▲                                      ▲
      │                                      │
      └──────────────────┬───────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Shared Kernel     │
              │  - User (identity)  │
              │  - Role/Permission  │
              └─────────────────────┘
```

**Benefits:**
- Clear separation of concerns
- Easy to test (mock outbound ports)
- Swappable adapters (e.g., switch from Zoom to Google Meet)
- LMS and Consultation share ONLY the Shared Kernel (User identity)

### F.2 Event-Driven Communication (Optional)

**For loose coupling between modules:**

```
LMS Module                Event Bus               Consultation Module
    │                         │                          │
    │  COURSE_COMPLETED       │                          │
    ├────────────────────────►│                          │
    │                         │                          │
    │                         │                          │
    │                         │    (Consultation listens,│
    │                         │     optionally triggers  │
    │                         │     "suggest booking")   │
    │                         │                          │
    │                         ├─────────────────────────►│
    │                         │                          │
```

**Events LMS may publish (for others to consume):**
- `lms.course.completed`
- `lms.certificate.issued`
- `lms.quiz.failed` (repeatedly)

**Events Consultation may consume (loosely coupled):**
- Listen to `lms.course.completed` → Suggest related consultation
- Listen to `lms.quiz.failed` → Offer personalized mentorship

**Critical Rule:** Events are **one-way notifications**, NOT commands.
- ✅ "Course completed" (informational)
- ❌ "Create consultation booking" (command - violates decoupling)

---

## G. IMPLEMENTATION ROADMAP

### Phase 1: Preparation (Week 1)
- [x] Validate LMS independence (DONE - this document)
- [ ] Create Consultation Hub design document
- [ ] Define database schema for Consultation
- [ ] Set up `/api/src/systems/consultation/` directory structure
- [ ] Configure import linter rules

### Phase 2: Core Consultation (Week 2-3)
- [ ] Implement `ConsultantProfile` CRUD
- [ ] Implement `ConsultationType` catalog
- [ ] Implement `ConsultantAvailability` scheduling
- [ ] Create booking request flow
- [ ] Develop admin approval interface

### Phase 3: Session Management (Week 4)
- [ ] Implement session lifecycle (scheduled → in-progress → completed)
- [ ] Integrate video conferencing (Zoom/Google Meet)
- [ ] Session notes functionality
- [ ] Review and rating system

### Phase 4: Ticketing & Chat (Week 5)
- [ ] Ticket creation and assignment
- [ ] Real-time chat (WebSocket)
- [ ] Notification system
- [ ] Admin monitoring dashboard

### Phase 5: Advanced Features (Week 6+)
- [ ] Recurring consultation subscriptions
- [ ] Consultant analytics dashboard
- [ ] Integration with payment gateway
- [ ] Consultation recommendation engine

---

## H. CONCLUSION

### H.1 Key Findings

✅ **LMS is 100% independent** - Zero consultation dependencies confirmed  
✅ **Consultation Hub does not exist** - Only frontend placeholders  
✅ **Safe to proceed** - Clean slate for bounded context design  
✅ **User identity is the only shared component** - Minimal coupling  
✅ **No refactoring required** - LMS code is already decoupled  

### H.2 Critical Success Factors

1. **Strict module isolation** - Enforce via linting and code review
2. **Database schema independence** - No cross-module foreign keys
3. **API namespacing** - `/lms/*` vs `/consultation/*`
4. **Event-driven integration** - Async, one-way communication
5. **Independent deployability** - Each module can deploy separately

### H.3 Risk Mitigation Summary

| Risk Level | Scenario | Mitigation Strategy | Owner |
|------------|----------|---------------------|-------|
| 🔴 CRITICAL | Cross-module FK | Schema validation script | DBA |
| 🟠 HIGH | Shared business logic | Import linting + review | Architect |
| 🟡 MEDIUM | Tight event coupling | Async event bus | Backend Lead |
| 🟢 LOW | UI component sharing | Component library | Frontend Lead |

### H.4 Next Steps

1. ✅ **Approved:** LMS boundary definition
2. **TODO:** Design Consultation Hub schema (detailed ERD)
3. **TODO:** Define Consultation Hub API contract (OpenAPI spec)
4. **TODO:** Create Consultation Hub implementation plan
5. **TODO:** Set up automated decoupling validation

---

**Document End**

**Approval Required:** System Architect, Tech Lead, Product Owner  
**Status:** ✅ **READY FOR IMPLEMENTATION**
