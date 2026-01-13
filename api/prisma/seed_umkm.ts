import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed UMKM Profile data for testing Region Mapping and Segmentation
 * Creates 30 UMKM per province (38 provinces = 1140 records)
 */

// All 38 provinces in Indonesia
const PROVINCES = [
    'Aceh',
    'Sumatera Utara',
    'Sumatera Barat',
    'Riau',
    'Kepulauan Riau',
    'Jambi',
    'Sumatera Selatan',
    'Bangka Belitung',
    'Bengkulu',
    'Lampung',
    'DKI Jakarta',
    'Jawa Barat',
    'Banten',
    'Jawa Tengah',
    'DI Yogyakarta',
    'Jawa Timur',
    'Bali',
    'Nusa Tenggara Barat',
    'Nusa Tenggara Timur',
    'Kalimantan Barat',
    'Kalimantan Tengah',
    'Kalimantan Selatan',
    'Kalimantan Timur',
    'Kalimantan Utara',
    'Sulawesi Utara',
    'Gorontalo',
    'Sulawesi Tengah',
    'Sulawesi Barat',
    'Sulawesi Selatan',
    'Sulawesi Tenggara',
    'Maluku',
    'Maluku Utara',
    'Papua',
    'Papua Barat',
    'Papua Tengah',
    'Papua Pegunungan',
    'Papua Selatan',
    'Papua Barat Daya',
];

// Sample business types
const BUSINESS_TYPES = [
    { name: 'Kuliner', city: 'Kota' },
    { name: 'Kerajinan', city: 'Kabupaten' },
    { name: 'Pertanian', city: 'Kabupaten' },
    { name: 'Fashion', city: 'Kota' },
    { name: 'Jasa', city: 'Kota' },
    { name: 'Perdagangan', city: 'Kota' },
];

// Segmentation criteria (turnover in IDR, assets in IDR)
const SEGMENTATION_PROFILES = [
    {
        segmentation: 'Pemula',
        level: 'Mikro',
        turnover: 100_000_000, // 100 juta
        assets: 30_000_000,
        employees: 3,
    },
    {
        segmentation: 'Madya',
        level: 'Kecil',
        turnover: 800_000_000, // 800 juta
        assets: 200_000_000,
        employees: 15,
    },
    {
        segmentation: 'Utama',
        level: 'Menengah',
        turnover: 5_000_000_000, // 5 milyar
        assets: 1_000_000_000,
        employees: 50,
    },
];

// Indonesian first names
const FIRST_NAMES = [
    'Budi', 'Siti', 'Ahmad', 'Dewi', 'Eko', 'Rina', 'Agus', 'Sri', 'Dedi', 'Ani',
    'Hendra', 'Lina', 'Joko', 'Wati', 'Bambang', 'Ningsih', 'Tono', 'Yanti', 'Irwan', 'Mega',
];

// Indonesian last names
const LAST_NAMES = [
    'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Hidayat', 'Nugroho', 'Sari', 'Putri', 'Lestari', 'Rahayu',
    'Setiawan', 'Kurniawan', 'Suryadi', 'Hartono', 'Susanto', 'Wibowo', 'Prasetyo', 'Handoko', 'Gunawan', 'Sugiarto',
];

// Business name prefixes
const BUSINESS_PREFIXES = [
    'CV', 'UD', 'Toko', 'Warung', 'Kedai', 'Rumah', 'Bengkel', 'Salon', 'Butik', 'Galeri',
];

// Business name suffixes by type
const BUSINESS_SUFFIXES: Record<string, string[]> = {
    'Kuliner': ['Sederhana', 'Barokah', 'Berkah', 'Jaya', 'Makmur', 'Maju', 'Sejahtera', 'Abadi'],
    'Kerajinan': ['Kreatif', 'Handmade', 'Art', 'Craft', 'Karya', 'Cipta', 'Kreasi', 'Seni'],
    'Pertanian': ['Tani', 'Agro', 'Subur', 'Hijau', 'Harapan', 'Mandiri', 'Sejahtera', 'Makmur'],
    'Fashion': ['Mode', 'Style', 'Trend', 'Busana', 'Gaya', 'Elegan', 'Modis', 'Cantik'],
    'Jasa': ['Prima', 'Profesional', 'Andalan', 'Terpercaya', 'Mandiri', 'Utama', 'Sukses', 'Mitra'],
    'Perdagangan': ['Niaga', 'Dagang', 'Grosir', 'Distributor', 'Supplier', 'Mitra', 'Jaya', 'Mandiri'],
};

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateBusinessName(type: string, index: number): string {
    const prefix = getRandomElement(BUSINESS_PREFIXES);
    const suffix = getRandomElement(BUSINESS_SUFFIXES[type] || BUSINESS_SUFFIXES['Perdagangan']);
    return `${prefix} ${suffix} ${index}`;
}

function generateOwnerName(): string {
    return `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
}

function generatePhone(): string {
    const prefix = ['081', '082', '083', '085', '087', '088', '089'];
    return `${getRandomElement(prefix)}${Math.floor(100000000 + Math.random() * 900000000)}`;
}

function generateEmail(ownerName: string, index: number): string {
    const name = ownerName.toLowerCase().replace(' ', '.');
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'mail.com'];
    return `${name}${index}@${getRandomElement(domains)}`;
}

async function seedUMKM() {
    console.log('🌱 Seeding UMKM Profile data...');
    const UMKM_PER_PROVINCE = 30;
    console.log(`📍 Creating ${UMKM_PER_PROVINCE} UMKM per ${PROVINCES.length} provinces = ${PROVINCES.length * UMKM_PER_PROVINCE} records`);

    // Ensure 'umkm' role exists
    let umkmRole = await prisma.role.findUnique({ where: { name: 'umkm' } });
    if (!umkmRole) {
        console.log('📝 Creating umkm role...');
        umkmRole = await prisma.role.create({
            data: {
                name: 'umkm',
                displayName: 'UMKM',
                description: 'Role for UMKM owners',
            },
        });
    }

    let index = 0;
    let created = 0;
    let skipped = 0;

    for (const province of PROVINCES) {
        // Create 30 UMKM per province
        for (let i = 0; i < UMKM_PER_PROVINCE; i++) {
            index++;
            const segProfile = SEGMENTATION_PROFILES[i % SEGMENTATION_PROFILES.length]; // Distribute evenly
            const businessType = getRandomElement(BUSINESS_TYPES);
            const ownerName = generateOwnerName();
            const email = generateEmail(ownerName, index);

            // Add some randomness to financial data
            const turnoverVariation = 0.5 + Math.random(); // 50% to 150%
            const assetVariation = 0.5 + Math.random();
            const employeeVariation = 0.5 + Math.random();

            try {
                // Check if user with this email already exists
                let user = await prisma.user.findUnique({
                    where: { email },
                    include: { userRoles: true }
                });

                if (!user) {
                    // Create a dummy user for this UMKM with 'umkm' role
                    user = await prisma.user.create({
                        data: {
                            email,
                            passwordHash: '$2a$10$dummy.hash.for.seed.data.only',
                            fullName: ownerName,
                            userRoles: {
                                create: {
                                    roleId: umkmRole!.id
                                }
                            }
                        },
                        include: { userRoles: true }
                    });
                } else {
                    // Ensure existing user has 'umkm' role
                    const hasRole = user.userRoles.some(ur => ur.roleId === umkmRole!.id);
                    if (!hasRole) {
                        await prisma.userRole.create({
                            data: {
                                userId: user.id,
                                roleId: umkmRole!.id
                            }
                        });
                    }
                }

                // Check if UMKM profile already exists for this user (use findFirst for 1:N relation)
                const existingProfile = await prisma.uMKMProfile.findFirst({
                    where: { userId: user.id },
                });

                if (existingProfile) {
                    skipped++;
                    continue;
                }

                // Create UMKM Profile
                await prisma.uMKMProfile.create({
                    data: {
                        userId: user.id,
                        businessName: generateBusinessName(businessType.name, index),
                        ownerName,
                        // description removed as it's not in schema
                        province,
                        city: `${businessType.city} ${province.split(' ').pop()}`, // Crude but works
                        district: `Kecamatan ${(i + 1)}`,
                        village: `Kelurahan ${(i + 1)}`,
                        postalCode: `${Math.floor(10000 + Math.random() * 90000)}`,
                        address: `Jl. ${getRandomElement(FIRST_NAMES)} No. ${index}`,
                        sector: businessType.name,
                        turnover: Math.round(segProfile.turnover * turnoverVariation),
                        assets: Math.round(segProfile.assets * assetVariation),
                        employees: Math.max(1, Math.round(segProfile.employees * employeeVariation)),
                        segmentation: segProfile.segmentation,
                        level: segProfile.level,
                        segmentationReason: `Auto-calculated based on turnover and assets`,
                        status: Math.random() > 0.3 ? 'verified' : 'pending',
                        foundedYear: 2015 + Math.floor(Math.random() * 10),
                        website: Math.random() > 0.7 ? `https://${ownerName.toLowerCase().replace(' ', '')}.com` : null,
                    },
                });

                created++;

                if (created % 50 === 0) {
                    console.log(`   Created ${created} UMKM profiles...`);
                }
            } catch (error: any) {
                console.log(`⚠️ Error for ${province}: ${error.message?.substring(0, 80)}`);
                skipped++;
            }
        }
    }

    console.log(`\n✅ Created ${created} UMKM profiles successfully!`);
    console.log(`⏭️ Skipped ${skipped} (already exist or error)`);

    // Show distribution
    const stats = await prisma.uMKMProfile.groupBy({
        by: ['segmentation'],
        _count: { segmentation: true },
    });

    console.log('\n📈 Segmentation Distribution:');
    stats.forEach(s => {
        console.log(`   ${s.segmentation || 'Unknown'}: ${s._count.segmentation}`);
    });

    const provinceStats = await prisma.uMKMProfile.groupBy({
        by: ['province'],
        _count: { province: true },
        orderBy: { _count: { province: 'desc' } },
        take: 10,
    });

    console.log(`\n📍 Top 10 Provinces:`);
    provinceStats.forEach(p => {
        console.log(`   ${p.province}: ${p._count.province}`);
    });
}

async function main() {
    try {
        await seedUMKM();
    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
