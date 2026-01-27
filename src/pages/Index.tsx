import { useState, useContext } from 'react';
import Navigation from "@/components/ui/navigation";
import HeroSection from "@/components/ui/hero-section";
import WhoWeAre from "@/components/landing/WhoWeAre";
import ProgramsServices from "@/components/landing/ProgramsServices";
import WhyUs from "@/components/landing/WhyUs";
import FAQ from "@/components/landing/FAQ";
import SuccessStories from "@/components/ui/success-stories";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/ui/seo-head";
import OnboardingModal from "@/components/modals/OnboardingModal";
import { AuthContext } from "@/contexts/AuthContext";

const Index = () => {
  // Use context directly with fallback for when AuthProvider is not available
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Semindo – Beyond Solutions for SMEs | Konsultasi & Pendampingan UMKM"
        description="Bangun bisnis UMKM Anda bersama Semindo. Konsultasi digital, pembiayaan, sertifikasi, ekspor, hingga pembelajaran online dalam satu platform terpadu."
        keywords="UMKM, konsultasi bisnis, pendampingan UMKM, digitalisasi, pembiayaan, sertifikasi, ekspor"
      />
      <Navigation onDaftarClick={() => !isAuthenticated && setShowOnboardingModal(true)} />
      <HeroSection onDaftarClick={() => !isAuthenticated && setShowOnboardingModal(true)} />
      <WhoWeAre />
      <ProgramsServices />
      <WhyUs />
      <SuccessStories />
      <FAQ />
      <Footer />

      {/* Onboarding Modal for non-logged in users */}
      {!isAuthenticated && (
        <OnboardingModal
          open={showOnboardingModal}
          onOpenChange={setShowOnboardingModal}
        />
      )}
    </div>
  );
};

export default Index;
