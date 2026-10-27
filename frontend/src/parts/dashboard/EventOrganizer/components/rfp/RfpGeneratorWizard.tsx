import { useState, type FormEvent } from "react";
import type { EventRecord } from "../../EventData.ts";
import type {
    RfpCategory,
    RfpPriority,
    RfpTone,
    PricingStructure,
    DeliverableItem,
    TargetVendor,
    RfpRecord,
} from "./rfpTypes.ts";
import { CATEGORY_TEMPLATES } from "./rfpTemplates.ts";
import { generateRfpDocument } from "../../../../../api/rfpService.ts";
import styles from "../../../../../styles/event-organizer/documents.module.css";

interface RfpGeneratorWizardProps {
    isDark: boolean;
    events: EventRecord[];
    onGenerated: (rfp: RfpRecord) => void;
    onCancel: () => void;
    initialCategory?: RfpCategory;
}

const CATEGORIES: RfpCategory[] = [
    "Catering",
    "Audio / Visual & Lighting",
    "Venue",
    "Photography & Videography",
    "Decor & Floral",
    "Entertainment / DJ",
    "Staffing & Security",
    "Logistics & Transport",
    "Other Services",
];

const TONES: { id: RfpTone; label: string; desc: string }[] = [
    { id: "formal", label: "Formal Corporate", desc: "Rigorous legal terms & structured criteria" },
    { id: "executive", label: "Executive Strategic", desc: "High-level partnership & operational excellence" },
    { id: "concise", label: "Fast-Track", desc: "Expedited bidding with bulleted specs" },
    { id: "creative", label: "Creative & Luxury", desc: "Craftsmanship & VIP guest experience" },
];

const PRICING_MODELS: { id: PricingStructure; label: string }[] = [
    { id: "fixed_lump_sum", label: "Fixed Lump-Sum Contract" },
    { id: "per_person", label: "Per-Person / Per-Cover Rate" },
    { id: "itemized", label: "Itemized Unit Rates" },
    { id: "milestone_capped", label: "Milestone-Capped Not-to-Exceed" },
];

function dateOffset(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
}

export default function RfpGeneratorWizard({
    isDark,
    events,
    onGenerated,
    onCancel,
    initialCategory = "Catering",
}: RfpGeneratorWizardProps) {
    const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "custom");
    const [category, setCategory] = useState<RfpCategory>(initialCategory);
    const [priority, setPriority] = useState<RfpPriority>("standard");
    const [tone, setTone] = useState<RfpTone>("formal");

    // Event & Organizer details
    const selectedEvent = events.find((e) => e.id === selectedEventId);
    const [eventName, setEventName] = useState<string>(selectedEvent?.eventName || "Annual Excellence Gala");
    const [eventType, setEventType] = useState<string>(selectedEvent?.eventType || "Conference");
    const [guestCount, setGuestCount] = useState<number>(selectedEvent?.guestCount || 200);
    const [venueLocation, setVenueLocation] = useState<string>("Grand Convention Center, Main Hall");
    const [organizerName, setOrganizerName] = useState<string>("EventMind Procurement Committee");
    const [organizerEmail, setOrganizerEmail] = useState<string>("procurement@eventmind.ai");
    const [organizerPhone, setOrganizerPhone] = useState<string>("+91 98765 43210");

    // Timeline
    const [issueDate, setIssueDate] = useState<string>(dateOffset(0));
    const [questionsDeadline, setQuestionsDeadline] = useState<string>(dateOffset(7));
    const [submissionDeadline, setSubmissionDeadline] = useState<string>(dateOffset(14));
    const [evaluationDate, setEvaluationDate] = useState<string>(dateOffset(17));
    const [awardDate, setAwardDate] = useState<string>(dateOffset(20));
    const [serviceStartDate, setServiceStartDate] = useState<string>(selectedEvent?.startDate || dateOffset(30));
    const [serviceEndDate, setServiceEndDate] = useState<string>(selectedEvent?.endDate || dateOffset(31));

    // Commercials
    const defaultTemplate = CATEGORY_TEMPLATES[initialCategory];
    const estimatedCategoryBudget = selectedEvent ? Math.round(selectedEvent.clientBudget * 0.28) : 150000;
    const [targetBudget, setTargetBudget] = useState<number>(estimatedCategoryBudget);
    const [budgetCeiling, setBudgetCeiling] = useState<number>(Math.round(estimatedCategoryBudget * 1.15));
    const [pricingStructure, setPricingStructure] = useState<PricingStructure>("fixed_lump_sum");
    const [paymentTerms, setPaymentTerms] = useState<string>(defaultTemplate.paymentTerms);
    const [penaltyClause, setPenaltyClause] = useState<string>(
        "1% deduction per hour of unauthorized delay, capped at 10% of total contract value."
    );

    // Scope & Deliverables
    const [scopeOfWork, setScopeOfWork] = useState<string>(defaultTemplate.scopeOfWork);
    const [deliverables, setDeliverables] = useState<DeliverableItem[]>(
        defaultTemplate.deliverables.map((d, idx) => ({
            id: `del-${idx + 1}`,
            ...d,
        }))
    );
    const [newDelTitle, setNewDelTitle] = useState("");
    const [newDelDesc, setNewDelDesc] = useState("");

    // Compliance
    const [compliance, setCompliance] = useState({ ...defaultTemplate.compliance });

    // Evaluation Weights
    const [weights, setWeights] = useState({ ...defaultTemplate.suggestedWeights });

    // Target Vendors
    const [targetVendors, setTargetVendors] = useState<TargetVendor[]>([]);
    const [vendorInput, setVendorInput] = useState("");

    // Special notes
    const [specialTerms, setSpecialTerms] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const totalWeight = weights.cost + weights.qualityExperience + weights.deliverableFit + weights.complianceReliability;

    // Handle changing the event dropdown
    const handleEventChange = (evId: string) => {
        setSelectedEventId(evId);
        if (evId === "custom") {
            setEventName("Corporate Annual Gathering");
            setEventType("Corporate");
            setGuestCount(150);
            return;
        }
        const ev = events.find((e) => e.id === evId);
        if (ev) {
            setEventName(ev.eventName);
            setEventType(ev.eventType);
            setGuestCount(ev.guestCount);
            setServiceStartDate(ev.startDate);
            setServiceEndDate(ev.endDate);
            // compute proportional category budget
            const approxBudget = Math.round(ev.clientBudget * 0.25);
            setTargetBudget(approxBudget);
            setBudgetCeiling(Math.round(approxBudget * 1.15));

            // Populate any matching vendors from the event
            if (ev.vendors && ev.vendors.length > 0) {
                const matched = ev.vendors
                    .filter((v) => v.category.toLowerCase().includes(category.toLowerCase().slice(0, 4)))
                    .map((v) => ({
                        vendorId: v.id,
                        vendorName: v.name,
                        category: v.category,
                        tier: v.tier || "Moderate",
                        rating: v.rating || 4.7,
                    }));
                setTargetVendors(matched);
            }
        }
    };

    // Handle changing the category
    const handleCategoryChange = (cat: RfpCategory) => {
        setCategory(cat);
        const tmpl = CATEGORY_TEMPLATES[cat];
        if (tmpl) {
            setScopeOfWork(tmpl.scopeOfWork);
            setDeliverables(
                tmpl.deliverables.map((d, i) => ({
                    id: `del-${cat.toLowerCase().slice(0, 3)}-${i + 1}`,
                    ...d,
                }))
            );
            setCompliance({ ...tmpl.compliance });
            setPaymentTerms(tmpl.paymentTerms);
            setWeights({ ...tmpl.suggestedWeights });
        }
    };

    const handleAddDeliverable = () => {
        if (!newDelTitle.trim()) return;
        setDeliverables((prev) => [
            ...prev,
            {
                id: `del-custom-${Date.now()}`,
                title: newDelTitle.trim(),
                description: newDelDesc.trim() || "Delivery as per specifications",
                isMandatory: true,
            },
        ]);
        setNewDelTitle("");
        setNewDelDesc("");
    };

    const handleRemoveDeliverable = (id: string) => {
        setDeliverables((prev) => prev.filter((d) => d.id !== id));
    };

    const handleToggleDeliverableMandatory = (id: string) => {
        setDeliverables((prev) =>
            prev.map((d) => (d.id === id ? { ...d, isMandatory: !d.isMandatory } : d))
        );
    };

    const handleAddTargetVendor = () => {
        if (!vendorInput.trim()) return;
        setTargetVendors((prev) => [
            ...prev,
            {
                vendorId: `custom-v-${Date.now()}`,
                vendorName: vendorInput.trim(),
                category: category,
                tier: "Moderate",
                rating: 4.8,
            },
        ]);
        setVendorInput("");
    };

    const handleRemoveTargetVendor = (name: string) => {
        setTargetVendors((prev) => prev.filter((v) => v.vendorName !== name));
    };

    const autoBalanceWeights = () => {
        const sum = totalWeight;
        if (sum === 0) return;
        setWeights({
            cost: Math.round((weights.cost / sum) * 100),
            qualityExperience: Math.round((weights.qualityExperience / sum) * 100),
            deliverableFit: Math.round((weights.deliverableFit / sum) * 100),
            complianceReliability:
                100 -
                Math.round((weights.cost / sum) * 100) -
                Math.round((weights.qualityExperience / sum) * 100) -
                Math.round((weights.deliverableFit / sum) * 100),
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!eventName.trim()) {
            setErrorMsg("Please specify the Event Name.");
            return;
        }
        if (targetBudget <= 0) {
            setErrorMsg("Please enter a valid positive target procurement budget.");
            return;
        }
        if (budgetCeiling < targetBudget) {
            setErrorMsg("Budget ceiling must be greater than or equal to the target budget.");
            return;
        }
        if (deliverables.length === 0) {
            setErrorMsg("Please include at least one deliverable in the Scope of Work.");
            return;
        }
        if (totalWeight !== 100) {
            setErrorMsg(`Evaluation criteria weights must total exactly 100% (currently ${totalWeight}%).`);
            return;
        }

        setLoading(true);
        try {
            const rfp = await generateRfpDocument({
                eventId: selectedEventId === "custom" ? undefined : selectedEventId,
                eventName,
                eventType,
                category,
                guestCount,
                venueLocation,
                organizerName,
                organizerEmail,
                organizerPhone,
                priority,
                tone,
                timeline: {
                    issueDate,
                    questionsDeadline,
                    submissionDeadline,
                    evaluationDate,
                    awardDate,
                    serviceStartDate,
                    serviceEndDate,
                },
                commercials: {
                    targetBudget,
                    budgetCeiling,
                    currency: "INR",
                    pricingStructure,
                    paymentTerms,
                    penaltyClause,
                },
                scopeOfWork,
                deliverables,
                compliance,
                evaluationWeights: weights,
                targetVendors,
                specialTerms,
            });

            onGenerated(rfp);
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to generate RFP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.wizardWrapper}>
            <div className={styles.wizardStepHeader}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>
                            Vendor Procurement RFP Generator
                        </h2>
                        <p style={{ margin: "0.35rem 0 0", color: isDark ? "#9aafa5" : "#718078", fontSize: "0.92rem" }}>
                            Configure specifications, deliverables, budget caps, and evaluation criteria to synthesize an executive Request for Proposal.
                        </p>
                    </div>
                    <button type="button" onClick={onCancel} className={styles.btnOutline}>
                        Cancel
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div style={{
                    padding: "0.85rem 1.25rem",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: "0.65rem",
                    color: "#f87171",
                    fontWeight: 600,
                    marginBottom: "1.5rem"
                }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* SECTION 1: Event & Procurement Baseline */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>1</span>
                    <span>Event Baseline & Procurement Category</span>
                </div>

                <div className={styles.formGrid2} style={{ marginBottom: "1.25rem" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Link to Existing Event
                            <span className={styles.hint}>Auto-populates dates & guest metrics</span>
                        </label>
                        <select
                            className={styles.formSelect}
                            value={selectedEventId}
                            onChange={(e) => handleEventChange(e.target.value)}
                        >
                            <option value="custom">-- Standalone / Unlinked Procurement --</option>
                            {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                    {ev.eventName} ({ev.eventType} • {ev.guestCount} guests)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Procurement Priority</label>
                        <select
                            className={styles.formSelect}
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as RfpPriority)}
                        >
                            <option value="standard">Standard Procurement Window (14-21 Days)</option>
                            <option value="urgent">Urgent / Fast-Track Replacement (&lt; 7 Days)</option>
                            <option value="high_value">High-Value Critical Infrastructure (&gt; ₹5L)</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "1.25rem" }}>
                    <label className={styles.formLabel}>
                        Target Vendor Category
                        <span className={styles.hint}>Selecting a category auto-tunes the SOW and deliverables</span>
                    </label>
                    <div className={styles.chipGrid}>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`${styles.chip} ${category === cat ? styles.chipActive : ""}`}
                                onClick={() => handleCategoryChange(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.formGrid3}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Event Name</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Event Type</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Anticipated Attendees</label>
                        <input
                            type="number"
                            min="1"
                            className={styles.formInput}
                            value={guestCount}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                            required
                        />
                    </div>
                </div>

                <div className={styles.formGrid2} style={{ marginTop: "1rem" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Venue / Location Premises</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            value={venueLocation}
                            onChange={(e) => setVenueLocation(e.target.value)}
                            placeholder="e.g. Grand Ballroom, Bandra Kurla Complex, Mumbai"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Procuring Committee / Contact</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            value={organizerName}
                            onChange={(e) => setOrganizerName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className={styles.formGrid2} style={{ marginTop: "1rem" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Contact Email</label>
                        <input
                            type="email"
                            className={styles.formInput}
                            value={organizerEmail}
                            onChange={(e) => setOrganizerEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Contact Phone</label>
                        <input
                            type="tel"
                            className={styles.formInput}
                            value={organizerPhone}
                            onChange={(e) => setOrganizerPhone(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 2: Scope of Work & Deliverables */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>2</span>
                    <span>Scope of Work & Deliverables Checklist</span>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "1.25rem" }}>
                    <label className={styles.formLabel}>
                        Executive Scope of Work (SOW)
                        <span className={styles.hint}>Clear narrative description of expectations</span>
                    </label>
                    <textarea
                        rows={4}
                        className={styles.formTextarea}
                        value={scopeOfWork}
                        onChange={(e) => setScopeOfWork(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Deliverables & Itemized Specifications ({deliverables.length})
                        <span className={styles.hint}>Toggle mandatory vs optional deliverables</span>
                    </label>

                    <div className={styles.deliverablesBox}>
                        {deliverables.map((del, idx) => (
                            <div key={del.id} className={styles.deliverableRow}>
                                <div style={{ fontWeight: 800, color: "#43c792", minWidth: "1.5rem" }}>
                                    #{idx + 1}
                                </div>
                                <div className={styles.deliverableInputs}>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            style={{ padding: "0.45rem 0.65rem", fontWeight: 700 }}
                                            value={del.title}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setDeliverables((prev) =>
                                                    prev.map((d) => (d.id === del.id ? { ...d, title: val } : d))
                                                );
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={styles.btnOutline}
                                            style={{
                                                fontSize: "0.72rem",
                                                padding: "0.3rem 0.55rem",
                                                background: del.isMandatory ? "rgba(34, 197, 94, 0.15)" : "rgba(154, 175, 165, 0.15)",
                                                color: del.isMandatory ? "#4ade80" : "#9aafa5",
                                                borderColor: del.isMandatory ? "rgba(34, 197, 94, 0.3)" : "rgba(154, 175, 165, 0.3)",
                                            }}
                                            onClick={() => handleToggleDeliverableMandatory(del.id)}
                                        >
                                            {del.isMandatory ? "✓ Mandatory" : "Optional"}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        style={{ padding: "0.4rem 0.65rem", fontSize: "0.82rem" }}
                                        value={del.description}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDeliverables((prev) =>
                                                prev.map((d) => (d.id === del.id ? { ...d, description: val } : d))
                                            );
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={styles.deliverableRemove}
                                    title="Remove deliverable"
                                    onClick={() => handleRemoveDeliverable(del.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        {/* Add new deliverable */}
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                            <input
                                type="text"
                                className={styles.formInput}
                                placeholder="Add deliverable title..."
                                style={{ flex: 1, minWidth: "12rem" }}
                                value={newDelTitle}
                                onChange={(e) => setNewDelTitle(e.target.value)}
                            />
                            <input
                                type="text"
                                className={styles.formInput}
                                placeholder="Deliverable details / specifications..."
                                style={{ flex: 2, minWidth: "16rem" }}
                                value={newDelDesc}
                                onChange={(e) => setNewDelDesc(e.target.value)}
                            />
                            <button type="button" onClick={handleAddDeliverable} className={styles.btnSecondary}>
                                + Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: Commercials & Pricing Parameters */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>3</span>
                    <span>Commercial Framework & Budget Caps</span>
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: "1.25rem" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Target Procurement Budget (₹ INR)</label>
                        <input
                            type="number"
                            min="1000"
                            step="500"
                            className={styles.formInput}
                            value={targetBudget}
                            onChange={(e) => setTargetBudget(Number(e.target.value))}
                            required
                        />
                        <span className={styles.hint}>Expected fair market cost</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Maximum Budget Ceiling (₹ INR)</label>
                        <input
                            type="number"
                            min={targetBudget}
                            step="500"
                            className={styles.formInput}
                            value={budgetCeiling}
                            onChange={(e) => setBudgetCeiling(Number(e.target.value))}
                            required
                        />
                        <span className={styles.hint}>Hard cutoff (bids above will be rejected)</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Pricing Model</label>
                        <select
                            className={styles.formSelect}
                            value={pricingStructure}
                            onChange={(e) => setPricingStructure(e.target.value as PricingStructure)}
                        >
                            {PRICING_MODELS.map((pm) => (
                                <option key={pm.id} value={pm.id}>
                                    {pm.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Standard Payment Milestone Terms</label>
                        <textarea
                            rows={2}
                            className={styles.formTextarea}
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>SLA Delay Penalty Provision</label>
                        <textarea
                            rows={2}
                            className={styles.formTextarea}
                            value={penaltyClause}
                            onChange={(e) => setPenaltyClause(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 4: Procurement Timeline */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>4</span>
                    <span>Procurement Timeline & Key Milestones</span>
                </div>

                <div className={styles.formGrid3}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>RFP Issuance Date</label>
                        <input
                            type="date"
                            className={styles.formInput}
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Questions & Clarifications Cutoff</label>
                        <input
                            type="date"
                            className={styles.formInput}
                            value={questionsDeadline}
                            onChange={(e) => setQuestionsDeadline(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Proposal Submission Deadline</label>
                        <input
                            type="date"
                            className={styles.formInput}
                            value={submissionDeadline}
                            onChange={(e) => setSubmissionDeadline(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Committee Evaluation Date</label>
                        <input
                            type="date"
                            className={styles.formInput}
                            value={evaluationDate}
                            onChange={(e) => setEvaluationDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Final Vendor Award Date</label>
                        <input
                            type="date"
                            className={styles.formInput}
                            value={awardDate}
                            onChange={(e) => setAwardDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Service Execution Date</label>
                        <input
                            type="date"
                            className={styles.formInput}
                            value={serviceStartDate}
                            onChange={(e) => setServiceStartDate(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 5: Mandatory Compliance & Qualifications */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>5</span>
                    <span>Vendor Qualification & Compliance Prerequisites</span>
                </div>

                <div className={styles.checkboxGrid}>
                    <label className={styles.checkboxCard}>
                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={compliance.businessLicense}
                            onChange={(e) => setCompliance((c) => ({ ...c, businessLicense: e.target.checked }))}
                        />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Valid Business License</div>
                            <div className={styles.hint}>Registered business entity verification</div>
                        </div>
                    </label>

                    <label className={styles.checkboxCard}>
                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={compliance.liabilityInsurance}
                            onChange={(e) => setCompliance((c) => ({ ...c, liabilityInsurance: e.target.checked }))}
                        />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>General Liability Insurance</div>
                            <div className={styles.hint}>Commercial policy (minimum ₹50 Lakhs)</div>
                        </div>
                    </label>

                    <label className={styles.checkboxCard}>
                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={compliance.foodSafetyFssai}
                            onChange={(e) => setCompliance((c) => ({ ...c, foodSafetyFssai: e.target.checked }))}
                        />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Food Safety / FSSAI License</div>
                            <div className={styles.hint}>Mandatory for catering and hospitality</div>
                        </div>
                    </label>

                    <label className={styles.checkboxCard}>
                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={compliance.taxComplianceGst}
                            onChange={(e) => setCompliance((c) => ({ ...c, taxComplianceGst: e.target.checked }))}
                        />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>GST Tax Filings Certificate</div>
                            <div className={styles.hint}>Valid tax registration & GSTIN invoice readiness</div>
                        </div>
                    </label>

                    <label className={styles.checkboxCard}>
                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={compliance.ndaRequired}
                            onChange={(e) => setCompliance((c) => ({ ...c, ndaRequired: e.target.checked }))}
                        />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Non-Disclosure Agreement (NDA)</div>
                            <div className={styles.hint}>Confidentiality for corporate/VIP event</div>
                        </div>
                    </label>

                    <div className={styles.checkboxCard} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Minimum Past References</div>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            className={styles.formInput}
                            style={{ padding: "0.3rem 0.6rem", width: "100%", marginTop: "0.35rem" }}
                            value={compliance.pastReferencesMin}
                            onChange={(e) => setCompliance((c) => ({ ...c, pastReferencesMin: Number(e.target.value) }))}
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 6: Weighted Evaluation Scoring Matrix */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>6</span>
                    <span>Evaluation Scoring Weight Matrix (Must Total 100%)</span>
                </div>

                <div className={styles.weightGrid}>
                    <div className={styles.weightCard}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>Commercial / Pricing</span>
                            <span style={{ fontWeight: 800, color: "#43c792" }}>{weights.cost}%</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            className={styles.sliderInput}
                            value={weights.cost}
                            onChange={(e) => setWeights((w) => ({ ...w, cost: Number(e.target.value) }))}
                        />
                        <span className={styles.hint}>Price competitiveness & transparent quotes</span>
                    </div>

                    <div className={styles.weightCard}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>Track Record & Quality</span>
                            <span style={{ fontWeight: 800, color: "#43c792" }}>{weights.qualityExperience}%</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            className={styles.sliderInput}
                            value={weights.qualityExperience}
                            onChange={(e) => setWeights((w) => ({ ...w, qualityExperience: Number(e.target.value) }))}
                        />
                        <span className={styles.hint}>Portfolio depth & client testimonials</span>
                    </div>

                    <div className={styles.weightCard}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>Deliverables & SOW Fit</span>
                            <span style={{ fontWeight: 800, color: "#43c792" }}>{weights.deliverableFit}%</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            className={styles.sliderInput}
                            value={weights.deliverableFit}
                            onChange={(e) => setWeights((w) => ({ ...w, deliverableFit: Number(e.target.value) }))}
                        />
                        <span className={styles.hint}>Completeness of proposed equipment & specs</span>
                    </div>

                    <div className={styles.weightCard}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>Compliance & Insurance</span>
                            <span style={{ fontWeight: 800, color: "#43c792" }}>{weights.complianceReliability}%</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            className={styles.sliderInput}
                            value={weights.complianceReliability}
                            onChange={(e) => setWeights((w) => ({ ...w, complianceReliability: Number(e.target.value) }))}
                        />
                        <span className={styles.hint}>Certifications, safety records, SLA guarantees</span>
                    </div>
                </div>

                <div className={`${styles.weightTotalNotice} ${totalWeight === 100 ? styles.weightValid : styles.weightInvalid}`}>
                    <span>Total Weight Allocation: <strong>{totalWeight}%</strong> {totalWeight === 100 ? "✓ (Balanced)" : "⚠️ Must sum to exactly 100%"}</span>
                    {totalWeight !== 100 && (
                        <button type="button" onClick={autoBalanceWeights} className={styles.btnSecondary} style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}>
                            Auto-Balance to 100%
                        </button>
                    )}
                </div>
            </div>

            {/* SECTION 7: Document Tone & Targeted Vendors */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>7</span>
                    <span>Document Tone & Invited Vendors</span>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "1.25rem" }}>
                    <label className={styles.formLabel}>AI Document Tone</label>
                    <div className={styles.chipGrid}>
                        {TONES.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className={`${styles.chip} ${tone === t.id ? styles.chipActive : ""}`}
                                onClick={() => setTone(t.id)}
                            >
                                <strong>{t.label}</strong> — <span style={{ opacity: 0.8 }}>{t.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "1.25rem" }}>
                    <label className={styles.formLabel}>
                        Directly Invited Vendors (Optional)
                        <span className={styles.hint}>Leave empty for an Open Competitive Tender</span>
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.65rem" }}>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="Enter vendor name to invite (e.g. Northstar Catering)..."
                            value={vendorInput}
                            onChange={(e) => setVendorInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddTargetVendor();
                                }
                            }}
                        />
                        <button type="button" onClick={handleAddTargetVendor} className={styles.btnSecondary}>
                            + Invite
                        </button>
                    </div>

                    {targetVendors.length > 0 && (
                        <div className={styles.chipGrid}>
                            {targetVendors.map((tv) => (
                                <span key={tv.vendorName} className={styles.chip} style={{ background: "rgba(67, 199, 146, 0.12)" }}>
                                    ✓ {tv.vendorName}
                                    <button
                                        type="button"
                                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "0.3rem" }}
                                        onClick={() => handleRemoveTargetVendor(tv.vendorName)}
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Special Notes / Custom Requirements</label>
                    <textarea
                        rows={2}
                        className={styles.formTextarea}
                        placeholder="e.g. Loading dock access limited to 6 AM - 9 AM; zero single-use plastics mandate..."
                        value={specialTerms}
                        onChange={(e) => setSpecialTerms(e.target.value)}
                    />
                </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.5rem" }}>
                <button type="button" onClick={onCancel} className={styles.btnSecondary}>
                    Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                    {loading ? (
                        <>
                            <span>Generating RFP Document...</span>
                        </>
                    ) : (
                        <>
                            <span>⚡ Generate Official RFP Document</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
