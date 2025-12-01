import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplaceService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ShoppingCart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductListPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['marketplace-products'],
        queryFn: marketplaceService.getFeaturedProducts
    });

    const { data: categories } = useQuery({
        queryKey: ['marketplace-categories'],
        queryFn: marketplaceService.getCategories
    });

    const filteredProducts = products?.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4">
                <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className="whitespace-nowrap"
                >
                    Semua Kategori
                </Button>
                {categories?.map((category) => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.id)}
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
                    {filteredProducts?.map((product) => (
                        <Link key={product.id} to={`/marketplace/products/${product.slug}`}>
                            <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                                <div className="aspect-video w-full overflow-hidden bg-muted">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <Badge variant="secondary" className="text-xs">
                                            {product.category}
                                        </Badge>
                                        <div className="flex items-center text-yellow-500">
                                            <Star className="mr-1 h-3 w-3 fill-current" />
                                            <span className="text-xs font-medium">{product.rating || 'New'}</span>
                                        </div>
                                    </div>
                                    <h3 className="line-clamp-2 text-lg font-semibold">{product.name}</h3>
                                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                                        <MapPin className="mr-1 h-3 w-3" />
                                        {product.location}
                                    </div>
                                    <div className="mt-2 font-bold text-primary">
                                        {product.price}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button className="w-full" variant="outline">
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Lihat Detail
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {!isLoadingProducts && filteredProducts?.length === 0 && (
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
