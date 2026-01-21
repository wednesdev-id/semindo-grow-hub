"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingService = exports.OnboardingService = void 0;
const prisma_1 = require("../../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class OnboardingService {
    /**
     * Register new UMKM with user account and profile
     */
    async registerUMKM(data) {
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        // Find UMKM role
        const umkmRole = await prisma_1.prisma.role.findUnique({
            where: { name: 'umkm' }
        });
        if (!umkmRole) {
            throw new Error('UMKM role not found in system');
        }
        // Create user + profile in transaction
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
    parseOmzetRange(omzetRange) {
        const ranges = {
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
    generateWhatsAppLink(data, whatsappNumber) {
        const message = this.formatWhatsAppMessage(data);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    }
    /**
     * Format WhatsApp notification message
     */
    formatWhatsAppMessage(data) {
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
exports.OnboardingService = OnboardingService;
exports.onboardingService = new OnboardingService();
