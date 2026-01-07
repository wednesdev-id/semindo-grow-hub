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
import { Link, useNavigate } from "react-router-dom";
import { getCategoryIcon } from "@/config/categoryIcons";
import { getCategoryColor } from "@/config/categoryColors";
import { MARKETPLACE_CATEGORIES } from '@/config/categories';
import { useState } from "react";
import { ProductFiltersComponent } from "@/components/marketplace/ProductFilters";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const Marketplace = () => {
  const navigate = useNavigate();
  const { addToCart, itemCount } = useCart();

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

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation(); // Prevent card click
    addToCart(product);
    toast.success(`${product.name} ditambahkan ke keranjang!`);
  };

  const handleCardClick = (slug: string) => {
    navigate(`/marketplace/product/${slug}`);
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
                  {itemCount}
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
          <section className="py-12 px-4 shadow-sm bg-white border-b overflow-x-auto">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-10 text-foreground/80">Kategori Produk</h2>
              <div className="flex md:grid md:grid-cols-6 lg:grid-cols-11 gap-x-2 gap-y-8 pb-4 min-w-max md:min-w-0">
                {MARKETPLACE_CATEGORIES.map((catName) => {
                  const CategoryIcon = getCategoryIcon(catName);
                  const colors = getCategoryColor(catName);
                  const categoryId = categories?.find(c => c.name.toLowerCase().includes(catName.split(' ')[0].toLowerCase()))?.id;

                  return (
                    <div
                      key={catName}
                      onClick={() => categoryId && setFilters({ ...filters, category: categoryId })}
                      className="cursor-pointer group flex flex-col items-center w-24 md:w-full"
                    >
                      <div className="relative mb-3 flex items-center justify-center">
                        {/* Outer Circle - White with soft shadow */}
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-50 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
                          {/* Inner soft color background */}
                          <div
                            className="absolute inset-0 opacity-10"
                            style={{ backgroundColor: colors.text }}
                          ></div>
                          <CategoryIcon
                            className="h-6 w-6 md:h-7 md:w-7 relative z-10 transition-transform duration-300 group-hover:scale-110"
                            style={{ color: colors.text }}
                          />
                        </div>
                      </div>
                      <h3 className="text-[11px] md:text-xs font-medium text-center line-clamp-2 px-1 text-foreground/70 group-hover:text-primary transition-colors h-8 leading-tight">
                        {catName}
                      </h3>
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
                {searchResults?.products?.map((product) => {
                  const colors = getCategoryColor(product.category);
                  return (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border-gray-100 flex flex-col h-full"
                      onClick={() => handleCardClick(product.slug)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted/20">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {product.badges?.map((badge, index) => (
                            <Badge key={index} variant="secondary" className="text-[10px] h-5 bg-white/90 backdrop-blur-sm shadow-sm text-foreground/80 border-none">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              color: colors.text,
                              backgroundColor: colors.background,
                              borderColor: colors.stroke + '40'
                            }}
                          >
                            {product.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                            <MapPin className="h-3 w-3" />
                            {product.location}
                          </div>
                        </div>

                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h3 className="font-semibold text-sm md:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors flex-1">
                            {product.name}
                          </h3>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 hover:bg-rose-50 hover:text-rose-500 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle like logic could go here
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 h-8">
                          {product.description}
                        </p>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold">{product.rating}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{product.reviews} ulasan</span>
                          <span className="text-[11px] text-muted-foreground border-l pl-3">oleh {product.seller}</span>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-lg font-bold text-primary">{product.price}</span>
                            {(product as any).originalPrice && (
                              <span className="text-xs text-muted-foreground line-through opacity-60">
                                {(product as any).originalPrice}
                              </span>
                            )}
                          </div>

                          <Button
                            className="w-full shadow-md bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                            size="default"
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Beli Sekarang
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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