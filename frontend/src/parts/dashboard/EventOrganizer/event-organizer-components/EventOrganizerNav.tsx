import {type OrganTab} from "../EventOrganizerDashboardTabs.ts";
import styles from "../../../../styles/EventOrganizer.module.css"

interface EventOrganizerNavProps{
    isDark: boolean;
    tabs: OrganTab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

function EventOrganizerNav(
    {isDark, tabs, activeTab, onTabChange}:EventOrganizerNavProps){
    return(
        <aside className={isDark?styles.sideNavigationBar:styles.sideNavigationBarDark}>
            <nav>
                {
                    tabs.map((tab) => (
                        <button
                            key = {tab.id}
                            type = "button"
                            aria-label={activeTab}
                            onClick={() => onTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>

                ))}
            </nav>
        </aside>
    )
}

export default EventOrganizerNav