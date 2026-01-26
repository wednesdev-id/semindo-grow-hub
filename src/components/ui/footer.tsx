import { Button } from "@/components/ui/button";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart
} from "lucide-react";
import { featureFlags } from "@/config/feature-flags";

const Footer = () => {
  const footerSections = [
    {
      title: "Layanan",
      links: [
        { name: "Konsultasi Digital", href: "#konsultasi-digital" },
        { name: "Konsultasi Keuangan", href: "#konsultasi-keuangan" },
        { name: "Sertifikasi & Legalitas", href: "#sertifikasi" },
        { name: "Pasar & Ekspor", href: "#pasar-ekspor" }
      ]
    },
    {
      title: "Program",
      links: [
        { name: "Self-Assessment", href: "#assessment" },
        { name: "Learning Hub", href: "#learning" },
        ...(featureFlags.MARKETPLACE_ENABLED ? [{ name: "Marketplace", href: "#marketplace" }] : []),
        { name: "Community", href: "#community" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Blog & Insight", href: "#blog" },
        { name: "Success Stories", href: "#stories" },
        { name: "Export Hub", href: "#export" },
        { name: "Financing Hub", href: "#financing" }
      ]
    },
    {
      title: "Perusahaan",
      links: [
        { name: "Tentang Kami", href: "#tentang" },
        { name: "Tim", href: "#tim" },
        { name: "Karir", href: "#karir" },
        { name: "Press Kit", href: "#press" }
      ]
    }
  ];

  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-800">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-bold text-white">Stay Updated</h3>
              <p className="text-slate-400 text-lg">
                Dapatkan insights terbaru tentang perkembangan UMKM dan teknologi bisnis.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="flex-1 px-6 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-primary/25 transition-all">
                Subscribe
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-2">
              <img
                src="/LOGOS.png"
                alt="Sinergi Logo"
                className="w-32 h-24 object-contain"
              />

            </div>
            <p className="text-slate-400 leading-relaxed text-lg">
              Platform konsultasi berbasis teknologi yang membantu UMKM Indonesia
              berkembang melalui solusi digital, keuangan, dan strategi bisnis terintegrasi.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-start text-slate-400 hover:text-white transition-colors group">
                <MapPin className="h-5 w-5 mr-3 text-primary mt-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm leading-relaxed">Jakarta, Bandung, Surabaya, Medan</span>
              </div>
              <div className="flex items-center text-slate-400 hover:text-white transition-colors group">
                <Phone className="h-5 w-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm">+62 21 1234 5678</span>
              </div>
              <div className="flex items-center text-slate-400 hover:text-white transition-colors group">
                <Mail className="h-5 w-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm">hello@semindo.id</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: Youtube, href: "#" }
              ].map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 group"
                >
                  <Icon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="font-bold text-white text-lg">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-primary hover:pl-2 transition-all duration-200 text-sm block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-500 text-sm flex items-center gap-1">
              © 2024 Semindo. Made with <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" /> for Indonesian SMEs.
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <a href="#privacy" className="text-slate-500 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-slate-500 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-slate-500 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;