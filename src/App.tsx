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
    let mounted = true;
    initializeServices().then(() => {
      if (mounted) setReady(true);
    }).catch(() => {
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
              <AnalyticsTracker />
              <Routes>
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
                <Route path="*" element={<NotFound />} />
              </Routes>
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
