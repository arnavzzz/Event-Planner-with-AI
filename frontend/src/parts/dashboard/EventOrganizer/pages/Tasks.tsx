import styles from "../../../../styles/event-organizer/overview.module.css"

interface TasksProps {
    isDark: boolean;
}

export default function Task ({isDark}:TasksProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Overview Tab</h1>
        </div>
    )
}