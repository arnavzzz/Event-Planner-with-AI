import {useRef, useState, type FormEvent} from "react";
import {SAMPLE_VENDORS, type EventRecord, type VendorRecord} from "../EventData.ts";
import {
    fetchAiVendorRecommendations,
    negotiateVendorPrice,
    type VendorRecommendationResponse,
    type VendorBundle,
    type NegotiationResult
} from "../../../../api/aiService.ts";
import {
    convertRecommendationsToInr,
    convertNegotiationToInr,
    formatInr,
    inrToUsd,
    INR_PER_USD
} from "../currency.ts";
import styles from "../../../../styles/event-organizer/create-event.module.css";

interface CreateEventProps {
    isDark: boolean;
    onCreate: (event: EventRecord) => void;
}

interface EventFormValues {
    eventType: string;
    eventName: string;
    clientBudget: string;
    guestCount: string;
    startDate: string;
    endDate: string;
}

type CreateStage = "details" | "vendors" | "approval";

const initialValues: EventFormValues = {
    eventType: "",
    eventName: "",
    clientBudget: "",
    guestCount: "",
    startDate: "",
    endDate: "",
};

const stages: {id: CreateStage; label: string}[] = [
    {id: "details", label: "Event details"},
    {id: "vendors", label: "Select vendors"},
    {id: "approval", label: "Final approval"},
];

function formatDate(value: string) {
    return new Intl.DateTimeFormat(undefined, {dateStyle: "medium"})
        .format(new Date(`${value}T12:00:00`));
}

function formatCurrency(amount: number) {
    return formatInr(amount);
}

export default function CreateEvent({isDark, onCreate}: CreateEventProps) {
    const [values, setValues] = useState(initialValues);
    const startDateInput = useRef<HTMLInputElement>(null);
    const endDateInput = useRef<HTMLInputElement>(null);
    const [stage, setStage] = useState<CreateStage>("details");
    const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
    const [offerPrices, setOfferPrices] = useState<Record<string, string>>({});
    const [vendorError, setVendorError] = useState("");

    // AI Recommender & Negotiation state
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<VendorRecommendationResponse | null>(null);
    const [activeBundleKey, setActiveBundleKey] = useState<"recommended" | "budget_saver" | "premium" | null>(null);
    const [aiVendorsPool, setAiVendorsPool] = useState<VendorRecord[]>(SAMPLE_VENDORS);
    const [negotiatingVendorId, setNegotiatingVendorId] = useState<string | null>(null);
    const [negotiatingAll, setNegotiatingAll] = useState(false);
    const [negotiationResults, setNegotiationResults] = useState<Record<string, NegotiationResult>>({});
    const [expandedPitchVendorId, setExpandedPitchVendorId] = useState<string | null>(null);

    const updateField = (field: keyof EventFormValues, value: string) => {
        setValues((current) => ({...current, [field]: value}));
    };

    const openDatePicker = (input: HTMLInputElement | null) => {
        if (!input) return;
        const dateInput = input as HTMLInputElement & {showPicker?: () => void};
        if (dateInput.showPicker) {
            dateInput.showPicker();
            return;
        }
        input.focus();
        input.click();
    };

    const handleDetailsSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();
        const budget = Number(values.clientBudget);
        const guests = Number(values.guestCount);

        if (!Number.isFinite(budget) || budget <= 0) {
            setVendorError("Enter a valid positive budget.");
            return;
        }

        const minBudgetRequired = Math.max(10000, guests * 150);
        if (budget < minBudgetRequired) {
            setVendorError(
                `You cannot organise an event: Budget of ${formatInr(budget)} is not enough for ${guests} guests. Minimum required budget is at least ${formatInr(minBudgetRequired)}.`
            );
            return;
        }

        setVendorError("");
        setStage("vendors");
    };

    const handleFetchAiRecommendations = async () => {
        setAiLoading(true);
        setVendorError("");
        try {
            const response = await fetchAiVendorRecommendations(
                values.eventType || "Wedding",
                (Number(values.clientBudget) || 10000 * INR_PER_USD) / INR_PER_USD,
                Number(values.guestCount) || 50
            );
            const data = convertRecommendationsToInr(response);
            setAiResponse(data);

            // Map AI recommended vendors to VendorRecord format
            const allVendorsMap = new Map<string, VendorRecord>();
            // Add existing sample vendors
            SAMPLE_VENDORS.forEach((v) => allVendorsMap.set(v.id, v));

            // Add all AI vendors from all 3 bundles
            (["recommended", "budget_saver", "premium"] as const).forEach((bKey) => {
                data.bundles[bKey]?.vendors.forEach((v) => {
                    allVendorsMap.set(v.vendor_id, {
                        id: v.vendor_id,
                        name: v.vendor_name,
                        category: v.category,
                        service: `${v.tier} tier · ${v.rating} ⭐ (${v.reviews} reviews)`,
                        estimatedCost: v.estimated_cost,
                        rating: v.rating,
                        tier: v.tier
                    });
                });
            });

            const mergedPool = Array.from(allVendorsMap.values());
            setAiVendorsPool(mergedPool);

            // Automatically select the 'recommended' bundle by default
            selectBundle("recommended", data.bundles.recommended);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to connect to AI Backend.";
            setVendorError(`AI Backend notice: ${msg} (Check if FastAPI server is running on port 8000)`);
        } finally {
            setAiLoading(false);
        }
    };

    const selectBundle = (key: "recommended" | "budget_saver" | "premium", bundle: VendorBundle) => {
        setActiveBundleKey(key);
        const ids = bundle.vendors.map((v) => v.vendor_id);
        setSelectedVendorIds(ids);
        setOfferPrices((current) => {
            const next = { ...current };
            bundle.vendors.forEach((v) => {
                next[v.vendor_id] = String(v.estimated_cost);
            });
            return next;
        });
        setVendorError("");
    };

    const handleNegotiateVendor = async (vendor: VendorRecord) => {
        setNegotiatingVendorId(vendor.id);
        setVendorError("");
        try {
            const guestCount = Number(values.guestCount) || 50;
            const currentOfferInr = Number(offerPrices[vendor.id] ?? vendor.estimatedCost ?? 0);
            const targetBudgetUsd = currentOfferInr > 0 ? inrToUsd(currentOfferInr) : undefined;

            const vendorData = vendor.estimatedCost ? {
                id: vendor.id,
                name: vendor.name,
                category: vendor.category,
                tier: vendor.tier || "Moderate",
                base_fee: inrToUsd(vendor.estimatedCost * 0.4),
                per_person_rate: inrToUsd(vendor.estimatedCost * 0.6) / guestCount,
                estimated_cost: inrToUsd(vendor.estimatedCost)
            } : undefined;

            const rawResult = await negotiateVendorPrice(
                vendor.id,
                guestCount,
                targetBudgetUsd,
                true,
                true,
                vendorData
            );

            const inrResult = convertNegotiationToInr(rawResult);
            setNegotiationResults((prev) => ({ ...prev, [vendor.id]: inrResult }));
            setOfferPrices((prev) => ({ ...prev, [vendor.id]: String(inrResult.negotiated_price) }));
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Negotiation failed.";
            setVendorError(`Negotiation notice for ${vendor.name}: ${msg}`);
        } finally {
            setNegotiatingVendorId(null);
        }
    };

    const handleNegotiateAll = async () => {
        if (selectedVendors.length === 0) return;
        setNegotiatingAll(true);
        setVendorError("");
        try {
            const guestCount = Number(values.guestCount) || 50;
            const promises = selectedVendors.map(async (vendor) => {
                const currentOfferInr = Number(offerPrices[vendor.id] ?? vendor.estimatedCost ?? 0);
                const targetBudgetUsd = currentOfferInr > 0 ? inrToUsd(currentOfferInr) : undefined;
                const vendorData = vendor.estimatedCost ? {
                    id: vendor.id,
                    name: vendor.name,
                    category: vendor.category,
                    tier: vendor.tier || "Moderate",
                    base_fee: inrToUsd(vendor.estimatedCost * 0.4),
                    per_person_rate: inrToUsd(vendor.estimatedCost * 0.6) / guestCount,
                    estimated_cost: inrToUsd(vendor.estimatedCost)
                } : undefined;

                const rawResult = await negotiateVendorPrice(
                    vendor.id,
                    guestCount,
                    targetBudgetUsd,
                    true,
                    true,
                    vendorData
                );
                return { vendorId: vendor.id, inrResult: convertNegotiationToInr(rawResult) };
            });

            const results = await Promise.all(promises);
            const newNegotiations: Record<string, NegotiationResult> = {};
            const newOffers: Record<string, string> = { ...offerPrices };

            results.forEach(({ vendorId, inrResult }) => {
                newNegotiations[vendorId] = inrResult;
                newOffers[vendorId] = String(inrResult.negotiated_price);
            });

            setNegotiationResults((prev) => ({ ...prev, ...newNegotiations }));
            setOfferPrices(newOffers);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Bundle negotiation failed.";
            setVendorError(`AI Negotiation notice: ${msg}`);
        } finally {
            setNegotiatingAll(false);
        }
    };

    const toggleVendor = (vendorId: string) => {
        setVendorError("");
        setActiveBundleKey(null); // Deselect bundle preset if manually toggled
        setSelectedVendorIds((current) => current.includes(vendorId)
            ? current.filter((id) => id !== vendorId)
            : [...current, vendorId]);
    };

    const updateOfferPrice = (vendorId: string, value: string) => {
        setVendorError("");
        setOfferPrices((current) => ({...current, [vendorId]: value}));
    };

    const selectedVendors = aiVendorsPool.filter((vendor) => selectedVendorIds.includes(vendor.id));
    const listedTotal = selectedVendors.reduce((sum, vendor) => sum + (vendor.estimatedCost || 0), 0);
    const totalOfferCost = selectedVendors.reduce((sum, vendor) => {
        const offer = offerPrices[vendor.id];
        const amount = offer === undefined || offer === "" ? vendor.estimatedCost || 0 : Number(offer);
        return sum + (Number.isFinite(amount) ? amount : vendor.estimatedCost || 0);
    }, 0);
    const totalSavings = listedTotal - totalOfferCost;
    const isOverBudget = totalOfferCost > Number(values.clientBudget);
    const budgetDeficit = isOverBudget ? totalOfferCost - Number(values.clientBudget) : 0;

    const continueToApproval = () => {
        if (selectedVendorIds.length === 0) {
            setVendorError("Select at least one vendor to continue.");
            return;
        }
        const hasInvalidOffer = selectedVendors.some((vendor) => {
            const rawOffer = offerPrices[vendor.id];
            const offer = rawOffer === undefined ? vendor.estimatedCost : Number(rawOffer);
            return rawOffer?.trim() === "" || offer === undefined || !Number.isFinite(offer) || offer < 0;
        });
        if (hasInvalidOffer) {
            setVendorError("Enter a valid offer amount for every selected vendor.");
            return;
        }

        const budgetNum = Number(values.clientBudget);
        if (totalOfferCost > budgetNum) {
            const deficit = totalOfferCost - budgetNum;
            setVendorError(
                `You cannot organise an event: Total vendor offer (${formatCurrency(totalOfferCost)}) exceeds your client budget (${formatCurrency(budgetNum)}) by ${formatCurrency(deficit)}. Please reduce offers, deselect vendors, or negotiate discounts with AI.`
            );
            return;
        }

        setVendorError("");
        setStage("approval");
    };

    const approveEvent = () => {
        const budgetNum = Number(values.clientBudget);
        if (totalOfferCost > budgetNum) {
            const deficit = totalOfferCost - budgetNum;
            setVendorError(
                `You cannot organise an event: Total vendor cost (${formatCurrency(totalOfferCost)}) exceeds your client budget (${formatCurrency(budgetNum)}) by ${formatCurrency(deficit)}.`
            );
            return;
        }

        onCreate({
            id: `${Date.now()}`,
            eventType: values.eventType,
            eventName: values.eventName.trim(),
            clientBudget: Number(values.clientBudget),
            guestCount: Number(values.guestCount),
            startDate: values.startDate,
            endDate: values.endDate,
            vendors: selectedVendors.map((vendor) => ({
                ...vendor,
                negotiatedCost: Number(offerPrices[vendor.id] ?? vendor.estimatedCost ?? 0),
            })),
        });
    };

    const activeTitle = stage === "details"
        ? "Create Event"
        : stage === "vendors" ? "Select Vendors" : "Final Approval";

    return (
        <div className={isDark ? styles.container : styles.containerLight}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{activeTitle}</h1>
                    <p className={styles.description}>
                        {stage === "details" && "Add the essential details for your event."}
                        {stage === "vendors" && "Choose vendors or use AI to generate an optimal package within budget."}
                        {stage === "approval" && "Review the event and vendor details before adding it."}
                    </p>
                </header>

                <ol className={styles.steps} aria-label="Create event progress">
                    {stages.map((item, index) => {
                        const activeIndex = stages.findIndex((step) => step.id === stage);
                        const stepClass = index === activeIndex
                            ? styles.currentStep
                            : index < activeIndex ? styles.completedStep : styles.pendingStep;
                        return (
                            <li
                                className={`${styles.step} ${stepClass}`}
                                aria-current={item.id === stage ? "step" : undefined}
                                key={item.id}
                            >
                                <span className={styles.stepNumber}>{index + 1}</span>
                                <span>{item.label}</span>
                            </li>
                        );
                    })}
                </ol>

                {stage === "details" && (
                    <form className={styles.form} onSubmit={handleDetailsSubmit}>
                        <div className={styles.fields}>
                            <label className={styles.field}>
                                <span>Event Type</span>
                                <select
                                    required
                                    value={values.eventType}
                                    onChange={(event) => updateField("eventType", event.target.value)}
                                >
                                    <option value="" disabled>Select an event type</option>
                                    <option value="Wedding">Wedding</option>
                                    <option value="Birthday">Birthday</option>
                                    <option value="Corporate">Corporate</option>
                                    <option value="Conference">Conference</option>
                                    <option value="Festival">Festival</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>Event Name</span>
                                <input
                                    type="text"
                                    required
                                    maxLength={120}
                                    placeholder="e.g. Annual Company Gala"
                                    value={values.eventName}
                                    onChange={(event) => updateField("eventName", event.target.value)}
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Client Budget (₹)</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter budget in INR"
                                    value={values.clientBudget}
                                    onChange={(event) => updateField("clientBudget", event.target.value)}
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Guest Count</span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="1"
                                    placeholder="Enter number of guests"
                                    value={values.guestCount}
                                    onChange={(event) => updateField("guestCount", event.target.value)}
                                />
                            </label>

                            <div className={styles.field}>
                                <label htmlFor="event-start-date">Start Date</label>
                                <div className={styles.dateInputWrap}>
                                    <input
                                        ref={startDateInput}
                                        id="event-start-date"
                                        type="date"
                                        required
                                        value={values.startDate}
                                        onChange={(event) => {
                                            updateField("startDate", event.target.value);
                                            if (values.endDate && event.target.value > values.endDate) {
                                                updateField("endDate", "");
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className={styles.datePickerButton}
                                        aria-label="Open start date calendar"
                                        onClick={() => openDatePicker(startDateInput.current)}
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <rect x="3.5" y="5" width="17" height="16" rx="2" />
                                            <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 17h.01M12 17h.01" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="event-end-date">End Date</label>
                                <div className={styles.dateInputWrap}>
                                    <input
                                        ref={endDateInput}
                                        id="event-end-date"
                                        type="date"
                                        required
                                        min={values.startDate || undefined}
                                        value={values.endDate}
                                        onChange={(event) => updateField("endDate", event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className={styles.datePickerButton}
                                        aria-label="Open end date calendar"
                                        onClick={() => openDatePicker(endDateInput.current)}
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <rect x="3.5" y="5" width="17" height="16" rx="2" />
                                            <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 17h.01M12 17h.01" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {vendorError && <p className={styles.formError} role="alert">{vendorError}</p>}
                        <div className={styles.actions}>
                            <button type="submit" className={styles.submitButton}>Continue to Vendors</button>
                        </div>
                    </form>
                )}

                {stage === "vendors" && (
                    <section className={styles.form} aria-labelledby="vendor-selection-heading">
                        <div className={styles.eventSnapshot}>
                            <span>{values.eventType}</span>
                            <strong>{values.eventName}</strong>
                            <small>
                                {formatDate(values.startDate)} – {formatDate(values.endDate)} · {values.guestCount} guests · Budget: {formatInr(Number(values.clientBudget))}
                            </small>
                        </div>

                        {/* AI Recommendation Banner */}
                        <div className={styles.aiBanner}>
                            <div className={styles.aiHeader}>
                                <div className={styles.aiHeaderTitle}>
                                    <span>🤖</span>
                                    <span>AI Vendor Match &amp; Optimization</span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.aiButton}
                                    onClick={handleFetchAiRecommendations}
                                    disabled={aiLoading}
                                >
                                    {aiLoading ? "Optimizing Packages..." : "✨ Generate AI Recommendation"}
                                </button>
                            </div>

                            {aiResponse && (
                                <>
                                    {(!aiResponse.is_budget_sufficient || aiResponse.bundles.budget_saver.total_cost > Number(values.clientBudget)) && (
                                        <div className={styles.insufficientBudgetAlert} role="alert">
                                            <div className={styles.insufficientBudgetAlertHeader}>
                                                <span className={styles.alertIcon} aria-hidden="true">🚫</span>
                                                <div className={styles.overBudgetText}>
                                                    <strong>You cannot organise an event with this budget</strong>
                                                    <p>
                                                        Even the most economical Budget Saver package requires at least{" "}
                                                        <strong>{formatInr(aiResponse.bundles.budget_saver.total_cost)}</strong> for {values.guestCount} guests,
                                                        which exceeds your client budget of <strong>{formatInr(Number(values.clientBudget))}</strong> by{" "}
                                                        <span className={styles.deficitAmount}>{formatInr(aiResponse.bundles.budget_saver.total_cost - Number(values.clientBudget))}</span>.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={styles.alertTips}>
                                                <span>💡 Suggestions to make your event feasible:</span>
                                                <ul>
                                                    <li>Increase your client budget to at least {formatInr(aiResponse.bundles.budget_saver.total_cost)}.</li>
                                                    <li>Reduce the number of attendees (currently {values.guestCount} guests).</li>
                                                    <li>Use <strong>⚡ AI Negotiate</strong> on individual vendors below to reduce package costs.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                    <div className={styles.aiBundles}>
                                        {(["recommended", "budget_saver", "premium"] as const).map((bKey) => {
                                            const b = aiResponse.bundles[bKey];
                                            if (!b) return null;
                                            const isActive = activeBundleKey === bKey;
                                            return (
                                                <button
                                                    type="button"
                                                    key={bKey}
                                                    className={`${styles.aiBundleCard} ${isActive ? styles.aiBundleActive : ""}`}
                                                    onClick={() => selectBundle(bKey, b)}
                                                >
                                                    <span className={styles.aiBundleName}>
                                                        {bKey === "recommended" && "🌟 AI Balanced"}
                                                        {bKey === "budget_saver" && "💰 Budget Saver"}
                                                        {bKey === "premium" && "👑 Premium Experience"}
                                                    </span>
                                                    <span className={styles.aiBundleCost}>
                                                        {formatInr(b.total_cost)}
                                                    </span>
                                                    <span className={styles.aiBundleMeta}>
                                                        {b.remaining_budget >= 0 ? `Savings: ${formatInr(b.remaining_budget)}` : `Over: ${formatInr(Math.abs(b.remaining_budget))}`} · {b.average_rating} ⭐
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.vendorHeading}>
                            <div>
                                <h2 id="vendor-selection-heading">Vendor Directory</h2>
                                <p>Prices are estimates. Select vendors and enter an offer for each one, or choose an AI package above.</p>
                            </div>
                            <div className={styles.vendorHeadingActions}>
                                {selectedVendors.length > 0 && (
                                    <button
                                        type="button"
                                        className={styles.negotiateAllBtn}
                                        onClick={handleNegotiateAll}
                                        disabled={negotiatingAll || Boolean(negotiatingVendorId)}
                                        title="Run automated AI negotiation across all selected vendors"
                                    >
                                        {negotiatingAll ? "Negotiating All Vendors..." : "⚡ AI Negotiate All Selected"}
                                    </button>
                                )}
                                <span className={styles.selectionCount}>{selectedVendors.length} selected</span>
                            </div>
                        </div>

                        <div className={styles.priceSummary} aria-live="polite">
                            <div className={styles.priceStat}>
                                <span>Estimated price list</span>
                                <strong>{formatCurrency(listedTotal)}</strong>
                            </div>
                            <div className={styles.priceStat}>
                                <span>Your offer total</span>
                                <strong>{formatCurrency(totalOfferCost)}</strong>
                            </div>
                            <div className={styles.priceStat}>
                                <span>{totalSavings >= 0 ? "Potential savings" : "Above list price"}</span>
                                <strong className={totalSavings >= 0 ? styles.savingsValue : styles.overPriceValue}>
                                    {formatCurrency(Math.abs(totalSavings))}
                                </strong>
                            </div>
                            <div className={styles.priceStat}>
                                <span>Budget remaining</span>
                                <strong className={totalOfferCost <= Number(values.clientBudget) ? styles.savingsValue : styles.overPriceValue}>
                                    {formatCurrency(Number(values.clientBudget) - totalOfferCost)}
                                </strong>
                            </div>
                        </div>

                        {isOverBudget && (
                            <div className={styles.overBudgetAlertBanner} role="alert">
                                <span className={styles.overBudgetIcon} aria-hidden="true">⚠️</span>
                                <div className={styles.overBudgetText}>
                                    <strong>You cannot organise an event: Vendor offers exceed client budget</strong>
                                    <p>
                                        Your selected vendor offers total <strong>{formatCurrency(totalOfferCost)}</strong>, which exceeds your client budget of <strong>{formatCurrency(Number(values.clientBudget))}</strong> by <span className={styles.deficitAmount}>{formatCurrency(budgetDeficit)}</span>.
                                        You cannot proceed to approval until your total offers are within budget. Try using <strong>⚡ AI Negotiate</strong> on individual vendors or deselecting optional items.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className={styles.vendorList}>
                            {aiVendorsPool.map((vendor) => {
                                const checked = selectedVendorIds.includes(vendor.id);
                                const isNegotiatingThis = negotiatingVendorId === vendor.id;
                                const negResult = negotiationResults[vendor.id];
                                const isPitchExpanded = expandedPitchVendorId === vendor.id;

                                return (
                                    <div className={`${styles.vendorCard} ${checked ? styles.selectedVendor : ""}`} key={vendor.id}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${vendor.name}`}
                                            checked={checked}
                                            onChange={() => toggleVendor(vendor.id)}
                                        />
                                        <div className={styles.vendorInfo}>
                                            <strong>{vendor.name}</strong>
                                            <span className={styles.vendorCategory}>{vendor.category}</span>
                                            <span className={styles.vendorService}>{vendor.service}</span>
                                            {vendor.estimatedCost !== undefined && (
                                                <span className={styles.vendorCostTag}>Estimated list price: {formatCurrency(vendor.estimatedCost)}</span>
                                            )}
                                            {checked && vendor.estimatedCost !== undefined && (
                                                <div className={styles.vendorOfferSection}>
                                                    <div className={styles.offerControlsRow}>
                                                        <label className={styles.offerField}>
                                                            <span>Your negotiated offer</span>
                                                            <span className={styles.offerInputWrap}>
                                                                <span aria-hidden="true">₹</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    required
                                                                    aria-label={`Negotiated offer for ${vendor.name}`}
                                                                    value={offerPrices[vendor.id] ?? String(vendor.estimatedCost)}
                                                                    onChange={(event) => updateOfferPrice(vendor.id, event.target.value)}
                                                                />
                                                            </span>
                                                        </label>
                                                        <button
                                                            type="button"
                                                            className={styles.negotiateButton}
                                                            onClick={() => handleNegotiateVendor(vendor)}
                                                            disabled={isNegotiatingThis || negotiatingAll}
                                                            title="Use AI agent to negotiate discount with this vendor"
                                                        >
                                                            {isNegotiatingThis ? "🤖 Negotiating..." : "⚡ AI Negotiate"}
                                                        </button>
                                                    </div>

                                                    {negResult && (
                                                        <div className={styles.negotiationCard}>
                                                            <div className={styles.negotiationHeader}>
                                                                <span className={styles.negotiationSavingsBadge}>
                                                                    🎉 AI Saved {formatInr(negResult.total_savings)} ({negResult.discount_percentage}% off)
                                                                </span>
                                                                <span className={styles.negotiationStatusBadge}>
                                                                    {negResult.agreement_reached
                                                                        ? `✓ Agreed in ${negResult.rounds?.length || 1} rounds`
                                                                        : `Conceded to floor price`}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    className={styles.pitchToggleBtn}
                                                                    onClick={() => setExpandedPitchVendorId(isPitchExpanded ? null : vendor.id)}
                                                                >
                                                                    {isPitchExpanded ? "Hide Strategy ▲" : "View Pitch & Rounds ▼"}
                                                                </button>
                                                            </div>

                                                            {isPitchExpanded && (
                                                                <div className={styles.pitchExpandedDetails}>
                                                                    {negResult.leverage_points && negResult.leverage_points.length > 0 && (
                                                                        <div className={styles.leveragePoints}>
                                                                            <strong>Applied Strategic Leverage:</strong>
                                                                            <ul>
                                                                                {negResult.leverage_points.map((pt, idx) => (
                                                                                    <li key={idx}>{pt}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}

                                                                    {negResult.rounds && negResult.rounds.length > 0 && (
                                                                        <div className={styles.concessionHistory}>
                                                                            <strong>Bargaining Trajectory:</strong>
                                                                            <div className={styles.roundsChips}>
                                                                                {negResult.rounds.map((rnd) => (
                                                                                    <span key={rnd.round} className={styles.roundChip}>
                                                                                        R{rnd.round}: Offer {formatInr(rnd.buyer_offer)} ➔ Counter {formatInr(rnd.vendor_counter)} ({rnd.status})
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {negResult.negotiation_pitch && (
                                                                        <div className={styles.draftedPitch}>
                                                                            <strong>Drafted Pitch to Vendor:</strong>
                                                                            <pre className={styles.pitchText}>
                                                                                {negResult.negotiation_pitch}
                                                                            </pre>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {vendorError && <p className={styles.formError} role="alert">{vendorError}</p>}

                        <div className={styles.actions}>
                            <button type="button" className={styles.secondaryButton} onClick={() => setStage("details")}>
                                Back to Details
                            </button>
                            <button
                                type="button"
                                className={`${styles.submitButton} ${isOverBudget ? styles.disabledOverBudgetBtn : ""}`}
                                onClick={continueToApproval}
                                disabled={isOverBudget}
                                title={isOverBudget ? "You cannot organise an event: Total vendor offers exceed client budget" : undefined}
                            >
                                Continue to Approval
                            </button>
                        </div>
                    </section>
                )}

                {stage === "approval" && (
                    <section className={styles.form} aria-labelledby="approval-heading">
                        <h2 id="approval-heading" className={styles.reviewTitle}>Event Summary</h2>
                        <dl className={styles.reviewDetails}>
                            <div><dt>Event Type</dt><dd>{values.eventType}</dd></div>
                            <div><dt>Event Name</dt><dd>{values.eventName}</dd></div>
                            <div><dt>Client Budget</dt><dd>{formatInr(Number(values.clientBudget))}</dd></div>
                            <div><dt>Guest Count</dt><dd>{Number(values.guestCount).toLocaleString()} guests</dd></div>
                            <div><dt>Start Date</dt><dd>{formatDate(values.startDate)}</dd></div>
                            <div><dt>End Date</dt><dd>{formatDate(values.endDate)}</dd></div>
                        </dl>

                        <h3 className={styles.reviewVendorsTitle}>Price Negotiation Summary</h3>
                        <div className={styles.reviewPriceSummary}>
                            <span>Estimated list total <strong>{formatCurrency(listedTotal)}</strong></span>
                            <span>Offered total <strong>{formatCurrency(totalOfferCost)}</strong></span>
                            <span>{totalSavings >= 0 ? "Potential savings" : "Above list price"} <strong>{formatCurrency(Math.abs(totalSavings))}</strong></span>
                            <span>Budget remaining <strong>{formatCurrency(Number(values.clientBudget) - totalOfferCost)}</strong></span>
                        </div>
                        <h3 className={styles.reviewVendorsTitle}>Selected Vendors ({selectedVendors.length})</h3>
                        <ul className={styles.reviewVendors}>
                            {selectedVendors.map((vendor) => (
                                <li key={vendor.id}>
                                    <strong>{vendor.name}</strong>
                                    <span>
                                        {vendor.category} · {vendor.service}
                                    </span>
                                    <div className={styles.reviewVendorPrices}>
                                        <span>List {formatCurrency(vendor.estimatedCost || 0)}</span>
                                        <span>Offer {formatCurrency(Number(offerPrices[vendor.id] ?? vendor.estimatedCost ?? 0))}</span>
                                    </div>
                                    {negotiationResults[vendor.id] && (
                                        <div className={styles.reviewNegotiationBadge}>
                                            ⚡ AI Saved {formatInr(negotiationResults[vendor.id].total_savings)} ({negotiationResults[vendor.id].discount_percentage}% off)
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {isOverBudget && (
                            <div className={styles.overBudgetAlertBanner} role="alert">
                                <span className={styles.overBudgetIcon} aria-hidden="true">🚫</span>
                                <div className={styles.overBudgetText}>
                                    <strong>You cannot organise an event: Offers exceed client budget</strong>
                                    <p>
                                        Total vendor offers ({formatCurrency(totalOfferCost)}) exceed your client budget of {formatCurrency(Number(values.clientBudget))} by {formatCurrency(budgetDeficit)}.
                                        Please return to the vendor directory to adjust offers or negotiate with AI.
                                    </p>
                                </div>
                            </div>
                        )}

                        <p className={styles.approvalNote}>
                            Approving adds this event, selected vendors, and their offers to your Events list.
                        </p>

                        <div className={styles.actions}>
                            <button type="button" className={styles.secondaryButton} onClick={() => setStage("vendors")}>
                                Back to Vendors
                            </button>
                            <button
                                type="button"
                                className={`${styles.submitButton} ${isOverBudget ? styles.disabledOverBudgetBtn : ""}`}
                                onClick={approveEvent}
                                disabled={isOverBudget}
                                title={isOverBudget ? "You cannot organise an event: Total vendor offers exceed client budget" : undefined}
                            >
                                Approve &amp; Add Event
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
