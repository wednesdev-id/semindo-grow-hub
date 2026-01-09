export const MARKETPLACE_CATEGORIES = [
    "Fashion & Aksesoris",
    "Elektronik & Gadget",
    "Kecantikan & Kesehatan",
    "Peralatan Rumah Tangga (Home & Living)",
    "Kebutuhan Harian (Groceries & FMCG)",
    "Ibu, Bayi & Mainan",
    "Olahraga & Otomotif",
    "Hobi, Buku & Alat Tulis",
    "Produk Digital (Billings & Top-up)",
    "Perjalanan & Hiburan",
    "Kuliner"
] as const;

export type MarketplaceCategory = typeof MARKETPLACE_CATEGORIES[number];
