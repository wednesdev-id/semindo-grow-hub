import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const permissions = [
    // ============================================
    // USER MANAGEMENT (9 permissions)
    // ============================================
    {
        name: 'users:view',
        displayName: 'View Users',
        description: 'Can view user list and details'
    },
    {
        name: 'users:create',
        displayName: 'Create Users',
        description: 'Can create new users'
    },
    {
        name: 'users:edit',
        displayName: 'Edit Users',
        description: 'Can edit user details'
    },
    {
        name: 'users:delete',
        displayName: 'Delete Users',
        description: 'Can delete users'
    },
    {
        name: 'users:import',
        displayName: 'Import Users',
        description: 'Can import users from CSV'
    },
    {
        name: 'users:export',
        displayName: 'Export Users',
        description: 'Can export users to CSV'
    },
    {
        name: 'users:audit',
        displayName: 'View User Audit',
        description: 'Can view user activity audit logs'
    },
    {
        name: 'roles:manage',
        displayName: 'Manage Roles',
        description: 'Can create, edit, and delete roles'
    },
    {
        name: 'permissions:manage',
        displayName: 'Manage Permissions',
        description: 'Can manage permission assignments'
    },

    // ============================================
    // UMKM MANAGEMENT (12 permissions)
    // ============================================
    {
        name: 'umkm:view',
        displayName: 'View UMKM',
        description: 'Can view UMKM list and profiles'
    },
    {
        name: 'umkm:create',
        displayName: 'Create UMKM',
        description: 'Can create UMKM profiles'
    },
    {
        name: 'umkm:edit',
        displayName: 'Edit UMKM',
        description: 'Can edit UMKM profiles'
    },
    {
        name: 'umkm:delete',
        displayName: 'Delete UMKM',
        description: 'Can delete UMKM profiles'
    },
    {
        name: 'umkm:documents',
        displayName: 'Manage UMKM Documents',
        description: 'Can manage UMKM documents'
    },
    {
        name: 'umkm:segmentation',
        displayName: 'UMKM Segmentation',
        description: 'Can access UMKM segmentation tools'
    },
    {
        name: 'umkm:regional',
        displayName: 'Regional Mapping',
        description: 'Can view regional UMKM distribution'
    },
    {
        name: 'umkm:assessment_status',
        displayName: 'View Assessment Status',
        description: 'Can view UMKM assessment status'
    },
    {
        name: 'umkm:program_status',
        displayName: 'View Program Status',
        description: 'Can view UMKM program participation'
    },
    {
        name: 'umkm:history',
        displayName: 'View Mentoring History',
        description: 'Can view UMKM mentoring history'
    },
    {
        name: 'umkm:verification',
        displayName: 'Document Verification',
        description: 'Can verify UMKM documents'
    },
    {
        name: 'umkm:profile',
        displayName: 'Manage Own Profile',
        description: 'Can manage own UMKM profile'
    },

    // ============================================
    // MENTOR MANAGEMENT (8 permissions)
    // ============================================
    {
        name: 'mentors:view',
        displayName: 'View Mentors',
        description: 'Can view mentor list'
    },
    {
        name: 'mentors:assign',
        displayName: 'Assign Mentors',
        description: 'Can assign UMKM to mentors'
    },
    {
        name: 'mentors:activity',
        displayName: 'View Mentor Activity',
        description: 'Can view mentor activity and status'
    },
    {
        name: 'mentors:schedule',
        displayName: 'Manage Schedule',
        description: 'Can manage mentoring schedules'
    },
    {
        name: 'mentors:reports',
        displayName: 'Mentor Reports',
        description: 'Can view and submit mentor reports'
    },
    {
        name: 'mentors:approval',
        displayName: 'Approve Reports',
        description: 'Can approve mentor reports'
    },
    {
        name: 'mentors:kpi',
        displayName: 'View KPI',
        description: 'Can view mentor KPI dashboard'
    },
    {
        name: 'mentors:manage',
        displayName: 'Manage Mentors',
        description: 'Full mentor management access'
    },

    // ============================================
    // PROGRAM MANAGEMENT (9 permissions)
    // ============================================
    {
        name: 'programs:view',
        displayName: 'View Programs',
        description: 'Can view program list'
    },
    {
        name: 'programs:create',
        displayName: 'Create Programs',
        description: 'Can create new programs'
    },
    {
        name: 'programs:edit',
        displayName: 'Edit Programs',
        description: 'Can edit program details'
    },
    {
        name: 'programs:delete',
        displayName: 'Delete Programs',
        description: 'Can delete programs'
    },
    {
        name: 'programs:batches',
        displayName: 'Manage Batches',
        description: 'Can manage program batches'
    },
    {
        name: 'programs:curriculum',
        displayName: 'Manage Curriculum',
        description: 'Can manage program curriculum'
    },
    {
        name: 'programs:schedule',
        displayName: 'Manage Schedule',
        description: 'Can manage program schedules'
    },
    {
        name: 'programs:participants',
        displayName: 'Manage Participants',
        description: 'Can manage program participants'
    },
    {
        name: 'programs:evaluation',
        displayName: 'Program Evaluation',
        description: 'Can evaluate programs and outcomes'
    },

    // ============================================
    // LMS - LEARNING MANAGEMENT (11 permissions)
    // ============================================
    {
        name: 'lms:view_courses',
        displayName: 'View Courses',
        description: 'Can view course catalog'
    },
    {
        name: 'lms:create_course',
        displayName: 'Create Courses',
        description: 'Can create new courses'
    },
    {
        name: 'lms:edit_course',
        displayName: 'Edit Courses',
        description: 'Can edit course content'
    },
    {
        name: 'lms:delete_course',
        displayName: 'Delete Courses',
        description: 'Can delete courses'
    },
    {
        name: 'lms:modules',
        displayName: 'Course Modules',
        description: 'Can manage course modules'
    },
    {
        name: 'lms:videos',
        displayName: 'Manage Videos',
        description: 'Can manage video library'
    },
    {
        name: 'lms:assignments',
        displayName: 'Manage Assignments',
        description: 'Can create assignments and quizzes'
    },
    {
        name: 'lms:certificates',
        displayName: 'Issue Certificates',
        description: 'Can issue course certificates'
    },
    {
        name: 'lms:trainers',
        displayName: 'Manage Trainers',
        description: 'Can manage trainer access'
    },
    {
        name: 'lms:review',
        displayName: 'Review Content',
        description: 'Can review and moderate course content'
    },
    {
        name: 'lms:stats',
        displayName: 'View LMS Statistics',
        description: 'Can view LMS analytics'
    },

    // ============================================
    // MARKETPLACE (10 permissions)
    // ============================================
    {
        name: 'marketplace:view_products',
        displayName: 'View Products',
        description: 'Can view product listings'
    },
    {
        name: 'marketplace:create_product',
        displayName: 'Create Products',
        description: 'Can create product listings'
    },
    {
        name: 'marketplace:edit_product',
        displayName: 'Edit Products',
        description: 'Can edit own products'
    },
    {
        name: 'marketplace:delete_product',
        displayName: 'Delete Products',
        description: 'Can delete products'
    },
    {
        name: 'marketplace:verification',
        displayName: 'Product Verification',
        description: 'Can verify product listings'
    },
    {
        name: 'marketplace:stores',
        displayName: 'Manage Stores',
        description: 'Can manage UMKM stores'
    },
    {
        name: 'marketplace:orders',
        displayName: 'Manage Orders',
        description: 'Can view and manage orders'
    },
    {
        name: 'marketplace:complaints',
        displayName: 'Handle Complaints',
        description: 'Can handle customer complaints'
    },
    {
        name: 'marketplace:fees',
        displayName: 'Manage Fees',
        description: 'Can configure marketplace fees'
    },
    {
        name: 'marketplace:integration',
        displayName: 'External Integration',
        description: 'Can manage external marketplace integrations'
    },

    // ============================================
    // FINANCING (8 permissions)
    // ============================================
    {
        name: 'financing:view_applications',
        displayName: 'View Applications',
        description: 'Can view financing applications'
    },
    {
        name: 'financing:products',
        displayName: 'View Products',
        description: 'Can view financing products'
    },
    {
        name: 'financing:verification',
        displayName: 'Verify Applications',
        description: 'Can verify financing applications'
    },
    {
        name: 'financing:approval',
        displayName: 'Approve Financing',
        description: 'Can approve financing requests'
    },
    {
        name: 'financing:documents',
        displayName: 'Manage Documents',
        description: 'Can manage financing documents'
    },
    {
        name: 'financing:partners',
        displayName: 'Manage Partners',
        description: 'Can manage financing partners'
    },
    {
        name: 'financing:reports',
        displayName: 'View Reports',
        description: 'Can view financing reports'
    },
    {
        name: 'financing:apply',
        displayName: 'Submit Application',
        description: 'Can submit financing application'
    },

    // ============================================
    // EXPORT HUB (7 permissions)
    // ============================================
    {
        name: 'export:guide',
        displayName: 'Export Guides',
        description: 'Can access export guides and resources'
    },
    {
        name: 'export:buyers',
        displayName: 'Buyer Directory',
        description: 'Can access international buyer directory'
    },
    {
        name: 'export:checklist',
        displayName: 'Export Checklist',
        description: 'Can access export readiness checklist'
    },
    {
        name: 'export:documents',
        displayName: 'Export Documents',
        description: 'Can access document templates'
    },
    {
        name: 'export:facilitation',
        displayName: 'Facilitation Programs',
        description: 'Can access facilitation programs'
    },
    {
        name: 'export:approval',
        displayName: 'Approve Requests',
        description: 'Can approve consultation requests'
    },
    {
        name: 'export:reports',
        displayName: 'Export Reports',
        description: 'Can view export statistics'
    },

    // ============================================
    // COMMUNITY & FORUM (6 permissions)
    // ============================================
    {
        name: 'community:forum',
        displayName: 'Access Forum',
        description: 'Can access community forum'
    },
    {
        name: 'community:topics',
        displayName: 'Manage Topics',
        description: 'Can manage forum topics and categories'
    },
    {
        name: 'community:posts',
        displayName: 'Create Posts',
        description: 'Can create and edit posts'
    },
    {
        name: 'community:moderation',
        displayName: 'Moderate Content',
        description: 'Can moderate forum content'
    },
    {
        name: 'community:events',
        displayName: 'Manage Events',
        description: 'Can manage community events'
    },
    {
        name: 'community:reports',
        displayName: 'Handle Reports',
        description: 'Can handle misconduct reports'
    },

    // ============================================
    // CONSULTATION (18 permissions)
    // ============================================
    // User permissions
    {
        name: 'consultation:schedule',
        displayName: 'Manage Schedule',
        description: 'Can manage consultation schedules'
    },
    {
        name: 'consultation:assignment',
        displayName: 'Assign Mentors',
        description: 'Can assign mentors to consultations'
    },
    {
        name: 'consultation:history',
        displayName: 'View History',
        description: 'Can view consultation history'
    },
    {
        name: 'consultation:chat',
        displayName: 'Monitor Chat',
        description: 'Can monitor consultation chats'
    },
    {
        name: 'consultation:tickets',
        displayName: 'Manage Tickets',
        description: 'Can manage support tickets'
    },
    {
        name: 'consultation:specialized',
        displayName: 'Specialized Consultation',
        description: 'Can access specialized consultation services'
    },
    // Consultant permissions
    {
        name: 'consultation:consultant.profile',
        displayName: 'Manage Consultant Profile',
        description: 'Can manage own consultant profile'
    },
    {
        name: 'consultation:consultant.availability',
        displayName: 'Manage Availability',
        description: 'Can manage availability slots'
    },
    {
        name: 'consultation:consultant.requests',
        displayName: 'View Requests',
        description: 'Can view and respond to consultation requests'
    },
    // Admin permissions
    {
        name: 'consultation.admin.view_dashboard',
        displayName: 'View Admin Dashboard',
        description: 'Can view consultation admin dashboard'
    },
    {
        name: 'consultation.admin.view_requests',
        displayName: 'View All Requests',
        description: 'Can view all consultation requests'
    },
    {
        name: 'consultation.admin.approve',
        displayName: 'Approve Consultants',
        description: 'Can approve or reject consultant applications'
    },
    {
        name: 'consultation.admin.manage_consultants',
        displayName: 'Manage Consultants',
        description: 'Can manage active consultants (suspend/activate)'
    },
    {
        name: 'consultation.admin.view_analytics',
        displayName: 'View Analytics',
        description: 'Can view consultation analytics and trends'
    },
    {
        name: 'consultation.admin.view_reports',
        displayName: 'View Reports',
        description: 'Can view revenue reports and KPIs'
    },
    {
        name: 'consultation.admin.export_reports',
        displayName: 'Export Reports',
        description: 'Can export consultation reports'
    },
    {
        name: 'consultation.expertise.read',
        displayName: 'View Expertise Categories',
        description: 'Can view expertise categories'
    },
    {
        name: 'consultation.expertise.manage',
        displayName: 'Manage Expertise Categories',
        description: 'Can create, edit, delete expertise categories'
    },

    // ============================================
    // ANALYTICS & REPORTING (9 permissions)
    // ============================================
    {
        name: 'analytics:umkm',
        displayName: 'UMKM Analytics',
        description: 'Can view UMKM analytics'
    },
    {
        name: 'analytics:programs',
        displayName: 'Program Analytics',
        description: 'Can view program analytics'
    },
    {
        name: 'analytics:lms',
        displayName: 'LMS Insights',
        description: 'Can view LMS analytics'
    },
    {
        name: 'analytics:mentoring',
        displayName: 'Mentoring Analytics',
        description: 'Can view mentoring analytics'
    },
    {
        name: 'analytics:financing',
        displayName: 'Financing Analytics',
        description: 'Can view financing analytics'
    },
    {
        name: 'analytics:marketplace',
        displayName: 'Marketplace Analytics',
        description: 'Can view marketplace analytics'
    },
    {
        name: 'analytics:export',
        displayName: 'Export Analytics',
        description: 'Can view export analytics'
    },
    {
        name: 'analytics:kpi',
        displayName: 'KPI Dashboard',
        description: 'Can view KPI dashboard'
    },
    {
        name: 'analytics:visualization',
        displayName: 'Data Visualization',
        description: 'Can create custom visualizations'
    },

    // ============================================
    // SYSTEM SETTINGS (7 permissions)
    // ============================================
    {
        name: 'settings:general',
        displayName: 'General Settings',
        description: 'Can manage general system settings'
    },
    {
        name: 'settings:branding',
        displayName: 'Branding Settings',
        description: 'Can manage branding and visual identity'
    },
    {
        name: 'settings:notifications',
        displayName: 'Notification Settings',
        description: 'Can configure notifications'
    },
    {
        name: 'settings:api_keys',
        displayName: 'API Key Management',
        description: 'Can manage API keys'
    },
    {
        name: 'settings:integrations',
        displayName: 'Integrations',
        description: 'Can manage third-party integrations'
    },
    {
        name: 'settings:backup',
        displayName: 'Backup & Restore',
        description: 'Can manage backups'
    },
    {
        name: 'settings:environment',
        displayName: 'Environment Config',
        description: 'Can configure environment variables'
    },

    // ============================================
    // LOGS & SECURITY (7 permissions)
    // ============================================
    {
        name: 'logs:login',
        displayName: 'Login Logs',
        description: 'Can view login logs'
    },
    {
        name: 'logs:activity',
        displayName: 'Activity Logs',
        description: 'Can view activity logs'
    },
    {
        name: 'logs:error',
        displayName: 'Error Logs',
        description: 'Can view error logs'
    },
    {
        name: 'logs:security',
        displayName: 'Security Audit',
        description: 'Can view security audit logs'
    },
    {
        name: 'logs:firewall',
        displayName: 'Firewall Rules',
        description: 'Can manage firewall rules'
    },
    {
        name: 'logs:api',
        displayName: 'API Logs',
        description: 'Can view API access logs'
    },
    {
        name: 'logs:backups',
        displayName: 'Backup Logs',
        description: 'Can view backup logs'
    },

    // ============================================
    // TOOLS (5 permissions)
    // ============================================
    {
        name: 'tools:import_export',
        displayName: 'Import/Export Tools',
        description: 'Can use data import/export tools'
    },
    {
        name: 'tools:cleaner',
        displayName: 'Data Cleaner',
        description: 'Can use data cleaning tools'
    },
    {
        name: 'tools:bulk_editor',
        displayName: 'Bulk Editor',
        description: 'Can use bulk edit tools'
    },
    {
        name: 'tools:sandbox',
        displayName: 'Sandbox Mode',
        description: 'Can use sandbox testing mode'
    },
    {
        name: 'tools:cache',
        displayName: 'Cache Manager',
        description: 'Can manage system cache'
    },
];

export async function seedPermissions() {
    console.log('🔐 Seeding permissions...');

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { name: permission.name },
            update: {
                displayName: permission.displayName,
                description: permission.description,
            },
            create: permission,
        });
    }

    console.log(`✅ Seeded ${permissions.length} permissions`);
}
