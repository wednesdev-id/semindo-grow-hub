import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { financingService } from "@/services/financingService";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const LoanApplicationForm = () => {
    const { partnerSlug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        amount: "",
        term: "",
        purpose: "",
        notes: ""
    });

    const { data: partners } = useQuery({
        queryKey: ['financing-partners'],
        queryFn: financingService.getPartners
    });

    const partner = partners?.find(p => p.slug === partnerSlug);

    const mutation = useMutation({
        mutationFn: financingService.createApplication,
        onSuccess: () => {
            toast({
                title: "Pengajuan Berhasil",
                description: "Aplikasi pinjaman Anda telah dikirim untuk ditinjau.",
            });
            navigate("/dashboard"); // Redirect to dashboard or application history
        },
        onError: () => {
            toast({
                title: "Gagal Mengajukan",
                description: "Terjadi kesalahan saat mengirim aplikasi. Silakan coba lagi.",
                variant: "destructive"
            });
        }
    });

    const handleSubmit = () => {
        if (!partner) return;
        mutation.mutate({
            partnerId: partner.id,
            amount: Number(formData.amount),
            term: Number(formData.term),
            purpose: formData.purpose,
            notes: formData.notes
        });
    };

    if (!partner && !partners) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (partners && !partner) return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold">Mitra tidak ditemukan</h2>
                <Button className="mt-4" onClick={() => navigate("/financing")}>Kembali</Button>
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="max-w-3xl mx-auto px-4 py-20">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengajuan Pinjaman - {partner?.name}</CardTitle>
                        <CardDescription>Lengkapi formulir berikut untuk mengajukan pinjaman.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Step 1: Loan Details */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Jumlah Pinjaman (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="Contoh: 50000000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jangka Waktu (Bulan)</Label>
                                    <Select onValueChange={(val) => setFormData({ ...formData, term: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jangka waktu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="6">6 Bulan</SelectItem>
                                            <SelectItem value="12">12 Bulan</SelectItem>
                                            <SelectItem value="24">24 Bulan</SelectItem>
                                            <SelectItem value="36">36 Bulan</SelectItem>
                                            <SelectItem value="48">48 Bulan</SelectItem>
                                            <SelectItem value="60">60 Bulan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tujuan Pinjaman</Label>
                                    <Textarea
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        placeholder="Jelaskan penggunaan dana pinjaman..."
                                    />
                                </div>
                                <Button className="w-full" onClick={() => setStep(2)} disabled={!formData.amount || !formData.term || !formData.purpose}>
                                    Lanjut <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Review & Submit */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                    <h3 className="font-semibold">Ringkasan Pengajuan</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span>Mitra:</span> <span className="font-medium">{partner?.name}</span>
                                        <span>Jumlah:</span> <span className="font-medium">Rp {Number(formData.amount).toLocaleString('id-ID')}</span>
                                        <span>Tenor:</span> <span className="font-medium">{formData.term} Bulan</span>
                                        <span>Tujuan:</span> <span className="font-medium">{formData.purpose}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
                                    </Button>
                                    <Button className="flex-1" onClick={handleSubmit} disabled={mutation.isPending}>
                                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        Kirim Pengajuan
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default LoanApplicationForm;
