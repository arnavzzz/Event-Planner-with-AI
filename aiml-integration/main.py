"""
Event Planner - AI Vendor Recommendation Engine Entrypoint
Demonstrates loading the trained ML model and generating recommendations
for the 'Create Event' tab based on budget, guest count, and event type.
"""

import os
import sys
from pathlib import Path
import joblib

# Reconfigure stdout for UTF-8 support on Windows consoles
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure this integration's recommender wins over any installed module with the same name.
CURRENT_DIR = Path(__file__).resolve().parent
CURRENT_DIR_STR = str(CURRENT_DIR)
if CURRENT_DIR_STR in sys.path:
    sys.path.remove(CURRENT_DIR_STR)
sys.path.insert(0, CURRENT_DIR_STR)

from recommender import EventVendorRecommender  # noqa: E402,F401

MODEL_PATH = CURRENT_DIR / "models" / "vendor_recommender_engine.joblib"


def run_demo():
    print("=" * 80)
    print("AI Event Planner - Vendor Recommendation System Demo")
    print("=" * 80)

    if not MODEL_PATH.exists():
        print(f"[!] Model artifact not found at {MODEL_PATH}")
        print("Please run the notebook in `notebook/vendor_recommendation_model.ipynb` first.")
        return

    print(f"Loading AI Engine from {MODEL_PATH.name}...")
    engine = joblib.load(MODEL_PATH)
    print("[+] Model loaded successfully!\n")

    # Sample input from "Create Event" Tab
    sample_events = [
        {"event_type": "Wedding", "client_budget": 35000.0, "guest_count": 150},
        {"event_type": "Conference", "client_budget": 50000.0, "guest_count": 300},
        {"event_type": "Birthday", "client_budget": 4000.0, "guest_count": 40},
    ]

    for ev in sample_events:
        etype = ev["event_type"]
        budget = ev["client_budget"]
        guests = ev["guest_count"]

        print(f"\n>> Generating Recommendations for:")
        print(f"   Event Type: {etype} | Budget: ${budget:,.2f} | People Attending: {guests}")
        print("-" * 80)

        result = engine.recommend(event_type=etype, client_budget=budget, guest_count=guests)
        rec_bundle = result["bundles"]["recommended"]

        if not result["is_budget_sufficient"]:
            print(
                f"[!] Insufficient budget for a complete vendor package. "
                f"Minimum estimated budget: ${result['minimum_required_budget']:,.2f} "
                f"(short by ${result['budget_deficit']:,.2f})."
            )

        print(f"[*] Recommended Package: {rec_bundle['bundle_name']}")
        print(f"   Total Estimated Cost : ${rec_bundle['total_cost']:,.2f} (Savings: ${rec_bundle['remaining_budget']:,.2f})")
        print(f"   Budget Utilization   : {rec_bundle['budget_utilization_pct']}%")
        print(f"   Average Vendor Rating: {rec_bundle['average_rating']} / 5.0")
        print("\n   Selected Vendors:")
        for v in rec_bundle["vendors"]:
            print(f"   - [{v['category']:13s}] {v['vendor_name']:32s} | ${v['estimated_cost']:8,.2f} | Rating: {v['rating']} ({v['tier']})")
        print("=" * 80)


if __name__ == "__main__":
    run_demo()
