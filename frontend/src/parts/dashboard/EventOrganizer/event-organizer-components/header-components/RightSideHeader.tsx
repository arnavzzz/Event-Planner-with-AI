import styles from "../../../../../styles/EventOrganizer.module.css"
import ToggleButton from "./ToggleButton.tsx";
import LogOutButton from "./LogOutButton.tsx";

interface RightSideHeaderProps {
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function RightSideHeader({isDark, onToggle, onLogOut}: RightSideHeaderProps) {
    return (
        <div className={isDark ? styles.rightHeader : styles.rightHeaderDark}>
            <div>
                <ToggleButton isDark={isDark} onToggle={onToggle} />
                <LogOutButton isDark={isDark} onLogOut={onLogOut} />
            </div>
        </div>
    )
}

export default RightSideHeader