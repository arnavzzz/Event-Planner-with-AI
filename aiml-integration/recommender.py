"""
Event Planner - AI Vendor Recommender & Budget Allocation Engine
Provides reusable classes and inference functions for predicting category budgets,
scoring vendors against event requirements, and optimizing vendor bundles.
"""

import math
import joblib
import numpy as np
import pandas as pd

VENDOR_CATEGORIES = [
    "Venue",
    "Catering",
    "Photography",
    "Decor",
    "AudioVisual",
    "Entertainment",
    "Staffing"
]

EVENT_TYPES = [
    "Wedding",
    "Birthday",
    "Corporate",
    "Conference",
    "Festival",
    "Other"
]


def predict_budget_allocation(model, event_type: str, client_budget: float, guest_count: int):
    """
    Predicts and guarantees an exact sum-normalized budget breakdown across all 7 vendor categories.
    """
    bpg = client_budget / max(guest_count, 1)
    input_df = pd.DataFrame([{
        "event_type": event_type,
        "client_budget": float(client_budget),
        "guest_count": int(guest_count),
        "budget_per_guest": float(bpg)
    }])

    raw_preds = model.predict(input_df)[0]
    # Ensure non-negative
    raw_preds = np.maximum(raw_preds, 0)

    # Proportional normalization to strictly match client_budget
    total_raw = np.sum(raw_preds)
    if total_raw > 0:
        normalized_preds = (raw_preds / total_raw) * client_budget
    else:
        normalized_preds = np.ones(len(raw_preds)) * (client_budget / len(raw_preds))

    allocation = {}
    for idx, cat in enumerate(VENDOR_CATEGORIES):
        allocation[cat] = round(float(normalized_preds[idx]), 2)

    # Adjust any floating/rounding cent residual on the largest category to ensure exact dollar match
    diff = round(client_budget - sum(allocation.values()), 2)
    if diff != 0:
        largest_cat = max(allocation, key=allocation.get)
        allocation[largest_cat] = round(allocation[largest_cat] + diff, 2)

    return allocation


def evaluate_vendor(vendor: dict, event_type: str, guest_count: int, allocated_budget: float):
    """
    Computes feasibility, estimated cost, and a multi-criteria compatibility score (0-100)
    for a single vendor given event parameters.
    """
    # Hard constraints
    if event_type not in vendor.get("types", []):
        return {"feasible": False, "reason": f"Does not support {event_type}"}
    if guest_count < vendor.get("min_capacity", 0):
        return {"feasible": False, "reason": f"Guest count ({guest_count}) below min capacity ({vendor['min_capacity']})"}
    if guest_count > vendor.get("max_capacity", 99999):
        return {"feasible": False, "reason": f"Guest count ({guest_count}) exceeds max capacity ({vendor['max_capacity']})"}

    # Dynamic pricing calculation
    est_cost = vendor["base_fee"] + (vendor["per_person_rate"] * guest_count)

    # 1. Budget Fit Score (0 to 40 points)
    cost_ratio = est_cost / max(allocated_budget, 1.0)
    if cost_ratio <= 1.0:
        if cost_ratio >= 0.70:
            budget_score = 40.0 * (1.0 - 0.2 * (1.0 - cost_ratio))
        else:
            budget_score = 40.0 * (cost_ratio / 0.70) * 0.85
    else:
        overage = cost_ratio - 1.0
        budget_score = max(0.0, 40.0 * math.exp(-6.0 * overage))

    # 2. Rating & Reliability Score (0 to 35 points)
    reviews = vendor.get("reviews", 50)
    confidence = min(reviews / 150.0, 1.0)
    bayesian_rating = 4.0 * (1 - confidence) + vendor.get("rating", 4.0) * confidence
    rating_score = (bayesian_rating / 5.0) * 25.0 + (vendor.get("reliability_score", 0.85) * 10.0)

    # 3. Capacity Sweet-Spot Score (0 to 25 points)
    cap_span = vendor["max_capacity"] - vendor["min_capacity"]
    cap_utilization = (guest_count - vendor["min_capacity"]) / max(cap_span, 1)
    if 0.20 <= cap_utilization <= 0.85:
        capacity_score = 25.0
    else:
        dist_from_sweet = min(abs(cap_utilization - 0.20), abs(cap_utilization - 0.85))
        capacity_score = max(10.0, 25.0 - (dist_from_sweet * 30.0))

    total_score = round(budget_score + rating_score + capacity_score, 1)

    return {
        "feasible": True,
        "vendor_id": vendor["id"],
        "vendor_name": vendor["name"],
        "category": vendor["category"],
        "tier": vendor.get("tier", "Moderate"),
        "rating": vendor.get("rating", 4.5),
        "reviews": vendor.get("reviews", 50),
        "estimated_cost": round(est_cost, 2),
        "budget_allocated": round(allocated_budget, 2),
        "cost_variance": round(allocated_budget - est_cost, 2),
        "budget_fit_score": round(budget_score, 1),
        "rating_score": round(rating_score, 1),
        "capacity_score": round(capacity_score, 1),
        "total_match_score": total_score
    }


def optimize_vendor_bundles(vendors_catalog: list, event_type: str, client_budget: float, guest_count: int, category_budgets: dict):
    """
    Runs combinatorial optimization across all categories to return 3 distinct bundles:
    1. AI Recommended (Balanced)
    2. Budget-Saver
    3. Premium / Luxury
    """
    feasible_by_cat = {}
    for cat in VENDOR_CATEGORIES:
        cat_budget = category_budgets.get(cat, client_budget / len(VENDOR_CATEGORIES))
        cat_candidates = []
        for v in vendors_catalog:
            if v["category"] == cat:
                eval_res = evaluate_vendor(v, event_type, guest_count, cat_budget)
                if eval_res["feasible"]:
                    cat_candidates.append(eval_res)
        cat_candidates.sort(key=lambda x: x["total_match_score"], reverse=True)
        feasible_by_cat[cat] = cat_candidates

    missing = [cat for cat in VENDOR_CATEGORIES if len(feasible_by_cat[cat]) == 0]
    if missing:
        raise ValueError(f"No feasible vendors found for categories: {missing} with {guest_count} guests for {event_type}")

    def fit_to_budget(selection: list, quality_field: str):
        """Downgrade vendors by the smallest quality loss per dollar saved."""
        selection = list(selection)
        total_cost = sum(item["estimated_cost"] for item in selection)

        while total_cost > client_budget:
            swaps = []
            for index, current in enumerate(selection):
                for candidate in feasible_by_cat[current["category"]]:
                    saved = current["estimated_cost"] - candidate["estimated_cost"]
                    if saved <= 0:
                        continue
                    quality_loss = max(0.0, current[quality_field] - candidate[quality_field])
                    swaps.append((quality_loss / saved, -saved, index, candidate))

            if not swaps:
                break

            _, _, index, replacement = min(swaps, key=lambda swap: (swap[0], swap[1]))
            total_cost += replacement["estimated_cost"] - selection[index]["estimated_cost"]
            selection[index] = replacement

        return selection, round(total_cost, 2)

    # Bundle 1: AI Balanced Best Match
    balanced_selection = []
    for cat in VENDOR_CATEGORIES:
        best_cand = feasible_by_cat[cat][0]
        balanced_selection.append(best_cand)
    balanced_selection, total_balanced_cost = fit_to_budget(balanced_selection, "total_match_score")

    # Bundle 2: Budget Saver
    budget_saver_selection = []
    for cat in VENDOR_CATEGORIES:
        cheapest_cand = min(feasible_by_cat[cat], key=lambda x: x["estimated_cost"])
        budget_saver_selection.append(cheapest_cand)
    total_saver_cost = round(sum(item["estimated_cost"] for item in budget_saver_selection), 2)

    # Bundle 3: Premium / Luxury
    premium_selection = []
    for cat in VENDOR_CATEGORIES:
        tier_sorted = sorted(feasible_by_cat[cat], key=lambda x: (x["rating"], x["estimated_cost"]), reverse=True)
        premium_selection.append(tier_sorted[0])
    premium_selection, total_premium_cost = fit_to_budget(premium_selection, "rating")

    is_budget_sufficient = total_saver_cost <= client_budget + 1e-6
    budget_deficit = round(max(0.0, total_saver_cost - client_budget), 2)

    def format_bundle(name: str, items: list, total_cost: float):
        avg_score = float(np.mean([item["total_match_score"] for item in items]))
        avg_rating = float(np.mean([item["rating"] for item in items]))
        savings = client_budget - total_cost
        return {
            "bundle_name": name,
            "total_cost": round(total_cost, 2),
            "client_budget": float(client_budget),
            "remaining_budget": round(savings, 2),
            "budget_utilization_pct": round((total_cost / client_budget) * 100, 1),
            "is_within_budget": total_cost <= client_budget + 1e-6,
            "average_match_score": round(avg_score, 1),
            "average_rating": round(avg_rating, 2),
            "event_type": event_type,
            "guest_count": guest_count,
            "vendors": items
        }

    return {
        "recommended": format_bundle("AI Balanced Recommended", balanced_selection, total_balanced_cost),
        "budget_saver": format_bundle("Budget Saver Package", budget_saver_selection, total_saver_cost),
        "premium": format_bundle("Premium Experience", premium_selection, total_premium_cost),
        "is_budget_sufficient": is_budget_sufficient,
        "minimum_required_budget": total_saver_cost,
        "budget_deficit": budget_deficit,
        "budget_warning": None if is_budget_sufficient else "The budget is below the minimum estimated cost for a complete vendor package."
    }


class EventVendorRecommender:
    """
    Production-ready AI Recommendation Engine for Event Planning.
    Directly addresses the Create Event Tab inputs.
    """
    def __init__(self, budget_model_pipeline=None, vendor_catalog=None):
        self.budget_model = budget_model_pipeline
        self.vendor_catalog = vendor_catalog or []

    def fit(self, X_train_df, y_train_df):
        """Trains the budget allocation model."""
        self.budget_model.fit(X_train_df, y_train_df)
        return self

    def recommend(self, event_type: str, client_budget: float, guest_count: int):
        """
        Primary inference entrypoint for the Create Event Tab.
        """
        if client_budget <= 0:
            raise ValueError("client_budget must be positive.")
        if guest_count <= 0:
            raise ValueError("guest_count must be at least 1.")

        category_budgets = predict_budget_allocation(
            self.budget_model, event_type, client_budget, guest_count
        )

        bundles = optimize_vendor_bundles(
            self.vendor_catalog, event_type, client_budget, guest_count, category_budgets
        )

        return {
            "query": {
                "event_type": event_type,
                "client_budget": client_budget,
                "guest_count": guest_count
            },
            "predicted_category_budgets": category_budgets,
            "bundles": {key: value for key, value in bundles.items() if key in {"recommended", "budget_saver", "premium"}},
            "is_budget_sufficient": bundles["is_budget_sufficient"],
            "minimum_required_budget": bundles["minimum_required_budget"],
            "budget_deficit": bundles["budget_deficit"],
            "budget_warning": bundles["budget_warning"],
        }

    def negotiate_vendor(self, vendor_id_or_dict, guest_count: int, target_budget: float = None, has_flexible_date: bool = True, has_early_deposit: bool = True):
        """
        Executes AI price negotiation for a specific vendor.
        """
        if isinstance(vendor_id_or_dict, str):
            matched = [v for v in self.vendor_catalog if v["id"] == vendor_id_or_dict]
            if not matched:
                raise ValueError(f"Vendor with id {vendor_id_or_dict} not found.")
            vendor = matched[0]
        else:
            vendor = vendor_id_or_dict

        return AIVendorNegotiator.negotiate(
            vendor=vendor,
            guest_count=guest_count,
            target_budget=target_budget,
            has_flexible_date=has_flexible_date,
            has_early_deposit=has_early_deposit
        )

    def negotiate_bundle(self, bundle: dict, has_flexible_date: bool = True, has_early_deposit: bool = True):
        """
        Applies AI negotiation across all vendors in a bundle to secure package discounts.
        """
        negotiated_vendors = []
        original_total = 0.0
        negotiated_total = 0.0

        vendors_list = bundle.get("vendors", [])
        for v in vendors_list:
            estimated_cost = float(v.get("estimated_cost", v.get("base_fee", 0)))
            has_price_components = "base_fee" in v or "per_person_rate" in v
            v_dict = {
                "id": v.get("vendor_id") or v.get("id"),
                "name": v.get("vendor_name") or v.get("name"),
                "category": v["category"],
                "tier": v.get("tier", "Moderate"),
                "base_fee": v.get("base_fee", 0) if has_price_components else estimated_cost,
                "per_person_rate": v.get("per_person_rate", 0),
                "estimated_cost": estimated_cost,
                "types": [bundle.get("event_type", "Wedding")]
            }
            # If base_fee + per_person was already computed
            guest_count = bundle.get("guest_count", 100)
            neg_res = self.negotiate_vendor(
                v_dict,
                guest_count=guest_count,
                target_budget=v.get("budget_allocated"),
                has_flexible_date=has_flexible_date,
                has_early_deposit=has_early_deposit
            )
            original_total += neg_res["original_quoted_price"]
            negotiated_total += neg_res["negotiated_price"]
            negotiated_vendors.append(neg_res)

        total_savings = round(original_total - negotiated_total, 2)
        total_discount_pct = round((total_savings / max(original_total, 1.0)) * 100, 1)

        return {
            "bundle_name": bundle.get("bundle_name", "AI Bundle"),
            "original_total_cost": round(original_total, 2),
            "negotiated_total_cost": round(negotiated_total, 2),
            "total_savings": total_savings,
            "overall_discount_pct": total_discount_pct,
            "vendor_negotiations": negotiated_vendors
        }

    def save(self, filepath: str):
        """Serializes engine to disk."""
        joblib.dump(self, filepath)
        print(f"Engine serialized successfully to {filepath}")

    @staticmethod
    def load(filepath: str):
        """Loads engine from disk."""
        return joblib.load(filepath)


class AIVendorNegotiator:
    """
    Automated AI Negotiation Engine for Vendor Pricing.
    Simulates multi-round alternating concession bargaining between
    the Event Planner (Buyer Agent) and the Vendor (Seller Agent).
    """

    TIER_MAX_DISCOUNTS = {
        "Budget": 0.12,     # Budget vendors have tight margins (8-12%)
        "Moderate": 0.18,   # Moderate vendors offer balanced flexibility (14-18%)
        "Premium": 0.22,    # Premium vendors have healthy margins (18-22%)
        "Luxury": 0.28      # Luxury vendors have higher markup (22-28%)
    }

    @classmethod
    def calculate_reservation_floor(
        cls,
        vendor: dict,
        guest_count: int,
        has_flexible_date: bool = False,
        has_early_deposit: bool = False
    ) -> float:
        """Calculates the lowest price (reservation floor / BATNA) the vendor can accept."""
        quoted_price = vendor.get("base_fee", 0) + (vendor.get("per_person_rate", 0) * guest_count)
        if quoted_price <= 0 and "estimated_cost" in vendor:
            quoted_price = vendor["estimated_cost"]

        tier = vendor.get("tier", "Moderate")
        base_margin = cls.TIER_MAX_DISCOUNTS.get(tier, 0.18)

        # Volume elasticity bonus: guest counts above 80 give higher negotiating leverage
        volume_bonus = min(0.06, max(0.0, (guest_count - 80) / 1000.0 * 0.10))

        # Leverage adjustments
        date_bonus = 0.04 if has_flexible_date else 0.0
        deposit_bonus = 0.03 if has_early_deposit else 0.0

        total_max_discount = min(0.35, base_margin + volume_bonus + date_bonus + deposit_bonus)
        floor_price = quoted_price * (1.0 - total_max_discount)
        return round(floor_price, 2)

    @classmethod
    def negotiate(
        cls,
        vendor: dict,
        guest_count: int,
        target_budget: float = None,
        has_flexible_date: bool = True,
        has_early_deposit: bool = True,
        max_rounds: int = 4
    ) -> dict:
        """
        Simulates an automated multi-round alternating concession negotiation.
        """
        quoted_price = vendor.get("base_fee", 0) + (vendor.get("per_person_rate", 0) * guest_count)
        if quoted_price <= 0 and "estimated_cost" in vendor:
            quoted_price = vendor["estimated_cost"]
        quoted_price = round(float(quoted_price), 2)

        floor_price = cls.calculate_reservation_floor(
            vendor, guest_count, has_flexible_date, has_early_deposit
        )

        # Determine buyer's target price
        if target_budget and target_budget > 0:
            buyer_target = min(quoted_price, max(floor_price * 0.96, target_budget))
        else:
            buyer_target = max(floor_price, quoted_price * 0.82)

        # Opening buyer anchor (aggressive first offer)
        buyer_offer = round(max(floor_price * 0.94, quoted_price * 0.78), 2)
        vendor_offer = quoted_price

        rounds = []
        agreement_reached = False
        final_price = quoted_price

        for r in range(1, max_rounds + 1):
            # Vendor evaluates buyer offer
            if buyer_offer >= vendor_offer * 0.98 or buyer_offer >= floor_price * 1.02:
                final_price = round((buyer_offer + min(vendor_offer, buyer_offer)) / 2, 2)
                agreement_reached = True
                rounds.append({
                    "round": r,
                    "buyer_offer": buyer_offer,
                    "vendor_counter": final_price,
                    "status": "Accepted",
                    "notes": "Vendor accepted buyer offer within acceptable margin."
                })
                break

            # Vendor concession (Boulware curve)
            concession_rate = (r / max_rounds) ** 1.3
            vendor_offer = round(quoted_price - ((quoted_price - floor_price) * concession_rate), 2)

            rounds.append({
                "round": r,
                "buyer_offer": buyer_offer,
                "vendor_counter": vendor_offer,
                "status": "Counter-Offer",
                "notes": f"Vendor conceded to ${vendor_offer:,.2f}."
            })

            # Buyer makes next counter-offer
            if r < max_rounds:
                buyer_concession_rate = (r / max_rounds) ** 0.85
                buyer_offer = round(buyer_offer + ((buyer_target - buyer_offer) * buyer_concession_rate * 0.85), 2)
                if buyer_offer >= vendor_offer:
                    final_price = vendor_offer
                    agreement_reached = True
                    rounds.append({
                        "round": r + 1,
                        "buyer_offer": buyer_offer,
                        "vendor_counter": final_price,
                        "status": "Accepted",
                        "notes": "Agreement reached as buyer matched vendor counter-offer."
                    })
                    break

        if not agreement_reached:
            final_price = max(floor_price, vendor_offer)

        total_savings = round(quoted_price - final_price, 2)
        discount_pct = round((total_savings / max(quoted_price, 1.0)) * 100, 1)

        # Construct specific leverage points
        rationales = []
        if guest_count >= 100:
            rationales.append(f"Volume Guarantee: Large attendee base of {guest_count} guests provides high scale economies.")
        if has_early_deposit:
            rationales.append("Payment Terms: Willingness to secure booking with immediate 50% upfront deposit.")
        if has_flexible_date:
            rationales.append("Schedule Flexibility: Openness to non-peak arrival or weekday setup windows.")
        rationales.append("Partnership: Opportunity for recurring event organizer referral bookings.")

        # Ready-to-send drafted communication
        email_pitch = (
            f"Dear {vendor.get('name', 'Vendor')} Team,\n\n"
            f"We are excited about collaborating with you for our upcoming event with {guest_count} attendees. "
            f"Our initial quote is ${quoted_price:,.2f}. Based on our allocated budget and attendee scale, "
            f"we would like to propose a preferred booking rate of ${final_price:,.2f} ({discount_pct}% adjustment).\n\n"
            f"In return, we can offer:\n"
            + "".join(f"• {r}\n" for r in rationales[:3])
            + f"\nWe look forward to confirming our contract with you.\n\nBest regards,\nEvent Operations Team"
        )

        return {
            "vendor_id": vendor.get("id"),
            "vendor_name": vendor.get("name"),
            "category": vendor.get("category"),
            "tier": vendor.get("tier", "Moderate"),
            "guest_count": guest_count,
            "original_quoted_price": quoted_price,
            "floor_reservation_price": floor_price,
            "negotiated_price": final_price,
            "total_savings": total_savings,
            "discount_percentage": discount_pct,
            "agreement_reached": agreement_reached,
            "rounds": rounds,
            "leverage_points": rationales,
            "negotiation_pitch": email_pitch
        }
