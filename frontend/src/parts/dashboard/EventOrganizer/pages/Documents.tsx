import { useState, useEffect } from "react";
import type { EventRecord } from "../EventData.ts";
import { createSampleEvents } from "../EventData.ts";
import type { OrganTabId } from "../EventOrganizerDashboardTabs.ts";
import type {
    RfpRecord,
    RfpStatus,
    RfpCategory,
    VendorProposal,
} from "../components/rfp/rfpTypes.ts";
import {
    createInitialSampleRfps,
    createInitialSampleProposals,
} from "../components/rfp/rfpTemplates.ts";
import RfpRegistryList from "../components/rfp/RfpRegistryList.tsx";
import RfpGeneratorWizard from "../components/rfp/RfpGeneratorWizard.tsx";
import RfpDocumentViewer from "../components/rfp/RfpDocumentViewer.tsx";
import RfpProposalEvaluator from "../components/rfp/RfpProposalEvaluator.tsx";
import RfpTemplatesView from "../components/rfp/RfpTemplatesView.tsx";
import styles from "../../../../styles/event-organizer/documents.module.css";

interface DocumentsProps {
    isDark: boolean;
    events?: EventRecord[];
    onSelectTab?: (tab: OrganTabId) => void;
}

type SubTab = "registry" | "generator" | "viewer" | "evaluator" | "templates";

const STORAGE_KEY_RFPS = "eventmind_procurement_rfps_v1";
const STORAGE_KEY_PROPOSALS = "eventmind_procurement_proposals_v1";

export default function Documents({ isDark, events = createSampleEvents(), onSelectTab }: DocumentsProps) {
    // Sub-tab navigation
    const [activeSubTab, setActiveSubTab] = useState<SubTab>("registry");

    // RFP Storage state
    const [rfps, setRfps] = useState<RfpRecord[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_RFPS);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch {
            // Ignore parse errors and fallback
        }
        return createInitialSampleRfps();
    });

    // Proposals Map
    const [proposalsMap, setProposalsMap] = useState<Record<string, VendorProposal[]>>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_PROPOSALS);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch {
            // Ignore parse errors
        }
        return createInitialSampleProposals();
    });

    const [selectedRfpId, setSelectedRfpId] = useState<string | null>(rfps[0]?.id || null);
    const [wizardInitialCategory, setWizardInitialCategory] = useState<RfpCategory>("Catering");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Save to localStorage whenever rfps update
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_RFPS, JSON.stringify(rfps));
        } catch {
            // Storage quota warning fallback
        }
    }, [rfps]);

    // Save proposals to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_PROPOSALS, JSON.stringify(proposalsMap));
        } catch {
            // Storage quota warning fallback
        }
    }, [proposalsMap]);

    // Toast auto-clear
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => {
            setToastMessage(null);
        }, 3500);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
    };

    // Update proposal count in RFP records
    useEffect(() => {
        setRfps((currentRfps) =>
            currentRfps.map((r) => ({
                ...r,
                proposalsCount: proposalsMap[r.id]?.length || 0,
            }))
        );
    }, [proposalsMap]);

    // Selected RFP object
    const selectedRfp = rfps.find((r) => r.id === selectedRfpId) || rfps[0];

    // Handlers
    const handleRfpGenerated = (newRfp: RfpRecord) => {
        setRfps((prev) => [newRfp, ...prev]);
        setSelectedRfpId(newRfp.id);
        setActiveSubTab("viewer");
        showToast(`RFP ${newRfp.id} generated successfully!`);
    };

    const handleSelectRfp = (rfp: RfpRecord) => {
        setSelectedRfpId(rfp.id);
        setActiveSubTab("viewer");
    };

    const handleUpdateStatus = (rfpId: string, newStatus: RfpStatus) => {
        setRfps((prev) =>
            prev.map((r) =>
                r.id === rfpId
                    ? { ...r, status: newStatus, updatedAt: new Date().toISOString() }
                    : r
            )
        );
        showToast(`RFP status updated to ${newStatus.toUpperCase()}`);
    };

    const handleEvaluateProposals = (rfp: RfpRecord) => {
        setSelectedRfpId(rfp.id);
        setActiveSubTab("evaluator");
    };

    const handleDuplicateRfp = (rfp: RfpRecord) => {
        const year = new Date().getFullYear();
        const catCode = rfp.category.slice(0, 3).toUpperCase().replace(/\W/g, "");
        const hex = Math.floor(Math.random() * 0xffff)
            .toString(16)
            .toUpperCase()
            .padStart(4, "0");
        const clonedId = `RFP-${year}-${catCode}-${hex}`;

        const cloned: RfpRecord = {
            ...rfp,
            id: clonedId,
            title: `${rfp.title} (Copy)`,
            status: "draft",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            proposalsCount: 0,
            generatedMarkdown: rfp.generatedMarkdown.replace(rfp.id, clonedId),
        };

        setRfps((prev) => [cloned, ...prev]);
        setSelectedRfpId(clonedId);
        setActiveSubTab("viewer");
        showToast(`Cloned into new draft RFP ${clonedId}`);
    };

    const handleDeleteRfp = (rfpId: string) => {
        setRfps((prev) => prev.filter((r) => r.id !== rfpId));
        if (selectedRfpId === rfpId) {
            setSelectedRfpId(rfps.find((r) => r.id !== rfpId)?.id || null);
        }
        showToast(`RFP ${rfpId} deleted.`);
    };

    const handleSaveProposals = (rfpId: string, updatedProposals: VendorProposal[]) => {
        setProposalsMap((prev) => ({
            ...prev,
            [rfpId]: updatedProposals,
        }));
    };

    const handleUseTemplate = (cat: RfpCategory) => {
        setWizardInitialCategory(cat);
        setActiveSubTab("generator");
    };

    return (
        <div className={isDark ? styles.container : styles.containerDark}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <div className={styles.badgeRow}>
                            <span>🛡️ Vendor Procurement Suite</span>
                        </div>
                        <h1 className={styles.title}>Document & RFP Center</h1>
                        <p className={styles.description}>
                            Generate, manage, and dispatch executive Requests for Proposal (RFPs) for vendor procurement across Catering, AV, Venue, Photography, and Decor. Score competitive vendor bids against custom weighted matrices.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        {onSelectTab && (
                            <button
                                type="button"
                                onClick={() => onSelectTab("create-event")}
                                className={styles.btnSecondary}
                            >
                                🗓️ Create Event
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                setWizardInitialCategory("Catering");
                                setActiveSubTab("generator");
                            }}
                            className={styles.btnPrimary}
                        >
                            <span>⚡ Generate New RFP</span>
                        </button>
                    </div>
                </div>

                {/* Subtabs Bar */}
                <div className={styles.tabBar}>
                    <button
                        type="button"
                        className={`${styles.tabButton} ${activeSubTab === "registry" ? styles.tabButtonActive : ""}`}
                        onClick={() => setActiveSubTab("registry")}
                    >
                        <span>📑 Procurement RFPs</span>
                        <span className={styles.tabCounter}>{rfps.length}</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.tabButton} ${activeSubTab === "generator" ? styles.tabButtonActive : ""}`}
                        onClick={() => setActiveSubTab("generator")}
                    >
                        <span>➕ RFP Generator</span>
                    </button>

                    {selectedRfp && (
                        <button
                            type="button"
                            className={`${styles.tabButton} ${activeSubTab === "viewer" ? styles.tabButtonActive : ""}`}
                            onClick={() => setActiveSubTab("viewer")}
                        >
                            <span>📄 View Document ({selectedRfp.id})</span>
                        </button>
                    )}

                    {selectedRfp && (
                        <button
                            type="button"
                            className={`${styles.tabButton} ${activeSubTab === "evaluator" ? styles.tabButtonActive : ""}`}
                            onClick={() => setActiveSubTab("evaluator")}
                        >
                            <span>⚖️ Proposal Evaluator ({proposalsMap[selectedRfp.id]?.length || 0})</span>
                        </button>
                    )}

                    <button
                        type="button"
                        className={`${styles.tabButton} ${activeSubTab === "templates" ? styles.tabButtonActive : ""}`}
                        onClick={() => setActiveSubTab("templates")}
                    >
                        <span>📚 Procurement Templates</span>
                    </button>
                </div>

                {/* Active SubTab View */}
                {activeSubTab === "registry" && (
                    <RfpRegistryList
                        isDark={isDark}
                        rfps={rfps}
                        onSelectRfp={handleSelectRfp}
                        onNewRfp={() => {
                            setWizardInitialCategory("Catering");
                            setActiveSubTab("generator");
                        }}
                        onUpdateStatus={handleUpdateStatus}
                        onEvaluateProposals={handleEvaluateProposals}
                        onDuplicate={handleDuplicateRfp}
                        onDelete={handleDeleteRfp}
                    />
                )}

                {activeSubTab === "generator" && (
                    <RfpGeneratorWizard
                        isDark={isDark}
                        events={events}
                        initialCategory={wizardInitialCategory}
                        onGenerated={handleRfpGenerated}
                        onCancel={() => setActiveSubTab("registry")}
                    />
                )}

                {activeSubTab === "viewer" && selectedRfp && (
                    <RfpDocumentViewer
                        isDark={isDark}
                        rfp={selectedRfp}
                        onBack={() => setActiveSubTab("registry")}
                        onUpdateStatus={handleUpdateStatus}
                        onEvaluateProposals={handleEvaluateProposals}
                        onDuplicate={handleDuplicateRfp}
                        onShowToast={showToast}
                    />
                )}

                {activeSubTab === "evaluator" && selectedRfp && (
                    <RfpProposalEvaluator
                        isDark={isDark}
                        rfp={selectedRfp}
                        proposals={proposalsMap[selectedRfp.id] || []}
                        onBack={() => setActiveSubTab("viewer")}
                        onSaveProposals={handleSaveProposals}
                        onUpdateStatus={handleUpdateStatus}
                        onShowToast={showToast}
                    />
                )}

                {activeSubTab === "templates" && (
                    <RfpTemplatesView
                        isDark={isDark}
                        onUseTemplate={handleUseTemplate}
                    />
                )}
            </div>

            {/* Toast Feedback Notification */}
            {toastMessage && (
                <div className={styles.toast}>
                    <span>✓</span>
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
