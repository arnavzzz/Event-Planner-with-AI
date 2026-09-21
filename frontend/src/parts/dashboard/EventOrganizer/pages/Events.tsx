import styles from "../../../../styles/event-organizer/events.module.css"

interface EventsProps {
    isDark: boolean;
}

export default function Events({isDark}:EventsProps) {
    return(
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Event Tabs</h1>
        </div>
    )
}