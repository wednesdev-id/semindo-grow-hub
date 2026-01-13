# Core Architecture - Semindo Platform

## 1. Arsitektur Modular Monolithic

Platform Semindo dirancang dengan pendekatan **Modular Monolithic Architecture** yang memungkinkan:
- Pengembangan modular yang terpisah
- Kemudahan maintenance dan testing
- Kemampuan untuk diskalakan menjadi microservices di masa depan
- Shared resources dengan batasan yang jelas

### 1.1 Struktur Core Modules

```
src/
├── core/                     # Core business logic
│   ├── auth/                # Authentication & Authorization
│   ├── user/                # User management
│   ├── assessment/          # Self-assessment engine
│   ├── dashboard/           # Personal dashboard
│   ├── learning/            # LMS module
│   ├── consultation/        # Consultation hub
│   ├── financing/           # Financing hub
│   ├── marketplace/         # UMKM marketplace
│   ├── export/              # Export hub
│   ├── community/           # Community forum
│   ├── monitoring/          # Growth monitoring
│   └── shared/              # Shared utilities
├── infrastructure/          # Infrastructure layer
│   ├── api/                 # API clients
│   ├── database/            # Database configuration
│   ├── storage/             # File storage
│   └── services/            # External services
├── presentation/            # Presentation layer
│   ├── components/          # Reusable components
│   ├── layouts/             # Layout components
│   └── pages/               # Page components
└── utils/                   # Utility functions
```

### 1.2 Dependency Flow

```
Presentation Layer → Core Modules → Infrastructure Layer
     ↓                 ↓                ↓
   Pages           Business Logic   External Services
   Components      Domain Models    Database
   Layouts         Services         Storage
```

## 2. Core Module Specifications

### 2.1 Auth Module
```typescript
// Domain Model
interface User {
  id: string;
  email: string;
  role: 'umkm' | 'consultant' | 'admin' | 'partner';
  profile: UserProfile;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Services
class AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>
  register(data: RegisterData): Promise<User>
  logout(): Promise<void>
  refreshToken(): Promise<string>
  resetPassword(email: string): Promise<void>
}
```

### 2.2 Assessment Module
```typescript
// Domain Model
interface Assessment {
  id: string;
  userId: string;
  category: BusinessCategory;
  responses: AssessmentResponse[];
  score: AssessmentScore;
  level: 'micro' | 'small' | 'medium';
  recommendations: Recommendation[];
  status: 'draft' | 'completed' | 'expired';
  createdAt: Date;
}

interface AssessmentEngine {
  calculateScore(responses: AssessmentResponse[]): AssessmentScore
  generateRecommendations(score: AssessmentScore): Recommendation[]
  determineLevel(score: AssessmentScore): BusinessLevel
}
```

### 2.3 Learning Module
```typescript
// Domain Model
interface Course {
  id: string;
  title: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  modules: CourseModule[];
  duration: number;
  certificate: Certificate;
}

interface LearningProgress {
  userId: string;
  courseId: string;
  completedModules: string[];
  totalScore: number;
  certificateEarned: boolean;
  lastAccessed: Date;
}

// Services
class LearningService {
  getCourses(level?: BusinessLevel): Promise<Course[]>
  enrollCourse(userId: string, courseId: string): Promise<void>
  updateProgress(userId: string, moduleId: string): Promise<void>
  generateCertificate(userId: string, courseId: string): Promise<Certificate>
}
```

## 3. Data Flow Architecture

### 3.1 Request Flow
```
User Action → Component → Service → Repository → Database
     ↓           ↓         ↓          ↓           ↓
   UI Event   Business  Data Access  ORM/Query  PostgreSQL
              Logic      Validation
```

### 3.2 Response Flow
```
Database → Repository → Service → Component → User Interface
    ↓          ↓         ↓         ↓           ↓
 PostgreSQL  Data Map   Business   State     UI Update
             Validation  Logic      Update
```

## 4. Scalability Strategy

### 4.1 Modular to Microservices Migration Path

Setiap core module dapat dipisahkan menjadi microservice independen:

```
Current: Modular Monolithic
├─ Auth Module      → Future: Auth Service
├─ Assessment Module → Future: Assessment Service
├─ Learning Module   → Future: Learning Service
├─ Consultation Module → Future: Consultation Service
└─ ... (other modules)
```

### 4.2 Service Communication
- **Current**: In-memory function calls
- **Future**: REST API / gRPC / Message Queue
- **Data Sharing**: Shared database → Database per service
- **Transaction**: ACID → Saga Pattern

## 5. Technology Stack Implementation

### 5.1 Frontend Architecture
```typescript
// Module-based component structure
src/modules/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── assessment/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
└── ... (other modules)
```

### 5.2 State Management
```typescript
// Global state with module-based slices
interface RootState {
  auth: AuthState;
  assessment: AssessmentState;
  learning: LearningState;
  consultation: ConsultationState;
  financing: FinancingState;
  marketplace: MarketplaceState;
  export: ExportState;
  community: CommunityState;
  monitoring: MonitoringState;
}
```

### 5.3 API Layer
```typescript
// Service-based API calls
class ApiClient {
  private baseURL: string;
  
  async request<T>(endpoint: string, options: RequestOptions): Promise<T>
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async put<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
}

// Module-specific API clients
class AssessmentApi {
  constructor(private client: ApiClient) {}
  
  async submitAssessment(data: AssessmentData): Promise<AssessmentResult>
  async getAssessmentHistory(userId: string): Promise<Assessment[]>
}
```

## 6. Security Architecture

### 6.1 Authentication Flow
```
User Login → JWT Token → Protected Routes → API Requests
    ↓          ↓            ↓              ↓
  Credentials  Token     Route Guard   Auth Header
  Validation   Storage   Validation    Verification
```

### 6.2 Authorization Strategy
- **Role-based Access Control (RBAC)**
- **Resource-based Authorization**
- **API Rate Limiting**
- **Data Encryption (AES-256)**

## 7. Performance Optimization

### 7.1 Caching Strategy
```
Browser Cache → React Query → API Cache → Database Cache
     ↓             ↓            ↓           ↓
   Static       State        Response    Query
   Assets       Management   Cache       Optimization
```

### 7.2 Code Splitting
```typescript
// Lazy loading for modules
const AssessmentModule = lazy(() => import('./modules/assessment'));
const LearningModule = lazy(() => import('./modules/learning'));
const MarketplaceModule = lazy(() => import('./modules/marketplace'));
```

## 8. Development Guidelines

### 8.1 Module Development Pattern
1. Define domain models and interfaces
2. Create service layer with business logic
3. Implement repository layer for data access
4. Build presentation components
5. Add module-specific hooks
6. Create comprehensive tests

### 8.2 Testing Strategy
```
Unit Tests → Integration Tests → E2E Tests
    ↓            ↓                ↎
 Services     Module Flow     User Journey
 Repository   API Integration  Critical Paths
```

## 9. Deployment Architecture

### 9.1 Current: Single Deployment
```
Frontend Build → Static Hosting (Netlify/Vercel)
    ↓
API Integration → Backend Services
```

### 9.2 Future: Microservices Deployment
```
Frontend → CDN
    ↓
API Gateway → Auth Service → Assessment Service → Learning Service
    ↓           ↓              ↓                    ↓
  Load       Auth DB      Assessment DB      Learning DB
  Balancer
```

## 10. Monitoring and Observability

### 10.1 Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Web Vitals
- **User Analytics**: Google Analytics 4
- **API Monitoring**: Response time & error rate

### 10.2 Business Metrics
- User engagement per module
- Assessment completion rate
- Learning progress tracking
- Consultation booking rate
- Marketplace transaction volume