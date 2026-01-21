-- Script to add dummy User personal locations (different from UMKM business locations)
-- This demonstrates the separation between owner address and business address

-- First ensure columns exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS location JSONB;

-- Update some users with dummy personal locations
-- These locations are intentionally different from their UMKM business locations

-- User 1: Personal location in Jakarta (business might be elsewhere)
UPDATE users 
SET 
    address = 'Jl. Sudirman No. 123, Menteng',
    city = 'Jakarta Pusat',
    province = 'DKI Jakarta',
    location = '{"lat": -6.1944, "lng": 106.8229}'::jsonb
WHERE id IN (
    SELECT user_id FROM umkm_profiles 
    WHERE location IS NOT NULL 
    LIMIT 1
);

-- User 2: Personal location in Bandung
UPDATE users 
SET 
    address = 'Jl. Asia Afrika No. 45, Braga',
    city = 'Bandung',
    province = 'Jawa Barat',
    location = '{"lat": -6.9175, "lng": 107.6191}'::jsonb
WHERE id IN (
    SELECT user_id FROM umkm_profiles 
    WHERE location IS NOT NULL 
    LIMIT 1 OFFSET 1
);

-- User 3: Personal location in Surabaya
UPDATE users 
SET 
    address = 'Jl. Tunjungan No. 78, Genteng',
    city = 'Surabaya',
    province = 'Jawa Timur',
    location = '{"lat": -7.2575, "lng": 112.7521}'::jsonb
WHERE id IN (
    SELECT user_id FROM umkm_profiles 
    WHERE location IS NOT NULL 
    LIMIT 1 OFFSET 2
);

-- User 4: Personal location in Yogyakarta
UPDATE users 
SET 
    address = 'Jl. Malioboro No. 56, Danurejan',
    city = 'Yogyakarta',
    province = 'DI Yogyakarta',
    location = '{"lat": -7.7956, "lng": 110.3695}'::jsonb
WHERE id IN (
    SELECT user_id FROM umkm_profiles 
    WHERE location IS NOT NULL 
    LIMIT 1 OFFSET 3
);

-- User 5: Personal location in Bali
UPDATE users 
SET 
    address = 'Jl. Sunset Road No. 99, Kuta',
    city = 'Badung',
    province = 'Bali',
    location = '{"lat": -8.7220, "lng": 115.1710}'::jsonb
WHERE id IN (
    SELECT user_id FROM umkm_profiles 
    WHERE location IS NOT NULL 
    LIMIT 1 OFFSET 4
);

-- Verify the updates
SELECT
    u.id,
    u.full_name,
    u.city as user_city,
    u.province as user_province,
    u.location as user_location,
    up.business_name,
    up.city as umkm_city,
    up.province as umkm_province
FROM users u
    JOIN umkm_profiles up ON u.id = up.user_id
WHERE
    u.location IS NOT NULL
LIMIT 5;