-- QR Restaurant Ordering System - Sample Data
-- Run this script in Supabase SQL Editor after running schema.sql

-- Insert categories
INSERT INTO categories (name, display_order) VALUES
    ('Appetizers', 1),
    ('Main Courses', 2),
    ('Desserts', 3),
    ('Beverages', 4)
ON CONFLICT DO NOTHING;

-- Insert menu items
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available) VALUES
    -- Appetizers
    (1, 'Spring Rolls', 'Crispy vegetable spring rolls with sweet and sour sauce', 8.99, NULL, TRUE),
    (1, 'Chicken Wings', 'Spicy buffalo wings with blue cheese dip', 12.99, NULL, TRUE),
    (1, 'Bruschetta', 'Toasted bread with fresh tomatoes, basil, and mozzarella', 9.99, NULL, TRUE),
    (1, 'Caesar Salad', 'Fresh romaine lettuce with Caesar dressing and croutons', 10.99, NULL, TRUE),
    
    -- Main Courses
    (2, 'Grilled Salmon', 'Fresh Atlantic salmon with lemon butter sauce and vegetables', 24.99, NULL, TRUE),
    (2, 'Ribeye Steak', '12oz ribeye steak cooked to perfection with mashed potatoes', 32.99, NULL, TRUE),
    (2, 'Chicken Parmesan', 'Breaded chicken breast with marinara sauce and mozzarella', 18.99, NULL, TRUE),
    (2, 'Vegetable Pasta', 'Penne pasta with seasonal vegetables in a creamy sauce', 16.99, NULL, TRUE),
    (2, 'Burger Deluxe', 'Angus beef patty with lettuce, tomato, onion, and special sauce', 15.99, NULL, TRUE),
    
    -- Desserts
    (3, 'Chocolate Cake', 'Rich chocolate layer cake with vanilla frosting', 8.99, NULL, TRUE),
    (3, 'Cheesecake', 'New York style cheesecake with berry compote', 9.99, NULL, TRUE),
    (3, 'Ice Cream Sundae', 'Vanilla ice cream with hot fudge and whipped cream', 7.99, NULL, TRUE),
    
    -- Beverages
    (4, 'Coca Cola', 'Classic cola', 2.99, NULL, TRUE),
    (4, 'Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, NULL, TRUE),
    (4, 'Coffee', 'Freshly brewed coffee', 3.99, NULL, TRUE),
    (4, 'Iced Tea', 'Refreshing iced tea', 2.99, NULL, TRUE)
ON CONFLICT DO NOTHING;

-- Insert tables (10 tables)
INSERT INTO tables (table_number, is_active) VALUES
    (1, TRUE),
    (2, TRUE),
    (3, TRUE),
    (4, TRUE),
    (5, TRUE),
    (6, TRUE),
    (7, TRUE),
    (8, TRUE),
    (9, TRUE),
    (10, TRUE)
ON CONFLICT (table_number) DO NOTHING;
