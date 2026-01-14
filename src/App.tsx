import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useMemo, useState } from "react";
import { AuthProvider } from "@core/auth/hooks/useAuth";
import { ServiceContainer, bootstrapApplication } from "@core/application";
import { AuthService } from "@core/auth/services/AuthService";
import { TokenService } from "@core/auth/services/TokenService";
import AppLayout from "./layout/AppLayout";
import { AuthProvider as NewAuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import FeaturePreviewPage from "./components/dashboard/FeaturePreviewPage";
import LearningLayout from "./layout/LearningLayout";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TentangKami = lazy(() => import("./pages/TentangKami"));
const LayananKonsultasi = lazy(() => import("./pages/LayananKonsultasi"));
const SelfAssessment = lazy(() => import("./pages/SelfAssessment"));
const LearningHub = lazy(() => import("./pages/LearningHub"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const ProductDetail = lazy(() => import("./pages/marketplace/ProductDetail"));
const Cart = lazy(() => import("./pages/marketplace/Cart"));
const Checkout = lazy(() => import("./pages/marketplace/Checkout"));
const PaymentSimulationPage = lazy(() => import("./features/marketplace/pages/PaymentSimulationPage"));
const OrderHistory = lazy(() => import("./pages/marketplace/OrderHistory"));
// Consolidated with SellerDashboard
const FinancingHub = lazy(() => import("./pages/FinancingHub"));
const ExportHub = lazy(() => import("./pages/ExportHub"));
const CommunityLayout = lazy(() => import("./components/layouts/CommunityLayout").then(module => ({ default: module.CommunityLayout })));
const ForumLandingPage = lazy(() => import("./pages/community/ForumLandingPage").then(module => ({ default: module.ForumLandingPage })));
const ThreadListPage = lazy(() => import("./pages/community/ThreadListPage").then(module => ({ default: module.ThreadListPage })));
const Wishlist = lazy(() => import("./pages/marketplace/Wishlist"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ThreadDetailPage = lazy(() => import("./pages/community/ThreadDetailPage").then(module => ({ default: module.ThreadDetailPage })));
const EventListPage = lazy(() => import("./pages/community/EventListPage").then(module => ({ default: module.EventListPage })));
const EventDetailPage = lazy(() => import("./pages/community/EventDetailPage").then(module => ({ default: module.EventDetailPage })));
const BusinessOnboardingPage = lazy(() => import("./pages/onboarding/BusinessOnboardingPage"));
const ProgramListPage = lazy(() => import("./pages/admin/program/ProgramListPage").then(module => ({ default: module.ProgramListPage })));
const ProgramDetailPage = lazy(() => import("./pages/admin/program/ProgramDetailPage").then(module => ({ default: module.ProgramDetailPage })));
const ProgramLandingPage = lazy(() => import("./pages/program/ProgramLandingPage").then(module => ({ default: module.ProgramLandingPage })));
const MyProgramsPage = lazy(() => import("./pages/program/MyProgramsPage").then(module => ({ default: module.MyProgramsPage })));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/dashboards/Dashboard"));
const ConsultantDashboard = lazy(() => import("./pages/dashboards/ConsultantDashboard"));
const CreateCoursePage = lazy(() => import("./pages/lms/CreateCoursePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const AssessmentLandingPage = lazy(() => import("./features/assessment/pages/AssessmentLandingPage"));
const AssessmentHistoryPage = lazy(() => import("./features/assessment/pages/AssessmentHistoryPage"));
const AssessmentWizardPage = lazy(() => import("./features/assessment/pages/AssessmentWizardPage"));
const AssessmentResultsPage = lazy(() => import("./features/assessment/pages/AssessmentResultsPage"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ConsultantManagement = lazy(() => import("./pages/users/ConsultantManagement"));
const MyProfile = lazy(() => import("./pages/profile/MyProfile"));
const ChangePassword = lazy(() => import("./pages/profile/ChangePassword"));
const UMKMProfileWizard = lazy(() => import("./pages/profile/UMKMProfileWizard"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const PermissionManagement = lazy(() => import("./pages/admin/PermissionManagement"));
const RoleDetail = lazy(() => import("./pages/admin/RoleDetail"));
const RolePermissionMatrix = lazy(() => import("./pages/admin/RolePermissionMatrix"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const CourseCatalogPage = lazy(() => import("./features/lms/pages/CourseCatalogPage"));
const MyCoursesPage = lazy(() => import("./features/lms/pages/MyCoursesPage"));
const CourseDetailPage = lazy(() => import("./features/lms/pages/CourseDetailPage"));
const LessonView = lazy(() => import("./features/lms/pages/LessonView"));
const ProductListPage = lazy(() => import("./features/marketplace/pages/ProductListPage"));
const LoanApplicationForm = lazy(() => import("./pages/financing/LoanApplicationForm"));

// New Dashboard Pages
const InstructorCourseManagement = lazy(() => import("./features/lms/pages/instructor/InstructorCourseManagement"));
const LMSStats = lazy(() => import("./features/lms/pages/admin/LMSStats"));
const LMSCreateCourse = lazy(() => import("./features/lms/pages/admin/LMSCreateCourse"));
const CourseCategoryManagement = lazy(() => import('./features/lms/pages/admin/CourseCategoryManagement'));
const LMSCourseEditor = lazy(() => import("./features/lms/pages/admin/LMSCourseEditor"));
const MarketplaceStats = lazy(() => import("./features/marketplace/pages/admin/MarketplaceStats"));
const MarketplaceOrderList = lazy(() => import("./features/marketplace/pages/admin/MarketplaceOrderList"));
const MarketplaceProductVerification = lazy(() => import("./features/marketplace/pages/admin/MarketplaceProductVerification"));
const FinancingApplicationList = lazy(() => import("./pages/financing/admin/FinancingApplicationList"));
const FinancingPartnerList = lazy(() => import("./pages/financing/admin/FinancingPartnerList"));
const UserRoleManagement = lazy(() => import("./pages/admin/UserRoleManagement"));
const UMKMDocumentVerification = lazy(() => import("./pages/admin/UMKMDocumentVerification"));
const ProgramList = lazy(() => import("./pages/programs/ProgramList"));
const ProgramCreate = lazy(() => import("./pages/programs/ProgramCreate"));
const UMKMListPage = lazy(() => import("./pages/admin/umkm/UMKMListPage"));
const UMKMApprovalPage = lazy(() => import("./pages/admin/umkm/UMKMApprovalPage"));
const UMKMFormPage = lazy(() => import("./pages/admin/umkm/UMKMFormPage"));
const UMKMDetailPage = lazy(() => import("./pages/admin/umkm/UMKMDetailPage"));
const UMKMSegmentationPage = lazy(() => import("./pages/admin/umkm/UMKMSegmentationPage"));
const UMKMRegionMapPage = lazy(() => import("./pages/admin/umkm/UMKMRegionMapPage"));
const SellerDashboard = lazy(() => import("./pages/marketplace/SellerDashboard"));
const ShipmentTrackingPage = lazy(() => import("./pages/marketplace/ShipmentTrackingPage"));
// Redundant admin seller dashboard removed
const MarketplaceAdminDashboard = lazy(() => import("./features/marketplace/pages/admin/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const MarketplaceProductList = lazy(() => import("./features/marketplace/pages/admin/MarketplaceProductList"));
const ProductUploadPage = lazy(() => import("./features/marketplace/pages/admin/ProductUploadPage"));
const AdminProductDetailPage = lazy(() => import("./features/marketplace/pages/admin/AdminProductDetailPage"));
const ProductModerationPage = lazy(() => import("./features/marketplace/pages/admin/ProductModerationPage"));

// Consultation Pages
const ConsultantList = lazy(() => import("./pages/consultation/ConsultantList"));
const ConsultantProfile = lazy(() => import("./pages/consultation/ConsultantProfile"));
const ConsultationDashboard = lazy(() => import("./pages/consultation/ConsultationDashboard"));
const SessionDetail = lazy(() => import("./pages/consultation/SessionDetail"));
const ConsultationChat = lazy(() => import("./pages/consultation/ConsultationChat"));
const ConsultantOnboarding = lazy(() => import("./pages/consultation/ConsultantOnboarding"));
const ConsultantProfileEdit = lazy(() => import("./pages/consultation/ConsultantProfileEdit"));
const SchedulePage = lazy(() => import("./pages/consultation/schedule/SchedulePage"));
const BookingConfirmationPage = lazy(() => import("./pages/consultation/schedule/BookingConfirmationPage"));
const ConsultantProfileSettings = lazy(() => import("./pages/consultation/ConsultantProfileSettings"));
const SessionHistoryPage = lazy(() => import("./pages/consultation/history/SessionHistoryPage"));
const ConsultationRequests = lazy(() => import("./pages/consultation/ConsultationRequests"));
const MyConsultations = lazy(() => import("./pages/consultation/MyConsultations"));
const ScheduleConsultationPage = lazy(() => import("./pages/consultation/ScheduleConsultationPage"));
const ConsultantDetailPage = lazy(() => import("./pages/consultation/ConsultantDetailPage"));

// Consultation Admin Pages
const ConsultationManagement = lazy(() => import("./pages/admin/consultation/ConsultationManagement"));
const ChatMonitoringPage = lazy(() => import("./pages/admin/consultation/ChatMonitoringPage"));
const ChatTranscriptPage = lazy(() => import("./pages/admin/consultation/ChatTranscriptPage"));
const PendingConsultants = lazy(() => import("./pages/admin/consultation/PendingConsultants"));
const ExpertiseManagement = lazy(() => import("./pages/admin/consultation/ExpertiseManagement"));
const PendingApprovals = lazy(() => import("./pages/admin/consultation/PendingApprovals"));
const ActiveConsultants = lazy(() => import("./pages/admin/consultation/ActiveConsultants"));
const AllRequests = lazy(() => import("./pages/admin/consultation/AllRequests"));
const ReportsAnalytics = lazy(() => import("./pages/admin/consultation/ReportsAnalytics"));

// Public Browse Pages
const PublicConsultantBrowse = lazy(() => import("./pages/public/ConsultantBrowsePage"));
const PublicMentorBrowse = lazy(() => import("./pages/public/MentorBrowsePage"));
const PublicCourseCatalog = lazy(() => import("./pages/public/CourseCatalogPage"));

// Mentor Pages
const MentorDashboard = lazy(() => import("./pages/dashboards/MentorDashboard"));
const EventManagementPage = lazy(() => import("./pages/mentor/EventManagementPage"));
const EventFormPage = lazy(() => import("./pages/mentor/EventFormPage"));
const MentorEventDetailPage = lazy(() => import("./pages/mentor/EventDetailPage"));
const MyUMKMPage = lazy(() => import("./pages/mentor/MyUMKMPage"));
const MentorCourseListPage = lazy(() => import("./pages/mentor/MentorCourseListPage"));
const MentorCourseFormPage = lazy(() => import("./pages/mentor/MentorCourseFormPage"));
const MentorUMKMDetailPage = lazy(() => import("./pages/mentor/MentorUMKMDetailPage"));

// UMKM Pages
const UpcomingEventsPage = lazy(() => import("./pages/umkm/UpcomingEventsPage"));
const UMKMEventDetailPage = lazy(() => import("./pages/umkm/EventDetailPage"));

const queryClient = new QueryClient();

// Component untuk tracking analytics
const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const App = () => {
  const container = useMemo(() => ServiceContainer.getInstance(), []);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('App: Initializing services...')
    let mounted = true;
    bootstrapApplication().then(() => {
      console.log('App: Services initialized')
      if (mounted) setReady(true);
    }).catch((err) => {
      console.error('App: Service initialization failed', err)
      if (mounted) setInitError(err instanceof Error ? err : new Error(String(err)));
    });
    return () => { mounted = false };
  }, []);

  const authService = ready ? container.getService<AuthService>("authService") : undefined;
  const tokenService = ready ? container.getService<TokenService>("tokenService") : undefined;

  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Gagal Memuat Aplikasi</h2>
          <p className="text-slate-600">
            Terjadi kesalahan saat menginisialisasi sistem. Mohon periksa koneksi internet Anda atau coba muat ulang halaman.
          </p>
          <div className="bg-slate-100 p-3 rounded-lg text-left overflow-auto max-h-32 text-xs text-slate-500 font-mono">
            {initError.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {ready && authService && tokenService ? (
            <AuthProvider authService={authService} tokenService={tokenService}>
              <NewAuthProvider>
                <CartProvider>
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
                      <Route path="/marketplace/product/:slug" element={<ProductDetail />} />
                      <Route path="/marketplace/cart" element={<Cart />} />
                      <Route path="/marketplace/checkout" element={<Checkout />} />
                      <Route path="/payment-simulation/:paymentId" element={<PaymentSimulationPage />} />
                      <Route path="/marketplace/order/:orderId/track" element={<ShipmentTrackingPage />} />
                      <Route path="/marketplace/my-orders" element={<OrderHistory />} />
                      <Route path="/marketplace/wishlist" element={<Wishlist />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/marketplace/seller" element={<SellerDashboard />} />
                      <Route path="/financing-hub" element={<FinancingHub />} />
                      <Route path="/export-hub" element={<ExportHub />} />
                      <Route path="/community" element={<CommunityLayout />}>
                        <Route index element={<Navigate to="forum" replace />} />
                        <Route path="forum" element={<ForumLandingPage />} />
                        <Route path="forum/category/:categoryId" element={<ThreadListPage />} />
                        <Route path="forum/thread/:id" element={<ThreadDetailPage />} />
                        <Route path="events" element={<EventListPage />} />
                        <Route path="events/:id" element={<EventDetailPage />} />
                      </Route>
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/contact" element={<Contact />} />

                      {/* Auth Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      {/* Program Routes */}
                      <Route path="programs" element={<ProgramLandingPage />} />
                      <Route path="my-programs" element={
                        <ProtectedRoute>
                          <MyProgramsPage />
                        </ProtectedRoute>
                      } />

                      {/* Admin Routes */}
                      <Route path="admin" element={
                        <ProtectedRoute requiredRole="admin">
                          <AppLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="umkm" element={<UMKMListPage />} />
                        <Route path="umkm/:id" element={<UMKMDetailPage />} />
                        <Route path="products" element={<ProductModerationPage />} />
                        <Route path="orders" element={<MarketplaceOrderList />} />
                        <Route path="programs" element={<ProgramListPage />} />
                        <Route path="programs/:id" element={<ProgramDetailPage />} />
                        <Route path="marketplace" element={<MarketplaceAdminDashboard />} />
                      </Route>

                      {/* Dashboard Routes with Sidebar Layout */}
                      <Route element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }>
                        {/* Dashboards */}
                        <Route path="/consultation/dashboard" element={<ConsultantDashboard />} />
                        <Route path="/umkm/dashboard" element={<Dashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />

                        {/* LMS Instructor */}
                        <Route path="/lms/create-course" element={<CreateCoursePage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboard/overview" element={<Dashboard />} />
                        <Route path="/dashboard/activity" element={<FeaturePreviewPage
                          title="Aktivitas Terbaru"
                          description="Monitor semua aktivitas user dan sistem secara real-time."
                          features={["Real-time activity feed", "Filter by user type", "Export activity logs"]}
                        />} />
                        <Route path="/dashboard/user-stats" element={<FeaturePreviewPage
                          title="Statistik Pengguna"
                          description="Analisis mendalam tentang pertumbuhan dan perilaku pengguna."
                          features={["User growth charts", "Demographic breakdown", "Engagement metrics"]}
                        />} />
                        <Route path="/dashboard/server-status" element={<FeaturePreviewPage
                          title="Status Server & API"
                          description="Monitoring kesehatan sistem dan uptime server."
                          features={["Uptime monitoring", "API latency tracking", "Error rate alerts"]}
                        />} />
                        <Route path="/dashboard/notifications" element={<FeaturePreviewPage
                          title="Notifikasi Sistem"
                          description="Pusat pengaturan dan pengiriman notifikasi."
                          features={["Push notification manager", "Email templates", "Notification history"]}
                        />} />

                        {/* User Management */}
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/users/all" element={<UserManagement />} />
                        <Route path="/users/consultants" element={<ConsultantManagement />} />
                        <Route path="/users/roles" element={<UserRoleManagement />} />

                        {/* Role & Permission Management */}
                        <Route path="/admin/roles" element={<RoleManagement />} />
                        <Route path="/admin/roles/:id" element={<RoleDetail />} />
                        <Route path="/admin/permissions" element={<PermissionManagement />} />
                        <Route path="/admin/role-permission-matrix" element={<RolePermissionMatrix />} />
                        <Route path="/admin/audit-logs" element={<AuditLogs />} />
                        <Route path="/users/umkm" element={<UserManagement defaultRole="umkm" />} />
                        <Route path="/users/mentors" element={<UserManagement defaultRole="mentor" />} />
                        <Route path="/users/trainers" element={<UserManagement defaultRole="trainer" />} />
                        <Route path="/users/staff" element={<UserManagement defaultRole="staff" />} />
                        <Route path="/users/admins" element={<UserManagement defaultRole="admin" />} />
                        <Route path="/users/import-export" element={<FeaturePreviewPage
                          title="Import / Export Data User"
                          description="Kelola data user secara massal."
                          features={["Bulk user import (CSV/Excel)", "Export user data", "Data validation"]}
                        />} />
                        <Route path="/users/audit" element={<FeaturePreviewPage
                          title="Audit User Activity"
                          description="Log audit lengkap untuk keamanan dan compliance."
                          features={["Detailed audit trails", "Searchable logs", "Security alerts"]}
                        />} />

                        {/* UMKM Database */}
                        <Route path="/admin/umkm" element={<UMKMListPage />} />
                        <Route path="/admin/umkm/create" element={<UMKMFormPage />} />
                        <Route path="/admin/umkm/:id" element={<UMKMDetailPage />} />
                        <Route path="/admin/umkm/:id/edit" element={<UMKMFormPage />} />

                        <Route path="/umkm/list" element={<UserManagement defaultRole="umkm" />} />
                        <Route path="/umkm/segmentation" element={<UMKMSegmentationPage />} />
                        <Route path="/umkm/region" element={<UMKMRegionMapPage />} />
                        <Route path="/umkm/assessment-status" element={<FeaturePreviewPage
                          title="Status Self-Assessment"
                          description="Monitor progres assessment UMKM."
                          features={["Assessment completion rates", "Score distribution", "Follow-up triggers"]}
                        />} />
                        <Route path="/umkm/program-status" element={<FeaturePreviewPage
                          title="Status Program"
                          description="Pelacakan partisipasi UMKM dalam program."
                          features={["Program enrollment tracking", "Completion status", "Impact analysis"]}
                        />} />
                        <Route path="/umkm/history" element={<FeaturePreviewPage
                          title="Histori Pendampingan"
                          description="Rekam jejak pendampingan yang diterima UMKM."
                          features={["Mentoring timeline", "Session notes", "Outcome tracking"]}
                        />} />
                        <Route path="/umkm/documents" element={<UMKMDocumentVerification />} />

                        {/* Mentor Management */}
                        <Route path="/mentors/list" element={<UserManagement defaultRole="mentor" />} />
                        <Route path="/mentors/assign" element={<FeaturePreviewPage
                          title="Assign UMKM ke Mentor"
                          description="Sistem matching dan assignment mentor."
                          features={["Smart matching algorithm", "Bulk assignment", "Workload balancing"]}
                        />} />
                        <Route path="/mentors/activity" element={<FeaturePreviewPage
                          title="Status & Aktivitas Mentor"
                          description="Monitor kinerja dan aktivitas mentor."
                          features={["Activity dashboard", "Performance metrics", "Feedback collection"]}
                        />} />
                        <Route path="/mentors/schedule" element={<FeaturePreviewPage
                          title="Jadwal Pendampingan"
                          description="Kalender dan penjadwalan sesi mentoring."
                          features={["Integrated calendar", "Session booking", "Reminders"]}
                        />} />
                        <Route path="/mentors/reports" element={<FeaturePreviewPage
                          title="Laporan & KPI Mentor"
                          description="Evaluasi kinerja mentor berdasarkan KPI."
                          features={["KPI dashboard", "Report generation", "Performance reviews"]}
                        />} />
                        <Route path="/lms/analytics" element={<FeaturePreviewPage
                          title="Student Analytics"
                          description="Analisis pembelajaran dan performa siswa."
                          features={["Progress tracking", "Completion rates", "Performance metrics"]}
                        />} />

                        {/* Consultation Manager */}
                        <Route path="/consultation/schedule" element={<ScheduleConsultationPage />} />
                        {/* Route moved to line 828 to use SessionHistoryPage */}
                        <Route path="/dashboard/consultation/dashboard" element={<ConsultationManagement />} />
                        <Route path="/dashboard/consultation/consultants/pending" element={<PendingConsultants />} />
                        <Route path="/dashboard/consultation/consultants/active" element={<ActiveConsultants />} />
                        <Route path="/dashboard/consultation/requests/all" element={<AllRequests />} />
                        <Route path="/dashboard/consultation/chat-monitoring" element={<ChatMonitoringPage />} />
                        <Route path="/dashboard/consultation/reports" element={<ReportsAnalytics />} />
                        <Route path="/dashboard/consultation/expertise" element={<ExpertiseManagement />} />
                        <Route path="/consultation/consultants" element={<PublicConsultantBrowse />} />

                        {/* Program Management */}
                        <Route path="/programs/list" element={<ProgramList />} />
                        <Route path="/programs/create" element={<ProgramCreate />} />
                        <Route path="/programs/batches" element={<FeaturePreviewPage
                          title="Batch Management"
                          description="Kelola batch dan cohort program."
                          features={["Batch creation", "Participant allocation", "Timeline management"]}
                        />} />
                        <Route path="/programs/curriculum" element={<FeaturePreviewPage
                          title="Kurikulum Program"
                          description="Desain dan kelola kurikulum program."
                          features={["Curriculum builder", "Resource management", "Learning paths"]}
                        />} />
                        <Route path="/programs/schedule" element={<FeaturePreviewPage
                          title="Jadwal Training & Event"
                          description="Kalender kegiatan program."
                          features={["Event scheduling", "Attendance tracking", "Resource booking"]}
                        />} />
                        <Route path="/programs/participants" element={<FeaturePreviewPage
                          title="Peserta per Program"
                          description="Manajemen data peserta program."
                          features={["Participant database", "Progress tracking", "Certificate issuance"]}
                        />} />
                        <Route path="/programs/evaluation" element={<FeaturePreviewPage
                          title="Outcome & Evaluasi"
                          description="Evaluasi dampak dan hasil program."
                          features={["Survey tools", "Impact metrics", "Feedback analysis"]}
                        />} />
                        <Route path="/programs/import-export" element={<FeaturePreviewPage
                          title="Import / Export Program"
                          description="Migrasi data program."
                          features={["Data migration tools", "Template support", "Backup options"]}
                        />} />

                        {/* LMS Manager */}
                        <Route path="/lms/catalog" element={<CourseCatalogPage />} />
                        <Route path="/lms/my-courses" element={<MyCoursesPage />} />
                        <Route path="/lms/courses/:slug" element={<CourseDetailPage />} />
                        <Route path="/lms/create" element={<LMSCreateCourse />} />
                        <Route path="/lms/admin/create" element={<LMSCreateCourse />} />
                        <Route path="/lms/admin/categories" element={<CourseCategoryManagement />} />
                        <Route path="/lms/instructor/courses" element={<InstructorCourseManagement />} />
                        <Route path="/lms/courses/:slug/edit" element={<LMSCourseEditor />} />
                        <Route path="/lms/videos" element={<FeaturePreviewPage
                          title="Video Library"
                          description="Pusat penyimpanan dan manajemen video pembelajaran."
                          features={["Video hosting", "Streaming optimization", "Subtitle support"]}
                        />} />
                        <Route path="/lms/assignments" element={<FeaturePreviewPage
                          title="Assignment & Quiz"
                          description="Buat dan kelola tugas serta kuis."
                          features={["Quiz builder", "Assignment submission", "Automated grading"]}
                        />} />
                        <Route path="/lms/certificates" element={<FeaturePreviewPage
                          title="Sertifikasi"
                          description="Desain dan penerbitan sertifikat."
                          features={["Certificate designer", "Auto-generation", "Verification system"]}
                        />} />
                        <Route path="/lms/trainers" element={<FeaturePreviewPage
                          title="Trainer Management"
                          description="Kelola data dan akses trainer."
                          features={["Trainer profiles", "Course assignment", "Performance tracking"]}
                        />} />
                        <Route path="/lms/review" element={<FeaturePreviewPage
                          title="Review & Moderasi Materi"
                          description="Quality control materi pembelajaran."
                          features={["Content review workflow", "Feedback tools", "Version control"]}
                        />} />
                        <Route path="/lms/stats" element={<LMSStats />} />

                        {/* Marketplace Manager */}
                        <Route path="/marketplace/dashboard" element={<Navigate to="/marketplace/seller" replace />} />
                        <Route path="/dashboard/marketplace/products" element={<MarketplaceProductList />} />
                        <Route path="/dashboard/marketplace/products/new" element={<ProductUploadPage />} />
                        <Route path="/marketplace/products" element={<ProductListPage />} />
                        <Route path="/marketplace/products/:slug" element={<AdminProductDetailPage />} />
                        <Route path="/marketplace/verification" element={<MarketplaceProductVerification />} />
                        <Route path="/marketplace/stores" element={<FeaturePreviewPage
                          title="Toko UMKM"
                          description="Manajemen toko dan penjual."
                          features={["Store profiles", "Verification status", "Performance metrics"]}
                        />} />
                        <Route path="/marketplace/orders" element={<MarketplaceOrderList />} />
                        <Route path="/marketplace/complaints" element={<FeaturePreviewPage
                          title="Komplain & Resolusi"
                          description="Pusat resolusi masalah transaksi."
                          features={["Dispute resolution center", "Chat history", "Refund management"]}
                        />} />
                        <Route path="/marketplace/fees" element={<FeaturePreviewPage
                          title="Fee & Komisi Marketplace"
                          description="Pengaturan biaya layanan dan komisi."
                          features={["Fee structure configuration", "Revenue sharing", "Payout management"]}
                        />} />
                        <Route path="/marketplace/integration" element={<FeaturePreviewPage
                          title="Integrasi Marketplace Eksternal"
                          description="Hubungkan dengan platform e-commerce lain."
                          features={["API integrations", "Inventory sync", "Order consolidation"]}
                        />} />
                        <Route path="/marketplace/reports" element={<MarketplaceStats />} />

                        {/* Financing Manager */}
                        <Route path="/financing/apply/:partnerSlug" element={<LoanApplicationForm />} />
                        <Route path="/financing/products" element={<FinancingPartnerList />} />
                        <Route path="/financing/applications" element={<FinancingApplicationList />} />
                        <Route path="/financing/verification" element={<FeaturePreviewPage
                          title="Tahapan Verifikasi"
                          description="Proses verifikasi pengajuan pembiayaan."
                          features={["Document checking", "Credit scoring", "Field verification"]}
                        />} />
                        <Route path="/financing/approval" element={<FeaturePreviewPage
                          title="Approval Pembiayaan"
                          description="Workflow persetujuan pinjaman."
                          features={["Approval hierarchy", "Digital signing", "Disbursement trigger"]}
                        />} />
                        <Route path="/financing/documents" element={<FeaturePreviewPage
                          title="Dokumen Pembiayaan"
                          description="Manajemen dokumen legal pembiayaan."
                          features={["Secure storage", "Document generation", "E-signature"]}
                        />} />
                        <Route path="/financing/partners" element={<FinancingPartnerList />} />
                        <Route path="/financing/reports" element={<FeaturePreviewPage
                          title="Reporting Pembiayaan"
                          description="Laporan portofolio pembiayaan."
                          features={["Portfolio performance", "NPL tracking", "Partner reports"]}
                        />} />

                        {/* Export Hub Manager */}
                        <Route path="/export/guide" element={<FeaturePreviewPage
                          title="Panduan Ekspor"
                          description="Materi edukasi dan panduan ekspor."
                          features={["Step-by-step guides", "Regulatory info", "Market intelligence"]}
                        />} />
                        <Route path="/export/buyers" element={<FeaturePreviewPage
                          title="Buyer Directory"
                          description="Database pembeli potensial luar negeri."
                          features={["Buyer search", "Contact details", "Requirement matching"]}
                        />} />
                        <Route path="/export/checklist" element={<FeaturePreviewPage
                          title="Checklist Ekspor"
                          description="Alat bantu kesiapan ekspor."
                          features={["Readiness assessment", "Document checklist", "Compliance tracker"]}
                        />} />
                        <Route path="/export/documents" element={<FeaturePreviewPage
                          title="Dokumen Ekspor"
                          description="Template dan generator dokumen ekspor."
                          features={["Document templates", "Auto-fill", "Validation"]}
                        />} />
                        <Route path="/export/facilitation" element={<FeaturePreviewPage
                          title="Fasilitasi Ekspor"
                          description="Program bantuan dan fasilitasi ekspor."
                          features={["Program application", "Status tracking", "Success stories"]}
                        />} />
                        <Route path="/export/approval" element={<FeaturePreviewPage
                          title="Approval Permintaan Konsultasi"
                          description="Manajemen permintaan konsultasi ekspor."
                          features={["Request queue", "Expert assignment", "Scheduling"]}
                        />} />
                        <Route path="/export/reports" element={<FeaturePreviewPage
                          title="Laporan Ekspor"
                          description="Statistik dan laporan kinerja ekspor."
                          features={["Export volume", "Destination countries", "Commodity analysis"]}
                        />} />

                        {/* Consultation Management */}
                        <Route path="/consultation/schedule" element={<FeaturePreviewPage
                          title="Jadwal Konsultasi"
                          description="Manajemen jadwal konsultasi."
                          features={["Calendar view", "Booking system", "Availability settings"]}
                        />} />
                        <Route path="/consultation/assignment" element={<FeaturePreviewPage
                          title="Mentor Assignment"
                          description="Penugasan mentor untuk konsultasi."
                          features={["Expert matching", "Workload management", "Assignment history"]}
                        />} />
                        {/* Route moved to line 828 to use SessionHistoryPage */}
                        {/* UMKM Management */}
                        <Route path="/umkm" element={<UMKMListPage />} />
                        <Route path="/umkm/new" element={<UMKMFormPage />} />
                        <Route path="/umkm/:id" element={<UMKMDetailPage />} />
                        <Route path="/umkm/:id/edit" element={<UMKMFormPage />} />
                        <Route path="/consultation/chat" element={<FeaturePreviewPage
                          title="Chat Monitoring"
                          description="Monitoring interaksi chat konsultasi."
                          features={["Real-time monitoring", "Keyword alerts", "Quality assurance"]}
                        />} />
                        <Route path="/consultation/tickets" element={<FeaturePreviewPage
                          title="Case Ticketing System"
                          description="Sistem tiket untuk kasus kompleks."
                          features={["Ticket creation", "Status tracking", "Escalation workflow"]}
                        />} />
                        <Route path="/consultation/specialized" element={<FeaturePreviewPage
                          title="Konsultasi Ekspor / Legal / Digital"
                          description="Layanan konsultasi spesialis."
                          features={["Specialist directory", "Booking flow", "Service packages"]}
                        />} />

                        {/* Community Platform Manager */}
                        <Route path="/community/forum" element={<FeaturePreviewPage
                          title="Forum Diskusi"
                          description="Moderasi dan manajemen forum."
                          features={["Thread management", "Moderation tools", "Analytics"]}
                        />} />
                        <Route path="/community/topics" element={<FeaturePreviewPage
                          title="Manajemen Topik"
                          description="Pengaturan kategori dan topik diskusi."
                          features={["Topic hierarchy", "Tag management", "Trending topics"]}
                        />} />
                        <Route path="/community/posts" element={<FeaturePreviewPage
                          title="Post & Komentar"
                          description="Manajemen konten user."
                          features={["Content moderation", "Report handling", "Featured posts"]}
                        />} />
                        <Route path="/community/moderation" element={<FeaturePreviewPage
                          title="Moderasi Konten"
                          description="Dashboard moderasi komunitas."
                          features={["Automated filters", "Manual review queue", "User banning"]}
                        />} />
                        <Route path="/community/events" element={<FeaturePreviewPage
                          title="Event Komunitas"
                          description="Manajemen event komunitas."
                          features={["Event calendar", "Registration", "Live streaming"]}
                        />} />
                        <Route path="/community/reports" element={<FeaturePreviewPage
                          title="Report Misconduct"
                          description="Laporan pelanggaran komunitas."
                          features={["Report dashboard", "Investigation tools", "Action logs"]}
                        />} />

                        {/* Analytics & Reporting */}
                        <Route path="/analytics/umkm" element={<FeaturePreviewPage
                          title="UMKM Analytics"
                          description="Analisis data UMKM."
                          features={["Growth metrics", "Sector analysis", "Regional trends"]}
                        />} />
                        <Route path="/analytics/programs" element={<FeaturePreviewPage
                          title="Program Analytics"
                          description="Analisis efektivitas program."
                          features={["Impact assessment", "ROI analysis", "Participant feedback"]}
                        />} />
                        <Route path="/analytics/lms" element={<FeaturePreviewPage
                          title="LMS Insights"
                          description="Wawasan pembelajaran."
                          features={["Learning patterns", "Course popularity", "Completion rates"]}
                        />} />
                        <Route path="/analytics/mentoring" element={<FeaturePreviewPage
                          title="Pendampingan Analytics"
                          description="Analisis kegiatan mentoring."
                          features={["Session volume", "Satisfaction scores", "Outcome tracking"]}
                        />} />
                        <Route path="/analytics/financing" element={<FeaturePreviewPage
                          title="Pembiayaan Analytics"
                          description="Analisis penyaluran pembiayaan."
                          features={["Disbursement trends", "Risk analysis", "Partner performance"]}
                        />} />
                        <Route path="/analytics/marketplace" element={<FeaturePreviewPage
                          title="Marketplace Analytics"
                          description="Analisis transaksi marketplace."
                          features={["Sales trends", "Product performance", "Customer behavior"]}
                        />} />
                        <Route path="/analytics/export" element={<FeaturePreviewPage
                          title="Export Analytics"
                          description="Analisis kinerja ekspor."
                          features={["Export volume", "Market trends", "Success rate"]}
                        />} />
                        <Route path="/analytics/kpi" element={<FeaturePreviewPage
                          title="Performance KPI"
                          description="Key Performance Indicators dashboard."
                          features={["Goal tracking", "Performance scorecards", "Trend analysis"]}
                        />} />
                        <Route path="/analytics/visualization" element={<FeaturePreviewPage
                          title="Data Visualization & Export"
                          description="Visualisasi data kustom."
                          features={["Custom charts", "Report builder", "Data export"]}
                        />} />

                        {/* System Settings */}
                        <Route path="/settings/general" element={<FeaturePreviewPage
                          title="General Settings"
                          description="Pengaturan umum sistem."
                          features={["Site configuration", "Localization", "Maintenance mode"]}
                        />} />
                        <Route path="/settings/branding" element={<FeaturePreviewPage
                          title="Branding & Identitas Visual"
                          description="Kustomisasi tampilan aplikasi."
                          features={["Logo & colors", "Theme settings", "Email branding"]}
                        />} />
                        <Route path="/settings/notifications" element={<FeaturePreviewPage
                          title="Email & Notification Settings"
                          description="Konfigurasi notifikasi."
                          features={["SMTP settings", "Template editor", "Delivery rules"]}
                        />} />
                        <Route path="/settings/api-keys" element={<FeaturePreviewPage
                          title="API Key Manager"
                          description="Manajemen akses API."
                          features={["Key generation", "Usage quotas", "Access logs"]}
                        />} />
                        <Route path="/settings/integrations" element={<FeaturePreviewPage
                          title="Integrasi Pihak Ketiga"
                          description="Pengaturan integrasi eksternal."
                          features={["Payment gateways", "Social login", "External services"]}
                        />} />
                        <Route path="/settings/backup" element={<FeaturePreviewPage
                          title="Backup & Restore"
                          description="Manajemen backup data."
                          features={["Automated backups", "Restore points", "Disaster recovery"]}
                        />} />
                        <Route path="/settings/environment" element={<FeaturePreviewPage
                          title="Environment Configuration"
                          description="Konfigurasi environment server."
                          features={["Env variables", "Feature flags", "System limits"]}
                        />} />

                        {/* Logs & Security */}
                        <Route path="/logs/login" element={<FeaturePreviewPage
                          title="Login Log"
                          description="Riwayat login pengguna."
                          features={["Login attempts", "IP tracking", "Device info"]}
                        />} />
                        <Route path="/logs/activity" element={<FeaturePreviewPage
                          title="Activity Log"
                          description="Log aktivitas sistem."
                          features={["User actions", "System events", "Data changes"]}
                        />} />
                        <Route path="/logs/error" element={<FeaturePreviewPage
                          title="Error Log"
                          description="Log error aplikasi."
                          features={["Error stack traces", "Impact analysis", "Resolution tracking"]}
                        />} />
                        <Route path="/logs/security" element={<FeaturePreviewPage
                          title="Security & Permission Audit"
                          description="Audit keamanan sistem."
                          features={["Permission changes", "Security alerts", "Vulnerability scan"]}
                        />} />
                        <Route path="/logs/firewall" element={<FeaturePreviewPage
                          title="Firewall Rules"
                          description="Aturan firewall aplikasi."
                          features={["IP blocking", "Rate limiting", "WAF rules"]}
                        />} />
                        <Route path="/logs/api" element={<FeaturePreviewPage
                          title="API Access Logs"
                          description="Log akses API."
                          features={["Request/Response logs", "Latency metrics", "Usage patterns"]}
                        />} />
                        <Route path="/logs/backups" element={<FeaturePreviewPage
                          title="Backup Logs"
                          description="Riwayat proses backup."
                          features={["Backup status", "Size metrics", "Verification results"]}
                        />} />

                        {/* Tools */}
                        <Route path="/tools/import-export" element={<FeaturePreviewPage
                          title="Import / Export Tools"
                          description="Alat migrasi data."
                          features={["Data migration", "Format conversion", "Bulk operations"]}
                        />} />
                        <Route path="/tools/cleaner" element={<FeaturePreviewPage
                          title="Data Cleaner"
                          description="Pembersihan data sampah."
                          features={["Duplicate removal", "Temp file cleanup", "Database optimization"]}
                        />} />
                        <Route path="/tools/bulk-editor" element={<FeaturePreviewPage
                          title="Bulk Editor"
                          description="Edit data massal."
                          features={["Batch updates", "Search & replace", "Validation rules"]}
                        />} />
                        <Route path="/tools/sandbox" element={<FeaturePreviewPage
                          title="Sandbox Mode"
                          description="Mode pengujian aman."
                          features={["Test environment", "Mock data", "Safe experimentation"]}
                        />} />
                        <Route path="/tools/cache" element={<FeaturePreviewPage
                          title="Cache Manager"
                          description="Manajemen cache sistem."
                          features={["Cache clearing", "Performance tuning", "Storage analysis"]}
                        />} />

                        <Route path="/assessment" element={<AssessmentLandingPage />} />
                        <Route path="/assessment/history" element={<AssessmentHistoryPage />} />
                        <Route path="/assessment/:id" element={<AssessmentWizardPage />} />
                        <Route path="/assessment/results/:id" element={<AssessmentResultsPage />} />

                        {/* Profile Routes */}
                        <Route path="/profile" element={<MyProfile />} />
                        <Route path="/profile/change-password" element={<ChangePassword />} />
                        <Route path="/profile/umkm" element={<UMKMProfileWizard />} />
                        {/* Consultation Admin */}
                        <Route path="/admin/consultation" element={<ConsultationManagement />} />
                        <Route path="/admin/consultation/chats" element={<ChatMonitoringPage />} />
                        <Route path="/admin/consultation/chats/:channelId" element={<ChatTranscriptPage />} />

                        {/* Consultation Routes */}
                        <Route path="/consultants/list" element={<ConsultantList />} />
                        <Route path="/consultants/onboarding" element={<ConsultantOnboarding />} />
                        <Route
                          path="/consultants/my-profile"
                          element={
                            <ProtectedRoute requiredRoles={['consultant', 'konsultan']}>
                              <ConsultantProfileSettings />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/consultants/:id" element={<ConsultantProfile />} />
                        <Route path="/consultation/book" element={<BookingConfirmationPage />} />
                        <Route path="/consultation/history" element={<SessionHistoryPage />} />
                        <Route path="/consultation/dashboard" element={<ConsultationDashboard />} />
                        <Route path="/consultation/session/:id" element={<SessionDetail />} /> {/* Session Detail with Chat */}
                        <Route path="/consultation/requests/:requestId/chat" element={<ConsultationChat />} /> {/* Full Chat View */}
                        <Route path="/consultation/requests" element={<ConsultationRequests />} />

                        <Route path="/financing" element={<FeaturePreviewPage
                          title="Financing Management"
                          description="Pusat manajemen pembiayaan."
                          features={["Application tracking", "Partner management", "Verification workflow"]}
                        />} />
                      </Route>

                      {/* Learning Routes - Distraction Free */}
                      <Route element={<LearningLayout />}>
                        <Route path="/lms/learn/:slug" element={<LessonView />} />
                        <Route path="/lms/learn/:slug/lesson/:lessonId" element={<LessonView />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </CartProvider>
                <AnalyticsTracker />
              </NewAuthProvider>
            </AuthProvider>
          ) : (
            <Routes>
              <Route path="*" element={<Index />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider >
  );
};

export default App;
