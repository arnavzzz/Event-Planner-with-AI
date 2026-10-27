import { CATEGORY_TEMPLATES } from "./rfpTemplates.ts";
import type { RfpCategory } from "./rfpTypes.ts";
import styles from "../../../../../styles/event-organizer/documents.module.css";

interface RfpTemplatesViewProps {
    isDark: boolean;
    onUseTemplate: (category: RfpCategory) => void;
}

export default function RfpTemplatesView({ isDark, onUseTemplate }: RfpTemplatesViewProps) {
    const templateEntries = Object.entries(CATEGORY_TEMPLATES);

    return (
        <div>
            <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.35rem", fontWeight: 800 }}>
                    Standard Procurement Blueprints & SOW Templates
                </h3>
                <p style={{ margin: 0, color: isDark ? "#9aafa5" : "#718078", fontSize: "0.92rem" }}>
                    Select an industry-standard procurement template to jumpstart your Request for Proposal with pre-configured deliverables, compliance rules, and scoring matrices.
                </p>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))",
                gap: "1.25rem"
            }}>
                {templateEntries.map(([cat, tmpl]) => (
                    <div
                        key={cat}
                        style={{
                            background: isDark ? "#11231d" : "#ffffff",
                            border: `1px solid ${isDark ? "#294136" : "#dce6e0"}`,
                            borderRadius: "1rem",
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "1.25rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                        }}
                    >
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <span className={styles.rfpIdTag} style={{ textTransform: "uppercase" }}>
                                    {cat}
                                </span>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#43c792" }}>
                                    {tmpl.deliverables.length} Deliverables Included
                                </span>
                            </div>

                            <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.3 }}>
                                {tmpl.title}
                            </h4>

                            <p style={{
                                fontSize: "0.85rem",
                                color: isDark ? "#9aafa5" : "#718078",
                                lineHeight: 1.6,
                                marginBottom: "1rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                            }}>
                                {tmpl.scopeOfWork}
                            </p>

                            <div style={{
                                background: isDark ? "rgba(0,0,0,0.2)" : "#f8faf9",
                                borderRadius: "0.65rem",
                                padding: "0.75rem",
                                fontSize: "0.78rem",
                                border: `1px solid ${isDark ? "#294136" : "#e2e8f0"}`
                            }}>
                                <div style={{ fontWeight: 700, marginBottom: "0.35rem", color: isDark ? "#f2f7f4" : "#172820" }}>
                                    Key Deliverable Highlights:
                                </div>
                                <ul style={{ paddingLeft: "1.2rem", margin: 0, color: isDark ? "#9aafa5" : "#718078" }}>
                                    {tmpl.deliverables.slice(0, 3).map((d) => (
                                        <li key={d.title} style={{ marginBottom: "0.2rem" }}>
                                            <strong>{d.title}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`, paddingTop: "1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: isDark ? "#9aafa5" : "#718078" }}>
                                Suggested Weights: Cost {tmpl.suggestedWeights.cost}% • Quality {tmpl.suggestedWeights.qualityExperience}%
                            </div>
                            <button
                                type="button"
                                onClick={() => onUseTemplate(cat as RfpCategory)}
                                className={styles.btnPrimary}
                                style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                            >
                                ⚡ Use Template
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
