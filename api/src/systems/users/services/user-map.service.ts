import { prisma } from '../../../lib/prisma';
import { Prisma } from '../../../../prisma/generated/client';

export interface UserMapPoint {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    businessName?: string;
    lat: number;
    lng: number;
    address?: string;
    province?: string;
    city?: string;
    umkmId?: string;
    type: 'umkm' | 'mentor' | 'consultant' | 'user';
    // New: indicate if this is personal or business location
    locationSource: 'personal' | 'business';
}

export class UserMapService {
    async getDistributionData() {
        // Fetch users with target roles who have some location data
        // Either personal location (User.location) OR business location (UMKMProfile.location)
        const users = await prisma.user.findMany({
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
                                        in: ['wirausaha', 'umkm', 'mentor', 'consultant', 'general_user'],
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
                            { location: { not: Prisma.DbNull } },
                            { city: { not: null } },
                            {
                                umkmProfiles: {
                                    some: {
                                        OR: [
                                            { location: { not: Prisma.DbNull } },
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

        const results: UserMapPoint[] = [];

        for (const user of users as any[]) {
            // Determine primary role for display
            const roles = user.userRoles.map((ur: any) => ur.role.name);
            let primaryType: UserMapPoint['type'] = 'user';
            if (roles.includes('wirausaha')) primaryType = 'umkm'; // Display as 'umkm' type for color consistency
            else if (roles.includes('umkm')) primaryType = 'umkm';
            else if (roles.includes('mentor')) primaryType = 'mentor';
            else if (roles.includes('consultant')) primaryType = 'consultant';

            let lat: number | undefined;
            let lng: number | undefined;
            let address: string | undefined;
            let province: string | undefined;
            let city: string | undefined;
            let umkmId: string | undefined;
            let locationSource: 'personal' | 'business' = 'personal';

            // PRIORITY 1: User's personal location
            if (user.location && typeof user.location === 'object') {
                const loc = user.location as { lat?: number; lng?: number, latitude?: number, longitude?: number };
                if (loc.lat && loc.lng) {
                    lat = Number(loc.lat);
                    lng = Number(loc.lng);
                } else if (loc.latitude && loc.longitude) {
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
                    const loc = umkm.location as { lat?: number; lng?: number, latitude?: number, longitude?: number };
                    if (loc.lat && loc.lng) {
                        lat = Number(loc.lat);
                        lng = Number(loc.lng);
                    } else if (loc.latitude && loc.longitude) {
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
