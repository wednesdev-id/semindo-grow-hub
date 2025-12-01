import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding community data...');

    // Create Users if not exist (using upsert for safety)
    const user1 = await prisma.user.upsert({
        where: { email: 'sarah@example.com' },
        update: {},
        create: {
            email: 'sarah@example.com',
            fullName: 'Sarah Entrepreneur',
            passwordHash: 'password123', // In real app, this should be hashed
            userRoles: {
                create: {
                    role: {
                        connectOrCreate: {
                            where: { name: 'user' },
                            create: { name: 'user', displayName: 'User' },
                        },
                    },
                },
            },
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'budi@example.com' },
        update: {},
        create: {
            email: 'budi@example.com',
            fullName: 'Budi Eksportir',
            passwordHash: 'password123',
            userRoles: {
                create: {
                    role: {
                        connectOrCreate: {
                            where: { name: 'user' },
                            create: { name: 'user', displayName: 'User' },
                        },
                    },
                },
            },
        },
    });

    // Create Forum Categories
    const categories = [
        {
            id: 'general',
            name: 'Diskusi Umum',
            slug: 'diskusi-umum',
            description: 'Berbagi pengalaman dan tips bisnis UMKM',
            icon: '💬',
        },
        {
            id: 'marketing',
            name: 'Marketing & Promosi',
            slug: 'marketing-promosi',
            description: 'Strategi pemasaran dan branding untuk UMKM',
            icon: '📢',
        },
        {
            id: 'finance',
            name: 'Keuangan & Investasi',
            slug: 'keuangan-investasi',
            description: 'Manajemen keuangan dan akses permodalan',
            icon: '💰',
        },
        {
            id: 'technology',
            name: 'Teknologi & Digital',
            slug: 'teknologi-digital',
            description: 'Digitalisasi dan teknologi untuk UMKM',
            icon: '💻',
        },
        {
            id: 'export',
            name: 'Ekspor & Internasional',
            slug: 'ekspor-internasional',
            description: 'Panduan dan pengalaman ekspor produk',
            icon: '🌍',
        },
        {
            id: 'legal',
            name: 'Legal & Sertifikasi',
            slug: 'legal-sertifikasi',
            description: 'Perizinan, legalitas, dan sertifikasi',
            icon: '⚖️',
        },
    ];

    for (const cat of categories) {
        await prisma.forumCategory.upsert({
            where: { id: cat.id },
            update: {},
            create: cat,
        });
    }

    // Create Threads
    const thread1 = await prisma.forumThread.create({
        data: {
            title: 'Tips Meningkatkan Penjualan Online di Marketplace',
            content: 'Berbagi pengalaman saya meningkatkan penjualan dari 10 juta menjadi 50 juta per bulan di marketplace. Kuncinya adalah foto produk yang menarik dan deskripsi yang jelas.',
            categoryId: 'marketing',
            authorId: user1.id,
            views: 456,
        },
    });

    const thread2 = await prisma.forumThread.create({
        data: {
            title: 'Pengalaman Ekspor Pertama ke Malaysia - Lessons Learned',
            content: 'Setelah 6 bulan persiapan, akhirnya berhasil ekspor produk kerajinan ke Malaysia. Ini yang saya pelajari tentang dokumen dan logistik.',
            categoryId: 'export',
            authorId: user2.id,
            views: 234,
        },
    });

    // Create Posts (Replies)
    await prisma.forumPost.create({
        data: {
            content: 'Wah sangat menginspirasi! Boleh share tips untuk foto produknya kak?',
            threadId: thread1.id,
            authorId: user2.id,
        },
    });

    await prisma.forumPost.create({
        data: {
            content: 'Selamat ya pak Budi! Sukses terus ekspornya.',
            threadId: thread2.id,
            authorId: user1.id,
        },
    });

    // Create Events
    await prisma.event.create({
        data: {
            title: 'Workshop Digital Marketing untuk UMKM',
            description: 'Pelajari strategi digital marketing terkini untuk meningkatkan penjualan UMKM Anda. Materi mencakup SEO, Social Media Marketing, dan Ads.',
            startDate: new Date('2024-02-15T09:00:00Z'),
            endDate: new Date('2024-02-15T16:00:00Z'),
            location: 'Jakarta Convention Center',
            type: 'Workshop',
            maxParticipants: 200,
            organizerId: user1.id,
            bannerUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80',
        },
    });

    await prisma.event.create({
        data: {
            title: 'Expo UMKM Nusantara 2024',
            description: 'Pameran produk UMKM terbesar dengan networking session dan business matching. Temui ribuan pembeli potensial.',
            startDate: new Date('2024-02-20T08:00:00Z'),
            endDate: new Date('2024-02-20T18:00:00Z'),
            location: 'ICE BSD, Tangerang',
            type: 'Exhibition',
            maxParticipants: 500,
            organizerId: user2.id,
            bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        },
    });

    console.log('Seeding community data completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
