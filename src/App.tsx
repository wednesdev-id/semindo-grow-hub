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
import AppLayout from "./layout/AppLayout";
import { AuthProvider as NewAuthProvider } from "./contexts/AuthContext";
import PlaceholderPage from "./components/PlaceholderPage";
import LearningLayout from "./layout/LearningLayout";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TentangKami = lazy(() => import("./pages/TentangKami"));
const LayananKonsultasi = lazy(() => import("./pages/LayananKonsultasi"));
const SelfAssessment = lazy(() => import("./pages/SelfAssessment"));
const LearningHub = lazy(() => import("./pages/LearningHub"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const FinancingHub = lazy(() => import("./pages/FinancingHub"));
const ExportHub = lazy(() => import("./pages/ExportHub"));
const Community = lazy(() => import("./pages/Community"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/dashboards/Dashboard"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const AssessmentLandingPage = lazy(() => import("./features/assessment/pages/AssessmentLandingPage"));
const AssessmentHistoryPage = lazy(() => import("./features/assessment/pages/AssessmentHistoryPage"));
const AssessmentWizardPage = lazy(() => import("./features/assessment/pages/AssessmentWizardPage"));
const AssessmentResultsPage = lazy(() => import("./features/assessment/pages/AssessmentResultsPage"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const UMKMProfileWizard = lazy(() => import("./pages/profile/UMKMProfileWizard"));
const CourseCatalogPage = lazy(() => import("./features/lms/pages/CourseCatalogPage"));
const MyCoursesPage = lazy(() => import("./features/lms/pages/MyCoursesPage"));
const CourseDetailPage = lazy(() => import("./features/lms/pages/CourseDetailPage"));
const LessonView = lazy(() => import("./features/lms/pages/LessonView"));
const ProductDetailPage = lazy(() => import("./features/marketplace/pages/ProductDetailPage"));
const ProductListPage = lazy(() => import("./features/marketplace/pages/ProductListPage"));
const LoanApplicationForm = lazy(() => import("./pages/financing/LoanApplicationForm"));

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
                <Suspense fallback={<LoadingSpinner />}>
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
                      <Route path="/dashboard/overview" element={<Dashboard />} />
                      <Route path="/dashboard/activity" element={<PlaceholderPage title="Aktivitas Terbaru" />} />
                      <Route path="/dashboard/user-stats" element={<PlaceholderPage title="Statistik Pengguna" />} />
                      <Route path="/dashboard/server-status" element={<PlaceholderPage title="Status Server & API" />} />
                      <Route path="/dashboard/notifications" element={<PlaceholderPage title="Notifikasi Sistem" />} />

                      {/* User Management */}
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/users/all" element={<UserManagement />} />
                      <Route path="/users/roles" element={<PlaceholderPage title="Manajemen Role & Permission" />} />
                      <Route path="/users/umkm" element={<UserManagement defaultRole="umkm" />} />
                      <Route path="/users/mentors" element={<UserManagement defaultRole="mentor" />} />
                      <Route path="/users/trainers" element={<UserManagement defaultRole="trainer" />} />
                      <Route path="/users/staff" element={<UserManagement defaultRole="staff" />} />
                      <Route path="/users/admins" element={<UserManagement defaultRole="admin" />} />
                      <Route path="/users/import-export" element={<PlaceholderPage title="Import / Export Data User" />} />
                      <Route path="/users/audit" element={<PlaceholderPage title="Audit User Activity" />} />

                      {/* UMKM Database */}
                      <Route path="/umkm/list" element={<UserManagement defaultRole="umkm" />} />
                      <Route path="/umkm/segmentation" element={<PlaceholderPage title="Segmentasi UMKM" />} />
                      <Route path="/umkm/region" element={<PlaceholderPage title="Region Mapping" />} />
                      <Route path="/umkm/assessment-status" element={<PlaceholderPage title="Status Self-Assessment" />} />
                      <Route path="/umkm/program-status" element={<PlaceholderPage title="Status Program" />} />
                      <Route path="/umkm/history" element={<PlaceholderPage title="Histori Pendampingan" />} />
                      <Route path="/umkm/documents" element={<PlaceholderPage title="Dokumen & Verifikasi" />} />

                      {/* Mentor Management */}
                      <Route path="/mentors/list" element={<UserManagement defaultRole="mentor" />} />
                      <Route path="/mentors/assign" element={<PlaceholderPage title="Assign UMKM ke Mentor" />} />
                      <Route path="/mentors/activity" element={<PlaceholderPage title="Status & Aktivitas Mentor" />} />
                      <Route path="/mentors/schedule" element={<PlaceholderPage title="Jadwal Pendampingan" />} />
                      <Route path="/mentors/reports" element={<PlaceholderPage title="Laporan & KPI Mentor" />} />
                      <Route path="/mentors/approval" element={<PlaceholderPage title="Approval Laporan" />} />

                      {/* Program Management */}
                      <Route path="/programs/list" element={<PlaceholderPage title="Daftar Program" />} />
                      <Route path="/programs/create" element={<PlaceholderPage title="Buat Program Baru" />} />
                      <Route path="/programs/batches" element={<PlaceholderPage title="Batch Management" />} />
                      <Route path="/programs/curriculum" element={<PlaceholderPage title="Kurikulum Program" />} />
                      <Route path="/programs/schedule" element={<PlaceholderPage title="Jadwal Training & Event" />} />
                      <Route path="/programs/participants" element={<PlaceholderPage title="Peserta per Program" />} />
                      <Route path="/programs/evaluation" element={<PlaceholderPage title="Outcome & Evaluasi" />} />
                      <Route path="/programs/import-export" element={<PlaceholderPage title="Import / Export Program" />} />

                      {/* LMS Manager */}
                      <Route path="/lms/catalog" element={<CourseCatalogPage />} />
                      <Route path="/lms/my-courses" element={<MyCoursesPage />} />
                      <Route path="/lms/courses/:slug" element={<CourseDetailPage />} />
                      <Route path="/lms/create" element={<PlaceholderPage title="Buat Kelas Baru" />} />
                      <Route path="/lms/modules" element={<PlaceholderPage title="Modul & Materi" />} />
                      <Route path="/lms/videos" element={<PlaceholderPage title="Video Library" />} />
                      <Route path="/lms/assignments" element={<PlaceholderPage title="Assignment & Quiz" />} />
                      <Route path="/lms/certificates" element={<PlaceholderPage title="Sertifikasi" />} />
                      <Route path="/lms/trainers" element={<PlaceholderPage title="Trainer Management" />} />
                      <Route path="/lms/review" element={<PlaceholderPage title="Review & Moderasi Materi" />} />
                      <Route path="/lms/stats" element={<PlaceholderPage title="Statistik LMS" />} />

                      {/* Marketplace Manager */}
                      <Route path="/marketplace/products" element={<ProductListPage />} />
                      <Route path="/marketplace/product/:slug" element={<ProductDetailPage />} />
                      <Route path="/marketplace/verification" element={<PlaceholderPage title="Verifikasi Produk" />} />
                      <Route path="/marketplace/stores" element={<PlaceholderPage title="Toko UMKM" />} />
                      <Route path="/marketplace/orders" element={<PlaceholderPage title="Transaksi & Order" />} />
                      <Route path="/marketplace/complaints" element={<PlaceholderPage title="Komplain & Resolusi" />} />
                      <Route path="/marketplace/fees" element={<PlaceholderPage title="Fee & Komisi Marketplace" />} />
                      <Route path="/marketplace/integration" element={<PlaceholderPage title="Integrasi Marketplace Eksternal" />} />
                      <Route path="/marketplace/reports" element={<PlaceholderPage title="Laporan Marketplace" />} />

                      {/* Financing Manager */}
                      <Route path="/financing/apply/:partnerSlug" element={<LoanApplicationForm />} />
                      <Route path="/financing/products" element={<PlaceholderPage title="Produk Pembiayaan" />} />
                      <Route path="/financing/applications" element={<PlaceholderPage title="Pengajuan UMKM" />} />
                      <Route path="/financing/verification" element={<PlaceholderPage title="Tahapan Verifikasi" />} />
                      <Route path="/financing/approval" element={<PlaceholderPage title="Approval Pembiayaan" />} />
                      <Route path="/financing/documents" element={<PlaceholderPage title="Dokumen Pembiayaan" />} />
                      <Route path="/financing/partners" element={<PlaceholderPage title="Kerjasama Bank / Lembaga Keuangan" />} />
                      <Route path="/financing/reports" element={<PlaceholderPage title="Reporting Pembiayaan" />} />

                      {/* Export Hub Manager */}
                      <Route path="/export/guide" element={<PlaceholderPage title="Panduan Ekspor" />} />
                      <Route path="/export/buyers" element={<PlaceholderPage title="Buyer Directory" />} />
                      <Route path="/export/checklist" element={<PlaceholderPage title="Checklist Ekspor" />} />
                      <Route path="/export/documents" element={<PlaceholderPage title="Dokumen Ekspor" />} />
                      <Route path="/export/facilitation" element={<PlaceholderPage title="Fasilitasi Ekspor" />} />
                      <Route path="/export/approval" element={<PlaceholderPage title="Approval Permintaan Konsultasi" />} />
                      <Route path="/export/reports" element={<PlaceholderPage title="Laporan Ekspor" />} />

                      {/* Consultation Management */}
                      <Route path="/consultation/schedule" element={<PlaceholderPage title="Jadwal Konsultasi" />} />
                      <Route path="/consultation/assignment" element={<PlaceholderPage title="Mentor Assignment" />} />
                      <Route path="/consultation/history" element={<PlaceholderPage title="Riwayat Konsultasi" />} />
                      <Route path="/consultation/chat" element={<PlaceholderPage title="Chat Monitoring" />} />
                      <Route path="/consultation/tickets" element={<PlaceholderPage title="Case Ticketing System" />} />
                      <Route path="/consultation/specialized" element={<PlaceholderPage title="Konsultasi Ekspor / Legal / Digital" />} />

                      {/* Community Platform Manager */}
                      <Route path="/community/forum" element={<PlaceholderPage title="Forum Diskusi" />} />
                      <Route path="/community/topics" element={<PlaceholderPage title="Manajemen Topik" />} />
                      <Route path="/community/posts" element={<PlaceholderPage title="Post & Komentar" />} />
                      <Route path="/community/moderation" element={<PlaceholderPage title="Moderasi Konten" />} />
                      <Route path="/community/events" element={<PlaceholderPage title="Event Komunitas" />} />
                      <Route path="/community/reports" element={<PlaceholderPage title="Report Misconduct" />} />

                      {/* Analytics & Reporting */}
                      <Route path="/analytics/umkm" element={<PlaceholderPage title="UMKM Analytics" />} />
                      <Route path="/analytics/programs" element={<PlaceholderPage title="Program Analytics" />} />
                      <Route path="/analytics/lms" element={<PlaceholderPage title="LMS Insights" />} />
                      <Route path="/analytics/mentoring" element={<PlaceholderPage title="Pendampingan Analytics" />} />
                      <Route path="/analytics/financing" element={<PlaceholderPage title="Pembiayaan Analytics" />} />
                      <Route path="/analytics/marketplace" element={<PlaceholderPage title="Marketplace Analytics" />} />
                      <Route path="/analytics/export" element={<PlaceholderPage title="Export Analytics" />} />
                      <Route path="/analytics/kpi" element={<PlaceholderPage title="Performance KPI" />} />
                      <Route path="/analytics/visualization" element={<PlaceholderPage title="Data Visualization & Export" />} />

                      {/* System Settings */}
                      <Route path="/settings/general" element={<PlaceholderPage title="General Settings" />} />
                      <Route path="/settings/branding" element={<PlaceholderPage title="Branding & Identitas Visual" />} />
                      <Route path="/settings/notifications" element={<PlaceholderPage title="Email & Notification Settings" />} />
                      <Route path="/settings/api-keys" element={<PlaceholderPage title="API Key Manager" />} />
                      <Route path="/settings/integrations" element={<PlaceholderPage title="Integrasi Pihak Ketiga" />} />
                      <Route path="/settings/backup" element={<PlaceholderPage title="Backup & Restore" />} />
                      <Route path="/settings/environment" element={<PlaceholderPage title="Environment Configuration" />} />

                      {/* Logs & Security */}
                      <Route path="/logs/login" element={<PlaceholderPage title="Login Log" />} />
                      <Route path="/logs/activity" element={<PlaceholderPage title="Activity Log" />} />
                      <Route path="/logs/error" element={<PlaceholderPage title="Error Log" />} />
                      <Route path="/logs/security" element={<PlaceholderPage title="Security & Permission Audit" />} />
                      <Route path="/logs/firewall" element={<PlaceholderPage title="Firewall Rules" />} />
                      <Route path="/logs/api" element={<PlaceholderPage title="API Access Logs" />} />
                      <Route path="/logs/backups" element={<PlaceholderPage title="Backup Logs" />} />

                      {/* Tools */}
                      <Route path="/tools/import-export" element={<PlaceholderPage title="Import / Export Tools" />} />
                      <Route path="/tools/cleaner" element={<PlaceholderPage title="Data Cleaner" />} />
                      <Route path="/tools/bulk-editor" element={<PlaceholderPage title="Bulk Editor" />} />
                      <Route path="/tools/sandbox" element={<PlaceholderPage title="Sandbox Mode" />} />
                      <Route path="/tools/cache" element={<PlaceholderPage title="Cache Manager" />} />

                      <Route path="/assessment" element={<AssessmentLandingPage />} />
                      <Route path="/assessment/history" element={<AssessmentHistoryPage />} />
                      <Route path="/assessment/:id" element={<AssessmentWizardPage />} />
                      <Route path="/assessment/results/:id" element={<AssessmentResultsPage />} />
                      <Route path="/profile" element={<UMKMProfileWizard />} />
                      <Route path="/consultation" element={<PlaceholderPage title="Consultation" />} />
                      <Route path="/financing" element={<PlaceholderPage title="Financing" />} />
                    </Route>

                    {/* Learning Routes - Distraction Free */}
                    <Route element={<LearningLayout />}>
                      <Route path="/lms/learn/:slug" element={<LessonView />} />
                      <Route path="/lms/learn/:slug/lesson/:lessonId" element={<LessonView />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
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
