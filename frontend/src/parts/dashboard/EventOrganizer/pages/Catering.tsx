import styles from "../../../../styles/event-organizer/overview.module.css"

interface CateringProps {
    isDark: boolean;
}

export default function  Catering ({isDark}: CateringProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Overview Tab</h1>
        </div>
    )
}