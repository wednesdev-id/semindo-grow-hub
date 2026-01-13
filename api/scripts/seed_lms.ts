import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding LMS data...');

    // Find an admin user to be the author
    const author = await prisma.user.findFirst();

    if (!author) {
        console.error('No user found to assign as author');
        return;
    }

    const courses = [
        {
            title: 'Digital Marketing Mastery',
            slug: 'digital-marketing-mastery',
            description: 'Pelajari strategi pemasaran digital terlengkap untuk UMKM, mulai dari social media hingga SEO.',
            level: 'beginner',
            category: 'Marketing',
            price: 0,
            isPublished: true,
            authorId: author.id,
            thumbnailUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        },
        {
            title: 'Manajemen Keuangan Dasar',
            slug: 'manajemen-keuangan-dasar',
            description: 'Panduan praktis mengelola keuangan usaha, arus kas, dan laporan laba rugi sederhana.',
            level: 'beginner',
            category: 'Finance',
            price: 150000,
            isPublished: true,
            authorId: author.id,
            thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        },
        {
            title: 'Strategi Ekspor untuk Pemula',
            slug: 'strategi-ekspor-pemula',
            description: 'Langkah demi langkah memulai ekspor produk UMKM ke pasar global.',
            level: 'intermediate',
            category: 'Operations',
            price: 500000,
            isPublished: true,
            authorId: author.id,
            thumbnailUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        },
    ];

    for (const courseData of courses) {
        const course = await prisma.course.upsert({
            where: { slug: courseData.slug },
            update: {},
            create: courseData,
        });
        console.log(`Created course: ${course.title}`);

        // Create modules for each course
        await prisma.module.create({
            data: {
                courseId: course.id,
                title: 'Pendahuluan',
                order: 1,
                lessons: {
                    create: [
                        {
                            title: 'Selamat Datang',
                            slug: `${course.slug}-welcome`,
                            type: 'video',
                            duration: 5,
                            order: 1,
                            isFree: true,
                        },
                        {
                            title: 'Overview Materi',
                            slug: `${course.slug}-overview`,
                            type: 'article',
                            duration: 10,
                            order: 2,
                        },
                    ],
                },
            },
        });
    }

    console.log('LMS Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
