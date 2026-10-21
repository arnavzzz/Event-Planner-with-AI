import type {
    BundleNegotiationResult,
    NegotiationResult,
    VendorBundle,
    VendorRecommendationResponse
} from "../../../api/aiService.ts";

// RBI USD/INR reference rate from 19 Oct 2026; override with VITE_USD_TO_INR_RATE when refreshing the rate.
const configuredRate = Number(import.meta.env.VITE_USD_TO_INR_RATE);
export const INR_PER_USD = Number.isFinite(configuredRate) && configuredRate > 0
    ? configuredRate
    : 94.7691;

export function formatInr(amount: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Math.round(amount));
}

export function usdToInr(amount: number) {
    return Math.round(amount * INR_PER_USD);
}

export function inrToUsd(amount: number) {
    return amount / INR_PER_USD;
}

export function convertNegotiationToInr(result: NegotiationResult): NegotiationResult {
    return {
        ...result,
        original_quoted_price: usdToInr(result.original_quoted_price),
        floor_reservation_price: usdToInr(result.floor_reservation_price),
        negotiated_price: usdToInr(result.negotiated_price),
        total_savings: usdToInr(result.total_savings),
        rounds: (result.rounds || []).map((r) => ({
            ...r,
            buyer_offer: usdToInr(r.buyer_offer),
            vendor_counter: usdToInr(r.vendor_counter),
        })),
    };
}

export function convertBundleNegotiationToInr(result: BundleNegotiationResult): BundleNegotiationResult {
    return {
        ...result,
        original_total_cost: usdToInr(result.original_total_cost),
        negotiated_total_cost: usdToInr(result.negotiated_total_cost),
        total_savings: usdToInr(result.total_savings),
        vendor_negotiations: (result.vendor_negotiations || []).map(convertNegotiationToInr),
    };
}

export function convertRecommendationsToInr(response: VendorRecommendationResponse): VendorRecommendationResponse {
    const convertBundle = (bundle: VendorBundle): VendorBundle => ({
        ...bundle,
        total_cost: usdToInr(bundle.total_cost),
        client_budget: usdToInr(bundle.client_budget),
        remaining_budget: usdToInr(bundle.remaining_budget),
        vendors: bundle.vendors.map((vendor) => ({
            ...vendor,
            estimated_cost: usdToInr(vendor.estimated_cost),
            budget_allocated: usdToInr(vendor.budget_allocated),
            cost_variance: usdToInr(vendor.cost_variance),
        })),
    });

    return {
        ...response,
        minimum_required_budget: response.minimum_required_budget !== undefined ? usdToInr(response.minimum_required_budget) : undefined,
        budget_deficit: response.budget_deficit !== undefined ? usdToInr(response.budget_deficit) : 0,
        query: {
            ...response.query,
            client_budget: usdToInr(response.query.client_budget),
        },
        predicted_category_budgets: Object.fromEntries(
            Object.entries(response.predicted_category_budgets).map(([category, amount]) => [category, usdToInr(amount)])
        ),
        bundles: {
            recommended: convertBundle(response.bundles.recommended),
            budget_saver: convertBundle(response.bundles.budget_saver),
            premium: convertBundle(response.bundles.premium),
        },
    };
}
