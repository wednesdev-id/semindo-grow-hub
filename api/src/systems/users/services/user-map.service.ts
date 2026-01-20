import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

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
}

export class UserMapService {
    async getDistributionData() {
        // 1. Fetch users with target roles who typically have location data (UMKMs)
        // We strictly exclude super_admin, admin, management
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        isActive: true, // Only active users
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
                        // Filter: Must have some location data source
                        // Currently primarily UMKMProfile
                        umkmProfiles: {
                            some: {
                                OR: [
                                    { location: { not: Prisma.DbNull } },
                                    { city: { not: null } }
                                ]
                            }
                        }
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

        // 2. Map coordinates
        // We need a way to geocode if lat/lng missing but city/prov exists. 
        // For now, we'll only return valid ones or mock/approximate if we had a local DB of city coords.
        // Since we don't have a local city DB loaded here, we'll filter for those with `location` JSON or we rely on frontend/regionApi to maybe handle it?
        // Actually, `regionApi` on frontend handles aggregation. 
        // But for individual points, we need coords.
        // Detailed implementation: We will map what we have.

        const results: UserMapPoint[] = [];

        for (const user of users as any[]) {
            // Determine primary role for display
            const roles = user.userRoles.map((ur: any) => ur.role.name);
            let primaryType: UserMapPoint['type'] = 'user';
            if (roles.includes('umkm')) primaryType = 'umkm';
            else if (roles.includes('mentor')) primaryType = 'mentor';
            else if (roles.includes('consultant')) primaryType = 'consultant';

            // Try to get location from UMKM Profile
            const umkm = user.umkmProfiles[0]; // Take first profile if exists

            if (umkm) {
                let lat: number | undefined;
                let lng: number | undefined;

                // Try JSON location first
                if (umkm.location && typeof umkm.location === 'object') {
                    const loc = umkm.location as { lat?: number; lng?: number, latitude?: number, longitude?: number };
                    if (loc.lat && loc.lng) {
                        lat = Number(loc.lat);
                        lng = Number(loc.lng);
                    } else if (loc.latitude && loc.longitude) {
                        lat = Number(loc.latitude);
                        lng = Number(loc.longitude);
                    }
                }

                // If we have coords, add to result
                if (lat && lng) {
                    results.push({
                        id: user.id,
                        name: user.fullName,
                        businessName: umkm.businessName,
                        role: user.userRoles[0]?.role.displayName || user.userRoles[0]?.role.name,
                        avatar: user.profilePictureUrl || undefined,
                        lat,
                        lng,
                        address: umkm.address || undefined,
                        province: umkm.province || undefined,
                        city: umkm.city || undefined,
                        umkmId: umkm.id,
                        type: primaryType
                    });
                }
                // If we DON'T have coords but have City, we could potentially rely on frontend to cluster them 
                // OR we skip them for the "Map View" but they might appear in stats.
                // For the MAP, we need coords.
            }
        }

        return results;
    }
}
