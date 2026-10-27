/**
 * RFP Service Client
 * Handles communication with the FastAPI RFP endpoints (/api/rfp/...)
 * with full client-side simulation fallback when working offline or deployed on Netlify.
 */

import { API_BASE_URL } from "./aiService.ts";
import type {
    RfpCategory,
    RfpRecord,
    RfpTimeline,
    RfpCommercials,
    RfpCompliance,
    RfpEvaluationWeights,
    DeliverableItem,
    TargetVendor,
    VendorProposal,
    RfpPriority,
    RfpTone,
} from "../parts/dashboard/EventOrganizer/components/rfp/rfpTypes.ts";

export interface GenerateRfpApiParams {
    eventId?: string;
    eventName: string;
    eventType: string;
    category: RfpCategory;
    guestCount: number;
    venueLocation: string;
    organizerName: string;
    organizerEmail: string;
    organizerPhone: string;
    priority: RfpPriority;
    tone: RfpTone;
    timeline: RfpTimeline;
    commercials: RfpCommercials;
    scopeOfWork: string;
    deliverables: DeliverableItem[];
    compliance: RfpCompliance;
    evaluationWeights: RfpEvaluationWeights;
    targetVendors: TargetVendor[];
    specialTerms?: string;
}

export interface EvaluateProposalsApiParams {
    rfpId: string;
    targetBudget: number;
    weights: RfpEvaluationWeights;
    proposals: Array<{
        vendor_id: string;
        vendor_name: string;
        quoted_price: number;
        quality_score: number;
        deliverable_score: number;
        compliance_score: number;
        notes?: string;
    }>;
}

export interface EvaluateProposalsApiResponse {
    success: boolean;
    rfp_id: string;
    total_proposals: number;
    target_budget: number;
    winner: {
        vendor_id: string;
        vendor_name: string;
        quoted_price: number;
        variance_to_budget: number;
        variance_pct: number;
        cost_score: number;
        quality_score: number;
        deliverable_score: number;
        compliance_score: number;
        total_score: number;
        notes?: string;
    } | null;
    rankings: Array<{
        vendor_id: string;
        vendor_name: string;
        quoted_price: number;
        variance_to_budget: number;
        variance_pct: number;
        cost_score: number;
        quality_score: number;
        deliverable_score: number;
        compliance_score: number;
        total_score: number;
        notes?: string;
    }>;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        window.clearTimeout(timeoutId);
    }
}

/**
 * Generates an RFP document using the live FastAPI backend, falling back to client-side synthesis.
 */
export async function generateRfpDocument(params: GenerateRfpApiParams): Promise<RfpRecord> {
    const targetUrl = `${API_BASE_URL}/api/rfp/generate`;

    try {
        const response = await fetchWithTimeout(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                event_id: params.eventId,
                event_name: params.eventName,
                event_type: params.eventType,
                category: params.category,
                guest_count: params.guestCount,
                venue_location: params.venueLocation,
                organizer_name: params.organizerName,
                organizer_email: params.organizerEmail,
                organizer_phone: params.organizerPhone,
                priority: params.priority,
                tone: params.tone,
                timeline: {
                    issue_date: params.timeline.issueDate,
                    questions_deadline: params.timeline.questionsDeadline,
                    submission_deadline: params.timeline.submissionDeadline,
                    evaluation_date: params.timeline.evaluationDate,
                    award_date: params.timeline.awardDate,
                    service_start_date: params.timeline.serviceStartDate,
                    service_end_date: params.timeline.serviceEndDate,
                },
                commercials: {
                    target_budget: params.commercials.targetBudget,
                    budget_ceiling: params.commercials.budgetCeiling,
                    currency: params.commercials.currency,
                    pricing_structure: params.commercials.pricingStructure,
                    payment_terms: params.commercials.paymentTerms,
                    penalty_clause: params.commercials.penaltyClause,
                },
                scope_of_work: params.scopeOfWork,
                deliverables: params.deliverables.map((d) => ({
                    id: d.id,
                    title: d.title,
                    description: d.description,
                    is_mandatory: d.isMandatory,
                })),
                compliance: {
                    business_license: params.compliance.businessLicense,
                    liability_insurance: params.compliance.liabilityInsurance,
                    food_safety_fssai: params.compliance.foodSafetyFssai,
                    past_references_min: params.compliance.pastReferencesMin,
                    nda_required: params.compliance.ndaRequired,
                    tax_compliance_gst: params.compliance.taxComplianceGst,
                },
                evaluation_weights: {
                    cost: params.evaluationWeights.cost,
                    quality_experience: params.evaluationWeights.qualityExperience,
                    deliverable_fit: params.evaluationWeights.deliverableFit,
                    compliance_reliability: params.evaluationWeights.complianceReliability,
                },
                target_vendors: params.targetVendors.map((v) => ({
                    vendor_id: v.vendorId,
                    vendor_name: v.vendorName,
                    category: v.category,
                    email: v.email,
                    tier: v.tier,
                    rating: v.rating,
                })),
                special_terms: params.specialTerms,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                id: data.rfp_id,
                title: data.title || `RFP for ${params.category} - ${params.eventName}`,
                eventId: params.eventId,
                eventName: params.eventName,
                eventType: params.eventType,
                category: params.category,
                status: "ready",
                priority: params.priority,
                tone: params.tone,
                createdAt: data.created_at || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                guestCount: params.guestCount,
                venueLocation: params.venueLocation,
                organizerName: params.organizerName,
                organizerEmail: params.organizerEmail,
                organizerPhone: params.organizerPhone,
                timeline: params.timeline,
                commercials: params.commercials,
                scopeOfWork: params.scopeOfWork,
                deliverables: params.deliverables,
                compliance: params.compliance,
                evaluationWeights: params.evaluationWeights,
                targetVendors: params.targetVendors,
                specialTerms: params.specialTerms,
                generatedMarkdown: data.markdown,
                generatedEmailPitch: data.email_pitch,
                proposalsCount: 0,
            };
        }
    } catch {
        // Fall back gracefully to offline client generation
    }

    return simulateOfflineRfpGeneration(params);
}

/**
 * Offline fallback generator for zero-downtime client-side preview.
 */
function simulateOfflineRfpGeneration(params: GenerateRfpApiParams): RfpRecord {
    const year = new Date().getFullYear();
    const catCode = params.category.substring(0, 3).toUpperCase().replace(/\W/g, "");
    const randomHex = Math.floor(Math.random() * 0xffff)
        .toString(16)
        .toUpperCase()
        .padStart(4, "0");
    const rfpId = `RFP-${year}-${catCode}-${randomHex}`;

    const targetFormatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(params.commercials.targetBudget);

    const ceilingFormatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(params.commercials.budgetCeiling);

    let deliverablesTable = "| # | Deliverable | Description | Requirement |\n|---|---|---|---|\n";
    params.deliverables.forEach((d, idx) => {
        deliverablesTable += `| ${idx + 1} | **${d.title}** | ${d.description} | ${
            d.isMandatory ? "**MANDATORY**" : "Optional"
        } |\n`;
    });

    const markdown = `# REQUEST FOR PROPOSAL (RFP)
## Vendor Procurement Specification

**RFP Reference ID:** \`${rfpId}\`  
**Issue Date:** ${params.timeline.issueDate}  
**Procurement Category:** ${params.category}  
**Event Name:** ${params.eventName}  
**Event Type:** ${params.eventType}  
**Priority:** ${params.priority.toUpperCase()}  

---

### 1. Executive Summary & Objective
The **${params.organizerName}** invites formal, competitive, sealed proposals from qualified service providers for **${params.category} Services** for the upcoming **${params.eventName}** (${params.eventType}).

### 2. Event Operating Environment & Profile
- **Event Title:** ${params.eventName} (${params.eventType})
- **Anticipated Attendance:** ${params.guestCount.toLocaleString()} Guests
- **Venue / Location:** ${params.venueLocation}
- **Service Operational Window:** ${params.timeline.serviceStartDate} to ${params.timeline.serviceEndDate}
- **Procuring Entity:** ${params.organizerName}
- **Primary Contact:** ${params.organizerEmail} | ${params.organizerPhone}

---

### 3. Detailed Scope of Work (SOW)
${params.scopeOfWork}

---

### 4. Mandatory Deliverables & Specifications
${deliverablesTable}

---

### 5. Procurement Budget & Commercial Framework
- **Pricing Structure:** ${params.commercials.pricingStructure.replace(/_/g, " ").toUpperCase()}
- **Target Budget Allocation:** **${targetFormatted}**
- **Maximum Cost Ceiling:** **${ceilingFormatted}** *(Proposals exceeding ceiling will be disqualified)*
- **Payment Milestones:** ${params.commercials.paymentTerms}
- **Late Delivery Penalty:** ${params.commercials.penaltyClause || "Standard 1% delay deduction per hour capped at 10%"}

---

### 6. Vendor Eligibility & Mandatory Compliance Criteria
- Valid Government Business License: **${params.compliance.businessLicense ? "Required" : "Optional"}**
- Commercial General Liability Insurance: **${params.compliance.liabilityInsurance ? "Required (Min ₹50L)" : "Optional"}**
- Food Safety / FSSAI Certification: **${params.compliance.foodSafetyFssai ? "Required" : "Not Applicable"}**
- GST / Tax Compliance Filings: **${params.compliance.taxComplianceGst ? "Required" : "Optional"}**
- Non-Disclosure Agreement (NDA): **${params.compliance.ndaRequired ? "Required" : "Optional"}**
- Client References: Minimum **${params.compliance.pastReferencesMin}** similar scale event references.

---

### 7. Key Procurement Timeline
| Milestone Activity | Due Date |
|---|---|
| **RFP Issuance Date** | ${params.timeline.issueDate} |
| **Vendor Questions & Clarification Cutoff** | ${params.timeline.questionsDeadline} |
| **Final Proposal Submission Deadline** | **${params.timeline.submissionDeadline}** |
| **Proposal Evaluation & Shortlisting** | ${params.timeline.evaluationDate} |
| **Vendor Award & Contract Finalization** | **${params.timeline.awardDate}** |
| **Event Setup & Execution Start** | ${params.timeline.serviceStartDate} |

---

### 8. Evaluation & Selection Scoring Matrix
| Criteria | Weight | Description |
|---|---|---|
| **Commercial Pricing & Cost Competitiveness** | **${params.evaluationWeights.cost}%** | Value for money, itemized transparency |
| **Vendor Track Record & Experience** | **${params.evaluationWeights.qualityExperience}%** | Portfolio depth, past references |
| **Deliverables & Technical Fit** | **${params.evaluationWeights.deliverableFit}%** | Alignment with specified SOW & quality |
| **Compliance, Safety & Reliability** | **${params.evaluationWeights.complianceReliability}%** | Licensing, risk management & insurance |
| **TOTAL** | **100.0%** | Comprehensive evaluation score |

${params.specialTerms ? `\n### 9. Special Provisions & Notes\n${params.specialTerms}\n` : ""}
---

### 10. Submission Guidelines
Submit proposal packages in PDF format to \`${params.organizerEmail}\` with the subject line:  
\`[PROPOSAL] ${rfpId} - ${params.category} - [Company Name]\``;

    const emailPitch = `Subject: RFP Invitation: ${params.category} Services for ${params.eventName} [${rfpId}]

Dear Vendor Partner,

On behalf of ${params.organizerName}, we are pleased to invite your company to submit a formal proposal for ${params.category} Services for our upcoming ${params.eventName} (${params.eventType}).

Event Highlights:
• Event Date(s): ${params.timeline.serviceStartDate} to ${params.timeline.serviceEndDate}
• Venue / Location: ${params.venueLocation}
• Expected Attendees: ${params.guestCount.toLocaleString()} guests
• Allocated Procurement Budget: ${targetFormatted}
• Proposal Submission Deadline: ${params.timeline.submissionDeadline}

Please find attached the complete Request for Proposal (RFP Reference: ${rfpId}) detailing the Scope of Work, deliverables, compliance prerequisites, and evaluation matrix.

Warm regards,
${params.organizerName}
Procurement Committee
Email: ${params.organizerEmail} | Phone: ${params.organizerPhone}`;

    return {
        id: rfpId,
        title: `RFP for ${params.category} - ${params.eventName}`,
        eventId: params.eventId,
        eventName: params.eventName,
        eventType: params.eventType,
        category: params.category,
        status: "ready",
        priority: params.priority,
        tone: params.tone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guestCount: params.guestCount,
        venueLocation: params.venueLocation,
        organizerName: params.organizerName,
        organizerEmail: params.organizerEmail,
        organizerPhone: params.organizerPhone,
        timeline: params.timeline,
        commercials: params.commercials,
        scopeOfWork: params.scopeOfWork,
        deliverables: params.deliverables,
        compliance: params.compliance,
        evaluationWeights: params.evaluationWeights,
        targetVendors: params.targetVendors,
        specialTerms: params.specialTerms,
        generatedMarkdown: markdown,
        generatedEmailPitch: emailPitch,
        proposalsCount: 0,
    };
}

/**
 * Evaluates vendor proposals against an RFP's weighted matrix.
 */
export async function evaluateVendorProposals(
    rfp: RfpRecord,
    proposals: VendorProposal[]
): Promise<VendorProposal[]> {
    const targetUrl = `${API_BASE_URL}/api/rfp/evaluate`;

    try {
        const response = await fetchWithTimeout(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
                rfp_id: rfp.id,
                target_budget: rfp.commercials.targetBudget,
                weights: {
                    cost: rfp.evaluationWeights.cost,
                    quality_experience: rfp.evaluationWeights.qualityExperience,
                    deliverable_fit: rfp.evaluationWeights.deliverableFit,
                    compliance_reliability: rfp.evaluationWeights.complianceReliability,
                },
                proposals: proposals.map((p) => ({
                    vendor_id: p.id,
                    vendor_name: p.vendorName,
                    quoted_price: p.quotedPrice,
                    quality_score: p.qualityScore,
                    deliverable_score: p.deliverableScore,
                    compliance_score: p.complianceScore,
                    notes: p.notes,
                })),
            }),
        });

        if (response.ok) {
            const data: EvaluateProposalsApiResponse = await response.json();
            const rankingMap = new Map(data.rankings.map((r, i) => [r.vendor_id, { ...r, rank: i + 1 }]));

            return proposals.map((p) => {
                const evalData = rankingMap.get(p.id);
                return {
                    ...p,
                    totalScore: evalData ? evalData.total_score : 0,
                    varianceToBudget: evalData ? evalData.variance_to_budget : p.quotedPrice - rfp.commercials.targetBudget,
                    variancePct: evalData ? evalData.variance_pct : 0,
                    isWinner: data.winner?.vendor_id === p.id,
                };
            }).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
        }
    } catch {
        // Fall back to client calculation
    }

    // Client-side weighted scoring
    const quotes = proposals.map((p) => p.quotedPrice).filter((q) => q > 0);
    const minQuote = quotes.length ? Math.min(...quotes) : rfp.commercials.targetBudget;
    const w = rfp.evaluationWeights;

    const evaluated = proposals.map((p) => {
        const costRatio = minQuote / Math.max(1, p.quotedPrice);
        const costScore = Math.min(10, Math.max(1, costRatio * 10));
        const totalScore = Number(
            (
                costScore * (w.cost / 10) +
                p.qualityScore * (w.qualityExperience / 10) +
                p.deliverableScore * (w.deliverableFit / 10) +
                p.complianceScore * (w.complianceReliability / 10)
            ).toFixed(2)
        );

        const variance = p.quotedPrice - rfp.commercials.targetBudget;
        const variancePct = Number(((variance / rfp.commercials.targetBudget) * 100).toFixed(1));

        return {
            ...p,
            totalScore,
            varianceToBudget: variance,
            variancePct,
        };
    });

    evaluated.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    if (evaluated.length > 0) {
        evaluated[0].isWinner = true;
    }
    return evaluated;
}
