
import 'dotenv/config';
import { prisma } from '../src/lib/prisma'; // Use shared instance
import * as bcrypt from 'bcryptjs';

// Removed local new PrismaClient()

// Initial Coordinate Centers for randomness
const LOCATIONS = [
    { city: 'Jakarta', province: 'DKI Jakarta', lat: -6.2088, lng: 106.8456 },
    { city: 'Bandung', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
    { city: 'Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
    { city: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { city: 'Medan', province: 'Sumatera Utara', lat: 3.5952, lng: 98.6722 },
    { city: 'Makassar', province: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4328 },
    { city: 'Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126 },
    { city: 'Semarang', province: 'Jawa Tengah', lat: -6.9667, lng: 110.4167 },
    { city: 'Palembang', province: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754 },
    { city: 'Balikpapan', province: 'Kalimantan Timur', lat: -1.2379, lng: 116.8529 },
];

const SEGMENTATIONS = ['Pemula', 'Madya', 'Utama'];
const SECTORS = ['Kuliner', 'Fashion', 'Craft', 'Agribisnis', 'Jasa', 'Teknologi'];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomLocation() {
    const base = getRandomItem(LOCATIONS);
    // Add small random variation to lat/lng (approx 5-10km radius)
    const latVariation = (Math.random() - 0.5) * 0.1;
    const lngVariation = (Math.random() - 0.5) * 0.1;

    return {
        ...base,
        lat: base.lat + latVariation,
        lng: base.lng + lngVariation
    };
}

async function main() {
    console.log('🚀 Starting seed for 100 UMKM users...');

    const umkmRole = await prisma.role.findUnique({ where: { name: 'umkm' } });
    if (!umkmRole) {
        throw new Error('Role "umkm" not found. Please run main seed first.');
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    const usersToCreate = [];
    const profilesToCreate = [];

    for (let i = 1; i <= 100; i++) {
        const email = `umkm.test.${i}@semindo.com`;
        const name = `UMKM Test User ${i}`;
        const businessName = `Usaha Berkah ${i}`;
        const location = getRandomLocation();
        const sector = getRandomItem(SECTORS);
        const segmentation = getRandomItem(SEGMENTATIONS);

        // We will create users sequentially or in batch if possible. 
        // Prisma `createMany` does not support nested relations easily for different data.
        // So we loop.

        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    fullName: name,
                    isActive: true, // Auto active
                    emailVerified: true,
                    userRoles: {
                        create: {
                            roleId: umkmRole.id
                        }
                    },
                    umkmProfiles: {
                        create: {
                            businessName,
                            ownerName: name,
                            sector,
                            segmentation,
                            // Address info
                            address: `Jl. Contoh No. ${i}, ${location.city}`,
                            city: location.city,
                            province: location.province,
                            postalCode: '10000',
                            // Geo Location
                            location: {
                                lat: location.lat,
                                lng: location.lng
                            },
                            // Financials
                            turnover: Math.floor(Math.random() * 500_000_000) + 10_000_000, // 10jt - 500jt
                            employees: Math.floor(Math.random() * 20) + 1,
                            assets: Math.floor(Math.random() * 1_000_000_000),
                            // Status
                            status: 'verified',
                        }
                    }
                }
            });
            process.stdout.write('.'); // Progress indicator
        } catch (error) {
            console.error(`\nFailed to create user ${email}:`, error);
        }
    }

    console.log('\n✅ Successfully created 100 UMKM users.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
