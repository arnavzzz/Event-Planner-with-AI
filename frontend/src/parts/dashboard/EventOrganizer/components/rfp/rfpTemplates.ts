import type {
    RfpCategory,
    RfpCategoryTemplate,
    RfpRecord,
    VendorProposal,
} from "./rfpTypes.ts";

export const CATEGORY_TEMPLATES: Record<RfpCategory, RfpCategoryTemplate> = {
    "Catering": {
        category: "Catering",
        title: "Full-Service Event Catering & Hospitality Procurement",
        scopeOfWork:
            "The selected Catering Partner will design, prepare, deliver, and manage a complete multi-course culinary experience for the designated attendees. This includes pre-event tasting sessions, on-site live food stations, banquet buffet service, beverage and welcome mocktail counters, professional service waitstaff (1 server per 15 guests), premium chinaware/cutlery, and comprehensive kitchen safety and post-event waste management in compliance with local food safety regulations.",
        deliverables: [
            {
                title: "Curated Multi-Cuisine Menu",
                description: "3 appetizers, 4 main courses, 3 desserts, breads & rice specialties, with vegan/Jain/gluten-free clearly marked.",
                isMandatory: true,
            },
            {
                title: "Complimentary Menu Tasting",
                description: "Tasting session for up to 4 committee members at least 3 weeks prior to event execution.",
                isMandatory: true,
            },
            {
                title: "Uniformed Waitstaff & Stewards",
                description: "Trained, groomed hospitality personnel equipped with standard uniforms, white gloves, and name tags.",
                isMandatory: true,
            },
            {
                title: "Artisan Beverage & Mocktail Counter",
                description: "Live mocktail mixology counter with fresh ingredients, crystal glassware, and ice replenishment.",
                isMandatory: true,
            },
            {
                title: "Kitchen Sanitation & Waste Recycling",
                description: "Complete setup of stainless steel warmers, prep hygiene stations, and zero-waste composting protocol.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: true,
            foodSafetyFssai: true,
            pastReferencesMin: 3,
            ndaRequired: false,
            taxComplianceGst: true,
        },
        paymentTerms: "25% advance on contract execution, 50% upon menu finalization (14 days prior), 25% post-event sign-off.",
        suggestedWeights: {
            cost: 30,
            qualityExperience: 30,
            deliverableFit: 25,
            complianceReliability: 15,
        },
    },
    "Audio / Visual & Lighting": {
        category: "Audio / Visual & Lighting",
        title: "Comprehensive Audio, Stage Lighting & LED Display System Procurement",
        scopeOfWork:
            "Provide end-to-end audiovisual engineering, intelligent stage lighting, visual displays, and on-site technical direction. The vendor is responsible for equipment transport, rigging, acoustic tuning, stage wiring, digital wireless audio channels, uninterrupted dual-power backups, video switcher operations, and live sound engineering from preliminary rehearsal through final event strike.",
        deliverables: [
            {
                title: "Acoustic Line-Array Sound System",
                description: "Concert-grade line array speaker system matched to venue acoustics, with digital delay fills and subwoofers.",
                isMandatory: true,
            },
            {
                title: "High-Definition LED Video Wall",
                description: "Ultra-fine pitch (P2.6 or better) LED display wall with seamless digital video matrix switcher for keynote presentations.",
                isMandatory: true,
            },
            {
                title: "Intelligent Moving-Head Stage Lighting",
                description: "DMX-controlled automated beam/wash fixtures, stage key lighting, trussing, and atmospheric haze generation.",
                isMandatory: true,
            },
            {
                title: "Digital Wireless Microphones",
                description: "Min 6 wireless handheld and 4 lapel microphones with multi-channel frequency coordination and backup batteries.",
                isMandatory: true,
            },
            {
                title: "Dedicated Technical Crew & Silent Generator",
                description: "Lead sound engineer, lighting programmer, video technician, and 100% standby silent diesel generator.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: true,
            foodSafetyFssai: false,
            pastReferencesMin: 3,
            ndaRequired: true,
            taxComplianceGst: true,
        },
        paymentTerms: "30% mobilization advance, 40% on equipment load-in and soundcheck pass, 30% upon post-event strike completion.",
        suggestedWeights: {
            cost: 25,
            qualityExperience: 25,
            deliverableFit: 30,
            complianceReliability: 20,
        },
    },
    "Venue": {
        category: "Venue",
        title: "Event Venue & Hospitality Space Procurement",
        scopeOfWork:
            "Provide premium licensed venue premises accommodating the specified attendee capacity with banquet/theater layout options. Includes climate-controlled banquet halls, breakout meeting rooms, dedicated VIP green rooms, commercial prep kitchen access, adequate restroom facilities, dedicated parking infrastructure with valet logistics, loading dock access, and on-site facility engineering.",
        deliverables: [
            {
                title: "Primary Event Hall Access",
                description: "Exclusive access to main hall from 8:00 AM for stage setup through 11:30 PM teardown.",
                isMandatory: true,
            },
            {
                title: "Climate Control & Facility Engineering",
                description: "Central HVAC maintained at 21-23°C throughout event hours, with backup power transfer switch.",
                isMandatory: true,
            },
            {
                title: "VIP Green Rooms & Production Office",
                description: "Two furnished private breakout rooms with en-suite restrooms, vanity mirrors, and secure keycard locks.",
                isMandatory: true,
            },
            {
                title: "Valet Parking & Traffic Marshals",
                description: "Dedicated parking for min 100 vehicles with 4 valet drivers and traffic marshaling staff.",
                isMandatory: true,
            },
            {
                title: "Janitorial & Continuous Housekeeping",
                description: "Dedicated housekeeping staff for continuous restroom hygiene and lobby cleanliness.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: true,
            foodSafetyFssai: false,
            pastReferencesMin: 3,
            ndaRequired: false,
            taxComplianceGst: true,
        },
        paymentTerms: "40% booking deposit upon agreement, 40% 30 days prior to event, 20% security deposit release post-event.",
        suggestedWeights: {
            cost: 30,
            qualityExperience: 25,
            deliverableFit: 25,
            complianceReliability: 20,
        },
    },
    "Photography & Videography": {
        category: "Photography & Videography",
        title: "Cinematic Media Production, Photography & Drone Filming Procurement",
        scopeOfWork:
            "Capture the entirety of the event with professional multi-camera cinematic filming, candid and documentary-style photography, aerial drone coverage (pending permissions), same-day social media reel editing, high-resolution post-production color grading, and delivery of all raw and edited master digital assets with full worldwide commercial ownership rights.",
        deliverables: [
            {
                title: "Multi-Camera Production Crew",
                description: "2 Senior Candid Photographers + 2 Cinematic Videographers equipped with full-frame 4K cameras and stabilization gimbals.",
                isMandatory: true,
            },
            {
                title: "Same-Day Social Media Highlight Teaser",
                description: "60-second vertical 9:16 and 16:9 cinematic reel delivered within 4 hours of event conclusion.",
                isMandatory: true,
            },
            {
                title: "Cinematic Event Feature Film",
                description: "4-6 minute master cinematic film set to licensed audio soundtrack, delivered in 4K UHD.",
                isMandatory: true,
            },
            {
                title: "Curated Digital Photo Gallery",
                description: "Min 350 color-graded, high-resolution photos delivered in an online client gallery within 14 business days.",
                isMandatory: true,
            },
            {
                title: "Full Copyright Assignment & Raw Footage",
                description: "Delivery of all unedited raw footage and full perpetual non-exclusive commercial release.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: true,
            foodSafetyFssai: false,
            pastReferencesMin: 3,
            ndaRequired: true,
            taxComplianceGst: true,
        },
        paymentTerms: "30% upon contract signing, 40% upon completion of shoot day, 30% upon final delivery and approval of all graded assets.",
        suggestedWeights: {
            cost: 25,
            qualityExperience: 35,
            deliverableFit: 25,
            complianceReliability: 15,
        },
    },
    "Decor & Floral": {
        category: "Decor & Floral",
        title: "Thematic Event Decor, Floral Architecture & Ambience Styling Procurement",
        scopeOfWork:
            "Conceptualize, fabricate, install, and strike custom bespoke event decor, stage architectural backdrops, entrance statement arches, floral centerpieces, ambient lighting installations, photo opportunity backdrops, and table scape styling tailored to the event theme.",
        deliverables: [
            {
                title: "Grand Entrance Feature Arch",
                description: "Bespoke structural entrance arch adorned with fresh premium imported flowers and integrated warm lighting.",
                isMandatory: true,
            },
            {
                title: "Architectural Stage Backdrop & Podiums",
                description: "Customized stage backdrop, lecterns, and modular branded staging according to approved 3D design renders.",
                isMandatory: true,
            },
            {
                title: "Table Scapes & Guest Centerpieces",
                description: "Coordinated centerpieces, runner accents, charger plates, and ambient LED candle arrangements for all tables.",
                isMandatory: true,
            },
            {
                title: "Interactive Photo Op & Media Wall",
                description: "Custom 10x8 ft 3D photo backdrop featuring event monogram, floral accents, and flattering lighting.",
                isMandatory: true,
            },
            {
                title: "Complete Strike & Eco-Friendly Cleanup",
                description: "Post-event disassembly within 2 hours, with floral repurposing/composting commitment.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: true,
            foodSafetyFssai: false,
            pastReferencesMin: 2,
            ndaRequired: false,
            taxComplianceGst: true,
        },
        paymentTerms: "40% advance for raw material procurement, 35% on mockup/render approval, 25% post-installation sign-off.",
        suggestedWeights: {
            cost: 30,
            qualityExperience: 30,
            deliverableFit: 25,
            complianceReliability: 15,
        },
    },
    "Entertainment / DJ": {
        category: "Entertainment / DJ",
        title: "Live Entertainment, Artist Booking & DJ Performance Procurement",
        scopeOfWork:
            "Provide professional musical entertainment, headline performers, or resident DJ services to entertain guests across event segments. Vendor must coordinate rider requirements, setlists, guest interaction, and sync with sound engineering staff.",
        deliverables: [
            {
                title: "Curated Musical Performance",
                description: "Live musical performance sets totaling 90 minutes, matching the client-approved genre and theme.",
                isMandatory: true,
            },
            {
                title: "DJ & Dancefloor Party Set",
                description: "High-energy open-format DJ set for up to 3 hours with active crowd engagement.",
                isMandatory: true,
            },
            {
                title: "Professional Emcee / Host Coordination",
                description: "Bilingual event host to guide timeline, introduce keynotes, and drive audience participation.",
                isMandatory: true,
            },
            {
                title: "Technical Sound Check",
                description: "Artist sound check completed 90 minutes prior to guest arrival with sound engineer.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: false,
            foodSafetyFssai: false,
            pastReferencesMin: 2,
            ndaRequired: false,
            taxComplianceGst: true,
        },
        paymentTerms: "50% advance booking fee, 50% immediately prior to stage performance.",
        suggestedWeights: {
            cost: 25,
            qualityExperience: 35,
            deliverableFit: 25,
            complianceReliability: 15,
        },
    },
    "Staffing & Security": {
        category: "Staffing & Security",
        title: "Event Staffing, Hospitality Ushers & Crowd Safety Security Procurement",
        scopeOfWork:
            "Deploy vetted, trained, and uniformed event personnel including security officers, crowd control marshals, registration ushers, VIP escorts, and certified first-aid responders to maintain a safe, welcoming, and orderly environment.",
        deliverables: [
            {
                title: "Licensed Security Personnel",
                description: "Vetted security guards stationed at entry turnstiles, emergency exits, and backstage zones.",
                isMandatory: true,
            },
            {
                title: "Hospitality Ushers & Check-In Hosts",
                description: "Professional ushers managing attendee badging, QR code check-in, and seat guiding.",
                isMandatory: true,
            },
            {
                title: "First-Aid Responder & Safety Station",
                description: "Certified paramedic on-site with emergency medical kit, burn dressings, and AED unit.",
                isMandatory: true,
            },
            {
                title: "Briefing & Operational Supervisor",
                description: "Dedicated on-site supervisor conducting pre-event security briefing and liaison with authorities.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: true,
            foodSafetyFssai: false,
            pastReferencesMin: 3,
            ndaRequired: true,
            taxComplianceGst: true,
        },
        paymentTerms: "30% booking advance, 70% post-event verification of shift attendance.",
        suggestedWeights: {
            cost: 30,
            qualityExperience: 25,
            deliverableFit: 25,
            complianceReliability: 20,
        },
    },
    "Logistics & Transport": {
        category: "Logistics & Transport",
        title: "Fleet Transportation & Logistics Operations Procurement",
        scopeOfWork:
            "Coordinate VIP airport transfers, shuttle buses for attendees between host hotel and venue, freight transport of stage gear, and parking logistics with dedicated dispatch supervisor.",
        deliverables: [
            {
                title: "Executive Shuttle Coach Fleet",
                description: "2 luxury air-conditioned coaches operating scheduled loops every 20 minutes.",
                isMandatory: true,
            },
            {
                title: "VIP Chauffeured Sedans",
                description: "3 premium sedans for guest speaker pickups and keynote escorts.",
                isMandatory: true,
            },
            {
                title: "On-Site Transport Dispatcher",
                description: "Dedicated coordinator monitoring real-time flight tracking and route pacing.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: true,
            foodSafetyFssai: false,
            pastReferencesMin: 2,
            ndaRequired: false,
            taxComplianceGst: true,
        },
        paymentTerms: "30% advance on confirmation, 70% after route execution completion.",
        suggestedWeights: {
            cost: 35,
            qualityExperience: 25,
            deliverableFit: 20,
            complianceReliability: 20,
        },
    },
    "Other Services": {
        category: "Other Services",
        title: "General Event Vendor Procurement Specification",
        scopeOfWork:
            "Provide specialized event professional services in accordance with agreed specifications, timelines, safety compliance, and operational excellence standards.",
        deliverables: [
            {
                title: "Core Service Delivery",
                description: "Fulfill all agreed specifications and personnel requirements during the event window.",
                isMandatory: true,
            },
            {
                title: "Pre-Event Coordination & Testing",
                description: "Participate in production alignment meeting and site walk-through prior to event day.",
                isMandatory: true,
            },
        ],
        compliance: {
            businessLicense: true,
            liabilityInsurance: true,
            foodSafetyFssai: false,
            pastReferencesMin: 2,
            ndaRequired: false,
            taxComplianceGst: true,
        },
        paymentTerms: "50% advance on contract signing, 50% upon successful service conclusion.",
        suggestedWeights: {
            cost: 30,
            qualityExperience: 25,
            deliverableFit: 25,
            complianceReliability: 20,
        },
    },
};

/**
 * Creates rich initial sample RFPs pre-connected to the workspace's default events
 * so the Documents tab feels alive, authoritative, and immediately useful.
 */
export function createInitialSampleRfps(): RfpRecord[] {
    return [
        {
            id: "RFP-2026-CAT-0101",
            title: "RFP for Catering - Maya & Rohan Wedding",
            eventId: "sample-wedding-reception",
            eventName: "Maya & Rohan Wedding",
            eventType: "Wedding",
            category: "Catering",
            status: "issued",
            priority: "high_value",
            tone: "creative",
            createdAt: "2026-10-20T10:00:00Z",
            updatedAt: "2026-10-22T14:30:00Z",
            guestCount: 320,
            venueLocation: "Grand Palace Ballroom & Lawns, Mumbai",
            organizerName: "EventMind Wedding Directorate",
            organizerEmail: "weddings@eventmind.ai",
            organizerPhone: "+91 98200 12345",
            timeline: {
                issueDate: "2026-10-20",
                questionsDeadline: "2026-10-28",
                submissionDeadline: "2026-11-05",
                evaluationDate: "2026-11-08",
                awardDate: "2026-11-12",
                serviceStartDate: "2026-12-04",
                serviceEndDate: "2026-12-05",
            },
            commercials: {
                targetBudget: 240000,
                budgetCeiling: 280000,
                currency: "INR",
                pricingStructure: "per_person",
                paymentTerms: "25% advance on contract signing, 50% milestone upon menu tasting approval, 25% post-wedding reconciliation.",
                penaltyClause: "1% per hour delay in buffet opening past scheduled Muhurat.",
            },
            scopeOfWork:
                "Curate, prepare, and execute a grand 4-course royal banquet for 320 attendees including live artisan chaat counters, regional Awadhi and Continental mains, fusion desserts, mocktail bar, and uniformed service stewards.",
            deliverables: CATEGORY_TEMPLATES["Catering"].deliverables.map((d, i) => ({
                id: `del-cat-${i + 1}`,
                ...d,
            })),
            compliance: CATEGORY_TEMPLATES["Catering"].compliance,
            evaluationWeights: {
                cost: 25,
                qualityExperience: 35,
                deliverableFit: 25,
                complianceReliability: 15,
            },
            targetVendors: [
                {
                    vendorId: "vendor-catering",
                    vendorName: "Northstar Catering",
                    category: "Catering",
                    email: "bids@northstarcatering.com",
                    tier: "Premium",
                    rating: 4.8,
                },
                {
                    vendorId: "CAT-001",
                    vendorName: "Epicurean Feast Catering",
                    category: "Catering",
                    email: "sales@epicureanfeast.com",
                    tier: "Premium",
                    rating: 4.9,
                },
            ],
            specialTerms: "All food waste to be donated or composted in alignment with the couple's zero-waste initiative.",
            generatedMarkdown: `# REQUEST FOR PROPOSAL (RFP)
## Vendor Procurement Specification

**RFP Reference ID:** \`RFP-2026-CAT-0101\`  
**Issue Date:** 2026-10-20  
**Procurement Category:** Catering  
**Event Name:** Maya & Rohan Wedding  
**Event Type:** Wedding  
**Priority:** HIGH_VALUE  

---

### 1. Executive Summary & Objective
We are curating an extraordinary culinary celebration for **Maya & Rohan Wedding** and are seeking an imaginative, high-craft partner in **Catering** to bring our culinary vision to life for 320 esteemed guests.

---

### 2. Event Operating Environment & Profile
- **Event Title:** Maya & Rohan Wedding
- **Anticipated Attendance:** 320 Guests
- **Venue / Location:** Grand Palace Ballroom & Lawns, Mumbai
- **Service Operational Window:** 2026-12-04 to 2026-12-05
- **Procuring Entity:** EventMind Wedding Directorate
- **Primary Contact:** weddings@eventmind.ai | +91 98200 12345

---

### 3. Detailed Scope of Work (SOW)
Curate, prepare, and execute a grand 4-course royal banquet for 320 attendees including live artisan chaat counters, regional Awadhi and Continental mains, fusion desserts, mocktail bar, and uniformed service stewards.

---

### 4. Mandatory Deliverables & Specifications
| # | Deliverable | Description | Requirement |
|---|---|---|---|
| 1 | **Curated Multi-Cuisine Menu** | 3 appetizers, 4 main courses, 3 desserts, breads & rice specialties, with vegan/Jain/gluten-free clearly marked. | **MANDATORY** |
| 2 | **Complimentary Menu Tasting** | Tasting session for up to 4 committee members at least 3 weeks prior to event execution. | **MANDATORY** |
| 3 | **Uniformed Waitstaff & Stewards** | Trained, groomed hospitality personnel equipped with standard uniforms, white gloves, and name tags. | **MANDATORY** |
| 4 | **Artisan Beverage & Mocktail Counter** | Live mocktail mixology counter with fresh ingredients, crystal glassware, and ice replenishment. | **MANDATORY** |
| 5 | **Kitchen Sanitation & Waste Recycling** | Complete setup of stainless steel warmers, prep hygiene stations, and zero-waste composting protocol. | **MANDATORY** |

---

### 5. Procurement Budget & Commercial Framework
- **Target Budget Allocation:** **₹240,000.00**
- **Maximum Cost Ceiling:** **₹280,000.00** *(Proposals exceeding ceiling will be disqualified)*
- **Payment Milestones:** 25% advance on contract signing, 50% milestone upon menu tasting approval, 25% post-wedding reconciliation.
- **Late Delivery Penalty:** 1% per hour delay in buffet opening past scheduled Muhurat.

---

### 6. Vendor Eligibility & Compliance
- Valid Government Business License: **Required**
- Commercial General Liability Insurance: **Required**
- Food Safety Certification / FSSAI License: **Required**
- GST / Tax Compliance: **Required**
- Client References: Minimum 3 similar scale luxury wedding productions.

---

### 7. Evaluation & Selection Scoring Matrix
| Criteria | Weight | Description |
|---|---|---|
| **Commercial Pricing & Cost Competitiveness** | **25.0%** | Per-cover rates and transparent menu costing |
| **Vendor Track Record & Experience** | **35.0%** | Portfolio depth, presentation artistry, food safety history |
| **Deliverables & Culinary Fit** | **25.0%** | Menu variety, tasting score, dietary accommodations |
| **Compliance, Safety & Insurance** | **15.0%** | FSSAI compliance, staffing grooming, hygiene protocols |
| **TOTAL** | **100.0%** | Comprehensive evaluation score |

---

### 8. Proposal Submission Guidelines
Submit proposal packages in PDF format to \`weddings@eventmind.ai\` by **2026-11-05**.
Subject Line: \`[PROPOSAL] RFP-2026-CAT-0101 - Catering - [Company Name]\``,
            generatedEmailPitch: `Subject: RFP Invitation: Catering Services for Maya & Rohan Wedding [RFP-2026-CAT-0101]

Dear Vendor Partner,

On behalf of EventMind Wedding Directorate, we are pleased to invite your company to submit a formal proposal for Catering Services for Maya & Rohan Wedding.

Event Highlights:
• Dates: 2026-12-04 to 2026-12-05
• Location: Grand Palace Ballroom & Lawns, Mumbai
• Expected Guests: 320
• Target Budget: ₹240,000
• Proposal Deadline: 2026-11-05

Please find attached the complete Request for Proposal (RFP Reference: RFP-2026-CAT-0101) detailing requirements, menu parameters, tasting schedules, and evaluation criteria.

Warm regards,
EventMind Wedding Directorate
Email: weddings@eventmind.ai`,
            proposalsCount: 2,
        },
        {
            id: "RFP-2026-AVL-0102",
            title: "RFP for Audio, Visual & Stage Lighting - Spring Design Conference",
            eventId: "sample-design-conference",
            eventName: "Spring Design Conference",
            eventType: "Conference",
            category: "Audio / Visual & Lighting",
            status: "evaluating",
            priority: "standard",
            tone: "formal",
            createdAt: "2026-10-18T09:00:00Z",
            updatedAt: "2026-10-25T11:20:00Z",
            guestCount: 240,
            venueLocation: "Tech Innovation Convention Hall, Bengaluru",
            organizerName: "Design Council Procurement",
            organizerEmail: "conference@designcouncil.org",
            organizerPhone: "+91 80 4123 4567",
            timeline: {
                issueDate: "2026-10-18",
                questionsDeadline: "2026-10-24",
                submissionDeadline: "2026-10-31",
                evaluationDate: "2026-11-03",
                awardDate: "2026-11-05",
                serviceStartDate: "2026-11-15",
                serviceEndDate: "2026-11-16",
            },
            commercials: {
                targetBudget: 31000,
                budgetCeiling: 36000,
                currency: "INR",
                pricingStructure: "fixed_lump_sum",
                paymentTerms: "30% mobilization advance, 40% upon successful soundcheck pass, 30% post-event strike.",
                penaltyClause: "2% deduction for any presentation blackout exceeding 5 minutes.",
            },
            scopeOfWork:
                "Provide concert-grade sound reinforcement, dual 16x9 ft ultra-HD LED video walls for keynotes, robotic camera tracking, wireless microphones for 8 concurrent panel speakers, and dedicated on-site sound/lighting engineers.",
            deliverables: CATEGORY_TEMPLATES["Audio / Visual & Lighting"].deliverables.map((d, i) => ({
                id: `del-avl-${i + 1}`,
                ...d,
            })),
            compliance: CATEGORY_TEMPLATES["Audio / Visual & Lighting"].compliance,
            evaluationWeights: {
                cost: 30,
                qualityExperience: 25,
                deliverableFit: 30,
                complianceReliability: 15,
            },
            targetVendors: [
                {
                    vendorId: "vendor-av",
                    vendorName: "Soundwave AV",
                    category: "Audio & Lighting",
                    email: "proposals@soundwaveav.com",
                    tier: "Premium",
                    rating: 4.7,
                },
            ],
            generatedMarkdown: `# REQUEST FOR PROPOSAL (RFP)
## Vendor Procurement Specification

**RFP Reference ID:** \`RFP-2026-AVL-0102\`  
**Issue Date:** 2026-10-18  
**Procurement Category:** Audio / Visual & Lighting  
**Event Name:** Spring Design Conference  
**Status:** EVALUATING  

---

### 1. Executive Summary & Objective
The Design Council Procurement committee invites formal proposals for Audio, Visual & Stage Lighting for the **Spring Design Conference** (240 attendees).

### 2. SOW & Deliverables
Concert-grade sound reinforcement, dual ultra-HD LED video walls for keynotes, wireless microphone systems, and on-site engineering crew.

### 3. Commercial Ceiling
Target Budget: **₹31,000.00** | Budget Ceiling: **₹36,000.00**`,
            generatedEmailPitch: `Subject: RFP Invitation: Audio/Visual Services for Spring Design Conference [RFP-2026-AVL-0102]

Dear Vendor Partner,
You are invited to submit proposals for AV & Stage Lighting for Spring Design Conference.
Submission Deadline: 2026-10-31.`,
            proposalsCount: 2,
        },
        {
            id: "RFP-2026-PHO-0103",
            title: "RFP for Photography & Videography - Product Launch Showcase",
            eventId: "sample-product-launch",
            eventName: "Product Launch Showcase",
            eventType: "Corporate",
            category: "Photography & Videography",
            status: "ready",
            priority: "standard",
            tone: "executive",
            createdAt: "2026-10-24T15:00:00Z",
            updatedAt: "2026-10-26T08:00:00Z",
            guestCount: 150,
            venueLocation: "Cyber Hub Auditorium, Gurugram",
            organizerName: "Apex Brands Marketing Team",
            organizerEmail: "marketing@apexbrands.com",
            organizerPhone: "+91 124 556 7890",
            timeline: {
                issueDate: "2026-10-24",
                questionsDeadline: "2026-10-30",
                submissionDeadline: "2026-11-06",
                evaluationDate: "2026-11-09",
                awardDate: "2026-11-11",
                serviceStartDate: "2026-12-27",
                serviceEndDate: "2026-12-27",
            },
            commercials: {
                targetBudget: 24000,
                budgetCeiling: 28000,
                currency: "INR",
                pricingStructure: "fixed_lump_sum",
                paymentTerms: "30% on contract execution, 40% on shoot completion, 30% upon approval of all master 4K assets.",
                penaltyClause: "₹2,000 per day of delay in teaser reel delivery past 24 hours.",
            },
            scopeOfWork:
                "Deliver high-impact corporate cinematography, 4K executive keynote coverage, same-day 60-second social media reel, 350+ color-graded photographs, and full global marketing rights release.",
            deliverables: CATEGORY_TEMPLATES["Photography & Videography"].deliverables.map((d, i) => ({
                id: `del-pho-${i + 1}`,
                ...d,
            })),
            compliance: CATEGORY_TEMPLATES["Photography & Videography"].compliance,
            evaluationWeights: {
                cost: 25,
                qualityExperience: 35,
                deliverableFit: 25,
                complianceReliability: 15,
            },
            targetVendors: [
                {
                    vendorId: "vendor-photo",
                    vendorName: "Frame & Focus",
                    category: "Photography",
                    email: "hello@framefocus.com",
                    tier: "Moderate",
                    rating: 4.6,
                },
            ],
            generatedMarkdown: `# REQUEST FOR PROPOSAL (RFP)
## Vendor Procurement Specification

**RFP Reference ID:** \`RFP-2026-PHO-0103\`  
**Issue Date:** 2026-10-24  
**Category:** Photography & Videography  
**Event:** Product Launch Showcase  

---

### Scope of Work
Executive keynote photography, multi-angle 4K recording, same-day press teaser reel, and complete digital asset gallery.

**Target Budget:** ₹24,000.00 | **Deadline:** 2026-11-06`,
            generatedEmailPitch: `Subject: RFP Invitation: Photography & Video Coverage for Product Launch Showcase [RFP-2026-PHO-0103]

Dear Vendor,
We are requesting proposals for 4K media capture of our upcoming product showcase.
Please review the attached RFP and submit your proposal by 2026-11-06.`,
            proposalsCount: 0,
        },
    ];
}

export function createInitialSampleProposals(): Record<string, VendorProposal[]> {
    return {
        "RFP-2026-CAT-0101": [
            {
                id: "prop-1",
                rfpId: "RFP-2026-CAT-0101",
                vendorName: "Northstar Catering",
                quotedPrice: 235000,
                qualityScore: 9.2,
                deliverableScore: 9.5,
                complianceScore: 10,
                submittedAt: "2026-10-24T16:00:00Z",
                notes: "Includes complimentary ice carving and live jalebi station. 100% compliant with FSSAI regulations.",
            },
            {
                id: "prop-2",
                rfpId: "RFP-2026-CAT-0101",
                vendorName: "Epicurean Feast Catering",
                quotedPrice: 255000,
                qualityScore: 9.6,
                deliverableScore: 9.8,
                complianceScore: 9.5,
                submittedAt: "2026-10-25T11:30:00Z",
                notes: "Luxury 5-star hotel trained chefs, imported chinaware, bespoke mocktail mixologist.",
            },
        ],
        "RFP-2026-AVL-0102": [
            {
                id: "prop-3",
                rfpId: "RFP-2026-AVL-0102",
                vendorName: "Soundwave AV",
                quotedPrice: 29500,
                qualityScore: 9.0,
                deliverableScore: 9.2,
                complianceScore: 9.0,
                submittedAt: "2026-10-22T14:00:00Z",
                notes: "L-Acoustics speaker array, dual 4K P2.6 LED panels, wireless Shure microphones.",
            },
            {
                id: "prop-4",
                rfpId: "RFP-2026-AVL-0102",
                vendorName: "Pulse Stage Solutions",
                quotedPrice: 32000,
                qualityScore: 8.8,
                deliverableScore: 9.0,
                complianceScore: 9.5,
                submittedAt: "2026-10-23T10:15:00Z",
                notes: "Includes dual redundant video switchers and standby diesel generator.",
            },
        ],
    };
}
