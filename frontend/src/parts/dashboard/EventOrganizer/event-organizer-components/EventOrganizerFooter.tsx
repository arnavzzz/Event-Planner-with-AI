import "../../../../styles/EventOrganizer.module.css"
import styles from "../../../../styles/EventOrganizer.module.css";

interface EventOrganizerFooterProps {
    isDark: boolean;
    activeLabel: string;
}

function EventOrganizerFooter({isDark, activeLabel}:EventOrganizerFooterProps) {
    const currentYear = new Date().getFullYear();

    return(
        <footer className={isDark?styles.eventFooter:styles.eventFooterDark}>
            <div >
                <p>Event Organizer &gt; {activeLabel}</p>
                <p>&copy; {currentYear} EventMindAI. All right reserved</p>
            </div>
        </footer>
    )
}

export default EventOrganizerFooter