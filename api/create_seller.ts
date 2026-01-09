
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSeller() {
    const email = 'seller@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Ensure 'seller' role exists
    const sellerRole = await prisma.role.upsert({
        where: { name: 'seller' },
        update: {},
        create: {
            name: 'seller',
            displayName: 'Seller',
            description: 'Marketplace Seller'
        }
    });

    console.log('Role verified:', sellerRole);

    // 2. Upsert User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            isActive: true,
            emailVerified: true
        },
        create: {
            email,
            passwordHash: hashedPassword,
            fullName: 'Seller Account',
            isActive: true, // Ensure active
            emailVerified: true
        }
    });

    console.log('User verified:', user);

    // 3. Assign Role if not exists
    const userRole = await prisma.userRole.findUnique({
        where: {
            userId_roleId: {
                userId: user.id,
                roleId: sellerRole.id
            }
        }
    });

    if (!userRole) {
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: sellerRole.id
            }
        });
        console.log('Role assigned to user.');
    } else {
        console.log('Role already assigned.');
    }

    // 4. Create Store for this seller (required for dashboard)
    const store = await prisma.store.findUnique({
        where: { userId: user.id } // userId is unique
    });

    if (!store) {
        await prisma.store.create({
            data: {
                userId: user.id,
                name: 'Seller Official Store',
                slug: 'seller-official-store',
                description: 'Official store for testing',
                isActive: true
            }
        });
        console.log('Store created for seller.');
    } else {
        console.log('Store already exists.');
    }

}

createSeller()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
