# ✅ Deployment Checklist

Use this checklist to ensure everything is deployed correctly.

## 📋 Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] All environment variables documented
- [ ] Database schema ready
- [ ] Stripe test keys obtained
- [ ] Supabase project created

## 🗄️ Database Setup

- [ ] Supabase project created
- [ ] Database schema (`schema.sql`) executed
- [ ] Sample data loaded (optional)
- [ ] Connection string copied
- [ ] Database password saved securely

## 🔧 Backend Deployment

- [ ] Backend deployed to hosting platform
- [ ] Environment variables set:
  - [ ] `DATABASE_URL`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `FRONTEND_URL`
  - [ ] `ENVIRONMENT=production`
  - [ ] `ADMIN_PASSWORD`
- [ ] Backend URL obtained
- [ ] Health check works: `GET /api/health`
- [ ] API docs accessible: `GET /docs`

## 🎨 Frontend Deployment

- [ ] Frontend deployed to hosting platform
- [ ] Environment variables set:
  - [ ] `VITE_API_URL` (backend URL)
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Frontend URL obtained
- [ ] Site loads correctly
- [ ] No console errors

## 🔗 Integration

- [ ] Backend `FRONTEND_URL` updated to frontend URL
- [ ] Frontend `VITE_API_URL` updated to backend URL
- [ ] CORS working (no errors in browser console)
- [ ] API calls working from frontend

## 💳 Stripe Setup

- [ ] Webhook endpoint created in Stripe
- [ ] Webhook URL: `https://your-backend.com/api/webhooks/stripe`
- [ ] Events selected:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.payment_failed`
- [ ] Webhook secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` updated in backend
- [ ] Webhook tested (use Stripe CLI or test payment)

## 🧪 Testing

- [ ] Menu loads: `GET /api/menu?table=1`
- [ ] Admin login works
- [ ] Can add/edit menu items
- [ ] Can view orders
- [ ] QR codes generate correctly
- [ ] Customer can scan QR code
- [ ] Customer can add items to cart
- [ ] Checkout flow works
- [ ] Payment processing works
- [ ] Order confirmation shows

## 📱 QR Codes

- [ ] QR codes generated in admin dashboard
- [ ] QR codes downloaded
- [ ] QR codes tested (scan with phone)
- [ ] QR codes printed
- [ ] QR codes placed on tables

## 🔒 Security

- [ ] Admin password changed from default
- [ ] Environment variables not exposed in code
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] CORS configured correctly
- [ ] Database credentials secure

## 📊 Monitoring

- [ ] Backend logs accessible
- [ ] Frontend logs accessible
- [ ] Error tracking set up (optional)
- [ ] Uptime monitoring (optional)

## 🎉 Post-Deployment

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Performance tested
- [ ] Mobile responsiveness verified
- [ ] Documentation updated with production URLs

## 🆘 Support

- [ ] Deployment guide saved
- [ ] Credentials saved securely
- [ ] Team access configured (if applicable)
- [ ] Backup plan documented

---

## ✅ All Done!

Once all items are checked, your system is production-ready! 🚀
