# QR Code Guide - Complete Setup & Usage

## 🎯 How QR Codes Work in This System

### The Flow:
1. **You generate a QR code** for each table (e.g., Table 5)
2. **QR code contains a URL** like: `http://localhost:5173/menu?table=5`
3. **Customer scans QR code** with their phone camera
4. **Phone opens the URL** in browser
5. **Frontend shows menu** for that specific table
6. **Customer orders** → **Pays** → **Order confirmed**

## 📱 How Customers Use It

### Step-by-Step Customer Journey:

1. **Customer sits at Table 5**
2. **Scans QR code** on the table (using phone camera - no app needed!)
3. **Phone opens browser** → Goes to: `http://localhost:5173/menu?table=5`
4. **Sees menu** with all available items
5. **Adds items to cart** (floating cart button appears)
6. **Clicks cart button** → Reviews order
7. **Enters name** (optional) and special instructions
8. **Clicks "Proceed to Payment"**
9. **Redirected to Stripe Checkout** → Enters payment info
10. **After payment** → Redirected to confirmation page
11. **Order is saved** in database with table number

## 🔧 How to Generate QR Codes

### Option 1: Online QR Code Generator (Easiest)

1. Go to: https://www.qr-code-generator.com/ or https://qr.io/
2. Select **"URL"** type
3. Enter URL: `http://localhost:5173/menu?table=1` (for Table 1)
4. Click **"Generate QR Code"**
5. Download the image
6. Print and place on Table 1
7. Repeat for each table (1-10)

### Option 2: Python Script (Automated)

I'll create a script that generates QR codes for all tables automatically!

### Option 3: JavaScript/Node.js (For Web)

You can also generate QR codes programmatically in your admin panel.

## 🌐 URLs for Each Table

For **local development** (localhost):
- Table 1: `http://localhost:5173/menu?table=1`
- Table 2: `http://localhost:5173/menu?table=2`
- Table 3: `http://localhost:5173/menu?table=3`
- ... and so on up to Table 10

For **production** (after deployment):
- Table 1: `https://yourdomain.com/menu?table=1`
- Table 2: `https://yourdomain.com/menu?table=2`
- etc.

## 📋 Quick Setup Checklist

- [ ] Generate QR code for Table 1
- [ ] Generate QR code for Table 2
- [ ] ... (repeat for all 10 tables)
- [ ] Print QR codes
- [ ] Place QR codes on physical tables
- [ ] Test by scanning with your phone

## 🧪 Testing QR Codes Locally

### On Your Computer:
1. Generate QR code with localhost URL
2. Use your phone's camera to scan (make sure phone is on same WiFi)
3. Or use a QR code scanner app
4. The URL should open in your phone's browser

### Important for Local Testing:
- **Frontend must be running** on `http://localhost:5173`
- **Backend must be running** on `http://localhost:8000`
- **Phone must be on same WiFi network** as your computer
- Or use your computer's IP: `http://192.168.1.124:5173/menu?table=1`

## 🚀 Production Deployment

When you deploy to production:

1. **Deploy frontend** to Cloudflare Pages (or similar)
   - Get your domain: `https://your-restaurant.com`

2. **Update QR code URLs** to use production domain:
   - `https://your-restaurant.com/menu?table=1`
   - `https://your-restaurant.com/menu?table=2`
   - etc.

3. **Regenerate QR codes** with production URLs

4. **Print and place** on tables

## 💡 Pro Tips

1. **Make QR codes large enough** - At least 2x2 inches (5x5 cm)
2. **Test each QR code** before printing
3. **Place QR codes prominently** - On table stands or menus
4. **Include instructions** - "Scan to order" text near QR code
5. **Have backup menus** - In case phones don't have cameras

## 🔍 Troubleshooting

**QR code doesn't work?**
- Check URL is correct
- Make sure frontend is running
- Verify table number exists in database
- Check phone has internet connection

**Opens but shows error?**
- Check backend is running
- Verify database connection
- Check table number is valid (1-10)

**Works on computer but not phone?**
- Make sure phone is on same WiFi
- Try using computer's IP address instead of localhost
- Check firewall settings
