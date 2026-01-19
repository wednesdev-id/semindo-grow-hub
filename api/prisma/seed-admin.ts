import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
    console.log('🔐 Creating Super Admin user...');

    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Create or update admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@semindo.com' },
        update: {
            passwordHash,
            fullName: 'Super Admin',
            emailVerified: true,
            isActive: true,
        },
        create: {
            email: 'admin@semindo.com',
            passwordHash,
            fullName: 'Super Admin',
            phone: '+62812345678',
            businessName: 'Semindo Indonesia',
            emailVerified: true,
            isActive: true,
        },
    });

    console.log(`✅ Super Admin user created/updated: ${admin.email}`);

    // Create ADMIN role if not exists
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {
            displayName: 'Administrator',
            description: 'Full system access',
        },
        create: {
            name: 'ADMIN',
            displayName: 'Administrator',
            description: 'Full system access with all permissions',
        },
    });

    console.log(`✅ Admin role created/updated: ${adminRole.name}`);

    // Create all permissions
    const permissions = [
        { name: 'users:read', displayName: 'View Users' },
        { name: 'users:write', displayName: 'Manage Users' },
        { name: 'users:delete', displayName: 'Delete Users' },
        { name: 'roles:read', displayName: 'View Roles' },
        { name: 'roles:write', displayName: 'Manage Roles' },
        { name: 'permissions:read', displayName: 'View Permissions' },
        { name: 'permissions:write', displayName: 'Manage Permissions' },
        { name: 'products:read', displayName: 'View Products' },
        { name: 'products:write', displayName: 'Manage Products' },
        { name: 'products:delete', displayName: 'Delete Products' },
        { name: 'orders:read', displayName: 'View Orders' },
        { name: 'orders:write', displayName: 'Manage Orders' },
        { name: 'courses:read', displayName: 'View Courses' },
        { name: 'courses:write', displayName: 'Manage Courses' },
        { name: 'courses:delete', displayName: 'Delete Courses' },
        { name: 'system:settings', displayName: 'System Settings' },
        { name: 'system:logs', displayName: 'View System Logs' },
    ];

    console.log('📝 Creating permissions...');
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: perm,
            create: perm,
        });
    }

    console.log(`✅ Created ${permissions.length} permissions`);

    // Assign all permissions to admin role
    console.log('🔗 Assigning permissions to admin role...');
    const allPermissions = await prisma.permission.findMany();

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
        });
    }

    console.log(`✅ Assigned ${allPermissions.length} permissions to admin role`);

    // Assign admin role to user
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: admin.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: admin.id,
            roleId: adminRole.id,
        },
    });

    console.log('✅ Assigned admin role to super admin user');
    console.log('');
    console.log('🎉 Super Admin Setup Complete!');
    console.log('==================================');
    console.log('📧 Email: admin@semindo.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: Administrator');
    console.log('✨ Permissions: All');
    console.log('==================================');
}

async function main() {
    try {
        await createSuperAdmin();
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
