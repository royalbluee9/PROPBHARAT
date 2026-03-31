# PropBharat - PRD

## Problem Statement
Full India-focused real estate lead platform with multilingual support, property browsing/posting, user authentication, EMI Calculator, Google Maps integration, Agent Dashboard, and Admin Dashboard.

## Target Users
- Home buyers/renters across India (Tier 1 & 2 cities)
- Property owners wanting to sell/rent
- Real estate agents managing listings
- Platform administrators

## Tech Stack
- Frontend: React.js (React Router v6, Axios, Lucide React)
- Backend: FastAPI (Python)
- Database: MongoDB (Motor async driver)
- Auth: JWT sessions + Emergent Google OAuth
- Maps: Google Maps JavaScript API

## Architecture
- Backend at `/api/*` prefix (port 8001 internally)
- Frontend at port 3000
- Both served from same domain via Kubernetes ingress
- Auth: localStorage (pb_session_token) + Authorization header
- No cookies used (avoids CORS credential issues)

## What's Been Implemented (Date: Feb 2026)

### Core Features
- ✅ 8 Indian languages (EN, HI, GU, MR, TA, TE, BN) - complete UI translation
- ✅ Buy/Rent/Sell tab switching with color-coded themes
- ✅ 12 seeded property listings with full details
- ✅ City filter (30 Indian cities) + Property type filter + Search
- ✅ Google Maps view (Map View / Grid View toggle)
- ✅ Property cards with verified badge, featured tag, BHK, amenities
- ✅ Indian price formatting (Lakhs & Crores)
- ✅ Contact Owner modal with WhatsApp + Call buttons

### Authentication
- ✅ JWT email/password registration & login
- ✅ Google OAuth (Emergent-managed)
- ✅ Phone number completion modal after any auth
- ✅ Role-based access: user / agent / admin
- ✅ Superuser: admin@propbharat.com / Admin@123

### Lead System
- ✅ Post Lead form (name, phone, city, type, description)
- ✅ Indian mobile validation (6-9 prefix, 10 digits)
- ✅ Lead stored in MongoDB

### EMI Calculator
- ✅ Slider-based: Loan Amount, Interest Rate, Tenure
- ✅ Shows Monthly EMI, Total Payment, Interest breakdown
- ✅ Visual progress bar (Principal vs Interest)

### Agent Dashboard (/agent)
- ✅ View all own property listings
- ✅ Add new property (full form with amenities)
- ✅ Edit existing property
- ✅ Delete property
- ✅ View all leads

### Admin Dashboard (/admin)
- ✅ Platform stats (users, properties, leads count)
- ✅ User management (view all users, change roles)
- ✅ Property management (verify, delete)
- ✅ Lead management (view all with details)

### Design
- ✅ Warm Indian editorial palette (deep terracotta, dark wood hero, cream cards)
- ✅ Yeseva One serif + Noto Sans multilingual body font
- ✅ Staggered fade-up animations on load
- ✅ Hover lift on cards
- ✅ Smooth modal animations with spring effect
- ✅ Fully responsive (mobile-friendly)

## Deployment
- Primary: Emergent Platform (current setup)
- Vercel (Frontend) + Railway/Render (Backend + MongoDB)

## P0/P1/P2 Backlog

### P0 (Critical - Next Sprint)
- OTP verification for phone numbers (SMS via Twilio)
- Property images (upload to S3 or Cloudinary)
- Pagination for property listings

### P1 (High Priority)
- Advanced search filters (price range, area range, BHK count)
- Property detail page with full view
- Favorite/Saved properties
- Owner reviews & ratings
- WhatsApp Business API integration

### P2 (Nice to Have)
- Firebase Push Notifications
- Similar properties recommendations (AI-powered)
- Market trend charts per city
- Locality insights
- Google Analytics integration
- SEO optimization (meta tags, sitemap)

## Next Action Items
1. Add OTP verification for phone numbers
2. Add property image upload functionality
3. Add pagination to property grid
4. Deploy to production Vercel + Railway
