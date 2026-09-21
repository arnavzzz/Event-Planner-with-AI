import styles from "../../../styles/EventOrganizer.module.css"
import Overview from "./pages/Overview.tsx";
import Events from "./pages/Events.tsx";
import Setting from "./pages/Setting.tsx"
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

interface EventOrganizerMainBodyProps {
    isDark: boolean;
    activeTab: string;
}

function EventOrganizerMainBody({isDark, activeTab}: EventOrganizerMainBodyProps) {
    return (
        <main className={isDark ? styles.mainBody : styles.mainBodyDark}>

            {activeTab === "overview" && (
                <Overview isDark={isDark}/>
            )}
            {activeTab === "events" && (
                <Events isDark={isDark} />
            )}
            {activeTab === "ai-planner"&& (
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
                <Guest isDark={isDark}/>
            )}
            {activeTab === "catering" && (
                <Catering isDark={isDark} />
            )}
            {activeTab === "logistics" && (
                <Logistics isDark={isDark}/>
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
                <Documents isDark={isDark} />
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
                <Setting isDark={isDark}/>
            )}
        </main>
    )
}

export default EventOrganizerMainBody