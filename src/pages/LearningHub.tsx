import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, Users, Award, Clock, Star, PlayCircle, Calendar } from "lucide-react";
import SEOHead from "@/components/ui/seo-head";

import { useQuery } from "@tanstack/react-query";
import { lmsService } from "@/services/lmsService";
import { Link } from "react-router-dom";

const LearningHub = () => {
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => lmsService.getCourses()
  });

  // Group courses by category
  const modules = [
    {
      category: "Marketing",
      icon: "📱",
      courses: courses.filter(c => c.category === 'Marketing')
    },
    {
      category: "Finance",
      icon: "💰",
      courses: courses.filter(c => c.category === 'Finance')
    },
    {
      category: "Export",
      icon: "🌍",
      courses: courses.filter(c => c.category === 'Export')
    }
  ];

  const webinars = [
    {
      title: "Digital Transformation for SMEs",
      date: "25 Oktober 2024",
      time: "19:00 WIB",
      speaker: "Dr. Ahmad Rifai",
      participants: 450,
      status: "upcoming"
    },
    {
      title: "Export Market Opportunities 2024",
      date: "28 Oktober 2024",
      time: "20:00 WIB",
      speaker: "Budi Santoso",
      participants: 320,
      status: "upcoming"
    },
    {
      title: "Fintech Solutions for SME Funding",
      date: "22 Oktober 2024",
      time: "19:30 WIB",
      speaker: "Sari Maharani",
      participants: 280,
      status: "completed"
    }
  ];

  const mentors = [
    {
      name: "Sarah Dewi",
      expertise: "Digital Marketing Specialist",
      experience: "8 tahun",
      rating: 4.9,
      sessions: 150,
      price: "Rp 250K/jam"
    },
    {
      name: "Robert Chen",
      expertise: "Export Trade Consultant",
      experience: "12 tahun",
      rating: 4.8,
      sessions: 200,
      price: "Rp 400K/jam"
    },
    {
      name: "Indira Sari",
      expertise: "Financial Advisor",
      experience: "10 tahun",
      rating: 4.9,
      sessions: 180,
      price: "Rp 350K/jam"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Learning Hub Semindo – Modul, Webinar, & Sertifikat Digital"
        description="Belajar marketing digital, keuangan, ekspor, dan legalitas. Ikuti webinar, temukan mentor, dan raih sertifikat digital blockchain-ready."
        keywords="learning hub, modul pembelajaran UMKM, webinar bisnis, sertifikat digital, mentor bisnis"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Learning <span className="text-primary">Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Platform pembelajaran terpadu untuk mengembangkan kemampuan UMKM dengan kurikulum yang disesuaikan kebutuhan
          </p>
          <Button size="lg" className="font-semibold">
            <BookOpen className="h-5 w-5 mr-2" />
            Mulai Belajar Sekarang
          </Button>
        </div>
      </section>

      {/* Learning Modules */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Modul Pembelajaran
            </h2>
            <p className="text-xl text-muted-foreground">
              Kurikulum komprehensif yang dirancang khusus untuk UMKM
            </p>
          </div>

          <Tabs defaultValue="marketing" className="w-full">
            <TabsList className="grid w-full md:grid-cols-3">
              <TabsTrigger value="marketing">Marketing Digital</TabsTrigger>
              <TabsTrigger value="finance">Keuangan</TabsTrigger>
              <TabsTrigger value="export">Ekspor</TabsTrigger>
            </TabsList>

            {modules.map((module, index) => (
              <TabsContent key={index} value={module.category.toLowerCase()} className="mt-8">
                <div className="grid md:grid-cols-1 gap-6">
                  {module.courses.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      Belum ada kursus untuk kategori ini.
                    </div>
                  ) : (
                    module.courses.map((course, idx) => (
                      <Card key={idx} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {/* Assuming duration is in minutes, convert to hours roughly or display as is */}
                                  {course.modules?.reduce((acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + (l.duration || 0), 0), 0)} menit
                                </div>
                                <Badge variant="secondary">{course.level}</Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  4.8 {/* Hardcoded rating for now as it's not in Course interface yet */}
                                </div>
                              </div>
                            </div>
                            <div className="text-4xl">{module.icon}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/lms/courses/${course.slug}`}>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Preview
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link to={`/lms/courses/${course.slug}`}>Mulai Kursus</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Webinars & Events */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Webinar & Event Online
            </h2>
            <p className="text-xl text-muted-foreground">
              Sesi live bersama para ahli dan praktisi berpengalaman
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {webinars.map((webinar, index) => (
              <Card key={index} className={`${webinar.status === 'upcoming' ? 'border-primary' : 'opacity-75'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{webinar.title}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {webinar.date} • {webinar.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {webinar.participants} peserta
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant={webinar.status === 'upcoming' ? 'default' : 'secondary'}>
                      {webinar.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Speaker: {webinar.speaker}
                    </div>
                    <Button size="sm" variant={webinar.status === 'upcoming' ? 'default' : 'outline'}>
                      {webinar.status === 'upcoming' ? 'Daftar' : 'Rekaman'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Directory */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mentor & Trainer Directory
            </h2>
            <p className="text-xl text-muted-foreground">
              Belajar langsung dari para ahli dengan sesi mentoring 1-on-1
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {mentors.map((mentor, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>{mentor.name}</CardTitle>
                  <CardDescription>{mentor.expertise}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pengalaman:</span>
                    <span className="font-medium">{mentor.experience}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{mentor.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sesi:</span>
                    <span className="font-medium">{mentor.sessions}+</span>
                  </div>
                  <div className="text-lg font-semibold text-primary">{mentor.price}</div>
                  <Button className="w-full">Book Mentoring</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sertifikat Digital
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Dapatkan sertifikat blockchain-ready yang diakui industri setelah menyelesaikan modul pembelajaran
          </p>

          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <Award className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Blockchain Certificate</h3>
                  <p className="text-muted-foreground mb-4">
                    Sertifikat digital yang tersimpan aman di blockchain, dapat diverifikasi secara global dan terintegrasi dengan LinkedIn.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Verifikasi otomatis & anti-pemalsuan
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Terintegrasi dengan professional network
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Diakui oleh mitra industri
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-xl">
                  <div className="text-6xl mb-4">🏆</div>
                  <h4 className="font-semibold mb-2">Sample Certificate</h4>
                  <p className="text-sm text-muted-foreground">Digital Marketing Mastery for SMEs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearningHub;