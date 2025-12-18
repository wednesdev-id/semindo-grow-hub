import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash("password123", 10)

    const users = [
        { email: "finance@example.com", name: "Finance Partner", role: "finance_partner" },
        { email: "partner@example.com", name: "Ecosystem Partner", role: "ecosystem_partner" },
        { email: "buyer@example.com", name: "Regular Buyer", role: "umkm" },
        { email: "seller@example.com", name: "Seller User", role: "umkm" }
    ]

    console.log("Creating dummy users...")

    for (const u of users) {
        // Ensure role exists (should be seeded already, but good to check)
        const role = await prisma.role.findUnique({ where: { name: u.role } })

        if (!role) {
            console.log(`⚠️ Role '${u.role}' not found. Skipping ${u.email}.`)
            continue
        }

        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                passwordHash: password,
                fullName: u.name,
                emailVerified: true,
                userRoles: {
                    create: {
                        roleId: role.id
                    }
                }
            }
        })
        console.log(`✅ Created user: ${u.email} | Pass: password123 | Role: ${u.role}`)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
