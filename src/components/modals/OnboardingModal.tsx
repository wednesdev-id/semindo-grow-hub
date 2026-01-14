import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Palette, ClipboardList, DollarSign, Users, Megaphone,
    ArrowRight, ArrowLeft, Check, Loader2, ExternalLink, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

// Service options
const services = [
    { id: 'bisnis', name: 'Pengembangan Bisnis', icon: 'TrendingUp', description: 'Strategi usaha' },
    { id: 'branding', name: 'Branding', icon: 'Palette', description: 'Citra merek' },
    { id: 'manajemen', name: 'Manajemen', icon: 'ClipboardList', description: 'Operasional' },
    { id: 'keuangan', name: 'Keuangan', icon: 'DollarSign', description: 'Keuangan' },
    { id: 'network', name: 'Network', icon: 'Users', description: 'Kemitraan' },
    { id: 'pemasaran', name: 'Pemasaran', icon: 'Megaphone', description: 'Marketing' },
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

interface OnboardingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
    const navigate = useNavigate();
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

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(1);
                setError('');
                setSuccess(false);
                setWhatsappLink('');
                setFormData({
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
                setConfirmPassword('');
            }, 300);
        }
    }, [open]);

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

    const handleWhatsAppClick = () => {
        window.open(whatsappLink, '_blank');
    };

    const handleLoginRedirect = () => {
        onOpenChange(false);
        navigate('/login');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {success ? '🎉 Pendaftaran Berhasil!' : step === 1 ? 'Daftar UMKM' : 'Pilih Layanan'}
                    </DialogTitle>
                </DialogHeader>

                {/* Progress indicator */}
                {!success && (
                    <div className="flex justify-center gap-2 mb-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4 space-y-4"
                        >
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-7 h-7 text-green-600" />
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Akun UMKM Anda telah dibuat. Hubungi admin via WhatsApp untuk informasi lebih lanjut.
                            </p>

                            <Button onClick={handleWhatsAppClick} className="w-full bg-green-500 hover:bg-green-600">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Hubungi Admin
                                <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>

                            <Button variant="outline" onClick={handleLoginRedirect} className="w-full">
                                Login ke Dashboard
                            </Button>
                        </motion.div>
                    ) : step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="fullName" className="text-xs">Nama Lengkap *</Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Nama lengkap"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="phone" className="text-xs">No. HP *</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="08xxx"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-xs">Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="email@contoh.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="h-9"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="password" className="text-xs">Password *</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Min 8 karakter"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="confirmPassword" className="text-xs">Konfirmasi *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Ulangi password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="businessName" className="text-xs">Nama Usaha *</Label>
                                    <Input
                                        id="businessName"
                                        name="businessName"
                                        placeholder="Nama usaha/toko"
                                        value={formData.businessName}
                                        onChange={handleInputChange}
                                        className="h-9"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Bidang Usaha *</Label>
                                        <Select
                                            value={formData.sector}
                                            onValueChange={(value) => handleSelectChange('sector', value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Pilih bidang" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sectors.map(sector => (
                                                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Omzet/Bulan *</Label>
                                        <Select
                                            value={formData.omzetMonthly}
                                            onValueChange={(value) => handleSelectChange('omzetMonthly', value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Pilih range" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {omzetRanges.map(range => (
                                                    <SelectItem key={range} value={range}>{range}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="challenges" className="text-xs">Kendala (Opsional)</Label>
                                    <Textarea
                                        id="challenges"
                                        name="challenges"
                                        placeholder="Kendala utama..."
                                        value={formData.challenges}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
                                    {error}
                                </div>
                            )}

                            <Button onClick={handleNextStep} className="w-full">
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
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Kembali
                                </button>
                                <p className="text-xs text-muted-foreground">Pilih min. 1 layanan</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {services.map(service => {
                                    const Icon = iconMap[service.icon] || TrendingUp;
                                    const isSelected = formData.requestedServices.includes(service.id);

                                    return (
                                        <motion.button
                                            key={service.id}
                                            type="button"
                                            onClick={() => toggleService(service.id)}
                                            className={`relative p-3 rounded-lg border-2 text-left transition-all ${isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                                }`}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                                </div>
                                            )}
                                            <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <h3 className="text-xs font-medium">{service.name}</h3>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {error && (
                                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleSubmit}
                                className="w-full"
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
            </DialogContent>
        </Dialog>
    );
}
