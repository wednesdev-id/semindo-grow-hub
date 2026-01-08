# LMS Gamification Layer Design

**Design Date:** December 18, 2025  
**Author:** Senior Product Engineer & System Architect  
**Version:** 1.0 - Design Specification (No Code)

---

## 1. GAMIFICATION FEATURE MAP

### 1.1 Core Gamification Components

```
┌─────────────────────────────────────────────────────────────┐
│                  GAMIFICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │   PRE-TEST      │  │   POST-TEST      │  │  POINTS   │ │
│  │   SYSTEM        │  │   SYSTEM         │  │  ENGINE   │ │
│  └────────┬────────┘  └────────┬─────────┘  └─────┬─────┘ │
│           │                    │                    │       │
│           └────────────────────┴────────────────────┘       │
│                              │                              │
│                    ┌─────────▼─────────┐                   │
│                    │  LEVELING ENGINE  │                   │
│                    └─────────┬─────────┘                   │
│                              │                              │
│                    ┌─────────▼─────────┐                   │
│                    │   BADGE SYSTEM    │                   │
│                    │   (Optional)      │                   │
│                    └───────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
                 Integration Points (Events)
                              │
┌─────────────────────────────▼─────────────────────────────┐
│              EXISTING LMS CORE SYSTEM                     │
├───────────────────────────────────────────────────────────┤
│  Enrollment │ LessonProgress │ QuizAttempt │ Assignment  │
│  Course     │ Module         │ Lesson      │ User        │
└───────────────────────────────────────────────────────────┘
```

### 1.2 Feature Hierarchy

**Level 1: Foundation (Must Have)**
- User Points Ledger (track all point transactions)
- User Level Tracking (current level per user)
- Pre-Test Quiz Type (baseline assessment)
- Post-Test Quiz Type (final assessment)
- Point Rules Engine (configurable point awards)

**Level 2: Enhancement (Should Have)**
- Badge Definitions (achievement templates)
- User Badge Awards (earned badges)
- Leaderboard Support (ranking system)
- Streak Tracking (daily engagement)

**Level 3: Advanced (Nice to Have)**
- Multiplier System (bonus periods)
- Team/Cohort Challenges
- Time-based Events
- Custom Achievements

---

## 2. EVENT-BASED TRIGGERS (Point Awards)

### 2.1 Learning Activity Events

| Event Name | Trigger Condition | Base Points | Notes |
|------------|------------------|-------------|--------|
| `COURSE_ENROLLED` | User enrolls in a course | 10 | Welcome bonus |
| `LESSON_COMPLETED` | LessonProgress.isCompleted = true | 5 | Per lesson |
| `MODULE_COMPLETED` | All lessons in module completed | 20 | Module bonus |
| `COURSE_COMPLETED` | Enrollment.progress = 100% | 100 | Course completion |
| `FIRST_LESSON_DAY` | First lesson of the day | 5 | Daily engagement |
| `VIDEO_WATCHED_FULL` | Video lesson watched 100% | 3 | Video engagement |
| `RESOURCE_DOWNLOADED` | User downloads attachment | 2 | Resource interaction |

### 2.2 Assessment Events

| Event Name | Trigger Condition | Base Points | Notes |
|------------|------------------|-------------|--------|
| `PRE_TEST_COMPLETED` | Pre-test quiz submitted | 10 | Baseline established |
| `POST_TEST_COMPLETED` | Post-test quiz submitted | 15 | Knowledge validated |
| `QUIZ_PASSED` | QuizAttempt.isPassed = true | 15 | Per quiz |
| `QUIZ_PERFECT_SCORE` | QuizAttempt.score = 100% | +10 | Bonus for perfection |
| `QUIZ_FIRST_ATTEMPT_PASS` | Passed on first try | +5 | Bonus for efficiency |
| `ASSIGNMENT_SUBMITTED` | Assignment submitted | 10 | Submission itself |
| `ASSIGNMENT_GRADED_A` | Assignment grade >= 90% | 25 | Excellent work |
| `ASSIGNMENT_GRADED_B` | Assignment grade 80-89% | 15 | Good work |
| `ASSIGNMENT_GRADED_C` | Assignment grade 70-79% | 10 | Passing work |

### 2.3 Improvement Events (Pre-test vs Post-test)

| Event Name | Trigger Condition | Base Points | Notes |
|------------|------------------|-------------|--------|
| `KNOWLEDGE_GROWTH_SMALL` | Post-test score > Pre-test by 10-20% | 20 | Measurable growth |
| `KNOWLEDGE_GROWTH_MEDIUM` | Post-test score > Pre-test by 21-40% | 40 | Significant growth |
| `KNOWLEDGE_GROWTH_LARGE` | Post-test score > Pre-test by >40% | 75 | Exceptional growth |
| `MASTERY_ACHIEVED` | Post-test score >= 90% | 30 | Mastery level |

### 2.4 Engagement Events

| Event Name | Trigger Condition | Base Points | Notes |
|------------|------------------|-------------|--------|
| `DAILY_LOGIN` | First login of the day | 2 | Daily engagement |
| `WEEKLY_STREAK_3` | 3 consecutive days active | 15 | Consistency bonus |
| `WEEKLY_STREAK_5` | 5 consecutive days active | 30 | Strong consistency |
| `WEEKLY_STREAK_7` | 7 consecutive days active | 50 | Full week streak |
| `COMMENT_POSTED` | (Future: forum comment) | 3 | Community engagement |
| `HELPED_PEER` | (Future: peer review) | 10 | Collaborative bonus |

### 2.5 Event Flow Example

```
Student completes a lesson with quiz:
   │
   ├─ Lesson marked complete
   │    └─> Trigger: LESSON_COMPLETED (+5 points)
   │
   ├─ Quiz submitted and passed
   │    ├─> Trigger: QUIZ_PASSED (+15 points)
   │    └─> If first attempt: QUIZ_FIRST_ATTEMPT_PASS (+5 bonus)
   │
   └─ Check if module complete
        └─> If yes: MODULE_COMPLETED (+20 points)
        
Total: 45 points (if first-attempt pass + module complete)
```

---

## 3. LEVELING RULES

### 3.1 Level Progression Table

| Level | Required Points (Cumulative) | Title | Perks |
|-------|-------------------------------|-------|-------|
| 1 | 0 | Beginner | Default starting level |
| 2 | 100 | Learner | Unlock leaderboard visibility |
| 3 | 300 | Student | Unlock profile badge display |
| 4 | 600 | Advanced Student | +5% point multiplier on quizzes |
| 5 | 1,000 | Scholar | Unlock custom profile themes |
| 6 | 1,500 | Expert Learner | +10% point multiplier |
| 7 | 2,200 | Master | Priority instructor access |
| 8 | 3,000 | Specialist | Certificate template customization |
| 9 | 4,000 | Authority | Early access to new courses |
| 10 | 5,500 | Guru | +15% point multiplier |
| 11 | 7,500 | Legend | Exclusive mentor sessions |
| 12+ | +2,500 per level | Supreme {N} | Bragging rights |

### 3.2 Level Calculation Formula

```
Level Thresholds:
- Levels 1-3: Linear progression (100, 300, 600)
- Levels 4-7: Exponential (1000, 1500, 2200, 3000)
- Levels 8-11: Steep exponential (4000, 5500, 7500)
- Levels 12+: Prestige levels (+2500 each)

Formula (for reference, not code):
Level = FLOOR((-b + SQRT(b² + 4ac)) / 2a)
Where: a=50, b=50, c=user_points

Or use lookup table for simplicity.
```

### 3.3 Level-Up Trigger

```
Event: USER_LEVEL_UP
Trigger: When total points cross level threshold
Actions:
  - Update user's current level
  - Award level-up bonus points (10 * new_level)
  - Unlock level perks
  - Send notification
  - Log achievement
```

### 3.4 Level Progression Safeguards

- **No Level Down:** Users never lose levels, only gain
- **Point Deduction:** Can deduct points for violations, but doesn't affect existing levels
- **Level Cap:** Max level 50 (to prevent inflation)
- **Seasonal Reset (Optional):** Levels persist, but can introduce "Seasons" with separate leaderboards

---

## 4. PRE-TEST & POST-TEST SYSTEM

### 4.1 Pre-Test Design

**Purpose:** Establish baseline knowledge before course/module

**Characteristics:**
- Same quiz structure as regular quizzes (reuse Quiz model)
- Distinguished by `quizType` field in Quiz table
- Attached to Course or Module level (not individual lessons)
- Unlocks at enrollment
- Optional but recommended
- Score stored separately for comparison

**Data Flow:**
```
User enrolls in Course
   ↓
System checks: Does this course have a Pre-Test?
   ↓ (If yes)
Prompt user: "Take Pre-Test to assess your baseline knowledge"
   ↓
User takes Pre-Test
   ↓
Score recorded in QuizAttempt with special tag
   ↓
System creates PreTestResult entry
   ↓
Award points: PRE_TEST_COMPLETED (+10)
   ↓
User proceeds to course content
```

**Pre-Test Placement:**
- **Option A:** Attach to Course (one pre-test per course)
- **Option B:** Attach to first Module (modular testing)
- **Recommendation:** Attach to Course for holistic assessment

### 4.2 Post-Test Design

**Purpose:** Measure knowledge gain after course/module completion

**Characteristics:**
- Same quiz structure as regular quizzes
- Distinguished by `quizType` field
- Attached to Course or Module level
- Unlocks when progress >= 90% (to avoid "test-only" gaming)
- Compares with Pre-Test score
- Triggers improvement-based point awards

**Data Flow:**
```
User reaches 90% course progress
   ↓
System checks: Does this course have a Post-Test?
   ↓ (If yes)
Unlock Post-Test
   ↓
User takes Post-Test
   ↓
Score recorded in QuizAttempt
   ↓
System creates PostTestResult entry
   ↓
System retrieves Pre-Test score (if exists)
   ↓
Calculate improvement percentage
   ↓
Award improvement-based points:
   - KNOWLEDGE_GROWTH_SMALL/MEDIUM/LARGE
   - MASTERY_ACHIEVED (if score >= 90%)
   ↓
Update course knowledge metrics
```

### 4.3 Pre-Test vs Post-Test Comparison Logic

**Improvement Calculation:**
```
Improvement % = ((Post-Test Score - Pre-Test Score) / (100 - Pre-Test Score)) * 100

Example:
  Pre-Test: 40%
  Post-Test: 80%
  Improvement: ((80 - 40) / (100 - 40)) * 100 = 66.67%
  
  Award: KNOWLEDGE_GROWTH_LARGE (+75 points)
```

**Special Cases:**
- If Pre-Test score >= 90%: Student already proficient, focus on course completion points
- If Post-Test score < Pre-Test score: No penalty, but no improvement bonus
- If no Pre-Test taken: Post-Test awarded but no improvement calculation

### 4.4 Quiz Type Taxonomy

| Quiz Type | Purpose | Attached To | Unlocks At | Mandatory? |
|-----------|---------|-------------|------------|------------|
| `PRE_TEST` | Baseline knowledge | Course/Module | Enrollment | No |
| `POST_TEST` | Final assessment | Course/Module | 90% progress | No |
| `LESSON_QUIZ` | Lesson validation | Lesson | Lesson access | Config |
| `PRACTICE_QUIZ` | Self-check | Lesson | Anytime | No |
| `CERTIFICATION_TEST` | Final exam | Course | 100% progress | Yes (for cert) |

---

## 5. REQUIRED NEW TABLES (Schema Only)

### 5.1 UserPoints Table

**Purpose:** Track all point transactions for auditability

```prisma
model UserPoints {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  eventType      String   @map("event_type") // e.g., "LESSON_COMPLETED"
  points         Int      // Can be positive or negative
  sourceType     String   @map("source_type") // "lesson", "quiz", "assignment", etc.
  sourceId       String?  @map("source_id") // ID of the related entity
  metadata       Json?    // Additional context (e.g., { lessonTitle, courseId })
  createdAt      DateTime @default(now()) @map("created_at")
  
  // Relations
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([eventType])
  @@map("user_points")
}
```

**Design Notes:**
- Immutable ledger (never update, only insert)
- Allows point history auditing
- Supports negative points for penalties
- Metadata field stores context for debugging

---

### 5.2 UserLevel Table

**Purpose:** Track user's current level and total points

```prisma
model UserLevel {
  id                 String   @id @default(uuid())
  userId             String   @unique @map("user_id")
  currentLevel       Int      @default(1) @map("current_level")
  totalPoints        Int      @default(0) @map("total_points")
  pointsToNextLevel  Int      @default(100) @map("points_to_next_level")
  levelUpCount       Int      @default(0) @map("level_up_count") // Total times leveled up
  highestLevel       Int      @default(1) @map("highest_level") // Track peak level
  updatedAt          DateTime @updatedAt @map("updated_at")
  
  // Relations
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([currentLevel])
  @@index([totalPoints])
  @@map("user_levels")
}
```

**Design Notes:**
- One record per user
- Updated on every point transaction
- `pointsToNextLevel` pre-calculated for UI convenience
- `highestLevel` tracks all-time peak (prestige metric)

---

### 5.3 LevelDefinition Table

**Purpose:** Define level thresholds and perks (configurable)

```prisma
model LevelDefinition {
  id                 String   @id @default(uuid())
  level              Int      @unique
  requiredPoints     Int      @map("required_points") // Cumulative
  title              String   // e.g., "Scholar"
  description        String?  @db.Text
  perks              Json?    // { multiplier: 1.05, features: ["leaderboard"] }
  iconUrl            String?  @map("icon_url")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")
  
  @@index([level])
  @@index([requiredPoints])
  @@map("level_definitions")
}
```

**Design Notes:**
- Allows dynamic level configuration without code changes
- Can add new levels or adjust thresholds via admin panel
- Perks stored as JSON for flexibility

---

### 5.4 PointRule Table

**Purpose:** Define configurable point award rules

```prisma
model PointRule {
  id          String   @id @default(uuid())
  eventType   String   @unique @map("event_type") // e.g., "QUIZ_PASSED"
  points      Int      // Base points for this event
  description String?  @db.Text
  isActive    Boolean  @default(true) @map("is_active")
  conditions  Json?    // Optional: { minScore: 70, maxAttempts: 1 }
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([eventType])
  @@index([isActive])
  @@map("point_rules")
}
```

**Design Notes:**
- Admin can adjust point values without code deployment
- Can enable/disable point events
- Conditions field allows complex rules (JSON-based)

---

### 5.5 PreTestResult Table

**Purpose:** Store pre-test attempts and metrics

```prisma
model PreTestResult {
  id               String   @id @default(uuid())
  userId           String   @map("user_id")
  courseId         String?  @map("course_id")
  moduleId         String?  @map("module_id")
  quizAttemptId    String   @unique @map("quiz_attempt_id") // FK to QuizAttempt
  score            Int      // Percentage (0-100)
  totalQuestions   Int      @map("total_questions")
  correctAnswers   Int      @map("correct_answers")
  takenAt          DateTime @default(now()) @map("taken_at")
  
  // Relations
  user             User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  course           Course?     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  module           Module?     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  quizAttempt      QuizAttempt @relation(fields: [quizAttemptId], references: [id], onDelete: Cascade)
  
  @@index([userId, courseId])
  @@index([userId, moduleId])
  @@map("pre_test_results")
}
```

**Design Notes:**
- Links to existing QuizAttempt (reuses quiz infrastructure)
- Can be course-level or module-level
- Stores snapshot of score for comparison

---

### 5.6 PostTestResult Table

**Purpose:** Store post-test attempts and improvement metrics

```prisma
model PostTestResult {
  id                  String   @id @default(uuid())
  userId              String   @map("user_id")
  courseId            String?  @map("course_id")
  moduleId            String?  @map("module_id")
  quizAttemptId       String   @unique @map("quiz_attempt_id")
  preTestResultId     String?  @map("pre_test_result_id") // Optional link
  score               Int      // Percentage (0-100)
  totalQuestions      Int      @map("total_questions")
  correctAnswers      Int      @map("correct_answers")
  improvementPercent  Decimal? @map("improvement_percent") @db.Decimal(5, 2) // If pre-test exists
  hasMastery          Boolean  @default(false) @map("has_mastery") // score >= 90%
  takenAt             DateTime @default(now()) @map("taken_at")
  
  // Relations
  user                User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  course              Course?       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  module              Module?       @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  quizAttempt         QuizAttempt   @relation(fields: [quizAttemptId], references: [id], onDelete: Cascade)
  preTestResult       PreTestResult? @relation(fields: [preTestResultId], references: [id])
  
  @@index([userId, courseId])
  @@index([userId, moduleId])
  @@index([hasMastery])
  @@map("post_test_results")
}
```

**Design Notes:**
- Links to PreTestResult for improvement calculation
- `improvementPercent` auto-calculated on submission
- `hasMastery` flag for quick querying

---

### 5.7 BadgeDefinition Table (Optional)

**Purpose:** Define available badges

```prisma
model BadgeDefinition {
  id           String   @id @default(uuid())
  name         String   @unique
  description  String   @db.Text
  iconUrl      String   @map("icon_url")
  category     String   // "achievement", "streak", "mastery", etc.
  criteria     Json     // { type: "COURSE_COMPLETED", count: 5 }
  points       Int      @default(0) // Bonus points for earning this badge
  rarity       String   @default("common") // common, rare, epic, legendary
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  // Relations
  userBadges   UserBadge[]
  
  @@index([category])
  @@index([rarity])
  @@map("badge_definitions")
}
```

**Design Notes:**
- Criteria stored as JSON for flexibility
- Rarity for gamification appeal
- Can be disabled without deleting

---

### 5.8 UserBadge Table (Optional)

**Purpose:** Track badges earned by users

```prisma
model UserBadge {
  id              String        @id @default(uuid())
  userId          String        @map("user_id")
  badgeId         String        @map("badge_id")
  earnedAt        DateTime      @default(now()) @map("earned_at")
  progressData    Json?         @map("progress_data") // For multi-step badges
  
  // Relations
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge           BadgeDefinition @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([userId, badgeId]) // Can't earn same badge twice
  @@index([userId, earnedAt])
  @@map("user_badges")
}
```

**Design Notes:**
- One badge earned once per user
- `progressData` for tracking multi-step achievements

---

### 5.9 UserStreak Table (Optional)

**Purpose:** Track daily engagement streaks

```prisma
model UserStreak {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  currentStreak   Int      @default(0) @map("current_streak")
  longestStreak   Int      @default(0) @map("longest_streak")
  lastActivityDate DateTime @map("last_activity_date")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([currentStreak])
  @@map("user_streaks")
}
```

**Design Notes:**
- Updated daily on first activity
- Resets if no activity for 24+ hours
- Tracks all-time longest streak

---

## 6. REQUIRED VALIDATIONS

### 6.1 Data Integrity Validations

| Field/Entity | Validation Rule | Reason |
|--------------|----------------|--------|
| `UserPoints.points` | Can be negative | Allow point penalties |
| `UserPoints.eventType` | Must exist in PointRule table | Prevent orphan events |
| `UserLevel.currentLevel` | >= 1, <= 50 | Enforce level bounds |
| `UserLevel.totalPoints` | >= 0 | Points can't go negative overall |
| `PreTestResult.score` | 0 <= score <= 100 | Percentage range |
| `PostTestResult.score` | 0 <= score <= 100 | Percentage range |
| `PostTestResult.improvementPercent` | Can be negative | Allow regression tracking |
| `PointRule.points` | Range: -1000 to +1000 | Prevent extreme values |
| `LevelDefinition.level` | Unique, sequential | No level gaps |
| `BadgeDefinition.criteria` | Valid JSON schema | Prevent parsing errors |

### 6.2 Business Logic Validations

**Pre-Test Validations:**
- Can only take pre-test once per course/module
- Must take pre-test before or at enrollment (not after 50% progress)
- Pre-test quiz must have `quizType = 'PRE_TEST'`
- Cannot retake pre-test (baseline should be initial only)

**Post-Test Validations:**
- Can only take post-test after 90% course progress
- Post-test quiz must have `quizType = 'POST_TEST'`
- Can retake post-test (take highest score for improvement calc)
- If no pre-test exists, skip improvement calculation

**Point Award Validations:**
- Event cannot award points more than once for same source (e.g., can't complete same lesson twice for points)
- Exception: Repeatable events like `DAILY_LOGIN`
- Point transactions must have valid `sourceType` and `sourceId`
- Bonus points (first-attempt, perfect score) require base event to occur first

**Level-Up Validations:**
- Level-up only when crossing exact threshold
- Cannot manually set level (only via point accumulation)
- Level perks activate immediately upon level-up
- Level-up bonus points don't count toward next level threshold

### 6.3 Concurrent Transaction Safety

**Scenario:** User completes lesson while quiz is being submitted

**Solution:** Use database transactions
```
BEGIN TRANSACTION
  1. Insert UserPoints record
  2. Update UserLevel.totalPoints
  3. Check level threshold
  4. If crossed: Update currentLevel, insert LEVEL_UP points
COMMIT
```

**Idempotency:** Point award events should be idempotent
- Check if points already awarded for `(userId, eventType, sourceId)` before inserting
- Use unique constraint: `@@unique([userId, eventType, sourceId])` on a deduplication table

---

## 7. BACKWARD COMPATIBILITY NOTES

### 7.1 Non-Breaking Integration

**✅ Gamification is Additive Only**
- No modifications to existing tables: `Course`, `Module`, `Lesson`, `Enrollment`, `QuizAttempt`, `AssignmentSubmission`
- All gamification data lives in new tables
- Existing LMS functionality works identically with or without gamification enabled

**✅ Opt-In Architecture**
- System can run with gamification disabled (feature flag)
- If disabled: New tables remain empty, no point awards processed
- If enabled: Events trigger point awards asynchronously (non-blocking)

**✅ Quiz Table Extension (Minimal)**
- Add optional `quizType` field to existing `Quiz` table
- Default value: `"LESSON_QUIZ"` (backward compatible)
- Existing quizzes automatically marked as lesson quizzes
- New quiz types: `PRE_TEST`, `POST_TEST`, `PRACTICE_QUIZ`, `CERTIFICATION_TEST`

**Migration Path:**
```sql
-- Add quizType field with default
ALTER TABLE lms_quizzes 
ADD COLUMN quiz_type VARCHAR(50) DEFAULT 'LESSON_QUIZ';

-- This doesn't break existing quizzes
```

### 7.2 Event Listener Pattern

**Existing LMS Emits Events (No Code Change Required):**
```
Current Code:
  await lessonProgressService.markComplete(lessonId);
  
Enhanced Code:
  await lessonProgressService.markComplete(lessonId);
  eventEmitter.emit('LESSON_COMPLETED', { userId, lessonId, courseId });
```

**Gamification Listens:**
```
eventEmitter.on('LESSON_COMPLETED', async (data) => {
  await awardPoints(data.userId, 'LESSON_COMPLETED', 'lesson', data.lessonId);
});
```

**This pattern allows:**
- Gamification to be plugged in without modifying core LMS services
- Easy disable: Just don't register event listeners
- Future events (from other modules) can trigger points

### 7.3 Data Migration Strategy

**Phase 1: Schema Deployment (No Data Impact)**
- Create all new gamification tables
- Add `quizType` field to Quiz table with default
- Deploy without activating gamification

**Phase 2: Backfill (Optional)**
- Create UserLevel record for all existing users (level 1, 0 points)
- Seed LevelDefinition table with initial levels
- Seed PointRule table with default point values
- Mark existing quizzes as `LESSON_QUIZ` type

**Phase 3: Activation**
- Enable gamification feature flag
- Start awarding points for new activities
- Optionally: Retroactive point awards for historical data (complex, not recommended)

**Phase 4: Testing**
- Shadow mode: Award points but don't display to users
- Validate point calculations
- Fix edge cases
- Go live

### 7.4 Rollback Safety

**If Gamification Needs to be Disabled:**
1. Set feature flag: `GAMIFICATION_ENABLED = false`
2. Event listeners stop processing
3. Point awards halt
4. UI hides gamification elements
5. Core LMS continues functioning normally

**If Gamification Needs to be Removed:**
1. Disable feature flag
2. Drop event listeners
3. Optionally: Drop gamification tables (data deleted)
4. Remove `quizType` field from Quiz table (or leave with default)

**Critical:** Removal of gamification does NOT break LMS core because:
- No foreign keys from LMS core to gamification tables
- All gamification relations use `onDelete: Cascade` (one-way dependency)

### 7.5 API Backward Compatibility

**Existing LMS API Endpoints: Unchanged**
- `/lms/courses` - Still works
- `/lms/courses/:id/enroll` - Still works
- `/lms/lessons/:id/progress` - Still works

**New Gamification API Endpoints (Additive):**
- `/gamification/users/:userId/points` - Get points ledger
- `/gamification/users/:userId/level` - Get current level
- `/gamification/users/:userId/badges` - Get badges
- `/gamification/leaderboard` - Get top users
- `/gamification/rules` - Get point rules (admin)

**No breaking changes to existing frontend code**

---

## 8. EXTENSIBILITY DESIGN

### 8.1 Future Extension Points

**1. Team/Cohort Challenges**
- Add `CohortChallenge` table
- Link users to cohorts
- Award collective points
- Enable team leaderboards

**2. Time-Limited Events**
- Add `PointMultiplierEvent` table
- Define start/end dates
- Apply 2x/3x multipliers during events
- "Double XP Weekend"

**3. Custom Achievements**
- Beyond badges: "Complete 5 courses in Marketing category"
- Add `AchievementDefinition` and `UserAchievement` tables
- More complex criteria (multi-condition)

**4. Social Gamification**
- Peer endorsements (give points to others)
- Collaborative badges (awarded to groups)
- Mentorship points (mentor gets points when mentee succeeds)

**5. Redemption System**
- Add `RewardCatalog` table
- Users redeem points for perks
- "Spend 500 points for 1-on-1 session"

### 8.2 Plugin Architecture Readiness

**Gamification as a Module:**
```
/api/src/systems/gamification/
  ├── services/
  │   ├── points.service.ts
  │   ├── levels.service.ts
  │   ├── badges.service.ts
  │   └── leaderboard.service.ts
  ├── controllers/
  │   └── gamification.controller.ts
  ├── events/
  │   └── event-listeners.ts
  ├── routes/
  │   └── gamification.routes.ts
  └── index.ts (module entry point)
```

**Enable/Disable:**
```typescript
// In main app setup
if (process.env.GAMIFICATION_ENABLED === 'true') {
  app.use('/api/v1/gamification', gamificationRouter);
  registerGamificationEventListeners();
}
```

### 8.3 Third-Party Integration Hooks

**Webhook Support:**
- When user levels up: Send webhook to external service
- When badge earned: Trigger email/notification service
- When leaderboard updates: Sync to analytics platform

**Export API:**
- `GET /gamification/export/user/:userId` - Export user's gamification data (GDPR compliance)
- `POST /gamification/import/points` - Bulk import points from external system

---

## 9. IMPLEMENTATION PRIORITY

### Phase 1: Foundation (MVP)
1. ✅ UserPoints table
2. ✅ UserLevel table
3. ✅ PointRule table (seed with basic rules)
4. ✅ LevelDefinition table (seed 1-12)
5. ✅ Core point award logic
6. ✅ Level-up detection

**Deliverable:** Students earn points and level up

### Phase 2: Assessment Gamification
1. ✅ Add `quizType` field to Quiz table
2. ✅ PreTestResult table
3. ✅ PostTestResult table
4. ✅ Pre-test/Post-test flow
5. ✅ Improvement calculation logic

**Deliverable:** Pre/Post-tests with knowledge growth tracking

### Phase 3: Engagement
1. ✅ UserStreak table
2. ✅ Daily login tracking
3. ✅ Streak-based point awards

**Deliverable:** Daily engagement rewards

### Phase 4: Social (Optional)
1. ✅ BadgeDefinition table
2. ✅ UserBadge table
3. ✅ Badge award logic
4. ✅ Leaderboard API

**Deliverable:** Badges and leaderboards

### Phase 5: Advanced (Future)
1. ⏳ Multiplier events
2. ⏳ Cohort challenges
3. ⏳ Redemption system

---

## 10. SUCCESS METRICS

**Gamification Effectiveness KPIs:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Course Completion Rate | +20% improvement | Before/after gamification |
| Daily Active Users | +30% increase | Login frequency |
| Lesson Completion Rate | +25% improvement | Progress tracking |
| Quiz Pass Rate (First Attempt) | +15% improvement | QuizAttempt analysis |
| Average Score Improvement (Pre→Post) | >30% average | PostTestResult.improvementPercent |
| User Retention (30-day) | +25% improvement | Active users cohort analysis |
| Time to Course Completion | -15% reduction | Faster learning pace |
| User Satisfaction Score | >4.5/5 | Survey after gamification launch |

**Anti-Gaming Measures:**
- Monitor for suspicious point patterns (e.g., 1000 lessons completed in 1 hour)
- Implement rate limiting on point-earning actions
- Flag anomalies for manual review

---

## CONCLUSION

This gamification layer is designed to:

✅ **Integrate cleanly** with existing LMS without breaking changes  
✅ **Be extensible** for future features (badges, challenges, rewards)  
✅ **Track meaningful progress** via pre-test/post-test system  
✅ **Motivate learners** through points, levels, and achievements  
✅ **Remain optional** (can be disabled without impacting LMS core)  

**Next Steps:**
1. Review and approve this design
2. Refine point values based on desired engagement levels
3. Define initial badge set (if implementing Phase 4)
4. Plan UI/UX for displaying points/levels
5. Begin Phase 1 implementation

---

**Design Document End**
