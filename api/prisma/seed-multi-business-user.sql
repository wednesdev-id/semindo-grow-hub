-- Create a dummy user with multiple businesses

-- First create a user with complete profile
INSERT INTO users (id, email, password_hash, full_name, phone, business_name, profile_picture_url, address, city, province, location, email_verified, is_active, created_at, updated_at)
VALUES (
    'dummy-multi-biz-user-001',
    'multi.bisnis@example.com',
    '$2b$10$dummyhashforbusinesstestingonly',
    'Budi Santoso Pengusaha',
    '081234567890',
    'Multi Bisnis Group',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    'Jl. Merdeka No. 100, Menteng',
    'Jakarta Pusat',
    'DKI Jakarta',
    '{"lat": -6.1944, "lng": 106.8229}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    province = EXCLUDED.province,
    location = EXCLUDED.location,
    profile_picture_url = EXCLUDED.profile_picture_url;

-- Assign UMKM role to this user
INSERT INTO
    user_roles (user_id, role_id, assigned_at)
SELECT 'dummy-multi-biz-user-001', id, NOW()
FROM roles
WHERE
    name = 'umkm' ON CONFLICT DO NOTHING;

-- Create multiple UMKM profiles for this user
-- Business 1: Kuliner
INSERT INTO umkm_profiles (id, user_id, business_name, owner_name, address, city, province, location, sector, phone, email, status, segmentation, created_at, updated_at)
VALUES (
    'multi-biz-umkm-001',
    'dummy-multi-biz-user-001',
    'Warung Makan Sederhana',
    'Budi Santoso',
    'Jl. Kebon Jeruk No. 50',
    'Jakarta Barat',
    'DKI Jakarta',
    '{"lat": -6.1869, "lng": 106.7654}'::jsonb,
    'Kuliner',
    '081234567891',
    'warung.sederhana@example.com',
    'verified',
    'Madya',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Business 2: Fashion
INSERT INTO umkm_profiles (id, user_id, business_name, owner_name, address, city, province, location, sector, phone, email, status, segmentation, created_at, updated_at)
VALUES (
    'multi-biz-umkm-002',
    'dummy-multi-biz-user-001',
    'Batik Nusantara Collection',
    'Budi Santoso',
    'Jl. Pasar Baru No. 88',
    'Jakarta Pusat',
    'DKI Jakarta',
    '{"lat": -6.1685, "lng": 106.8452}'::jsonb,
    'Fashion',
    '081234567892',
    'batik.nusantara@example.com',
    'verified',
    'Utama',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Business 3: Kerajinan
INSERT INTO umkm_profiles (id, user_id, business_name, owner_name, address, city, province, location, sector, phone, email, status, segmentation, created_at, updated_at)
VALUES (
    'multi-biz-umkm-003',
    'dummy-multi-biz-user-001',
    'Craft & Handmade Store',
    'Budi Santoso',
    'Jl. Kemang Raya No. 25',
    'Jakarta Selatan',
    'DKI Jakarta',
    '{"lat": -6.2615, "lng": 106.8145}'::jsonb,
    'Kerajinan',
    '081234567893',
    'craft.handmade@example.com',
    'submitted',
    'Pemula',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT
    u.id,
    u.full_name,
    u.email,
    u.phone,
    u.address as user_address,
    u.city as user_city,
    COUNT(up.id) as total_businesses
FROM users u
    LEFT JOIN umkm_profiles up ON u.id = up.user_id
WHERE
    u.id = 'dummy-multi-biz-user-001'
GROUP BY
    u.id;

SELECT
    id,
    business_name,
    sector,
    city,
    status,
    segmentation
FROM umkm_profiles
WHERE
    user_id = 'dummy-multi-biz-user-001';