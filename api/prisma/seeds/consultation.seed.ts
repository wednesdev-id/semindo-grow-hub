import { PrismaClient } from '../generated/client'

export async function seedConsultationTypes(prisma: any) {
    console.log('🔧 Seeding Consultation Types...')

    const consultationTypes = [
        {
            name: 'Marketing & Branding',
            slug: 'marketing-branding',
            description: 'Konsultasi strategi pemasaran digital, branding, dan promosi UMKM',
            category: 'Business Development',
            tags: ['marketing', 'digital', 'branding', 'social-media'],
            basePrice: 500000,
            duration: 60,
            isPremium: false,
            requiresPrep: true,
        },
        {
            name: 'Financial Planning',
            slug: 'financial-planning',
            description: 'Konsultasi perencanaan keuangan, cash flow, dan analisis profitabilitas',
            category: 'Finance',
            tags: ['finance', 'accounting', 'budgeting', 'cash-flow'],
            basePrice: 750000,
            duration: 90,
            isPremium: true,
            requiresPrep: true,
        },
        {
            name: 'Legal & Licensing',
            slug: 'legal-licensing',
            description: 'Konsultasi perizinan usaha, legalitas, dan perlindungan hukum',
            category: 'Legal',
            tags: ['legal', 'licensing', 'permits', 'compliance'],
            basePrice: 600000,
            duration: 60,
            isPremium: false,
            requiresPrep: false,
        },
        {
            name: 'Business Strategy',
            slug: 'business-strategy',
            description: 'Konsultasi strategi bisnis, ekspansi pasar, dan pengembangan produk',
            category: 'Business Development',
            tags: ['strategy', 'planning', 'market-research', 'expansion'],
            basePrice: 800000,
            duration: 120,
            isPremium: true,
            requiresPrep: true,
        },
        {
            name: 'Digital Transformation',
            slug: 'digital-transformation',
            description: 'Konsultasi transformasi digital, e-commerce, dan teknologi untuk UMKM',
            category: 'Technology',
            tags: ['technology', 'digital', 'e-commerce', 'automation'],
            basePrice: 650000,
            duration: 90,
            isPremium: false,
            requiresPrep: false,
        },
        {
            name: 'Export & International Trade',
            slug: 'export-trade',
            description: 'Konsultasi ekspor, perdagangan internasional, dan dokumentasi',
            category: 'Export',
            tags: ['export', 'international', 'trade', 'documentation'],
            basePrice: 900000,
            duration: 90,
            isPremium: true,
            requiresPrep: true,
        },
        {
            name: 'HR & Team Management',
            slug: 'hr-team-management',
            description: 'Konsultasi manajemen SDM, rekrutmen, dan pengembangan tim',
            category: 'Human Resources',
            tags: ['hr', 'recruitment', 'training', 'team-building'],
            basePrice: 550000,
            duration: 60,
            isPremium: false,
            requiresPrep: false,
        },
        {
            name: 'Product Development',
            slug: 'product-development',
            description: 'Konsultasi pengembangan produk, inovasi, dan quality control',
            category: 'Product',
            tags: ['product', 'innovation', 'quality', 'development'],
            basePrice: 700000,
            duration: 90,
            isPremium: false,
            requiresPrep: true,
        },
    ]

    for (const type of consultationTypes) {
        await prisma.consultationType.upsert({
            where: { slug: type.slug },
            update: {},
            create: type,
        })
    }

    console.log('✅ Consultation Types seeded successfully!')
}
