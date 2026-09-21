import styles from "../../../../styles/event-organizer/overview.module.css"

interface BudgetProps {
    isDark: boolean;
}

export default function Budget ({isDark}:BudgetProps) {
    return(
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Overview Tab</h1>
        </div>
    )
}