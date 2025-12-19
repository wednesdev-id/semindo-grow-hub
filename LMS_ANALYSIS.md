# LMS System Analysis & Feature Inventory

**Repository:** Semindo UMKM Growth Hub  
**Analysis Date:** December 18, 2025  
**Analyst:** Senior Product Engineer & System Architect

---

## A. FEATURE INVENTORY TABLE

| Feature Category | Feature | Status | Implementation Level | Missing/Issues |
|-----------------|---------|--------|---------------------|----------------|
| **Course Management** | Create Course | ✅ Implemented | Full | None |
| | Update Course | ✅ Implemented | Full | None |
| | Delete Course | ✅ Implemented | Full | None |
| | View Courses (List) | ✅ Implemented | Full | None |
| | View Course Details | ✅ Implemented | Full | None |
| | Course Filtering (category, level, search) | ✅ Implemented | Full | None |
| | Course Categories | ✅ Implemented | Full (CRUD) | None |
| | Course Slugs (URL-friendly) | ✅ Implemented | Full | None |
| | Course Thumbnails | ✅ Implemented | Schema only | Upload UI needed |
| | Course Pricing | ✅ Implemented | Schema only | Payment integration needed |
| | Publish/Unp publish Course | ✅ Implemented | Full | None |
| **Module Management** | Create Module | ✅ Implemented | Full | None |
| | Update Module | ✅ Implemented | Full | None |
| | Delete Module | ✅ Implemented | Full | None |
| | Module Ordering | ✅ Implemented | Full | None |
| | Module Reordering | ✅ Implemented | Full | None |
| **Lesson Management** | Create Lesson | ✅ Implemented | Full | None |
| | Update Lesson | ✅ Implemented | Full | None |
| | Delete Lesson | ✅ Implemented | Full | None |
| | Lesson Types (video, pdf, slide, link, article) | ✅ Implemented | Full | None |
| | Lesson Ordering | ✅ Implemented | Full | None |
| | Lesson Reordering | ✅ Implemented | Full | None |
| | Free Preview Lessons | ✅ Implemented | Full | None |
| | Lesson Attachments | ✅ Implemented | Schema only | UI/Upload flow needed |
| | Lesson Duration | ✅ Implemented | Schema only | Not tracked/enforced |
| **Enrollment** | Enroll in Course | ✅ Implemented | Full | None |
| | Check Enrollment Status | ✅ Implemented | Full | None |
| | View My Courses | ✅ Implemented | Full | None |
| | Enrollment Progress Tracking | ✅ Implemented | Full | Auto-calculation working |
| | Unenroll from Course | ❌ Missing | None | Feature not implemented |
| **Progress Tracking** | Lesson Completion Tracking | ✅ Implemented | Full | None |
| | Course Progress Percentage | ✅ Implemented | Full | Auto-calculated |
| | Last Watched Position | ✅ Implemented | Schema only | Frontend integration needed |
| | Completion Timestamps | ✅ Implemented | Full | None |
| | Course Completion Detection | ⚠️ Partial | Logic exists | No completion certificate trigger |
| **Quiz System** | Create Quiz | ✅ Implemented | Full | None |
| | Quiz Questions (multiple types) | ✅ Implemented | Full | None |
| | Quiz Time Limits | ✅ Implemented | Schema only | Frontend timer needed |
| | Passing Score Configuration | ✅ Implemented | Full | None |
| | Submit Quiz | ✅ Implemented | Full | Auto-grading works |
| | Quiz Attempts History | ✅ Implemented | Full | None |
| | Quiz Auto-grading | ✅ Implemented | Partial | Only MCQ/Boolean, not text |
| | Quiz Pass/Fail Logic | ✅ Implemented | Full | Updates lesson progress |
| **Assignment System** | Create Assignment | ✅ Implemented | Full | None |
| | Assignment Due Dates | ✅ Implemented | Schema only | No deadline enforcement |
| | Submit Assignment (file/text) | ✅ Implemented | Full | None |
| | Grade Assignment | ✅ Implemented | Full | Manual grading |
| | Assignment Feedback | ✅ Implemented | Full | None |
| | View Submissions (instructor) | ✅ Implemented | Full | None |
| | Assignment Pass Threshold | ⚠️ Partial | Hardcoded 70% | Should be configurable |
| **Instructor Features** | View Instructor Courses | ✅ Implemented | Full | None |
| | Instructor Statistics | ✅ Implemented | Full | None |
| | Commission Calculation | ✅ Implemented | Backend only | Frontend display needed |
| | Course Earnings Tracking | ❌ Missing | None | No payment integration |
| **Admin Features** | Admin Stats Dashboard | ⚠️ Partial | Mock data | Real backend needed |
| | Module List View (admin) | ⚠️ Partial | Mock data | Real backend needed |
| | User Enrollment Management | ❌ Missing | None | Admin can't manage enrollments |
| **Certification** | Certificate Generation | ❌ Missing | None | No implementation |
| | Certificate Templates | ❌ Missing | None | No implementation |
| | Certificate Validation | ❌ Missing | None | No implementation |
| **Resource Management** | File Upload | ✅ Implemented | Full | 100MB limit |
| | Supported Formats | ✅ Implemented | Full | images, pdf, mp4, webm |
| | Resource Storage | ✅ Implemented | Local filesystem | Cloud storage recommended |

---

## B. DATA MODEL SUMMARY

### Core Entities

#### 1. **Course** (`courses` table)
```prisma
- id: UUID (PK)
- title: String
- slug: String (unique, URL-friendly)
- description: Text
- thumbnailUrl: String?
- level: String (beginner/intermediate/advanced)
- category: String
- price: Decimal
- isPublished: Boolean
- authorId: UUID (FK → users)
- categoryId: UUID? (FK → course_categories)
- createdAt, updatedAt: Timestamps

Relations:
- author: User (many-to-one)
- modules: Module[] (one-to-many)
- enrollments: Enrollment[] (one-to-many)
- courseCategory: CourseCategory? (many-to-one)
```

#### 2. **CourseCategory** (`course_categories` table)
```prisma
- id: UUID (PK)
- name: String (unique)
- slug: String (unique)
- description: String?
- createdAt, updatedAt: Timestamps

Relations:
- courses: Course[] (one-to-many)
```

#### 3. **Module** (`modules` table)
```prisma
- id: UUID (PK)
- courseId: UUID (FK → courses)
- title: String
- order: Int (for sequencing)
- createdAt, updatedAt: Timestamps

Relations:
- course: Course (many-to-one, cascade delete)
- lessons: Lesson[] (one-to-many)
```

#### 4. **Lesson** (`lessons` table)
```prisma
- id: UUID (PK)
- moduleId: UUID (FK → modules)
- title: String
- slug: String (unique)
- type: String (video|article|quiz|pdf|slide|link)
- content: Text? (for articles)
- videoUrl: String?(for videos)
- resourceUrl: String? (for pdf/slide/link)
- attachments: JSON? (array of files)
- duration: Int (minutes)
- order: Int
- isFree: Boolean (preview allowed)
- createdAt, updatedAt: Timestamps

Relations:
- module: Module (many-to-one, cascade delete)
- progress: LessonProgress[] (one-to-many)
- quiz: Quiz? (optionally attached)
- assignment: Assignment? (optionally attached)
```

#### 5. **Enrollment** (`enrollments` table)
```prisma
- id: UUID (PK)
- userId: UUID (FK → users)
- courseId: UUID (FK → courses)
- status: String (active|completed|dropped)
- progress: Int (0-100, auto-calculated)
- enrolledAt: Timestamp
- completedAt: Timestamp?

Relations:
- user: User (many-to-one, cascade delete)
- course: Course (many-to-one, cascade delete)
- lessonProgress: LessonProgress[] (one-to-many)

Constraints:
- UNIQUE [userId, courseId] (prevents duplicate enrollments)
```

#### 6. **LessonProgress** (`lesson_progress` table)
```prisma
- id: UUID (PK)
- enrollmentId: UUID (FK → enrollments)
- lessonId: UUID (FK → lessons)
- isCompleted: Boolean
- completedAt: Timestamp?
- lastWatched: Int (video timestamp in seconds)

Relations:
- enrollment: Enrollment (many-to-one, cascade delete)
- lesson: Lesson (many-to-one, cascade delete)

Constraints:
- UNIQUE [enrollmentId, lessonId] (one progress per lesson per enrollment)
```

#### 7. **Quiz** (`lms_quizzes` table)
```prisma
- id: UUID (PK)
- lessonId: UUID (unique FK → lessons)
- title: String
- description: Text?
- timeLimit: Int? (minutes)
- passingScore: Int (default 70, percentage)
- createdAt, updatedAt: Timestamps

Relations:
- lesson: Lesson (one-to-one, cascade delete)
- questions: QuizQuestion[] (one-to-many)
- attempts: QuizAttempt[] (one-to-many)
```

#### 8. **QuizQuestion** (`lms_quiz_questions` table)
```prisma
- id: UUID (PK)
- quizId: UUID (FK → lms_quizzes)
- text: Text
- type: String (multiple_choice|boolean|text)
- options: JSON? ({ text, isCorrect } array for MCQ)
- points: Int (default 1)
- order: Int
- createdAt, updatedAt: Timestamps

Relations:
- quiz: Quiz (many-to-one, cascade delete)
```

#### 9. **QuizAttempt** (`lms_quiz_attempts` table)
```prisma
- id: UUID (PK)
- quizId: UUID (FK → lms_quizzes)
- userId: UUID (FK → users)
- score: Int (percentage)
- isPassed: Boolean
- answers: JSON (stores user's answers)
- startedAt: Timestamp
- completedAt: Timestamp?

Relations:
- quiz: Quiz (many-to-one, cascade delete)
- user: User (many-to-one, cascade delete)
```

#### 10. **Assignment** (`lms_assignments` table)
```prisma
- id: UUID (PK)
- lessonId: UUID (unique FK → lessons)
- title: String
- description: Text
- dueDate: Timestamp?
- createdAt, updatedAt: Timestamps

Relations:
- lesson: Lesson (one-to-one, cascade delete)
- submissions: AssignmentSubmission[] (one-to-many)
```

#### 11. **AssignmentSubmission** (`lms_assignment_submissions` table)
```prisma
- id: UUID (PK)
- assignmentId: UUID (FK → lms_assignments)
- userId: UUID (FK → users)
- fileUrl: String? (uploaded file)
- content: Text? (text submission)
- grade: Int? (0-100)
- feedback: Text?
- status: String (submitted|graded|returned)
- submittedAt: Timestamp
- gradedAt: Timestamp?

Relations:
- assignment: Assignment (many-to-one, cascade delete)
- user: User (many-to-one, cascade delete)
```

---

## C. FLOW DIAGRAMS (Textual)

### 1. **Course Creation Flow** (Instructor/Admin)

```
[Start] → Login as Instructor/Admin
   ↓
Navigate to "LMS Create Course"
   ↓
Fill in Course Details:
   - Title (auto-generates slug)
   - Description
   - Level (beginner/intermediate/advanced)
   - Category (dropdown)
   - Price
   - Thumbnail (optional)
   ↓
Click "Create Course"
   ↓
Backend: POST /api/v1/lms/courses
   - Validates data
   - Generates unique slug
   - Links to authorId (current user)
   - Creates Course record
   ↓
Returns Course ID
   ↓
Redirect to Course Editor Page
   ↓
[End: Course created but not published]
```

### 2. **Module & Lesson Creation Flow**

```
[Start] → On Course Editor Page
   ↓
Click "Add Module"
   ↓
Enter Module Title + Order
   ↓
Backend: POST /api/v1/lms/courses/:courseId/modules
   - Creates Module linked to Course
   ↓
Module appears in UI
   ↓
Click "Add Lesson" within Module
   ↓
Fill Lesson Details:
   - Title
   - Type (video/pdf/slide/link/article)
   - Content (based on type)
   - Duration
   - Order
   - isFree checkbox
   ↓
Backend: POST /api/v1/lms/modules/:moduleId/lessons
   - Creates Lesson
   - Generates unique slug
   ↓
Lesson appears in Module
   ↓
Optionally: Attach Quiz or Assignment to Lesson
   ↓
[End: Course content structured]
```

### 3. **Student Enrollment Flow**

```
[Start] → Student browses Course Catalog
  ↓
Filters courses (optional):
   - By category
   - By level
   - By search keyword
   ↓
Clicks on Course Card
   ↓
Views Course Detail Page:
   - Description
   - Author
   - Modules/Lessons outline
   - Preview lessons if isFree=true
   ↓
Click "Enroll" button
   ↓
Backend: POST /api/v1/lms/courses/:id/enroll
   - Checks if already enrolled (prevent duplicate)
   - Checks if course exists
   - Creates Enrollment record (status=active, progress=0)
   ↓
Success: Redirect to "My Courses" or Lesson View
   ↓
[End: Student enrolled]
```

### 4. **Learning & Progress Tracking Flow**

```
[Start] → Student in "My Courses"
   ↓
Clicks on an enrolled Course
   ↓
Views Course structure (Modules → Lessons)
   ↓
Clicks on a Lesson
   ↓
Lesson View Page loads:
   - Displays content (video player, article, PDF viewer, etc.)
   - Shows "Mark as Complete" checkbox/button
   ↓
Student consumes content
   ↓
Marks Lesson as Complete
   ↓
Backend: PATCH /api/v1/lms/lessons/:id/progress
   - Finds Enrollment for this user + course
   - Upserts LessonProgress (isCompleted=true, completedAt=now)
   - Recalculates Course Progress:
       • Count total lessons in course
       • Count completed lessons for this enrollment
       • Progress = (completed / total) * 100
   - Updates Enrollment.progress
   ↓
UI updates: Lesson marked complete, progress bar updates
   ↓
If progress = 100% → Enrollment.status = "completed"
   ↓
[End: Progress tracked]
```

### 5. **Quiz Flow**

```
[Start] → Student on Quiz Lesson
   ↓
Backend: GET /api/v1/lms/lessons/:lessonId/quiz
   - Retrieves Quiz + Questions
   ↓
UI displays quiz questions in order
   ↓
Student answers questions
   ↓
Clicks "Submit Quiz"
   ↓
Backend: POST /api/v1/lms/quizzes/:quizId/submit
   - Receives answers JSON
   - Auto-grades MCQ/Boolean questions:
       • Compares user answer with correct option
       • Calculates score (points earned / max points) * 100
   - Determines isPassed (score >= passingScore)
   - Creates QuizAttempt record
   - If isPassed = true:
       • Calls updateProgress(lessonId, completed=true)
   ↓
Returns QuizAttempt (score, isPassed)
   ↓
UI shows result: "Pass" or "Fail" + score
   ↓
If passed → Lesson auto-marked complete
   ↓
[End: Quiz completed]
```

### 6. **Assignment Flow**

```
[Start] → Student on Assignment Lesson
   ↓
Backend: GET /api/v1/lms/lessons/:lessonId/assignment
   - Retrieves Assignment details
   ↓
Student reads instructions
   ↓
Prepares submission:
   - Option A: Upload a file
   - Option B: Write text content
   ↓
Clicks "Submit Assignment"
   ↓
Backend: POST /api/v1/lms/assignments/:assignmentId/submit
   - Validates submission
   - Creates AssignmentSubmission (status=submitted)
   ↓
Submission saved, awaiting grading
   ↓
[Student waits]
   ↓
--- Instructor/Admin Side ---
   ↓
Instructor views submissions:
   GET /api/v1/lms/assignments/:assignmentId/submissions
   ↓
Reviews student work
   ↓
Assigns grade (0-100) + optional feedback
   ↓
Backend: POST /api/v1/lms/submissions/:submissionId/grade
   - Updates submission (grade, feedback, status=graded, gradedAt=now)
   - If grade >= 70:
       • Calls updateProgress(lessonId, completed=true)
   ↓
Student notified (if notification system exists)
   ↓
[End: Assignment graded]
```

### 7. **Instructor Dashboard Flow**

```
[Start] → Logged in as Trainer/Admin
   ↓
Navigate to "Instructor" section
   ↓
Backend: GET /api/v1/lms/instructor/courses
   - Retrieves courses where authorId = userId
   - Includes enrollment count per course
   ↓
Backend: GET /api/v1/lms/instructor/stats
   - Calculates:
       • Total courses
       • Total students (sum of enrollments)
       • Deduction rate (< 5 courses = 30%, >= 5 courses = 15%)
   ↓
UI displays:
   - Course list
   - Statistics
   - Commission info
   ↓
[End: Instructor views dashboard]
```

---

## D. VALIDATION CHECKLIST PER FEATURE

### Course Management

| Validation Rule | Implemented? | Location | Notes |
|----------------|--------------|----------|-------|
| Title required | ✅ Yes | Backend schema | Prisma enforces NOT NULL |
| Slug uniqueness | ✅ Yes | Backend | Unique constraint in DB |
| Slug generation | ✅ Yes | Controller | Auto-generated from title + timestamp |
| Valid level enum | ⚠️ Partial | None | Should validate: beginner/intermediate/advanced |
| Price >= 0 | ❌ No | None | No validation on negative price |
| Category exists | ⚠️ Partial | Schema | FK to courseCategory, but not enforced on string category |
| Author authorization | ✅ Yes | Middleware | `requireRole(['admin', 'trainer', etc.])` |

### Module Management

| Validation Rule | Implemented? | Location | Notes |
|----------------|--------------|----------|-------|
| Title required | ✅ Yes | Backend schema | Prisma NOT NULL |
| Order uniqueness per course | ❌ No | None | Multiple modules can have same order value |
| Course existence | ✅ Yes | FK constraint | Prisma enforces referential integrity |
| Cascade delete | ✅ Yes | Schema | Deleting course deletes modules |

### Lesson Management

| Validation Rule | Implemented? | Location | Notes |
|----------------|--------------|----------|-------|
| Title required | ✅ Yes | Backend schema | NOT NULL |
| Slug uniqueness | ✅ Yes | Backend | Unique constraint |
| Valid type enum | ❌ No | None | Should validate: video/article/pdf/slide/link/quiz |
| Video URL for video type | ❌ No | None | No content-type validation |
| Content for article type | ❌ No | None | No content-type validation |
| Duration >= 0 | ❌ No | None | No validation |
| Order uniqueness per module | ❌ No | None | Can have duplicate orders |

### Enrollment

| Validation Rule | Implemented? | Location | Notes |
|----------------|--------------|----------|-------|
| User authenticated | ✅ Yes | Middleware | `authenticate` middleware |
| Course exists | ✅ Yes | Service layer | Explicit check before enrollment |
| No duplicate enrollment | ✅ Yes | Service layer | Checks existing enrollment |
| Unique constraint | ✅ Yes | Schema | [userId, courseId] unique |
| Progress 0-100 | ✅ Yes | Logic | Auto-calculated, constrained |

### Progress Tracking

| Validation Rule | Implemented? | Location | Notes |
|----------------|--------------|----------|-------|
| User enrolled before marking | ✅ Yes | Service layer | Checks enrollment exists |
| Lesson exists | ✅ Yes | Service layer | Explicit check |
| Completion timestamp | ✅ Yes | Logic | Sets completedAt when marked complete |
| No negative last Watched | ❌ No | None | No validation on lastWatched field |
| Progress auto-recalculation | ✅ Yes | Service layer | Triggers on each lesson completion |

### Quiz

| Validation Rule | Implemented? | Location | Notes |
|----------------|--------------|----------|-------|
| One quiz per lesson | ✅ Yes | Schema | `lessonId` is UNIQUE FK |
| Passing score 0-100 | ❌ No | None | Default is 70, no range check |
| Questions required | ❌ No | None | Can create quiz with 0 questions |
| Valid question type | ❌ No | None | Should validate: multiple_choice/boolean/text |
| Options required for MCQ | ❌ No | None | Can submit MCQ without options |
| At least one correct option | ❌ No | None | No validation |
| Time limit >= 0 | ❌ No | None | Can set negative time limit |
| Auto-grade only MCQ/Boolean | ✅ Yes | Service layer | Text questions skipped |

### Assignment

| Validation Rule | Implemented? | Location | Notes |
|----------------|--------------|----------|-------|
| One assignment per lesson | ✅ Yes | Schema | `lessonId` is UNIQUE FK |
| Title & description required | ✅ Yes | Schema | NOT NULL |
| Due date in future | ❌ No | None | Can set past due dates |
| Due date enforcement | ❌ No | None | No late submission prevention |
| Submission content required | ❌ No | None | Can submit empty assignment |
| Grade 0-100 | ❌ No | None | Can assign negative grades or > 100 |
| Passing threshold | ⚠️ Hardcoded | Service layer | Fixed at 70%, should be configurable |
| Only instructor can grade | ✅ Yes | Middleware | `requireRole(['admin', 'mentor', 'konsultan', 'umkm'])` |

### File Upload

| Validation Rule | Implemented? | Location | Notes |
|----------------|--------------|----------|-------|
| File size limit | ✅ Yes | Multer config | 100MB max |
| Allowed MIME types | ✅ Yes | Multer fileFilter | jpeg, jpg, png, pdf, mp4, webm |
| Authenticated users only | ✅ Yes | Middleware | `authenticate` |
| Unique filename | ✅ Yes | Multer storage | Timestamp + random suffix |
| Storage path exists | ✅ Yes | Setup | Creates `uploads/` if not exists |

---

## E. API ENDPOINT SUMMARY

### Public Endpoints (No Auth)
- `GET /api/v1/lms/courses` - List all published courses (with filters)
- `GET /api/v1/lms/courses/:slug` - Get course by slug

### Authenticated Endpoints
- `POST /api/v1/lms/courses` - Create course
- `GET /api/v1/lms/courses/:id` - Get course by ID
- `PATCH /api/v1/lms/courses/:id` - Update course
- `DELETE /api/v1/lms/courses/:id` - Delete course
- `POST /api/v1/lms/courses/:id/enroll` - Enroll in course
- `GET /api/v1/lms/courses/:id/enrollment-status` - Check enrollment
- `GET /api/v1/lms/my-courses` - Get my enrolled courses
- `PATCH /api/v1/lms/lessons/:id/progress` - Update lesson progress

### Instructor Endpoints (Role: trainer, admin, konsultan, umkm)
- `GET /api/v1/lms/instructor/courses` - Get instructor's courses
- `GET /api/v1/lms/instructor/stats` - Get instructor statistics

### Module Endpoints
- `POST /api/v1/lms/courses/:courseId/modules` - Create module
- `GET /api/v1/lms/courses/:courseId/modules` - List course modules
- `GET /api/v1/lms/modules/:id` - Get module
- `PATCH /api/v1/lms/modules/:id` - Update module
- `DELETE /api/v1/lms/modules/:id` - Delete module
- `POST /api/v1/lms/courses/:courseId/modules/reorder` - Reorder modules

### Lesson Endpoints
- `POST /api/v1/lms/modules/:moduleId/lessons` - Create lesson
- `GET /api/v1/lms/modules/:moduleId/lessons` - List module lessons
- `GET /api/v1/lms/lessons/:id` - Get lesson
- `PATCH /api/v1/lms/lessons/:id` - Update lesson
- `DELETE /api/v1/lms/lessons/:id` - Delete lesson
- `POST /api/v1/lms/modules/:moduleId/lessons/reorder` - Reorder lessons

### Quiz Endpoints
- `POST /api/v1/lms/lessons/:lessonId/quiz` - Create quiz (auth + role)
- `GET /api/v1/lms/lessons/:lessonId/quiz` - Get quiz
- `POST /api/v1/lms/quizzes/:quizId/submit` - Submit quiz
- `GET /api/v1/lms/quizzes/:quizId/attempts` - Get quiz attempts

### Assignment Endpoints
- `POST /api/v1/lms/lessons/:lessonId/assignment` - Create assignment (auth + role)
- `GET /api/v1/lms/lessons/:lessonId/assignment` - Get assignment
- `POST /api/v1/lms/assignments/:assignmentId/submit` - Submit assignment
- `POST /api/v1/lms/submissions/:submissionId/grade` - Grade submission (auth + role)
- `GET /api/v1/lms/assignments/:assignmentId/submissions` - Get submissions (auth + role)

### Category Endpoints (Admin only)
- `GET /api/v1/lms/categories` - List categories
- `GET /api/v1/lms/categories/:id` - Get category
- `POST /api/v1/lms/categories` - Create category
- `PATCH /api/v1/lms/categories/:id` - Update category
- `DELETE /api/v1/lms/categories/:id` - Delete category

### Resource Endpoints
- `POST /api/v1/lms/resources/upload` - Upload file (multipart/form-data)

---

## F. MISSING FEATURES & GAPS

### Critical Missing Features

1. **Certification System** (Complete gap)
   - No certificate generation
   - No certificate templates
   - No certificate download/validation
   - **Impact:** Cannot reward course completion

2. **Payment Integration** (Data model exists, logic missing)
   - Course pricing in DB but no payment gateway
   - No enrollment payment check
   - No instructor revenue tracking
   - **Impact:** Cannot monetize courses

3. **Unenroll Functionality**
   - Students cannot drop/unenroll from courses
   - **Impact:** Poor user experience

4. **Admin Enrollment Management**
   - Admin cannot manually enroll users
   - Admin cannot view/manage all enrollments
   - **Impact:** Limited administrative control

5. **Real-time Admin Statistics**
   - Current admin stats are mocked
   - No real-time course/student analytics
   - **Impact:** Poor visibility for administrators

### Validation Gaps

1. **Enum Validation**
   - Course level not validated (should be beginner/intermediate/advanced)
   - Lesson type not validated (should be video/article/pdf/slide/link)
   - Question type not validated (should be multiple_choice/boolean/text)

2. **Business Logic Validation**
   - No content-type validation (e.g., video lesson must have videoUrl)
   - No price range validation (can be negative)
   - No time limit range validation (can be negative)
   - No grade range validation (can be < 0 or > 100)

3. **Content Validation**
   - Can create quiz with 0 questions
   - Can create MCQ question without options
   - Can submit assignment with no content

### UX/Frontend Gaps

1. **File Upload UI**
   - Course thumbnail upload UI not implemented
   - Lesson attachments UI not fully integrated

2. **Video Player Integration**
   - No video player with timestamp tracking
   - `lastWatched` field not utilized in frontend

3. **Due Date Enforcement**
   - Assignment due dates displayed but not enforced

4. **Quiz Timer**
   - Quiz timeLimit in DB but no frontend countdown timer

### Performance & Scalability Concerns

1. **File Storage**
   - Currently storing files locally
   - Should migrate to cloud storage (S3, Cloudinary, etc.)

2. **Large Course Queries**
   - Fetching courses with all modules/lessons can be slow
   - Should implement pagination for lessons

3. **Progress Recalculation**
   - Recalculates on every lesson completion
   - Consider caching or optimizing for large courses

---

## G. ROLE & PERMISSION MAPPING

### LMS-Related Permissions

| Action | Required Roles | Notes |
|--------|---------------|-------|
| Create Course | admin, trainer, konsultan, umkm | Anyone can be an instructor |
| Edit Own Course | author or admin | Ownership check needed |
| Delete Own Course | author or admin | Ownership check needed |
| Enroll in Course | authenticated | Any logged-in user |
| Create Quiz | admin, mentor, konsultan, umkm | Restricted to instructors |
| Create Assignment | admin, mentor, konsultan, umkm | Restricted to instructors |
| Grade Assignment | admin, mentor, konsultan, umkm | Instructor/admin only |
| Manage Categories | admin | Admin-only feature |
| Upload Resources | authenticated | Any logged-in user |

**Note:** The current RBAC system is from the main `User-Role-Permission` tables, but LMS endpoints use hardcoded role checks (`requireRole(['admin', 'mentor', etc.])`). Should integrate with the dynamic permission system for consistency.

---

## H. RECOMMENDATIONS

### Immediate Priorities (High Impact, Low Effort)

1. **Add Enum Validation**
   - Validate course level, lesson type, question type
   - Prevents data corruption

2. **Add Range Validations**
   - Price >= 0
   - Grade 0-100
   - Time limit >= 0
   - **Rationale:** Data integrity

3. **Implement Real Admin Stats**
   - Remove mock data
   - Connect to real DB queries
   - **Rationale:** Accurate reporting

4. **Add Content-Type Validation**
   - Video lessons must have videoUrl
   - Article lessons must have content
   - **Rationale:** Consistent UX

### Medium-Term (Essential Features)

1. **Certificate System**
   - Design certificate template
   - Generate PDF certificates on course completion
   - Add certificate download endpoint
   - **Rationale:** Core LMS feature

2. **Unenroll Functionality**
   - Add endpoint to drop course
   - Update enrollment status
   - **Rationale:** User autonomy

3. **Assignment Passing Threshold**
   - Make configurable per assignment (not hardcoded 70%)
   - **Rationale:** Flexibility

4. **Video Player Integration**
   - Implement player with timestamp tracking
   - Save `lastWatched` on interval
   - Resume from last position
   - **Rationale:** Better learning experience

### Long-Term (Scalability & Advanced Features)

1. **Payment Integration**
   - Integrate payment gateway (Midtrans, Xendit, etc.)
   - Enforce payment for paid courses
   - Track instructor earnings
   - **Rationale:** Monetization

2. **Cloud Storage Migration**
   - Move uploads to AWS S3 or Cloudinary
   - Improves scalability and reliability
   - **Rationale:** Production readiness

3. **Advanced Analytics**
   - Student engagement metrics
   - Course completion rates
   - Revenue analytics
   - **Rationale:** Data-driven decisions

4. **Notification System**
   - Notify students on assignment grading
   - Notify instructors on new submissions
   - Notify on course updates
   - **Rationale:** User engagement

---

## CONCLUSION

The LMS implementation in this repository is **functionally solid** with a well-structured data model and comprehensive CRUD operations for core entities (Course, Module, Lesson, Enrollment, Quiz, Assignment). The backend architecture is clean, uses Prisma ORM effectively, and follows RESTful conventions.

**Key Strengths:**
- Complete course/module/lesson management
- Working enrollment and progress tracking
- Functional quiz system with auto-grading
- Assignment submission and grading workflow
- Role-based access control

**Key Weaknesses:**
- Lack of validation on input fields (enums, ranges, required content)
- Missing certification system
- No payment integration
- Mock admin statistics
- Local file storage (not production-ready)

**Readiness Level:** **70% - Ready for MVP Testing, Not Production**

The system can be used for internal testing and pilot programs, but requires the critical gaps (certification, payment, validation) to be addressed before public launch.

---

**Document End**
