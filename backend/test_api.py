"""
Automated Integration Tests for FastAPI Backend + AIML Integration
Validates all endpoints:
- GET /
- GET /api/health
- GET /api/ai/metadata
- POST /api/ai/recommend-vendors
- POST /api/ai/predict-budget
- GET /api/vendors
- POST /api/events/create-with-ai
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ai_model_connected"] is True
    print("PASS: GET /")


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["ai_engine_ready"] is True
    assert data["vendors_in_catalog"] > 0
    print("PASS: GET /api/health")


def test_metadata():
    response = client.get("/api/ai/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "Wedding" in data["supported_event_types"]
    assert "Venue" in data["vendor_categories"]
    assert len(data["available_bundles"]) == 3
    print("PASS: GET /api/ai/metadata")


def test_recommend_vendors_wedding():
    payload = {
        "event_type": "Wedding",
        "client_budget": 35000.0,
        "guest_count": 150
    }
    response = client.post("/api/ai/recommend-vendors", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_category_budgets" in data
    assert "bundles" in data
    assert "recommended" in data["bundles"]
    assert "budget_saver" in data["bundles"]
    assert "premium" in data["bundles"]
    
    rec_bundle = data["bundles"]["recommended"]
    assert rec_bundle["total_cost"] <= 35000.0
    assert len(rec_bundle["vendors"]) == 7
    print(f"PASS: POST /api/ai/recommend-vendors (Wedding: Cost ${rec_bundle['total_cost']:,.2f} <= Budget $35k)")


def test_recommend_vendors_conference():
    payload = {
        "event_type": "Conference",
        "client_budget": 50000.0,
        "guest_count": 300
    }
    response = client.post("/api/ai/recommend-vendors", json=payload)
    assert response.status_code == 200
    data = response.json()
    rec_bundle = data["bundles"]["recommended"]
    assert rec_bundle["total_cost"] <= 50000.0
    print(f"PASS: POST /api/ai/recommend-vendors (Conference: Cost ${rec_bundle['total_cost']:,.2f} <= Budget $50k)")


def test_predict_budget():
    payload = {
        "event_type": "Wedding",
        "client_budget": 30000.0,
        "guest_count": 120
    }
    response = client.post("/api/ai/predict-budget", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["allocations"]) == 7
    total_allocated = sum(item["allocated_amount"] for item in data["allocations"])
    assert round(total_allocated, 2) == 30000.0
    print(f"PASS: POST /api/ai/predict-budget (Total allocated: ${total_allocated:,.2f})")


def test_vendor_catalog():
    response = client.get("/api/vendors?category=Catering")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] > 0
    for v in data["vendors"]:
        assert v["category"] == "Catering"
    print(f"PASS: GET /api/vendors?category=Catering ({data['count']} caterers found)")


def test_create_event_with_ai():
    payload = {
        "eventName": "Annual Innovation Gala",
        "eventType": "Corporate",
        "clientBudget": 40000.0,
        "guestCount": 200,
        "startDate": "2026-12-01",
        "endDate": "2026-12-01",
        "preferredPackage": "recommended"
    }
    response = client.post("/api/events/create-with-ai", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "event" in data
    event = data["event"]
    assert event["eventName"] == "Annual Innovation Gala"
    assert "aiVendorPackage" in event
    assert "predictedBudgetBreakdown" in event
    print("PASS: POST /api/events/create-with-ai")


def test_negotiate_vendor_price():
    payload = {
        "vendor_id": "CAT-001",
        "guest_count": 150,
        "target_budget": 9500.0,
        "has_flexible_date": True,
        "has_early_deposit": True
    }
    response = client.post("/api/ai/negotiate-vendor-price", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["vendor_id"] == "CAT-001"
    assert data["negotiated_price"] < data["original_quoted_price"]
    assert data["total_savings"] > 0
    assert "rounds" in data
    assert len(data["rounds"]) >= 1
    assert "negotiation_pitch" in data
    print(f"PASS: POST /api/ai/negotiate-vendor-price (Saved ${data['total_savings']:,.2f} / {data['discount_percentage']}%)")


def test_negotiate_bundle():
    # First get a recommended bundle
    rec_res = client.post("/api/ai/recommend-vendors", json={
        "event_type": "Wedding",
        "client_budget": 35000.0,
        "guest_count": 150
    })
    assert rec_res.status_code == 200
    bundle = rec_res.json()["bundles"]["recommended"]
    
    # Negotiate the whole bundle
    neg_res = client.post("/api/ai/negotiate-bundle", json={
        "bundle": bundle,
        "has_flexible_date": True,
        "has_early_deposit": True
    })
    assert neg_res.status_code == 200
    data = neg_res.json()
    assert data["negotiated_total_cost"] < data["original_total_cost"]
    assert data["total_savings"] > 0
    print(f"PASS: POST /api/ai/negotiate-bundle (Bundle Total Saved: ${data['total_savings']:,.2f} / {data['overall_discount_pct']}%)")


def test_negotiate_custom_vendor():
    payload = {
        "vendor_id": "vendor-custom-photo",
        "guest_count": 80,
        "target_budget": 2500.0,
        "has_flexible_date": True,
        "has_early_deposit": True,
        "vendor_data": {
            "id": "vendor-custom-photo",
            "name": "Lens & Light Studio",
            "category": "Photography",
            "tier": "Moderate",
            "base_fee": 1000.0,
            "per_person_rate": 15.0,
            "estimated_cost": 2200.0
        }
    }
    response = client.post("/api/ai/negotiate-vendor-price", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["vendor_id"] == "vendor-custom-photo"
    assert data["negotiated_price"] < data["original_quoted_price"]
    assert data["total_savings"] > 0
    print(f"PASS: POST /api/ai/negotiate-vendor-price [custom vendor] (Saved ${data['total_savings']:,.2f} / {data['discount_percentage']}%)")


def test_insufficient_budget():
    # 1. Recommendation endpoint with insufficient budget
    rec_res = client.post("/api/ai/recommend-vendors", json={
        "event_type": "Wedding",
        "client_budget": 500.0,
        "guest_count": 100
    })
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["is_budget_sufficient"] is False
    assert rec_data["budget_deficit"] > 0
    assert "You cannot organise an event" in rec_data["budget_warning"]
    print(f"PASS: Insufficient budget warning detected on /api/ai/recommend-vendors (Deficit: ${rec_data['budget_deficit']:,.2f})")

    # 2. Event creation rejection with insufficient budget
    create_res = client.post("/api/events/create-with-ai", json={
        "eventName": "Tiny Budget Gala",
        "eventType": "Wedding",
        "clientBudget": 500.0,
        "guestCount": 100,
        "startDate": "2026-11-20",
        "endDate": "2026-11-21"
    })
    assert create_res.status_code == 400
    detail = create_res.json()["detail"]
    assert "You cannot organise an event" in detail
    print(f"PASS: POST /api/events/create-with-ai successfully rejected insufficient budget: '{detail}'")


def test_rfp_templates():
    response = client.get("/api/rfp/templates")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 5
    assert "Catering" in data["templates"]
    assert "Audio / Visual & Lighting" in data["templates"]
    print("PASS: GET /api/rfp/templates")


def test_rfp_generate():
    payload = {
        "event_name": "Annual Tech Horizon Summit",
        "event_type": "Conference",
        "category": "Catering",
        "guest_count": 250,
        "venue_location": "Convention Center, Hall B",
        "organizer_name": "Tech Global Procurement",
        "organizer_email": "procurement@techglobal.org",
        "organizer_phone": "+91 99887 76655",
        "priority": "standard",
        "tone": "executive",
        "timeline": {
            "issue_date": "2026-11-01",
            "questions_deadline": "2026-11-07",
            "submission_deadline": "2026-11-15",
            "evaluation_date": "2026-11-18",
            "award_date": "2026-11-20",
            "service_start_date": "2026-12-05",
            "service_end_date": "2026-12-06"
        },
        "commercials": {
            "target_budget": 350000.0,
            "budget_ceiling": 400000.0,
            "currency": "INR",
            "pricing_structure": "per_person",
            "payment_terms": "25% advance, 50% milestone, 25% post-event"
        },
        "scope_of_work": "Comprehensive conference catering including executive morning breakfast, plenary lunch buffet, and high tea.",
        "deliverables": [
            {"title": "Morning Breakfast & Coffee", "description": "Artisan coffee bar and hot breakfast options.", "is_mandatory": True},
            {"title": "Plenary Networking Lunch", "description": "3-course hot buffet with live dessert station.", "is_mandatory": True}
        ],
        "compliance": {
            "business_license": True,
            "liability_insurance": True,
            "food_safety_fssai": True,
            "past_references_min": 3,
            "nda_required": False,
            "tax_compliance_gst": True
        },
        "evaluation_weights": {
            "cost": 30.0,
            "quality_experience": 25.0,
            "deliverable_fit": 25.0,
            "compliance_reliability": 20.0
        },
        "target_vendors": [
            {"vendor_id": "CAT-001", "vendor_name": "Epicurean Feast Catering", "category": "Catering", "tier": "Premium", "rating": 4.8}
        ]
    }
    response = client.post("/api/rfp/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["rfp_id"].startswith("RFP-")
    assert "REQUEST FOR PROPOSAL" in data["markdown"]
    assert "Epicurean Feast Catering" in data["markdown"]
    assert "Subject: RFP Invitation" in data["email_pitch"]
    print(f"PASS: POST /api/rfp/generate -> {data['rfp_id']}")


def test_rfp_evaluate():
    payload = {
        "rfp_id": "RFP-2026-CAT-001",
        "target_budget": 300000.0,
        "weights": {
            "cost": 30.0,
            "quality_experience": 30.0,
            "deliverable_fit": 20.0,
            "compliance_reliability": 20.0
        },
        "proposals": [
            {
                "vendor_id": "V-1",
                "vendor_name": "Artisanal Foods",
                "quoted_price": 285000.0,
                "quality_score": 9.0,
                "deliverable_score": 9.5,
                "compliance_score": 10.0,
                "notes": "Excellent references and within target budget."
            },
            {
                "vendor_id": "V-2",
                "vendor_name": "Budget Caterers",
                "quoted_price": 250000.0,
                "quality_score": 6.5,
                "deliverable_score": 7.0,
                "compliance_score": 8.0,
                "notes": "Lowest price but limited high-end experience."
            }
        ]
    }
    response = client.post("/api/rfp/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_proposals"] == 2
    assert data["winner"] is not None
    assert "total_score" in data["winner"]
    print(f"PASS: POST /api/rfp/evaluate -> Winner: {data['winner']['vendor_name']} (Score: {data['winner']['total_score']})")


def test_sqlite_auth_and_profile_default_events():
    # Test Login
    login_res = client.post("/api/auth/login", json={"email": "eo1@arnav.com", "password": "123456"})
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["success"] is True
    token = login_data["token"]
    assert len(login_data["default_events"]) == 3
    print("PASS: POST /api/auth/login -> Logged in with 3 default profile events")

    # Test /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user"]["email"] == "eo1@arnav.com"
    assert len(me_data["default_events"]) == 3
    print("PASS: GET /api/auth/me -> Authenticated session with 3 default events")

    # Test /api/profile
    profile_res = client.get("/api/profile", headers={"Authorization": f"Bearer {token}"})
    assert profile_res.status_code == 200
    p_data = profile_res.json()
    assert len(p_data["default_events"]) == 3
    assert p_data["stats"]["database_type"] == "SQLite3"
    print("PASS: GET /api/profile -> SQLite3 connected with 3 default profile events")

    # Test /api/auth/logout
    logout_res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True
    print("PASS: POST /api/auth/logout -> Session invalidated")


if __name__ == "__main__":
    print("=" * 60)
    print("Running FastAPI + AIML Integration Test Suite")
    print("=" * 60)
    test_root()
    test_health()
    test_metadata()
    test_sqlite_auth_and_profile_default_events()
    test_recommend_vendors_wedding()
    test_recommend_vendors_conference()
    test_predict_budget()
    test_vendor_catalog()
    test_create_event_with_ai()
    test_negotiate_vendor_price()
    test_negotiate_custom_vendor()
    test_negotiate_bundle()
    test_insufficient_budget()
    test_rfp_templates()
    test_rfp_generate()
    test_rfp_evaluate()
    print("=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! AIML & BACKEND ARE FULLY CONNECTED.")
    print("=" * 60)
