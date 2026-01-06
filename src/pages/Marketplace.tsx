import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, ShoppingCart, Eye, Heart, Award, Truck, Globe, Loader2 } from "lucide-react";
import SEOHead from "@/components/ui/seo-head";
import { useQuery } from "@tanstack/react-query";
import { marketplaceService } from "@/services/marketplaceService";
import { Link } from "react-router-dom";
import { getCategoryIcon } from "@/config/categoryIcons";
import { getCategoryColor } from "@/config/categoryColors";
import { useState } from "react";
import { ProductFiltersComponent } from "@/components/marketplace/ProductFilters";

const Marketplace = () => {
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: null as string | null,
    sortBy: 'newest',
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: marketplaceService.getCategories
  });

  // Use searchProducts instead of getFeaturedProducts
  const { data: searchResults, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['marketplace-search', filters],
    queryFn: () => marketplaceService.searchProducts({
      search: filters.search || undefined,
      category: filters.category || undefined,
      sortBy: filters.sortBy || 'newest',
      limit: 20
    })
  });

  const { data: topSellers, isLoading: isLoadingSellers } = useQuery({
    queryKey: ['marketplace-sellers'],
    queryFn: marketplaceService.getTopSellers
  });

  const isLoading = isLoadingCategories || isLoadingProducts || isLoadingSellers;

  const handleSearch = () => {
    // Search is handled via state change
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Marketplace UMKM – Produk Unggulan & Siap Ekspor"
        description="Temukan produk unggulan UMKM binaan Semindo. Kategori lengkap dari kuliner, fashion, kerajinan, hingga teknologi. Produk siap ekspor tersedia!"
        keywords="marketplace UMKM, produk unggulan, siap ekspor, kuliner, fashion, kerajinan, teknologi"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Cart Icon - Top Right of Container */}
          <div className="absolute -top-16 right-0">
            <Link to="/marketplace/cart">
              <Button size="lg" variant="outline" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
          </div>

          {/* Heading - Center Aligned */}
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Marketplace UMKM – Produk Unggulan & Siap Ekspor
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Temukan dan beli produk berkualitas dari UMKM binaan Semindo. Dari kuliner hingga teknologi, semua siap untuk pasar lokal and ekspor.
          </p>

          {/* Simplified Search Bar - Center Aligned */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari produk, kategori, atau nama toko..."
                className="pl-10 h-12"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
            </div>
            <Button size="lg" className="h-12 px-6" onClick={handleSearch}>
              Cari
            </Button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Categories */}
          <section className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Kategori Produk</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories?.map((category) => {
                  const CategoryIcon = getCategoryIcon(category.name);
                  const categoryColor = getCategoryColor(category.name);
                  return (
                    <div
                      key={category.id}
                      onClick={() => setFilters({ ...filters, category: category.id })}
                      className="cursor-pointer"
                    >
                      <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                        <CardContent className="p-6 text-center">
                          {/* Icon with colored background */}
                          <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: categoryColor.background }}
                          >
                            <CategoryIcon
                              className="h-8 w-8"
                              style={{ color: categoryColor.text }}
                            />
                          </div>
                          <h3 className="font-semibold mb-2 text-sm">{category.name}</h3>
                          <p className="text-xs text-muted-foreground">{category.count} produk</p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-12 px-4 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold">Produk Unggulan</h2>
                <ProductFiltersComponent
                  filters={{
                    search: filters.search,
                    category: filters.category,
                    sortBy: filters.sortBy as any,
                    minPrice: 0,
                    maxPrice: 10000000,
                    stockStatus: 'all'
                  }}
                  onFiltersChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
                  categories={categories || []}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults?.products?.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {product.badges?.map((badge, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {product.location}
                        </div>
                      </div>

                      <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({product.reviews} ulasan)</span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-primary">{product.price}</span>
                          {(product as any).originalPrice && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              {(product as any).originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">oleh {product.seller}</p>

                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Beli Sekarang
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/marketplace/product/${product.slug}`}>
                            Detail
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/marketplace/products">
                    Lihat Semua Produk
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Top Sellers */}
          <section className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Penjual Terpercaya</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topSellers?.map((seller, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <img
                          src={seller.image}
                          alt={seller.name}
                          className="w-20 h-20 rounded-full mx-auto object-cover"
                        />
                        {seller.verified && (
                          <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                            <Award className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold mb-2">{seller.name}</h3>
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {seller.location}
                      </div>

                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{seller.rating}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                          <div className="font-semibold">{seller.products}</div>
                          <div className="text-muted-foreground">Produk</div>
                        </div>
                        <div>
                          <div className="font-semibold">{seller.totalSales}</div>
                          <div className="text-muted-foreground">Terjual</div>
                        </div>
                      </div>

                      <Button className="w-full mt-4" variant="outline">
                        Kunjungi Toko
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Export Ready Section */}
          <section className="py-12 px-4 bg-primary/5">
            <div className="max-w-7xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Globe className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Produk Siap Ekspor</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Temukan produk-produk UMKM yang telah memenuhi standar internasional dan siap untuk pasar ekspor
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Sertifikasi Lengkap</h3>
                    <p className="text-sm text-muted-foreground">
                      Produk dengan sertifikat halal, SNI, dan standar internasional
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Truck className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Logistik Ekspor</h3>
                    <p className="text-sm text-muted-foreground">
                      Dukungan pengiriman internasional dan dokumentasi ekspor
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Globe className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Buyer Matching</h3>
                    <p className="text-sm text-muted-foreground">
                      Koneksi langsung dengan buyer internasional yang terpercaya
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Button size="lg">
                <Globe className="h-5 w-5 mr-2" />
                Lihat Produk Siap Ekspor
              </Button>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Marketplace;