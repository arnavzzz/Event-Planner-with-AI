import styles from "../../../../styles/event-organizer/overview.module.css"

interface ScheduleProps{
    isDark: boolean;
}

export default function Schedule ({isDark}:ScheduleProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Overview Tab</h1>
        </div>
    )
}