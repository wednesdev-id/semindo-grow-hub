// Category Icons Mapping
// Maps category names to Lucide React icons

import {
    UtensilsCrossed,  // Kuliner & F&B
    Shirt,            // Fashion & Aksesoris
    Laptop,           // Elektronik & Gadget
    Palette,          // Kerajinan Tangan
    Heart,            // Kecantikan & Kesehatan
    Sprout,           // Pertanian
    BookOpen,         // Hobi, Buku & Alat Tulis
    Music,            // Entertainment
    Home,             // Peralatan Rumah Tangga
    ShoppingCart,     // Kebutuhan Harian
    Baby,             // Ibu, Bayi & Mainan
    Bike,             // Olahraga & Otomotif
    Zap,              // Produk Digital
    Plane,            // Perjalanan & Hiburan
    type LucideIcon
} from 'lucide-react';

export interface CategoryIconMap {
    [key: string]: LucideIcon;
}

export const categoryIcons: CategoryIconMap = {
    'kuliner': UtensilsCrossed,
    'kuliner & f&b': UtensilsCrossed,
    'fashion & aksesoris': Shirt,
    'fashion': Shirt,
    'elektronik & gadget': Laptop,
    'kecantikan & kesehatan': Heart,
    'peralatan rumah tangga (home & living)': Home,
    'kebutuhan harian (groceries & fmcg)': ShoppingCart,
    'ibu, bayi & mainan': Baby,
    'olahraga & otomotif': Bike,
    'hobi, buku & alat tulis': BookOpen,
    'produk digital (billings & top-up)': Zap,
    'perjalanan & hiburan': Plane,
    'kerajinan': Palette,
    'kerajinan tangan': Palette,
    'pertanian': Sprout,
    'entertainment': Music,
};

// Helper function to get category icon
export const getCategoryIcon = (category: string): LucideIcon => {
    const normalizedCategory = category?.toLowerCase().trim() || '';
    return categoryIcons[normalizedCategory] || UtensilsCrossed; // Default icon
};
