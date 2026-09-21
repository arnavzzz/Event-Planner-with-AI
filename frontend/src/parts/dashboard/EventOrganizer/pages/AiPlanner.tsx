import styles from "../../../../styles/event-organizer/ai-planner.module.css"

interface AiPlannerProps {
    isDark: boolean;
}

export default function AiPlanner({isDark}: AiPlannerProps) {
    return (
        <div className={isDark ? styles.container : styles.containerDark}>
            <h1>AI Planner</h1>
        </div>
    )
}