import {type OrganTab} from "../EventOrganizerDashboardTabs.ts";
import styles from "../../../../styles/EventOrganizer.module.css"
import {TabIcon} from "./EventOrganizerTabIcons.tsx";

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
                    tabs.map((tab) => {
                        const isActive = tab.id === activeTab;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                aria-label={tab.label}
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => onTabChange(tab.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.6rem",
                                }}
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