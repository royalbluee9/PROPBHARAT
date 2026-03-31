from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, re, requests as http_req
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── MODELS ──────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PhoneUpdate(BaseModel):
    phone: str

class GoogleSessionReq(BaseModel):
    session_id: str

class LeadCreate(BaseModel):
    name: str
    phone: str
    city: str
    locality: Optional[str] = ""
    prop_type: str = "apartment"
    lead_type: str = "buy"
    area: Optional[str] = ""
    price: Optional[str] = ""
    beds: Optional[str] = ""
    furnishing: str = "unfurnished"
    desc: Optional[str] = ""

class PropertyCreate(BaseModel):
    title: str
    locality: str
    city: str
    type: str
    bhk: Optional[int] = None
    bath: Optional[int] = None
    area: int
    price: Optional[int] = None
    rent: Optional[int] = None
    status: str = "ready"
    cat: str = "buy"
    verified: bool = False
    featured: bool = False
    amenities: List[str] = []
    description: Optional[str] = ""
    img: Optional[str] = "🏠"
    lat: Optional[float] = None
    lng: Optional[float] = None

class RoleUpdate(BaseModel):
    role: str

# ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
async def get_current_user(request: Request):
    token = None
    auth_hdr = request.headers.get("Authorization", "")
    if auth_hdr.startswith("Bearer "):
        token = auth_hdr[7:]
    if not token:
        token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(401, "Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(401, "Invalid session")
    exp = session["expires_at"]
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(401, "Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except Exception:
        return None

def make_session(user_id: str):
    token = str(uuid.uuid4())
    return {"user_id": user_id, "session_token": token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)}

# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
@api_router.post("/auth/register")
async def register(body: UserCreate):
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(400, "Email already registered")
    hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    uid = f"user_{uuid.uuid4().hex[:12]}"
    user = {"user_id": uid, "email": body.email, "name": body.name,
            "picture": None, "phone": None, "role": "user", "auth_type": "email",
            "created_at": datetime.now(timezone.utc), "password_hash": hashed}
    await db.users.insert_one(user)
    session = make_session(uid)
    await db.user_sessions.insert_one(session)
    user_out = {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}
    return {"user": user_out, "session_token": session["session_token"]}

@api_router.post("/auth/login")
async def login(body: UserLogin):
    user = await db.users.find_one({"email": body.email}, {"_id": 0})
    if not user or not user.get("password_hash"):
        raise HTTPException(401, "Invalid email or password")
    if not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Invalid email or password")
    session = make_session(user["user_id"])
    await db.user_sessions.insert_one(session)
    user_out = {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}
    return {"user": user_out, "session_token": session["session_token"]}

@api_router.post("/auth/google-session")
async def google_session(body: GoogleSessionReq):
    r = http_req.get("https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                     headers={"X-Session-ID": body.session_id}, timeout=10)
    if r.status_code != 200:
        raise HTTPException(400, "Failed to verify Google session")
    data = r.json()
    email, name, picture = data["email"], data["name"], data.get("picture")
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        uid = existing["user_id"]
        await db.users.update_one({"user_id": uid}, {"$set": {"picture": picture, "name": name}})
        existing.update({"picture": picture, "name": name})
        user_out = {k: v for k, v in existing.items() if k not in ["_id", "password_hash"]}
    else:
        uid = f"user_{uuid.uuid4().hex[:12]}"
        user = {"user_id": uid, "email": email, "name": name, "picture": picture,
                "phone": None, "role": "user", "auth_type": "google",
                "created_at": datetime.now(timezone.utc)}
        await db.users.insert_one(user)
        user_out = {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}
    session = make_session(uid)
    await db.user_sessions.insert_one(session)
    return {"user": user_out, "session_token": session["session_token"]}

@api_router.get("/auth/me")
async def get_me(request: Request):
    return await get_current_user(request)

@api_router.post("/auth/logout")
async def logout(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        token = request.cookies.get("session_token", "")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    return {"message": "Logged out"}

@api_router.put("/auth/complete-profile")
async def complete_profile(body: PhoneUpdate, request: Request):
    user = await get_current_user(request)
    phone = body.phone.strip().replace(" ", "")
    if not re.match(r'^[6-9]\d{9}$', phone):
        raise HTTPException(400, "Invalid Indian mobile number (must be 10 digits starting with 6-9)")
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"phone": phone}})
    user["phone"] = phone
    return user

# ─── PROPERTIES ROUTES ────────────────────────────────────────────────────────
@api_router.get("/properties")
async def get_properties(cat: Optional[str] = None, city: Optional[str] = None,
                          type: Optional[str] = None, search: Optional[str] = None,
                          page: int = 1, limit: int = 20):
    query = {}
    if cat and cat not in ["all", "sell"]:
        query["cat"] = cat
    if city:
        query["city"] = city
    if type:
        query["type"] = type
    if search:
        query["$or"] = [{"title": {"$regex": search, "$options": "i"}},
                        {"city": {"$regex": search, "$options": "i"}},
                        {"locality": {"$regex": search, "$options": "i"}}]
    skip = (page - 1) * limit
    total = await db.properties.count_documents(query)
    props = await db.properties.find(query, {"_id": 0}).sort([("featured", -1), ("created_at", -1)]).skip(skip).limit(limit).to_list(limit)
    return {"properties": props, "total": total, "page": page, "limit": limit}

@api_router.get("/properties/{prop_id}")
async def get_property(prop_id: str):
    prop = await db.properties.find_one({"prop_id": prop_id}, {"_id": 0})
    if not prop:
        raise HTTPException(404, "Property not found")
    return prop

@api_router.post("/properties")
async def create_property(body: PropertyCreate, request: Request):
    user = await get_current_user(request)
    pid = f"prop_{uuid.uuid4().hex[:12]}"
    prop = {"prop_id": pid, "owner_id": user["user_id"], "owner": user["name"],
            "owner_phone": user.get("phone", ""),
            "role": "owner" if user["role"] == "user" else user["role"],
            "new": True, "posted": 0,
            "created_at": datetime.now(timezone.utc), **body.model_dump()}
    await db.properties.insert_one(prop)
    prop.pop("_id", None)
    return prop

# ─── LEADS ROUTES ─────────────────────────────────────────────────────────────
@api_router.post("/leads")
async def submit_lead(body: LeadCreate, request: Request):
    user = await get_optional_user(request)
    lid = f"lead_{uuid.uuid4().hex[:12]}"
    lead = {"lead_id": lid, "user_id": user["user_id"] if user else None,
            "user_email": user["email"] if user else None,
            "created_at": datetime.now(timezone.utc), **body.model_dump()}
    await db.leads.insert_one(lead)
    lead.pop("_id", None)
    return {"message": "Lead submitted successfully", "lead_id": lid}

@api_router.get("/leads")
async def get_leads(request: Request):
    user = await get_current_user(request)
    if user.get("role") not in ["agent", "admin"]:
        raise HTTPException(403, "Access denied")
    query = {} if user["role"] == "admin" else {}
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return leads

# ─── AGENT ROUTES ─────────────────────────────────────────────────────────────
@api_router.get("/agent/properties")
async def agent_properties(request: Request):
    user = await get_current_user(request)
    props = await db.properties.find({"owner_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return props

@api_router.put("/agent/properties/{prop_id}")
async def update_property(prop_id: str, body: PropertyCreate, request: Request):
    user = await get_current_user(request)
    existing = await db.properties.find_one({"prop_id": prop_id, "owner_id": user["user_id"]})
    if not existing:
        raise HTTPException(404, "Property not found or access denied")
    await db.properties.update_one({"prop_id": prop_id},
        {"$set": {**body.model_dump(), "updated_at": datetime.now(timezone.utc)}})
    return {"message": "Updated successfully"}

@api_router.delete("/agent/properties/{prop_id}")
async def delete_property(prop_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.properties.delete_one({"prop_id": prop_id, "owner_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(404, "Property not found or access denied")
    return {"message": "Deleted successfully"}

@api_router.get("/agent/leads")
async def agent_leads(request: Request):
    user = await get_current_user(request)
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return leads

# ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────
async def require_admin(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user

@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    users_count = await db.users.count_documents({})
    props_count = await db.properties.count_documents({})
    leads_count = await db.leads.count_documents({})
    return {"users": users_count, "properties": props_count, "leads": leads_count}

@api_router.get("/admin/users")
async def admin_users(request: Request):
    await require_admin(request)
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return users

@api_router.put("/admin/users/{user_id}/role")
async def update_role(user_id: str, body: RoleUpdate, request: Request):
    await require_admin(request)
    if body.role not in ["user", "agent", "admin"]:
        raise HTTPException(400, "Invalid role")
    await db.users.update_one({"user_id": user_id}, {"$set": {"role": body.role}})
    return {"message": "Role updated"}

@api_router.get("/admin/properties")
async def admin_all_properties(request: Request):
    await require_admin(request)
    props = await db.properties.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return props

@api_router.delete("/admin/properties/{prop_id}")
async def admin_delete_prop(prop_id: str, request: Request):
    await require_admin(request)
    await db.properties.delete_one({"prop_id": prop_id})
    return {"message": "Deleted"}

@api_router.put("/admin/properties/{prop_id}/verify")
async def admin_verify_prop(prop_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    await db.properties.update_one({"prop_id": prop_id}, {"$set": {"verified": body.get("verified", True)}})
    return {"message": "Updated"}

@api_router.get("/admin/leads")
async def admin_all_leads(request: Request):
    await require_admin(request)
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return leads

# ─── ROOT ─────────────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "PropBharat API v2.0", "status": "running"}

# ─── SEED DATA ────────────────────────────────────────────────────────────────
SEED_PROPERTIES = [
    {"prop_id": "prop_seed_001", "title": "Luxe 3BHK with Sea-Facing Balcony", "locality": "Bandra West", "city": "Mumbai", "type": "apartment", "bhk": 3, "bath": 2, "area": 1480, "price": 18500000, "rent": None, "status": "ready", "cat": "buy", "verified": True, "featured": True, "new": False, "amenities": ["gym", "pool", "parking", "security", "lift"], "owner": "Rajesh Mehta", "owner_id": "seed_owner", "owner_phone": "9876543210", "role": "owner", "posted": 0, "img": "🌊", "lat": 19.059, "lng": 72.831, "description": "Stunning sea-facing apartment in the heart of Bandra West with panoramic ocean views.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_002", "title": "Standalone Villa with Private Pool", "locality": "Whitefield", "city": "Bengaluru", "type": "villa", "bhk": 4, "bath": 4, "area": 3800, "price": None, "rent": 95000, "status": "ready", "cat": "rent", "verified": True, "featured": True, "new": False, "amenities": ["pool", "parking", "garden", "security"], "owner": "Priya Nair", "owner_id": "seed_owner", "owner_phone": "9876543211", "role": "owner", "posted": 1, "img": "🌿", "lat": 12.973, "lng": 77.750, "description": "Luxury villa with private pool in Whitefield tech corridor.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_003", "title": "Smart 2BHK Near Cyber Hub", "locality": "Gachibowli", "city": "Hyderabad", "type": "apartment", "bhk": 2, "bath": 2, "area": 1020, "price": 5500000, "rent": None, "status": "uc", "cat": "buy", "verified": True, "featured": False, "new": True, "amenities": ["parking", "lift", "power"], "owner": "Suresh Reddy", "owner_id": "seed_owner", "owner_phone": "9876543212", "role": "agent", "posted": 2, "img": "🏗️", "lat": 17.441, "lng": 78.349, "description": "Smart home automation apartment near HITEC City.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_004", "title": "Corner Residential Plot — RERA Approved", "locality": "Vaishali Nagar", "city": "Jaipur", "type": "plot", "bhk": None, "bath": None, "area": 2700, "price": 7200000, "rent": None, "status": "ready", "cat": "buy", "verified": False, "featured": False, "new": False, "amenities": [], "owner": "Amit Gupta", "owner_id": "seed_owner", "owner_phone": "9876543213", "role": "owner", "posted": 3, "img": "📐", "lat": 26.912, "lng": 75.741, "description": "Prime corner plot in the upscale Vaishali Nagar locality.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_005", "title": "Grade A Office with 50 Workstations", "locality": "Baner", "city": "Pune", "type": "office", "bhk": None, "bath": 3, "area": 2100, "price": None, "rent": 72000, "status": "ready", "cat": "rent", "verified": True, "featured": True, "new": False, "amenities": ["parking", "lift", "security", "power"], "owner": "Kavita Joshi", "owner_id": "seed_owner", "owner_phone": "9876543214", "role": "agent", "posted": 0, "img": "💼", "lat": 18.558, "lng": 73.778, "description": "Fully equipped Grade A office space in Baner IT hub.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_006", "title": "Fully Furnished 1BHK — Walk to Metro", "locality": "Anna Nagar", "city": "Chennai", "type": "apartment", "bhk": 1, "bath": 1, "area": 640, "price": None, "rent": 19500, "status": "ready", "cat": "rent", "verified": True, "featured": False, "new": False, "amenities": ["lift", "security"], "owner": "Murugan K", "owner_id": "seed_owner", "owner_phone": "9876543215", "role": "owner", "posted": 4, "img": "🚇", "lat": 13.085, "lng": 80.209, "description": "Walking distance from metro station, fully furnished with modern amenities.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_007", "title": "Ultra-Premium 4BHK Penthouse", "locality": "Dwarka Sector 12", "city": "Delhi", "type": "penthouse", "bhk": 4, "bath": 4, "area": 4200, "price": 32000000, "rent": None, "status": "ready", "cat": "buy", "verified": True, "featured": True, "new": False, "amenities": ["gym", "pool", "parking", "security", "lift", "club"], "owner": "Neha Kapoor", "owner_id": "seed_owner", "owner_phone": "9876543216", "role": "agent", "posted": 1, "img": "👑", "lat": 28.591, "lng": 77.046, "description": "Exclusive penthouse with 360° city views and top-of-line finishes.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_008", "title": "Prime Commercial Shop — CG Road", "locality": "CG Road", "city": "Ahmedabad", "type": "shop", "bhk": None, "bath": 1, "area": 480, "price": 3800000, "rent": None, "status": "ready", "cat": "buy", "verified": True, "featured": False, "new": True, "amenities": ["parking"], "owner": "Dhruv Patel", "owner_id": "seed_owner", "owner_phone": "9876543217", "role": "owner", "posted": 5, "img": "🏪", "lat": 23.034, "lng": 72.558, "description": "High footfall commercial shop on CG Road.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_009", "title": "Spacious 3BHK — Gated Township", "locality": "New Town", "city": "Kolkata", "type": "apartment", "bhk": 3, "bath": 2, "area": 1380, "price": 6800000, "rent": None, "status": "ready", "cat": "buy", "verified": True, "featured": False, "new": False, "amenities": ["parking", "lift", "garden", "security"], "owner": "Arjun Das", "owner_id": "seed_owner", "owner_phone": "9876543218", "role": "owner", "posted": 2, "img": "🏙️", "lat": 22.587, "lng": 88.469, "description": "Well-planned gated community in New Town, Rajarhat.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_010", "title": "Modern 2BHK Semi-Furnished Flat", "locality": "Kothrud", "city": "Pune", "type": "apartment", "bhk": 2, "bath": 2, "area": 920, "price": None, "rent": 22000, "status": "ready", "cat": "rent", "verified": True, "featured": False, "new": False, "amenities": ["parking", "lift"], "owner": "Sneha Kulkarni", "owner_id": "seed_owner", "owner_phone": "9876543219", "role": "owner", "posted": 6, "img": "🏠", "lat": 18.505, "lng": 73.812, "description": "Semi-furnished flat in the peaceful Kothrud neighbourhood.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_011", "title": "Farmhouse with 1 Acre Land", "locality": "Sarjapur Road", "city": "Bengaluru", "type": "villa", "bhk": 5, "bath": 5, "area": 8000, "price": 45000000, "rent": None, "status": "ready", "cat": "buy", "verified": True, "featured": True, "new": True, "amenities": ["pool", "garden", "parking", "security"], "owner": "Vikram Singh", "owner_id": "seed_owner", "owner_phone": "9876543220", "role": "agent", "posted": 0, "img": "🌾", "lat": 12.909, "lng": 77.706, "description": "Sprawling farmhouse with lush greenery and private pond.", "created_at": datetime.now(timezone.utc)},
    {"prop_id": "prop_seed_012", "title": "Affordable 1BHK — New Project", "locality": "Mira Road", "city": "Mumbai", "type": "apartment", "bhk": 1, "bath": 1, "area": 520, "price": 3200000, "rent": None, "status": "uc", "cat": "buy", "verified": False, "featured": False, "new": True, "amenities": ["lift", "security"], "owner": "Prakash More", "owner_id": "seed_owner", "owner_phone": "9876543221", "role": "owner", "posted": 7, "img": "🏢", "lat": 19.285, "lng": 72.867, "description": "Budget-friendly apartment in upcoming Mira Road development.", "created_at": datetime.now(timezone.utc)},
]

async def seed_data():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@propbharat.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    if not await db.users.find_one({"email": admin_email}):
        hashed = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
        await db.users.insert_one({
            "user_id": f"admin_{uuid.uuid4().hex[:8]}", "email": admin_email,
            "name": "PropBharat Admin", "picture": None, "phone": "9999999999",
            "role": "admin", "auth_type": "email",
            "created_at": datetime.now(timezone.utc), "password_hash": hashed
        })
        logger.info(f"Admin seeded: {admin_email}")

    if await db.properties.count_documents({}) == 0:
        await db.properties.insert_many(SEED_PROPERTIES)
        logger.info(f"Seeded {len(SEED_PROPERTIES)} properties")

    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id")
    await db.user_sessions.create_index("session_token")
    await db.properties.create_index("prop_id")
    await db.leads.create_index("lead_id")

@app.on_event("startup")
async def startup():
    await seed_data()

@app.on_event("shutdown")
async def shutdown():
    client.close()

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
