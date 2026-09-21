import * as React from "react";
import type {OrganTabId} from "../EventOrganizerDashboardTabs.ts";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
}

function Icon({size = 20, children, ...rest}: IconProps & {children: React.ReactNode }){
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...rest}
        >
            {children}
        </svg>
    )
}

export const OverviewIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="3" y="3" width="7" height="9" rx="1.3" />
        <rect x="14" y="3" width="7" height="5" rx="1.3" />
        <rect x="14" y="12" width="7" height="9" rx="1.3" />
        <rect x="3" y="16" width="7" height="5" rx="1.3" />
    </Icon>
);

export const EventsIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <line x1="8" y1="2.5" x2="8" y2="6.5" />
        <line x1="16" y1="2.5" x2="16" y2="6.5" />
        <line x1="3" y1="9.5" x2="21" y2="9.5" />
    </Icon>
);

export const AIPlannerIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
        <circle cx="18.7" cy="5.3" r="1" fill="currentColor" stroke="none" />
    </Icon>
);

export const VenuesIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="4" y="3" width="16" height="18" />
        <rect x="7" y="6.2" width="2.4" height="2.4" />
        <rect x="14.6" y="6.2" width="2.4" height="2.4" />
        <rect x="7" y="11.2" width="2.4" height="2.4" />
        <rect x="14.6" y="11.2" width="2.4" height="2.4" />
        <rect x="10" y="16.2" width="4" height="4.8" />
    </Icon>
);

export const VendorsIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M3 8l1-4h16l1 4" />
        <line x1="3" y1="8" x2="21" y2="8" />
        <path d="M4 8h16v11H4z" />
        <path d="M9 19v-5h6v5" />
    </Icon>
);

export const BudgetIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M16 6V4.5A1.5 1.5 0 0 0 14.5 3h-9A1.5 1.5 0 0 0 4 4.5V6" />
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10.5h18" />
        <circle cx="17" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
);

export const ScheduleIcon = (props: IconProps) => (
    <Icon {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.4 2" />
    </Icon>
);

export const StaffIcon = (props: IconProps) => (
    <Icon {...props}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M14.7 20c.3-2.9 2-5 4.5-5" />
    </Icon>
);

export const GuestIcon = (props: IconProps) => (
    <Icon {...props}>
        <circle cx="10" cy="8" r="3.5" />
        <path d="M4 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M15.5 13.3l1.8 1.8 3.7-3.7" />
    </Icon>
);

export const CateringIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M3 16a9 9 0 0 1 18 0" />
        <line x1="2" y1="16" x2="22" y2="16" />
        <line x1="12" y1="7" x2="12" y2="4" />
        <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
    </Icon>
);

export const LogisticsIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="1.5" y="7" width="12" height="9" rx="1" />
        <path d="M13.5 10h4l3.5 3.5V16h-7.5" />
        <circle cx="6" cy="18.5" r="1.8" />
        <circle cx="16.5" cy="18.5" r="1.8" />
    </Icon>
);

export const RiskIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M12 3.5 21.5 20h-19L12 3.5z" />
        <line x1="12" y1="9.5" x2="12" y2="14" />
        <circle cx="12" cy="16.8" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    </Icon>
);

export const LiveControlRoomIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="2.5" y="4" width="19" height="13" rx="1.5" />
        <line x1="8" y1="20.5" x2="16" y2="20.5" />
        <line x1="12" y1="17" x2="12" y2="20.5" />
        <circle cx="12" cy="10.5" r="1.4" fill="currentColor" stroke="none" />
        <path d="M9 8a3.5 3.5 0 0 0 0 5" />
        <path d="M15 8a3.5 3.5 0 0 1 0 5" />
    </Icon>
);

export const TasksIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="3.3" y="4" width="4" height="4" rx="1" />
        <path d="M4.2 6l0.9 0.9 1.6-1.9" />
        <line x1="10" y1="6" x2="20.5" y2="6" />
        <rect x="3.3" y="10.5" width="4" height="4" rx="1" />
        <path d="M4.2 12.5l0.9 0.9 1.6-1.9" />
        <line x1="10" y1="12.5" x2="20.5" y2="12.5" />
        <rect x="3.3" y="17" width="4" height="4" rx="1" />
        <line x1="10" y1="19" x2="20.5" y2="19" />
    </Icon>
);

export const CommunicationHubIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="3" y="4" width="13" height="9" rx="2.5" />
        <path d="M6.5 13v3.2l3.5-3.2" />
        <rect x="9" y="9" width="12" height="8" rx="2.5" />
        <path d="M17.5 17v3l-3.2-3" />
    </Icon>
);

export const DocumentsIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M6 2.5h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-18a1 1 0 0 1 1-1z" />
        <path d="M14 2.5V8h5" />
        <line x1="8" y1="12.5" x2="16" y2="12.5" />
        <line x1="8" y1="16" x2="16" y2="16" />
        <line x1="8" y1="19.5" x2="13" y2="19.5" />
    </Icon>
);

export const ReportsIcon = (props: IconProps) => (
    <Icon {...props}>
        <line x1="4" y1="21" x2="20" y2="21" />
        <rect x="6" y="13" width="3" height="8" />
        <rect x="10.5" y="8" width="3" height="13" />
        <rect x="15" y="4" width="3" height="17" />
    </Icon>
);

export const AIAgentsIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect x="4.5" y="8" width="15" height="11" rx="2.5" />
        <line x1="12" y1="4" x2="12" y2="8" />
        <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
        <circle cx="9" cy="13" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13" r="1.3" fill="currentColor" stroke="none" />
        <line x1="9" y1="17" x2="15" y2="17" />
    </Icon>
);

export const GlobalAIAgentIcon = (props: IconProps) => (
    <Icon {...props}>
        <circle cx="11" cy="12" r="8.5" />
        <path d="M2.5 12h17" />
        <path d="M11 3.5c2.3 2.3 3.5 5.3 3.5 8.5s-1.2 6.2-3.5 8.5c-2.3-2.3-3.5-5.3-3.5-8.5S8.7 5.8 11 3.5z" />
        <circle cx="19" cy="6" r="2" />
        <line x1="19" y1="8" x2="19" y2="9.5" />
    </Icon>
);

export const SettingIcon = (props: IconProps) => (
    <Icon {...props}>
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7.5" strokeDasharray="2.4 2.8" />
    </Icon>
);

export const TAB_ICONS: Record<OrganTabId, React.FC<IconProps>> = {
    overview: OverviewIcon,
    events: EventsIcon,
    "ai-planner": AIPlannerIcon,
    venues: VenuesIcon,
    vendors: VendorsIcon,
    budget: BudgetIcon,
    schedule: ScheduleIcon,
    staff: StaffIcon,
    guest: GuestIcon,
    catering: CateringIcon,
    logistics: LogisticsIcon,
    risk: RiskIcon,
    "live-control-room": LiveControlRoomIcon,
    tasks: TasksIcon,
    "communication-hub": CommunicationHubIcon,
    documents: DocumentsIcon,
    reports: ReportsIcon,
    "ai-agents": AIAgentsIcon,
    "global-ai-agent": GlobalAIAgentIcon,
    setting: SettingIcon,
};

export function TabIcon ({tabId, ...props}:IconProps & {tabId:OrganTabId}) {
    const Cmp = TAB_ICONS[tabId]
    return <Cmp {...props} />
}