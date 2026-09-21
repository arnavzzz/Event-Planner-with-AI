import styles from "../../../../styles/event-organizer/setting.module.css"

interface OverviewProps{
    isDark: boolean;
}

export default function  Setting({isDark}:OverviewProps) {
    return(
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Settings Tab</h1>
        </div>
    )
}