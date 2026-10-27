import { useState, useEffect } from "react";
import { TABS, type OrganTabId } from "./EventOrganizerDashboardTabs.ts";
import styles from "../../../styles/EventOrganizer.module.css";
import { createSampleEvents, type EventRecord } from "./EventData.ts";
import EventOrganizerNav from "./event-organizer-components/EventOrganizerNav.tsx";
import EventOrganizerHeader from "./event-organizer-components/EventOrganizerHeader.tsx";
import EventOrganizerFooter from "./event-organizer-components/EventOrganizerFooter.tsx";
import EventOrganizerMainBody from "./EventOrganizerMainBody.tsx";
import type { UserProfile } from "../../../api/authService.ts";
import { API_BASE_URL } from "../../../api/aiService.ts";

interface EventOrganizerDashboardProps {
    isDark: boolean;
    user?: UserProfile | null;
    initialEvents?: EventRecord[];
    onToggle: () => void;
    onLogOut: () => void;
}

function EventOrganizerDashboard({
    isDark,
    user,
    initialEvents,
    onToggle,
    onLogOut,
}: EventOrganizerDashboardProps) {
    const [activeTab, setActiveTab] = useState<OrganTabId>("events");
    const [events, setEvents] = useState<EventRecord[]>(() => {
        if (initialEvents && initialEvents.length > 0) {
            return initialEvents;
        }
        return createSampleEvents();
    });

    // Sync events with backend SQLite if initialEvents change or on load
    useEffect(() => {
        if (initialEvents && initialEvents.length > 0) {
            setEvents(initialEvents);
            return;
        }

        // Fetch user events from SQLite API
        const token = localStorage.getItem("event_planner_token");
        const headers: Record<string, string> = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        fetch(`${API_BASE_URL}/api/events`, { headers })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error("Could not fetch events");
            })
            .then((data) => {
                if (data && data.events && data.events.length > 0) {
                    setEvents(data.events);
                }
            })
            .catch(() => {
                // Keep default events
            });
    }, [initialEvents]);

    const handleCreateEvent = (event: EventRecord) => {
        setEvents((currentEvents) => [event, ...currentEvents]);
        setActiveTab("events");

        // Save to SQLite backend
        const token = localStorage.getItem("event_planner_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        fetch(`${API_BASE_URL}/api/events`, {
            method: "POST",
            headers,
            body: JSON.stringify(event),
        }).catch((err) => {
            console.warn("Event saved in memory, SQLite sync notice:", err);
        });
    };

    return (
        <div className={isDark ? styles.container : styles.containerDark}>
            <EventOrganizerHeader
                isDark={isDark}
                user={user}
                onToggle={onToggle}
                onLogOut={onLogOut}
                onOpenProfile={() => setActiveTab("profile")}
            />

            <div className={styles.dashboardBody}>
                <EventOrganizerNav
                    isDark={isDark}
                    tabs={TABS.filter(
                        (tab) =>
                            tab.id === "profile" ||
                            tab.id === "events" ||
                            tab.id === "create-event" ||
                            tab.id === "documents"
                    )}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <EventOrganizerMainBody
                    isDark={isDark}
                    activeTab={activeTab}
                    events={events}
                    user={user}
                    onCreateEvent={handleCreateEvent}
                    onSelectTab={setActiveTab}
                    onLogOut={onLogOut}
                />
            </div>

            <EventOrganizerFooter
                isDark={isDark}
                activeLabel={TABS.find((tab) => tab.id === activeTab)?.label ?? "Events"}
            />
        </div>
    );
}

export default EventOrganizerDashboard;
