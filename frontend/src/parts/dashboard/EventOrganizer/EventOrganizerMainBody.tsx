import styles from "../../../styles/EventOrganizer.module.css"
import Overview from "./pages/Overview.tsx";
import Events from "./pages/Events.tsx";
import Setting from "./pages/Setting.tsx"
import AiPlanner from "./pages/AiPlanner.tsx";

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
            {activeTab === "setting" && (
                <Setting isDark={isDark}/>
            )}
        </main>
    )
}

export default EventOrganizerMainBody