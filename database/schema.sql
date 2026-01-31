-- QR Restaurant Ordering System - Database Schema
-- Run this script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_display_order ON categories(display_order);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    table_number INTEGER NOT NULL UNIQUE,
    qr_code_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tables_table_number ON tables(table_number);
CREATE INDEX idx_tables_is_active ON tables(is_active);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
    items JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    customer_name VARCHAR(200),
    special_instructions TEXT,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE categories IS 'Menu categories (e.g., Appetizers, Main Courses)';
COMMENT ON TABLE menu_items IS 'Individual menu items with pricing and availability';
COMMENT ON TABLE tables IS 'Restaurant tables with QR codes';
COMMENT ON TABLE orders IS 'Customer orders with payment status';
COMMENT ON COLUMN orders.items IS 'JSONB array: [{item_id, name, price, quantity, subtotal}]';
