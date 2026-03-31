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
- Images: Cloudinary (direct frontend upload with backend signature)

## Architecture
- Backend at `/api/*` prefix (port 8001 internally)
- Frontend at port 3000
- Both served from same domain via Kubernetes ingress
- Auth: localStorage (pb_session_token) + Authorization header
- No cookies used (avoids CORS credential issues)

## What's Been Implemented

### Core Features (Phase 1 - Feb 2026)
- ✅ 7 Indian languages (EN, HI, GU, MR, TA, TE, BN) - complete UI translation
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

### Agent Dashboard (/agent)
- ✅ View all own property listings (with thumbnail image preview)
- ✅ Add new property with ImageUpload component (Cloudinary)
- ✅ Edit existing property
- ✅ Delete property
- ✅ View all leads

### Admin Dashboard (/admin)
- ✅ Platform stats (users, properties, leads count)
- ✅ User management (view all users, change roles)
- ✅ Property management (verify, delete)
- ✅ Lead management (view all with details)

### Phase 2 Features (Feb 2026)
- ✅ Property Detail Page (/property/:prop_id) — image gallery, amenities, map, similar properties, contact sidebar
- ✅ Advanced Filters — BHK selector, Min/Max price range with expandable panel
- ✅ Pagination — page navigation (shows when total > 12), page number buttons
- ✅ Favorites heart toggle on property cards (persists to localStorage + backend)
- ✅ "View Details" button on cards navigating to property detail page
- ✅ Cloudinary image upload in Agent Dashboard (direct upload with backend signature)
- ✅ Property cards now show actual uploaded images (not just emoji)

### Code Quality Pass (Feb 2026)
- ✅ React hook dependency fixes (useCallback + correct useEffect deps)
- ✅ Error handling: console.error in all catch blocks (replaced silent swallowing)
- ✅ Removed unused imports (BarChart2, ImageIcon, Share2, Phone, MessageCircle, BedDouble, Bath, Maximize2, CheckCircle)
- ✅ Stable list keys (use URL/ID instead of array index)
- ✅ Price constants extracted (CRORE, LAKH) in PropertyDetail
- ✅ Backend query builder extracted (_build_property_query helper)
- ✅ Python import formatting fixed (one per line)
- ✅ getHeaders wrapped in useCallback for stable reference
- ✅ PropBharat lead submit uses getHeaders() from context (not raw localStorage)

### Design
- ✅ Warm Indian editorial palette (deep terracotta, dark wood hero, cream cards)
- ✅ Yeseva One serif + Noto Sans multilingual body font
- ✅ Staggered fade-up animations on load
- ✅ Hover lift on cards
- ✅ Smooth modal animations

## P0/P1/P2 Backlog

### P0 (Critical - Next)
- Favorites page (/favorites) - dedicated page listing all saved properties
- Owner reviews & ratings system

### P1 (High Priority)
- WhatsApp Business API deep integration
- Agent role registration flow (self-service)
- Property image carousel on cards

### P2 (Nice to Have / Deferred by User)
- Firebase Push Notifications (user noted broken, deferred)
- Similar properties (AI-powered) - user said skip for now
- OTP via Twilio - user said leave for now
- Market trend charts per city
- SEO optimization (meta tags, sitemap)
- Google Analytics

## Next Action Items
1. Favorites page (/favorites) - view all saved properties for logged-in user
2. Agent role self-service registration
3. Review/rating system for property owners
4. Deploy to production (Vercel + Railway)
