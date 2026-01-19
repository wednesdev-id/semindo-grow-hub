import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export interface LocationData {
    address: string;
    city: string;
    province: string;
    lat: number;
    lng: number;
}

export interface OnboardingData {
    // User info
    fullName: string;
    email: string;
    phone: string;
    password: string;

    // Business info
    businessName: string;
    sector: string; // Bidang usaha
    omzetMonthly: string; // Omzet per bulan (range string)
    challenges: string; // Kendala utama

    // Selected services
    requestedServices: string[]; // Array of service names

    // Location data
    ownerLocation?: LocationData;
    businessLocation?: LocationData;
}

export class OnboardingService {
    /**
     * Register new UMKM with user account and profile
     */
    async registerUMKM(data: OnboardingData) {
        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Find UMKM role
        const umkmRole = await prisma.role.findUnique({
            where: { name: 'umkm' }
        });

        if (!umkmRole) {
            throw new Error('UMKM role not found in system');
        }

        // Create user + profile in transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create user
            const user = await tx.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    fullName: data.fullName,
                    phone: data.phone,
                    passwordHash,
                    businessName: data.businessName,
                    emailVerified: false,
                    isActive: true,
                }
            });

            // 2. Assign UMKM role
            await tx.userRole.create({
                data: {
                    userId: user.id,
                    roleId: umkmRole.id,
                }
            });

            // 3. Parse omzet to decimal (convert range string to number)
            const omzetValue = this.parseOmzetRange(data.omzetMonthly);

            // 4. Create UMKM profile with location data
            const umkmProfile = await tx.uMKMProfile.create({
                data: {
                    userId: user.id,
                    businessName: data.businessName,
                    ownerName: data.fullName,
                    phone: data.phone,
                    email: data.email.toLowerCase(),
                    sector: data.sector,
                    omzetMonthly: omzetValue,
                    status: 'unverified',
                    // Business location
                    address: data.businessLocation?.address || '',
                    city: data.businessLocation?.city || '',
                    province: data.businessLocation?.province || '',
                    location: data.businessLocation?.lat && data.businessLocation?.lng
                        ? { lat: data.businessLocation.lat, lng: data.businessLocation.lng }
                        : undefined,
                }
            });

            return { user, umkmProfile };
        });

        return {
            userId: result.user.id,
            umkmProfileId: result.umkmProfile.id,
            email: result.user.email,
            businessName: result.umkmProfile.businessName,
        };
    }

    /**
     * Parse omzet range string to numeric value
     * e.g. "< 10 Juta" -> 5000000
     */
    private parseOmzetRange(omzetRange: string): number {
        const ranges: Record<string, number> = {
            '< 10 Juta': 5000000,
            '10 - 50 Juta': 30000000,
            '50 - 100 Juta': 75000000,
            '100 - 300 Juta': 200000000,
            '300 - 500 Juta': 400000000,
            '> 500 Juta': 750000000,
        };
        return ranges[omzetRange] || 0;
    }

    /**
     * Generate WhatsApp wa.me link with pre-filled message
     */
    generateWhatsAppLink(data: OnboardingData, whatsappNumber: string): string {
        const message = this.formatWhatsAppMessage(data);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    }

    /**
     * Format WhatsApp notification message
     */
    private formatWhatsAppMessage(data: OnboardingData): string {
        const services = data.requestedServices.join(', ');
        const businessAddr = data.businessLocation?.address
            ? `${data.businessLocation.address}${data.businessLocation.city ? ', ' + data.businessLocation.city : ''}${data.businessLocation.province ? ', ' + data.businessLocation.province : ''}`
            : '-';

        return `🆕 *PENDAFTARAN UMKM BARU*

👤 *Nama:* ${data.fullName}
📧 *Email:* ${data.email}
📱 *No. HP:* ${data.phone}

🏢 *Nama Usaha:* ${data.businessName}
📊 *Bidang Usaha:* ${data.sector}
💰 *Omzet/Bulan:* ${data.omzetMonthly}
📍 *Alamat Usaha:* ${businessAddr}

⚠️ *Kendala:*
${data.challenges || '-'}

📋 *Layanan yang Dipilih:*
${services}

---
_Pesan ini dikirim otomatis dari sistem SEMINDO_`;
    }
}

export const onboardingService = new OnboardingService();
