import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote, Star, TrendingUp, Award, Globe } from "lucide-react";

const SuccessStories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stories = [
    {
      name: "Sarah Dewi",
      business: "Warung Digital Nusantara",
      category: "F&B Tech",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
      story: "Dari warung kecil menjadi franchise digital dengan 50+ outlet berkat strategi digitalisasi dari Semindo.",
      metrics: {
        revenue: "500%",
        outlets: "50+",
        period: "18 bulan"
      },
      rating: 5
    },
    {
      name: "Budi Santoso",
      business: "Batik Modern Indonesia",
      category: "Fashion & Craft",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      story: "Ekspor batik ke 15 negara dengan bantuan program export readiness dan sertifikasi internasional.",
      metrics: {
        revenue: "800%",
        countries: "15",
        period: "2 tahun"
      },
      rating: 5
    },
    {
      name: "Ani Kusuma",
      business: "AgriTech Solutions",
      category: "Agriculture",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      story: "Mengintegrasikan IoT dan AI untuk pertanian modern, meningkatkan produktivitas petani lokal 300%.",
      metrics: {
        revenue: "400%",
        farmers: "1000+",
        period: "15 bulan"
      },
      rating: 5
    }
  ];

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const currentStory = stories[currentIndex];

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/20 mb-4">
            <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Success Stories UMKM
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Inspirasi nyata dari UMKM yang telah bertransformasi dan naik kelas bersama Semindo.
          </p>
        </div>

        {/* Main Story Card */}
        <div className="max-w-5xl mx-auto relative">
          {/* Decorative Elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

          <Card className="bg-white dark:bg-slate-900 border-0 shadow-2xl overflow-hidden relative z-10">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                {/* Story Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center relative">
                  <Quote className="h-12 w-12 text-primary/20 absolute top-8 left-8" />

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-1">
                      {[...Array(currentStory.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    <blockquote className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white leading-relaxed">
                      "{currentStory.story}"
                    </blockquote>

                    <div className="flex items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                      <img
                        src={currentStory.image}
                        alt={currentStory.name}
                        className="w-14 h-14 rounded-full mr-4 object-cover ring-4 ring-slate-50 dark:ring-slate-800"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{currentStory.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{currentStory.business}</p>
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mt-2">
                          {currentStory.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Side */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 md:p-12 flex flex-col justify-center border-l border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-500" />
                    Key Achievements
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Revenue Growth</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">+{currentStory.metrics.revenue}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform duration-300 delay-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {currentStory.metrics.outlets ? 'Total Outlets' :
                            currentStory.metrics.countries ? 'Export Countries' : 'Farmers Impacted'}
                        </span>
                        <Globe className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {currentStory.metrics.outlets || currentStory.metrics.countries || currentStory.metrics.farmers}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform duration-300 delay-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Transformation Period</span>
                        <Award className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">{currentStory.metrics.period}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8 px-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={prevStory}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="h-6 w-6 mr-2" />
              <span className="hidden sm:inline">Story Sebelumnya</span>
            </Button>

            <div className="flex space-x-3">
              {stories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary w-8' : 'bg-slate-300 dark:bg-slate-700 hover:bg-primary/50'
                    }`}
                  aria-label={`Go to story ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="lg"
              onClick={nextStory}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <span className="hidden sm:inline">Story Selanjutnya</span>
              <ChevronRight className="h-6 w-6 ml-2" />
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-10 py-6 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            Lihat Semua Success Stories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;