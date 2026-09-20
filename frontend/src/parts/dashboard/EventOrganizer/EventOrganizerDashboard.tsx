import React from "react";
import {TABS, type OrganTabId} from "./EventOrganizerDashboardTabs.ts";
import styles from "../../../styles/EventOrganizer.module.css"
import EventOrganizerNav from "./event-organizer-components/EventOrganizerNav.tsx";
import EventOrganizerHeader from "./event-organizer-components/EventOrganizerHeader.tsx";
import EventOrganizerFooter from "./event-organizer-components/EventOrganizerFooter.tsx";


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
            <EventOrganizerHeader
                isDark={isDark}
                onToggle={onToggle}
                onLogOut={onLogOut}
            />

            <EventOrganizerNav
                isDark={isDark}
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as OrganTabId)}
            />

            <EventOrganizerFooter
                isDark={isDark}
                activeLabel={activeLabel}
            />

        </div>
    )
}

export default EventOrganizerDashboard