import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, BookOpen, ArrowRight, Sparkles } from "lucide-react";

const QuickAccess = () => {
  const quickAccessItems = [
    {
      icon: CheckCircle,
      title: "Self-Assessment",
      subtitle: "Cek Kesiapan Usaha",
      description: "Evaluasi mendalam tingkat kematangan bisnis Anda dengan AI assessment engine kami.",
      features: ["AI-powered analysis", "Rekomendasi personal", "Dashboard tracking"],
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-200 dark:border-blue-900",
      href: "#assessment"
    },
    {
      icon: Users,
      title: "Join Program",
      subtitle: "Program Pendampingan",
      description: "Bergabung dengan program pendampingan eksklusif bersama mentor ahli.",
      features: ["Mentor berpengalaman", "Group mentoring", "Network building"],
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-200 dark:border-orange-900",
      href: "#program"
    },
    {
      icon: BookOpen,
      title: "Learning Hub",
      subtitle: "Belajar Digital",
      description: "Akses ribuan materi pembelajaran dan sertifikasi untuk mengembangkan skill bisnis.",
      features: ["Video course", "Live webinar", "Digital certificate"],
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-900",
      href: "#learning"
    }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Langkah Awal
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Mulai Perjalanan Bisnis Anda
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Pilih jalur yang tepat untuk mengakselerasi pertumbuhan UMKM Anda dengan panduan teknologi dan ahli.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickAccessItems.map((item, index) => (
            <Card
              key={item.title}
              className={`group hover:shadow-2xl transition-all duration-500 border bg-white dark:bg-slate-800 hover:-translate-y-2 overflow-hidden relative ${item.borderColor}`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${item.bgColor.replace('/10', '')}`} />
              <CardContent className="p-8">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${item.bgColor} mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </div>

                {/* Content */}
                <div className="space-y-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className={`text-sm font-medium ${item.color} mt-1`}>
                      {item.subtitle}
                    </p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 border-t border-slate-100 dark:border-slate-700 pt-6">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className={`h-4 w-4 ${item.color} mr-3 flex-shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full group/btn ${item.bgColor} ${item.color} hover:text-white hover:${item.bgColor.replace('/10', '')} border-0`}
                  variant="outline"
                  asChild
                >
                  <a href={item.href}>
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Masih bingung harus mulai dari mana?
          </p>
          <Button variant="outline" size="lg" className="px-8 py-6 rounded-xl text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Konsultasi dengan Ahli Kami
          </Button>
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;