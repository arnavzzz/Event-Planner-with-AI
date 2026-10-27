import { useMemo } from "react";
import styles from "../../../../styles/event-organizer/profile.module.css";
import type { EventRecord } from "../EventData.ts";
import type { OrganTabId } from "../EventOrganizerDashboardTabs.ts";
import type { UserProfile } from "../../../../api/authService.ts";
import { formatInr } from "../currency.ts";

interface ProfileProps {
    isDark: boolean;
    user?: UserProfile | null;
    events: EventRecord[];
    onLogOut: () => void;
    onSelectTab: (tab: OrganTabId) => void;
}

function formatDate(value: string) {
    if (!value) return "TBD";
    try {
        return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
            new Date(`${value}T12:00:00`)
        );
    } catch {
        return value;
    }
}

export default function Profile({
    isDark,
    user,
    events,
    onLogOut,
    onSelectTab,
}: ProfileProps) {
    const displayUser = user || {
        id: "USR-DEMO-001",
        email: "eo1@arnav.com",
        name: "Arnav Sharma",
        role: "event-organizer" as const,
        avatar_color: "#1B2A4A",
        created_at: new Date().toISOString(),
    };

    // Filter or select the default three events in profile
    const defaultThreeEvents = useMemo(() => {
        const defaults = events.filter((e) => e.isDefault);
        if (defaults.length >= 3) {
            return defaults.slice(0, 3);
        }
        // Fallback: take the first 3 events
        return events.slice(0, 3);
    }, [events]);

    const totalBudget = useMemo(
        () => events.reduce((sum, e) => sum + (e.clientBudget || 0), 0),
        [events]
    );

    const totalGuests = useMemo(
        () => events.reduce((sum, e) => sum + (e.guestCount || 0), 0),
        [events]
    );

    const initials = useMemo(() => {
        if (!displayUser.name) return "EO";
        const parts = displayUser.name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return displayUser.name.substring(0, 2).toUpperCase();
    }, [displayUser.name]);

    return (
        <div className={isDark ? styles.container : styles.containerDark}>
            <div className={styles.content}>
                {/* User Identity Hero */}
                <header className={styles.profileHero}>
                    <div className={styles.userIdentity}>
                        <div
                            className={styles.avatar}
                            style={{
                                backgroundColor: displayUser.avatar_color || "#1B2A4A",
                            }}
                            aria-hidden="true"
                        >
                            {initials}
                        </div>
                        <div className={styles.metaInfo}>
                            <h1>
                                {displayUser.name}
                                <span title="Verified Workspace Account">✓</span>
                            </h1>
                            <p>{displayUser.email}</p>
                            <div className={styles.badges}>
                                <span className={styles.roleBadge}>
                                    ★ {displayUser.role === "event-organizer" ? "Event Organizer" : displayUser.role}
                                </span>
                                <span className={styles.sqliteBadge}>
                                    <span className={styles.liveDot} />
                                    SQLite3 Connected
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.heroActions}>
                        <button
                            type="button"
                            className={styles.logoutBtn}
                            onClick={onLogOut}
                            title="Sign out of your workspace session"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log Out
                        </button>
                    </div>
                </header>

                {/* Profile Overview Stats */}
                <section className={styles.statsGrid} aria-label="Profile Summary Statistics">
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Default Profile Events</div>
                        <div className={`${styles.statValue} ${styles.statHighlight}`}>
                            {defaultThreeEvents.length} Active
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Managed Events</div>
                        <div className={styles.statValue}>{events.length}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Event Budget</div>
                        <div className={styles.statValue}>{formatInr(totalBudget)}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Attendees / Guests</div>
                        <div className={styles.statValue}>{totalGuests.toLocaleString()}</div>
                    </div>
                </section>

                {/* Default Three Events in Profile */}
                <section className={styles.section} aria-labelledby="default-events-heading">
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2 className={styles.sectionTitle} id="default-events-heading">
                                🌟 Default Three Events in Profile
                            </h2>
                            <p className={styles.sectionSub}>
                                These 3 benchmark events are saved in SQLite (event_planner.db) and tied directly to your profile.
                            </p>
                        </div>
                        <button
                            type="button"
                            className={styles.cardActionBtn}
                            style={{ width: "auto", padding: "0.5rem 1rem" }}
                            onClick={() => onSelectTab("events")}
                        >
                            Open Full Events List →
                        </button>
                    </div>

                    <div className={styles.defaultEventsGrid}>
                        {defaultThreeEvents.map((event, idx) => (
                            <article className={styles.defaultEventCard} key={event.id || idx}>
                                <div>
                                    <div className={styles.cardHeaderTop}>
                                        <span className={styles.eventTypePill}>{event.eventType}</span>
                                        <span className={styles.defaultTag}>
                                            ★ Default Event #{idx + 1}
                                        </span>
                                    </div>
                                    <h3 className={styles.cardEventName}>{event.eventName}</h3>
                                </div>

                                <dl className={styles.cardDetails}>
                                    <div className={styles.detailItem}>
                                        <dt>Allocated Budget</dt>
                                        <dd>{formatInr(event.clientBudget)}</dd>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <dt>Target Guests</dt>
                                        <dd>{event.guestCount.toLocaleString()} attendees</dd>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <dt>Start Date</dt>
                                        <dd>{formatDate(event.startDate)}</dd>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <dt>End Date</dt>
                                        <dd>{formatDate(event.endDate)}</dd>
                                    </div>
                                </dl>

                                {event.vendors && event.vendors.length > 0 && (
                                    <div className={styles.vendorsSummary}>
                                        <strong>Assigned Vendors ({event.vendors.length}):</strong>{" "}
                                        {event.vendors.map((v) => v.name).join(", ")}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className={styles.cardActionBtn}
                                    onClick={() => onSelectTab("events")}
                                >
                                    Manage Event Details
                                </button>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Account & SQLite Configuration Info */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            ⚙️ Workspace & Database Architecture
                        </h2>
                    </div>
                    <div className={styles.systemInfoCard}>
                        <div className={styles.infoItem}>
                            <label>Account ID</label>
                            <span>{displayUser.id}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Database Storage</label>
                            <span>SQLite3 (backend/event_planner.db)</span>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Authentication Protocol</label>
                            <span>SHA-256 + Salt Session Tokens</span>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Account Status</label>
                            <span style={{ color: "#10b981" }}>Active & Connected</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
