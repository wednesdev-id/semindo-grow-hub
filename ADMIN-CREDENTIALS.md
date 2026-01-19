# Super Admin Credentials

## Login Information

- **Email**: `admin@semindo.com`
- **Password**: `admin123`
- **Role**: Administrator (ADMIN)
- **Permissions**: Full system access

## Features

✅ Full user management
✅ Role and permission management
✅ Product management
✅ Order management
✅ Course management
✅ System settings
✅ Audit logs access

## Usage

### Login via API

```bash
curl -X POST http://localhost:9090/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@semindo.com",
    "password": "admin123"
  }'
```

### Login via Web

1. Open: https://dev.sinergiumkmindonesia.com/login
2. Email: `admin@semindo.com`
3. Password: `admin123`
4. Click "Login"

## Re-running Seed

If you need to recreate the admin user:

```bash
docker compose exec backend-dev npx ts-node prisma/seed-admin.ts
```

## Security Notes

⚠️ **IMPORTANT**: Change this password in production!

```bash
# After first login, update password via:
# Settings → Account → Change Password
```

## Permissions List

The super admin has ALL permissions:
- `users:read` - View users
- `users:write` - Manage users
- `users:delete` - Delete users
- `roles:read` - View roles
- `roles:write` - Manage roles
- `permissions:read` - View permissions
- `permissions:write` - Manage permissions
- `products:read` - View products
- `products:write` - Manage products
- `products:delete` - Delete products
- `orders:read` - View orders
- `orders:write` - Manage orders
- `courses:read` - View courses
- `courses:write` - Manage courses
- `courses:delete` - Delete courses
- `system:settings` - System settings
- `system:logs` - View system logs
