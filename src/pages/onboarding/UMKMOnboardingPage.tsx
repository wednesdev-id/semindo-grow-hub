import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Palette, ClipboardList, DollarSign, Users, Megaphone,
    ArrowRight, ArrowLeft, Check, Loader2, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { onboardingService, OnboardingData } from '@/services/onboarding';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
    TrendingUp, Palette, ClipboardList, DollarSign, Users, Megaphone,
};

// Service options (hardcoded for faster load)
const services = [
    { id: 'bisnis', name: 'Pengembangan Bisnis', icon: 'TrendingUp', description: 'Strategi dan pengembangan usaha' },
    { id: 'branding', name: 'Branding', icon: 'Palette', description: 'Identitas dan citra merek' },
    { id: 'manajemen', name: 'Manajemen', icon: 'ClipboardList', description: 'Pengelolaan operasional usaha' },
    { id: 'keuangan', name: 'Keuangan', icon: 'DollarSign', description: 'Pencatatan dan pengelolaan keuangan' },
    { id: 'network', name: 'Network', icon: 'Users', description: 'Jaringan dan kemitraan bisnis' },
    { id: 'pemasaran', name: 'Pemasaran', icon: 'Megaphone', description: 'Strategi marketing dan promosi' },
];

const sectors = [
    'Kuliner & Makanan',
    'Fashion & Pakaian',
    'Kerajinan & Handmade',
    'Pertanian & Agribisnis',
    'Jasa & Layanan',
    'Perdagangan & Retail',
    'Teknologi & Digital',
    'Pariwisata & Hospitality',
    'Kesehatan & Kecantikan',
    'Pendidikan & Pelatihan',
    'Lainnya',
];

const omzetRanges = [
    '< 10 Juta',
    '10 - 50 Juta',
    '50 - 100 Juta',
    '100 - 300 Juta',
    '300 - 500 Juta',
    '> 500 Juta',
];

export default function UMKMOnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState('');

    const [formData, setFormData] = useState<OnboardingData>({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        businessName: '',
        sector: '',
        omzetMonthly: '',
        challenges: '',
        requestedServices: [],
    });

    const [confirmPassword, setConfirmPassword] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const toggleService = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            requestedServices: prev.requestedServices.includes(serviceId)
                ? prev.requestedServices.filter(s => s !== serviceId)
                : [...prev.requestedServices, serviceId]
        }));
        setError('');
    };

    const validateStep1 = (): boolean => {
        if (!formData.fullName || formData.fullName.length < 3) {
            setError('Nama lengkap minimal 3 karakter');
            return false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Email tidak valid');
            return false;
        }
        const cleanPhone = formData.phone.replace(/[^0-9+]/g, '');
        if (!cleanPhone || !/^(08|628|\+628)[0-9]{8,11}$/.test(cleanPhone)) {
            setError('Nomor HP tidak valid (format: 08xx atau 62xx)');
            return false;
        }
        if (!formData.password || formData.password.length < 8) {
            setError('Password minimal 8 karakter');
            return false;
        }
        if (formData.password !== confirmPassword) {
            setError('Password tidak cocok');
            return false;
        }
        if (!formData.businessName) {
            setError('Nama usaha wajib diisi');
            return false;
        }
        if (!formData.sector) {
            setError('Bidang usaha wajib dipilih');
            return false;
        }
        if (!formData.omzetMonthly) {
            setError('Omzet per bulan wajib dipilih');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        if (formData.requestedServices.length === 0) {
            setError('Pilih minimal satu layanan');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await onboardingService.register(formData);

            if (response.success && response.data) {
                setWhatsappLink(response.data.whatsappLink);
                setSuccess(true);
            } else {
                setError(response.message || 'Pendaftaran gagal');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Pendaftaran gagal');
        } finally {
            setLoading(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Pendaftaran Berhasil!</h2>
                    <p className="text-muted-foreground mb-6">
                        Akun UMKM Anda telah dibuat. Klik tombol di bawah untuk menghubungi admin melalui WhatsApp.
                    </p>

                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Hubungi Admin via WhatsApp
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    <Link to="/login">
                        <Button variant="outline" className="w-full">
                            Login ke Dashboard
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: '50%' }}
                    animate={{ width: step === 1 ? '50%' : '100%' }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <div className="container max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6">
                        <img src="/logo.jpg" alt="Semindo" className="h-12 mx-auto" />
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Daftar UMKM</h1>
                    <p className="text-muted-foreground">
                        {step === 1 ? 'Lengkapi data identitas usaha Anda' : 'Pilih layanan yang Anda butuhkan'}
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                </div>

                {/* Form Card */}
                <motion.div
                    className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 shadow-xl"
                    layout
                >
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <h2 className="text-xl font-semibold mb-4">Identitas UMKM</h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nama Lengkap Pemilik *</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            placeholder="Nama lengkap Anda"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">No. HP / WhatsApp *</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="081234567890"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="email@contoh.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password *</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Minimal 8 karakter"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Ulangi password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="font-medium mb-4">Informasi Usaha</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="businessName">Nama Usaha *</Label>
                                            <Input
                                                id="businessName"
                                                name="businessName"
                                                placeholder="Nama usaha/toko Anda"
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Bidang Usaha *</Label>
                                                <Select
                                                    value={formData.sector}
                                                    onValueChange={(value) => handleSelectChange('sector', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih bidang usaha" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sectors.map(sector => (
                                                            <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Omzet per Bulan *</Label>
                                                <Select
                                                    value={formData.omzetMonthly}
                                                    onValueChange={(value) => handleSelectChange('omzetMonthly', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih range omzet" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {omzetRanges.map(range => (
                                                            <SelectItem key={range} value={range}>{range}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="challenges">Kendala Utama (Opsional)</Label>
                                            <Textarea
                                                id="challenges"
                                                name="challenges"
                                                placeholder="Ceritakan kendala atau tantangan yang Anda hadapi..."
                                                value={formData.challenges}
                                                onChange={handleInputChange}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button onClick={handleNextStep} className="w-full" size="lg">
                                    Lanjutkan
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Pilih Layanan</h2>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Kembali
                                    </button>
                                </div>

                                <p className="text-muted-foreground text-sm">
                                    Pilih layanan pendampingan yang Anda butuhkan (bisa lebih dari satu):
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {services.map(service => {
                                        const Icon = iconMap[service.icon] || TrendingUp;
                                        const isSelected = formData.requestedServices.includes(service.id);

                                        return (
                                            <motion.button
                                                key={service.id}
                                                type="button"
                                                onClick={() => toggleService(service.id)}
                                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                    }`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-primary-foreground" />
                                                    </div>
                                                )}
                                                <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <h3 className="font-medium">{service.name}</h3>
                                                <p className="text-sm text-muted-foreground">{service.description}</p>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {error && (
                                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    onClick={handleSubmit}
                                    className="w-full"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                            Mendaftarkan...
                                        </>
                                    ) : (
                                        <>
                                            Daftar Sekarang
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Login di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
