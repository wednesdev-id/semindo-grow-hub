import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/ui/seo-head";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { assessmentService } from "@/features/assessment/services/assessmentService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
// Import Assets
import heroBg from "@/assets/Semindo assessment 1.png";
import processImage from "@/assets/image 55.png";
import sampleImage from "@/assets/sample assesment final.png";
import connectorLine from "@/assets/Rectangle 848.png";

export default function SelfAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['assessment-templates'],
    queryFn: assessmentService.getTemplates
  });

  const createAssessmentMutation = useMutation({
    mutationFn: assessmentService.createAssessment,
    onSuccess: (data) => {
      navigate(`/assessment/${data.id}/wizard`);
    },
    onError: (error) => {
      toast({
        title: "Gagal memulai assessment",
        description: "Silakan coba lagi nanti",
        variant: "destructive"
      });
    }
  });

  const handleStartAssessment = () => {
    // Find the template ID for generic or default assessment
    // This logic might need adjustment based on how you want to select the template
    const templateId = templates?.[0]?.id;
    if (!templateId) {
      // Fallback or specific template ID if known, or navigate to a selection page
      // For now, let's just scroll to topics as 'starting' the journey
      document.getElementById('topics-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    createAssessmentMutation.mutate(templateId);
  };

  const topics = [
    { id: 1, title: 'Analisis Bisnis', description: 'Seberapa kuat fundamental dan model bisnismu bertahan di pasar?' },
    { id: 2, title: 'Manajemen', description: 'Evaluasi efektivitas kepemimpinan dan tata kelola tim operasional.' },
    { id: 3, title: 'Network', description: 'Ukur kualitas jaringan kemitraan yang mendukung ekspansi bisnis.' },
    { id: 4, title: 'Branding', description: 'Nilai seberapa kuat merekmu dikenal dan diingat oleh pelanggan.' },
    { id: 5, title: 'Keuangan', description: 'Analisis kesehatan arus kas, profitabilitas, dan manajemen modal.' },
    { id: 6, title: 'Pemasaran', description: 'Seberapa efektif strategimu mendatangkan dan mempertahankan pelanggan?' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Self Assessment - Semindo"
        description="Kenali permasalahan bisnismu dengan Self Assessment Semindo."
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-[#1e293b] text-white min-h-screen flex items-end overflow-hidden pt-20 pb-10 md:pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop";
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row">
          <div className="md:w-3/4 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Self Assessment: Cek Kesehatan<br />
              Bisnis Anda Secara Menyeluruh
            </h1>
            <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
              Jangan biarkan bisnis Anda berjalan tanpa arah. Ketahui kekuatan dan kelemahan usahamu dalam 10 menit. Dapatkan rekomendasi strategis berbasis data untuk scale-up lebih cepat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-medium rounded-md w-full sm:w-auto"
                onClick={handleStartAssessment}
              >
                Mulai Self Assessment
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white/10 px-8 h-12 text-base font-medium rounded-md w-full sm:w-auto"
                onClick={() => navigate('/daftar')}
              >
                Daftar UMKM Sekarang
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Section (What) - Moved up */}
      <section id="topics-section" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-24 max-w-4xl leading-tight">
            Apa saja yang diuji dalam<br />
            Self Assessment?
          </h2>

          <div className="relative lg:pl-64">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 relative z-10">
              {topics.map((topic, index) => (
                <div key={topic.id} className="flex flex-col gap-4 relative">
                  {/* Connector Line for this item (connects to next) */}
                  {/* Show for all items except the very last one */}
                  {(index !== topics.length - 1) && (
                    <div className="hidden lg:block absolute left-[6rem] top-[1.75rem] -translate-y-1/2 h-[2px] w-[calc(100%-5rem)] -z-10">
                      <img src={connectorLine} className="w-full h-full object-cover opacity-50" alt="" />
                    </div>
                  )}

                  {/* Number Circle */}
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl mb-2 relative z-10">
                    {topic.id}.
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{topic.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {topic.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section (How) - Moved down */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <img
                src={processImage}
                alt="Assessment Process"
                className="rounded-2xl w-full object-cover shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop";
                }}
              />
            </div>
            <div className="lg:w-1/2 space-y-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Bagaimana Proses<br />
                Assessment ini berlangsung?
              </h2>

              <div className="space-y-12">
                <div className="relative">
                  <div className="flex gap-6 relative z-10">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                      1
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-bold text-gray-900">Isi Kuesioner</h3>
                      <p className="text-gray-500 leading-relaxed">
                        Jawab serangkaian pertanyaan sederhana mengenai kondisi aktual bisnismu saat ini.
                      </p>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-green-500 w-1/2 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex gap-6 relative z-10">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                      2
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
                      <p className="text-gray-500 leading-relaxed">
                        Sistem cerdas kami mengolah jawabanmu dan membandingkannya dengan standar industri.
                      </p>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-green-500 w-3/4 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex gap-6 relative z-10">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                      3
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-bold text-gray-900">Personalized Report</h3>
                      <p className="text-gray-500 leading-relaxed">
                        Dapatkan insight mendalam dan panduan langkah demi langkah untuk perbaikan.
                      </p>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-green-500 w-full rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Result Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-blue-50 rounded-3xl overflow-hidden flex flex-col lg:flex-row items-stretch">
            <div className="lg:w-1/3 p-8 md:p-16 space-y-8 flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Gambaran Hasil yang Akan<br />
                Anda Dapatkan
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Bukan sekadar angka, tapi panduan nyata. Lihat contoh laporan detil yang telah membantu ribuan UMKM mengambil keputusan bisnis yang lebih tepat dan strategis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#212A65] hover:bg-[#1a2151] text-white px-8 h-12 text-base rounded-md shadow-lg shadow-blue-200"
                >
                  Lihat Sampel
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-gray-300 text-gray-700 hover:bg-white px-8 h-12 text-base rounded-md"
                >
                  Unduh Sampel
                </Button>
              </div>
            </div>
            <div className="lg:w-2/3 relative h-automin-h-[400px]">
              <img
                src={sampleImage}
                alt="Sample Assessment Report"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
