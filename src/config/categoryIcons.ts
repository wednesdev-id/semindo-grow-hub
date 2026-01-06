// Category Icons Mapping
// Maps category names to Lucide React icons

import {
    UtensilsCrossed,  // Kuliner & F&B
    Shirt,            // Fashion & Tekstil
    Laptop,           // Teknologi & Digital
    Palette,          // Kerajinan Tangan
    Heart,            // Kesehatan & Kecantikan
    Sprout,           // Pertanian
    BookOpen,         // Pendidikan
    Music,            // Entertainment
    type LucideIcon
} from 'lucide-react';

export interface CategoryIconMap {
    [key: string]: LucideIcon;
}

export const categoryIcons: CategoryIconMap = {
    'kuliner': UtensilsCrossed,
    'kuliner & f&b': UtensilsCrossed,
    'fashion': Shirt,
    'fashion & tekstil': Shirt,
    'teknologi': Laptop,
    'teknologi & digital': Laptop,
    'kerajinan': Palette,
    'kerajinan tangan': Palette,
    'kesehatan': Heart,
    'kesehatan & kecantikan': Heart,
    'kecantikan': Heart,
    'pertanian': Sprout,
    'pendidikan': BookOpen,
    'entertainment': Music,
};

// Helper function to get category icon
export const getCategoryIcon = (category: string): LucideIcon => {
    const normalizedCategory = category?.toLowerCase().trim() || '';
    return categoryIcons[normalizedCategory] || UtensilsCrossed; // Default icon
};
