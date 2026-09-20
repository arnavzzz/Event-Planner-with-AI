import styles from "../../../../styles/EventOrganizer.module.css"
import RightSideHeader from "./header-components/RightSideHeader.tsx";
import LeftSideHeader from "./header-components/LeftSideHeader.tsx";

interface EventOrganizerHeaderProps {
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function EventOrganizerHeader({isDark, onToggle, onLogOut}:EventOrganizerHeaderProps){
    return(
        <header className={isDark?styles.eventHeader:styles.eventHeaderDark}>
            <LeftSideHeader isDark={isDark} />

            <RightSideHeader isDark={isDark} onToggle={onToggle} onLogOut={onLogOut} />
        </header>
    )
}

export default EventOrganizerHeader