import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Globe, FileText, Calculator, Truck, Users, Award, CheckCircle, MapPin, Clock } from "lucide-react";
import SEOHead from "@/components/ui/seo-head";
import { useState, useEffect } from "react";
import { exportService, ExportHSCode, ExportCountry, ExportBuyer } from "@/services/exportService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";

const ExportHub = () => {
  const [searchHSCode, setSearchHSCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [hsCodes, setHsCodes] = useState<ExportHSCode[]>([]);
  const [countries, setCountries] = useState<ExportCountry[]>([]);
  const [buyers, setBuyers] = useState<ExportBuyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [hsData, countryData, buyerData] = await Promise.all([
          exportService.getHSCodes(),
          exportService.getCountries(),
          exportService.getBuyers()
        ]);
        setHsCodes(hsData);
        setCountries(countryData);
        setBuyers(buyerData);
      } catch (error) {
        console.error("Failed to load export data", error);
        toast({
          title: "Error",
          description: "Gagal memuat data ekspor. Silakan coba lagi.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast]);

  // Handle HS Code Search
  const handleSearchHSCode = async () => {
    setIsLoading(true);
    try {
      const results = await exportService.getHSCodes(searchHSCode);
      setHsCodes(results);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportSteps = [
    {
      step: 1,
      title: "Persiapan Produk",
      description: "Pastikan produk memenuhi standar kualitas dan regulasi negara tujuan",
      tasks: ["Riset pasar", "Standarisasi produk", "Sertifikasi", "Packaging ekspor"],
      duration: "2-4 minggu"
    },
    {
      step: 2,
      title: "Dokumentasi",
      description: "Lengkapi semua dokumen yang diperlukan untuk ekspor",
      tasks: ["Invoice", "Packing List", "Certificate of Origin", "Surat Keterangan Asal"],
      duration: "1-2 minggu"
    },
    {
      step: 3,
      title: "Logistik & Pengiriman",
      description: "Atur pengiriman dan asuransi barang",
      tasks: ["Booking cargo", "Asuransi", "Custom clearance", "Tracking"],
      duration: "1-3 minggu"
    },
    {
      step: 4,
      title: "Follow Up",
      description: "Pastikan barang sampai dan pembayaran diterima",
      tasks: ["Konfirmasi penerimaan", "Payment collection", "After sales", "Relationship building"],
      duration: "1-2 minggu"
    }
  ];

  const logisticCalculator = {
    origin: "Jakarta, Indonesia",
    destinations: [
      { city: "Kuala Lumpur", country: "Malaysia", distance: 1200, seaCost: 150, airCost: 800 },
      { city: "Singapore", country: "Singapore", distance: 900, seaCost: 120, airCost: 600 },
      { city: "Tokyo", country: "Japan", distance: 5800, seaCost: 800, airCost: 2500 },
      { city: "Sydney", country: "Australia", distance: 4200, seaCost: 600, airCost: 2000 }
    ]
  };

  if (isLoading && countries.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Export Hub – Info Sertifikasi, Buyer Matching, & Logistik"
        description="Pelajari regulasi ekspor, cek HS code, hitung biaya logistik, dan temukan buyer B2B. Bantu UMKM Anda go international."
        keywords="export hub, HS code, buyer matching, logistik ekspor, sertifikasi ekspor, regulasi ekspor"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Export Hub – Info Sertifikasi, Buyer Matching, & Logistik
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Platform lengkap untuk membantu UMKM go international. Dari riset pasar hingga buyer matching, semua ada di sini.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg">
              <Search className="h-5 w-5 mr-2" />
              Cek HS Code
            </Button>
            <Button size="lg" variant="outline">
              <Users className="h-5 w-5 mr-2" />
              Temukan Buyer
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="hs-code" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="hs-code">HS Code</TabsTrigger>
            <TabsTrigger value="countries">Negara Tujuan</TabsTrigger>
            <TabsTrigger value="logistics">Kalkulator Logistik</TabsTrigger>
            <TabsTrigger value="buyers">Buyer Matching</TabsTrigger>
            <TabsTrigger value="guide">Panduan Ekspor</TabsTrigger>
          </TabsList>

          {/* HS Code Checker */}
          <TabsContent value="hs-code" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">HS Code Checker</h2>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Cari HS Code Produk
                  </CardTitle>
                  <CardDescription>
                    Masukkan nama produk atau kode HS untuk mencari informasi tarif dan persyaratan ekspor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Contoh: kopi, tekstil, kerajinan..."
                        value={searchHSCode}
                        onChange={(e) => setSearchHSCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchHSCode()}
                      />
                    </div>
                    <Button onClick={handleSearchHSCode} disabled={isLoading}>
                      {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                      Cari
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hasil Pencarian HS Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode HS</TableHead>
                        <TableHead>Deskripsi Produk</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tarif</TableHead>
                        <TableHead>Persyaratan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hsCodes.length > 0 ? (
                        hsCodes.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{item.code}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">{item.tariff}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {item.requirements.map((req, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs mr-1">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Tidak ada data HS Code ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Export Countries */}
          <TabsContent value="countries" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Negara Tujuan Ekspor</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {countries.map((country, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <div>{country.name}</div>
                          <Badge variant="outline" className="text-xs">{country.market}</Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Jarak</Label>
                          <p className="font-semibold">{country.distance}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Waktu Kirim</Label>
                          <p className="font-semibold">{country.shippingTime}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Rata-rata Tarif</Label>
                          <p className="font-semibold text-green-600">{country.avgTariff}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Persyaratan Utama</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {country.requirements.map((req, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Produk Populer</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {country.topProducts.map((product, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Lihat Detail Regulasi
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Logistics Calculator */}
          <TabsContent value="logistics" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Kalkulator Biaya Logistik</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Parameter Pengiriman
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Asal Pengiriman</Label>
                      <Input value={logisticCalculator.origin} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Negara Tujuan</Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih negara tujuan" />
                        </SelectTrigger>
                        <SelectContent>
                          {logisticCalculator.destinations.map((dest, index) => (
                            <SelectItem key={index} value={dest.country}>
                              {dest.city}, {dest.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Berat (kg)</Label>
                        <Input type="number" placeholder="100" />
                      </div>
                      <div className="space-y-2">
                        <Label>Volume (m³)</Label>
                        <Input type="number" placeholder="1.5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Jenis Barang</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Cargo</SelectItem>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="textile">Textile</SelectItem>
                          <SelectItem value="handicraft">Handicraft</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      Estimasi Biaya
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedCountry && (
                      <>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-blue-800">Sea Freight</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${logisticCalculator.destinations.find(d => d.country === selectedCountry)?.seaCost || 0}
                            </div>
                            <p className="text-sm text-blue-600">15-30 hari pengiriman</p>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-800">Air Freight</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              ${logisticCalculator.destinations.find(d => d.country === selectedCountry)?.airCost || 0}
                            </div>
                            <p className="text-sm text-green-600">3-7 hari pengiriman</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Biaya Tambahan</Label>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Custom Clearance</span>
                              <span>$50 - $150</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Documentation</span>
                              <span>$25 - $75</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Insurance (0.5%)</span>
                              <span>$10 - $50</span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-semibold">
                              <span>Total Estimasi</span>
                              <span>${(logisticCalculator.destinations.find(d => d.country === selectedCountry)?.seaCost || 0) + 135} - ${(logisticCalculator.destinations.find(d => d.country === selectedCountry)?.airCost || 0) + 275}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Button className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Hitung Detail
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Buyer Matching */}
          <TabsContent value="buyers" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Buyer Matching B2B</h2>

              <div className="grid grid-cols-1 gap-6">
                {buyers.map((buyer, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{buyer.companyName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {buyer.countryName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Est. {buyer.established}
                            </div>
                            <Badge variant="outline">{buyer.category}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-sm font-medium">Rating:</span>
                            <span className="font-bold text-yellow-600">{buyer.rating}</span>
                          </div>
                          {buyer.isVerified && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Produk yang Dicari</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {buyer.products.map((product, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Volume Pembelian</Label>
                          <p className="font-semibold">{buyer.volume}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Users className="h-4 w-4 mr-2" />
                          Hubungi Buyer
                        </Button>
                        <Button variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Lihat Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-6">
                <Button variant="outline" size="lg">
                  Lihat Semua Buyer
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Export Guide */}
          <TabsContent value="guide" className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Panduan Lengkap Ekspor</h2>

              <div className="space-y-6">
                {exportSteps.map((step, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {step.step}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <Badge variant="outline">{step.duration}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{step.description}</p>

                          <div>
                            <Label className="text-sm font-medium">Checklist:</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                              {step.tasks.map((task, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  {task}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-primary/5 mt-8">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Butuh Bantuan Ekspor?</h3>
                  <p className="text-muted-foreground mb-4">
                    Tim konsultan ekspor Semindo siap membantu Anda dari A sampai Z
                  </p>
                  <Button size="lg">
                    <Users className="h-5 w-5 mr-2" />
                    Konsultasi dengan Ahli
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ExportHub;