import {useState} from "react";
import styles from "../../../../styles/event-organizer/events.module.css"
import type {EventRecord} from "../EventData.ts";

interface EventsProps {
    isDark: boolean;
    events: EventRecord[];
}

function localDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat(undefined, {dateStyle: "medium"})
        .format(new Date(`${value}T12:00:00`));
}

export default function Events({isDark, events}:EventsProps) {
    const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
    const isUpcoming = activeTab === "upcoming";
    const today = localDateString(new Date());
    const visibleEvents = events
        .filter((event) => isUpcoming ? event.endDate >= today : event.endDate < today)
        .sort((left, right) => isUpcoming
            ? left.startDate.localeCompare(right.startDate)
            : right.endDate.localeCompare(left.endDate));

    return(
        <div className={isDark?styles.container:styles.containerDark}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Events</h1>
                    <p className={styles.description}>
                        Browse and manage your upcoming and completed events.
                    </p>
                </header>

                <div className={styles.tabs} role="tablist" aria-label="Event status">
                    <button
                        id="upcoming-events-tab"
                        className={`${styles.tab} ${isUpcoming ? styles.activeTab : ""}`}
                        type="button"
                        role="tab"
                        aria-selected={isUpcoming}
                        aria-controls="event-list-panel"
                        onClick={() => setActiveTab("upcoming")}
                    >
                        Upcoming Events
                    </button>
                    <button
                        id="completed-events-tab"
                        className={`${styles.tab} ${!isUpcoming ? styles.activeTab : ""}`}
                        type="button"
                        role="tab"
                        aria-selected={!isUpcoming}
                        aria-controls="event-list-panel"
                        onClick={() => setActiveTab("completed")}
                    >
                        Completed Events
                    </button>
                </div>

                <section
                    id="event-list-panel"
                    className={styles.panel}
                    role="tabpanel"
                    aria-labelledby={isUpcoming ? "upcoming-events-tab" : "completed-events-tab"}
                    tabIndex={0}
                >
                    {visibleEvents.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon} aria-hidden="true">
                                {isUpcoming ? "◷" : "✓"}
                            </div>
                            <h2>{isUpcoming ? "No upcoming events" : "No completed events"}</h2>
                            <p>
                                {isUpcoming
                                    ? "Upcoming events will appear here when they are scheduled."
                                    : "Completed events will appear here once they have taken place."}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.eventList}>
                            {visibleEvents.map((event) => (
                                <article className={styles.eventCard} key={event.id}>
                                    <div className={styles.eventCardHeader}>
                                        <span className={styles.eventType}>{event.eventType}</span>
                                        <h2>{event.eventName}</h2>
                                    </div>
                                    <dl className={styles.eventDetails}>
                                        <div>
                                            <dt>Dates</dt>
                                            <dd>{formatDate(event.startDate)} – {formatDate(event.endDate)}</dd>
                                        </div>
                                        <div>
                                            <dt>Client Budget</dt>
                                            <dd>{new Intl.NumberFormat().format(event.clientBudget)}</dd>
                                        </div>
                                        <div>
                                            <dt>Guests</dt>
                                            <dd>{new Intl.NumberFormat().format(event.guestCount)}</dd>
                                        </div>
                                    </dl>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
