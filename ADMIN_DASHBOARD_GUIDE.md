# 🎛️ Admin Dashboard Guide

## ✅ Admin Dashboard is Ready!

A complete admin dashboard has been created where restaurant owners can:
- ✅ Login with static password
- ✅ Manage menu items (add, edit, delete)
- ✅ Manage categories
- ✅ View all orders
- ✅ Generate and download QR codes

## 🔐 How to Login

1. **Go to admin login page:**
   ```
   http://localhost:5173/admin/login
   ```

2. **Enter password:**
   - Default password: `admin123`
   - (You can change this in `backend/.env` file)

3. **Click "Login"** → You'll be redirected to the dashboard

## 📋 Admin Dashboard Features

### 1. **Menu Management** (`/admin/menu`)
- View all categories and menu items
- Add new categories
- Add new menu items
- Edit existing items
- Delete items/categories
- Toggle item availability

### 2. **Orders View** (`/admin/orders`)
- See all customer orders
- View order details (table, items, total, customer name)
- See payment status (paid/pending/failed)
- View order timestamps

### 3. **QR Code Generator** (`/admin/qr-codes`)
- View QR codes for all tables (1-10)
- Download individual QR codes
- Download all QR codes at once
- See the URL each QR code links to

## 🚀 Quick Start

### Step 1: Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Access Admin Dashboard
1. Open: `http://localhost:5173/admin/login`
2. Enter password: `admin123`
3. Start managing your restaurant!

## 🔧 Configuration

### Change Admin Password

Edit `backend/.env` file:
```env
ADMIN_PASSWORD=your_secure_password_here
```

Then restart the backend server.

## 📱 Admin Dashboard URLs

- **Login**: `http://localhost:5173/admin/login`
- **Dashboard**: `http://localhost:5173/admin/dashboard`
- **Menu Management**: `http://localhost:5173/admin/menu`
- **Orders**: `http://localhost:5173/admin/orders`
- **QR Codes**: `http://localhost:5173/admin/qr-codes`

## 🎯 Workflow Example

1. **Login to admin dashboard**
2. **Go to Menu Management**
3. **Add a new category** (e.g., "Specials")
4. **Add menu items** to that category
5. **Go to QR Codes** → Download QR codes
6. **Print QR codes** and place on tables
7. **Go to Orders** → Monitor incoming orders

## 🔒 Security Notes

- **Current setup uses static password** - Simple but secure enough for small restaurants
- **For production**, consider:
  - Using environment variables for password
  - Implementing JWT tokens with expiration
  - Adding rate limiting
  - Using HTTPS

## 🎉 You're All Set!

The admin dashboard is fully functional. You can now:
- ✅ Manage your menu without touching the database
- ✅ Generate QR codes on demand
- ✅ Monitor all orders in real-time

Enjoy managing your restaurant! 🍽️
