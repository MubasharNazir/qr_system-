# Database Setup Guide

This directory contains SQL scripts for setting up the database schema and sample data in Supabase.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your database connection string (Settings → Database → Connection string)

### 2. Run Schema Script

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Click "Run" to execute

This will create:
- `categories` table
- `menu_items` table
- `tables` table
- `orders` table
- All necessary indexes
- Triggers for `updated_at` timestamp

### 3. Run Sample Data Script (Optional)

1. In SQL Editor, copy and paste the contents of `sample_data.sql`
2. Click "Run" to execute

This will insert:
- 4 categories (Appetizers, Main Courses, Desserts, Beverages)
- 17 sample menu items
- 10 tables (numbered 1-10)

### 4. Update Backend Configuration

Update your backend `.env` file with the Supabase connection string:

```env
DATABASE_URL=postgresql+asyncpg://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## Database Schema

### Tables

#### `categories`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)

#### `menu_items`
- `id` (SERIAL PRIMARY KEY)
- `category_id` (INTEGER, FK → categories)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (NUMERIC)
- `image_url` (VARCHAR)
- `is_available` (BOOLEAN)
- `created_at` (TIMESTAMP)

#### `tables`
- `id` (SERIAL PRIMARY KEY)
- `table_number` (INTEGER, UNIQUE)
- `qr_code_url` (VARCHAR)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

#### `orders`
- `id` (UUID PRIMARY KEY)
- `table_id` (INTEGER, FK → tables)
- `items` (JSONB) - Array of order items
- `total_amount` (NUMERIC)
- `customer_name` (VARCHAR, nullable)
- `special_instructions` (TEXT, nullable)
- `payment_status` (VARCHAR) - 'pending', 'paid', 'failed'
- `stripe_session_id` (VARCHAR, unique)
- `stripe_payment_intent_id` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Indexes

The schema includes indexes on:
- `categories(display_order)`
- `menu_items(category_id)`
- `menu_items(is_available)`
- `tables(table_number)`
- `tables(is_active)`
- `orders(table_id)`
- `orders(payment_status)`
- `orders(created_at DESC)`
- `orders(stripe_session_id)`

## Row Level Security (Optional)

For production, you may want to add Row Level Security (RLS) policies. Example:

```sql
-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to menu items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON menu_items FOR SELECT USING (true);
```

## Notes

- The `orders.items` column is JSONB and stores an array of objects:
  ```json
  [
    {
      "item_id": 1,
      "name": "Spring Rolls",
      "price": 8.99,
      "quantity": 2,
      "subtotal": 17.98
    }
  ]
  ```

- Payment status is enforced via CHECK constraint: 'pending', 'paid', 'failed'
- The `updated_at` column is automatically updated via trigger
