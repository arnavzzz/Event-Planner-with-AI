import styles from "../../../../styles/EventOrganizer.module.css"
import RightSideHeader from "./header-components/RightSideHeader.tsx";

interface EventOrganizerHeaderProps {
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function EventOrganizerHeader({isDark, onToggle, onLogOut}:EventOrganizerHeaderProps){
    return(
        <header className={isDark?styles.eventHeader:styles.eventHeaderDark}>
            <RightSideHeader isDark={isDark} onToggle={onToggle} onLogOut={onLogOut} />
        </header>
    )
}

export default EventOrganizerHeader