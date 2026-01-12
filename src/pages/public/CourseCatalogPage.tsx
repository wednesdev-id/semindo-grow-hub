import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Clock, Star, Users, Play, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';

export default function CourseCatalogPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Fetch courses
    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['public-courses'],
        queryFn: async () => {
            const response = await fetch('/api/v1/lms/courses');
            const data = await response.json();
            return data.data || [];
        }
    });

    // Filter courses
    const filteredCourses = courses.filter((course: any) => {
        const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;

        return matchesSearch && matchesCategory && course.isPublished;
    });

    const handleEnroll = (courseSlug: string, isFree: boolean) => {
        if (!isAuthenticated) {
            navigate(`/login?redirect=/lms/course/${courseSlug}`);
        } else {
            navigate(`/lms/course/${courseSlug}`);
        }
    };

    // Get unique categories
    const categories: string[] = ['all', ...Array.from(new Set(courses.map((c: any) => c.category as string).filter(Boolean)))];

    return (
        <>
            <SEOHead
                title="Katalog Kursus - Semindo"
                description="Jelajahi berbagai kursus untuk mengembangkan bisnis UMKM Anda. Dari digital marketing hingga manajemen keuangan."
            />

            <Navigation />

            {/* Back to Learning Hub */}
            <div className="bg-background border-b">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/learning-hub">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Learning Hub
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-900 dark:to-blue-900 py-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <BookOpen className="h-16 w-16 text-white mx-auto mb-6" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Katalog Kursus
                        </h1>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Tingkatkan skill dan pengetahuan bisnis Anda dengan kursus dari expert
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari kursus..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-14 text-lg bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Bar */}
                <section className="border-b bg-card">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-3xl font-bold text-primary">{courses.length}</div>
                                <div className="text-sm text-muted-foreground">Total Kursus</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">
                                    {courses.filter((c: any) => c.price === 0).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Kursus Gratis</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">{categories.length - 1}</div>
                                <div className="text-sm text-muted-foreground">Kategori</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">
                                    {courses.reduce((acc: number, c: any) => acc + (c.enrollmentCount || 0), 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Peserta</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category Tabs */}
                <section className="py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                            <TabsList className="mb-8 flex-wrap h-auto">
                                <TabsTrigger value="all">Semua Kursus</TabsTrigger>
                                {categories.filter(c => c !== 'all').map((category) => (
                                    <TabsTrigger key={category} value={category}>
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <TabsContent value={selectedCategory}>
                                {isLoading ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <Card key={i} className="animate-pulse">
                                                <div className="h-48 bg-gray-200"></div>
                                                <CardHeader>
                                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>
                                ) : filteredCourses.length === 0 ? (
                                    <div className="text-center py-16">
                                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">Tidak ada kursus ditemukan</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Coba ubah kategori atau kata kunci pencarian Anda
                                        </p>
                                        <Button variant="outline" onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                        }}>
                                            Reset Filter
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredCourses.map((course: any) => (
                                            <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                                                {/* Course Thumbnail */}
                                                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <BookOpen className="h-16 w-16 text-primary/40" />
                                                        </div>
                                                    )}

                                                    {/* Price Badge */}
                                                    <div className="absolute top-3 right-3">
                                                        {course.price === 0 || !course.isPaid ? (
                                                            <Badge className="bg-green-500">GRATIS</Badge>
                                                        ) : (
                                                            <Badge className="bg-primary">
                                                                Rp {Number(course.price).toLocaleString('id-ID')}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Level Badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <Badge variant="secondary">{course.level}</Badge>
                                                    </div>
                                                </div>

                                                <CardHeader>
                                                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {course.description}
                                                    </CardDescription>
                                                </CardHeader>

                                                <CardContent className="space-y-4">
                                                    {/* Course Stats */}
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{course.duration || 0} menit</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{course.enrollmentCount || 0} peserta</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span>{course.rating?.toFixed(1) || '0.0'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Author */}
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                            {course.author?.profilePictureUrl ? (
                                                                <img src={course.author.profilePictureUrl} alt={course.author.fullName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Users className="h-4 w-4 text-primary" />
                                                            )}
                                                        </div>
                                                        <span className="text-muted-foreground">
                                                            {course.author?.fullName || 'Instructor'}
                                                        </span>
                                                    </div>

                                                    {/* CTA Button */}
                                                    <Button
                                                        className="w-full"
                                                        onClick={() => handleEnroll(course.slug, course.price === 0)}
                                                    >
                                                        {course.price === 0 ? (
                                                            <>
                                                                <Play className="h-4 w-4 mr-2" />
                                                                Mulai Belajar Gratis
                                                            </>
                                                        ) : isAuthenticated ? (
                                                            'Daftar Kursus'
                                                        ) : (
                                                            'Login & Daftar'
                                                        )}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Ingin Berbagi Ilmu?</h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Menjadi instructor dan buat kursus untuk ribuan UMKM
                        </p>
                        <Button size="lg" variant="outline" asChild>
                            <Link to="/consultant/onboarding">
                                Daftar Sebagai Instructor
                            </Link>
                        </Button>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
