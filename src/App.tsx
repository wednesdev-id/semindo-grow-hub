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
const FinancingHub = lazy(() => import("./pages/FinancingHub"));
const ExportHub = lazy(() => import("./pages/ExportHub"));
const CommunityLayout = lazy(() => import("./components/layouts/CommunityLayout").then(module => ({ default: module.CommunityLayout })));
const ForumLandingPage = lazy(() => import("./pages/community/ForumLandingPage").then(module => ({ default: module.ForumLandingPage })));
const ThreadListPage = lazy(() => import("./pages/community/ThreadListPage").then(module => ({ default: module.ThreadListPage })));
const ThreadDetailPage = lazy(() => import("./pages/community/ThreadDetailPage").then(module => ({ default: module.ThreadDetailPage })));
const EventListPage = lazy(() => import("./pages/community/EventListPage").then(module => ({ default: module.EventListPage })));
const EventDetailPage = lazy(() => import("./pages/community/EventDetailPage").then(module => ({ default: module.EventDetailPage })));
const ProgramListPage = lazy(() => import("./pages/admin/program/ProgramListPage").then(module => ({ default: module.ProgramListPage })));
const ProgramDetailPage = lazy(() => import("./pages/admin/program/ProgramDetailPage").then(module => ({ default: module.ProgramDetailPage })));
const ProgramLandingPage = lazy(() => import("./pages/program/ProgramLandingPage").then(module => ({ default: module.ProgramLandingPage })));
const MyProgramsPage = lazy(() => import("./pages/program/MyProgramsPage").then(module => ({ default: module.MyProgramsPage })));
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
const UMKMFormPage = lazy(() => import("./pages/admin/umkm/UMKMFormPage"));
const UMKMDetailPage = lazy(() => import("./pages/admin/umkm/UMKMDetailPage"));

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
    bootstrapApplication().then(() => {
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
                      <Route path="programs" element={<ProgramListPage />} />
                      <Route path="programs/:id" element={<ProgramDetailPage />} />
                    </Route>

                    {/* Dashboard Routes with Sidebar Layout */}
                    <Route element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }>
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
                      <Route path="/users/roles" element={<UserRoleManagement />} />
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
                      <Route path="/umkm/segmentation" element={<FeaturePreviewPage
                        title="Segmentasi UMKM"
                        description="Analisis dan pengelompokan UMKM berdasarkan kriteria."
                        features={["Automated segmentation", "Custom segment rules", "Targeted campaigns"]}
                      />} />
                      <Route path="/umkm/region" element={<FeaturePreviewPage
                        title="Region Mapping"
                        description="Peta persebaran UMKM di seluruh Indonesia."
                        features={["Interactive map", "Regional statistics", "Heatmaps"]}
                      />} />
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
                      <Route path="/mentors/approval" element={<FeaturePreviewPage
                        title="Approval Laporan"
                        description="Review dan approval laporan mentor."
                        features={["Report submission workflow", "Feedback loops", "Approval history"]}
                      />} />

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
                      <Route path="/marketplace/products" element={<ProductListPage />} />
                      <Route path="/marketplace/product/:slug" element={<ProductDetailPage />} />
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
                      <Route path="/consultation/history" element={<FeaturePreviewPage
                        title="Riwayat Konsultasi"
                        description="Arsip sesi konsultasi."
                        features={["Session logs", "Recording access", "Outcome notes"]}
                      />} />
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
                      <Route path="/profile" element={<UMKMProfileWizard />} />
                      <Route path="/consultation" element={<FeaturePreviewPage
                        title="Consultation Management"
                        description="Pusat manajemen layanan konsultasi."
                        features={["Schedule management", "Mentor assignment", "Session history"]}
                      />} />
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
