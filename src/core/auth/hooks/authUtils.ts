import { UserRole } from '../types';

export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case 'umkm':
      return '/dashboard';
    case 'consultant':
      return '/consultant-dashboard';
    case 'admin':
      return '/admin-dashboard';
    case 'partner':
      return '/partner-dashboard';
    case 'bank':
      return '/bank-dashboard';
    default:
      return '/dashboard';
  }
}

export function getRolePermissions(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    umkm: [
      'read:profile',
      'update:profile',
      'read:business',
      'update:business',
      'take:assessment',
      'read:assessment',
      'enroll:course',
      'complete:course',
      'book:consultation',
      'read:consultation',
      'apply:financing',
      'read:financing',
      'create:product',
      'update:product',
      'delete:product',
      'read:marketplace',
      'create:forum',
      'read:forum'
    ],
    consultant: [
      'read:profile',
      'update:profile',
      'read:consultation',
      'update:consultation',
      'read:forum',
      'moderate:forum'
    ],
    bank: [
      'read:profile',
      'update:profile',
      'read:financing',
      'update:financing'
    ],
    partner: [
      'read:profile',
      'update:profile',
      'read:business',
      'read:marketplace'
    ],
    admin: [
      'admin:*'
    ]
  };

  return permissions[role] || [];
}