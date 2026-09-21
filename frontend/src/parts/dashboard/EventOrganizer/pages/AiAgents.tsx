import styles from "../../../../styles/event-organizer/overview.module.css"

interface AiAgentsProps {
    isDark: boolean;
}

export default function AiAgents ({isDark}:AiAgentsProps)  {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>AI Agents Tab</h1>
        </div>
    )
}