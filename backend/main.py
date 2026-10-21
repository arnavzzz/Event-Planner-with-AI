"""
FastAPI Backend - Event Management & AI Recommender Service
Connects the AIML Integration with backend REST API endpoints.
Provides real-time vendor recommendations and budget optimizations
for the 'Create Event' tab.
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib

# Ensure aiml-integration path is accessible
BASE_DIR = Path(__file__).resolve().parent.parent
AIML_DIR = BASE_DIR / "aiml-integration"
AIML_DIR_STR = str(AIML_DIR)
if AIML_DIR_STR in sys.path:
    sys.path.remove(AIML_DIR_STR)
sys.path.insert(0, AIML_DIR_STR)

# A third-party package named "recommender" can shadow the AIML source module,
# which is also the module path stored in the joblib artifact.
cached_recommender = sys.modules.get("recommender")
cached_recommender_path = getattr(cached_recommender, "__file__", None)
if cached_recommender_path and Path(cached_recommender_path).resolve() != (AIML_DIR / "recommender.py").resolve():
    del sys.modules["recommender"]

# Import AIML modules
from recommender import (  # noqa: E402
    EVENT_TYPES,
    VENDOR_CATEGORIES,
    EventVendorRecommender,
    predict_budget_allocation,
)

# Global model state
ml_state: Dict[str, Any] = {
    "recommender_engine": None,
    "vendor_catalog": [],
    "model_loaded": False,
    "model_path": None,
}


def load_ml_models() -> bool:
    """Loads the ML models and datasets into memory if not already loaded."""
    if ml_state["model_loaded"] and ml_state["recommender_engine"] is not None:
        return True

    model_path = AIML_DIR / "models" / "vendor_recommender_engine.joblib"
    catalog_path = AIML_DIR / "data" / "vendors.json"

    print(f"[AIML Service] Initializing AIML integration from: {AIML_DIR}")

    if model_path.exists():
        try:
            engine = joblib.load(model_path)
            ml_state["recommender_engine"] = engine
            ml_state["model_loaded"] = True
            ml_state["model_path"] = str(model_path)
            print(f"[AIML Service] Successfully loaded AI Engine from {model_path.name}")
        except Exception as e:
            print(f"[AIML Service] Warning: Failed to load model from {model_path}: {e}")
    else:
        print(f"[AIML Service] Warning: Model file not found at {model_path}")

    if catalog_path.exists():
        try:
            with open(catalog_path, "r", encoding="utf-8") as f:
                ml_state["vendor_catalog"] = json.load(f)
            print(f"[AIML Service] Loaded {len(ml_state['vendor_catalog'])} vendors from catalog.")
        except Exception as e:
            print(f"[AIML Service] Warning: Failed to load vendors from {catalog_path}: {e}")

    return ml_state["model_loaded"]


# Load eagerly on module import
load_ml_models()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan context manager.
    """
    load_ml_models()
    yield
    print("[FastAPI Lifespan] Service stopping.")


# Initialize FastAPI application
app = FastAPI(
    title="Event Planner AI Backend API",
    description="Backend services providing AI-driven Vendor Recommendations and Budget Allocation for Event Planning.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Frontend connectivity (Vite development and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development (can restrict to localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Request & Response Schemas
# -----------------------------------------------------------------------------

class VendorItem(BaseModel):
    vendor_id: str
    vendor_name: str
    category: str
    tier: str
    rating: float
    reviews: int
    estimated_cost: float
    budget_allocated: float
    cost_variance: float
    total_match_score: float


class VendorBundle(BaseModel):
    bundle_name: str
    total_cost: float
    client_budget: float
    remaining_budget: float
    budget_utilization_pct: float
    average_match_score: float
    average_rating: float
    is_within_budget: Optional[bool] = None
    event_type: Optional[str] = None
    guest_count: Optional[int] = None
    vendors: List[Dict[str, Any]]


class VendorRecommendationRequest(BaseModel):
    event_type: str = Field(
        ...,
        description="Type of event (Wedding, Birthday, Corporate, Conference, Festival, Other)",
        examples=["Wedding"]
    )
    client_budget: float = Field(
        ...,
        gt=0,
        description="Total client budget allocated for the event in USD",
        examples=[35000.0]
    )
    guest_count: int = Field(
        ...,
        gt=0,
        description="Expected number of attendees / guests",
        examples=[150]
    )


class VendorRecommendationResponse(BaseModel):
    query: Dict[str, Any]
    predicted_category_budgets: Dict[str, float]
    bundles: Dict[str, VendorBundle]
    is_budget_sufficient: Optional[bool] = True
    minimum_required_budget: Optional[float] = None
    budget_deficit: Optional[float] = 0.0
    budget_warning: Optional[str] = None


class BudgetPredictRequest(BaseModel):
    event_type: str = Field(..., examples=["Conference"])
    client_budget: float = Field(..., gt=0, examples=[50000.0])
    guest_count: int = Field(..., gt=0, examples=[300])


class BudgetAllocationItem(BaseModel):
    category: str
    allocated_amount: float
    percentage_share: float


class BudgetPredictResponse(BaseModel):
    event_type: str
    client_budget: float
    guest_count: int
    allocations: List[BudgetAllocationItem]


class CreateEventWithAiRequest(BaseModel):
    id: Optional[str] = None
    eventType: str
    eventName: str
    clientBudget: float
    guestCount: int
    startDate: str
    endDate: str
    preferredPackage: Optional[str] = "recommended"  # "recommended", "budget_saver", "premium"


def normalize_event_type(event_type: str) -> str:
    """Match supported event types case-insensitively and default unknown values to Other."""
    normalized = event_type.strip().casefold()
    return next((supported for supported in EVENT_TYPES if supported.casefold() == normalized), "Other")


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.get("/", tags=["Health & Info"])
async def root():
    """Root status check."""
    return {
        "service": "Event Planner AI Backend API",
        "status": "healthy",
        "ai_model_connected": ml_state["model_loaded"],
        "docs_url": "/docs"
    }


@app.get("/api/health", tags=["Health & Info"])
async def health_check():
    """Health check endpoint for backend and ML model readiness."""
    return {
        "status": "online",
        "ai_engine_ready": ml_state["model_loaded"],
        "model_file": ml_state["model_path"],
        "vendors_in_catalog": len(ml_state["vendor_catalog"])
    }


@app.get("/api/ai/metadata", tags=["AI Recommender"])
async def get_ai_metadata():
    """Returns supported event types, vendor categories, and model details."""
    return {
        "supported_event_types": EVENT_TYPES,
        "vendor_categories": VENDOR_CATEGORIES,
        "model_architecture": "Multi-Output RandomForestRegressor + Combinatorial Bundle Knapsack Optimizer",
        "available_bundles": [
            {"id": "recommended", "name": "AI Balanced Recommended", "description": "Maximizes quality and score within budget."},
            {"id": "budget_saver", "name": "Budget Saver Package", "description": "Minimum cost satisfying all requirements."},
            {"id": "premium", "name": "Premium Experience", "description": "Highest rated and luxury tier matching available budget."}
        ]
    }


@app.post("/api/ai/recommend-vendors", response_model=VendorRecommendationResponse, tags=["AI Recommender"])
async def recommend_vendors(payload: VendorRecommendationRequest):
    """
    Primary AIML integration endpoint for the 'Create Event' tab.
    Accepts eventType, client_budget, and guest_count, executes the ML model,
    and returns predicted category budget distributions and 3 optimized vendor packages.
    """
    engine: Optional[EventVendorRecommender] = ml_state["recommender_engine"]

    if not engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Recommender Engine is not loaded. Please ensure models are trained in aiml-integration."
        )

    normalized_type = normalize_event_type(payload.event_type)

    try:
        recommendations = engine.recommend(
            event_type=normalized_type,
            client_budget=float(payload.client_budget),
            guest_count=int(payload.guest_count),
        )

        saver_bundle = recommendations.get("bundles", {}).get("budget_saver")
        min_required = saver_bundle["total_cost"] if saver_bundle else 0.0
        is_sufficient = float(payload.client_budget) >= min_required
        deficit = max(0.0, round(min_required - float(payload.client_budget), 2))
        warning = None
        if not is_sufficient:
            warning = (
                f"You cannot organise an event: Insufficient budget. "
                f"The minimum required budget for {payload.guest_count} guests across all 7 categories is ${min_required:,.2f}. "
                f"Your budget is short by ${deficit:,.2f}."
            )

        recommendations["is_budget_sufficient"] = is_sufficient
        recommendations["minimum_required_budget"] = min_required
        recommendations["budget_deficit"] = deficit
        recommendations["budget_warning"] = warning

        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@app.post("/api/ai/predict-budget", response_model=BudgetPredictResponse, tags=["AI Recommender"])
async def predict_budget_breakdown(payload: BudgetPredictRequest):
    """
    Predicts the optimal category budget allocation without selecting vendors.
    Useful for displaying dynamic budget slider recommendations in the Create Event form.
    """
    engine: Optional[EventVendorRecommender] = ml_state["recommender_engine"]

    if not engine or not engine.budget_model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Budget allocation model is not loaded."
        )

    normalized_type = normalize_event_type(payload.event_type)

    try:
        category_budgets = predict_budget_allocation(
            engine.budget_model,
            normalized_type,
            float(payload.client_budget),
            int(payload.guest_count)
        )

        items = []
        for cat, amt in category_budgets.items():
            pct = round((amt / payload.client_budget) * 100, 1)
            items.append(BudgetAllocationItem(
                category=cat,
                allocated_amount=amt,
                percentage_share=pct
            ))

        return BudgetPredictResponse(
            event_type=normalized_type,
            client_budget=payload.client_budget,
            guest_count=payload.guest_count,
            allocations=items
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to compute budget breakdown: {str(e)}"
        )


class NegotiateVendorPriceRequest(BaseModel):
    vendor_id: str = Field(..., description="ID of the vendor to negotiate with", examples=["CAT-001"])
    guest_count: int = Field(..., gt=0, description="Expected attendees", examples=[150])
    target_budget: Optional[float] = Field(None, description="Client's target price for this vendor", examples=[9500.0])
    has_flexible_date: Optional[bool] = Field(True, description="Willingness to accept non-peak date/time setup")
    has_early_deposit: Optional[bool] = Field(True, description="Willingness to pay upfront deposit")
    vendor_data: Optional[Dict[str, Any]] = Field(None, description="Optional vendor details if not in standard catalog")


class NegotiateBundleRequest(BaseModel):
    bundle: Dict[str, Any] = Field(..., description="Complete vendor bundle to negotiate as a package")
    has_flexible_date: Optional[bool] = Field(True, description="Schedule flexibility concession")
    has_early_deposit: Optional[bool] = Field(True, description="Upfront deposit concession")


@app.post("/api/ai/negotiate-vendor-price", tags=["AI Price Negotiation"])
async def negotiate_vendor_price(payload: NegotiateVendorPriceRequest):
    """
    Executes automated AI multi-round alternating-offer bargaining for a vendor.
    Delivers agreed pricing, total savings, concession trajectory, and a ready-to-send drafted pitch.
    """
    engine: Optional[EventVendorRecommender] = ml_state["recommender_engine"]
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Recommender & Negotiation Engine is not loaded."
        )

    try:
        vendor_arg: Any = payload.vendor_id
        if payload.vendor_data:
            vendor_arg = payload.vendor_data
        elif not any(v.get("id") == payload.vendor_id for v in engine.vendor_catalog):
            target = payload.target_budget or 1000.0
            vendor_arg = {
                "id": payload.vendor_id,
                "name": payload.vendor_id,
                "category": "Services",
                "tier": "Moderate",
                "base_fee": target * 0.4,
                "per_person_rate": (target * 0.6) / max(1, payload.guest_count),
                "estimated_cost": target
            }

        negotiation_result = engine.negotiate_vendor(
            vendor_id_or_dict=vendor_arg,
            guest_count=payload.guest_count,
            target_budget=payload.target_budget,
            has_flexible_date=payload.has_flexible_date,
            has_early_deposit=payload.has_early_deposit
        )
        return negotiation_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to execute negotiation: {str(e)}"
        )


@app.post("/api/ai/negotiate-bundle", tags=["AI Price Negotiation"])
async def negotiate_bundle_prices(payload: NegotiateBundleRequest):
    """
    Executes automated package-level AI price negotiations across all vendors in a bundle.
    """
    engine: Optional[EventVendorRecommender] = ml_state["recommender_engine"]
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Recommender & Negotiation Engine is not loaded."
        )

    try:
        return engine.negotiate_bundle(
            bundle=payload.bundle,
            has_flexible_date=payload.has_flexible_date,
            has_early_deposit=payload.has_early_deposit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to execute bundle negotiation: {str(e)}"
        )


@app.get("/api/vendors", tags=["Vendor Catalog"])
async def list_vendors(
    category: Optional[str] = Query(None, description="Filter by category (Venue, Catering, etc.)"),
    event_type: Optional[str] = Query(None, description="Filter by supported event type"),
    tier: Optional[str] = Query(None, description="Filter by tier (Budget, Moderate, Premium, Luxury)")
):
    """Retrieves vendors from the catalog with optional filters."""
    catalog = ml_state["vendor_catalog"]
    results = catalog

    if category:
        results = [v for v in results if v["category"].lower() == category.lower()]
    if event_type:
        results = [v for v in results if event_type.capitalize() in v.get("types", [])]
    if tier:
        results = [v for v in results if v.get("tier", "").lower() == tier.lower()]

    return {
        "count": len(results),
        "vendors": results
    }


@app.post("/api/events/create-with-ai", tags=["Event Creation"])
async def create_event_with_ai(event_data: CreateEventWithAiRequest):
    """
    Connects the Create Event tab directly with the AI recommender:
    Accepts an event creation request, runs the recommendation engine,
    and returns the created event record with the selected vendor package attached.
    """
    engine: Optional[EventVendorRecommender] = ml_state["recommender_engine"]
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Recommender is not available."
        )

    recommendations = engine.recommend(
        event_type=normalize_event_type(event_data.eventType),
        client_budget=event_data.clientBudget,
        guest_count=event_data.guestCount
    )

    saver_bundle = recommendations.get("bundles", {}).get("budget_saver")
    saver_cost = saver_bundle["total_cost"] if saver_bundle else 0.0
    if event_data.clientBudget < saver_cost:
        deficit = round(saver_cost - event_data.clientBudget, 2)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You cannot organise an event: Client budget (${event_data.clientBudget:,.2f}) is not enough. Minimum required budget for {event_data.guestCount} guests is ${saver_cost:,.2f} (short by ${deficit:,.2f})."
        )

    pkg_key = event_data.preferredPackage if event_data.preferredPackage in recommendations["bundles"] else "recommended"
    selected_bundle = recommendations["bundles"][pkg_key]

    event_record = {
        "id": event_data.id or f"EVT-{int(Path(__file__).stat().st_mtime * 1000)}",
        "eventName": event_data.eventName,
        "eventType": event_data.eventType,
        "clientBudget": event_data.clientBudget,
        "guestCount": event_data.guestCount,
        "startDate": event_data.startDate,
        "endDate": event_data.endDate,
        "aiVendorPackage": selected_bundle,
        "predictedBudgetBreakdown": recommendations["predicted_category_budgets"]
    }

    return {
        "message": "Event successfully created with AI-recommended vendor package.",
        "event": event_record
    }
