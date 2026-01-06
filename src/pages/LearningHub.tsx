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

  // Fetch instructors from database
  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/v1/consultation/instructors');
        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
        return [];
      }
    }
  });

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

          {/* View All Courses CTA */}
          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link to="/explore/courses">
                <BookOpen className="h-5 w-5 mr-2" />
                Lihat Semua Kursus
              </Link>
            </Button>
          </div>
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

          {/* View All Webinars CTA */}
          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link to="/community/events">
                <Video className="h-5 w-5 mr-2" />
                Lihat Semua Webinar & Event
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Course Instructors */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Instruktur Berpengalaman
            </h2>
            <p className="text-xl text-muted-foreground">
              Belajar dari mentor dan expert yang berpengalaman di bidangnya
            </p>
          </div>

          {(!instructors?.mentors?.length && !instructors?.consultants?.length) ? (
            <div className="text-center p-8 text-muted-foreground">
              Instruktur akan segera hadir
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Display Mentors */}
              {instructors?.mentors?.map((mentor: any) => (
                <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {mentor.user?.profilePictureUrl ? (
                        <img src={mentor.user.profilePictureUrl} alt={mentor.user?.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CardTitle className="text-center text-base">{mentor.user?.fullName || 'Mentor'}</CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        Mentor
                      </Badge>
                    </div>
                    <CardDescription className="text-center">{mentor.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {mentor.expertise?.slice(0, 2).map((exp: string, idx: number) => (
                        <Badge key={idx} variant="outline">{exp}</Badge>
                      ))}
                    </div>
                    {mentor.yearsExperience && (
                      <div className="text-center text-sm text-muted-foreground">
                        {mentor.yearsExperience} tahun pengalaman
                      </div>
                    )}
                    <div className="text-center text-sm text-muted-foreground">
                      {mentor.courses?.length || 0} kursus
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/lms/instructor/mentor/${mentor.id}`}>Lihat Kursus</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Display Consultants who teach */}
              {instructors?.consultants?.map((consultant: any) => (
                <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {consultant.user?.profilePictureUrl ? (
                        <img src={consultant.user.profilePictureUrl} alt={consultant.user?.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CardTitle className="text-center text-base">{consultant.user?.fullName || 'Consultant'}</CardTitle>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                        Consultant
                      </Badge>
                    </div>
                    <CardDescription className="text-center">{consultant.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {consultant.expertise?.slice(0, 2).map((exp: string, idx: number) => (
                        <Badge key={idx} variant="outline">{exp}</Badge>
                      ))}
                    </div>
                    {consultant.yearsExperience && (
                      <div className="text-center text-sm text-muted-foreground">
                        {consultant.yearsExperience} tahun pengalaman
                      </div>
                    )}
                    <div className="text-center text-sm text-muted-foreground">
                      {consultant.courses?.length || 0} kursus
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/consultants/${consultant.id}`}>Lihat Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA: Clear Pathways */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Butuh Bimbingan Lebih Lanjut?
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Pilih jalur pembelajaran yang sesuai dengan kebutuhan Anda
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Option 1: Free Mentoring */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    🎓 Program Mentoring
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Gratis</Badge>
                </div>
                <CardDescription className="text-base">
                  Bimbingan berkelanjutan 3-6 bulan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                    </div>
                    <span>Mentor profesional di-assign khusus untuk Anda</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                    </div>
                    <span>Follow-up rutin dan monitoring progress bisnis</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                    </div>
                    <span>Cocok untuk UMKM pemula yang membutuhkan bimbingan menyeluruh</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" size="lg" asChild>
                  <Link to="/explore/mentors">
                    Cari Mentor →
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Option 2: Paid Consultation */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    💼 Konsultasi Expert
                  </CardTitle>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">On-Demand</Badge>
                </div>
                <CardDescription className="text-base">
                  Solusi cepat untuk masalah spesifik
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="mt-1 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                    </div>
                    <span>Pilih expert sesuai kebutuhan dan budget Anda</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="mt-1 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                    </div>
                    <span>Booking langsung, fleksibel sesuai jadwal Anda</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="mt-1 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                    </div>
                    <span>Sesi 1-2 jam untuk mendapat solusi cepat</span>
                  </li>
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/explore/consultants">
                    Cari Konsultan →
                  </Link>
                </Button>
              </CardContent>
            </Card>
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