import styles from "../../../../styles/event-organizer/overview.module.css"

interface OverviewProps{
    isDark: boolean;
}

export default function  Overview({isDark}:OverviewProps) {
    return(
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Overview Tab</h1>
        </div>
    )
}