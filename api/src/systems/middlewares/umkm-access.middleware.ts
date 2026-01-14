import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { TokenPayload } from '../utils/jwt';

/**
 * Middleware to require UMKM access for certain courses.
 * 
 * NOTE: The `isUMKMOnly` field was planned but not yet added to the Course model.
 * This middleware is currently a pass-through until the field is implemented.
 * 
 * Future implementation should:
 * 1. Add `isUMKMOnly Boolean @default(false)` to the Course model
 * 2. Run prisma migrate
 * 3. Uncomment the restriction logic below
 */
export async function requireUMKMAccess(req: Request, res: Response, next: NextFunction) {
    const courseId = req.params.id || req.params.courseId;

    if (!courseId) {
        return next();
    }

    try {
        // TODO: Enable this check once isUMKMOnly field is added to Course model
        // For now, allow all access
        /*
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { isUMKMOnly: true }
        });

        if (!course) {
            return next();
        }

        // If course is not UMKM-only, allow access
        if (!course.isUMKMOnly) {
            return next();
        }

        // If UMKM-only, check user role and profile status
        const user = req.user as TokenPayload;

        if (!user) {
            return res.status(401).json({ error: 'Authentication required for this course' });
        }

        // Admins, mentors, and consultants can always access
        const allowedRoles = ['admin', 'mentor', 'konsultan', 'trainer'];
        if (user.roles.some(role => allowedRoles.includes(role))) {
            return next();
        }

        // Check for UMKM profile
        const umkmProfile = await prisma.uMKMProfile.findFirst({
            where: { userId: user.userId }
        });

        if (!umkmProfile) {
            return res.status(403).json({
                error: 'Course restricted to registered UMKM only',
                code: 'UMKM_REQUIRED',
                redirect: '/onboarding/business'
            });
        }

        if (umkmProfile.status !== 'verified') {
            return res.status(403).json({
                error: 'Your UMKM profile must be verified to access this course',
                code: 'UMKM_UNVERIFIED',
                status: umkmProfile.status
            });
        }
        */

        // Access granted (pass-through for now)
        next();

    } catch (error) {
        console.error('UMKM Access Middleware Error:', error);
        return res.status(500).json({ error: 'Internal server error checking course access' });
    }
}
