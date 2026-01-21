-- Create dummy mentor users with personal locations

-- Mentor 1
INSERT INTO users (id, email, password_hash, full_name, phone, profile_picture_url, address, city, province, location, email_verified, is_active, created_at, updated_at)
VALUES (
    'dummy-mentor-user-001',
    'mentor1@example.com',
    '$2b$10$dummyhashforbusinesstestingonly',
    'Dr. Ahmad Wijaya',
    '081234567894',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    'Jl. Diponegoro No. 50',
    'Semarang',
    'Jawa Tengah',
    '{"lat": -6.9932, "lng": 110.4203}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Assign mentor role
INSERT INTO
    user_roles (user_id, role_id, assigned_at)
SELECT 'dummy-mentor-user-001', id, NOW()
FROM roles
WHERE
    name = 'mentor' ON CONFLICT DO NOTHING;

-- Create mentor profile
INSERT INTO
    mentor_profiles (
        id,
        user_id,
        specialization,
        experience,
        bio,
        rating,
        is_verified,
        created_at,
        updated_at
    )
VALUES (
        'mentor-profile-001',
        'dummy-mentor-user-001',
        'Digital Marketing',
        10,
        'Ahli strategi digital marketing dengan pengalaman 10+ tahun membantu UMKM go digital.',
        4.8,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

-- Mentor 2
INSERT INTO users (id, email, password_hash, full_name, phone, profile_picture_url, address, city, province, location, email_verified, is_active, created_at, updated_at)
VALUES (
    'dummy-mentor-user-002',
    'mentor2@example.com',
    '$2b$10$dummyhashforbusinesstestingonly',
    'Ibu Ratna Kusuma',
    '081234567895',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ratna',
    'Jl. A. Yani No. 100',
    'Makassar',
    'Sulawesi Selatan',
    '{"lat": -5.1477, "lng": 119.4327}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO
    user_roles (user_id, role_id, assigned_at)
SELECT 'dummy-mentor-user-002', id, NOW()
FROM roles
WHERE
    name = 'mentor' ON CONFLICT DO NOTHING;

INSERT INTO
    mentor_profiles (
        id,
        user_id,
        specialization,
        experience,
        bio,
        rating,
        is_verified,
        created_at,
        updated_at
    )
VALUES (
        'mentor-profile-002',
        'dummy-mentor-user-002',
        'Financial Management',
        8,
        'Konsultan keuangan berpengalaman untuk UKM dan startup.',
        4.9,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT u.full_name, u.city, u.province, r.name as role
FROM
    users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
WHERE
    r.name = 'mentor';