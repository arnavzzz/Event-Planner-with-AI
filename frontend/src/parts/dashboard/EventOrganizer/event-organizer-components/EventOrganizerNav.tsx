import {type OrganTab, type OrganTabId} from "../EventOrganizerDashboardTabs.ts";
import styles from "../../../../styles/EventOrganizer.module.css"
import {TabIcon} from "./EventOrganizerTabIcons.tsx";

interface EventOrganizerNavProps{
    isDark: boolean;
    tabs: OrganTab[];
    activeTab: OrganTabId;
    onTabChange: (id: OrganTabId) => void;
}

function EventOrganizerNav(
    {isDark, tabs, activeTab, onTabChange}:EventOrganizerNavProps){
    return(
        <aside className={isDark?styles.sideNavigationBar:styles.sideNavigationBarDark}>
            <nav className={styles.sideNavigationLinks} aria-label="Event Organizer sections">
                {
                    tabs.map((tab) => {
                        const isActive = tab.id === activeTab;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                aria-label={tab.label}
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => onTabChange(tab.id)}
                                className={styles.sideNavigationLink}
                            >
                                <TabIcon tabId={tab.id} size={22}/>
                                {tab.label}
                            </button>
                        )
                    })
                }
            </nav>
        </aside>
    )
}

export default EventOrganizerNav
