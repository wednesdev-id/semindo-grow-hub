import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/semindo-hero-bg.jpeg";

interface HeroSectionProps {
  onDaftarClick?: () => void;
}

const HeroSection = ({ onDaftarClick }: HeroSectionProps) => {
  return (
    <section className="relative w-full overflow-hidden font-sans pt-32 lg:pt-[336px] pb-32">
      {/* Note: User asked for 316px gap. 
           With navbar height ~80px (h-20), pt-32 (128px) is usually for mobile.
           For desktop gap 316px, we need pt = 80 + 316 = 396px.
           However, to strictly visually match the "proportion" in the image which shows text starting lower,
           I will stick to the calculated [396px] or adjustments. 
           The previous step set it to [396px]. I'll keep it or tweak slightly if needed.
           Let's stick to lg:pt-[396px] to maintain the "gap 316" request.
       */}

      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 h-full">
        <img
          src={heroImage}
          alt="Tingkatkan Level UMKM"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark Overlay Gradient Removed as per request */}
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-end">

          {/* Left Column: Content - Aligned Bottom to match visual */}
          <div className="text-left space-y-6 lg:py-8 order-2 lg:order-1 lg:max-w-xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05]">
              Tingkatkan Level UMKM mu bersama kami
            </h1>

            <p className="text-lg sm:text-xl text-white/90 font-normal leading-relaxed max-w-lg">
              Semindo bantu UMKM Indonesia berkembang secara terstruktur melalui assessment, pendampingan, dan pembelajaran yang tepat sasaran.
            </p>
          </div>

          {/* Right Column: Registration Form */}
          <div className="w-full flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-full max-w-[480px] bg-white rounded-xl shadow-2xl p-6 sm:p-8 animate-slide-up">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Daftar UMKM untuk bergabung
                </h2>
              </div>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700 font-medium">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      placeholder="Nama lengkap Anda"
                      disabled
                      className="bg-[#E5E7EB] border-transparent text-slate-600 cursor-not-allowed h-12 rounded-md px-4 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email@gmail.com"
                        disabled
                        className="bg-[#E5E7EB] border-transparent text-slate-600 cursor-not-allowed h-12 rounded-md px-4 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 font-medium">Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="08xxx"
                        disabled
                        className="bg-[#E5E7EB] border-transparent text-slate-600 cursor-not-allowed h-12 rounded-md px-4 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-slate-700 font-medium">Nama Usaha</Label>
                    <Input
                      id="businessName"
                      placeholder="Nama lengkap Anda"
                      disabled
                      className="bg-[#E5E7EB] border-transparent text-slate-600 cursor-not-allowed h-12 rounded-md px-4 placeholder:text-slate-400"
                    />
                    {/* Note: Placeholder matches the image typo "Nama lengkap Anda" for visual fidelity, though strictly it should be "Nama usaha Anda" */}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 mt-6 bg-[#212A65] hover:bg-[#1a2152] text-white font-medium text-base rounded-lg transition-all duration-200"
                  onClick={onDaftarClick}
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