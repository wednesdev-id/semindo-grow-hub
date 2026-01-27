import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function createSuperAdmin() {
    const email = 'admin@sinergiumkmindonesia.com';
    const password = '@sinergi2026';
    const fullName = 'Super Admin';

    try {
        // 1. Ensure Roles exist
        const roles = ['super_admin', 'admin'];
        for (const roleName of roles) {
            await prisma.role.upsert({
                where: { name: roleName },
                update: {},
                create: {
                    name: roleName,
                    displayName: roleName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    description: `Role for ${roleName}`
                }
            });
            console.log(`Role ${roleName} ensured.`);
        }

        // 2. Hash Password
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Create or Update User
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash,
                fullName,
                isActive: true,
                emailVerified: true
            },
            create: {
                email,
                passwordHash,
                fullName,
                isActive: true,
                emailVerified: true,
                userRoles: {
                    create: roles.map(role => ({
                        role: { connect: { name: role } }
                    }))
                }
            },
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });

        console.log(`User ${user.email} created/updated successfully.`);
        console.log('Roles:', user.userRoles.map(ur => ur.role.name).join(', '));

        // If updated, ensure roles are present (upsert doesn't update relations automatically in valid way for this)
        if (user) {
            for (const roleName of roles) {
                const role = await prisma.role.findUnique({ where: { name: roleName } });
                if (role) {
                    const userRoleExists = await prisma.userRole.findUnique({
                        where: {
                            userId_roleId: {
                                userId: user.id,
                                roleId: role.id
                            }
                        }
                    });

                    if (!userRoleExists) {
                        await prisma.userRole.create({
                            data: {
                                userId: user.id,
                                roleId: role.id
                            }
                        });
                        console.log(`Added missing role ${roleName} to user.`);
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();
