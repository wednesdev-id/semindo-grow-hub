import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { mentorEventService, UMKMMapData } from '@/services/mentorEventService';
import OpenStreetMap, { UMKMMapMarker } from '@/components/maps/OpenStreetMap';
import {
    Building2,
    MapPin,
    Users,
    Search,
    TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function MyUMKMPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [mapData, setMapData] = useState<UMKMMapData | null>(null);
    const [search, setSearch] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const mentorId = (user as any)?.mentorProfile?.id;
            if (!mentorId) return;

            const response = await mentorEventService.getUMKMMapData(mentorId);
            if (response.success) {
                setMapData(response.data);
            }
        } catch (error) {
            console.error('Failed to load UMKM data:', error);
            toast.error('Gagal memuat data UMKM');
        } finally {
            setLoading(false);
        }
    };

    const filteredMarkers = mapData?.markers.filter(marker => {
        const matchesSearch = marker.name.toLowerCase().includes(search.toLowerCase());
        const matchesCity = selectedCity ? marker.city === selectedCity : true;
        return matchesSearch && matchesCity;
    }) || [];

    const markers: UMKMMapMarker[] = filteredMarkers.map(m => ({
        id: m.id,
        businessName: m.name,
        lat: m.lat,
        lng: m.lng,
        province: '', // Not strictly needed for marker display if logic handles it
        segmentation: m.segmentation || 'Pemula',
        city: m.city,
        // Add other fields as needed if OpenStreetMap requires them
    }));

    // Get unique cities for filter
    const cities = Array.from(new Set(mapData?.markers.map(m => m.city).filter(Boolean)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    UMKM Dampingan
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Peta sebaran dan daftar UMKM yang Anda dampingi
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total UMKM</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mapData?.total || 0}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Wilayah</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mapData?.byRegion.length || 0} Kota/Kab
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Segmentasi Utama</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {/* Simple logic to find most common segmentation */}
                            {getMostCommonSegmentation(mapData?.markers || [])}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters & Map */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama UMKM..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary-500 min-w-[200px]"
                    >
                        <option value="">Semua Kota</option>
                        {cities.map((city) => (
                            <option key={city as string} value={city as string}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <OpenStreetMap
                            markers={markers}
                            height="500px"
                            getDetailUrl={(id) => `/mentor/umkm/${id}`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function getMostCommonSegmentation(markers: { segmentation?: string }[]) {
    if (markers.length === 0) return '-';
    const counts: Record<string, number> = {};
    markers.forEach(m => {
        const seg = m.segmentation || 'Unknown';
        counts[seg] = (counts[seg] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
