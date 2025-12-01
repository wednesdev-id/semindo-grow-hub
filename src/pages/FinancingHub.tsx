import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Calculator, CreditCard, TrendingUp, Shield, Clock, CheckCircle, AlertCircle, DollarSign, PieChart, BarChart3 } from "lucide-react";
import SEOHead from "@/components/ui/seo-head";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { financingService } from "@/services/financingService";

const FinancingHub = () => {
  const [loanAmount, setLoanAmount] = useState([50000000]);
  const [loanTerm, setLoanTerm] = useState([24]);
  const [interestRate] = useState(12); // Fixed rate for simulation

  const { data: partners, isLoading } = useQuery({
    queryKey: ['financing-partners'],
    queryFn: financingService.getPartners
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(0)} Miliar`;
    } else if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(0)} Juta`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const creditScoreFactors = [
    {
      factor: "Riwayat Pembayaran",
      weight: "35%",
      score: 85,
      status: "good",
      description: "Konsistensi pembayaran kredit dan tagihan"
    },
    {
      factor: "Utilisasi Kredit",
      weight: "30%",
      score: 72,
      status: "fair",
      description: "Persentase penggunaan limit kredit yang tersedia"
    },
    {
      factor: "Riwayat Kredit",
      weight: "15%",
      score: 90,
      status: "excellent",
      description: "Lamanya memiliki akun kredit aktif"
    },
    {
      factor: "Jenis Kredit",
      weight: "10%",
      score: 78,
      status: "good",
      description: "Variasi jenis kredit yang dimiliki"
    },
    {
      factor: "Kredit Baru",
      weight: "10%",
      score: 65,
      status: "fair",
      description: "Frekuensi pengajuan kredit baru"
    }
  ];

  const calculateMonthlyPayment = () => {
    const principal = loanAmount[0];
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm[0];

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return monthlyPayment;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalPayment = monthlyPayment * loanTerm[0];
  const totalInterest = totalPayment - loanAmount[0];

  const getScoreColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100';
      case 'good': return 'bg-blue-100';
      case 'fair': return 'bg-yellow-100';
      case 'poor': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Financing Hub – Akses Pembiayaan & Simulasi Kredit UMKM"
        description="Temukan KUR, pinjaman fintech, crowdfunding, dan simulasi pembiayaan. Dilengkapi credit scoring berbasis data usaha Anda."
        keywords="financing hub, KUR, pinjaman UMKM, fintech, crowdfunding, simulasi kredit, credit scoring"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Financing Hub – Akses Pembiayaan & Simulasi Kredit UMKM
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Temukan solusi pembiayaan terbaik untuk UMKM Anda. Dari KUR hingga fintech, lengkap dengan simulasi dan credit scoring.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg">
              <Calculator className="h-5 w-5 mr-2" />
              Simulasi Kredit
            </Button>
            <Button size="lg" variant="outline">
              <TrendingUp className="h-5 w-5 mr-2" />
              Cek Credit Score
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="financing" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="financing">Opsi Pembiayaan</TabsTrigger>
            <TabsTrigger value="simulator">Simulasi Kredit</TabsTrigger>
            <TabsTrigger value="credit-score">Credit Scoring</TabsTrigger>
            <TabsTrigger value="tips">Tips & Panduan</TabsTrigger>
          </TabsList>

          {/* Financing Options */}
          <TabsContent value="financing" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Pilihan Pembiayaan UMKM</h2>
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partners?.map((option) => (
                    <Card key={option.id} className="relative overflow-hidden">
                      {!option.isActive && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary">Segera Hadir</Badge>
                        </div>
                      )}

                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          {option.name}
                        </CardTitle>
                        <CardDescription>{option.provider}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{option.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-muted-foreground">Maksimal Pinjaman</Label>
                            <p className="font-semibold">{formatCurrency(option.maxAmount)}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Suku Bunga</Label>
                            <p className="font-semibold">{option.interestRate}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Jangka Waktu</Label>
                            <p className="font-semibold">{option.term}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Persyaratan</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {option.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Keunggulan</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {option.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          disabled={!option.isActive}
                          asChild={option.isActive}
                        >
                          {!option.isActive ? (
                            'Segera Hadir'
                          ) : (
                            <Link to={`/financing/apply/${option.slug}`}>
                              Ajukan Sekarang
                            </Link>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Loan Simulator */}
          <TabsContent value="simulator" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Simulasi Kredit UMKM</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Parameter Pinjaman
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Jumlah Pinjaman</Label>
                      <div className="px-3">
                        <Slider
                          value={loanAmount}
                          onValueChange={setLoanAmount}
                          max={500000000}
                          min={10000000}
                          step={5000000}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Rp 10 Juta</span>
                        <span className="font-semibold text-primary">
                          Rp {(loanAmount[0] / 1000000).toFixed(0)} Juta
                        </span>
                        <span>Rp 500 Juta</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Jangka Waktu (Bulan)</Label>
                      <div className="px-3">
                        <Slider
                          value={loanTerm}
                          onValueChange={setLoanTerm}
                          max={60}
                          min={6}
                          step={6}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>6 Bulan</span>
                        <span className="font-semibold text-primary">
                          {loanTerm[0]} Bulan
                        </span>
                        <span>60 Bulan</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Suku Bunga (per tahun)</Label>
                      <Input value={`${interestRate}%`} disabled />
                      <p className="text-xs text-muted-foreground">
                        *Suku bunga estimasi berdasarkan rata-rata pasar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Jenis Usaha</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis usaha" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail/Perdagangan</SelectItem>
                          <SelectItem value="manufacturing">Manufaktur</SelectItem>
                          <SelectItem value="services">Jasa</SelectItem>
                          <SelectItem value="fnb">Food & Beverage</SelectItem>
                          <SelectItem value="agriculture">Pertanian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Hasil Simulasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <Label className="text-sm text-muted-foreground">Cicilan per Bulan</Label>
                        <p className="text-2xl font-bold text-primary">
                          Rp {monthlyPayment.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <Label className="text-xs text-muted-foreground">Total Pembayaran</Label>
                          <p className="text-lg font-semibold">
                            Rp {totalPayment.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <Label className="text-xs text-muted-foreground">Total Bunga</Label>
                          <p className="text-lg font-semibold">
                            Rp {totalInterest.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Breakdown Pembayaran</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pokok Pinjaman</span>
                          <span>Rp {loanAmount[0].toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Bunga ({interestRate}% p.a.)</span>
                          <span>Rp {totalInterest.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>Rp {totalPayment.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Rekomendasi</Label>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Cicilan sesuai dengan kemampuan finansial UMKM</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span>Pastikan cash flow bulanan mencukupi</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Ajukan Pinjaman
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Credit Score */}
          <TabsContent value="credit-score" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Credit Scoring UMKM</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Credit Score Overview */}
                <Card className="lg:col-span-1">
                  <CardHeader className="text-center">
                    <CardTitle>Credit Score Anda</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-green-500 flex items-center justify-center">
                        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-green-600">750</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Baik</Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Score Anda menunjukkan profil kredit yang baik
                      </p>
                    </div>
                    <Button className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Tingkatkan Score
                    </Button>
                  </CardContent>
                </Card>

                {/* Score Factors */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Faktor Penilaian Credit Score</CardTitle>
                    <CardDescription>
                      Analisis detail komponen yang mempengaruhi credit score Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {creditScoreFactors.map((factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{factor.factor}</span>
                            <span className="text-sm text-muted-foreground ml-2">({factor.weight})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getScoreColor(factor.status)}`}>
                              {factor.score}
                            </span>
                            <Badge className={`${getScoreBg(factor.status)} ${getScoreColor(factor.status)}`}>
                              {factor.status === 'excellent' ? 'Sangat Baik' :
                                factor.status === 'good' ? 'Baik' :
                                  factor.status === 'fair' ? 'Cukup' : 'Kurang'}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${factor.status === 'excellent' ? 'bg-green-500' :
                              factor.status === 'good' ? 'bg-blue-500' :
                                factor.status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${factor.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{factor.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Credit Score Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Manfaat Credit Score yang Baik</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center space-y-2">
                      <div className="bg-green-100 p-3 rounded-full w-fit mx-auto">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold">Suku Bunga Rendah</h3>
                      <p className="text-sm text-muted-foreground">
                        Dapatkan penawaran suku bunga yang lebih kompetitif
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Approval Lebih Mudah</h3>
                      <p className="text-sm text-muted-foreground">
                        Proses persetujuan pinjaman yang lebih cepat
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold">Limit Lebih Tinggi</h3>
                      <p className="text-sm text-muted-foreground">
                        Akses ke pinjaman dengan jumlah yang lebih besar
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tips & Guidelines */}
          <TabsContent value="tips" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Tips & Panduan Pembiayaan</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Persiapan Dokumen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Dokumen Wajib:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• KTP dan NPWP</li>
                        <li>• Izin usaha (SIUP/TDP/NIB)</li>
                        <li>• Laporan keuangan 2 tahun terakhir</li>
                        <li>• Rekening koran 6 bulan</li>
                        <li>• Surat keterangan domisili usaha</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Meningkatkan Peluang Approval
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Tips Sukses:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Jaga riwayat pembayaran yang baik</li>
                        <li>• Siapkan business plan yang solid</li>
                        <li>• Tunjukkan cash flow yang stabil</li>
                        <li>• Miliki agunan atau jaminan</li>
                        <li>• Pilih lender yang tepat</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Hal yang Harus Dihindari
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Peringatan:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Jangan meminjam melebihi kemampuan</li>
                        <li>• Hindari pinjaman dengan bunga tinggi</li>
                        <li>• Jangan terlambat bayar cicilan</li>
                        <li>• Hindari pinjaman tanpa izin OJK</li>
                        <li>• Jangan berikan data pribadi sembarangan</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      Timeline Pengajuan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Estimasi Waktu:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Persiapan dokumen: 1-2 minggu</li>
                        <li>• Pengajuan dan review: 3-7 hari</li>
                        <li>• Survei dan verifikasi: 1-2 minggu</li>
                        <li>• Persetujuan: 3-5 hari</li>
                        <li>• Pencairan: 1-3 hari</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default FinancingHub;