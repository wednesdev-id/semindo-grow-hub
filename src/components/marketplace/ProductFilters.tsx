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
    inStock: boolean | null;
    sortBy: 'price' | 'createdAt' | 'rating' | 'soldCount' | 'viewCount';
    sortOrder: 'asc' | 'desc';
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
            maxPrice: 10000000,
            inStock: null,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };
        setLocalFilters(resetFilters);
        setPriceRange([0, 10000000]);
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
                        max={10000000}
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
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="inStock"
                        checked={localFilters.inStock === true}
                        onCheckedChange={(checked) =>
                            setLocalFilters({ ...localFilters, inStock: checked ? true : null })
                        }
                    />
                    <label
                        htmlFor="inStock"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Hanya Produk Tersedia
                    </label>
                </div>
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
                        <SelectItem value="createdAt">Terbaru</SelectItem>
                        <SelectItem value="price">Harga</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="soldCount">Terlaris</SelectItem>
                        <SelectItem value="viewCount">Terpopuler</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-3">
                <Label>Urutan</Label>
                <Select
                    value={localFilters.sortOrder}
                    onValueChange={(value) =>
                        setLocalFilters({ ...localFilters, sortOrder: value as 'asc' | 'desc' })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">
                            {localFilters.sortBy === 'price' ? 'Termurah' : 'A-Z'}
                        </SelectItem>
                        <SelectItem value="desc">
                            {localFilters.sortBy === 'price' ? 'Termahal' : 'Z-A'}
                        </SelectItem>
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
        <>
            {/* Desktop Filter */}
            <div className="hidden lg:block">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filter Produk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterContent />
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Filter */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
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
            </div>
        </>
    );
}
