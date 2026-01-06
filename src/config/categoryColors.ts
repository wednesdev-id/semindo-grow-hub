// Category Color Palette for Marketplace
// Use this for dynamic badge coloring based on category

export const categoryColors = {
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

    // Fashion & Tekstil
    'fashion': {
        text: '#EC4899',      // Pink
        background: '#FCE7F3', // Light Pink
        stroke: '#EC4899'
    },
    'fashion & tekstil': {
        text: '#EC4899',
        background: '#FCE7F3',
        stroke: '#EC4899'
    },

    // Teknologi & Digital
    'teknologi': {
        text: '#3B82F6',      // Blue
        background: '#DBEAFE', // Light Blue
        stroke: '#3B82F6'
    },
    'teknologi & digital': {
        text: '#3B82F6',
        background: '#DBEAFE',
        stroke: '#3B82F6'
    },

    // Kerajinan Tangan
    'kerajinan': {
        text: '#8B5CF6',      // Purple
        background: '#EDE9FE', // Light Purple
        stroke: '#8B5CF6'
    },
    'kerajinan tangan': {
        text: '#8B5CF6',
        background: '#EDE9FE',
        stroke: '#8B5CF6'
    },

    // Kesehatan & Kecantikan
    'kesehatan': {
        text: '#10B981',      // Green
        background: '#D1FAE5', // Light Green
        stroke: '#10B981'
    },
    'kesehatan & kecantikan': {
        text: '#10B981',
        background: '#D1FAE5',
        stroke: '#10B981'
    },
    'kecantikan': {
        text: '#10B981',
        background: '#D1FAE5',
        stroke: '#10B981'
    },

    // Pertanian
    'pertanian': {
        text: '#84CC16',      // Lime
        background: '#ECFCCB', // Light Lime
        stroke: '#84CC16'
    },

    // Pendidikan
    'pendidikan': {
        text: '#0EA5E9',      // Sky Blue
        background: '#E0F2FE', // Light Sky
        stroke: '#0EA5E9'
    },

    // Entertainment
    'entertainment': {
        text: '#F59E0B',      // Amber
        background: '#FEF3C7', // Light Amber
        stroke: '#F59E0B'
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
