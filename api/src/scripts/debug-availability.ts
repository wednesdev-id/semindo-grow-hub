
import { PrismaClient } from '../../prisma/generated/client';

const prisma = new PrismaClient();

async function main() {
    const userEmail = 'kons@mail.me'; // From user screenshot/logs

    console.log(`Checking availability for email: ${userEmail}`);

    const user = await prisma.user.findUnique({
        where: { email: userEmail }
    });

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user: ${user.id}`);

    const profile = await prisma.consultantProfile.findUnique({
        where: { userId: user.id },
        include: { availability: true }
    });

    if (!profile) {
        console.error('Consultant profile not found for user!');
        return;
    }

    console.log(`Found profile: ${profile.id}`);
    console.log(`Availability slots count: ${profile.availability.length}`);
    console.log(JSON.stringify(profile.availability, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
