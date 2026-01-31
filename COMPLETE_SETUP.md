# Complete Setup Guide - QR Restaurant Ordering System

## ✅ Current Status

- ✅ Backend running on: `http://localhost:8000`
- ✅ Frontend running on: `http://localhost:5173`
- ✅ Database created with 10 tables
- ✅ Sample menu items loaded

## 📱 How to Use QR Codes

### Step 1: Generate QR Codes

I've created a Python script that generates QR codes for all tables!

**Option A: Use the Python script (Recommended)**
```bash
cd "/Users/mubashar/Desktop/Order Management System"
python3 generate_qr_codes.py
```

This will create QR codes in the `qr_codes/` folder for tables 1-10.

**Option B: Use online generator**
1. Go to https://www.qr-code-generator.com/
2. For each table, create a QR code with URL:
   - Table 1: `http://localhost:5173/menu?table=1`
   - Table 2: `http://localhost:5173/menu?table=2`
   - ... and so on

### Step 2: Test QR Codes

1. **Open QR code image** on your computer
2. **Use your phone's camera** to scan it
3. **Phone should open browser** → Goes to menu page
4. **Verify it shows the menu** for that table

**Important for local testing:**
- Your phone must be on the **same WiFi network** as your computer
- Or use your computer's IP address: `http://192.168.1.124:5173/menu?table=1`

### Step 3: Print and Place QR Codes

1. Print the QR code images (at least 2x2 inches)
2. Place each QR code on the corresponding physical table
3. Add text: "Scan to Order" or "Scan QR Code to View Menu"

## 🎯 Complete Customer Flow

### What Happens When Customer Scans:

1. **Customer scans QR code** → Phone opens browser
2. **URL loads**: `http://localhost:5173/menu?table=5`
3. **Frontend extracts table number** from URL (`table=5`)
4. **Frontend calls backend**: `GET /api/menu?table=5`
5. **Backend validates table** exists in database
6. **Backend returns menu** with categories and items
7. **Frontend displays menu** organized by category
8. **Customer adds items to cart**
9. **Customer clicks "Proceed to Payment"**
10. **Frontend calls**: `POST /api/checkout/create-session`
11. **Backend creates order** in database
12. **Backend creates Stripe checkout session**
13. **Customer redirected to Stripe** payment page
14. **After payment** → Stripe redirects to: `/order-confirmation?session_id=xxx`
15. **Stripe webhook** updates order status to "paid"
16. **Order confirmed!** ✅

## 🧪 Testing the Complete Flow

### Test Locally:

1. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Menu Endpoint:**
   ```bash
   curl "http://localhost:8000/api/menu?table=1"
   ```
   Should return menu data with categories and items.

4. **Test in Browser:**
   - Open: `http://localhost:5173/menu?table=1`
   - Should see menu with categories
   - Try adding items to cart
   - Test checkout flow (will need Stripe keys for full test)

5. **Test QR Code:**
   - Open QR code image on computer
   - Scan with phone camera
   - Should open menu page on phone

## 🌐 For Production Deployment

### When you're ready to go live:

1. **Deploy Backend** to Google Cloud Run
   - Update `DATABASE_URL` to production Supabase
   - Update `FRONTEND_URL` to production domain
   - Set Stripe production keys

2. **Deploy Frontend** to Cloudflare Pages
   - Update `VITE_API_URL` to production backend URL
   - Build and deploy

3. **Update QR Codes:**
   - Change BASE_URL in `generate_qr_codes.py` to your domain
   - Regenerate QR codes: `python3 generate_qr_codes.py`
   - Print new QR codes with production URLs

4. **Place QR Codes:**
   - Print and place on physical tables
   - Customers can now scan and order!

## 📋 Quick Reference

### Backend URLs:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/health`

### Frontend URLs:
- Menu (Table 1): `http://localhost:5173/menu?table=1`
- Menu (Table 5): `http://localhost:5173/menu?table=5`
- Order Confirmation: `http://localhost:5173/order-confirmation?session_id=xxx`

### Database:
- Name: `restaurant_db`
- Tables: 1-10 (all active)
- Categories: 4 (Appetizers, Main Courses, Desserts, Beverages)
- Menu Items: 16 total

## 🎉 You're All Set!

Everything is running and ready to test. Generate your QR codes and start testing the complete flow!
