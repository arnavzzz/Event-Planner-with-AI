import styles from "../../../../styles/event-organizer/overview.module.css"

interface CommunicationHubProps {
    isDark: boolean;
}

export default function CommunicationHub ({isDark}:CommunicationHubProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Communication Hub Tab</h1>
        </div>
    )
}