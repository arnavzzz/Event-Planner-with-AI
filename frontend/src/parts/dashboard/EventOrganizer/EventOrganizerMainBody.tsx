import styles from "../../../styles/EventOrganizer.module.css"
import Overview from "./pages/Overview.tsx";
import Setting from "./pages/Setting.tsx"

interface EventOrganizerMainBodyProps {
    isDark: boolean;
    activeTab: string;
}

function EventOrganizerMainBody({isDark, activeTab}: EventOrganizerMainBodyProps) {
    return (
        <main className={isDark ? styles.mainBody : styles.mainBodyDark}>
            <div>
                {activeTab === "overview" && (
                    <Overview isDark={isDark}/>
                )}
                {activeTab === "setting" && (
                    <Setting isDark={isDark}/>
                )}
            </div>
        </main>
    )
}

export default EventOrganizerMainBody