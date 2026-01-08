
import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { marketplaceService, Product } from '@/services/marketplaceService';
import {
    Globe,
    Filter,
    Search,
    MapPin,
    Zap,
    TrendingUp,
    ArrowRight,
    Package,
    Star,
    Ship,
    ChevronRight,
    Loader2,
    ShieldCheck,
    DollarSign,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function PartnerDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('opportunities');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <Navigation />

            <main className="max-w-[1440px] mx-auto px-4 md:px-10 pt-24 pb-12">
                {/* Hero Header */}
                <div className="relative mb-12 p-8 md:p-12 rounded-[2rem] overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-purple-500/10 blur-[80px] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 backdrop-blur-md">
                                    Strategic Partner Portal
                                </Badge>
                                <Globe className="h-4 w-4 text-purple-300" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
                                Global Partnership Portal
                            </h1>
                            <p className="text-indigo-100/70 text-lg max-w-xl">
                                Halo Partner, <span className="text-white font-bold">{user?.fullName}</span>.
                                Temukan produk UMKM unggulan yang siap untuk ekspansi pasar global.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <div className="grid grid-cols-2 sm:flex gap-3">
                                <div className="text-center p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex-1 sm:min-w-[120px]">
                                    <p className="text-[10px] text-purple-200 font-bold uppercase mb-1">Impacted UMKM</p>
                                    <h4 className="text-2xl font-black">450+</h4>
                                </div>
                                <div className="text-center p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex-1 sm:min-w-[120px]">
                                    <p className="text-[10px] text-purple-200 font-bold uppercase mb-1">Global Reach</p>
                                    <h4 className="text-2xl font-black">12</h4>
                                    <p className="text-[8px] text-indigo-300 font-bold">NEGARA</p>
                                </div>
                            </div>
                            <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-black rounded-xl w-full sm:w-auto">
                                Laporan Dampak Sosial <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[600px]">
                    {/* Modern Tab System */}
                    <div className="flex border-b border-slate-100 dark:border-zinc-800 p-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('opportunities')}
                            className={`whitespace-nowrap px-8 py-4 text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'opportunities'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <Zap className="h-4 w-4" />
                            Peluang Ekspor Unggulan
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`whitespace-nowrap px-8 py-4 text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'analytics'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Analitik Dampak
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'opportunities' ? <ExportOpportunities /> : <ImpactAnalytics />}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function ExportOpportunities() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        const fetchOpportunities = async () => {
            setLoading(true);
            try {
                const { products: data } = await marketplaceService.getExportReadyProducts({
                    region,
                    category
                });
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch export opportunities', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchOpportunities, 500);
        return () => clearTimeout(timer);
    }, [region, category]);

    return (
        <div className="space-y-8">
            {/* Filter Section Redesign */}
            <div className="bg-slate-50 dark:bg-zinc-800/30 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-wider mr-4">
                    <Filter className="w-5 h-5" />
                    Custom Curation:
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer min-w-[160px]"
                    >
                        <option value="">Semua Wilayah</option>
                        <option value="Indramayu">Indramayu</option>
                        <option value="Jakarta">Jakarta</option>
                        <option value="Bandung">Bandung</option>
                        <option value="Yogyakarta">Yogyakarta</option>
                    </select>
                </div>
                <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer min-w-[160px]"
                    >
                        <option value="">Semua Kategori</option>
                        <option value="Craft">Kerajinan Tangan</option>
                        <option value="Fashion">Fashion & Tekstil</option>
                        <option value="Culinary">Kuliner Nusantara</option>
                        <option value="Furniture">Furniture</option>
                    </select>
                </div>

                <div className="ml-auto">
                    <p className="text-xs text-slate-500 font-medium">Menampilkan <span className="text-indigo-600 font-black">{products.length}</span> produk kurasi terbaik</p>
                </div>
            </div>

            {/* Grid Redesign */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-500 font-bold animate-pulse text-lg">Mengkurasi data ekspor...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-zinc-800">
                    <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-xl mx-auto mb-8">
                        <Globe className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-zinc-100 mb-4">Pencarian Tidak Ditemukan</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-lg">Sesuaikan filter kurasi Anda untuk menemukan peluang kemitraan lainnya.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <Card key={product.id} className="group bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <Badge className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-none uppercase tracking-widest">
                                        Export Ready
                                    </Badge>
                                    <Badge className="bg-white/90 backdrop-blur-md text-indigo-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-none uppercase tracking-widest">
                                        Premium Class
                                    </Badge>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <p className="text-white text-xs font-medium leading-relaxed mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        Kapasitas produksi bulanan: <span className="font-black text-indigo-300">5.000 Unit</span>
                                    </p>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{product.name}</h3>
                                        <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-wide">
                                            <MapPin className="h-3.5 w-3.5 mr-1 text-indigo-500" /> {product.location}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex gap-0.5 text-yellow-400 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-current" />
                                            ))}
                                        </div>
                                        <Badge variant="outline" className="text-[10px] uppercase font-black border-slate-200 dark:border-zinc-700">
                                            {product.category}
                                        </Badge>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium mb-8 line-clamp-2 leading-relaxed italic">
                                    "{product.description}"
                                </p>

                                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Pricing (FOB)</p>
                                        <p className="text-xl font-black text-indigo-600">{product.price}</p>
                                    </div>
                                    <Link
                                        to={`/marketplace/product/${product.slug}`}
                                        className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white"
                                    >
                                        <ArrowRight className="h-6 w-6" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function ImpactAnalytics() {
    const stats = [
        { label: 'Pertumbuhan Ekspor', value: '+24%', color: 'text-emerald-500', icon: TrendingUp },
        { label: 'UMKM Go Global', value: '128', color: 'text-indigo-500', icon: Globe },
        { label: 'Total Volume FOB', value: 'Rp 12.8M', color: 'text-purple-500', icon: DollarSign }
    ];

    const regions = [
        { name: 'Asia Tenggara', share: 45, color: 'bg-indigo-500' },
        { name: 'Uni Eropa', share: 25, color: 'bg-purple-500' },
        { name: 'Amerika Utara', share: 20, color: 'bg-pink-500' },
        { name: 'Lainnya', share: 10, color: 'bg-slate-300' }
    ];

    return (
        <div className="space-y-12">
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden group hover:border-indigo-500/50 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                <h3 className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</h3>
                            </div>
                            <div className="w-14 h-14 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 transition-all duration-500">
                                <stat.icon className={`h-7 w-7 ${stat.color.replace('text-', 'text-')}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Regional Performance & Secondary Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Regional Distribution Chart (Mock) */}
                <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <CardContent className="p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Geografi Pasar Ekspor</h3>
                                <p className="text-slate-500 text-sm font-medium italic">Distribusi volume ekspor berdasarkan wilayah</p>
                            </div>
                            <Globe className="h-10 w-10 text-indigo-500/20" />
                        </div>

                        <div className="space-y-6">
                            {regions.map((region, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-700 dark:text-zinc-300">{region.name}</span>
                                        <span className="font-black text-indigo-600">{region.share}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${region.color} rounded-full transition-all duration-1000 delay-300`}
                                            style={{ width: `${region.share}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Social Impact Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 border-none rounded-[2.5rem] text-white p-2">
                        <CardContent className="p-8 flex flex-col justify-between h-full">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Tenaga Kerja Terserap</h4>
                                <h3 className="text-4xl font-black tracking-tight">3,450+</h3>
                                <p className="text-[10px] mt-2 font-medium opacity-60 italic">*Keluarga petani & pengrajin lokal</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-2">
                        <CardContent className="p-8 flex flex-col justify-between h-full">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Sertifikasi Global</h4>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">85%</h3>
                                <p className="text-[10px] mt-2 text-slate-400 font-medium italic">UMKM telah tersertifikasi HACCP/ISO</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 bg-gradient-to-r from-purple-600 to-indigo-600 border-none rounded-[2.5rem] text-white p-1 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                        <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <h3 className="text-xl font-black italic">Siap Melihat Dampak Lebih Dalam?</h3>
                                <p className="text-sm opacity-80 font-medium">Unduh laporan keberlanjutan (ESG Report) kuartalan kami.</p>
                            </div>
                            <Button className="bg-white text-indigo-900 hover:bg-white/90 font-black px-8 py-6 rounded-2xl shadow-xl shadow-indigo-900/20 active:scale-95 transition-all">
                                Download ESG Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function GlobalIcon(props: any) {
    return <Globe {...props} />;
}

