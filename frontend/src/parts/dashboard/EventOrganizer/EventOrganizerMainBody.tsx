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
            {activeTab == "guest" && (
                <Guest isDark={isDark}/>
            )}
            {activeTab === "setting" && (
                <Setting isDark={isDark}/>
            )}
        </main>
    )
}

export default EventOrganizerMainBody