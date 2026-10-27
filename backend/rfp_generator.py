"""
RFP (Request for Proposal) Generator & Evaluation Service
Handles structured RFP generation, procurement templates, and proposal scoring
for Event Vendor Procurement in the Document Tab.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import datetime
import uuid


class DeliverableItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str
    description: str
    is_mandatory: bool = True


class RfpTimeline(BaseModel):
    issue_date: str
    questions_deadline: str
    submission_deadline: str
    evaluation_date: str
    award_date: str
    service_start_date: str
    service_end_date: str


class RfpCommercials(BaseModel):
    target_budget: float
    budget_ceiling: float
    currency: str = "INR"
    pricing_structure: str = "fixed_lump_sum"  # fixed_lump_sum, per_person, itemized, milestone_capped
    payment_terms: str = "30% advance on contract signing, 40% milestone upon delivery verification, 30% post-event settlement"
    penalty_clause: Optional[str] = "1% deduction per hour of unauthorized delay, capped at 10% of total contract value"


class RfpCompliance(BaseModel):
    business_license: bool = True
    liability_insurance: bool = True
    food_safety_fssai: bool = False
    past_references_min: int = 3
    nda_required: bool = True
    tax_compliance_gst: bool = True


class RfpEvaluationWeights(BaseModel):
    cost: float = 30.0
    quality_experience: float = 25.0
    deliverable_fit: float = 25.0
    compliance_reliability: float = 20.0


class TargetVendor(BaseModel):
    vendor_id: Optional[str] = None
    vendor_name: str
    category: str
    email: Optional[str] = None
    tier: Optional[str] = "Moderate"
    rating: Optional[float] = 4.5


class GenerateRfpRequest(BaseModel):
    event_id: Optional[str] = None
    event_name: str
    event_type: str
    category: str
    guest_count: int
    venue_location: str
    organizer_name: str = "EventMind Procurement Committee"
    organizer_email: str = "procurement@eventmind.ai"
    organizer_phone: str = "+91 98765 43210"
    priority: str = "standard"  # standard, urgent, high_value
    tone: str = "formal"  # formal, executive, concise, creative
    timeline: RfpTimeline
    commercials: RfpCommercials
    scope_of_work: str
    deliverables: List[DeliverableItem] = []
    compliance: RfpCompliance = Field(default_factory=RfpCompliance)
    evaluation_weights: RfpEvaluationWeights = Field(default_factory=RfpEvaluationWeights)
    target_vendors: List[TargetVendor] = []
    special_terms: Optional[str] = None


class ProposalItem(BaseModel):
    vendor_id: str
    vendor_name: str
    quoted_price: float
    quality_score: float = Field(..., ge=1, le=10, description="Score 1-10 on portfolio & experience")
    deliverable_score: float = Field(..., ge=1, le=10, description="Score 1-10 on meeting specifications")
    compliance_score: float = Field(..., ge=1, le=10, description="Score 1-10 on insurance, licensing & past references")
    notes: Optional[str] = None


class EvaluateProposalsRequest(BaseModel):
    rfp_id: str
    target_budget: float
    weights: RfpEvaluationWeights
    proposals: List[ProposalItem]


# Predefined Procurement Category Templates
PROCUREMENT_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "Catering": {
        "title": "Full-Service Event Catering & Hospitality Procurement",
        "scope_of_work": (
            "The selected Catering Partner will design, prepare, deliver, and manage a complete multi-course culinary experience "
            "for the designated attendees. This includes pre-event tasting sessions, on-site live food stations, banquet buffet service, "
            "beverage and welcome mocktail counters, professional service waitstaff (1 server per 15 guests), premium chinaware/cutlery, "
            "and comprehensive kitchen safety and post-event waste management in compliance with local food safety regulations."
        ),
        "deliverables": [
            {"title": "Curated Multi-Cuisine Menu", "description": "3 appetizers, 4 main courses, 3 desserts, breads & rice specialties, with vegan/Jain/gluten-free clearly marked.", "is_mandatory": True},
            {"title": "Complimentary Menu Tasting", "description": "Tasting session for up to 4 committee members at least 3 weeks prior to event execution.", "is_mandatory": True},
            {"title": "Uniformed Waitstaff & Stewards", "description": "Trained, groomed hospitality personnel equipped with standard uniforms and name tags.", "is_mandatory": True},
            {"title": "Beverage & Mocktail Station", "description": "Live artisan mocktail counter with glassware, ice replenishment, and baristas.", "is_mandatory": True},
            {"title": "Kitchen Equipment & Waste Clearance", "description": "Complete setup of chafing dishes, warmers, sanitization station, and zero-waste composting disposal.", "is_mandatory": True},
        ],
        "compliance": {
            "business_license": True,
            "liability_insurance": True,
            "food_safety_fssai": True,
            "past_references_min": 3,
            "nda_required": False,
            "tax_compliance_gst": True
        },
        "payment_terms": "25% advance on contract execution, 50% upon menu finalization (14 days prior), 25% post-event sign-off."
    },
    "Audio / Visual & Lighting": {
        "title": "Comprehensive Audio, Stage Lighting & LED Display System Procurement",
        "scope_of_work": (
            "Provide end-to-end audiovisual engineering, intelligent stage lighting, visual displays, and on-site technical direction. "
            "The vendor is responsible for equipment transport, rigging, acoustic tuning, stage wiring, digital wireless audio channels, "
            "uninterrupted dual-power backups, video switcher operations, and live sound engineering from preliminary rehearsal through final event strike."
        ),
        "deliverables": [
            {"title": "Acoustic Line-Array Sound System", "description": "Concert-grade line array speaker system matched to venue acoustics, with digital delay fills and subwoofers.", "is_mandatory": True},
            {"title": "High-Definition LED Video Wall", "description": "Ultra-fine pitch (P2.6 or better) LED display wall with seamless digital video matrix switcher for presentations and video playouts.", "is_mandatory": True},
            {"title": "Intelligent Moving-Head Stage Lighting", "description": "DMX-controlled automated beam/wash fixtures, stage key lighting, trussing, and atmospheric haze generation.", "is_mandatory": True},
            {"title": "Digital Wireless Microphones", "description": "Min 6 wireless handheld and 4 lapel microphones with multi-channel frequency coordination and backup batteries.", "is_mandatory": True},
            {"title": "Dedicated Technical Crew & Silent Generator", "description": "Lead sound engineer, lighting programmer, video technician, and 100% standby silent diesel generator.", "is_mandatory": True},
        ],
        "compliance": {
            "business_license": True,
            "liability_insurance": True,
            "food_safety_fssai": False,
            "past_references_min": 3,
            "nda_required": True,
            "tax_compliance_gst": True
        },
        "payment_terms": "30% mobilization advance, 40% on equipment load-in and soundcheck pass, 30% upon post-event strike completion."
    },
    "Venue": {
        "title": "Event Venue & Hospitality Space Procurement",
        "scope_of_work": (
            "Provide premium licensed venue premises accommodating the specified attendee capacity with banquet/theater layout options. "
            "Includes climate-controlled banquet halls, breakout meeting rooms, dedicated VIP green rooms, commercial prep kitchen access, "
            "adequate restroom facilities, dedicated parking infrastructure with valet logistics, loading dock access, and on-site facility engineering."
        ),
        "deliverables": [
            {"title": "Primary Event Hall Access", "description": "Exclusive access to main hall from 8:00 AM for stage setup through 11:30 PM teardown.", "is_mandatory": True},
            {"title": "Climate Control & Facility Engineering", "description": "Central HVAC maintained at 21-23°C throughout event hours, with backup power transfer switch.", "is_mandatory": True},
            {"title": "VIP Green Rooms & Production Office", "description": "Two furnished private breakout rooms with en-suite restrooms, mirrors, and secure keycard lock.", "is_mandatory": True},
            {"title": "Valet Parking & Traffic Marshals", "description": "Dedicated parking for min 100 vehicles with 4 valet drivers and traffic marshaling staff.", "is_mandatory": True},
            {"title": "Janitorial & Continuous Housekeeping", "description": "Dedicated housekeeping staff for continuous restroom hygiene and lobby cleanliness.", "is_mandatory": True},
        ],
        "compliance": {
            "business_license": True,
            "liability_insurance": True,
            "food_safety_fssai": False,
            "past_references_min": 3,
            "nda_required": False,
            "tax_compliance_gst": True
        },
        "payment_terms": "40% booking deposit upon agreement, 40% 30 days prior to event, 20% security deposit release post-event."
    },
    "Photography & Videography": {
        "title": "Cinematic Media Production, Photography & Drone Filming Procurement",
        "scope_of_work": (
            "Capture the entirety of the event with professional multi-camera cinematic filming, candid and documentary-style photography, "
            "aerial drone coverage (pending permissions), same-day social media reel editing, high-resolution post-production color grading, "
            "and delivery of all raw and edited master digital assets with full worldwide commercial ownership rights."
        ),
        "deliverables": [
            {"title": "Multi-Camera Production Crew", "description": "2 Senior Candid Photographers + 2 Cinematic Videographers equipped with full-frame 4K cameras and stabilization gimbals.", "is_mandatory": True},
            {"title": "Same-Day Social Media Highlight Teaser", "description": "60-second vertical 9:16 and 16:9 cinematic reel delivered within 4 hours of event conclusion.", "is_mandatory": True},
            {"title": "Cinematic Event Feature Film", "description": "4-6 minute master cinematic film set to licensed audio soundtrack, delivered in 4K UHD.", "is_mandatory": True},
            {"title": "Curated Digital Photo Gallery", "description": "Min 350 color-graded, high-resolution photos delivered in an online client gallery within 14 business days.", "is_mandatory": True},
            {"title": "Full Copyright Assignment & Raw Footage", "description": "Delivery of all unedited raw footage and full perpetual non-exclusive commercial release.", "is_mandatory": True},
        ],
        "compliance": {
            "business_license": True,
            "liability_insurance": True,
            "food_safety_fssai": False,
            "past_references_min": 3,
            "nda_required": True,
            "tax_compliance_gst": True
        },
        "payment_terms": "30% upon contract signing, 40% upon completion of shoot day, 30% upon final delivery and approval of all graded assets."
    },
    "Decor & Floral": {
        "title": "Thematic Event Decor, Floral Architecture & Ambience Styling Procurement",
        "scope_of_work": (
            "Conceptualize, fabricate, install, and strike custom bespoke event decor, stage architectural backdrops, entrance statement arches, "
            "floral centerpieces, ambient lighting installations, photo opportunity backdrops, and table scape styling tailored to the event theme."
        ),
        "deliverables": [
            {"title": "Grand Entrance Feature Arch", "description": "Bespoke structural entrance arch adorned with fresh premium imported flowers and integrated warm lighting.", "is_mandatory": True},
            {"title": "Architectural Stage Backdrop & Podiums", "description": "Customized stage backdrop, lecterns, and modular branded staging according to approved 3D design renders.", "is_mandatory": True},
            {"title": "Table Scapes & Guest Centerpieces", "description": "Coordinated centerpieces, runner accents, charger plates, and ambient LED candle arrangements for all tables.", "is_mandatory": True},
            {"title": "Interactive Photo Op & Media Wall", "description": "Custom 10x8 ft 3D photo backdrop featuring event monogram, floral accents, and flattering lighting.", "is_mandatory": True},
            {"title": "Complete Strike & Eco-Friendly Cleanup", "description": "Post-event disassembly within 2 hours, with floral repurposing/composting commitment.", "is_mandatory": True},
        ],
        "compliance": {
            "business_license": True,
            "liability_insurance": True,
            "food_safety_fssai": False,
            "past_references_min": 2,
            "nda_required": False,
            "tax_compliance_gst": True
        },
        "payment_terms": "40% advance for raw material procurement, 35% on mockup/render approval, 25% post-installation sign-off."
    },
    "Entertainment / DJ": {
        "title": "Live Entertainment, Artist Booking & DJ Performance Procurement",
        "scope_of_work": (
            "Provide professional musical entertainment, headline performers, or resident DJ services to entertain guests across event segments. "
            "Vendor must coordinate rider requirements, setlists, guest interaction, and sync with sound engineering staff."
        ),
        "deliverables": [
            {"title": "Curated Musical Performance", "description": "Live musical performance sets totaling 90 minutes, matching the client-approved genre and theme.", "is_mandatory": True},
            {"title": "DJ & Dancefloor Party Set", "description": "High-energy open-format DJ set for up to 3 hours with active crowd engagement.", "is_mandatory": True},
            {"title": "Professional Emcee / Host Coordination", "description": "Bilingual event host to guide timeline, introduce keynotes, and drive audience participation.", "is_mandatory": True},
            {"title": "Technical Sound Check", "description": "Artist sound check completed 90 minutes prior to guest arrival with sound engineer.", "is_mandatory": True},
        ],
        "compliance": {
            "business_license": True,
            "liability_insurance": False,
            "food_safety_fssai": False,
            "past_references_min": 2,
            "nda_required": False,
            "tax_compliance_gst": True
        },
        "payment_terms": "50% advance booking fee, 50% immediately prior to stage performance."
    },
    "Staffing & Security": {
        "title": "Event Staffing, Hospitality Ushers & Crowd Safety Security Procurement",
        "scope_of_work": (
            "Deploy vetted, trained, and uniformed event personnel including security officers, crowd control marshals, registration ushers, "
            "VIP escorts, and certified first-aid responders to maintain a safe, welcoming, and orderly environment."
        ),
        "deliverables": [
            {"title": "Licensed Security Personnel", "description": "Vetted security guards stationed at entry turnstiles, emergency exits, and backstage zones.", "is_mandatory": True},
            {"title": "Hospitality Ushers & Check-In Hosts", "description": "Professional ushers managing attendee badging, QR code check-in, and seat guiding.", "is_mandatory": True},
            {"title": "First-Aid Responder & Safety Station", "description": "Certified paramedic on-site with emergency medical kit, burn dressings, and AED unit.", "is_mandatory": True},
            {"title": "Briefing & Operational Supervisor", "description": "Dedicated on-site supervisor conducting pre-event security briefing and liaison with authorities.", "is_mandatory": True},
        ],
        "compliance": {
            "business_license": True,
            "liability_insurance": True,
            "food_safety_fssai": False,
            "past_references_min": 3,
            "nda_required": True,
            "tax_compliance_gst": True
        },
        "payment_terms": "30% booking advance, 70% post-event verification of shift attendance."
    }
}


def build_rfp_markdown(
    rfp_id: str,
    req: GenerateRfpRequest
) -> str:
    """Builds a formal, comprehensive Request for Proposal markdown document."""

    # Format numbers
    target_budget_str = f"₹{req.commercials.target_budget:,.2f}" if req.commercials.currency == "INR" else f"${req.commercials.target_budget:,.2f}"
    ceiling_budget_str = f"₹{req.commercials.budget_ceiling:,.2f}" if req.commercials.currency == "INR" else f"${req.commercials.budget_ceiling:,.2f}"

    pricing_name = {
        "fixed_lump_sum": "Fixed All-Inclusive Lump-Sum Contract",
        "per_person": "Fixed Per-Attendee / Per-Cover Variable Rate",
        "itemized": "Itemized Deliverable Unit-Rate Schedule",
        "milestone_capped": "Milestone-Capped Not-to-Exceed Commercial Agreement"
    }.get(req.commercials.pricing_structure, "Fixed Lump-Sum")

    # Tone adjustments
    intro_statement = {
        "formal": (
            f"The **{req.organizer_name}** invites formal, competitive, sealed proposals from established and licensed "
            f"service providers for **{req.category} Services** for the upcoming **{req.event_name}** ({req.event_type}). "
            f"Prospective vendors must review all requirements, deliverables, and terms detailed in this document."
        ),
        "executive": (
            f"On behalf of **{req.event_name}**, the executive procurement team is requesting proposals from world-class "
            f"partners in **{req.category}**. We seek an exceptional vendor committed to operational excellence, "
            f"meticulous presentation, and seamless execution for {req.guest_count} distinguished guests."
        ),
        "concise": (
            f"Request for Proposal (RFP) for **{req.category}** for **{req.event_name}**. "
            f"Submission deadline: **{req.timeline.submission_deadline}**. All bids must include an itemized breakdown "
            f"and proof of insurance within the budgetary ceiling of {ceiling_budget_str}."
        ),
        "creative": (
            f"We are curating an extraordinary experience for **{req.event_name}** and are seeking an imaginative, "
            f"high-craft partner in **{req.category}** to bring our creative vision to life. If your team possesses "
            f"distinguished artistry and flawless reliability, we invite you to submit your proposal."
        )
    }.get(req.tone, f"Request for Proposal for {req.category} Services for {req.event_name}.")

    # Build deliverables checklist table
    deliverables_table = "| # | Deliverable | Description | Requirement |\n|---|---|---|---|\n"
    for i, d in enumerate(req.deliverables, start=1):
        req_badge = "**MANDATORY**" if d.is_mandatory else "Optional / Preferred"
        deliverables_table += f"| {i} | **{d.title}** | {d.description} | {req_badge} |\n"

    # Build compliance table
    compliance_items = [
        ("Valid Government Business License / Incorporation", "Required" if req.compliance.business_license else "Optional"),
        ("Commercial General Liability Insurance (min ₹50,00,000 / $1,000,000)", "Required" if req.compliance.liability_insurance else "Optional"),
        ("Food Safety Certification / FSSAI License", "Required" if req.compliance.food_safety_fssai else "Not Applicable"),
        ("GST / Tax Registration & Filings Certificate", "Required" if req.compliance.tax_compliance_gst else "Optional"),
        ("Non-Disclosure & Confidentiality Agreement (NDA)", "Required" if req.compliance.nda_required else "Optional"),
        (f"Past Client References (Minimum {req.compliance.past_references_min} similar scale events)", "Required"),
    ]
    compliance_table = "| Requirement | Status |\n|---|---|\n"
    for title, status_text in compliance_items:
        compliance_table += f"| {title} | {status_text} |\n"

    # Evaluation weight breakdown
    w = req.evaluation_weights
    eval_table = (
        f"| Criteria | Weight | Description |\n"
        f"|---|---|---|\n"
        f"| **Commercial Pricing & Cost Competitiveness** | **{w.cost:.1f}%** | Reasonableness of fees, transparent itemization, cost certainty |\n"
        f"| **Vendor Track Record & Experience** | **{w.quality_experience:.1f}%** | Portfolio depth, client testimonials, team seniority |\n"
        f"| **Deliverables & Technical Fit** | **{w.deliverable_fit:.1f}%** | Alignment with specified SOW, equipment quality, creative ingenuity |\n"
        f"| **Compliance, Safety & Insurance** | **{w.compliance_reliability:.1f}%** | Licensing, risk management protocols, financial stability |\n"
        f"| **TOTAL** | **100.0%** | Comprehensive evaluation score |\n"
    )

    # Target vendors section
    target_vendors_text = ""
    if req.target_vendors:
        target_vendors_text = "\n### Targeted Prospective Vendors\nThis RFP has been directly dispatched to the following invited bidders:\n"
        for tv in req.target_vendors:
            target_vendors_text += f"- **{tv.vendor_name}** ({tv.category}) — Tier: {tv.tier} | Rating: ★ {tv.rating}\n"

    special_terms_text = f"\n### 8. Special Provisions & Notes\n{req.special_terms}\n" if req.special_terms else ""

    doc = f"""# REQUEST FOR PROPOSAL (RFP)
## Vendor Procurement Specification

**RFP Reference ID:** `{rfp_id}`  
**Issue Date:** {req.timeline.issue_date}  
**Procurement Category:** {req.category}  
**Event Name:** {req.event_name}  
**Event Type:** {req.event_type}  
**Priority:** {req.priority.upper()}  

---

### 1. Executive Summary & Objective
{intro_statement}

The designated vendor will act as a primary procurement partner for the **{req.event_name}**, ensuring top-tier service standards, punctual delivery, and seamless integration with the event production committee.

---

### 2. Event Operating Environment & Profile
- **Event Title:** {req.event_name}
- **Event Category:** {req.event_type}
- **Anticipated Attendance:** {req.guest_count:,} Guests
- **Venue / Location:** {req.venue_location}
- **Service Operational Window:** {req.timeline.service_start_date} to {req.timeline.service_end_date}
- **Procuring Entity:** {req.organizer_name}
- **Primary Contact:** {req.organizer_email} | {req.organizer_phone}

---

### 3. Detailed Scope of Work (SOW)
{req.scope_of_work}

---

### 4. Mandatory Deliverables & Specifications
The successful respondent must guarantee provision of each specified item below:

{deliverables_table}

---

### 5. Procurement Budget & Commercial Framework
- **Pricing Model:** {pricing_name}
- **Target Budget Allocation:** **{target_budget_str}**
- **Maximum Cost Ceiling:** **{ceiling_budget_str}** *(Proposals exceeding ceiling will be disqualified)*
- **Standard Payment Milestones:**
  > {req.commercials.payment_terms}
- **Late Delivery & SLA Penalty:**
  > {req.commercials.penalty_clause or "Standard 1% per hour delay penalty capped at 10%"}

---

### 6. Vendor Eligibility, Compliance & Safety Criteria
Vendors must provide valid verification for each of the following mandatory conditions:

{compliance_table}

---

### 7. Procurement Schedule & Deadlines
All participants must adhere strictly to the procurement timeline below:

| Milestone Activity | Due Date / Target |
|---|---|
| **RFP Issuance Date** | {req.timeline.issue_date} |
| **Vendor Questions & Clarification Cutoff** | {req.timeline.questions_deadline} |
| **Final Proposal Submission Deadline** | **{req.timeline.submission_deadline}** |
| **Proposal Evaluation & Shortlisting** | {req.timeline.evaluation_date} |
| **Vendor Award & Contract Finalization** | **{req.timeline.award_date}** |
| **Event Setup & Execution Start** | {req.timeline.service_start_date} |

---

### 8. Evaluation & Selection Scoring Matrix
Proposals will be objectively scored according to the weighted matrix below:

{eval_table}
{target_vendors_text}{special_terms_text}
---

### 9. Proposal Submission Guidelines
Interested vendors must submit a digital proposal package in PDF format containing:
1. **Executive Profile & Capability Statement**: Company overview, leadership, and relevant credentials.
2. **Technical Approach & Work Plan**: Detailed breakdown addressing each deliverable in Section 4.
3. **Itemized Commercial Bid**: Unit pricing, taxes, labor, and optional value-added services.
4. **Certificates of Insurance & Licenses**: Active general liability policy and trade licenses.
5. **Client References**: 3 recent reference contacts from similar scale productions.

**Submission Destination:** Submit via email to `{req.organizer_email}` with the subject line:  
`[PROPOSAL] {rfp_id} - {req.category} - [Your Company Name]`

---

### 10. Authorization & Terms Acceptance
*Issued by the Procurement Directorate of {req.organizer_name}.*  
*For questions or site-inspection appointments, contact {req.organizer_email}.*
"""
    return doc.strip()


def build_email_pitch(rfp_id: str, req: GenerateRfpRequest) -> str:
    """Generates a professional outreach email template to prospective vendors."""
    target_budget_str = f"₹{req.commercials.target_budget:,.2f}" if req.commercials.currency == "INR" else f"${req.commercials.target_budget:,.2f}"

    return (
        f"Subject: RFP Invitation: {req.category} Services for {req.event_name} [{rfp_id}]\n\n"
        f"Dear Vendor Partner,\n\n"
        f"On behalf of {req.organizer_name}, we are pleased to invite your company to submit a formal "
        f"proposal for {req.category} Services for our upcoming {req.event_name} ({req.event_type}).\n\n"
        f"Event Highlights:\n"
        f"• Event Date(s): {req.timeline.service_start_date} to {req.timeline.service_end_date}\n"
        f"• Venue / Location: {req.venue_location}\n"
        f"• Expected Attendees: {req.guest_count:,} guests\n"
        f"• Allocated Procurement Budget: {target_budget_str}\n"
        f"• Proposal Submission Deadline: {req.timeline.submission_deadline}\n\n"
        f"Please find attached the complete Request for Proposal (RFP Reference: {rfp_id}) detailing the "
        f"Scope of Work, deliverables, compliance prerequisites, and evaluation matrix.\n\n"
        f"Should you have any technical questions, the deadline for inquiries is {req.timeline.questions_deadline}. "
        f"We look forward to receiving your competitive proposal.\n\n"
        f"Warm regards,\n\n"
        f"{req.organizer_name}\n"
        f"Procurement Committee\n"
        f"Email: {req.organizer_email} | Phone: {req.organizer_phone}\n"
    )


def evaluate_vendor_proposals(req: EvaluateProposalsRequest) -> Dict[str, Any]:
    """
    Evaluates vendor proposals using multi-criteria weighted scoring against the RFP's weights.
    Cost score is computed inversely relative to lowest quoted price and target budget.
    """
    if not req.proposals:
        return {"rankings": [], "winner": None, "total_proposals": 0}

    # Find minimum quote for cost normalization
    quotes = [p.quoted_price for p in req.proposals if p.quoted_price > 0]
    min_quote = min(quotes) if quotes else req.target_budget

    scored_proposals = []
    w = req.weights

    for p in req.proposals:
        # Cost score: 10 if equal or below min_quote, decreases proportionally if higher
        cost_ratio = min_quote / max(1.0, p.quoted_price)
        cost_score = min(10.0, max(1.0, cost_ratio * 10.0))

        # Weighted aggregate score out of 100
        # Weights are percentages (e.g. 30, 25, 25, 20)
        total_score = (
            (cost_score * (w.cost / 10.0)) +
            (p.quality_score * (w.quality_experience / 10.0)) +
            (p.deliverable_score * (w.deliverable_fit / 10.0)) +
            (p.compliance_score * (w.compliance_reliability / 10.0))
        )

        variance_to_budget = p.quoted_price - req.target_budget
        variance_pct = round((variance_to_budget / req.target_budget) * 100, 1)

        scored_proposals.append({
            "vendor_id": p.vendor_id,
            "vendor_name": p.vendor_name,
            "quoted_price": p.quoted_price,
            "variance_to_budget": round(variance_to_budget, 2),
            "variance_pct": variance_pct,
            "cost_score": round(cost_score, 1),
            "quality_score": p.quality_score,
            "deliverable_score": p.deliverable_score,
            "compliance_score": p.compliance_score,
            "total_score": round(total_score, 2),
            "notes": p.notes or "",
        })

    # Sort descending by total score
    scored_proposals.sort(key=lambda x: x["total_score"], reverse=True)

    winner = scored_proposals[0] if scored_proposals else None

    return {
        "rfp_id": req.rfp_id,
        "total_proposals": len(scored_proposals),
        "target_budget": req.target_budget,
        "winner": winner,
        "rankings": scored_proposals
    }
