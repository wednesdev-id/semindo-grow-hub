import { PrismaClient } from '../generated/client';

// Role to Permission Mappings
export const rolePermissions = {
    // ============================================
    // ADMIN & SUPER_ADMIN - ALL PERMISSIONS
    // ============================================
    admin: 'ALL', // Will get all permissions
    super_admin: 'ALL', // Will get all permissions
    administrator: 'ALL', // Alias for admin

    // ============================================
    // UMKM ROLE - Limited Access
    // ============================================
    umkm: [
        // Own profile management
        'umkm:profile',
        'umkm:edit',
        'umkm:assessment_status',
        'umkm:program_status',

        // LMS - View only
        'lms:view_courses',

        // Marketplace - Own products
        'marketplace:view_products',
        'marketplace:create_product',
        'marketplace:edit_product',
        'marketplace:orders', // Own orders

        // Programs - View and participate
        'programs:view',
        'programs:participants',

        // Financing - Apply
        'financing:view_applications', // Own applications
        'financing:products',
        'financing:apply',

        // Community - Participate
        'community:forum',
        'community:posts',
        'community:events',

        // Consultation - Request (Client role)
        'consultation:schedule',
        'consultation:history',
    ],

    // ============================================
    // KONSULTAN / CONSULTANT ROLE - Consultation Provider
    // ============================================
    konsultan: [
        // Consultant profile management
        'consultation:consultant.profile',
        'consultation:consultant.availability',
        'consultation:consultant.requests',

        // View expertise categories
        'consultation.expertise.read',

        // View own consultation history
        'consultation:history',
        'consultation:schedule',
        'consultation:chat',

        // Community participation
        'community:forum',
        'community:posts',
    ],
    consultant: [
        // Consultant profile management
        'consultation:consultant.profile',
        'consultation:consultant.availability',
        'consultation:consultant.requests',

        // View expertise categories
        'consultation.expertise.read',

        // View own consultation history
        'consultation:history',
        'consultation:schedule',
        'consultation:chat',

        // Community participation
        'community:forum',
        'community:posts',
    ],

    // ============================================
    // MENTOR ROLE - Mentoring & Guidance
    // ============================================
    mentor: [
        // Mentoring activities
        'mentors:activity',
        'mentors:schedule',
        'mentors:reports',
        'mentors:kpi',

        // UMKM - View access for mentoring
        'umkm:view',
        'umkm:assessment_status',
        'umkm:program_status',
        'umkm:history',

        // Programs
        'programs:view',
        'programs:participants',
        'programs:evaluation',

        // Consultation - Full access
        'consultation:schedule',
        'consultation:history',
        'consultation:chat',
        'consultation:tickets',

        // Community - Moderate
        'community:forum',
        'community:posts',
        'community:moderation',

        // Analytics - Limited
        'analytics:mentoring',
        'analytics:programs',
    ],

    // ============================================
    // TRAINER ROLE - Learning & Education
    // ============================================
    trainer: [
        // LMS - Full course management
        'lms:view_courses',
        'lms:create_course',
        'lms:edit_course',
        'lms:modules',
        'lms:videos',
        'lms:assignments',
        'lms:certificates',
        'lms:review',
        'lms:stats',

        // Programs - Curriculum focus
        'programs:view',
        'programs:curriculum',
        'programs:participants',

        // Community
        'community:forum',
        'community:posts',

        // Analytics - LMS focus
        'analytics:lms',
        'analytics:programs',
    ],

    // ============================================
    // MANAGEMENT ROLE - Partial Admin Access
    // ============================================
    management: [
        // User management
        'users:view',
        'users:create',
        'users:edit',

        // UMKM management
        'umkm:view',
        'umkm:create',
        'umkm:edit',
        'umkm:documents',
        'umkm:segmentation',
        'umkm:regional',

        // Programs
        'programs:view',
        'programs:create',
        'programs:edit',
        'programs:batches',
        'programs:participants',
        'programs:evaluation',

        // LMS
        'lms:view_courses',
        'lms:create_course',
        'lms:edit_course',
        'lms:stats',

        // Marketplace
        'marketplace:view_products',
        'marketplace:verification',
        'marketplace:stores',
        'marketplace:orders',

        // Consultation Admin
        'consultation.admin.view_dashboard',
        'consultation.admin.view_requests',
        'consultation.admin.approve',
        'consultation.admin.manage_consultants',
        'consultation.admin.view_analytics',
        'consultation.admin.view_reports',
        'consultation.expertise.read',
        'consultation.expertise.manage',

        // Analytics
        'analytics:umkm',
        'analytics:programs',
        'analytics:lms',
        'analytics:marketplace',
        'analytics:kpi',
    ],
};

export async function seedRolePermissions(prisma: any) {
    console.log('🔗 Seeding role-permission mappings...');

    // Get all roles
    const roles = await prisma.role.findMany();
    const permissions = await prisma.permission.findMany();

    // Create a map for quick permission lookup
    const permissionMap = new Map(
        permissions.map((p: { name: string; id: string }) => [p.name, p.id])
    );

    for (const role of roles) {
        console.log(`  Processing role: ${role.name}`);

        // Get permissions for this role
        let permissionsToAssign: string[] = [];

        if (rolePermissions[role.name as keyof typeof rolePermissions] === 'ALL') {
            // Assign all permissions
            permissionsToAssign = permissions.map((p: { id: string }) => p.id);
            console.log(`    → Assigning ALL ${permissions.length} permissions`);
        } else if (rolePermissions[role.name as keyof typeof rolePermissions]) {
            // Assign specific permissions
            const permissionNames = rolePermissions[role.name as keyof typeof rolePermissions] as string[];
            permissionsToAssign = permissionNames
                .map(name => permissionMap.get(name))
                .filter((id): id is string => id !== undefined);
            console.log(`    → Assigning ${permissionsToAssign.length} permissions`);
        } else {
            console.log(`    → No permissions defined for ${role.name}`);
            continue;
        }

        // Delete existing role permissions
        await prisma.rolePermission.deleteMany({
            where: { roleId: role.id }
        });

        // Create new role permissions
        if (permissionsToAssign.length > 0) {
            await prisma.rolePermission.createMany({
                data: permissionsToAssign.map(permId => ({
                    roleId: role.id,
                    permissionId: permId,
                })),
                skipDuplicates: true,
            });
        }
    }

    console.log('✅ Role-permission mappings completed');
}
