import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_HS_CODES = [
    {
        code: "0901.11.00",
        description: "Kopi tidak dipanggang, tidak dikafeinasi",
        tariff: "5%",
        requirements: ["Sertifikat Fitosanitari", "Certificate of Origin"],
        category: "Pertanian"
    },
    {
        code: "6204.62.00",
        description: "Celana panjang wanita dari katun",
        tariff: "12%",
        requirements: ["Certificate of Origin", "Textile Declaration"],
        category: "Tekstil"
    },
    {
        code: "4602.12.00",
        description: "Keranjang dan barang anyaman dari rotan",
        tariff: "8%",
        requirements: ["Phytosanitary Certificate", "CITES Permit"],
        category: "Kerajinan"
    },
    {
        code: "3304.99.00",
        description: "Sediaan kosmetik lainnya",
        tariff: "10%",
        requirements: ["Health Certificate", "BPOM Certificate"],
        category: "Kosmetik"
    }
];

const MOCK_COUNTRIES = [
    {
        name: "Malaysia",
        code: "MY",
        flag: "🇲🇾",
        market: "ASEAN",
        distance: "1,200 km",
        shippingTime: "3-5 hari",
        avgTariff: "0-5%",
        requirements: ["ATIGA Certificate", "Halal Certificate"],
        topProducts: ["Kopi", "Tekstil", "Kerajinan"]
    },
    {
        name: "Singapura",
        code: "SG",
        flag: "🇸🇬",
        market: "ASEAN",
        distance: "900 km",
        shippingTime: "2-4 hari",
        avgTariff: "0%",
        requirements: ["Certificate of Origin", "Health Certificate"],
        topProducts: ["F&B", "Kosmetik", "Elektronik"]
    },
    {
        name: "Jepang",
        code: "JP",
        flag: "🇯🇵",
        market: "Asia Pasifik",
        distance: "5,800 km",
        shippingTime: "7-10 hari",
        avgTariff: "3-8%",
        requirements: ["JAS Organic", "Halal Certificate", "Health Certificate"],
        topProducts: ["Kopi", "Makanan Halal", "Kerajinan"]
    },
    {
        name: "Australia",
        code: "AU",
        flag: "🇦🇺",
        market: "Oceania",
        distance: "4,200 km",
        shippingTime: "5-8 hari",
        avgTariff: "0-5%",
        requirements: ["AQIS Certificate", "Organic Certificate"],
        topProducts: ["Kopi", "Makanan Organik", "Tekstil"]
    }
];

const MOCK_BUYERS = [
    {
        companyName: "Pacific Trading Co.",
        countryCode: "MY",
        category: "F&B Importer",
        products: ["Kopi", "Teh", "Rempah"],
        volume: "50-100 ton/bulan",
        isVerified: true,
        rating: 4.8,
        contactInfo: { email: "contact@pacifictrading.my", phone: "+60 3-2141 1234" }
    },
    {
        companyName: "Asia Craft Import",
        countryCode: "JP",
        category: "Handicraft Distributor",
        products: ["Kerajinan Tangan", "Furniture", "Dekorasi"],
        volume: "1000-5000 pcs/bulan",
        isVerified: true,
        rating: 4.9,
        contactInfo: { email: "info@asiacraft.jp", phone: "+81 3-3580 1234" }
    },
    {
        companyName: "Textile Solutions Ltd",
        countryCode: "AU",
        category: "Fashion Retailer",
        products: ["Batik", "Tekstil", "Fashion"],
        volume: "2000-10000 pcs/bulan",
        isVerified: true,
        rating: 4.7,
        contactInfo: { email: "buying@textilesolutions.au", phone: "+61 2 9231 1234" }
    }
];

async function main() {
    console.log('Start seeding Export Hub data...');

    // Seed HS Codes
    for (const hs of MOCK_HS_CODES) {
        await prisma.exportHSCode.upsert({
            where: { code: hs.code },
            update: {},
            create: hs,
        });
    }
    console.log('Seeded HS Codes');

    // Seed Countries
    for (const country of MOCK_COUNTRIES) {
        await prisma.exportCountry.upsert({
            where: { code: country.code },
            update: {},
            create: country,
        });
    }
    console.log('Seeded Countries');

    // Seed Buyers
    // First clear existing buyers to avoid duplicates if re-running
    await prisma.exportBuyer.deleteMany();

    for (const buyer of MOCK_BUYERS) {
        const country = await prisma.exportCountry.findUnique({ where: { code: buyer.countryCode } });
        if (country) {
            await prisma.exportBuyer.create({
                data: {
                    companyName: buyer.companyName,
                    countryId: country.id,
                    category: buyer.category,
                    products: buyer.products,
                    volume: buyer.volume,
                    isVerified: buyer.isVerified,
                    rating: buyer.rating,
                    contactInfo: buyer.contactInfo,
                }
            });
        }
    }
    console.log('Seeded Buyers');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
