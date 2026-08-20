-- =========================================================
-- ESQUEMA DE BASE DE DATOS PARA CHAMPIONSVIP EN SUPABASE
-- =========================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'client', -- 'admin' o 'client'
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    apellido VARCHAR(100) NOT NULL DEFAULT '',
    phone VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
    bonus_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
    withdraw_account_name VARCHAR(150),
    withdraw_bank_name VARCHAR(100),
    withdraw_account_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- 2. Tabla de Productos (Tokens)
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    daily_income NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_income NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    days_duration INTEGER NOT NULL DEFAULT 90,
    vip_level INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NOT NULL
);

-- 3. Tabla de Transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'deposit', 'investment', 'claim'
    amount NUMERIC(12, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC'),
    details VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'approved' -- 'pending', 'approved', 'rejected'
);

-- 4. Tabla de Inversiones de Usuarios (UserProducts)
CREATE TABLE IF NOT EXISTS user_products (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC'),
    last_claimed_at TIMESTAMP WITH TIME ZONE,
    times_claimed INTEGER NOT NULL DEFAULT 0
);

-- =========================================================
-- DATOS INICIALES (SEEDS)
-- =========================================================

-- Limpiar tablas si se desea reiniciar
-- TRUNCATE TABLE user_products, transactions, products, users RESTART IDENTITY CASCADE;

-- Admin: saturno6 / h36dt100 (hash bcrypt)
INSERT INTO users (username, password_hash, role, nombre, apellido, phone, balance)
VALUES (
    'saturno6',
    '$2a$10$3zZ3c9f2O67q19WbXkM6x.4k5JtG8n0V51qQeM11V2q0jWpT6b6Ce', -- hash de h36dt100
    'admin',
    'Admin',
    'System',
    '+593000000000',
    0.00
)
ON CONFLICT (username) DO NOTHING;

-- Cliente demo: +593984917595 / client123 (hash bcrypt)
INSERT INTO users (username, password_hash, role, nombre, apellido, phone, balance)
VALUES (
    '+593984917595',
    '$2a$10$qR6Q06cO5W5M77mYQd2lE.2g7zT1W3n7H9jE8k4L1a0M9q5K2b3Xe', -- hash de client123
    'client',
    'Usuario',
    'Demo',
    '+593984917595',
    3.45
)
ON CONFLICT (username) DO NOTHING;

-- 9 Tokens Oficiales de Jugadores
INSERT INTO products (title, description, price, daily_income, total_income, days_duration, vip_level, image_url)
VALUES
    ('Vinicius-Token', 'Ingresos diarios totales $90.0', 7.00, 1.00, 90.00, 90, 1, '/images/1.png'),
    ('Neymar-Token', 'Ingresos diarios totales $270.0', 18.00, 3.00, 270.00, 90, 2, '/images/2.png'),
    ('Messi-Token', 'Ingresos diarios totales $720.0', 40.00, 8.00, 720.00, 90, 3, '/images/3.png'),
    ('CristianoRonaldo-Token', 'Ingresos diarios totales $2250.0', 100.00, 25.00, 2250.00, 90, 4, '/images/4.png'),
    ('Bellingham-Token', 'Ingresos diarios totales $4770.0', 200.00, 53.00, 4770.00, 90, 5, '/images/5.png'),
    ('HarryKane-Token', 'Ingresos diarios totales $10080.0', 400.00, 112.00, 10080.00, 90, 6, '/images/6.png'),
    ('LamineYamal-Token', 'Ingresos diarios totales $21150.0', 800.00, 235.00, 21150.00, 90, 7, '/images/7.png'),
    ('Haaland-Token', 'Ingresos diarios totales $45000.0', 1500.00, 500.00, 45000.00, 90, 8, '/images/8.png'),
    ('Mbappe-Token', 'Ingresos diarios totales $63007.0', 2000.00, 700.00, 63007.00, 90, 9, '/images/9.png')
ON CONFLICT DO NOTHING;
