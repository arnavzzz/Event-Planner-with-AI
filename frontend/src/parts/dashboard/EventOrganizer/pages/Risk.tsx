import styles from "../../../../styles/event-organizer/overview.module.css"

interface RiskProps {
    isDark: boolean;
}

export default function Risk ({isDark}:RiskProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Risk Tab</h1>
        </div>
    )
}