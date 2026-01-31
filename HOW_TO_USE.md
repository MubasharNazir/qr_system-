# 🎯 How to Use Your QR Restaurant Ordering System

## ✅ Everything is Ready!

- ✅ Backend running: `http://localhost:8000`
- ✅ Frontend running: `http://localhost:5173`
- ✅ Database with 10 tables
- ✅ QR codes generated in `qr_codes/` folder

## 📱 Step-by-Step: How It Works

### For You (Restaurant Owner):

1. **QR codes are ready!** 
   - Location: `qr_codes/table_1_qr.png` through `table_10_qr.png`
   - Each QR code links to: `http://localhost:5173/menu?table=X`

2. **Print the QR codes**
   - Open the PNG files from `qr_codes/` folder
   - Print them (at least 2x2 inches / 5x5 cm)
   - Place each QR code on the corresponding physical table

3. **That's it!** Customers can now scan and order.

### For Customers:

1. **Customer sits at Table 5**
2. **Sees QR code** on the table
3. **Opens phone camera** (no app needed!)
4. **Scans QR code**
5. **Phone opens browser** → Menu page loads
6. **Sees menu** with all items organized by category
7. **Adds items to cart** (tap "Add to Cart" button)
8. **Clicks cart icon** (floating button, bottom right)
9. **Reviews order** in cart drawer
10. **Enters name** (optional) and special instructions
11. **Clicks "Proceed to Payment"**
12. **Redirected to Stripe** → Enters payment info
13. **After payment** → Sees confirmation page
14. **Order is placed!** ✅

## 🧪 How to Test Right Now

### Test 1: Open Menu in Browser
1. Open: `http://localhost:5173/menu?table=1`
2. You should see the menu with categories
3. Try adding items to cart

### Test 2: Scan QR Code
1. Open `qr_codes/table_1_qr.png` on your computer
2. Use your **phone's camera** to scan it
3. Make sure your phone is on the **same WiFi** as your computer
4. Phone should open the menu page

**Note:** For local testing, your phone needs to be on the same WiFi network. If it doesn't work, try:
- Use your computer's IP: `http://192.168.1.124:5173/menu?table=1`
- Or use a QR code scanner app that shows the URL, then open it manually

### Test 3: Complete Order Flow
1. Scan QR code or open `http://localhost:5173/menu?table=1`
2. Add items to cart
3. Open cart (floating button)
4. Fill in name/instructions
5. Click "Proceed to Payment"
   - ⚠️ This will need Stripe keys configured to work fully
   - But you can test the UI flow

## 🔍 What Each QR Code Contains

Each QR code is just a URL:
- **Table 1**: `http://localhost:5173/menu?table=1`
- **Table 2**: `http://localhost:5173/menu?table=2`
- **Table 3**: `http://localhost:5173/menu?table=3`
- ... and so on

When scanned, the phone opens this URL in the browser.

## 🌐 For Production (When You Deploy)

When you're ready to go live:

1. **Deploy frontend** to Cloudflare Pages
   - Get your domain: `https://your-restaurant.com`

2. **Update QR codes:**
   ```bash
   # Edit generate_qr_codes.py
   # Change: BASE_URL = "https://your-restaurant.com"
   # Then run:
   python3 generate_qr_codes.py
   ```

3. **Print new QR codes** with production URLs

4. **Place on tables** - Customers can now order!

## 📋 Quick Reference

### Current URLs (Local Development):
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`
- **Menu (Table 1)**: `http://localhost:5173/menu?table=1`
- **Menu (Table 5)**: `http://localhost:5173/menu?table=5`

### QR Code Files:
- Location: `qr_codes/` folder
- Files: `table_1_qr.png` through `table_10_qr.png`
- Each contains URL for that specific table

## 🎉 You're All Set!

Everything is working. Just:
1. ✅ Print the QR codes
2. ✅ Place them on tables
3. ✅ Customers scan and order!

**Need help?** Check `QR_CODE_GUIDE.md` for more details!
