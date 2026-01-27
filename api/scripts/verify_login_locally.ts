import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function verifyLogin() {
    const email = 'admin@sinergiumkmindonesia.com';
    const password = '@sinergi2026';

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log('User found:', user.email);
        console.log('Stored Hash:', user.passwordHash);

        // Direct comparison using bcryptjs, same as password.ts
        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log('Password valid (using direct bcrypt.compare):', isValid);

        if (isValid) {
            console.log('Roles:', user.userRoles.map(ur => ur.role.name));
        } else {
            const newHash = await bcrypt.hash(password, 10);
            console.log('Expected Hash for @sinergi2026:', newHash);
        }

    } catch (error) {
        console.error('Error verifying login:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyLogin();
