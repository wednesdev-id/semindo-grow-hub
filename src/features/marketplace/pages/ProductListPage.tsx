import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplaceService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ShoppingBag, ShoppingCart, MapPin, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryColor } from '@/config/categoryColors';
import { ProductFiltersComponent } from '@/components/marketplace/ProductFilters';

export default function ProductListPage() {
    const [filters, setFilters] = useState({
        search: '',
        category: null as string | null,
        sortBy: 'newest',
    });

    const { data: searchResults, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['marketplace-products', filters],
        queryFn: () => marketplaceService.searchProducts({
            ...filters,
            category: filters.category || undefined,
            limit: 20
        })
    });

    const { data: categories } = useQuery({
        queryKey: ['marketplace-categories'],
        queryFn: marketplaceService.getCategories
    });

    const products = searchResults?.products || [];

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Marketplace UMKM</h1>
                    <p className="text-muted-foreground">
                        Temukan produk unggulan dari UMKM terbaik di seluruh Indonesia
                    </p>
                </div>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari produk..."
                            className="pl-8"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
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
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4">
                <Button
                    variant={filters.category === null ? "default" : "outline"}
                    onClick={() => setFilters({ ...filters, category: null })}
                    className="whitespace-nowrap"
                >
                    Semua Kategori
                </Button>
                {categories?.map((category) => (
                    <Button
                        key={category.id}
                        variant={filters.category === category.id ? "default" : "outline"}
                        onClick={() => setFilters({ ...filters, category: category.id })}
                        className="whitespace-nowrap"
                    >
                        {category.name}
                    </Button>
                ))}
            </div>

            {/* Product Grid */}
            {isLoadingProducts ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="h-48 bg-muted animate-pulse" />
                            <CardContent className="p-4 space-y-2">
                                <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => {
                        const categoryColor = getCategoryColor(product.category);
                        return (
                            <Link key={product.id} to={`/marketplace/products/${product.slug}`}>
                                <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                    <CardContent className="p-4">
                                        {/* Category Badge with Dynamic Color */}
                                        <Badge
                                            variant="secondary"
                                            className="text-xs mb-2"
                                            style={{
                                                color: categoryColor.text,
                                                backgroundColor: categoryColor.background,
                                                borderColor: categoryColor.stroke,
                                                border: `1px solid ${categoryColor.stroke}`
                                            }}
                                        >
                                            {product.category}
                                        </Badge>

                                        {/* Product Name with Like Button */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="line-clamp-2 text-lg font-semibold flex-1">
                                                {product.name}
                                            </h3>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    // TODO: Implement like functionality
                                                }}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Heart className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center text-yellow-500 mb-2">
                                            <Star className="mr-1 h-3 w-3 fill-current" />
                                            <span className="text-xs font-medium">{product.rating || 'New'}</span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            {product.location}
                                        </div>

                                        {/* Price */}
                                        <div className="font-bold text-primary text-lg">
                                            {product.price}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button
                                            className="w-full"
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Beli Sekarang
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}

            {!isLoadingProducts && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">Tidak ada produk ditemukan</h3>
                    <p className="text-muted-foreground">
                        Coba ubah kata kunci pencarian atau kategori anda.
                    </p>
                </div>
            )}
        </div>
    );
}
