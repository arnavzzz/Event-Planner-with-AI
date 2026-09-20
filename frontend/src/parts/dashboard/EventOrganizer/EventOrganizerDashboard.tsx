import React from "react";
import {TABS, type OrganTabId} from "./EventOrganizerDashboardTabs.ts";
import styles from "../../../styles/EventOrganizer.module.css"
import EventOrganizerNav from "./event-organizer-components/EventOrganizerNav.tsx";

interface EventOrganizerDashboardProps{
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function EventOrganizerDashboard({isDark, onToggle, onLogOut}:EventOrganizerDashboardProps) {
    const [activeTab, setActiveTab] = React.useState<OrganTabId>("overview")
    const activeLabel = TABS.find(
        (tab) => tab.id === activeTab)?.label ??"";

    return(
        <div className={isDark? styles.container: styles.containerDark}>
            <h1>Event Organizer Dashboard</h1>
            <EventOrganizerNav
                isDark={isDark}
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as OrganTabId)}
            />
            <h2>{activeLabel}</h2>

            <button onClick={onLogOut}>Log Out</button>
        </div>
    )
}

export default EventOrganizerDashboard