import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { X, SlidersHorizontal } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export interface ProductFilters {
    search: string;
    category: string | null;
    minPrice: number;
    maxPrice: number;
    stockStatus: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

interface ProductFiltersComponentProps {
    filters: ProductFilters;
    onFiltersChange: (filters: ProductFilters) => void;
    categories: { id: string; name: string; count: number }[];
}

export function ProductFiltersComponent({ filters, onFiltersChange, categories }: ProductFiltersComponentProps) {
    const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
    const [priceRange, setPriceRange] = useState<number[]>([filters.minPrice, filters.maxPrice]);

    const handleApplyFilters = () => {
        onFiltersChange({
            ...localFilters,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        });
    };

    const handleResetFilters = () => {
        const resetFilters: ProductFilters = {
            search: '',
            category: null,
            minPrice: 0,
            maxPrice: 100000000,
            stockStatus: 'all',
            sortBy: 'newest',
        };
        setLocalFilters(resetFilters);
        setPriceRange([0, 100000000]);
        onFiltersChange(resetFilters);
    };

    const formatPrice = (value: number) => {
        return `Rp ${(value / 1000).toFixed(0)}k`;
    };

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Price Range */}
            <div className="space-y-3">
                <Label>Rentang Harga</Label>
                <div className="px-2">
                    <Slider
                        min={0}
                        max={100000000}
                        step={100000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="w-full"
                    />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-3">
                <Label>Status Stok</Label>
                <Select
                    value={localFilters.stockStatus}
                    onValueChange={(value) =>
                        setLocalFilters({ ...localFilters, stockStatus: value as any })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="in_stock">Tersedia</SelectItem>
                        <SelectItem value="low_stock">Stok Menipis</SelectItem>
                        <SelectItem value="out_of_stock">Habis</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
                <Label>Urutkan Berdasarkan</Label>
                <Select
                    value={localFilters.sortBy}
                    onValueChange={(value) =>
                        setLocalFilters({ ...localFilters, sortBy: value as any })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Terbaru</SelectItem>
                        <SelectItem value="price_asc">Harga Terendah</SelectItem>
                        <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
                        <SelectItem value="popular">Terpopuler</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
                <Button onClick={handleApplyFilters} className="flex-1">
                    Terapkan Filter
                </Button>
                <Button onClick={handleResetFilters} variant="outline" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Reset
                </Button>
            </div>
        </div>
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Filter Produk</SheetTitle>
                    <SheetDescription>
                        Sesuaikan pencarian produk Anda
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <FilterContent />
                </div>
            </SheetContent>
        </Sheet>
    );
}
