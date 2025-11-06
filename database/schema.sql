-- PostgreSQL schema for Saloon/SPA Reservation App

-- Users table (for customers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application users table (for admin/store owners)
CREATE TABLE app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'store_owner')), -- admin or store_owner
    store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL, -- Only for store owners
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores/Saloons table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    opening_hours JSONB, -- Store opening hours as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER, -- Duration in minutes
    price DECIMAL(10, 2),
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration INTEGER, -- Duration in minutes
    status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, completed
    total_amount DECIMAL(10, 2),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_store_id ON reservations(store_id);
CREATE INDEX idx_reservations_service_id ON reservations(service_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_stores_location ON stores(latitude, longitude);
CREATE INDEX idx_services_store_id ON services(store_id);