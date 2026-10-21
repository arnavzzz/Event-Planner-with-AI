/**
 * AI Service Client
 * Provides typed frontend functions to interact with the FastAPI AIML backend,
 * with automatic, resilient client-side simulation fallback when deployed on Netlify
 * before the live backend is connected.
 */

// In production on Netlify, set VITE_API_URL to your deployed FastAPI backend URL.
// When left blank, requests go to /api/... which can be proxied by Vite or Netlify.
export const API_BASE_URL = (import.meta.env.VITE_API_URL?.trim() || "").replace(/\/+$/, "");
export const API_DOCS_URL = `${API_BASE_URL || "http://127.0.0.1:8000"}/docs`;
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

export interface BundleNegotiationResult {
    bundle_name: string;
    original_total_cost: number;
    negotiated_total_cost: number;
    total_savings: number;
    overall_discount_pct: number;
    vendor_negotiations: NegotiationResult[];
}

// -----------------------------------------------------------------------------
// Offline Simulation Fallback Engine (for Netlify preview without live backend)
// -----------------------------------------------------------------------------

const FALLBACK_WEIGHTS: Record<string, Record<string, number>> = {
    Wedding: {
        Venue: 0.35,
        Catering: 0.28,
        "Photography & Videography": 0.10,
        "Decor & Floral": 0.09,
        "Audio / Visual & Lighting": 0.07,
        "Entertainment / DJ": 0.06,
        "Staffing & Security": 0.05,
    },
    Corporate: {
        Venue: 0.38,
        Catering: 0.24,
        "Audio / Visual & Lighting": 0.14,
        "Staffing & Security": 0.09,
        "Photography & Videography": 0.06,
        "Decor & Floral": 0.05,
        "Entertainment / DJ": 0.04,
    },
    Default: {
        Venue: 0.34,
        Catering: 0.26,
        "Decor & Floral": 0.10,
        "Photography & Videography": 0.10,
        "Audio / Visual & Lighting": 0.08,
        "Entertainment / DJ": 0.06,
        "Staffing & Security": 0.06,
    },
};

const SAMPLE_FALLBACK_VENDORS = [
    { id: "VEN-001", name: "Grand Crystal Ballroom", category: "Venue", tier: "Premium", rating: 4.8, reviews: 142, base: 3500, perPerson: 15 },
    { id: "VEN-002", name: "Sunset Botanical Gardens", category: "Venue", tier: "Premium", rating: 4.9, reviews: 195, base: 2800, perPerson: 10 },
    { id: "VEN-003", name: "Urban Skyline Hall", category: "Venue", tier: "Moderate", rating: 4.6, reviews: 118, base: 1800, perPerson: 8 },
    { id: "VEN-004", name: "Community Civic Pavilion", category: "Venue", tier: "Budget", rating: 4.3, reviews: 76, base: 950, perPerson: 5 },

    { id: "CAT-001", name: "Epicurean Feast Catering", category: "Catering", tier: "Premium", rating: 4.8, reviews: 164, base: 1200, perPerson: 45 },
    { id: "CAT-002", name: "Artisanal Plate Co.", category: "Catering", tier: "Moderate", rating: 4.6, reviews: 98, base: 800, perPerson: 32 },
    { id: "CAT-003", name: "Golden Spoon Banquet Caterers", category: "Catering", tier: "Budget", rating: 4.3, reviews: 85, base: 450, perPerson: 22 },

    { id: "PHO-001", name: "Lumina Cinematic Studios", category: "Photography & Videography", tier: "Premium", rating: 4.9, reviews: 210, base: 2800, perPerson: 2 },
    { id: "PHO-002", name: "TrueFrame Moments", category: "Photography & Videography", tier: "Moderate", rating: 4.6, reviews: 115, base: 1750, perPerson: 1 },
    { id: "PHO-003", name: "Snaphub Media", category: "Photography & Videography", tier: "Budget", rating: 4.2, reviews: 64, base: 950, perPerson: 0 },

    { id: "DEC-001", name: "Bloom & Grandeur Floral Atelier", category: "Decor & Floral", tier: "Premium", rating: 4.8, reviews: 130, base: 2200, perPerson: 6 },
    { id: "DEC-002", name: "Petal & Prism Events", category: "Decor & Floral", tier: "Moderate", rating: 4.5, reviews: 88, base: 1400, perPerson: 4 },
    { id: "DEC-003", name: "Rustic Charm Rentals", category: "Decor & Floral", tier: "Budget", rating: 4.2, reviews: 52, base: 750, perPerson: 2 },

    { id: "AVL-001", name: "Starlight Pro Audio & Lighting", category: "Audio / Visual & Lighting", tier: "Premium", rating: 4.9, reviews: 145, base: 2500, perPerson: 3 },
    { id: "AVL-002", name: "Pulse Stage Solutions", category: "Audio / Visual & Lighting", tier: "Moderate", rating: 4.6, reviews: 92, base: 1600, perPerson: 2 },
    { id: "AVL-003", name: "ClearWave Audio", category: "Audio / Visual & Lighting", tier: "Budget", rating: 4.3, reviews: 48, base: 850, perPerson: 1 },

    { id: "ENT-001", name: "Symphony & Beats Ensemble", category: "Entertainment / DJ", tier: "Premium", rating: 4.9, reviews: 178, base: 2100, perPerson: 0 },
    { id: "ENT-002", name: "DJ Sonic Groove", category: "Entertainment / DJ", tier: "Moderate", rating: 4.6, reviews: 104, base: 1300, perPerson: 0 },
    { id: "ENT-003", name: "Rhythm Spark DJ Services", category: "Entertainment / DJ", tier: "Budget", rating: 4.2, reviews: 60, base: 700, perPerson: 0 },

    { id: "STA-001", name: "Elite Guard & Event Hospitality", category: "Staffing & Security", tier: "Premium", rating: 4.8, reviews: 112, base: 900, perPerson: 7 },
    { id: "STA-002", name: "ProEvent Ushers & Marshals", category: "Staffing & Security", tier: "Moderate", rating: 4.5, reviews: 79, base: 600, perPerson: 5 },
    { id: "STA-003", name: "SafeHands Staffing", category: "Staffing & Security", tier: "Budget", rating: 4.2, reviews: 43, base: 350, perPerson: 3 },
];

function simulateOfflineRecommendations(
    eventType: string,
    clientBudget: number,
    guestCount: number
): VendorRecommendationResponse {
    const weights = FALLBACK_WEIGHTS[eventType] || FALLBACK_WEIGHTS.Default;
    const predictedBudgets: Record<string, number> = {};
    for (const [cat, weight] of Object.entries(weights)) {
        predictedBudgets[cat] = Math.round(clientBudget * weight);
    }

    const categories = Object.keys(weights);

    const buildBundle = (
        name: string,
        tierPreference: "Premium" | "Moderate" | "Budget",
        allowFallbackTier: boolean
    ): VendorBundle => {
        const bundleVendors: RecommendedVendor[] = [];
        let totalCost = 0;

        for (const cat of categories) {
            const candidates = SAMPLE_FALLBACK_VENDORS.filter((v) => v.category === cat);
            let selected = candidates.find((v) => v.tier === tierPreference);
            if (!selected && allowFallbackTier) {
                selected = candidates[0];
            }
            if (!selected) continue;

            const cost = selected.base + selected.perPerson * guestCount;
            const allocated = predictedBudgets[cat] || cost;
            const variance = Math.round(cost - allocated);
            const score = Math.round((selected.rating / 5) * 85 + (cost <= allocated ? 15 : 5));

            bundleVendors.push({
                vendor_id: selected.id,
                vendor_name: selected.name,
                category: selected.category,
                tier: selected.tier,
                rating: selected.rating,
                reviews: selected.reviews,
                estimated_cost: cost,
                budget_allocated: allocated,
                cost_variance: variance,
                total_match_score: score,
            });
            totalCost += cost;
        }

        const avgScore = bundleVendors.length
            ? Math.round(bundleVendors.reduce((s, v) => s + v.total_match_score, 0) / bundleVendors.length)
            : 85;
        const avgRating = bundleVendors.length
            ? Number((bundleVendors.reduce((s, v) => s + v.rating, 0) / bundleVendors.length).toFixed(1))
            : 4.6;

        return {
            bundle_name: name,
            total_cost: totalCost,
            client_budget: clientBudget,
            remaining_budget: Math.round(clientBudget - totalCost),
            budget_utilization_pct: Number(((totalCost / clientBudget) * 100).toFixed(1)),
            average_match_score: avgScore,
            average_rating: avgRating,
            is_within_budget: totalCost <= clientBudget,
            event_type: eventType,
            guest_count: guestCount,
            vendors: bundleVendors,
        };
    };

    const budgetSaver = buildBundle("Budget Saver Package", "Budget", true);
    const recommended = buildBundle("AI Balanced Recommended", "Moderate", true);
    const premium = buildBundle("Premium Experience", "Premium", true);

    const minRequired = budgetSaver.total_cost;
    const isSufficient = clientBudget >= minRequired;
    const deficit = Math.max(0, Math.round(minRequired - clientBudget));
    const warning = !isSufficient
        ? `You cannot organise an event: Insufficient budget. The minimum required budget for ${guestCount} guests across all 7 categories is $${minRequired.toLocaleString()}. Your budget is short by $${deficit.toLocaleString()}.`
        : undefined;

    return {
        query: {
            event_type: eventType,
            client_budget: clientBudget,
            guest_count: guestCount,
        },
        predicted_category_budgets: predictedBudgets,
        bundles: {
            recommended,
            budget_saver: budgetSaver,
            premium,
        },
        is_budget_sufficient: isSufficient,
        minimum_required_budget: minRequired,
        budget_deficit: deficit,
        budget_warning: warning,
    };
}

function simulateOfflineNegotiation(
    vendorId: string,
    guestCount: number,
    targetBudget?: number,
    hasFlexibleDate = true,
    hasEarlyDeposit = true
): NegotiationResult {
    const vendor = SAMPLE_FALLBACK_VENDORS.find((v) => v.id === vendorId) || {
        id: vendorId,
        name: vendorId,
        category: "Event Services",
        tier: "Moderate",
        rating: 4.7,
        base: 2000,
        perPerson: 15,
    };

    const quotedPrice = Math.round(vendor.base + vendor.perPerson * guestCount);
    const maxDiscountPct = (hasFlexibleDate ? 0.12 : 0.05) + (hasEarlyDeposit ? 0.10 : 0.05);
    const negotiatedPrice = Math.round(quotedPrice * (1 - maxDiscountPct));
    const totalSavings = quotedPrice - negotiatedPrice;
    const discountPct = Number(((totalSavings / quotedPrice) * 100).toFixed(1));

    const round1Buyer = Math.round(targetBudget || quotedPrice * 0.72);
    const round1Counter = Math.round(quotedPrice * 0.90);
    const round2Buyer = Math.round(quotedPrice * 0.77);
    const round2Counter = negotiatedPrice;

    const leverage: string[] = [];
    if (hasFlexibleDate) leverage.push("Flexible event scheduling & off-peak load concession");
    if (hasEarlyDeposit) leverage.push("Immediate 40% upfront reservation deposit commitment");
    leverage.push(`Guaranteed headcount of ${guestCount} verified attendees`);

    const pitch = `Dear ${vendor.name} Team,

We are currently curating the vendor lineup for an upcoming event with ${guestCount} attendees and are keen to collaborate with you as our preferred ${vendor.category} provider.

In exchange for an adjusted rate of $${negotiatedPrice.toLocaleString()}, we can offer:
• ${hasFlexibleDate ? "Full scheduling flexibility on delivery and setup windows" : "Confirmed single-window execution"}
• ${hasEarlyDeposit ? "A fast-tracked 40% upfront deposit upon contract signing" : "Standard milestone billing"}
• Prompt post-event testimonial and portfolio promotion.

Please let us know if we can lock in this agreement at your earliest convenience.`;

    return {
        vendor_id: vendorId,
        vendor_name: vendor.name,
        category: vendor.category,
        tier: vendor.tier,
        guest_count: guestCount,
        original_quoted_price: quotedPrice,
        floor_reservation_price: Math.round(quotedPrice * 0.75),
        negotiated_price: negotiatedPrice,
        total_savings: totalSavings,
        discount_percentage: discountPct,
        agreement_reached: true,
        rounds: [
            {
                round: 1,
                buyer_offer: round1Buyer,
                vendor_counter: round1Counter,
                status: "countered",
                notes: "Vendor cited standard seasonal overhead and labor costs.",
            },
            {
                round: 2,
                buyer_offer: round2Buyer,
                vendor_counter: round2Counter,
                status: "accepted",
                notes: `Mutual agreement finalized with ${discountPct}% total concession.`,
            },
        ],
        leverage_points: leverage,
        negotiation_pitch: pitch,
    };
}

// -----------------------------------------------------------------------------
// Exported API Functions with Resilient Network Calls
// -----------------------------------------------------------------------------

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Fetch AI-generated vendor bundle recommendations based on budget and guest count.
 */
export async function fetchAiVendorRecommendations(
    eventType: string,
    clientBudget: number,
    guestCount: number
): Promise<VendorRecommendationResponse> {
    const targetUrl = `${API_BASE_URL}/api/ai/recommend-vendors`;

    try {
        const response = await fetchWithTimeout(targetUrl, {
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

        return await response.json();
    } catch (networkErr: unknown) {
        console.warn(
            "[aiService] FastAPI backend not accessible; utilizing built-in AI recommender engine fallback.",
            networkErr
        );
        // Fall back seamlessly to client-side model simulation
        return simulateOfflineRecommendations(eventType, clientBudget, guestCount);
    }
}

/**
 * Predict category budget allocations before selecting vendors.
 */
export async function predictCategoryBudgets(
    eventType: string,
    clientBudget: number,
    guestCount: number
): Promise<BudgetPredictResponse> {
    const targetUrl = `${API_BASE_URL}/api/ai/predict-budget`;

    try {
        const response = await fetchWithTimeout(targetUrl, {
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

        return await response.json();
    } catch {
        const weights = FALLBACK_WEIGHTS[eventType] || FALLBACK_WEIGHTS.Default;
        const allocations: BudgetAllocationItem[] = Object.entries(weights).map(([cat, w]) => ({
            category: cat,
            allocated_amount: Math.round(clientBudget * w),
            percentage_share: Math.round(w * 100),
        }));

        return {
            event_type: eventType,
            client_budget: clientBudget,
            guest_count: guestCount,
            allocations,
        };
    }
}

/**
 * Check AI Backend Health.
 */
export async function checkAiHealth(): Promise<{ status: string; ai_engine_ready: boolean }> {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/health`, {}, 2500);
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }
        return await response.json();
    } catch {
        return {
            status: "online (simulation fallback)",
            ai_engine_ready: true,
        };
    }
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
    const targetUrl = `${API_BASE_URL}/api/ai/negotiate-vendor-price`;

    try {
        const response = await fetchWithTimeout(targetUrl, {
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

        return await response.json();
    } catch (networkErr: unknown) {
        console.warn("[aiService] Using client-side negotiation fallback for vendor:", vendorId, networkErr);
        return simulateOfflineNegotiation(vendorId, guestCount, targetBudget, hasFlexibleDate, hasEarlyDeposit);
    }
}

/**
 * Execute package-level AI price negotiation across all vendors in a bundle.
 */
export async function negotiateBundlePrices(
    bundle: VendorBundle,
    hasFlexibleDate = true,
    hasEarlyDeposit = true
): Promise<BundleNegotiationResult> {
    const targetUrl = `${API_BASE_URL}/api/ai/negotiate-bundle`;

    try {
        const response = await fetchWithTimeout(targetUrl, {
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

        return await response.json();
    } catch (networkErr: unknown) {
        console.warn("[aiService] Using client-side bundle negotiation fallback:", bundle.bundle_name, networkErr);
        const guestCount = bundle.guest_count || 100;
        const vendorNegotiations: NegotiationResult[] = bundle.vendors.map((v) =>
            simulateOfflineNegotiation(v.vendor_id, guestCount, v.estimated_cost * 0.8, hasFlexibleDate, hasEarlyDeposit)
        );

        const originalTotal = bundle.total_cost;
        const negotiatedTotal = vendorNegotiations.reduce((sum, n) => sum + n.negotiated_price, 0);
        const totalSavings = Math.max(0, originalTotal - negotiatedTotal);
        const overallDiscount = Number(((totalSavings / originalTotal) * 100).toFixed(1));

        return {
            bundle_name: bundle.bundle_name,
            original_total_cost: originalTotal,
            negotiated_total_cost: negotiatedTotal,
            total_savings: totalSavings,
            overall_discount_pct: overallDiscount,
            vendor_negotiations: vendorNegotiations,
        };
    }
}
