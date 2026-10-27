export type RfpCategory =
    | "Catering"
    | "Audio / Visual & Lighting"
    | "Venue"
    | "Photography & Videography"
    | "Decor & Floral"
    | "Entertainment / DJ"
    | "Staffing & Security"
    | "Logistics & Transport"
    | "Other Services";

export type RfpStatus = "draft" | "ready" | "issued" | "evaluating" | "awarded" | "cancelled";

export type RfpPriority = "standard" | "urgent" | "high_value";

export type RfpTone = "formal" | "executive" | "concise" | "creative";

export type PricingStructure =
    | "fixed_lump_sum"
    | "per_person"
    | "itemized"
    | "milestone_capped";

export interface DeliverableItem {
    id: string;
    title: string;
    description: string;
    isMandatory: boolean;
}

export interface RfpTimeline {
    issueDate: string;
    questionsDeadline: string;
    submissionDeadline: string;
    evaluationDate: string;
    awardDate: string;
    serviceStartDate: string;
    serviceEndDate: string;
}

export interface RfpCommercials {
    targetBudget: number;
    budgetCeiling: number;
    currency: "INR" | "USD";
    pricingStructure: PricingStructure;
    paymentTerms: string;
    penaltyClause: string;
}

export interface RfpCompliance {
    businessLicense: boolean;
    liabilityInsurance: boolean;
    foodSafetyFssai: boolean;
    pastReferencesMin: number;
    ndaRequired: boolean;
    taxComplianceGst: boolean;
}

export interface RfpEvaluationWeights {
    cost: number;
    qualityExperience: number;
    deliverableFit: number;
    complianceReliability: number;
}

export interface TargetVendor {
    vendorId: string;
    vendorName: string;
    category: string;
    email?: string;
    tier?: string;
    rating?: number;
}

export interface RfpRecord {
    id: string;
    title: string;
    eventId?: string;
    eventName: string;
    eventType: string;
    category: RfpCategory;
    status: RfpStatus;
    priority: RfpPriority;
    tone: RfpTone;
    createdAt: string;
    updatedAt: string;
    guestCount: number;
    venueLocation: string;
    organizerName: string;
    organizerEmail: string;
    organizerPhone: string;
    timeline: RfpTimeline;
    commercials: RfpCommercials;
    scopeOfWork: string;
    deliverables: DeliverableItem[];
    compliance: RfpCompliance;
    evaluationWeights: RfpEvaluationWeights;
    targetVendors: TargetVendor[];
    specialTerms?: string;
    generatedMarkdown: string;
    generatedEmailPitch: string;
    proposalsCount?: number;
}

export interface VendorProposal {
    id: string;
    rfpId: string;
    vendorName: string;
    quotedPrice: number;
    qualityScore: number;       // 1 - 10
    deliverableScore: number;   // 1 - 10
    complianceScore: number;    // 1 - 10
    submittedAt: string;
    notes?: string;
    totalScore?: number;
    varianceToBudget?: number;
    variancePct?: number;
    isWinner?: boolean;
}

export interface RfpCategoryTemplate {
    category: RfpCategory;
    title: string;
    scopeOfWork: string;
    deliverables: Array<{title: string; description: string; isMandatory: boolean}>;
    compliance: RfpCompliance;
    paymentTerms: string;
    suggestedWeights: RfpEvaluationWeights;
}
