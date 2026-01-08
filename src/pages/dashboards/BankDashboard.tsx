
import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { marketplaceService } from '@/services/marketplaceService';
import {
    Landmark,
    Search,
    TrendingUp,
    CheckCircle,
    ShieldCheck,
    Zap,
    Filter,
    ArrowUpRight,
    Users,
    DollarSign,
    Briefcase,
    ChevronRight,
    Loader2,
    MapPin
} from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";

export default function BankDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('financing');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <Navigation />

            <main className="max-w-[1440px] mx-auto px-4 md:px-10 pt-24 pb-12">
                {/* Hero Header */}
                <div className="relative mb-12 p-8 md:p-12 rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 backdrop-blur-md">
                                    Bank Partner Portal
                                </Badge>
                                <Landmark className="h-4 w-4 text-blue-300" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
                                Finansial Dashboard
                            </h1>
                            <p className="text-blue-100/70 text-lg max-w-xl">
                                Selamat datang, <span className="text-white font-bold">{user?.fullName}</span>.
                                Analisis dan identifikasi UMKM potensial untuk program penyaluran kredit Anda.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:flex gap-3 w-full md:w-auto">
                            <Card className="bg-white/10 backdrop-blur-xl border-white/10 text-white flex-1 sm:min-w-[160px]">
                                <CardContent className="p-4">
                                    <p className="text-xs text-blue-200 font-medium mb-1 uppercase tracking-wider">Total Penyaluran</p>
                                    <h3 className="text-2xl font-black">Rp 2.4B</h3>
                                    <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                                        <TrendingUp className="h-3 w-3" /> +12% MoM
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/10 backdrop-blur-xl border-white/10 text-white flex-1 sm:min-w-[160px]">
                                <CardContent className="p-4">
                                    <p className="text-xs text-blue-200 font-medium mb-1 uppercase tracking-wider">Target UMKM</p>
                                    <h3 className="text-2xl font-black">1.2RB</h3>
                                    <p className="text-[10px] text-blue-300 mt-1 flex items-center gap-1 font-bold italic">
                                        Progres: 78%
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[600px]">
                    {/* Modern Tab System */}
                    <div className="flex border-b border-slate-100 dark:border-zinc-800 p-2">
                        <button
                            onClick={() => setActiveTab('financing')}
                            className={`flex-1 md:flex-none px-8 py-4 text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'financing'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <Landmark className="h-4 w-4" />
                            Kandidat Pembiayaan
                        </button>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`flex-1 md:flex-none px-8 py-4 text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'applications'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <LandingPageIcon className="h-4 w-4" />
                            Status Aplikasi
                            <Badge className="ml-1 bg-red-500 text-[10px] h-4 min-w-[16px] p-0 flex items-center justify-center border-none">3</Badge>
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'financing' ? <FinancingCandidates /> : <ApplicationStatus />}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Dummy icon to avoid missing ref
function LandingPageIcon(props: any) {
    return <Briefcase {...props} />;
}

function FinancingCandidates() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('');
    const [minRevenue, setMinRevenue] = useState(1000000);

    useEffect(() => {
        const fetchCandidates = async () => {
            setLoading(true);
            try {
                const { candidates: data } = await marketplaceService.getFinancingCandidates({
                    location,
                    minRevenue
                });
                setCandidates(data);
            } catch (error) {
                console.error('Failed to fetch financing candidates', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchCandidates, 500);
        return () => clearTimeout(timer);
    }, [location, minRevenue]);

    return (
        <div className="space-y-8">
            {/* Filter Bar Redesign */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                    <input
                        type="text"
                        placeholder="Cari UMKM berdasarkan lokasi (Kota/Provinsi)..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-12 h-14 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    />
                </div>
                <div className="md:col-span-4">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                        <select
                            value={minRevenue}
                            onChange={(e) => setMinRevenue(Number(e.target.value))}
                            className="w-full pl-12 pr-4 h-14 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-sm font-bold appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            <option value={1000000}>Omzet {">"} Rp 1 Juta</option>
                            <option value={5000000}>Omzet {">"} Rp 5 Juta</option>
                            <option value={10000000}>Omzet {">"} Rp 10 Juta</option>
                            <option value={50000000}>Omzet {">"} Rp 50 Juta</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content List Redesign */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-zinc-900/50 rounded-3xl border border-dashed">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-slate-500 font-bold animate-pulse">Menganalisis data pasar...</p>
                </div>
            ) : candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 dark:bg-zinc-900/50 rounded-3xl border border-dashed">
                    <div className="p-6 bg-white dark:bg-zinc-800 rounded-full shadow-xl mb-6 border border-slate-100 dark:border-zinc-700">
                        <Landmark className="w-16 h-16 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-zinc-100 mb-2">Tidak Ada Kandidat</h3>
                    <p className="text-slate-500 max-w-sm">Coba turunkan kriteria filter atau ubah pencarian lokasi untuk menemukan UMKM potensial.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {candidates.map((c) => (
                        <div
                            key={c.id}
                            className="group flex flex-col lg:flex-row items-stretch bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 p-1"
                        >
                            {/* Profile Part */}
                            <div className="p-6 lg:w-72 bg-slate-50 dark:bg-zinc-800/30 flex flex-col justify-center border-r border-slate-100 dark:border-zinc-800 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                                        <Briefcase className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">{c.name}</h3>
                                        <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-tighter">
                                            <MapPin className="h-3 w-3 mr-1" /> {c.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pemilik Bisnis</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{c.owner}</p>
                                </div>
                            </div>

                            {/* Analytics Part */}
                            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                                        <DollarSign className="h-3 w-3" /> Estimasi Omzet
                                    </p>
                                    <div className="text-2xl font-black text-emerald-600 tracking-tight">
                                        Rp {c.estimatedRevenue.toLocaleString('id-ID')}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium italic">Berdasarkan data transaksi marketplace</p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                                        <Users className="h-3 w-3" /> Volume Pesanan
                                    </p>
                                    <div className="text-2xl font-black text-blue-600 tracking-tight">
                                        {c.orderCount} <span className="text-sm text-slate-400 font-bold uppercase">Order</span>
                                    </div>
                                    <Progress value={Math.min((c.orderCount / 100) * 100, 100)} className="h-1.5 w-32 bg-blue-100" />
                                </div>

                                <div className="flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-400 uppercase">Kelayakan (Eligibility)</p>
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-black px-4 py-1.5 rounded-full flex items-center w-fit gap-2">
                                            <ShieldCheck className="w-4 h-4" /> {c.status}
                                        </Badge>
                                    </div>

                                    <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 font-black tracking-tight group shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                                        Tawarkan Pembiayaan
                                        <Zap className="h-4 w-4 ml-2 fill-yellow-400 text-yellow-400 group-hover:scale-125 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ApplicationStatus() {
    const applications = [
        {
            id: 'APP-001',
            business: 'Keripik Tempe Barokah',
            amount: 'Rp 50,000,000',
            status: 'Pending',
            date: '24 Des 2025',
            risk: 'Low'
        },
        {
            id: 'APP-002',
            business: 'Batik Tulis Indramayu',
            amount: 'Rp 120,000,000',
            status: 'Review',
            date: '22 Des 2025',
            risk: 'Medium'
        },
        {
            id: 'APP-003',
            business: 'Kopi Kenangan Rakyat',
            amount: 'Rp 35,000,000',
            status: 'Approved',
            date: '18 Des 2025',
            risk: 'Low'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Status Aplikasi Kredit</h3>
                    <p className="text-slate-500 text-sm font-medium italic">Kelola dan pantau pengajuan pinjaman UMKM aktif</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 font-black px-4 py-2 rounded-xl text-xs border-none">
                    {applications.length} TOTAL AKTIF
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app) => (
                    <Card key={app.id} className="group bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden hover:border-blue-500 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <ArrowUpRight className="h-6 w-6" />
                                </div>
                                <Badge className={`
                                    ${app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                                    ${app.status === 'Review' ? 'bg-blue-100 text-blue-700' : ''}
                                    ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                                    font-black px-3 py-1 rounded-full border-none text-[10px] uppercase tracking-wider
                                `}>
                                    {app.status}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{app.id}</p>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white truncate uppercase">{app.business}</h4>
                                </div>

                                <div className="pt-4 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Nominal</p>
                                        <p className="font-black text-blue-600">{app.amount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Risiko</p>
                                        <Badge variant="outline" className={`
                                            ${app.risk === 'Low' ? 'text-emerald-500 border-emerald-500/20' : 'text-amber-500 border-amber-500/20'}
                                            font-black text-[10px]
                                        `}>
                                            {app.risk} RISK
                                        </Badge>
                                    </div>
                                </div>

                                <Button variant="ghost" className="w-full mt-4 bg-slate-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 font-black rounded-xl">
                                    Lihat Detail Aplikasi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Insight Banner */}
            <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 border-none rounded-[2.5rem] text-white p-1 overflow-hidden relative mt-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-32 -translate-y-32"></div>
                <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex gap-6 items-center flex-col md:flex-row text-center md:text-left">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-10 w-10 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic tracking-tight">Keamanan & Kepercayaan Rakyat</h3>
                            <p className="text-blue-100/70 font-medium max-w-lg">
                                Semua data UMKM di Semindo Grow Hub telah melalui verifikasi identitas (KYC) dan memiliki histori transaksi yang valid.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

