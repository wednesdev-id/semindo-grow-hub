import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/ui/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Clock, ArrowUpRight, Calendar, Users, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { lmsService, Course, Webinar } from "@/services/lmsService";
import { Link } from "react-router-dom";
import heroBg from "@/assets/Learning hub 1.png";
import WebinarCard from "@/components/lms/WebinarCard";

export default function LearningHub() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua Subjek");
  const [courseType, setCourseType] = useState<string>("Semua kursus");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'course' | 'webinar'>('course');

  // Webinar Filters
  const [webinarType, setWebinarType] = useState<string>("webinar");
  const [isOnlineFilter, setIsOnlineFilter] = useState<boolean | undefined>(undefined);
  const [activeWebinarFilter, setActiveWebinarFilter] = useState<string>("Semua Webinar");

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses', activeCategory, courseType, searchQuery],
    queryFn: () => lmsService.getCourses({
      search: searchQuery,
      category: activeCategory !== "Semua Subjek" ? activeCategory : undefined,
    }),
    enabled: activeTab === 'course'
  });

  const { data: webinars = [], isLoading: isLoadingWebinars } = useQuery({
    queryKey: ['webinars', searchQuery, webinarType, isOnlineFilter],
    queryFn: () => lmsService.getWebinars({
      search: searchQuery,
      type: webinarType,
      isOnline: isOnlineFilter
    }),
    enabled: activeTab === 'webinar'
  });

  const filteredCourses = courses.filter((course: Course) => {
    // Client-side filtering for robustness
    if (courseType === "Kursus Gratis" && !course.price && course.price !== 0) return false; // assuming price 0 is free, check logic
    // Implementation detail: checking lmsService interface, price is number.
    if (courseType === "Kursus Gratis" && course.price > 0) return false;
    if (courseType === "Kursus Premium" && course.price === 0) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <SEOHead
        title="Learning Hub - Semindo"
        description="Tumbuhkan UMKMmu bersama kami dengan berbagai kursus dan webinar."
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative text-white min-h-screen flex items-end overflow-hidden pt-20 pb-10 md:pb-16">
        {/* Background Image Overlay - Using local asset */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row">
          <div className="md:w-3/4 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Learning hub-Tumbuhkan<br />
              UMKMmu bersama kami
            </h1>
            <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
              Akses ratusan modul pembelajaran praktis dan webinar eksklusif yang dirancang khusus untuk membantu UMKM Indonesia naik kelas di era digital.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-6 rounded-md font-medium text-base">
                Mulai Belajar Sekarang
              </Button>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white px-8 py-6 rounded-md font-medium text-base">
                Akses dashboard UMKM
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Top Tabs & Search */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 border-b border-gray-100 pb-4">
            <div className="flex gap-8 text-sm font-medium">
              <button
                onClick={() => setActiveTab('course')}
                className={`${activeTab === 'course' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-900'} border-b-2 pb-4 -mb-4 px-1 transition-colors`}
              >
                Course
              </button>
              <button
                onClick={() => setActiveTab('webinar')}
                className={`${activeTab === 'webinar' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-900'} border-b-2 pb-4 -mb-4 px-1 transition-colors`}
              >
                Webinar
              </button>
            </div>

            <div className="relative w-full lg:w-1/2">
              <Input
                placeholder="Cari kelas atau subjek belajar"
                className="bg-gray-50 border-gray-100 pl-4 pr-10 py-5 rounded-md text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">

            {/* Sidebar Filters */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
              {activeTab === 'course' ? (
                <>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Course</h3>
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                      {["Semua kursus", "Kursus singkat", "Kursus Gratis", "Kursus Premium"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setCourseType(type)}
                          className={`text-left hover:text-blue-600 transition-colors ${courseType === type ? 'text-blue-600 font-medium' : ''}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Subjek</h3>
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                      {["Semua Subjek", "Pengembangan Bisnis", "Finance", "Manajemen", "Network", "Pemasaran", "Branding"].map((subject) => (
                        <button
                          key={subject}
                          onClick={() => setActiveCategory(subject)}
                          className={`text-left hover:text-blue-600 transition-colors ${activeCategory === subject ? 'text-blue-600 font-medium' : ''}`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Webinar Sidebar */
                <>
                  <div className="mb-6">
                    <Button variant="outline" className="w-full justify-between bg-blue-50/50 border-blue-100 text-blue-900 hover:bg-blue-100 hover:text-blue-900">
                      <span>Pilih lokasi</span>
                      <ArrowUpRight className="h-4 w-4 rotate-180" /> {/* Down arrow approximation or use ChevronDown if available */}
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Webinar & Event</h3>
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                      <button
                        onClick={() => {
                          setActiveWebinarFilter("Semua Webinar");
                          setWebinarType("webinar");
                          setIsOnlineFilter(undefined);
                        }}
                        className={`text-left hover:text-blue-600 transition-colors ${activeWebinarFilter === "Semua Webinar" ? 'text-blue-600 font-medium' : ''}`}
                      >
                        Semua Webinar
                      </button>
                      <button
                        onClick={() => {
                          setActiveWebinarFilter("Webinar online");
                          setWebinarType("webinar");
                          setIsOnlineFilter(true);
                        }}
                        className={`text-left hover:text-blue-600 transition-colors ${activeWebinarFilter === "Webinar online" ? 'text-blue-600 font-medium' : ''}`}
                      >
                        Webinar online
                      </button>
                      <button
                        onClick={() => {
                          setActiveWebinarFilter("Webinar offline");
                          setWebinarType("webinar");
                          setIsOnlineFilter(false);
                        }}
                        className={`text-left hover:text-blue-600 transition-colors ${activeWebinarFilter === "Webinar offline" ? 'text-blue-600 font-medium' : ''}`}
                      >
                        Webinar offline
                      </button>
                      <button
                        onClick={() => {
                          setActiveWebinarFilter("Event");
                          setWebinarType("event");
                          setIsOnlineFilter(undefined);
                        }}
                        className={`text-left hover:text-blue-600 transition-colors ${activeWebinarFilter === "Event" ? 'text-blue-600 font-medium' : ''}`}
                      >
                        Event
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Course Grid Area */}
            <div className="flex-1">
              <div className="flex gap-6 text-sm font-medium mb-6 border-b border-gray-100">
                <button className="text-gray-900 border-b-2 border-gray-900 pb-3 -mb-[1px]">Terekomendasi</button>
                <button className="text-gray-500 hover:text-gray-900 pb-3">Populer</button>
              </div>

              {activeTab === 'course' ? (
                isLoadingCourses ? (
                  <div className="text-center py-12 text-gray-500">Memuat kursus...</div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Tidak ada kursus yang ditemukan.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course: Course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )
              ) : (
                isLoadingWebinars ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                      <Card key={i} className="h-[400px] animate-pulse bg-gray-100" />
                    ))}
                  </div>
                ) : webinars.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {webinars.map((webinar: Webinar) => (
                      <WebinarCard key={webinar.id} webinar={webinar} />
                    ))}
                  </div>
                ) : (
                  <div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center">
                    <Video className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Belum ada Webinar</h3>
                    <p className="max-w-md mx-auto mt-2">
                      Saat ini belum ada jadwal webinar yang tersedia. Silakan cek kembali nanti untuk update terbaru.
                    </p>
                  </div>
                )
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full rounded-xl overflow-hidden bg-white">
      <div className="h-48 bg-gray-200 relative">
        {course.thumbnailUrl || course.thumbnail ? (
          <img
            src={course.thumbnailUrl || course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            {/* Placeholder Icon or styling */}
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">
          {course.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>3 minggu</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>3 jam per minggu</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 bg-[#1e2350] hover:bg-[#2a306e] text-white">
            Mulai Kursus
          </Button>
          <Link to={`/lms/courses/${course.slug}`}>
            <Button variant="outline" className="px-3 border-gray-300">
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}