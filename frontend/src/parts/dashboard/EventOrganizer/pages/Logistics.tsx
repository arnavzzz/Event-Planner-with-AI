import styles from "../../../../styles/event-organizer/overview.module.css"

interface LogisticsProps {
    isDark: boolean;
}

export default function Logistics ({isDark}:LogisticsProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Logistics Tab</h1>
        </div>
    )
}