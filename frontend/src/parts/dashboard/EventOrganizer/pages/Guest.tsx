import styles from "../../../../styles/event-organizer/overview.module.css"

interface GuestProps {
    isDark: boolean;
}

export default function Guest({isDark}:GuestProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Guests Tab</h1>
        </div>
    )
}