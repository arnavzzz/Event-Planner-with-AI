import { useState } from "react";
import type { RfpRecord, RfpStatus } from "./rfpTypes.ts";
import styles from "../../../../../styles/event-organizer/documents.module.css";

interface RfpRegistryListProps {
    isDark: boolean;
    rfps: RfpRecord[];
    onSelectRfp: (rfp: RfpRecord) => void;
    onNewRfp: () => void;
    onUpdateStatus: (rfpId: string, newStatus: RfpStatus) => void;
    onEvaluateProposals: (rfp: RfpRecord) => void;
    onDuplicate: (rfp: RfpRecord) => void;
    onDelete: (rfpId: string) => void;
}

export default function RfpRegistryList({
    isDark,
    rfps,
    onSelectRfp,
    onNewRfp,
    onUpdateStatus,
    onEvaluateProposals,
    onDuplicate,
    onDelete,
}: RfpRegistryListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Currency formatter
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Filter logic
    const filteredRfps = rfps.filter((rfp) => {
        const matchesSearch =
            rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rfp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rfp.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rfp.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || rfp.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || rfp.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Compute stats
    const totalRfps = rfps.length;
    const activeIssued = rfps.filter((r) => r.status === "issued").length;
    const evaluatingCount = rfps.filter((r) => r.status === "evaluating").length;
    const totalProcurementBudget = rfps.reduce((sum, r) => sum + r.commercials.targetBudget, 0);

    const categories = Array.from(new Set(rfps.map((r) => r.category)));

    const getStatusBadge = (status: RfpStatus) => {
        const badgeMap = {
            draft: { cls: styles.statusDraft, label: "Draft" },
            ready: { cls: styles.statusReady, label: "Ready to Issue" },
            issued: { cls: styles.statusIssued, label: "Issued to Bidders" },
            evaluating: { cls: styles.statusEvaluating, label: "Evaluating Bids" },
            awarded: { cls: styles.statusAwarded, label: "Vendor Awarded" },
            cancelled: { cls: styles.statusCancelled, label: "Cancelled" },
        };
        const s = badgeMap[status] || badgeMap.draft;
        return <span className={`${styles.statusBadge} ${s.cls}`}>{s.label}</span>;
    };

    return (
        <div>
            {/* KPI Stat Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper}>📑</div>
                    <div>
                        <div className={styles.statNumber}>{totalRfps}</div>
                        <div className={styles.statLabel}>Procurement RFPs</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.12)" }}>
                        🚀
                    </div>
                    <div>
                        <div className={styles.statNumber}>{activeIssued}</div>
                        <div className={styles.statLabel}>Issued to Vendors</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ color: "#8b5cf6", background: "rgba(139, 92, 246, 0.12)" }}>
                        ⚖️
                    </div>
                    <div>
                        <div className={styles.statNumber}>{evaluatingCount}</div>
                        <div className={styles.statLabel}>Under Bid Evaluation</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.12)" }}>
                        💰
                    </div>
                    <div>
                        <div className={styles.statNumber}>{formatCurrency(totalProcurementBudget)}</div>
                        <div className={styles.statLabel}>Total Procurement Value</div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarSearch}>
                    <input
                        type="text"
                        placeholder="Search RFPs by Reference ID, Event, Category..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        className={styles.filterSelect}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="ready">Ready</option>
                        <option value="issued">Issued</option>
                        <option value="evaluating">Evaluating</option>
                        <option value="awarded">Awarded</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <button type="button" onClick={onNewRfp} className={styles.btnPrimary}>
                    <span>+ Generate New RFP</span>
                </button>
            </div>

            {/* RFP Cards List */}
            {filteredRfps.length === 0 ? (
                <div style={{
                    padding: "3.5rem 2rem",
                    textAlign: "center",
                    background: isDark ? "#11231d" : "#ffffff",
                    borderRadius: "1rem",
                    border: `1px solid ${isDark ? "#294136" : "#dce6e0"}`
                }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📑</div>
                    <h3 style={{ margin: "0 0 0.5rem", fontWeight: 700 }}>No Procurement RFPs Found</h3>
                    <p style={{ margin: "0 0 1.25rem", color: isDark ? "#9aafa5" : "#718078", fontSize: "0.9rem" }}>
                        {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                            ? "Try adjusting your search query or status filter."
                            : "Generate your first Request for Proposal to procure top vendors."}
                    </p>
                    <button type="button" onClick={onNewRfp} className={styles.btnPrimary}>
                        + Generate Your First RFP
                    </button>
                </div>
            ) : (
                <div className={styles.rfpList}>
                    {filteredRfps.map((rfp) => (
                        <div key={rfp.id} className={styles.rfpCard}>
                            <div className={styles.rfpCardTop}>
                                <div className={styles.rfpHeaderInfo}>
                                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginBottom: "0.35rem" }}>
                                        <span className={styles.rfpIdTag}>{rfp.id}</span>
                                        {getStatusBadge(rfp.status)}
                                        <span style={{ fontSize: "0.75rem", color: isDark ? "#9aafa5" : "#718078", fontWeight: 600 }}>
                                            Issued: {rfp.timeline.issueDate}
                                        </span>
                                    </div>
                                    <h3
                                        className={styles.rfpCardTitle}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => onSelectRfp(rfp)}
                                    >
                                        {rfp.title}
                                    </h3>
                                    <div className={styles.rfpEventSub}>
                                        Event: <strong>{rfp.eventName}</strong> ({rfp.eventType}) • {rfp.guestCount.toLocaleString()} Attendees
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: isDark ? "#9aafa5" : "#718078" }}>
                                        Status:
                                    </label>
                                    <select
                                        className={styles.filterSelect}
                                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.82rem" }}
                                        value={rfp.status}
                                        onChange={(e) => onUpdateStatus(rfp.id, e.target.value as RfpStatus)}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="ready">Ready</option>
                                        <option value="issued">Issued</option>
                                        <option value="evaluating">Evaluating</option>
                                        <option value="awarded">Awarded</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.rfpDetailsGrid}>
                                <div className={styles.rfpDetailItem}>
                                    <span className={styles.rfpDetailLabel}>Category</span>
                                    <span className={styles.rfpDetailValue} style={{ color: "#43c792" }}>{rfp.category}</span>
                                </div>
                                <div className={styles.rfpDetailItem}>
                                    <span className={styles.rfpDetailLabel}>Target Budget</span>
                                    <span className={styles.rfpDetailValue}>{formatCurrency(rfp.commercials.targetBudget)}</span>
                                </div>
                                <div className={styles.rfpDetailItem}>
                                    <span className={styles.rfpDetailLabel}>Budget Ceiling</span>
                                    <span className={styles.rfpDetailValue} style={{ color: "#f87171" }}>
                                        {formatCurrency(rfp.commercials.budgetCeiling)}
                                    </span>
                                </div>
                                <div className={styles.rfpDetailItem}>
                                    <span className={styles.rfpDetailLabel}>Submission Deadline</span>
                                    <span className={styles.rfpDetailValue}>{rfp.timeline.submissionDeadline}</span>
                                </div>
                                <div className={styles.rfpDetailItem}>
                                    <span className={styles.rfpDetailLabel}>Deliverables</span>
                                    <span className={styles.rfpDetailValue}>{rfp.deliverables.length} Specified</span>
                                </div>
                                <div className={styles.rfpDetailItem}>
                                    <span className={styles.rfpDetailLabel}>Proposals Received</span>
                                    <span className={styles.rfpDetailValue} style={{ color: "#8b5cf6" }}>
                                        {rfp.proposalsCount || 0} Submitted
                                    </span>
                                </div>
                            </div>

                            <div className={styles.rfpCardFooter}>
                                <div style={{ fontSize: "0.82rem", color: isDark ? "#9aafa5" : "#718078" }}>
                                    {rfp.targetVendors && rfp.targetVendors.length > 0 ? (
                                        <span>Invited: <strong>{rfp.targetVendors.map((v) => v.vendorName).join(", ")}</strong></span>
                                    ) : (
                                        <span>Open Competitive Tender</span>
                                    )}
                                </div>

                                <div className={styles.rfpActionsCluster}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectRfp(rfp)}
                                        className={styles.btnSecondary}
                                        style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                                    >
                                        👁️ View & Print Document
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onEvaluateProposals(rfp)}
                                        className={styles.btnSecondary}
                                        style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem", color: "#a855f7", borderColor: "rgba(168, 85, 247, 0.4)" }}
                                    >
                                        ⚖️ Evaluate Bids ({rfp.proposalsCount || 0})
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDuplicate(rfp)}
                                        className={styles.btnOutline}
                                        title="Clone RFP"
                                        style={{ padding: "0.4rem 0.6rem" }}
                                    >
                                        📑
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete ${rfp.id}?`)) {
                                                onDelete(rfp.id);
                                            }
                                        }}
                                        className={styles.btnOutline}
                                        title="Delete RFP"
                                        style={{ padding: "0.4rem 0.6rem", color: "#ef4444" }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
