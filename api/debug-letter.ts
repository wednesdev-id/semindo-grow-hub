
import { config } from 'dotenv';
config();
import { prisma } from './src/lib/prisma';

async function main() {
    try {
        // Use any cast to bypass type check if types are stale
        const client = prisma as any;

        if (!client.incomingLetter) {
            console.error('IncomingLetter model not found on prisma client');
            console.log('Available models:', Object.keys(client).filter(k => !k.startsWith('_') && !k.startsWith('$')));
            return;
        }

        const letters = await client.incomingLetter.findMany({
            where: { letterNumber: '123/abc/2026' },
            select: {
                id: true,
                letterNumber: true,
                fileUrl: true,
                mimeType: true
            }
        });
        console.log('DEBUG_LETTER_DATA:', JSON.stringify(letters, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
