import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany({
        select: { id: true, email: true, fullName: true, userRoles: { include: { role: true } } }
    });
    console.table(users.map(u => ({
        id: u.id,
        email: u.email,
        roles: u.userRoles.map(ur => ur.role.name).join(', ')
    })));

    console.log('\n--- COURSES ---');
    const courses = await prisma.course.findMany({
        include: { author: { select: { email: true } } }
    });
    console.table(courses.map(c => ({
        id: c.id,
        title: c.title,
        authorId: c.authorId,
        authorEmail: c.author.email,
        isPublished: c.isPublished
    })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
