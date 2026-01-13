import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, ShieldCheck, Users } from "lucide-react";
import heroImage from "@/assets/hero-consulting.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Tech consulting for SMEs"
          className="w-full h-full object-cover opacity-20 scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
        <div className="animate-fade-in space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-4 animate-slide-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            Platform No.1 untuk UMKM Indonesia
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight px-2">
            Beyond Solutions
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-400 mt-2">
              for SMEs Growth
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
            Aselerasi pertumbuhan bisnis Anda dengan solusi digital terintegrasi,
            akses pembiayaan, dan pendampingan ahli dalam satu ekosistem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 pt-4">
            <Button
              variant="hero"
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1"
            >
              Mulai Konsultasi Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-semibold text-lg px-8 py-6 rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              Lihat Demo
            </Button>
          </div>

          {/* Stats / Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-slate-400 text-sm mb-8 uppercase tracking-wider font-medium">Dipercaya oleh 5000+ UMKM & Partner</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-xl bg-white/5 text-secondary">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-white">5000+</div>
                <div className="text-sm text-slate-400">UMKM Terdaftar</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-xl bg-white/5 text-blue-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-white">85%</div>
                <div className="text-sm text-slate-400">Pertumbuhan Rata-rata</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-xl bg-white/5 text-green-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-slate-400">Terverifikasi</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-xl bg-white/5 text-purple-400">
                  <Play className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-slate-400">Modul Pembelajaran</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;