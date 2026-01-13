import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Users, Briefcase, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import type { ExpertiseCategory } from '@/types/consultation';

export default function ConsultantBrowsePage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [expertiseFilter, setExpertiseFilter] = useState(searchParams.get('expertise') || 'all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [expertiseCategories, setExpertiseCategories] = useState<ExpertiseCategory[]>([]);

    // Fetch expertise categories
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchExpertise = async () => {
            try {
                const response = await fetch('/api/v1/consultation/expertise/active');
                const data = await response.json();
                setExpertiseCategories(data.data || []);
            } catch (error) {
                console.error('Failed to load expertise:', error);
            }
        };
        fetchExpertise();
    }, []);

    // Fetch consultants
    const { data: consultants = [], isLoading } = useQuery({
        queryKey: ['public-consultants', expertiseFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (expertiseFilter !== 'all') params.append('expertise', expertiseFilter);
            params.append('status', 'approved');

            const response = await fetch(`/api/v1/consultation/consultants?${params}`);
            const data = await response.json();
            return data.data || [];
        }
    });

    // Filter consultants by search and price
    const filteredConsultants = consultants.filter((consultant: any) => {
        const matchesSearch = consultant.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            consultant.title?.toLowerCase().includes(searchQuery.toLowerCase());

        // Use minimum package price or fallback to hourlyRate
        const price = consultant.packages?.length
            ? Math.min(...consultant.packages.map((p: any) => p.price))
            : consultant.hourlyRate || 0;

        const matchesPrice = priceFilter === 'all' ||
            (priceFilter === 'low' && price < 200000) ||
            (priceFilter === 'mid' && price >= 200000 && price < 400000) ||
            (priceFilter === 'high' && price >= 400000);

        return matchesSearch && matchesPrice;
    });

    const handleBookConsultation = (consultantId: string) => {
        if (!isAuthenticated) {
            navigate(`/login?redirect=/consultation/consultant/${consultantId}`);
        } else {
            navigate(`/consultation/consultant/${consultantId}`);
        }
    };

    return (
        <>
            <SEOHead
                title="Cari Konsultan Expert - Semindo"
                description="Temukan konsultan berpengalaman untuk membantu bisnis UMKM Anda. Konsultasi 1-on-1 dengan expert di berbagai bidang."
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
                <section className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900 py-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Temukan Konsultan Expert
                        </h1>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Konsultasi 1-on-1 dengan expert berpengalaman untuk solusi bisnis Anda
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari konsultan berdasarkan nama atau keahlian..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-14 text-lg bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="border-b bg-card">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="font-medium text-sm">Filter:</span>

                            <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Semua Keahlian" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Keahlian</SelectItem>
                                    {expertiseCategories.map((category) => (
                                        <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={priceFilter} onValueChange={setPriceFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Semua Harga" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Harga</SelectItem>
                                    <SelectItem value="low">{'<'} Rp 200K/jam</SelectItem>
                                    <SelectItem value="mid">Rp 200K - 400K/jam</SelectItem>
                                    <SelectItem value="high">{'>'} Rp 400K/jam</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="ml-auto text-sm text-muted-foreground">
                                {filteredConsultants.length} konsultan ditemukan
                            </div>
                        </div>
                    </div>
                </section>

                {/* Consultant Grid */}
                <section className="py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        {isLoading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="animate-pulse">
                                        <CardHeader>
                                            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-20 bg-gray-200 rounded"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredConsultants.length === 0 ? (
                            <div className="text-center py-16">
                                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Tidak ada konsultan ditemukan</h3>
                                <p className="text-muted-foreground mb-6">
                                    Coba ubah filter atau kata kunci pencarian Anda
                                </p>
                                <Button variant="outline" onClick={() => {
                                    setSearchQuery('');
                                    setExpertiseFilter('all');
                                    setPriceFilter('all');
                                }}>
                                    Reset Filter
                                </Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredConsultants.map((consultant: any) => (
                                    <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                                                {consultant.user?.profilePictureUrl ? (
                                                    <img src={consultant.user.profilePictureUrl} alt={consultant.user?.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="h-10 w-10 text-primary" />
                                                )}
                                            </div>
                                            <CardTitle className="text-center">{consultant.user?.fullName || 'Consultant'}</CardTitle>
                                            <CardDescription className="text-center">{consultant.title}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Expertise Tags */}
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {(consultant.expertise?.slice(0, 3) || []).map((exp: any, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {exp.expertise?.name || exp.name}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Stats */}
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Pengalaman:</span>
                                                    <span className="font-medium">{consultant.yearsExperience} tahun</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Rating:</span>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-medium">{consultant.averageRating?.toFixed(1) || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Tarif:</span>
                                                    <span className="font-semibold text-primary">
                                                        {(consultant as any).packages?.length ? (
                                                            <>Mulai Rp {Math.min(...(consultant as any).packages.map((p: any) => p.price)).toLocaleString('id-ID')}</>
                                                        ) : consultant.hourlyRate ? (
                                                            <>Rp {consultant.hourlyRate.toLocaleString('id-ID')}/jam</>
                                                        ) : 'Lihat profil'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                                    <Link to={`/consultants/${consultant.id}`}>
                                                        <Briefcase className="h-4 w-4 mr-2" />
                                                        Lihat Profile
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleBookConsultation(consultant.id)}
                                                >
                                                    {isAuthenticated ? 'Book Konsultasi' : 'Login & Book'}
                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Ingin Menjadi Konsultan?</h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Bagikan keahlian Anda dan bantu ribuan UMKM berkembang
                        </p>
                        <Button size="lg" asChild>
                            <Link to="/consultant/onboarding">
                                Daftar Sebagai Konsultan
                            </Link>
                        </Button>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
