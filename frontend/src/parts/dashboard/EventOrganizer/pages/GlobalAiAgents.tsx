import styles from "../../../../styles/event-organizer/overview.module.css"

interface GlobalAiAgentsProps {
    isDark: boolean;
}

export default function GlobalAiAgents({isDark}:GlobalAiAgentsProps) {
    return(
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Global AI Agents Tab</h1>
        </div>
    )
}