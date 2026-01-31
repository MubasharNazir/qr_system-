# Database Setup Complete! ✅

## Database Information

**Database Name:** `restaurant_db`  
**Host:** `localhost`  
**Port:** `5432`  
**User:** Your macOS username (default PostgreSQL user)

## Connection String

For the backend `.env` file, use:

```env
DATABASE_URL=postgresql+asyncpg://YOUR_USERNAME@localhost:5432/restaurant_db
```

Replace `YOUR_USERNAME` with your macOS username (run `whoami` to find it).

**Example:**
```env
DATABASE_URL=postgresql+asyncpg://mubashar@localhost:5432/restaurant_db
```

## Database Status

✅ **Database Created:** `restaurant_db`  
✅ **Tables Created:** 4 tables
- `categories` - Menu categories
- `menu_items` - Menu items
- `tables` - Restaurant tables
- `orders` - Customer orders

✅ **Sample Data Loaded:**
- 4 categories (Appetizers, Main Courses, Desserts, Beverages)
- 16 menu items
- 10 tables (numbered 1-10)

## Verify Database

You can verify the database by running:

```bash
psql -d restaurant_db -c "\dt"  # List all tables
psql -d restaurant_db -c "SELECT * FROM categories;"  # View categories
psql -d restaurant_db -c "SELECT * FROM tables;"  # View tables
```

## Next Steps

1. Update `backend/.env` with the DATABASE_URL above
2. Start the backend server
3. Test the menu endpoint: `http://localhost:8000/api/menu?table=1`

## PostgreSQL Management

**Start PostgreSQL:**
```bash
brew services start postgresql@14
```

**Stop PostgreSQL:**
```bash
brew services stop postgresql@14
```

**Check Status:**
```bash
brew services list | grep postgresql
```

**Connect to Database:**
```bash
psql -d restaurant_db
```
