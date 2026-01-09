import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedExpertise() {
    console.log('🌱 Seeding expertise categories...');

    const expertiseCategories = [
        {
            name: 'Financial Management',
            slug: 'financial-management',
            description: 'Expertise in financial planning, accounting, bookkeeping, and financial analysis',
            icon: 'DollarSign',
            categoryGroup: 'Business'
        },
        {
            name: 'Marketing & Branding',
            slug: 'marketing-branding',
            description: 'Digital marketing, brand strategy, social media, and customer acquisition',
            icon: 'TrendingUp',
            categoryGroup: 'Business'
        },
        {
            name: 'Legal & Compliance',
            slug: 'legal-compliance',
            description: 'Business law, regulations, permits, certifications, and legal compliance',
            icon: 'Scale',
            categoryGroup: 'Business'
        },
        {
            name: 'Operations Management',
            slug: 'operations-management',
            description: 'Production, supply chain, inventory management, and operational efficiency',
            icon: 'Briefcase',
            categoryGroup: 'Operations'
        },
        {
            name: 'Digital Transformation',
            slug: 'digital-transformation',
            description: 'Technology adoption, digitalization, automation, and digital strategy',
            icon: 'Laptop',
            categoryGroup: 'Technology'
        },
        {
            name: 'Export & International Trade',
            slug: 'export-trade',
            description: 'Export procedures, international markets, trade regulations, and global expansion',
            icon: 'Globe',
            categoryGroup: 'Business'
        },
        {
            name: 'Human Resources',
            slug: 'human-resources',
            description: 'Recruitment, training, employee management, and organizational development',
            icon: 'Users',
            categoryGroup: 'Operations'
        },
        {
            name: 'Product Development',
            slug: 'product-development',
            description: 'New product creation, R&D, product innovation, and market testing',
            icon: 'Package',
            categoryGroup: 'Innovation'
        },
        {
            name: 'Sales Strategy',
            slug: 'sales-strategy',
            description: 'Sales planning, customer relations, business development, and revenue growth',
            icon: 'Target',
            categoryGroup: 'Business'
        },
        {
            name: 'Business Strategy',
            slug: 'business-strategy',
            description: 'Strategic planning, business modeling, competitive analysis, and growth planning',
            icon: 'TrendingUp',
            categoryGroup: 'Strategy'
        },
        {
            name: 'Supply Chain Management',
            slug: 'supply-chain',
            description: 'Logistics, procurement, distribution, and vendor management',
            icon: 'Truck',
            categoryGroup: 'Operations'
        },
        {
            name: 'Customer Service',
            slug: 'customer-service',
            description: 'Customer support, satisfaction, retention, and service excellence',
            icon: 'Headphones',
            categoryGroup: 'Business'
        }
    ];

    for (const category of expertiseCategories) {
        await prisma.expertiseCategory.upsert({
            where: { slug: category.slug },
            update: category,
            create: category
        });
    }

    console.log(`✅ Created ${expertiseCategories.length} expertise categories`);
}

// Run if called directly
if (require.main === module) {
    seedExpertise()
        .then(() => {
            prisma.$disconnect();
        })
        .catch((error) => {
            console.error('Error seeding expertise:', error);
            prisma.$disconnect();
            process.exit(1);
        });
}
