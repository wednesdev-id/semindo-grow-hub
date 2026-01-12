import { seedPermissions } from './permissions.seed';
import { seedRolePermissions } from './role-permissions.seed';

async function main() {
    console.log('Starting permission and role-permission seeding...\n');

    // First seed permissions
    await seedPermissions();

    // Then seed role-permission mappings
    await seedRolePermissions();

    console.log('\n✅ All seeding completed!');
    process.exit(0);
}

main().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});
