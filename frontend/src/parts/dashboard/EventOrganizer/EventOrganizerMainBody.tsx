import styles from "../../../styles/EventOrganizer.module.css";
import Overview from "./pages/Overview.tsx";
import Events from "./pages/Events.tsx";
import Profile from "./pages/Profile.tsx";
import AiPlanner from "./pages/AiPlanner.tsx";
import Venue from "./pages/Venue.tsx";
import Vendor from "./pages/Vendor.tsx";
import Budget from "./pages/Budget.tsx";
import Schedule from "./pages/Schedule.tsx";
import Staff from "./pages/Staff.tsx";
import Guest from "./pages/Guest.tsx";
import Catering from "./pages/Catering.tsx";
import Logistics from "./pages/Logistics.tsx";
import Risk from "./pages/Risk.tsx";
import LiveControlRoom from "./pages/LiveControlRoom.tsx";
import Task from "./pages/Tasks.tsx";
import CommunicationHub from "./pages/CommunicationHub.tsx";
import Documents from "./pages/Documents.tsx";
import Reports from "./pages/Reports.tsx";
import AiAgents from "./pages/AiAgents.tsx";
import GlobalAiAgents from "./pages/GlobalAiAgents.tsx";
import CreateEvent from "./pages/CreateEvent.tsx";
import type { EventRecord } from "./EventData.ts";
import type { OrganTabId } from "./EventOrganizerDashboardTabs.ts";
import type { UserProfile } from "../../../api/authService.ts";

interface EventOrganizerMainBodyProps {
    isDark: boolean;
    activeTab: OrganTabId;
    events: EventRecord[];
    user?: UserProfile | null;
    onCreateEvent: (event: EventRecord) => void;
    onSelectTab?: (tab: OrganTabId) => void;
    onLogOut?: () => void;
}

function EventOrganizerMainBody({
    isDark,
    activeTab,
    events,
    user,
    onCreateEvent,
    onSelectTab,
    onLogOut,
}: EventOrganizerMainBodyProps) {
    return (
        <main className={isDark ? styles.mainBody : styles.mainBodyDark}>
            {activeTab === "overview" && (
                <Overview isDark={isDark} />
            )}
            {activeTab === "profile" && (
                <Profile
                    isDark={isDark}
                    user={user}
                    events={events}
                    onLogOut={onLogOut || (() => {})}
                    onSelectTab={onSelectTab || (() => {})}
                />
            )}
            {activeTab === "events" && (
                <Events isDark={isDark} events={events} />
            )}
            {activeTab === "create-event" && (
                <CreateEvent isDark={isDark} onCreate={onCreateEvent} />
            )}
            {activeTab === "ai-planner" && (
                <AiPlanner isDark={isDark} />
            )}
            {activeTab === "venues" && (
                <Venue isDark={isDark} />
            )}
            {activeTab === "vendors" && (
                <Vendor isDark={isDark} />
            )}
            {activeTab === "budget" && (
                <Budget isDark={isDark} />
            )}
            {activeTab === "schedule" && (
                <Schedule isDark={isDark} />
            )}
            {activeTab === "staff" && (
                <Staff isDark={isDark} />
            )}
            {activeTab === "guest" && (
                <Guest isDark={isDark} />
            )}
            {activeTab === "catering" && (
                <Catering isDark={isDark} />
            )}
            {activeTab === "logistics" && (
                <Logistics isDark={isDark} />
            )}
            {activeTab === "risk" && (
                <Risk isDark={isDark} />
            )}
            {activeTab === "live-control-room" && (
                <LiveControlRoom isDark={isDark} />
            )}
            {activeTab === "tasks" && (
                <Task isDark={isDark} />
            )}
            {activeTab === "communication-hub" && (
                <CommunicationHub isDark={isDark} />
            )}
            {activeTab === "documents" && (
                <Documents isDark={isDark} events={events} onSelectTab={onSelectTab} />
            )}
            {activeTab === "reports" && (
                <Reports isDark={isDark} />
            )}
            {activeTab === "ai-agents" && (
                <AiAgents isDark={isDark} />
            )}
            {activeTab === "global-ai-agent" && (
                <GlobalAiAgents isDark={isDark} />
            )}
            {activeTab === "setting" && (
                <Profile
                    isDark={isDark}
                    user={user}
                    events={events}
                    onLogOut={onLogOut || (() => {})}
                    onSelectTab={onSelectTab || (() => {})}
                />
            )}
        </main>
    );
}

export default EventOrganizerMainBody;
