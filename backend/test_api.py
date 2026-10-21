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


if __name__ == "__main__":
    print("=" * 60)
    print("Running FastAPI + AIML Integration Test Suite")
    print("=" * 60)
    test_root()
    test_health()
    test_metadata()
    test_recommend_vendors_wedding()
    test_recommend_vendors_conference()
    test_predict_budget()
    test_vendor_catalog()
    test_create_event_with_ai()
    test_negotiate_vendor_price()
    test_negotiate_custom_vendor()
    test_negotiate_bundle()
    test_insufficient_budget()
    print("=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! AIML & BACKEND ARE FULLY CONNECTED.")
    print("=" * 60)
