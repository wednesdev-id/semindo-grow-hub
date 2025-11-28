import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useMemo, useState } from "react";
import { AuthProvider } from "@core/auth/hooks/useAuth";
import { ServiceContainer, initializeServices } from "@core/application";
import { AuthService } from "@core/auth/services/AuthService";
import { TokenService } from "@core/auth/services/TokenService";
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
import Dashboard from "./pages/dashboards/Dashboard";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AssessmentFormPage from "./features/assessment/pages/AssessmentFormPage";
import AssessmentResultsPage from "./features/assessment/pages/AssessmentResultsPage";
import AppLayout from "./layout/AppLayout";
import { AuthProvider as NewAuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Component untuk tracking analytics
const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const App = () => {
  const container = useMemo(() => ServiceContainer.getInstance(), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log('App: Initializing services...')
    let mounted = true;
    initializeServices().then(() => {
      console.log('App: Services initialized')
      if (mounted) setReady(true);
    }).catch((err) => {
      console.error('App: Service initialization failed', err)
      if (mounted) setReady(false);
    });
    return () => { mounted = false };
  }, []);

  const authService = ready ? container.getService<AuthService>("authService") : undefined;
  const tokenService = ready ? container.getService<TokenService>("tokenService") : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {ready && authService && tokenService ? (
            <AuthProvider authService={authService} tokenService={tokenService}>
              <NewAuthProvider>
                <AnalyticsTracker />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/tentang-kami" element={<TentangKami />} />
                  <Route path="/layanan-konsultasi" element={<LayananKonsultasi />} />
                  <Route path="/self-assessment" element={<SelfAssessment />} />
                  <Route path="/learning-hub" element={<LearningHub />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/financing-hub" element={<FinancingHub />} />
                  <Route path="/export-hub" element={<ExportHub />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Dashboard Routes with Sidebar Layout */}
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/assessment" element={<AssessmentFormPage />} />
                    <Route path="/assessment/results/:id" element={<AssessmentResultsPage />} />
                    <Route path="/profile" element={<div className="p-6">Profile Page (Coming Soon)</div>} />
                    <Route path="/consultation" element={<div className="p-6">Consultation Page (Coming Soon)</div>} />
                    <Route path="/financing" element={<div className="p-6">Financing Page (Coming Soon)</div>} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NewAuthProvider>
            </AuthProvider>
          ) : (
            <Routes>
              <Route path="*" element={<Index />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
