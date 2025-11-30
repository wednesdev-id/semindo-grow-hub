import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Create Roles
    const roles = [
        { name: 'umkm', displayName: 'UMKM', description: 'UMKM Business Owner' },
        { name: 'admin', displayName: 'Administrator', description: 'System Administrator' },
        { name: 'konsultan', displayName: 'Konsultan', description: 'Business Consultant' },
        { name: 'finance_partner', displayName: 'Finance Partner', description: 'Financing Partner' },
        { name: 'ecosystem_partner', displayName: 'Ecosystem Partner', description: 'Ecosystem Partner' },
    ]

    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        })
    }

    // 2. Create Permissions
    const permissions = [
        { name: 'take-assessment', displayName: 'Take Assessment', description: 'Can take self-assessment' },
        { name: 'view-own-assessment', displayName: 'View Own Assessment', description: 'Can view own assessment results' },
        { name: 'view-all-assessments', displayName: 'View All Assessments', description: 'Can view all assessments' },
        { name: 'manage-users', displayName: 'Manage Users', description: 'Can manage user accounts' },
        { name: 'access-lms', displayName: 'Access LMS', description: 'Can access learning materials' },
        { name: 'manage-content', displayName: 'Manage Content', description: 'Can manage platform content' },
    ]

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { name: permission.name },
            update: {},
            create: permission,
        })
    }

    // 3. Assign Permissions to Roles
    // UMKM Role
    const umkmRole = await prisma.role.findUnique({ where: { name: 'umkm' } })
    const umkmPermissions = ['take-assessment', 'view-own-assessment', 'access-lms']

    if (umkmRole) {
        for (const permName of umkmPermissions) {
            const permission = await prisma.permission.findUnique({ where: { name: permName } })
            if (permission) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: umkmRole.id,
                            permissionId: permission.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: umkmRole.id,
                        permissionId: permission.id,
                    },
                })
            }
        }
    }

    // Admin Role (All permissions)
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } })
    if (adminRole) {
        const allPermissions = await prisma.permission.findMany()
        for (const permission of allPermissions) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: adminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            })
        }
    }

    // 4. Create Assessment Templates & Questions
    const generalTemplate = await prisma.assessmentTemplate.upsert({
        where: { id: 'default-template' }, // Use a fixed ID for simplicity in seed
        update: {},
        create: {
            id: 'default-template',
            title: 'Self-Assessment UMKM Dasar',
            description: 'Evaluasi komprehensif untuk mengukur kesiapan dan level UMKM Anda.',
            category: 'General',
            isActive: true
        }
    })

    // Create Categories
    const categories = [
        { name: 'Keuangan', weight: 1.2 },
        { name: 'Pemasaran', weight: 1.1 },
        { name: 'Operasional', weight: 1.0 },
        { name: 'SDM', weight: 1.0 },
        { name: 'Legalitas', weight: 1.0 }
    ]

    const categoryMap = new Map()

    for (const cat of categories) {
        const createdCat = await prisma.assessmentCategory.create({
            data: {
                name: cat.name,
                weight: cat.weight
            }
        })
        categoryMap.set(cat.name, createdCat.id)
    }

    // Create Questions
    const questions = [
        {
            text: 'Apakah Anda memiliki laporan keuangan yang tercatat rapi?',
            type: 'multiple_choice',
            category: 'Keuangan',
            weight: 1.2,
            options: {
                options: [
                    { label: 'Belum ada', value: 1 },
                    { label: 'Hanya catatan kas masuk/keluar', value: 2 },
                    { label: 'Ada buku kas umum', value: 3 },
                    { label: 'Laporan laba rugi sederhana', value: 4 },
                    { label: 'Laporan keuangan lengkap (Neraca, Laba Rugi, Arus Kas)', value: 5 }
                ]
            }
        },
        {
            text: 'Berapa omzet rata-rata bulanan usaha Anda?',
            type: 'multiple_choice',
            category: 'Keuangan',
            weight: 1.0,
            options: {
                options: [
                    { label: '< Rp 5 Juta', value: 1 },
                    { label: 'Rp 5 - 15 Juta', value: 2 },
                    { label: 'Rp 15 - 50 Juta', value: 3 },
                    { label: 'Rp 50 - 300 Juta', value: 4 },
                    { label: '> Rp 300 Juta', value: 5 }
                ]
            }
        },
        {
            text: 'Apakah usaha Anda sudah memiliki izin usaha (NIB)?',
            type: 'boolean',
            category: 'Legalitas',
            weight: 1.5,
            options: {
                options: [
                    { label: 'Belum', value: 1 },
                    { label: 'Sudah', value: 5 }
                ]
            }
        },
        {
            text: 'Bagaimana strategi pemasaran yang Anda lakukan saat ini?',
            type: 'multiple_choice',
            category: 'Pemasaran',
            weight: 1.1,
            options: {
                options: [
                    { label: 'Hanya dari mulut ke mulut', value: 1 },
                    { label: 'Menggunakan media sosial pribadi', value: 2 },
                    { label: 'Memiliki akun media sosial khusus bisnis', value: 3 },
                    { label: 'Menggunakan iklan berbayar (Ads)', value: 4 },
                    { label: 'Memiliki tim pemasaran khusus dan strategi omnichannel', value: 5 }
                ]
            }
        },
        {
            text: 'Berapa jumlah karyawan tetap yang Anda miliki?',
            type: 'multiple_choice',
            category: 'SDM',
            weight: 1.0,
            options: {
                options: [
                    { label: 'Tidak ada (dikerjakan sendiri)', value: 1 },
                    { label: '1 - 2 orang', value: 2 },
                    { label: '3 - 5 orang', value: 3 },
                    { label: '6 - 10 orang', value: 4 },
                    { label: '> 10 orang', value: 5 }
                ]
            }
        }
    ]

    let order = 1
    for (const q of questions) {
        await prisma.assessmentQuestion.create({
            data: {
                templateId: generalTemplate.id,
                categoryId: categoryMap.get(q.category),
                text: q.text,
                type: q.type,
                weight: q.weight,
                options: q.options,
                order: order++
            }
        })
    }

    // 5. Create Recommendation Rules
    const rules = [
        {
            templateId: generalTemplate.id,
            categoryId: categoryMap.get('Keuangan'),
            minScore: 0,
            maxScore: 40,
            title: 'Mulai Pencatatan Keuangan Dasar',
            description: 'Keuangan adalah jantung bisnis. Mulailah dengan mencatat arus kas masuk dan keluar secara disiplin.',
            priority: 'high',
            actionItems: [
                'Siapkan buku kas khusus bisnis (terpisah dari pribadi)',
                'Catat setiap pemasukan dan pengeluaran harian',
                'Simpan semua nota dan kuitansi'
            ],
            resources: [
                { title: 'Template Excel Arus Kas Sederhana', type: 'tool', url: '/resources/cashflow-template' },
                { title: 'Video: Cara Memisahkan Keuangan Bisnis & Pribadi', type: 'video', url: '/lms/finance-basics' }
            ]
        },
        {
            templateId: generalTemplate.id,
            categoryId: categoryMap.get('Keuangan'),
            minScore: 41,
            maxScore: 70,
            title: 'Tingkatkan Analisis Laporan Keuangan',
            description: 'Anda sudah mencatat, sekarang saatnya menganalisis untuk pengambilan keputusan yang lebih baik.',
            priority: 'medium',
            actionItems: [
                'Buat laporan Laba Rugi bulanan',
                'Analisis margin keuntungan per produk',
                'Mulai buat anggaran (budgeting) bulanan'
            ],
            resources: [
                { title: 'Panduan Membaca Laporan Laba Rugi', type: 'article', url: '/lms/profit-loss-guide' }
            ]
        },
        {
            templateId: generalTemplate.id,
            categoryId: categoryMap.get('Pemasaran'),
            minScore: 0,
            maxScore: 50,
            title: 'Bangun Kehadiran Digital',
            description: 'Di era digital, bisnis yang tidak terlihat online akan sulit berkembang.',
            priority: 'high',
            actionItems: [
                'Buat akun Google My Business agar muncul di Maps',
                'Buat akun media sosial (Instagram/Facebook) khusus bisnis',
                'Posting foto produk yang menarik minimal 3x seminggu'
            ],
            resources: [
                { title: 'Tutorial Google My Business', type: 'video', url: '/lms/gmb-tutorial' },
                { title: 'Ide Konten Media Sosial untuk UMKM', type: 'article', url: '/lms/content-ideas' }
            ]
        },
        {
            templateId: generalTemplate.id,
            categoryId: categoryMap.get('Legalitas'),
            minScore: 0,
            maxScore: 100,
            title: 'Urus Izin Usaha (NIB)',
            description: 'Legalitas adalah fondasi keamanan bisnis dan syarat mengakses bantuan pemerintah/bank.',
            priority: 'high',
            actionItems: [
                'Siapkan KTP dan NPWP',
                'Daftar akun di oss.go.id',
                'Terbitkan NIB (Nomor Induk Berusaha)'
            ],
            resources: [
                { title: 'Panduan Daftar OSS', type: 'video', url: '/lms/oss-guide' }
            ]
        }
    ]

    for (const rule of rules) {
        await prisma.recommendationRule.create({
            data: {
                templateId: rule.templateId,
                categoryId: rule.categoryId,
                minScore: rule.minScore,
                maxScore: rule.maxScore,
                title: rule.title,
                description: rule.description,
                priority: rule.priority,
                actionItems: rule.actionItems,
                resources: rule.resources
            }
        })
    }

    console.log('Seed data inserted successfully')

    // 6. Create Demo User
    const bcrypt = require('bcryptjs')
    // Create demo user with UMKM role
    const demoPassword = await bcrypt.hash("password123", 10);

    const demoUser = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: {
            email: "demo@example.com",
            passwordHash: demoPassword,
            fullName: "Demo UMKM User",
            userRoles: {
                create: {
                    role: {
                        connect: { name: "umkm" }
                    }
                }
            }
        },
    });

    console.log("✅ Demo UMKM user created:", demoUser.email);

    // Create super admin demo user
    const adminPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await prisma.user.upsert({
        where: { email: "admin@semindo.com" },
        update: {},
        create: {
            email: "admin@semindo.com",
            passwordHash: adminPassword,
            fullName: "Super Admin",
            userRoles: {
                create: {
                    role: {
                        connect: { name: "admin" }
                    }
                }
            }
        },
    });

    console.log("✅ Super Admin user created:", adminUser.email);

    console.log("✅ Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
