import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/ui/seo-head";
import aboutImage1 from "@/assets/image 46 1.png";
import aboutImage2 from "@/assets/image 49.png";

const TentangKami = () => {

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Tentang Semindo – Konsultan & Pendamping UMKM Digital"
        description="Kenali visi, misi, tim konsultan, dan partner strategis Semindo. Lihat dampak nyata yang telah membantu ratusan UMKM naik kelas."
        keywords="tentang semindo, konsultan UMKM, pendamping bisnis, tim ahli, partner strategis"
      />
      <Navigation variant="solid" />

      {/* Section 1: Apa itu SEMINDO dan mengapa kami ada? */}
      <section className="pt-32 pb-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column: Text Content */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1]">
                Apa itu SEMINDO dan mengapa kami ada?
              </h1>

              <div className="space-y-6">
                <p className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
                  SEMINDO adalah One-Stop Digital SME Ecosystem yang membantu UMKM naik kelas melalui pendekatan yang terukur, terarah, dan terintegrasi.
                </p>

                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  Kami percaya masalah utama UMKM bukan kurang semangat, tetapi tidak adanya diagnosis bisnis yang jelas, akses ke ahli yang tepat, serta ekosistem yang saling terhubung. Akibatnya, banyak pelaku usaha berjalan tanpa peta dan sulit berkembang.
                </p>

                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  SEMINDO hadir untuk menjembatani itu semua, mulai dari diagnosis berbasis data, akses langsung ke mentor dan praktisi, hingga dukungan pembelajaran, pembiayaan, dan persiapan ekspor dalam satu platform.
                  <span className="block mt-4 font-semibold text-slate-900">
                    Bukan sekadar pendampingan, tetapi solusi end-to-end agar UMKM bisa tumbuh secara nyata dan berkelanjutan.
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="relative">
              <img
                src={aboutImage1}
                alt="Semindo Presentation"
                className="w-full h-auto rounded-xl shadow-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Visi & Misi */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Visi & Misi Toggles/Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
            {/* Visi */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900">
                Visi kami
              </h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Memberdayakan 1 juta UMKM Indonesia menjadi tulang punggung ekonomi yang tangguh dan siap bersaing di pasar global pada tahun 2030.
              </p>
            </div>

            {/* Misi */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900">
                Misi kami
              </h2>
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  Menyediakan pendampingan UMKM berbasis data sebagai dasar pengambilan keputusan bisnis.
                </p>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  Menghubungkan UMKM dengan mentor, praktisi, dan jejaring profesional lintas sektor.
                </p>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  Mengintegrasikan pembelajaran, konsultasi, pembiayaan, dan ekspor dalam satu ekosistem digital.
                </p>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  Mendorong pertumbuhan UMKM yang berkelanjutan dan siap menghadapi pasar global.
                </p>
              </div>
            </div>
          </div>

          {/* Large Bottom Image */}
          <div className="relative">
            <img
              src={aboutImage2}
              alt="Semindo Workshop"
              className="w-full h-[400px] md:h-[600px] rounded-xl shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TentangKami;