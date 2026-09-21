import styles from "../../../../styles/event-organizer/overview.module.css"

interface VenueProps {
    isDark: boolean;
}

export default function Venue ({isDark}:VenueProps) {
    return (
        <div className={isDark?styles.container:styles.containerDark}>
            <h1>Overview Tab</h1>
        </div>
    )
}