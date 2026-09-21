import styles from "../../../../styles/event-organizer/overview.module.css"

interface ReportsProps {
    isDark: boolean;
}

export default function Reports ({isDark}:ReportsProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Reports Tab</h1>
        </div>
    )
}