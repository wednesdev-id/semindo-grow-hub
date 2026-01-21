"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapService = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("@prisma/client");
class UserMapService {
    async getDistributionData() {
        // Fetch users with target roles who have some location data
        // Either personal location (User.location) OR business location (UMKMProfile.location)
        const users = await prisma_1.prisma.user.findMany({
            where: {
                AND: [
                    {
                        isActive: true,
                    },
                    {
                        userRoles: {
                            some: {
                                role: {
                                    name: {
                                        in: ['umkm', 'mentor', 'consultant', 'general_user'],
                                    },
                                },
                            },
                        },
                    },
                    {
                        userRoles: {
                            none: {
                                role: {
                                    name: {
                                        in: ['super_admin', 'admin', 'management', 'manager', 'staff'],
                                    },
                                },
                            },
                        },
                    },
                    {
                        // Must have SOME location: personal OR business
                        OR: [
                            { location: { not: client_1.Prisma.DbNull } },
                            { city: { not: null } },
                            {
                                umkmProfiles: {
                                    some: {
                                        OR: [
                                            { location: { not: client_1.Prisma.DbNull } },
                                            { city: { not: null } }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                ],
            },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
                umkmProfiles: {
                    select: {
                        id: true,
                        businessName: true,
                        location: true,
                        address: true,
                        province: true,
                        city: true,
                    },
                },
            },
        });
        const results = [];
        for (const user of users) {
            // Determine primary role for display
            const roles = user.userRoles.map((ur) => ur.role.name);
            let primaryType = 'user';
            if (roles.includes('umkm'))
                primaryType = 'umkm';
            else if (roles.includes('mentor'))
                primaryType = 'mentor';
            else if (roles.includes('consultant'))
                primaryType = 'consultant';
            let lat;
            let lng;
            let address;
            let province;
            let city;
            let umkmId;
            let locationSource = 'personal';
            // PRIORITY 1: User's personal location
            if (user.location && typeof user.location === 'object') {
                const loc = user.location;
                if (loc.lat && loc.lng) {
                    lat = Number(loc.lat);
                    lng = Number(loc.lng);
                }
                else if (loc.latitude && loc.longitude) {
                    lat = Number(loc.latitude);
                    lng = Number(loc.longitude);
                }
                address = user.address || undefined;
                province = user.province || undefined;
                city = user.city || undefined;
                locationSource = 'personal';
            }
            // PRIORITY 2: Fallback to UMKM Profile location (business address)
            if (!lat || !lng) {
                const umkm = user.umkmProfiles[0];
                if (umkm?.location && typeof umkm.location === 'object') {
                    const loc = umkm.location;
                    if (loc.lat && loc.lng) {
                        lat = Number(loc.lat);
                        lng = Number(loc.lng);
                    }
                    else if (loc.latitude && loc.longitude) {
                        lat = Number(loc.latitude);
                        lng = Number(loc.longitude);
                    }
                    address = umkm.address || undefined;
                    province = umkm.province || undefined;
                    city = umkm.city || undefined;
                    umkmId = umkm.id;
                    locationSource = 'business';
                }
            }
            // Only add if we have valid coordinates
            if (lat && lng) {
                results.push({
                    id: user.id,
                    name: user.fullName,
                    businessName: user.umkmProfiles[0]?.businessName || user.businessName,
                    role: user.userRoles[0]?.role.displayName || user.userRoles[0]?.role.name,
                    avatar: user.profilePictureUrl || undefined,
                    lat,
                    lng,
                    address,
                    province,
                    city,
                    umkmId,
                    type: primaryType,
                    locationSource
                });
            }
        }
        return results;
    }
}
exports.UserMapService = UserMapService;
