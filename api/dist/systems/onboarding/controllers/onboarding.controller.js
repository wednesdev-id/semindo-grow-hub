"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingController = exports.OnboardingController = void 0;
const onboarding_service_1 = require("../services/onboarding.service");
class OnboardingController {
    /**
     * POST /api/v1/onboarding/register
     * Register new UMKM user with profile
     */
    async register(req, res) {
        try {
            const data = req.body;
            // Validate required fields
            const requiredFields = ['fullName', 'email', 'phone', 'password', 'businessName', 'sector', 'omzetMonthly', 'requestedServices'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    return res.status(400).json({
                        success: false,
                        message: `Field '${field}' is required`,
                    });
                }
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                });
            }
            // Validate phone format (Indonesian)
            const phoneRegex = /^(08|628|\+628)[0-9]{8,11}$/;
            const cleanPhone = data.phone.replace(/[^0-9+]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format. Use Indonesian format (08/62/+62)',
                });
            }
            // Validate password length
            if (data.password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters',
                });
            }
            // Validate at least one service selected
            if (!Array.isArray(data.requestedServices) || data.requestedServices.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select at least one service',
                });
            }
            // Register UMKM
            const result = await onboarding_service_1.onboardingService.registerUMKM(data);
            // Generate WhatsApp link
            const adminWhatsApp = process.env.WHATSAPP_ADMIN_NUMBER || '6281234567890';
            const whatsappLink = onboarding_service_1.onboardingService.generateWhatsAppLink(data, adminWhatsApp);
            return res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    userId: result.userId,
                    umkmProfileId: result.umkmProfileId,
                    email: result.email,
                    businessName: result.businessName,
                    whatsappLink,
                }
            });
        }
        catch (error) {
            console.error('[OnboardingController] Registration error:', error);
            // Handle duplicate email
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                return res.status(409).json({
                    success: false,
                    message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Registration failed',
            });
        }
    }
    /**
     * GET /api/v1/onboarding/services
     * Get list of available services
     */
    async getServices(_req, res) {
        const services = [
            { id: 'bisnis', name: 'Pengembangan Bisnis', icon: 'TrendingUp', description: 'Strategi dan pengembangan usaha' },
            { id: 'branding', name: 'Branding', icon: 'Palette', description: 'Identitas dan citra merek' },
            { id: 'manajemen', name: 'Manajemen', icon: 'ClipboardList', description: 'Pengelolaan operasional usaha' },
            { id: 'keuangan', name: 'Keuangan', icon: 'DollarSign', description: 'Pencatatan dan pengelolaan keuangan' },
            { id: 'network', name: 'Network', icon: 'Users', description: 'Jaringan dan kemitraan bisnis' },
            { id: 'pemasaran', name: 'Pemasaran', icon: 'Megaphone', description: 'Strategi marketing dan promosi' },
        ];
        return res.json({
            success: true,
            data: services,
        });
    }
    /**
     * GET /api/v1/onboarding/sectors
     * Get list of business sectors
     */
    async getSectors(_req, res) {
        const sectors = [
            'Kuliner & Makanan',
            'Fashion & Pakaian',
            'Kerajinan & Handmade',
            'Pertanian & Agribisnis',
            'Jasa & Layanan',
            'Perdagangan & Retail',
            'Teknologi & Digital',
            'Pariwisata & Hospitality',
            'Kesehatan & Kecantikan',
            'Pendidikan & Pelatihan',
            'Lainnya',
        ];
        return res.json({
            success: true,
            data: sectors,
        });
    }
    /**
     * GET /api/v1/onboarding/omzet-ranges
     * Get list of omzet ranges
     */
    async getOmzetRanges(_req, res) {
        const ranges = [
            '< 10 Juta',
            '10 - 50 Juta',
            '50 - 100 Juta',
            '100 - 300 Juta',
            '300 - 500 Juta',
            '> 500 Juta',
        ];
        return res.json({
            success: true,
            data: ranges,
        });
    }
}
exports.OnboardingController = OnboardingController;
exports.onboardingController = new OnboardingController();
