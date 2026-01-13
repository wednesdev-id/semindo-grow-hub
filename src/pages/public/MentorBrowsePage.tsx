import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Users, GraduationCap, CheckCircle2, Clock, Target, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';

export default function MentorBrowsePage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [expertiseFilter, setExpertiseFilter] = useState('all');

    // Fetch mentors (from instructors endpoint, filter by type)
    const { data: instructors, isLoading, error } = useQuery({
        queryKey: ['public-mentors'],
        queryFn: async () => {
            console.log('[MentorBrowsePage] Fetching instructors...');
            const response = await fetch('/api/v1/consultation/instructors');

            if (!response.ok) {
                console.error('[MentorBrowsePage] API response not OK:', response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('[MentorBrowsePage] Received data:', data);
            return data.data || { mentors: [], consultants: [] };
        },
        retry: 1,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    const mentors = instructors?.mentors || [];

    // Filter mentors
    const filteredMentors = mentors.filter((mentor: any) => {
        const matchesSearch = mentor.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mentor.title?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesExpertise = expertiseFilter === 'all' ||
            mentor.expertise?.includes(expertiseFilter);

        return matchesSearch && matchesExpertise;
    });

    const handleApplyMentoring = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/mentoring/apply');
        } else {
            navigate('/mentoring/apply');
        }
    };

    return (
        <>
            <SEOHead
                title="Program Mentoring Gratis - Semindo"
                description="Dapatkan bimbingan gratis dari mentor berpengalaman selama 3-6 bulan. Program mentoring khusus untuk UMKM pemula."
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

            {/* Error Display */}
            {error && (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle className="text-red-600">Error Loading Mentors</CardTitle>
                            <CardDescription>
                                {error instanceof Error ? error.message : 'Failed to load mentor data'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Please try refreshing the page. If the problem persists, contact support.
                            </p>
                            <Button onClick={() => window.location.reload()}>
                                Refresh Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content - Only show if no error */}
            {!error && (
                <div className="min-h-screen bg-background">
                    {/* Hero Section */}
                    <section className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-900 dark:to-cyan-900 py-20 px-4">
                        <div className="max-w-7xl mx-auto text-center">
                            <Badge className="bg-green-500 text-white mb-6 px-4 py-2 text-lg">
                                100% GRATIS
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Program Mentoring UMKM
                            </h1>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Bimbingan berkelanjutan dari mentor berpengalaman untuk mengembangkan bisnis Anda
                            </p>

                            {/* Search Bar */}
                            <div className="max-w-2xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari mentor berdasarkan nama atau keahlian..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-14 text-lg bg-white dark:bg-gray-800"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works */}
                    <section className="py-16 px-4 bg-card">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja Program</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Daftar Program</h3>
                                    <p className="text-muted-foreground">
                                        Isi formulir pendaftaran dan ceritakan tentang bisnis Anda
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Mendapat Mentor</h3>
                                    <p className="text-muted-foreground">
                                        Kami akan meng-assign mentor yang sesuai dengan kebutuhan Anda
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Bimbingan 3-6 Bulan</h3>
                                    <p className="text-muted-foreground">
                                        Follow-up rutin dan monitoring progress bisnis secara berkala
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Benefits */}
                    <section className="py-16 px-4">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-center mb-12">Manfaat Program</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Mentor Profesional</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Mendapat mentor dengan pengalaman 10+ tahun di bidangnya
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Follow-up Berkala</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Sesi rutin untuk memastikan progress bisnis Anda on-track
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Assignment Based</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Tugas praktis untuk implementasi langsung di bisnis Anda
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-1">100% Gratis</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Tidak ada biaya apapun, program ini didukung pemerintah
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Filter */}
                    <section className="border-t bg-card">
                        <div className="max-w-7xl mx-auto px-4 py-6">
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="font-medium text-sm">Filter Keahlian:</span>

                                <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Semua Keahlian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Keahlian</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                        <SelectItem value="Business Strategy">Business Strategy</SelectItem>
                                        <SelectItem value="Operations">Operations</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="ml-auto text-sm text-muted-foreground">
                                    {filteredMentors.length} mentor tersedia
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Mentor Grid */}
                    <section className="py-12 px-4">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-2xl font-bold mb-8">Mentor Kami</h2>
                            {isLoading ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Card key={i} className="animate-pulse">
                                            <CardHeader>
                                                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            ) : filteredMentors.length === 0 ? (
                                <div className="text-center py-16">
                                    <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Tidak ada mentor ditemukan</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredMentors.map((mentor: any) => (
                                        <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                                                    {mentor.user?.profilePictureUrl ? (
                                                        <img src={mentor.user.profilePictureUrl} alt={mentor.user?.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                </div>
                                                <CardTitle className="text-center text-base">{mentor.user?.fullName}</CardTitle>
                                                <CardDescription className="text-center text-sm">{mentor.title}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {mentor.expertise?.slice(0, 2).map((exp: string, idx: number) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">{exp}</Badge>
                                                    ))}
                                                </div>
                                                <div className="text-center text-sm">
                                                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{mentor.yearsExperience || 0} tahun</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium">{typeof mentor.rating === 'number' ? mentor.rating.toFixed(1) : 'N/A'}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-900 dark:to-cyan-900 py-20 px-4">
                        <div className="max-w-4xl mx-auto text-center text-white">
                            <Target className="h-16 w-16 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold mb-4">Siap Berkembang Bersama Mentor?</h2>
                            <p className="text-xl mb-8 text-white/90">
                                Daftarkan bisnis Anda sekarang dan dapatkan mentor profesional secara GRATIS
                            </p>
                            <Button size="lg" variant="secondary" onClick={handleApplyMentoring}>
                                {isAuthenticated ? 'Daftar Sekarang' : 'Login & Daftar'}
                            </Button>
                            <p className="mt-4 text-sm text-white/70">
                                *Program terbatas untuk 100 UMKM per batch
                            </p>
                        </div>
                    </section>
                </div>
            )}

            <Footer />
        </>
    );
}
