
import logoWhite from "@/assets/LOGO SINERGI PUTIH1 1.png";
import iconPhone from "@/assets/telpon.png";
import iconEmail from "@/assets/email.png";
import iconLocation from "@/assets/location.png";
import iconFb from "@/assets/facebook.png";
import iconIg from "@/assets/instagram.png";
import iconX from "@/assets/x.png";
import iconLinkedin from "@/assets/linkedin.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#212A65] pt-20 pb-12 font-sans text-white">
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Left Column (Brand & Contact) - Spans 5 columns */}
          <div className="lg:col-span-5 space-y-8">
            {/* Logo */}
            <div className="mb-6">
              <img src={logoWhite} alt="Semindo Logo" className="h-16 w-auto object-contain" />
            </div>

            {/* Description */}
            <p className="text-white/80 leading-relaxed max-w-md text-base">
              Platform konsultasi berbasis teknologi yang membantu UMKM Indonesia berkembang melalui solusi digital, keuangan, dan strategi bisnis terintegrasi.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={iconPhone} alt="Phone" className="w-5 h-5 object-contain" />
                <span className="text-white">+6298123467580</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={iconEmail} alt="Email" className="w-5 h-5 object-contain" />
                <span className="text-white">Semindo@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={iconLocation} alt="Location" className="w-5 h-5 object-contain" />
                <span className="text-white">Daerah Istimewa Yogyakarta</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-4">
              <p className="text-white mb-4 font-medium">Sosial Media:</p>
              <div className="flex gap-4">
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  <img src={iconFb} alt="Facebook" className="w-10 h-10 object-contain" />
                </a>
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  <img src={iconIg} alt="Instagram" className="w-10 h-10 object-contain" />
                </a>
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  <img src={iconX} alt="X" className="w-10 h-10 object-contain" />
                </a>
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  <img src={iconLinkedin} alt="LinkedIn" className="w-10 h-10 object-contain" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Columns (Links) - Spans 7 columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Layanan */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Layanan</h3>
              <ul className="space-y-4">
                <li><Link to="#" className="text-white/80 hover:text-white transition-colors">Konsultasi dengan Expert</Link></li>
                <li><Link to="#" className="text-white/80 hover:text-white transition-colors">Pendampingan</Link></li>
                <li><Link to="#" className="text-white/80 hover:text-white transition-colors">Sertifikasi & Legalitas</Link></li>
              </ul>
            </div>

            {/* Program */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Program</h3>
              <ul className="space-y-4">
                <li><Link to="#" className="text-white/80 hover:text-white transition-colors">Self Assessment</Link></li>
                <li><Link to="#" className="text-white/80 hover:text-white transition-colors">Learning hub</Link></li>
                <li><Link to="#" className="text-white/80 hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>

            {/* Resource */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Resource</h3>
              <ul className="space-y-4">
                <li><Link to="#" className="text-white/80 hover:text-white transition-colors">Success Story</Link></li>
              </ul>
            </div>

            {/* Perusahaan */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Perusahaan</h3>
              <ul className="space-y-4">
                <li><Link to="#" className="text-white/80 hover:text-white transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;