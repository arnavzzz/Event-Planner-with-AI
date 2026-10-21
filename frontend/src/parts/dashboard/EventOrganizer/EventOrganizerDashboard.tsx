import {useState} from "react";
import {TABS, type OrganTabId} from "./EventOrganizerDashboardTabs.ts";
import styles from "../../../styles/EventOrganizer.module.css"
import type {EventRecord} from "./EventData.ts";
import EventOrganizerNav from "./event-organizer-components/EventOrganizerNav.tsx";
import EventOrganizerHeader from "./event-organizer-components/EventOrganizerHeader.tsx";
import EventOrganizerFooter from "./event-organizer-components/EventOrganizerFooter.tsx";
import EventOrganizerMainBody from "./EventOrganizerMainBody.tsx";


interface EventOrganizerDashboardProps{
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function EventOrganizerDashboard({isDark, onToggle, onLogOut}:EventOrganizerDashboardProps) {
    const [activeTab, setActiveTab] = useState<OrganTabId>("events");
    const [events, setEvents] = useState<EventRecord[]>([]);

    const handleCreateEvent = (event: EventRecord) => {
        setEvents((currentEvents) => [event, ...currentEvents]);
        setActiveTab("events");
    };

    return(
        <div className={isDark? styles.container: styles.containerDark}>
            <EventOrganizerHeader
                isDark={isDark}
                onToggle={onToggle}
                onLogOut={onLogOut}
            />

            <div className={styles.dashboardBody}>
                <EventOrganizerNav
                    isDark={isDark}
                    tabs={TABS.filter((tab) => tab.id === "events" || tab.id === "create-event")}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <EventOrganizerMainBody
                    isDark={isDark}
                    activeTab={activeTab}
                    events={events}
                    onCreateEvent={handleCreateEvent}
                />
            </div>

            <EventOrganizerFooter
                isDark={isDark}
                activeLabel={TABS.find((tab) => tab.id === activeTab)?.label ?? "Events"}
            />

        </div>
    )
}

export default EventOrganizerDashboard
