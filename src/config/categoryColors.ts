// Category Color Palette for Marketplace
// Use this for dynamic badge coloring based on category

export const categoryColors = {
    // Fashion & Aksesoris
    'fashion & aksesoris': {
        text: '#EC4899',      // Pink
        background: '#FCE7F3', // Light Pink
        stroke: '#EC4899'
    },
    'fashion': {
        text: '#EC4899',
        background: '#FCE7F3',
        stroke: '#EC4899'
    },

    // Elektronik & Gadget
    'elektronik & gadget': {
        text: '#3B82F6',      // Blue
        background: '#DBEAFE', // Light Blue
        stroke: '#3B82F6'
    },

    // Kecantikan & Kesehatan
    'kecantikan & kesehatan': {
        text: '#10B981',      // Green
        background: '#D1FAE5', // Light Green
        stroke: '#10B981'
    },

    // Peralatan Rumah Tangga (Home & Living)
    'peralatan rumah tangga (home & living)': {
        text: '#8B5CF6',      // Purple
        background: '#EDE9FE', // Light Purple
        stroke: '#8B5CF6'
    },

    // Kebutuhan Harian (Groceries & FMCG)
    'kebutuhan harian (groceries & fmcg)': {
        text: '#F59E0B',      // Amber
        background: '#FEF3C7', // Light Amber
        stroke: '#F59E0B'
    },

    // Ibu, Bayi & Mainan
    'ibu, bayi & mainan': {
        text: '#F43F5E',      // Rose
        background: '#FFE4E6', // Light Rose
        stroke: '#F43F5E'
    },

    // Olahraga & Otomotif
    'olahraga & otomotif': {
        text: '#6366F1',      // Indigo
        background: '#E0E7FF', // Light Indigo
        stroke: '#6366F1'
    },

    // Hobi, Buku & Alat Tulis
    'hobi, buku & alat tulis': {
        text: '#06B6D4',      // Cyan
        background: '#CFFAFE', // Light Cyan
        stroke: '#06B6D4'
    },

    // Produk Digital (Billings & Top-up)
    'produk digital (billings & top-up)': {
        text: '#84CC16',      // Lime
        background: '#ECFCCB', // Light Lime
        stroke: '#84CC16'
    },

    // Perjalanan & Hiburan
    'perjalanan & hiburan': {
        text: '#0EA5E9',      // Sky Blue
        background: '#E0F2FE', // Light Sky
        stroke: '#0EA5E9'
    },

    // Kuliner & F&B
    'kuliner': {
        text: '#F97316',      // Orange
        background: '#FFF1E6', // Light Orange
        stroke: '#F97316'
    },
    'kuliner & f&b': {
        text: '#F97316',
        background: '#FFF1E6',
        stroke: '#F97316'
    },

    // Kerajinan Tangan
    'kerajinan': {
        text: '#D946EF',      // Fuchsia
        background: '#FAE8FF', // Light Fuchsia
        stroke: '#D946EF'
    },
    'kerajinan tangan': {
        text: '#D946EF',
        background: '#FAE8FF',
        stroke: '#D946EF'
    },

    // Pertanian
    'pertanian': {
        text: '#14B8A6',      // Teal
        background: '#F0FDFA', // Light Teal
        stroke: '#14B8A6'
    },

    // Default fallback
    'default': {
        text: '#6B7280',      // Gray
        background: '#F3F4F6', // Light Gray
        stroke: '#6B7280'
    }
};

// Helper function to get category color
export const getCategoryColor = (category: string) => {
    const normalizedCategory = category?.toLowerCase().trim() || '';
    return categoryColors[normalizedCategory] || categoryColors.default;
};

// Usage example:
// const colors = getCategoryColor('Kuliner');
// <Badge style={{ color: colors.text, backgroundColor: colors.background, borderColor: colors.stroke }}>
//   {category}
// </Badge>
