import { useState } from "react";
import type { RfpRecord, RfpStatus } from "./rfpTypes.ts";
import styles from "../../../../../styles/event-organizer/documents.module.css";

interface RfpDocumentViewerProps {
    isDark: boolean;
    rfp: RfpRecord;
    onBack: () => void;
    onUpdateStatus: (rfpId: string, newStatus: RfpStatus) => void;
    onEvaluateProposals: (rfp: RfpRecord) => void;
    onDuplicate: (rfp: RfpRecord) => void;
    onShowToast: (message: string) => void;
}

type ViewMode = "formatted" | "markdown" | "email";

export default function RfpDocumentViewer({
    isDark,
    rfp,
    onBack,
    onUpdateStatus,
    onEvaluateProposals,
    onDuplicate,
    onShowToast,
}: RfpDocumentViewerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("formatted");
    const [markdownContent, setMarkdownContent] = useState<string>(rfp.generatedMarkdown);
    const [isEditingMarkdown, setIsEditingMarkdown] = useState<boolean>(false);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadMarkdown = () => {
        const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${rfp.id}_${rfp.category.replace(/\W+/g, "_")}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onShowToast(`Downloaded ${rfp.id}.md successfully!`);
    };

    const handleDownloadText = () => {
        const textContent = markdownContent.replace(/[*#`_]/g, "");
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${rfp.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onShowToast(`Downloaded ${rfp.id}.txt successfully!`);
    };

    const handleCopyMarkdown = async () => {
        try {
            await navigator.clipboard.writeText(markdownContent);
            onShowToast("RFP Markdown copied to clipboard!");
        } catch {
            onShowToast("Failed to copy to clipboard.");
        }
    };

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(rfp.generatedEmailPitch);
            onShowToast("Vendor email draft copied to clipboard!");
        } catch {
            onShowToast("Failed to copy email pitch.");
        }
    };

    const handleIssueRfp = () => {
        onUpdateStatus(rfp.id, "issued");
        onShowToast(`RFP ${rfp.id} successfully marked as ISSUED to vendors!`);
    };

    const statusBadgeClass = {
        draft: styles.statusDraft,
        ready: styles.statusReady,
        issued: styles.statusIssued,
        evaluating: styles.statusEvaluating,
        awarded: styles.statusAwarded,
        cancelled: styles.statusCancelled,
    }[rfp.status] || styles.statusDraft;

    return (
        <div>
            {/* Action Bar */}
            <div className={styles.viewerToolbar}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button type="button" onClick={onBack} className={styles.btnSecondary}>
                        ← Back to Registry
                    </button>

                    <div style={{ display: "flex", background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9", borderRadius: "0.5rem", padding: "0.2rem" }}>
                        <button
                            type="button"
                            className={styles.tabButton}
                            style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", borderRadius: "0.4rem" }}
                            onClick={() => setViewMode("formatted")}
                        >
                            {viewMode === "formatted" && "● "}📄 Executive Document
                        </button>
                        <button
                            type="button"
                            className={styles.tabButton}
                            style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", borderRadius: "0.4rem" }}
                            onClick={() => setViewMode("markdown")}
                        >
                            {viewMode === "markdown" && "● "}📝 Markdown
                        </button>
                        <button
                            type="button"
                            className={styles.tabButton}
                            style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", borderRadius: "0.4rem" }}
                            onClick={() => setViewMode("email")}
                        >
                            {viewMode === "email" && "● "}✉️ Vendor Email Pitch
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button type="button" onClick={handlePrint} className={styles.btnSecondary} title="Print or save as clean PDF">
                        🖨️ Print / PDF
                    </button>
                    <button type="button" onClick={handleDownloadMarkdown} className={styles.btnSecondary} title="Download .md file">
                        💾 Download .MD
                    </button>
                    <button type="button" onClick={handleDownloadText} className={styles.btnSecondary} title="Download plain text file">
                        📄 .TXT
                    </button>
                    <button type="button" onClick={handleCopyMarkdown} className={styles.btnSecondary} title="Copy markdown to clipboard">
                        📋 Copy
                    </button>
                    <button type="button" onClick={() => onDuplicate(rfp)} className={styles.btnSecondary} title="Clone this RFP">
                        📑 Duplicate
                    </button>

                    {rfp.status !== "issued" && rfp.status !== "evaluating" && rfp.status !== "awarded" && (
                        <button type="button" onClick={handleIssueRfp} className={styles.btnPrimary} style={{ background: "#f59e0b", color: "#111827" }}>
                            🚀 Issue to Vendors
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onEvaluateProposals(rfp)}
                        className={styles.btnPrimary}
                        style={{ background: "#8b5cf6", color: "#ffffff" }}
                    >
                        ⚖️ Evaluate Proposals ({rfp.proposalsCount || 0})
                    </button>
                </div>
            </div>

            {/* TAB 1: Executive Formatted Paper Document */}
            {viewMode === "formatted" && (
                <div className={styles.paperDocument}>
                    <div className={styles.docWatermark}>RFP</div>

                    {/* Official Document Header */}
                    <div className={styles.docOfficialHeader}>
                        <div>
                            <div className={styles.docSubtitle}>Official Request for Proposal</div>
                            <h1 className={styles.docMainTitle}>{rfp.category} Services</h1>
                            <div style={{ color: "#475569", fontSize: "0.95rem", marginTop: "0.25rem", fontWeight: 600 }}>
                                Prepared for <strong>{rfp.eventName}</strong> ({rfp.eventType})
                            </div>
                        </div>

                        <div className={styles.docRefBox}>
                            <div>RFP REFERENCE</div>
                            <div className={styles.docRefHighlight}>{rfp.id}</div>
                            <div style={{ marginTop: "0.45rem" }}>
                                <span className={`${styles.statusBadge} ${statusBadgeClass}`}>
                                    {rfp.status.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ marginTop: "0.35rem", fontSize: "0.78rem" }}>
                                Issued: <strong>{rfp.timeline.issueDate}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Executive Summary */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>1. Executive Summary & Objective</div>
                        <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.7 }}>
                            The <strong>{rfp.organizerName}</strong> formally invites competitive, sealed proposals from established and licensed
                            service providers for <strong>{rfp.category} Services</strong> supporting the <strong>{rfp.eventName}</strong>.
                            The purpose of this RFP is to select a single qualified partner capable of delivering high-standard service,
                            exceptional execution, and full regulatory and insurance compliance for our {rfp.guestCount.toLocaleString()} attendees.
                        </p>
                    </div>

                    {/* Section 2: Event Operating Environment */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>2. Event Operating Environment & Profile</div>
                        <table className={styles.docTable}>
                            <tbody>
                                <tr>
                                    <th style={{ width: "30%" }}>Event Title & Type</th>
                                    <td><strong>{rfp.eventName}</strong> ({rfp.eventType})</td>
                                </tr>
                                <tr>
                                    <th>Anticipated Attendance</th>
                                    <td><strong>{rfp.guestCount.toLocaleString()} Attendees / Guests</strong></td>
                                </tr>
                                <tr>
                                    <th>Venue / Location Premises</th>
                                    <td>{rfp.venueLocation}</td>
                                </tr>
                                <tr>
                                    <th>Service Operational Window</th>
                                    <td><strong>{rfp.timeline.serviceStartDate}</strong> to <strong>{rfp.timeline.serviceEndDate}</strong></td>
                                </tr>
                                <tr>
                                    <th>Procuring Directorate</th>
                                    <td>{rfp.organizerName} ({rfp.organizerEmail} | {rfp.organizerPhone})</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 3: Scope of Work */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>3. Detailed Scope of Work (SOW)</div>
                        <div className={styles.docCallout}>
                            <p style={{ margin: 0, lineHeight: 1.7 }}>{rfp.scopeOfWork}</p>
                        </div>
                    </div>

                    {/* Section 4: Mandatory Deliverables */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>4. Mandatory Deliverables & Specifications</div>
                        <table className={styles.docTable}>
                            <thead>
                                <tr>
                                    <th style={{ width: "5%" }}>#</th>
                                    <th style={{ width: "30%" }}>Deliverable Item</th>
                                    <th style={{ width: "50%" }}>Detailed Specification</th>
                                    <th style={{ width: "15%" }}>Requirement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rfp.deliverables.map((del, i) => (
                                    <tr key={del.id || i}>
                                        <td style={{ fontWeight: 700, color: "#0f766e" }}>{i + 1}</td>
                                        <td><strong>{del.title}</strong></td>
                                        <td>{del.description}</td>
                                        <td>
                                            <span style={{
                                                fontSize: "0.75rem",
                                                fontWeight: 800,
                                                color: del.isMandatory ? "#15803d" : "#64748b",
                                                textTransform: "uppercase"
                                            }}>
                                                {del.isMandatory ? "✓ Mandatory" : "Optional"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Section 5: Commercial Terms */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>5. Budgetary Guidelines & Commercial Framework</div>
                        <table className={styles.docTable}>
                            <tbody>
                                <tr>
                                    <th style={{ width: "30%" }}>Target Budget Allocation</th>
                                    <td style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f766e" }}>
                                        {formatCurrency(rfp.commercials.targetBudget)}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Maximum Cost Ceiling</th>
                                    <td style={{ color: "#b91c1c", fontWeight: 700 }}>
                                        {formatCurrency(rfp.commercials.budgetCeiling)} *(Proposals exceeding ceiling will be disqualified)*
                                    </td>
                                </tr>
                                <tr>
                                    <th>Pricing Model</th>
                                    <td>{rfp.commercials.pricingStructure.replace(/_/g, " ").toUpperCase()}</td>
                                </tr>
                                <tr>
                                    <th>Payment Milestones</th>
                                    <td>{rfp.commercials.paymentTerms}</td>
                                </tr>
                                <tr>
                                    <th>Late Delivery / Delay Penalty</th>
                                    <td>{rfp.commercials.penaltyClause}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 6: Compliance & Safety */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>6. Vendor Eligibility, Insurance & Compliance Criteria</div>
                        <table className={styles.docTable}>
                            <thead>
                                <tr>
                                    <th>Prerequisite Verification Item</th>
                                    <th style={{ width: "25%" }}>Mandatory Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Government Business License & Trade Incorporation</td>
                                    <td style={{ fontWeight: 700 }}>{rfp.compliance.businessLicense ? "REQUIRED" : "OPTIONAL"}</td>
                                </tr>
                                <tr>
                                    <td>Commercial General Liability Insurance (Min ₹50,00,000 / $1,000,000)</td>
                                    <td style={{ fontWeight: 700 }}>{rfp.compliance.liabilityInsurance ? "REQUIRED" : "OPTIONAL"}</td>
                                </tr>
                                <tr>
                                    <td>Food Safety & Hygiene Certification / FSSAI License</td>
                                    <td style={{ fontWeight: 700 }}>{rfp.compliance.foodSafetyFssai ? "REQUIRED" : "NOT APPLICABLE"}</td>
                                </tr>
                                <tr>
                                    <td>GST & Tax Registration with Active Filing Verification</td>
                                    <td style={{ fontWeight: 700 }}>{rfp.compliance.taxComplianceGst ? "REQUIRED" : "OPTIONAL"}</td>
                                </tr>
                                <tr>
                                    <td>Non-Disclosure & Confidentiality Agreement (NDA)</td>
                                    <td style={{ fontWeight: 700 }}>{rfp.compliance.ndaRequired ? "REQUIRED" : "OPTIONAL"}</td>
                                </tr>
                                <tr>
                                    <td>Verified Past Client References</td>
                                    <td style={{ fontWeight: 700 }}>Minimum {rfp.compliance.pastReferencesMin} References Required</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 7: Key Procurement Timeline */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>7. Procurement Schedule & Deadlines</div>
                        <table className={styles.docTable}>
                            <thead>
                                <tr>
                                    <th>Procurement Phase</th>
                                    <th style={{ width: "35%" }}>Scheduled Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>RFP Issuance Date</td>
                                    <td>{rfp.timeline.issueDate}</td>
                                </tr>
                                <tr>
                                    <td>Vendor Questions & Clarification Cutoff</td>
                                    <td>{rfp.timeline.questionsDeadline}</td>
                                </tr>
                                <tr style={{ background: "#fef3c7" }}>
                                    <td><strong>Final Proposal Submission Deadline</strong></td>
                                    <td style={{ color: "#b45309", fontWeight: 800 }}>{rfp.timeline.submissionDeadline}</td>
                                </tr>
                                <tr>
                                    <td>Committee Evaluation & Vendor Interviews</td>
                                    <td>{rfp.timeline.evaluationDate}</td>
                                </tr>
                                <tr>
                                    <td><strong>Final Vendor Award & Contract Execution</strong></td>
                                    <td style={{ color: "#0f766e", fontWeight: 800 }}>{rfp.timeline.awardDate}</td>
                                </tr>
                                <tr>
                                    <td>Service Setup & Delivery Date</td>
                                    <td>{rfp.timeline.serviceStartDate}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 8: Evaluation Scoring Matrix */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>8. Weighted Evaluation & Selection Matrix</div>
                        <table className={styles.docTable}>
                            <thead>
                                <tr>
                                    <th>Evaluation Criteria</th>
                                    <th style={{ width: "15%" }}>Weight</th>
                                    <th style={{ width: "55%" }}>Scoring Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Commercial Pricing & Cost Competitiveness</strong></td>
                                    <td style={{ fontWeight: 800, color: "#0f766e" }}>{rfp.evaluationWeights.cost}%</td>
                                    <td>Fairness of fees, itemized breakdown transparency, payment terms</td>
                                </tr>
                                <tr>
                                    <td><strong>Vendor Track Record & Experience</strong></td>
                                    <td style={{ fontWeight: 800, color: "#0f766e" }}>{rfp.evaluationWeights.qualityExperience}%</td>
                                    <td>Past performance portfolio, reference verification, reputation</td>
                                </tr>
                                <tr>
                                    <td><strong>Deliverables & Technical SOW Fit</strong></td>
                                    <td style={{ fontWeight: 800, color: "#0f766e" }}>{rfp.evaluationWeights.deliverableFit}%</td>
                                    <td>Completeness of proposal against specifications, equipment quality</td>
                                </tr>
                                <tr>
                                    <td><strong>Compliance, Safety & Reliability</strong></td>
                                    <td style={{ fontWeight: 800, color: "#0f766e" }}>{rfp.evaluationWeights.complianceReliability}%</td>
                                    <td>Insurance certificates, regulatory compliance, risk management plans</td>
                                </tr>
                                <tr style={{ background: "#f8fafc" }}>
                                    <td><strong>TOTAL EVALUATION SCORE</strong></td>
                                    <td style={{ fontWeight: 900 }}>100.0%</td>
                                    <td><strong>Sealed bid weighted composite score</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Invited Vendors */}
                    {rfp.targetVendors && rfp.targetVendors.length > 0 && (
                        <div className={styles.docSection}>
                            <div className={styles.docSectionTitle}>Invited Bidders</div>
                            <ul style={{ color: "#334155", fontSize: "0.92rem", paddingLeft: "1.25rem" }}>
                                {rfp.targetVendors.map((tv) => (
                                    <li key={tv.vendorName}>
                                        <strong>{tv.vendorName}</strong> ({tv.category}) — Tier: {tv.tier || "Moderate"} | Rating: ★ {tv.rating || 4.7}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Special Provisions */}
                    {rfp.specialTerms && (
                        <div className={styles.docSection}>
                            <div className={styles.docSectionTitle}>Special Provisions</div>
                            <p style={{ color: "#334155", fontSize: "0.92rem", fontStyle: "italic" }}>
                                {rfp.specialTerms}
                            </p>
                        </div>
                    )}

                    {/* Section 9: Submission Details */}
                    <div className={styles.docSection}>
                        <div className={styles.docSectionTitle}>9. Proposal Submission Guidelines</div>
                        <p style={{ color: "#334155", fontSize: "0.92rem", lineHeight: 1.7 }}>
                            All proposals must be submitted electronically via email to: <br />
                            <strong>Email:</strong> <span style={{ color: "#0f766e", fontFamily: "monospace" }}>{rfp.organizerEmail}</span><br />
                            <strong>Subject Line:</strong> <span style={{ fontFamily: "monospace", color: "#475569" }}>[PROPOSAL] {rfp.id} - {rfp.category} - [Company Name]</span><br />
                            Submissions received after <strong>{rfp.timeline.submissionDeadline} at 18:00 IST</strong> will not be considered.
                        </p>
                    </div>

                    {/* Signatures */}
                    <div className={styles.docSignGrid}>
                        <div className={styles.docSignSlot}>
                            <div className={styles.docSignLine} />
                            <div style={{ fontWeight: 800, fontSize: "0.88rem" }}>Authorized Procurement Officer</div>
                            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{rfp.organizerName}</div>
                        </div>

                        <div className={styles.docSignSlot}>
                            <div className={styles.docSignLine} />
                            <div style={{ fontWeight: 800, fontSize: "0.88rem" }}>Committee Chair / Organizer</div>
                            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>EventMind Planning Directorate</div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Raw Markdown Editor / Viewer */}
            {viewMode === "markdown" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.85rem", color: isDark ? "#9aafa5" : "#718078" }}>
                            Full GitHub-compatible Markdown document source.
                        </span>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {isEditingMarkdown ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditingMarkdown(false);
                                        onShowToast("Markdown changes saved!");
                                    }}
                                    className={styles.btnPrimary}
                                    style={{ padding: "0.35rem 0.85rem", fontSize: "0.82rem" }}
                                >
                                    ✓ Done Editing
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingMarkdown(true)}
                                    className={styles.btnSecondary}
                                    style={{ padding: "0.35rem 0.85rem", fontSize: "0.82rem" }}
                                >
                                    ✏️ Edit Markdown
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleCopyMarkdown}
                                className={styles.btnSecondary}
                                style={{ padding: "0.35rem 0.85rem", fontSize: "0.82rem" }}
                            >
                                📋 Copy Markdown
                            </button>
                        </div>
                    </div>

                    {isEditingMarkdown ? (
                        <textarea
                            rows={26}
                            className={styles.markdownViewer}
                            style={{ width: "100%", outline: "none", resize: "vertical" }}
                            value={markdownContent}
                            onChange={(e) => setMarkdownContent(e.target.value)}
                        />
                    ) : (
                        <pre className={styles.markdownViewer}>{markdownContent}</pre>
                    )}
                </div>
            )}

            {/* TAB 3: Vendor Email Pitch */}
            {viewMode === "email" && (
                <div style={{ background: isDark ? "#11231d" : "#ffffff", border: `1px solid ${isDark ? "#294136" : "#dce6e0"}`, borderRadius: "1rem", padding: "1.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Vendor Invitation Email Template</h3>
                            <p style={{ margin: "0.25rem 0 0", color: isDark ? "#9aafa5" : "#718078", fontSize: "0.85rem" }}>
                                Ready to copy and dispatch to vendor bidding pools.
                            </p>
                        </div>
                        <button type="button" onClick={handleCopyEmail} className={styles.btnPrimary}>
                            📋 Copy Email Draft
                        </button>
                    </div>

                    <pre style={{
                        background: isDark ? "#0c1b16" : "#f8faf9",
                        border: `1px solid ${isDark ? "#294136" : "#e2e8f0"}`,
                        padding: "1.25rem",
                        borderRadius: "0.75rem",
                        whiteSpace: "pre-wrap",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.92rem",
                        lineHeight: 1.7,
                        color: isDark ? "#f2f7f4" : "#172820",
                    }}>
                        {rfp.generatedEmailPitch}
                    </pre>
                </div>
            )}
        </div>
    );
}
