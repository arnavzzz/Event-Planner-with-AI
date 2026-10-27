export interface EventRecord {
    id: string;
    eventType: string;
    eventName: string;
    clientBudget: number;
    guestCount: number;
    startDate: string;
    endDate: string;
    vendors?: VendorRecord[];
    status?: string;
    isDefault?: boolean;
    createdAt?: string;
}

export interface VendorRecord {
    id: string;
    name: string;
    category: string;
    service: string;
    estimatedCost?: number;
    negotiatedCost?: number;
    rating?: number;
    tier?: string;
}

export const SAMPLE_VENDORS: VendorRecord[] = [
    {id: "vendor-catering", name: "Northstar Catering", category: "Catering", service: "Buffet and plated menus", estimatedCost: 42000},
    {id: "vendor-decor", name: "Evergreen Decor Studio", category: "Decor", service: "Event styling and floral design", estimatedCost: 36000},
    {id: "vendor-photo", name: "Frame & Focus", category: "Photography", service: "Event photography and albums", estimatedCost: 24000},
    {id: "vendor-av", name: "Soundwave AV", category: "Audio & Lighting", service: "Sound, stage, and lighting", estimatedCost: 31000},
    {id: "vendor-entertainment", name: "Rhythm House", category: "Entertainment", service: "Live music and DJ services", estimatedCost: 28000},
    {id: "vendor-rentals", name: "Gatherwell Rentals", category: "Furniture & Rentals", service: "Tables, seating, and event equipment", estimatedCost: 19000},
];

function sampleVendors(...vendorIds: string[]) {
    return SAMPLE_VENDORS.filter((vendor) => vendorIds.includes(vendor.id));
}

function dateFromToday(offsetDays: number) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function createSampleEvents(): EventRecord[] {
    return [
        {
            id: "sample-design-conference",
            eventType: "Conference",
            eventName: "Spring Design Conference",
            clientBudget: 125000,
            guestCount: 240,
            startDate: dateFromToday(18),
            endDate: dateFromToday(19),
            vendors: sampleVendors("vendor-catering", "vendor-av", "vendor-rentals"),
        },
        {
            id: "sample-wedding-reception",
            eventType: "Wedding",
            eventName: "Maya & Rohan Wedding",
            clientBudget: 850000,
            guestCount: 320,
            startDate: dateFromToday(37),
            endDate: dateFromToday(38),
            vendors: sampleVendors("vendor-catering", "vendor-decor", "vendor-photo", "vendor-entertainment"),
        },
        {
            id: "sample-product-launch",
            eventType: "Corporate",
            eventName: "Product Launch Showcase",
            clientBudget: 280000,
            guestCount: 150,
            startDate: dateFromToday(61),
            endDate: dateFromToday(61),
            vendors: sampleVendors("vendor-decor", "vendor-av", "vendor-photo"),
        },
        {
            id: "sample-arts-festival",
            eventType: "Festival",
            eventName: "Community Arts Festival",
            clientBudget: 175000,
            guestCount: 900,
            startDate: dateFromToday(-18),
            endDate: dateFromToday(-17),
            vendors: sampleVendors("vendor-catering", "vendor-av", "vendor-entertainment", "vendor-rentals"),
        },
        {
            id: "sample-partner-summit",
            eventType: "Conference",
            eventName: "Annual Partner Summit",
            clientBudget: 215000,
            guestCount: 130,
            startDate: dateFromToday(-75),
            endDate: dateFromToday(-74),
            vendors: sampleVendors("vendor-catering", "vendor-av", "vendor-photo"),
        },
        {
            id: "sample-birthday-celebration",
            eventType: "Birthday",
            eventName: "Aarav's Birthday Celebration",
            clientBudget: 45000,
            guestCount: 80,
            startDate: dateFromToday(-150),
            endDate: dateFromToday(-150),
            vendors: sampleVendors("vendor-catering", "vendor-decor", "vendor-photo"),
        },
    ];
}
