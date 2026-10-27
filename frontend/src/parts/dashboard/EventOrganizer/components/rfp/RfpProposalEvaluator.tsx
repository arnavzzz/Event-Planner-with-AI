import { useState, useEffect } from "react";
import type { RfpRecord, VendorProposal, RfpStatus } from "./rfpTypes.ts";
import { evaluateVendorProposals } from "../../../../../api/rfpService.ts";
import styles from "../../../../../styles/event-organizer/documents.module.css";

interface RfpProposalEvaluatorProps {
    isDark: boolean;
    rfp: RfpRecord;
    proposals: VendorProposal[];
    onBack: () => void;
    onSaveProposals: (rfpId: string, proposals: VendorProposal[]) => void;
    onUpdateStatus: (rfpId: string, newStatus: RfpStatus) => void;
    onShowToast: (message: string) => void;
}

export default function RfpProposalEvaluator({
    isDark,
    rfp,
    proposals: initialProposals,
    onBack,
    onSaveProposals,
    onUpdateStatus,
    onShowToast,
}: RfpProposalEvaluatorProps) {
    const [proposals, setProposals] = useState<VendorProposal[]>(initialProposals);
    const [evaluating, setEvaluating] = useState(false);

    // Form fields for adding a proposal
    const [vendorName, setVendorName] = useState("");
    const [quotedPrice, setQuotedPrice] = useState<number>(rfp.commercials.targetBudget);
    const [qualityScore, setQualityScore] = useState<number>(8.5);
    const [deliverableScore, setDeliverableScore] = useState<number>(9.0);
    const [complianceScore, setComplianceScore] = useState<number>(9.5);
    const [notes, setNotes] = useState("");

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Auto-evaluate when proposals change
    useEffect(() => {
        if (proposals.length > 0) {
            void runEvaluation(proposals);
        }
    }, []);

    const runEvaluation = async (listToEvaluate: VendorProposal[]) => {
        setEvaluating(true);
        try {
            const evaluated = await evaluateVendorProposals(rfp, listToEvaluate);
            setProposals(evaluated);
            onSaveProposals(rfp.id, evaluated);
        } catch {
            // Error handling fallback
        } finally {
            setEvaluating(false);
        }
    };

    const handleAddProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorName.trim()) return;

        const newProp: VendorProposal = {
            id: `prop-${Date.now()}`,
            rfpId: rfp.id,
            vendorName: vendorName.trim(),
            quotedPrice: Number(quotedPrice),
            qualityScore: Number(qualityScore),
            deliverableScore: Number(deliverableScore),
            complianceScore: Number(complianceScore),
            submittedAt: new Date().toISOString(),
            notes: notes.trim(),
        };

        const updated = [...proposals, newProp];
        await runEvaluation(updated);

        // Reset form
        setVendorName("");
        setQuotedPrice(rfp.commercials.targetBudget);
        setNotes("");
        onShowToast(`Proposal from "${newProp.vendorName}" registered and scored!`);
    };

    const handleDeleteProposal = async (propId: string) => {
        const remaining = proposals.filter((p) => p.id !== propId);
        await runEvaluation(remaining);
        onShowToast("Proposal removed.");
    };

    const handleAwardVendor = (winnerName: string) => {
        onUpdateStatus(rfp.id, "awarded");
        onShowToast(`Contract successfully awarded to "${winnerName}"! RFP marked as AWARDED.`);
    };

    const winner = proposals.find((p) => p.isWinner) || proposals[0];

    return (
        <div>
            {/* Header Toolbar */}
            <div className={styles.viewerToolbar}>
                <div>
                    <button type="button" onClick={onBack} className={styles.btnSecondary}>
                        ← Back to RFP Document
                    </button>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: isDark ? "#9aafa5" : "#718078" }}>
                        Evaluation Weights:
                    </span>
                    <span className={styles.chip} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                        Cost: {rfp.evaluationWeights.cost}%
                    </span>
                    <span className={styles.chip} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                        Quality: {rfp.evaluationWeights.qualityExperience}%
                    </span>
                    <span className={styles.chip} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                        Fit: {rfp.evaluationWeights.deliverableFit}%
                    </span>
                    <span className={styles.chip} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                        Compliance: {rfp.evaluationWeights.complianceReliability}%
                    </span>
                </div>
            </div>

            {/* RFP Summary Card */}
            <div style={{
                background: isDark ? "#11231d" : "#ffffff",
                border: `1px solid ${isDark ? "#294136" : "#dce6e0"}`,
                borderRadius: "1rem",
                padding: "1.25rem 1.5rem",
                marginBottom: "1.75rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem"
            }}>
                <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                        <span className={styles.rfpIdTag}>{rfp.id}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#43c792" }}>{rfp.category}</span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800 }}>
                        {rfp.title}
                    </h2>
                    <p style={{ margin: "0.25rem 0 0", color: isDark ? "#9aafa5" : "#718078", fontSize: "0.85rem" }}>
                        Event: <strong>{rfp.eventName}</strong> • Target Budget: <strong>{formatCurrency(rfp.commercials.targetBudget)}</strong> • Ceiling: <strong>{formatCurrency(rfp.commercials.budgetCeiling)}</strong>
                    </p>
                </div>

                {winner && rfp.status !== "awarded" && (
                    <button
                        type="button"
                        onClick={() => handleAwardVendor(winner.vendorName)}
                        className={styles.btnPrimary}
                        style={{ background: "#22c55e", color: "#ffffff" }}
                    >
                        🏆 Award Contract to {winner.vendorName}
                    </button>
                )}
            </div>

            {/* Winner Spotlight Banner if evaluated */}
            {winner && (
                <div style={{
                    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.05))",
                    border: "1px solid rgba(34, 197, 94, 0.35)",
                    borderRadius: "1rem",
                    padding: "1.25rem 1.5rem",
                    marginBottom: "1.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem"
                }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div style={{
                            width: "3rem",
                            height: "3rem",
                            borderRadius: "999px",
                            background: "#22c55e",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem"
                        }}>
                            🏆
                        </div>
                        <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#22c55e", letterSpacing: "0.05em" }}>
                                Highest Evaluated Vendor Bid (#1 Ranking)
                            </div>
                            <div style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0.15rem 0" }}>
                                {winner.vendorName}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: isDark ? "#9aafa5" : "#718078" }}>
                                Quoted Price: <strong>{formatCurrency(winner.quotedPrice)}</strong> (
                                {winner.quotedPrice <= rfp.commercials.targetBudget ? (
                                    <span style={{ color: "#22c55e" }}>Within Target Budget</span>
                                ) : (
                                    <span style={{ color: "#f59e0b" }}>+₹{(winner.quotedPrice - rfp.commercials.targetBudget).toLocaleString()} over target</span>
                                )}) • Score: <strong style={{ color: "#43c792" }}>{winner.totalScore}/100</strong>
                            </div>
                        </div>
                    </div>

                    {rfp.status === "awarded" && (
                        <div style={{
                            background: "rgba(34, 197, 94, 0.2)",
                            border: "1px solid #22c55e",
                            color: "#22c55e",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            fontWeight: 800,
                            fontSize: "0.85rem"
                        }}>
                            ✓ CONTRACT OFFICIALLY AWARDED
                        </div>
                    )}
                </div>
            )}

            {/* Proposals Comparison Table */}
            <div style={{
                background: isDark ? "#11231d" : "#ffffff",
                border: `1px solid ${isDark ? "#294136" : "#dce6e0"}`,
                borderRadius: "1rem",
                padding: "1.5rem",
                marginBottom: "2rem"
            }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1.15rem", fontWeight: 700 }}>
                    Received Bids & Scoring Comparison ({proposals.length})
                </h3>

                {proposals.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: isDark ? "#9aafa5" : "#718078" }}>
                        No vendor proposals submitted yet. Add proposal details below to rank bidders.
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${isDark ? "#294136" : "#e2e8f0"}`, textAlign: "left" }}>
                                    <th style={{ padding: "0.75rem" }}>Rank</th>
                                    <th style={{ padding: "0.75rem" }}>Vendor Name</th>
                                    <th style={{ padding: "0.75rem" }}>Quoted Price</th>
                                    <th style={{ padding: "0.75rem" }}>Variance to Budget</th>
                                    <th style={{ padding: "0.75rem" }}>Quality (10)</th>
                                    <th style={{ padding: "0.75rem" }}>SOW Fit (10)</th>
                                    <th style={{ padding: "0.75rem" }}>Compliance (10)</th>
                                    <th style={{ padding: "0.75rem" }}>Weighted Score</th>
                                    <th style={{ padding: "0.75rem" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposals.map((p, idx) => (
                                    <tr
                                        key={p.id}
                                        style={{
                                            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`,
                                            background: p.isWinner ? (isDark ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.05)") : "transparent"
                                        }}
                                    >
                                        <td style={{ padding: "0.75rem", fontWeight: 800 }}>
                                            {p.isWinner ? "🥇 #1" : `#${idx + 1}`}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            <strong>{p.vendorName}</strong>
                                            {p.notes && (
                                                <div style={{ fontSize: "0.75rem", color: isDark ? "#9aafa5" : "#718078", marginTop: "0.2rem" }}>
                                                    {p.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "0.75rem", fontWeight: 700 }}>
                                            {formatCurrency(p.quotedPrice)}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            {p.quotedPrice > rfp.commercials.budgetCeiling ? (
                                                <span style={{ color: "#ef4444", fontWeight: 700 }}>Disqualified (Over Ceiling)</span>
                                            ) : p.quotedPrice <= rfp.commercials.targetBudget ? (
                                                <span style={{ color: "#22c55e", fontWeight: 700 }}>
                                                    -₹{(rfp.commercials.targetBudget - p.quotedPrice).toLocaleString()} (Savings)
                                                </span>
                                            ) : (
                                                <span style={{ color: "#f59e0b" }}>
                                                    +₹{(p.quotedPrice - rfp.commercials.targetBudget).toLocaleString()}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>★ {p.qualityScore}/10</td>
                                        <td style={{ padding: "0.75rem" }}>★ {p.deliverableScore}/10</td>
                                        <td style={{ padding: "0.75rem" }}>★ {p.complianceScore}/10</td>
                                        <td style={{ padding: "0.75rem" }}>
                                            <span style={{
                                                fontSize: "1rem",
                                                fontWeight: 800,
                                                color: p.isWinner ? "#43c792" : "inherit"
                                            }}>
                                                {p.totalScore || "—"} / 100
                                            </span>
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteProposal(p.id)}
                                                className={styles.btnOutline}
                                                style={{ padding: "0.25rem 0.5rem", color: "#ef4444", fontSize: "0.75rem" }}
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form to Add Vendor Proposal */}
            <form onSubmit={handleAddProposal} style={{
                background: isDark ? "#11231d" : "#ffffff",
                border: `1px solid ${isDark ? "#294136" : "#dce6e0"}`,
                borderRadius: "1rem",
                padding: "1.5rem"
            }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1.15rem", fontWeight: 700 }}>
                    + Record Received Vendor Bid
                </h3>

                <div className={styles.formGrid3} style={{ marginBottom: "1rem" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Vendor / Bidder Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Apex Catering Solutions"
                            className={styles.formInput}
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Total Quoted Price (₹ INR)</label>
                        <input
                            type="number"
                            min="1000"
                            step="500"
                            className={styles.formInput}
                            value={quotedPrice}
                            onChange={(e) => setQuotedPrice(Number(e.target.value))}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Quality & Experience (1 - 10)
                            <span style={{ color: "#43c792", fontWeight: 700 }}>{qualityScore}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="0.5"
                            className={styles.sliderInput}
                            value={qualityScore}
                            onChange={(e) => setQualityScore(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: "1rem" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            SOW & Deliverables Match (1 - 10)
                            <span style={{ color: "#43c792", fontWeight: 700 }}>{deliverableScore}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="0.5"
                            className={styles.sliderInput}
                            value={deliverableScore}
                            onChange={(e) => setDeliverableScore(Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Compliance & Insurance (1 - 10)
                            <span style={{ color: "#43c792", fontWeight: 700 }}>{complianceScore}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="0.5"
                            className={styles.sliderInput}
                            value={complianceScore}
                            onChange={(e) => setComplianceScore(Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Bid Notes & Distinctions</label>
                        <input
                            type="text"
                            placeholder="e.g. Verified insurance, 4 past client references provided"
                            className={styles.formInput}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" disabled={evaluating} className={styles.btnPrimary}>
                        {evaluating ? "Evaluating..." : "+ Add & Score Proposal"}
                    </button>
                </div>
            </form>
        </div>
    );
}
