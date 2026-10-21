/**
 * AI Service Client
 * Provides typed frontend functions to interact with the FastAPI AIML backend.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
export const API_DOCS_URL = `${API_BASE_URL}/docs`;
export const AI_METADATA_URL = `${API_BASE_URL}/api/ai/metadata`;

export interface VendorRecommendationQuery {
    event_type: string;
    client_budget: number;
    guest_count: number;
}

export interface RecommendedVendor {
    vendor_id: string;
    vendor_name: string;
    category: string;
    tier: string;
    rating: number;
    reviews: number;
    estimated_cost: number;
    budget_allocated: number;
    cost_variance: number;
    total_match_score: number;
}

export interface VendorBundle {
    bundle_name: string;
    total_cost: number;
    client_budget: number;
    remaining_budget: number;
    budget_utilization_pct: number;
    average_match_score: number;
    average_rating: number;
    is_within_budget?: boolean;
    event_type?: string;
    guest_count?: number;
    vendors: RecommendedVendor[];
}

export interface VendorRecommendationResponse {
    query: VendorRecommendationQuery;
    predicted_category_budgets: Record<string, number>;
    bundles: {
        recommended: VendorBundle;
        budget_saver: VendorBundle;
        premium: VendorBundle;
    };
    is_budget_sufficient?: boolean;
    minimum_required_budget?: number;
    budget_deficit?: number;
    budget_warning?: string;
}

export interface BudgetAllocationItem {
    category: string;
    allocated_amount: number;
    percentage_share: number;
}

export interface BudgetPredictResponse {
    event_type: string;
    client_budget: number;
    guest_count: number;
    allocations: BudgetAllocationItem[];
}

/**
 * Fetch AI-generated vendor bundle recommendations based on budget and guest count.
 */
export async function fetchAiVendorRecommendations(
    eventType: string,
    clientBudget: number,
    guestCount: number
): Promise<VendorRecommendationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/recommend-vendors`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            event_type: eventType,
            client_budget: clientBudget,
            guest_count: guestCount,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return response.json();
}

/**
 * Predict category budget allocations before selecting vendors.
 */
export async function predictCategoryBudgets(
    eventType: string,
    clientBudget: number,
    guestCount: number
): Promise<BudgetPredictResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/predict-budget`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            event_type: eventType,
            client_budget: clientBudget,
            guest_count: guestCount,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return response.json();
}

/**
 * Check AI Backend Health.
 */
export async function checkAiHealth(): Promise<{ status: string; ai_engine_ready: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
}

export interface NegotiationResult {
    vendor_id: string;
    vendor_name: string;
    category: string;
    tier: string;
    guest_count: number;
    original_quoted_price: number;
    floor_reservation_price: number;
    negotiated_price: number;
    total_savings: number;
    discount_percentage: number;
    agreement_reached: boolean;
    rounds: Array<{
        round: number;
        buyer_offer: number;
        vendor_counter: number;
        status: string;
        notes: string;
    }>;
    leverage_points: string[];
    negotiation_pitch: string;
}

/**
 * Execute AI vendor price negotiation.
 */
export async function negotiateVendorPrice(
    vendorId: string,
    guestCount: number,
    targetBudget?: number,
    hasFlexibleDate = true,
    hasEarlyDeposit = true,
    vendorData?: Record<string, unknown>
): Promise<NegotiationResult> {
    const response = await fetch(`${API_BASE_URL}/api/ai/negotiate-vendor-price`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            vendor_id: vendorId,
            guest_count: guestCount,
            target_budget: targetBudget,
            has_flexible_date: hasFlexibleDate,
            has_early_deposit: hasEarlyDeposit,
            vendor_data: vendorData,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return response.json();
}

export interface BundleNegotiationResult {
    bundle_name: string;
    original_total_cost: number;
    negotiated_total_cost: number;
    total_savings: number;
    overall_discount_pct: number;
    vendor_negotiations: NegotiationResult[];
}

/**
 * Execute package-level AI price negotiation across all vendors in a bundle.
 */
export async function negotiateBundlePrices(
    bundle: VendorBundle,
    hasFlexibleDate = true,
    hasEarlyDeposit = true
): Promise<BundleNegotiationResult> {
    const response = await fetch(`${API_BASE_URL}/api/ai/negotiate-bundle`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            bundle,
            has_flexible_date: hasFlexibleDate,
            has_early_deposit: hasEarlyDeposit,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return response.json();
}
