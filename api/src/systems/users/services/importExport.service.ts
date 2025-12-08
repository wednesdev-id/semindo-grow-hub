import { db } from '../../utils/db';
import { AuditService } from '../../audit/services/audit.service';
import { hashPassword } from '../../utils/password';

interface ImportRow {
    email: string;
    fullName: string;
    phone?: string;
    businessName?: string;
    role: string;
    isActive?: boolean;
}

interface ValidationError {
    row: number;
    field: string;
    message: string;
    value?: any;
}

export class ImportExportService {
    private auditService = new AuditService();

    async exportToCSV(filters: any = {}) {
        // Build where clause from filters
        const where: any = {};

        if (filters.role && filters.role !== 'all') {
            where.userRoles = {
                some: {
                    role: { name: filters.role }
                }
            };
        }

        if (filters.isActive && filters.isActive !== 'all') {
            where.isActive = filters.isActive === 'true';
        }

        if (filters.search) {
            where.OR = [
                { email: { contains: filters.search, mode: 'insensitive' } },
                { fullName: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        // Fetch users
        const users = await db.user.findMany({
            where,
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Generate CSV
        const headers = ['email', 'fullName', 'phone', 'businessName', 'role', 'isActive'];
        const rows = users.map(user => [
            user.email,
            user.fullName,
            user.phone || '',
            user.businessName || '',
            user.userRoles.map(ur => ur.role.name).join(';'),
            user.isActive.toString()
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csv;
    }

    async generateTemplate() {
        const headers = ['email', 'fullName', 'phone', 'businessName', 'role', 'isActive'];
        const example = [
            'user@example.com',
            'John Doe',
            '+62812345678',
            'My Business',
            'umkm',
            'true'
        ];

        const csv = [
            headers.join(','),
            example.map(cell => `"${cell}"`).join(',')
        ].join('\n');

        return csv;
    }

    parseCSV(csvContent: string): ImportRow[] {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file is empty or invalid');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows: ImportRow[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};

            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            rows.push({
                email: row.email,
                fullName: row.fullName,
                phone: row.phone,
                businessName: row.businessName,
                role: row.role,
                isActive: row.isActive === 'true' || row.isActive === '1' || row.isActive === ''
            });
        }

        return rows;
    }

    async validateImportData(rows: ImportRow[]) {
        const errors: ValidationError[] = [];
        const validRows: ImportRow[] = [];

        // Get all existing emails
        const existingEmails = await db.user.findMany({
            select: { email: true }
        });
        const emailSet = new Set(existingEmails.map(u => u.email.toLowerCase()));

        // Get all valid roles
        const roles = await db.role.findMany();
        const roleNames = new Set(roles.map(r => r.name));

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // +2 because row 1 is header, and we're 0-indexed
            let hasError = false;

            // Validate email
            if (!row.email) {
                errors.push({
                    row: rowNumber,
                    field: 'email',
                    message: 'Email is required'
                });
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                errors.push({
                    row: rowNumber,
                    field: 'email',
                    message: 'Invalid email format',
                    value: row.email
                });
                hasError = true;
            } else if (emailSet.has(row.email.toLowerCase())) {
                errors.push({
                    row: rowNumber,
                    field: 'email',
                    message: 'Email already exists',
                    value: row.email
                });
                hasError = true;
            }

            // Validate fullName
            if (!row.fullName || row.fullName.length < 2) {
                errors.push({
                    row: rowNumber,
                    field: 'fullName',
                    message: 'Full name is required (min 2 characters)',
                    value: row.fullName
                });
                hasError = true;
            }

            // Validate role
            if (!row.role) {
                errors.push({
                    row: rowNumber,
                    field: 'role',
                    message: 'Role is required'
                });
                hasError = true;
            } else if (!roleNames.has(row.role)) {
                errors.push({
                    row: rowNumber,
                    field: 'role',
                    message: `Invalid role: '${row.role}'. Valid roles: ${Array.from(roleNames).join(', ')}`,
                    value: row.role
                });
                hasError = true;
            }

            if (!hasError) {
                validRows.push(row);
            }
        }

        return {
            valid: validRows.length,
            invalid: errors.length,
            errors,
            preview: validRows.slice(0, 5) // Show first 5 valid rows
        };
    }

    async importUsers(rows: ImportRow[], performedBy?: string) {
        const results = {
            imported: 0,
            failed: 0,
            errors: [] as Array<{ row: number; email: string; error: string }>
        };

        // Validate first
        const validation = await this.validateImportData(rows);
        if (validation.invalid > 0) {
            throw new Error(`Validation failed: ${validation.invalid} invalid rows`);
        }

        // Import users
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2;

            try {
                // Generate default password
                const defaultPassword = 'Welcome123!';
                const passwordHash = await hashPassword(defaultPassword);

                // Get role
                const role = await db.role.findUnique({
                    where: { name: row.role }
                });

                if (!role) {
                    throw new Error(`Role not found: ${row.role}`);
                }

                // Create user
                const user = await db.user.create({
                    data: {
                        email: row.email,
                        passwordHash,
                        fullName: row.fullName,
                        phone: row.phone,
                        businessName: row.businessName,
                        isActive: row.isActive ?? true,
                        emailVerified: false,
                        userRoles: {
                            create: {
                                roleId: role.id
                            }
                        }
                    }
                });

                // Audit log
                await this.auditService.createLog({
                    userId: performedBy,
                    action: 'user.import',
                    resource: 'user',
                    resourceId: user.id,
                    oldValue: null,
                    newValue: {
                        email: user.email,
                        fullName: user.fullName,
                        role: row.role
                    }
                });

                results.imported++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    row: rowNumber,
                    email: row.email,
                    error: error.message
                });
            }
        }

        return results;
    }
}
