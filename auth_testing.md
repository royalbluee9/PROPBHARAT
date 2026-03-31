# PropBharat Auth Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('propbharat_db');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: null,
  phone: '9876543210',
  role: 'user',
  auth_type: 'email',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Admin Credentials
- Email: admin@propbharat.com
- Password: Admin@123
- Role: admin

## Step 3: Test Backend API
```bash
API_URL="https://desi-homes-test.preview.emergentagent.com"

# Login as admin
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@propbharat.com","password":"Admin@123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['session_token'])")

# Test /me
curl -X GET "$API_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"

# Get properties
curl -X GET "$API_URL/api/properties"

# Get admin stats
curl -X GET "$API_URL/api/admin/stats" -H "Authorization: Bearer $TOKEN"
```

## Step 4: Browser Testing
Set cookie and navigate:
```javascript
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "desi-homes-test.preview.emergentagent.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto("https://desi-homes-test.preview.emergentagent.com");
```

## Checklist
- [ ] /api/auth/login returns session_token
- [ ] /api/auth/me returns user data with Authorization header
- [ ] /api/properties returns array of properties
- [ ] /api/admin/stats requires admin role
- [ ] Properties page loads with seeded data
- [ ] EMI Calculator modal works
- [ ] Map view loads Google Maps
- [ ] Login/Register modal works
- [ ] Phone completion modal shows after auth
- [ ] Agent dashboard accessible for agent/admin roles
- [ ] Admin dashboard accessible for admin only
