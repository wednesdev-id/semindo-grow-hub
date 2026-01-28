import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/ui/seo-head";
import { Button } from "@/components/ui/button";
import waVector from "@/assets/WA Vector.png";
import contactImage from "@/assets/image 46 1.png";
import facebookIcon from "@/assets/facebook Black.png";
import instagramIcon from "@/assets/instagram black.png";
import xIcon from "@/assets/x black.png";
import linkedinIcon from "@/assets/linkedin black.png";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Hubungi Semindo – Konsultansi & Solusi UMKM Digital"
        description="Hubungi tim support Semindo untuk solusi bisnis UMKM Anda. Kami siap membantu melalui WhatsApp, email, dan telepon."
        keywords="hubungi kami, kontak semindo, support UMKM, bantuan bisnis"
      />
      <Navigation variant="solid" />

      <main className="pt-48 pb-16 px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto font-sans">
        {/* Contact Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-5">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Hubungi Kami
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-xl">
              Tim Customer Service kami siap membantu menjawab pertanyaan dan menghubungkan Anda dengan solusi yang tepat untuk bisnis Anda
            </p>
            <Button
              className="bg-[#18D200] hover:bg-[#15b300] text-white px-8 py-7 rounded-lg text-xl font-bold flex items-center gap-3 w-fit"
              onClick={() => window.open("https://wa.me/6298123467580", "_blank")}
            >
              <img src={waVector} alt="WhatsApp" className="h-8 w-8 object-contain brightness-0 invert" />
              WhatsApp Sekarang
            </Button>
          </div>

          {/* Right Column: Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8 pt-4 lg:col-span-7">
            {/* Jam Operasional */}
            <div className="space-y-3">
              <h3 className="text-slate-400 font-medium text-lg">Jam Operasional</h3>
              <p className="text-slate-900 text-lg leading-relaxed">
                Senin - Jumat: 08:00 - 17:00<br />
                Sabtu: 08:00 - 12:00
              </p>
            </div>

            {/* Telepon */}
            <div className="space-y-3">
              <h3 className="text-slate-400 font-medium text-lg">Telepon</h3>
              <p className="text-slate-900 text-lg leading-relaxed">
                +6298076321564<br />
                +6298123467580 (WhatsApp)
              </p>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <h3 className="text-slate-400 font-medium text-lg">Email</h3>
              <p className="text-slate-900 text-lg leading-relaxed">
                Semindo@gmail.com<br />
                SinergiUMKMIndonesia@gmail.com
              </p>
            </div>

            {/* Alamat */}
            <div className="space-y-3">
              <h3 className="text-slate-400 font-medium text-lg">Alamat</h3>
              <p className="text-slate-900 text-lg leading-relaxed">
                Jl. Kaliurang No.Km. 5, Karang Wuni, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Social Media & Image Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          {/* Left Column: Social Media (Bottom Left) */}
          <div className="lg:col-span-5 pb-4">
            <h3 className="text-slate-600 font-medium text-xl mb-6">Sosial Media:</h3>
            <div className="flex gap-4">
              <a href="#" className="p-1 hover:opacity-80 transition-opacity">
                <img src={facebookIcon} alt="Facebook" className="w-10 h-10 object-contain" />
              </a>
              <a href="#" className="p-1 hover:opacity-80 transition-opacity">
                <img src={instagramIcon} alt="Instagram" className="w-10 h-10 object-contain" />
              </a>
              <a href="#" className="p-1 hover:opacity-80 transition-opacity">
                <img src={xIcon} alt="X" className="w-10 h-10 object-contain" />
              </a>
              <a href="#" className="p-1 hover:opacity-80 transition-opacity">
                <img src={linkedinIcon} alt="LinkedIn" className="w-10 h-10 object-contain" />
              </a>
            </div>
          </div>

          {/* Right Column: Image (Aligned with Contact Details) */}
          <div className="lg:col-span-7">
            <img
              src={contactImage}
              alt="Semindo Support Team"
              className="w-full h-auto object-cover rounded-xl shadow-md"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;