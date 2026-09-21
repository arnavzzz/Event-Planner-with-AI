import styles from "../../../../styles/event-organizer/overview.module.css"

interface LiveControlRoomProps {
    isDark: boolean;
}

export default function LiveControlRoom ({isDark}:LiveControlRoomProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Live Control Room</h1>
        </div>
    )
}