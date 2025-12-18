import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = "seller@example.com"
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        console.error(`User ${email} not found`)
        process.exit(1)
    }

    const store = await prisma.store.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            name: "Seller Store",
            slug: "seller-store",
            description: "Store for automation testing",
            isActive: true
        }
    })

    console.log(`✅ Store created for ${email}: ${store.name}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
