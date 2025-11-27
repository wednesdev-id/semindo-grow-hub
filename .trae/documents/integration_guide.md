# Core Modules Integration Guide

## Overview
Panduan ini menjelaskan cara mengintegrasikan core modules Semindo dengan React application yang sudah ada. Core modules dirancang dengan pendekatan modular monolithic yang dapat diskalakan menjadi microservices.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application Layer                    │
├─────────────────────────────────────────────────────────────┤
│                    Core Module Layer                        │
│  ┌──────────┬────────────┬──────────┬──────────┬──────────┐  │
│  │   Auth   │Assessment  │ Learning │Consultation│  ...   │  │
│  │ Module   │  Module    │ Module   │  Module  │        │  │
│  └──────────┴────────────┴──────────┴──────────┴──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                Infrastructure Layer                         │
│  ┌──────────┬────────────┬──────────┬──────────┬──────────┐  │
│  │ API      │Storage     │Analytics │Notification│Logger  │  │
│  │ Client   │ Service    │ Service  │  Service   │Service │  │
│  └──────────┴────────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Integration Steps

### Step 1: Update App.tsx

Update file `src/App.tsx` untuk mengintegrasikan core modules:

```typescript
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";

// Import core modules
import { AuthProvider, bootstrapApplication } from "@/core";
import { useAuth } from "@/core";

// Import pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TentangKami from "./pages/TentangKami";
import LayananKonsultasi from "./pages/LayananKonsultasi";
import SelfAssessment from "./pages/SelfAssessment";
import LearningHub from "./pages/LearningHub";
import Marketplace from "./pages/Marketplace";
import FinancingHub from "./pages/FinancingHub";
import ExportHub from "./pages/ExportHub";
import Community from "./pages/Community";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";

// Import new pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AssessmentPage from "./pages/AssessmentPage";
import LearningPage from "./pages/LearningPage";
import ConsultationPage from "./pages/ConsultationPage";

const queryClient = new QueryClient();

// Component untuk tracking analytics
const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
};

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize core application
    const initializeApp = async () => {
      try {
        await bootstrapApplication();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize application:', error);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return <div>Initializing application...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsTracker />
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/tentang-kami" element={<TentangKami />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/layanan-konsultasi" element={<LayananKonsultasi />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/self-assessment" element={
                <ProtectedRoute>
                  <SelfAssessment />
                </ProtectedRoute>
              } />
              <Route path="/assessment/:id" element={
                <ProtectedRoute>
                  <AssessmentPage />
                </ProtectedRoute>
              } />
              <Route path="/learning-hub" element={
                <ProtectedRoute>
                  <LearningHub />
                </ProtectedRoute>
              } />
              <Route path="/learning/:courseId" element={
                <ProtectedRoute>
                  <LearningPage />
                </ProtectedRoute>
              } />
              <Route path="/marketplace" element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              } />
              <Route path="/financing-hub" element={
                <ProtectedRoute>
                  <FinancingHub />
                </ProtectedRoute>
              } />
              <Route path="/export-hub" element={
                <ProtectedRoute>
                  <ExportHub />
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path="/consultation" element={
                <ProtectedRoute>
                  <ConsultationPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
```

### Step 2: Create Core Module Hooks

Buat custom hooks untuk setiap module:

```typescript
// src/hooks/useAssessment.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getServices } from '@/core';

export const useAssessment = () => {
  const services = getServices();
  const queryClient = useQueryClient();

  // Get current assessment
  const { data: currentAssessment, isLoading } = useQuery({
    queryKey: ['currentAssessment'],
    queryFn: async () => {
      const assessmentService = services.getService('assessmentService');
      return await assessmentService.getCurrentAssessment();
    },
    enabled: true,
  });

  // Start new assessment
  const startAssessmentMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const assessmentService = services.getService('assessmentService');
      return await assessmentService.startAssessment(templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAssessment'] });
    }
  });

  // Submit assessment response
  const submitResponseMutation = useMutation({
    mutationFn: async ({ assessmentId, response }: { assessmentId: string; response: any }) => {
      const assessmentService = services.getService('assessmentService');
      return await assessmentService.submitResponse(assessmentId, response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAssessment'] });
    }
  });

  return {
    currentAssessment,
    isLoading,
    startAssessment: startAssessmentMutation.mutateAsync,
    submitResponse: submitResponseMutation.mutateAsync,
  };
};
```

### Step 3: Update Assessment Page

Update halaman assessment untuk menggunakan core modules:

```typescript
// src/pages/SelfAssessment.tsx
import React, { useState, useEffect } from 'react';
import { useAssessment } from '@/hooks/useAssessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

const SelfAssessment = () => {
  const { currentAssessment, startAssessment, isLoading } = useAssessment();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const navigate = useNavigate();

  const handleStartAssessment = async () => {
    if (!selectedTemplate) return;
    
    try {
      const result = await startAssessment(selectedTemplate);
      navigate(`/assessment/${result.assessmentId}`);
    } catch (error) {
      console.error('Failed to start assessment:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Self Assessment UMKM</CardTitle>
          </CardHeader>
          <CardContent>
            {currentAssessment ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Assessment Sedang Berlangsung</h3>
                  <Button 
                    onClick={() => navigate(`/assessment/${currentAssessment.id}`)}
                    variant="outline"
                  >
                    Lanjutkan
                  </Button>
                </div>
                <Progress value={currentAssessment.progress} />
                <p className="text-sm text-gray-600">
                  Progress: {currentAssessment.progress}%
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pilih Kategori Assessment
                  </label>
                  <select 
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Pilih kategori...</option>
                    <option value="digital-readiness">Kesiapan Digital</option>
                    <option value="business-maturity">Kematangan Bisnis</option>
                    <option value="financial-health">Kesehatan Keuangan</option>
                  </select>
                </div>
                
                <Button 
                  onClick={handleStartAssessment}
                  disabled={!selectedTemplate || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Memulai...' : 'Mulai Assessment'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelfAssessment;
```

### Step 4: Environment Configuration

Update file `.env`:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_ENVIRONMENT=development

# Authentication
VITE_JWT_SECRET=your-jwt-secret-key
VITE_TOKEN_EXPIRATION=3600

# Encryption
VITE_ENCRYPTION_KEY=your-encryption-key

# Features
VITE_FEATURE_ASSESSMENT=true
VITE_FEATURE_LEARNING=true
VITE_FEATURE_CONSULTATION=true
VITE_FEATURE_FINANCING=true
VITE_FEATURE_MARKETPLACE=true
VITE_FEATURE_EXPORT=true
VITE_FEATURE_COMMUNITY=true
VITE_FEATURE_MONITORING=true
```

### Step 5: TypeScript Configuration

Update `tsconfig.json` untuk include path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/core": ["src/core/index.ts"],
      "@/core/*": ["src/core/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

## Module-Specific Integration

### Authentication Module

```typescript
// Usage in components
import { useAuth } from '@/core';

const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    await login({
      email: formData.get('email') as string,
      password: formData.get('password') as string
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### Assessment Module

```typescript
// Usage in assessment pages
import { useAssessment } from '@/hooks/useAssessment';

const AssessmentForm = () => {
  const { currentAssessment, submitResponse } = useAssessment();
  
  const handleAnswerChange = async (questionId: string, answer: any) => {
    await submitResponse({
      assessmentId: currentAssessment.id,
      response: {
        questionId,
        answer,
        timeSpent: 30
      }
    });
  };
  
  return (
    <div>
      {/* Assessment questions */}
    </div>
  );
};
```

## State Management Integration

Core modules menggunakan React Query untuk state management:

```typescript
// Global state configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Query keys for different modules
export const QUERY_KEYS = {
  auth: {
    currentUser: ['currentUser'],
    userProfile: (userId: string) => ['userProfile', userId],
  },
  assessment: {
    current: ['currentAssessment'],
    history: ['assessmentHistory'],
    templates: ['assessmentTemplates'],
    results: (id: string) => ['assessmentResults', id],
  },
  learning: {
    courses: ['courses'],
    enrolled: ['enrolledCourses'],
    progress: (courseId: string) => ['courseProgress', courseId],
  },
  // ... other modules
};
```

## Error Handling

Global error handling untuk core modules:

```typescript
// Error boundary
class CoreErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Core error:', error, errorInfo);
    
    // Send to monitoring service
    const services = getServices();
    const monitoringService = services.getService('monitoringService');
    monitoringService.logError({
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date()
    });
  }
  
  render() {
    return this.props.children;
  }
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Send to monitoring service
  const services = getServices();
  const monitoringService = services.getService('monitoringService');
  monitoringService.logError({
    type: 'unhandled_rejection',
    message: event.reason?.message || 'Unknown error',
    stack: event.reason?.stack,
    timestamp: new Date()
  });
});
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy loading for core modules
const AssessmentModule = lazy(() => import('@/core/assessment'));
const LearningModule = lazy(() => import('@/core/learning'));
const MarketplaceModule = lazy(() => import('@/core/marketplace'));

// Usage in routes
<Route 
  path="/assessment" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <AssessmentModule />
    </Suspense>
  }
/>
```

### Caching Strategy

```typescript
// Cache configuration
const cacheConfig = {
  assessment: {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 50,
    strategy: 'LRU'
  },
  userProfile: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 10,
    strategy: 'FIFO'
  }
};
```

## Testing Strategy

### Unit Testing

```typescript
// Test core modules
import { AssessmentEngine } from '@/core/assessment/services/AssessmentEngine';

describe('AssessmentEngine', () => {
  it('should calculate score correctly', () => {
    const engine = new AssessmentEngine();
    const assessment = createMockAssessment();
    const template = createMockTemplate();
    
    const result = engine.calculateScore(assessment, template);
    
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });
});
```

### Integration Testing

```typescript
// Test React integration
import { renderHook } from '@testing-library/react-hooks';
import { useAssessment } from '@/hooks/useAssessment';

describe('useAssessment hook', () => {
  it('should start assessment successfully', async () => {
    const { result } = renderHook(() => useAssessment());
    
    await act(async () => {
      await result.current.startAssessment('template-1');
    });
    
    expect(result.current.currentAssessment).toBeDefined();
  });
});
```

## Deployment Considerations

### Environment Variables

```bash
# Production deployment
VITE_API_URL=https://api.semindo.id
VITE_ENVIRONMENT=production
VITE_ENCRYPTION_KEY=your-production-encryption-key
VITE_SENTRY_DSN=your-sentry-dsn
```

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'core-modules': ['./src/core/index.ts'],
          'vendor': ['react', 'react-dom', '@tanstack/react-query'],
        },
      },
    },
  },
});
```

## Migration Path to Microservices

### Phase 1: Modular Monolithic (Current)
- All modules in single codebase
- Shared database
- In-memory communication
- Single deployment

### Phase 2: Service Separation
- Separate module repositories
- Shared API gateway
- Database per service
- Message queue communication

### Phase 3: Full Microservices
- Independent deployments
- Service mesh
- Distributed tracing
- Auto-scaling per service

## Monitoring and Observability

```typescript
// Application monitoring
const initializeMonitoring = () => {
  // Sentry for error tracking
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  // Analytics
  const analytics = getServices().getService('analyticsService');
  analytics.initialize({
    trackingId: import.meta.env.VITE_GA_TRACKING_ID,
    debug: import.meta.env.VITE_ENVIRONMENT === 'development'
  });
};
```

## Conclusion

Core modules Semindo telah berhasil diintegrasikan dengan React application yang ada. Arsitektur modular memungkinkan:

1. **Pengembangan Terpisah**: Setiap module dapat dikembangkan secara independen
2. **Testing Terisolasi**: Unit testing mudah dilakukan per module
3. **Scalability**: Mudah dimigrasi ke microservices di masa depan
4. **Maintainability**: Kode yang terorganisir dan mudah dipahami
5. **Reusability**: Module dapat digunakan di berbagai aplikasi

Selanjutnya, tim development dapat mulai mengimplementasikan business logic untuk setiap module sesuai dengan kebutuhan UMKM di Indonesia.