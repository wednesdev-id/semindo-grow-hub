import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { TokenPayload } from '../utils/jwt';

export async function requireUMKMAccess(req: Request, res: Response, next: NextFunction) {
    const courseId = req.params.id || req.params.courseId;

    if (!courseId) {
        return next();
    }

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { isUMKMOnly: true }
        });

        if (!course) {
            // Let the controller handle 404
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
        // We query the db using userId
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

        // Access granted
        next();

    } catch (error) {
        console.error('UMKM Access Middleware Error:', error);
        return res.status(500).json({ error: 'Internal server error checking course access' });
    }
}
