import styles from "../../../../styles/event-organizer/overview.module.css"

interface StaffProps{
    isDark: boolean;
}

export default function Staff ({isDark}:StaffProps) {
    return(
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Overview Tab</h1>
        </div>
    )
}