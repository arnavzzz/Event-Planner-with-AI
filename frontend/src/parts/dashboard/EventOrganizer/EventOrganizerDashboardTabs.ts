export type OrganTabId = "overview" | "events" | "ai-planner"
    | "venues" | "vendors" | "budget" | "schedule" |
    "staff" | "guest" | "catering" | "logistics" | "risk"
    | "live-control-room" | "tasks" | "communication-hub"
    | "documents" | "reports" | "ai-agents" | "global-ai-agent" | "setting"

export type OrganTab = {
    id: OrganTabId;
    label: string;
}

export const TABS = [
    {id: "overview", label: "Overview"},
    {id: "events", label: "Events"},
    {id: "ai-planner", label: "AI Planner"},
    {id: "venues", label: "Venues"},
    {id: "vendors", label: "Vendors"},
    {id: "budget", label: "Budget"},
    {id: "schedule", label: "Schedule"},
    {id: "staff", label: "Staff"},
    {id: "guest", label: "Guest"},
    {id: "catering", label: "Catering"},
    {id: "logistics", label: "Logistics"},
    {id: "risk", label: "Risk"},
    {id: "live-control-room", label: "Live Control Room"},
    {id: "tasks", label: "Tasks"},
    {id: "communication-hub", label: "Communication Hub"},
    {id: "documents", label: "Documents"},
    {id: "reports", label: "Reports"},
    {id: "ai-agents", label: "AI Agents"},
    {id: "global-ai-agent", label: "Global AI Agents"},
    {id: "setting", label: "Setting"}
] satisfies OrganTab[];