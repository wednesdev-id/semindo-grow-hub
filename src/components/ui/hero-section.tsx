import { Button } from "@/components/ui/button";
import { useState } from "react";
import heroImage from "@/assets/Hero Semindo 1@2x.png";

interface FormData {
  namaLengkap: string;
  email: string;
  telepon: string;
  namaUsaha: string;
}

const HeroSection = () => {
  const [formData, setFormData] = useState<FormData>({
    namaLengkap: "",
    email: "",
    telepon: "",
    namaUsaha: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = formData.namaLengkap && formData.email && formData.telepon && formData.namaUsaha;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log("Form submitted:", formData);
      // TODO: Submit to API
    }
  };

  return (
    <section className="relative w-screen min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Pure Image Only */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="UMKM Growth"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-0" style={{ marginTop: "316px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center min-h-screen lg:min-h-auto lg:h-[90vh]">
          
          {/* Left Column - Content (60%) */}
          <div className="lg:col-span-3 text-white">
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 lg:mb-8"
              style={{ maxWidth: "90%", fontFamily: "Inter" }}
            >
              Tingkatkan Level UMKM mu bersama kami
            </h1>
            
            <p 
              className="text-lg sm:text-xl leading-relaxed mb-8 lg:mb-12"
              style={{ 
                maxWidth: "80%",
                opacity: 0.85,
                fontFamily: "Inter",
                fontWeight: 400
              }}
            >
              Semindo bantu UMKM Indonesia berkembang secara terstruktur melalui assessment, pendampingan, dan pembelajaran yang tepat sasaran.
            </p>

            {/* Additional Info */}
            <div className="space-y-4 text-base" style={{ maxWidth: "80%", fontFamily: "Inter" }}>
              <div className="flex items-start gap-3">
                <span className="text-secondary font-bold text-xl">✓</span>
                <span>Evaluasi mendalam tingkat kematangan bisnis Anda</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-secondary font-bold text-xl">✓</span>
                <span>Pendampingan langsung dari mentor berpengalaman</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-secondary font-bold text-xl">✓</span>
                <span>Akses ke ribuan materi pembelajaran digital</span>
              </div>
            </div>
          </div>

          {/* Right Column - Form Card (40%) */}
          <div className="lg:col-span-2 flex items-center justify-center lg:justify-end h-full">
            <div 
              className="w-full bg-white rounded-lg p-8 shadow-lg"
              style={{ maxWidth: "420px", fontFamily: "Inter" }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6" style={{ color: "#212A65" }}>
                Daftar UMKM untuk bergabung
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                  <input
                    type="text"
                    name="namaLengkap"
                    placeholder="Nama lengkap Anda"
                    value={formData.namaLengkap}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded placeholder-gray-400 focus:outline-none cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded placeholder-gray-400 focus:outline-none cursor-not-allowed"
                  />
                </div>

                {/* Telepon */}
                <div>
                  <input
                    type="tel"
                    name="telepon"
                    placeholder="08xxx"
                    value={formData.telepon}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded placeholder-gray-400 focus:outline-none cursor-not-allowed"
                  />
                </div>

                {/* Nama Usaha */}
                <div>
                  <input
                    type="text"
                    name="namaUsaha"
                    placeholder="Nama lengkap Anda"
                    value={formData.namaUsaha}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded placeholder-gray-400 focus:outline-none cursor-not-allowed"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full py-3 px-4 rounded font-bold text-white transition-all duration-200 mt-8"
                  style={{ 
                    backgroundColor: "#212A65",
                    height: "44px",
                    minHeight: "44px",
                    fontFamily: "Inter"
                  }}
                >
                  Daftar UMKM Sekarang
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;