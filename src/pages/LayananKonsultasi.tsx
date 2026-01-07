import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Star, Calendar, Phone, Clock, TrendingUp, Briefcase,
  Scale, Globe, Laptop, DollarSign, Users, ArrowRight
} from "lucide-react";
import SEOHead from "@/components/ui/seo-head";
import { consultationService } from '@/services/consultationService';
import { api } from '@/services/api';
import type { ConsultantProfile, ExpertiseCategory } from '@/types/consultation';
import { BookingForm } from '@/components/consultation/BookingForm';

const LayananKonsultasi = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingCategory, setBookingCategory] = useState<string>('');
  const [expertiseCategories, setExpertiseCategories] = useState<ExpertiseCategory[]>([]);
  const [bookingConsultantId, setBookingConsultantId] = useState<string>('');
  const [availableConsultants, setAvailableConsultants] = useState<ConsultantProfile[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchExpertiseCategories();
  }, []);

  useEffect(() => {
    loadConsultants();
  }, [selectedCategory]);

  // Update consultants when category changes
  useEffect(() => {
    if (bookingCategory) {
      // Find category name to match legacy expertiseAreas
      const category = expertiseCategories.find(c => c.id === bookingCategory);
      if (category) {
        fetchConsultantsByCategory(category.name);
        setBookingConsultantId('');
      }
    } else {
      setAvailableConsultants([]);
    }
  }, [bookingCategory, expertiseCategories]);

  const fetchExpertiseCategories = async () => {
    try {
      const response = await api.get<{ success: boolean; data: ExpertiseCategory[] }>('/consultation/expertise/active');
      const data = (response as any)?.data || response;
      setExpertiseCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load expertise categories:', error);
    }
  };

  const loadConsultants = async () => {
    try {
      setLoading(true);
      const response = await consultationService.listConsultants({
        expertise: selectedCategory === 'all' ? undefined : selectedCategory,
        status: 'approved'
      });

      // Get featured consultants (top rated, max 8)
      const data = (response as any)?.data || response;
      const featured = data
        .filter((c: ConsultantProfile) => c.isAcceptingNewClients)
        .sort((a: ConsultantProfile, b: ConsultantProfile) => b.averageRating - a.averageRating)
        .slice(0, 8);

      setConsultants(featured);
    } catch (error) {
      console.error('Failed to load consultants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultantsByCategory = async (expertiseId: string) => {
    try {
      const response = await consultationService.listConsultants({
        expertise: expertiseId,
        status: 'approved'
      });
      const data = (response as any)?.data || response;
      setAvailableConsultants(data);
    } catch (error) {
      console.error('Failed to load consultants for booking:', error);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CN';
  };

  const handleQuickBook = () => {
    if (bookingConsultantId) {
      navigate(`/consultants/${bookingConsultantId}`);
    } else if (bookingCategory) {
      navigate(`/explore/consultants?expertise=${bookingCategory}`);
    } else {
      navigate('/explore/consultants');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Layanan Konsultasi UMKM – Digital, Keuangan, Sertifikasi, Ekspor"
        description="Dapatkan konsultasi online untuk keuangan, digitalisasi, legalitas, dan ekspor. Booking jadwal dengan konsultan ahli Semindo secara mudah."
        keywords="konsultasi UMKM, konsultasi digital, konsultasi keuangan, sertifikasi halal, konsultasi ekspor"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Konsultasi dengan <span className="text-primary">Expert Ahli</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Solusi konsultasi komprehensif untuk mengakselerasi pertumbuhan UMKM Anda
          </p>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-8 px-4 bg-background border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80'
                }`}
            >
              <Users className="h-4 w-4" />
              Semua
            </button>
            {expertiseCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedCategory === category.name
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Consultants */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Konsultan Tersedia
            </h2>
            <p className="text-xl text-muted-foreground">
              Pilih konsultan yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : consultants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                Belum ada konsultan tersedia untuk kategori ini
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {consultants.map((consultant) => (
                <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Link to={`/consultants/${consultant.id}`}>
                      <div className="text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-4">
                          <AvatarImage src={(consultant.user as any)?.profilePictureUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {getInitials((consultant.user as any)?.fullName || 'CN')}
                          </AvatarFallback>
                        </Avatar>

                        <h3 className="font-semibold text-lg mb-1">
                          {(consultant.user as any)?.fullName || 'Consultant'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {consultant.title}
                        </p>

                        <div className="flex items-center justify-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{consultant.averageRating?.toFixed(1) || '0.0'}</span>
                          <span className="text-sm text-muted-foreground">
                            ({consultant.totalSessions || 0})
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 justify-center mb-4">
                          {((consultant as any).expertise?.slice(0, 2) || []).map((exp: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {exp.expertise?.name || exp.name}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-primary font-semibold mb-4">
                          {(consultant as any).packages?.length ? (
                            <>Mulai Rp {Math.min(...(consultant as any).packages.map((p: any) => p.price)).toLocaleString('id-ID')}</>
                          ) : consultant.hourlyRate ? (
                            <>Rp {consultant.hourlyRate.toLocaleString('id-ID')}/jam</>
                          ) : 'Lihat profil'}
                        </p>

                        <Button className="w-full" size="sm">
                          Lihat Profile
                        </Button>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/explore/consultants">
                Lihat Semua Konsultan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Booking Form */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Book Konsultasi Cepat
            </h2>
            <p className="text-xl text-muted-foreground">
              Kami akan carikan konsultan yang sesuai kebutuhan Anda
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Form Booking Konsultasi
              </CardTitle>
              <CardDescription>
                Isi kategori konsultasi yang Anda butuhkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Kategori Konsultasi</Label>
                <Select value={bookingCategory} onValueChange={setBookingCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori konsultasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {expertiseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pilih Konsultan (Opsional)</Label>
                <Select value={bookingConsultantId} onValueChange={setBookingConsultantId} disabled={!bookingCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={bookingCategory ? "Pilih konsultan" : "Pilih kategori terlebih dahulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConsultants.map((consultant) => (
                      <SelectItem key={consultant.id} value={consultant.id}>
                        {(consultant.user as any)?.fullName || 'Consultant'} - {
                          (consultant as any).packages?.length
                            ? `Mulai Rp ${Math.min(...(consultant as any).packages.map((p: any) => p.price)).toLocaleString('id-ID')}`
                            : consultant.hourlyRate
                              ? `Rp ${consultant.hourlyRate.toLocaleString('id-ID')}/jam`
                              : ''
                        }
                      </SelectItem>
                    ))}
                    {availableConsultants.length === 0 && (
                      <SelectItem value="none" disabled>Tidak ada konsultan tersedia</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>



              {bookingConsultantId && availableConsultants.find(c => c.id === bookingConsultantId) ? (
                <div className="bg-background border rounded-lg p-4 mt-6 animate-in slide-in-from-top-2">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Lengkapi Detail Booking
                  </h3>
                  <BookingForm
                    consultant={availableConsultants.find(c => c.id === bookingConsultantId)!}
                    onSuccess={() => {
                      // Success handled by form internally (createRequest)
                      // Note: BookingForm onSuccess prop is void. 
                      // We can add confetti or toast here.
                      navigate('/consultation/dashboard');
                      // Alert is already in BookingForm? 
                      // Wait, BookingForm component I wrote has built-in Alert and Navigation?
                      // Let's check Step 1705.
                      // It calls onSuccess() THEN nothing else. 
                      // It alerts "Booking request submitted" inside handleSubmit? No, I refactored it to call onSuccess.
                      // Wait, Step 1705:
                      // await createRequest...
                      // onSuccess();
                      // It DOES NOT alert or navigate inside the component itself.
                      // So I MUST alert and navigate here.
                      alert('Booking Berhasil! Silakan cek status pending di riwayat konsultasi.');
                      navigate('/consultation/history?tab=pending');
                    }}
                    onCancel={() => setBookingConsultantId('')}
                  />
                </div>
              ) : (
                <div className="flex gap-4">
                  <Button className="flex-1" onClick={handleQuickBook} disabled={!bookingCategory}>
                    <Users className="h-4 w-4 mr-2" />
                    {bookingCategory ? "Lihat Semua Konsultan Kategori Ini" : "Lihat Semua Konsultan"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section >

      <Footer />
    </div >
  );
};

export default LayananKonsultasi;