"""PropBharat Backend API Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealth:
    def test_api_root(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert "PropBharat" in data.get("message", "")

class TestAuth:
    """Auth endpoint tests"""

    def test_login_admin(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@propbharat.com", "password": "Admin@123"})
        assert r.status_code == 200
        data = r.json()
        assert "session_token" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == "admin@propbharat.com"

    def test_login_invalid(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@propbharat.com", "password": "wrongpass"})
        assert r.status_code == 401

    def test_register_and_me(self):
        import uuid
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "name": "Test User", "password": "Test@1234"})
        assert r.status_code == 200
        data = r.json()
        token = data["session_token"]
        # Test /me
        r2 = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200
        assert r2.json()["email"] == email

    def test_duplicate_register(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": "admin@propbharat.com", "name": "Test", "password": "Test@1234"})
        assert r.status_code == 400

    def test_logout(self):
        # Login first
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@propbharat.com", "password": "Admin@123"})
        token = r.json()["session_token"]
        # Logout
        r2 = requests.post(f"{BASE_URL}/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200
        # /me should fail
        r3 = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r3.status_code == 401


class TestProperties:
    """Properties tests"""

    def test_get_properties(self):
        r = requests.get(f"{BASE_URL}/api/properties")
        assert r.status_code == 200
        data = r.json()
        assert "properties" in data
        assert data["total"] >= 12

    def test_filter_by_city(self):
        r = requests.get(f"{BASE_URL}/api/properties?city=Mumbai")
        assert r.status_code == 200
        data = r.json()
        for p in data["properties"]:
            assert p["city"] == "Mumbai"

    def test_filter_by_cat_buy(self):
        r = requests.get(f"{BASE_URL}/api/properties?cat=buy")
        assert r.status_code == 200
        data = r.json()
        for p in data["properties"]:
            assert p["cat"] == "buy"

    def test_filter_by_type(self):
        r = requests.get(f"{BASE_URL}/api/properties?type=apartment")
        assert r.status_code == 200
        data = r.json()
        for p in data["properties"]:
            assert p["type"] == "apartment"

    def test_search(self):
        r = requests.get(f"{BASE_URL}/api/properties?search=Mumbai")
        assert r.status_code == 200
        data = r.json()
        assert len(data["properties"]) > 0

    def test_get_single_property(self):
        r = requests.get(f"{BASE_URL}/api/properties/prop_seed_001")
        assert r.status_code == 200
        assert r.json()["prop_id"] == "prop_seed_001"

    def test_property_not_found(self):
        r = requests.get(f"{BASE_URL}/api/properties/invalid_id")
        assert r.status_code == 404

    def test_create_property_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/properties", json={"title": "Test", "locality": "Test", "city": "Mumbai", "type": "apartment", "area": 1000})
        assert r.status_code == 401


class TestLeads:
    """Leads tests"""

    def test_submit_lead(self):
        r = requests.post(f"{BASE_URL}/api/leads", json={"name": "Test Lead", "phone": "9876543210", "city": "Mumbai"})
        assert r.status_code == 200
        data = r.json()
        assert "lead_id" in data

    def test_get_leads_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/leads")
        assert r.status_code == 401


class TestAdmin:
    """Admin endpoint tests"""

    @pytest.fixture(autouse=True)
    def admin_token(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@propbharat.com", "password": "Admin@123"})
        assert r.status_code == 200
        self.token = r.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_admin_stats(self):
        r = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert r.status_code == 200
        data = r.json()
        assert "users" in data and "properties" in data and "leads" in data

    def test_admin_users(self):
        r = requests.get(f"{BASE_URL}/api/admin/users", headers=self.headers)
        assert r.status_code == 200
        users = r.json()
        assert isinstance(users, list)
        assert len(users) >= 1

    def test_admin_properties(self):
        r = requests.get(f"{BASE_URL}/api/admin/properties", headers=self.headers)
        assert r.status_code == 200
        props = r.json()
        assert isinstance(props, list)

    def test_admin_leads(self):
        r = requests.get(f"{BASE_URL}/api/admin/leads", headers=self.headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_required_for_stats(self):
        r = requests.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 401
