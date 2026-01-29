import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Star, Search, ArrowUpRight
} from "lucide-react";
import SEOHead from "@/components/ui/seo-head";
import { consultationService } from '@/services/consultationService';
import { api } from '@/services/api';
import type { ConsultantProfile, ExpertiseCategory } from '@/types/consultation';
import heroImage from '@/assets/Konsultasi expert 1.png';

const LayananKonsultasi = () => {
  const navigate = useNavigate();
  const [selectedExpertise, setSelectedExpertise] = useState<string>('Semua');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expertiseCategories, setExpertiseCategories] = useState<ExpertiseCategory[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchExpertiseCategories();
  }, []);

  useEffect(() => {
    loadConsultants();
  }, [selectedExpertise, selectedRating, searchQuery]);

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
      const params: any = {
        status: 'approved'
      };

      if (selectedExpertise !== 'Semua') {
        params.expertise = selectedExpertise; // This might need ID depending on backend, but using name based on previous code
      }

      if (selectedRating) {
        params.minRating = selectedRating;
      }

      const response = await consultationService.listConsultants(params);
      let data = (response as any)?.data || response;

      // Client-side filtering for search query if backend doesn't support it directly in listConsultants (or add it if it does)
      if (searchQuery) {
        data = data.filter((c: any) =>
          c.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setConsultants(data);
    } catch (error) {
      console.error('Failed to load consultants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CN';
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SEOHead
        title="Layanan Konsultasi - Semindo Grow Hub"
        description="Konsultasikan bisnismu dengan Expert pilihan."
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative text-white min-h-screen flex items-end overflow-hidden pt-20 pb-10 md:pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row">
          <div className="md:w-3/4 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Konsultasikan bisnismu<br />
              dengan Expert
            </h1>

            <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
              Diskusikan tantangan usahamu dengan mentor berpengalaman. Dapatkan strategi yang valid, solusi praktis, dan panduan langkah demi langkah untuk pertumbuhan bisnis yang berkelanjutan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 h-12 text-base font-medium rounded-md w-full sm:w-auto">
                Konsultasi Sekarang
              </Button>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white px-8 h-12 text-base font-medium rounded-md w-full sm:w-auto">
                Daftar UMKM Sekarang
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Sidebar Filters */}
            <aside className="w-full lg:w-1/4 space-y-8">
              {/* Rating Filter */}
              <div>
                <h3 className="font-bold text-lg mb-4">Penilaian</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedRating(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedRating === null ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Semua Penilaian
                  </button>
                  <div className="space-y-2 px-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div
                        key={rating}
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setSelectedRating(rating === selectedRating ? null : rating)}
                      >
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className={`text-sm ${selectedRating === rating ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {rating === 5 ? "" : "ke atas"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specialist Filter */}
              <div>
                <h3 className="font-bold text-lg mb-4">Specialist</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedExpertise('Semua')}
                    className={`block w-full text-left py-2 px-3 rounded-md transition-colors text-sm ${selectedExpertise === 'Semua' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    Semua
                  </button>
                  {expertiseCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedExpertise(cat.name || cat.id)}
                      className={`block w-full text-left py-2 px-3 rounded-md transition-colors text-sm ${selectedExpertise === (cat.name || cat.id) ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {/* Hardcoded lists if categories are empty for now to match design visual */}
                  {expertiseCategories.length === 0 && (
                    <>
                      {["Digital Marketing", "Business Audit", "Finance", "Manajemen", "Network", "Pemasaran", "Branding"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedExpertise(item)}
                          className={`block w-full text-left py-2 px-3 rounded-md transition-colors text-sm ${selectedExpertise === item ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Grid */}
            <main className="w-full lg:w-3/4">
              {/* Search Bar */}
              <div className="relative mb-8">
                <Input
                  placeholder="Cari webinar atau event terbaru"
                  className="pl-5 pr-12 h-14 bg-gray-50 border-none rounded-lg w-full text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 cursor-pointer" />
              </div>

              {/* Consultants Grid */}
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                      <div className="bg-gray-200 aspect-[4/5] rounded-xl animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : consultants.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada konsultan yang ditemukan.
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                    {consultants.map((consultant) => (
                      <div key={consultant.id} className="group flex flex-col h-full bg-transparent">
                        {/* Image Placeholder - Matches the gray box in design */}
                        <div className="w-full aspect-[4/4.5] bg-gray-200 rounded-xl mb-4 overflow-hidden relative">
                          {((consultant.user as any)?.profilePictureUrl) ? (
                            <img
                              src={(consultant.user as any)?.profilePictureUrl}
                              alt={(consultant.user as any)?.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              {/* Gray placeholder as per design */}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{(consultant.user as any)?.fullName}</h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-gray-700">{consultant.averageRating?.toFixed(1).replace('.', ',') || '4,5'}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 font-normal mb-1">{consultant.title || 'Specialist'}</p>
                        <p className="text-xs text-gray-400 mb-6">{consultant.yearsExperience || '1'} tahun pengalaman</p>

                        <div className="mt-auto flex gap-3">
                          <Button className="flex-1 bg-[#1e2350] hover:bg-[#2a306e] text-white text-sm h-11 rounded-lg font-medium">
                            Booking Konsultasi
                          </Button>
                          <Button variant="outline" className="h-11 w-11 p-0 border-gray-300 rounded-lg text-[#1e2350] shrink-0">
                            <ArrowUpRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full">
                      <span className="sr-only">Previous</span>
                      <ArrowUpRight className="h-4 w-4 rotate-[225deg]" /> {/* Left arrow approximation */}
                    </Button>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        className={`h-10 w-10 rounded-full text-sm font-medium transition-colors ${page === 1 ? 'bg-transparent text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="text-gray-400">...</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full">
                      <span className="sr-only">Next</span>
                      <ArrowUpRight className="h-4 w-4 rotate-45" /> {/* Right arrow approximation */}
                    </Button>
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LayananKonsultasi;