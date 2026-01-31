# QR Restaurant Ordering System - Frontend

React frontend for a multi-table QR-based restaurant ordering system.

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS**
- **React Router v6**
- **Zustand** (state management)
- **Axios** (API client)
- **React Hot Toast** (notifications)

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run Development Server

```bash
npm run dev
```

App will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Output will be in the `dist` directory.

## Deployment to Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Add environment variables in Cloudflare Pages dashboard:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Menu/          # Menu components
│   │   ├── Cart/          # Cart components
│   │   └── Layout/        # Layout components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API service
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/
└── package.json
```

## Features

- Mobile-first responsive design
- Cart persistence (localStorage)
- Toast notifications
- Loading states and error handling
- Table number validation
- Stripe Checkout integration
