
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/ui/seo-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Users,
    Network,
    MessageSquare,
    Wallet,
    Megaphone
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

export default function SampleAssessmentResult() {
    const overallScore = 74;
    const donutData = [
        { name: 'Score', value: overallScore, fill: '#F59E0B' }, // Yellow-ish for 74
        { name: 'Remaining', value: 100 - overallScore, fill: '#E5E7EB' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <SEOHead
                title="Sample Output & Rekomendasi - Semindo"
                description="Contoh hasil assessment dan rekomendasi berdasarkan level usaha."
            />
            <Navigation />

            <div className="container mx-auto px-4 py-8 max-w-7xl pt-24">
                {/* Breadcrumb would go here if we implemented dynamic breadcrumbs */}
                <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-2">Beranda &gt; Program Self Assessment &gt; <span className="text-blue-600 font-medium">Sampel hasil Assessment</span></p>
                    <h1 className="text-3xl font-bold text-gray-900">Sample Output & Rekomendasi</h1>
                    <p className="text-gray-600 mt-2">Contoh hasil assessment dan rekomendasi berdasarkan level usaha</p>
                </div>

                {/* Report Header */}
                <div className="bg-white rounded-xl border-t-4 border-blue-900 shadow-sm mb-12">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">LAPORAN HASIL ASSESSMENT</p>
                                <h2 className="text-2xl font-bold text-gray-900 mt-1">Assessment Kelayakan dan Kesehatan Usaha</h2>
                                <div className="flex gap-6 mt-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-blue-900">🏢</span> Lily's Butique
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-blue-900">📅</span> 21 Januari 2026
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-blue-900">📝</span> Usaha Kecil
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 md:p-8 space-y-12">

                        {/* Section 1: Ringkasan & Donut Chart */}
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                            {/* Chart Column */}
                            <div className="w-full lg:w-1/3 bg-blue-50/50 rounded-2xl p-6 flex flex-col items-center justify-center">
                                <div className="relative w-64 h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                innerRadius={80}
                                                outerRadius={100}
                                                startAngle={90}
                                                endAngle={-270}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                <Label
                                                    value={overallScore}
                                                    position="center"
                                                    className="text-5xl font-bold fill-yellow-500"
                                                />
                                                {/* Subtext needs creative svg placement or HTML overlay, keeping simple for now */}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8 text-center">
                                        <p className="text-sm text-gray-500">dari 100</p>
                                    </div>
                                </div>

                                <div className="text-center mt-2">
                                    <h3 className="text-xl font-medium text-gray-900">Skor keseluruhan</h3>
                                    <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none px-4 py-1">
                                        Cukup
                                    </Badge>
                                </div>
                            </div>

                            {/* Summary Text Column */}
                            <div className="w-full lg:w-2/3 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ringkasan penilaian</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Berdasarkan hasil assessment komprehensif, Lily's Butique berada dalam kategori Cukup Layak dengan skor keseluruhan 74 dari 100. Usaha memiliki fondasi yang baik dengan model bisnis yang solid dan potensi pasar yang menjanjikan. Namun, terdapat beberapa area yang memerlukan perhatian khusus terutama pada aspek kesehatan keuangan dan kelengkapan legalitas.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Highlight Insight</h3>
                                    <div className="space-y-3">
                                        <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-800">Model bisnis dan potensi pasar cukup kuat. Potensi pengembangan bisnis cukup baik dengan strategi pertumbuhan yang jelas</p>
                                        </div>
                                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-800">Kesehatan keuangan dan manajemen perlu penguatan untuk mendukung keberlanjutan</p>
                                        </div>
                                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-800">Branding dan pemasaran masih memiliki ruang peningkatan signifikan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Breakdown per Aspek */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Break down hasil assessment per aspek</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Card 1: Analisis Bisnis */}
                                <AspectCard
                                    icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
                                    title="Analisis Bisnis"
                                    subtitle="Strategi pertumbuhan dan keberlanjutan usaha"
                                    score={76}
                                    scoreColor="text-green-600"
                                    borderColor="border-green-500"
                                    badgeColor="bg-green-100 text-green-700"
                                    badgeText="Baik"
                                    description="Usaha menunjukkan kemampuan yang baik dalam mengidentifikasi peluang pertumbuhan. Strategi pengembangan produk dan ekspansi pasar telah dirumuskan dengan target yang terukur."
                                />
                                {/* Card 2: Manajemen */}
                                <AspectCard
                                    icon={<Users className="w-6 h-6 text-blue-600" />}
                                    title="Manajemen"
                                    subtitle="Tata kelola dan perencanaan"
                                    score={74}
                                    scoreColor="text-yellow-600"
                                    borderColor="border-yellow-500"
                                    badgeColor="bg-yellow-100 text-yellow-700"
                                    badgeText="Cukup"
                                    description="Struktur organisasi cukup jelas dengan pembagian tugas yang memadai. Namun, sistem dokumentasi dan SOP operasional masih perlu diperkuat untuk efisiensi."
                                />
                                {/* Card 3: Network */}
                                <AspectCard
                                    icon={<Network className="w-6 h-6 text-blue-600" />}
                                    title="Network"
                                    subtitle="Kemitraan, kolaborasi, dan jejaring usaha"
                                    score={70}
                                    scoreColor="text-yellow-600" // Image shows orange/yellow
                                    borderColor="border-yellow-500"
                                    badgeColor="bg-yellow-100 text-yellow-700"
                                    badgeText="Cukup"
                                    description="Telah membangun beberapa kemitraan strategis dengan supplier dan distributor. Jejaring dengan asosiasi industri dan lembaga pendukung masih perlu diperluas."
                                />
                                {/* Card 4: Branding */}
                                <AspectCard
                                    icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
                                    title="Branding"
                                    subtitle="Identitas merek dan konsistensi komunikasi"
                                    score={68}
                                    scoreColor="text-yellow-600"
                                    borderColor="border-yellow-500"
                                    badgeColor="bg-yellow-100 text-yellow-700"
                                    badgeText="Cukup"
                                    description="Identitas visual merek sudah ada namun belum konsisten di semua touchpoint. Brand positioning dan messaging masih perlu dikembangkan lebih kuat."
                                />
                                {/* Card 5: Keuangan */}
                                <AspectCard
                                    icon={<Wallet className="w-6 h-6 text-blue-600" />}
                                    title="Keuangan"
                                    subtitle="Pencatatan, arus kas, dan stabilitas keuangan"
                                    score={72}
                                    scoreColor="text-yellow-600"
                                    borderColor="border-yellow-500"
                                    badgeColor="bg-yellow-100 text-yellow-700"
                                    badgeText="Cukup"
                                    description="Pencatatan keuangan sudah tersistem dengan baik. Arus kas operasional stabil namun rasio likuiditas perlu ditingkatkan untuk menghadapi kondisi tidak terduga."
                                />
                                {/* Card 6: Pemasaran */}
                                <AspectCard
                                    icon={<Megaphone className="w-6 h-6 text-blue-600" />}
                                    title="Pemasaran"
                                    subtitle="Strategi pemasaran dan akuisisi pelanggan"
                                    score={76}
                                    scoreColor="text-green-600"
                                    borderColor="border-green-500"
                                    badgeColor="bg-green-100 text-green-700"
                                    badgeText="Baik"
                                    description="Strategi pemasaran digital dan konvensional berjalan paralel. Tingkat konversi pelanggan cukup baik dengan customer acquisition cost yang kompetitif."
                                />
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-6 mt-8 text-sm text-gray-600">
                                <div className="font-semibold">Keterangan Skor</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> 75-100 Baik</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span> 60-74 Cukup</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded-sm"></span> 40-59 Perlu Perbaikan</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 rounded-sm"></span> &lt;40 Kurang</div>
                            </div>
                        </div>

                        {/* Section 3: Analisis dan Interpretasi */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Analisis dan intepretasi</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Kekuatan Utama */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <h4 className="font-bold text-gray-900">Kekuatan Utama</h4>
                                    </div>

                                    <AnalysisItem
                                        title="Strategi Pengembangan Bisnis yang Terukur"
                                        description="Roadmap pertumbuhan tersedia dengan target yang jelas untuk 3 tahun ke depan, didukung inovasi produk berkelanjutan."
                                        borderColor="border-green-500"
                                    />
                                    <AnalysisItem
                                        title="Pencatatan Keuangan Tersistem"
                                        description="Sistem akuntansi terintegrasi memudahkan pemantauan kinerja keuangan dan pengambilan keputusan berbasis data."
                                        borderColor="border-green-500"
                                    />
                                    <AnalysisItem
                                        title="Strategi Pemasaran Digital yang Aktif"
                                        description="Kehadiran di multiple platform digital dengan tingkat engagement yang baik mendukung akuisisi pelanggan baru."
                                        borderColor="border-green-500"
                                    />
                                </div>

                                {/* Area Risiko */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <h4 className="font-bold text-gray-900">Area risiko</h4>
                                    </div>

                                    <AnalysisItem
                                        title="Inkonsistensi Identitas Brand"
                                        description="Inkonsistensi identitas merek di berbagai touchpoint dapat melemahkan brand positioning dan kepercayaan konsumen."
                                        borderColor="border-red-500"
                                    />
                                    <AnalysisItem
                                        title="Keterbatasan Jaringan Industri"
                                        description="Kurangnya keterlibatan aktif di asosiasi industri membatasi akses ke peluang kolaborasi dan informasi pasar."
                                        borderColor="border-red-500"
                                    />
                                    <AnalysisItem
                                        title="Vulnerrabilitas Likuiditas"
                                        description="Current ratio 1.3 menunjukkan buffer kas terbatas untuk menghadapi kondisi darurat atau peluang investasi mendadak."
                                        borderColor="border-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Rekomendasi */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Rekomendasi dan Follow up</h3>
                            <p className="text-gray-600 mb-6">Rekomendasi perbaikan dan tindak lanjut</p>

                            <div className="rounded-lg border border-gray-100 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-gray-900 w-[200px]">Aspek</TableHead>
                                            <TableHead className="font-bold text-gray-900">Rekomendasi</TableHead>
                                            <TableHead className="font-bold text-gray-900 text-right">Prioritas</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Branding</TableCell>
                                            <TableCell>Standarisasi brand guideline dan implementasikan secara konsisten di seluruh touchpoint termasuk kemasan, media sosial, dan materi promosi</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">High</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Network</TableCell>
                                            <TableCell>Bergabung aktif dengan minimal 2 asosiasi industri dan ikuti program jejaring untuk memperluas kolaborasi</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">High</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Keuangan</TableCell>
                                            <TableCell>Tingkatkan current ratio menjadi minimal 1.5 melalui optimasi working capital dan pengelolaan piutang</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Medium</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Manajemen</TableCell>
                                            <TableCell>Dokumentasikan seluruh SOP operasional dan lakukan sosialisasi kepada tim untuk meningkatkan efisiensi</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Medium</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Pemasaran</TableCell>
                                            <TableCell>Tingkatkan customer retention rate melalui program loyalitas dan personalisasi komunikasi pelanggan</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Medium</Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

function AspectCard({ icon, title, subtitle, score, scoreColor, borderColor, badgeColor, badgeText, description }: any) {
    return (
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {icon}
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-gray-900">{title}</CardTitle>
                        <CardDescription className="text-xs text-gray-500 mt-1 line-clamp-2">{subtitle}</CardDescription>
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-full border-2 ${borderColor} flex items-center justify-center font-bold text-sm ${scoreColor} flex-shrink-0`}>
                    {score}
                </div>
            </CardHeader>
            <CardContent>
                <Badge variant="secondary" className={`mb-3 ${badgeColor} border-none`}>{badgeText}</Badge>
                <p className="text-sm text-gray-500 leading-relaxed text-left">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function AnalysisItem({ title, description, borderColor }: any) {
    return (
        <div className={`pl-4 border-l-2 ${borderColor}`}>
            <h5 className="font-bold text-gray-900 mb-1">{title}</h5>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
    )
}
