import styles from "../../../../../styles/EventOrganizer.module.css"
import SunIcon from "../../../../../assets/sun.svg";
import MoonIcon from "../../../../../assets/moon.svg";

interface ToggleButtonProps {
    isDark: boolean;
    onToggle: () => void;
}

function ToggleButton({isDark, onToggle}: ToggleButtonProps) {
    return (
        <div className={isDark ? styles.toggleButtonEventOrganizer : styles.toggleButtonEventOrganizerDark}>
            <button
                onClick={onToggle}
                aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
            >
                <img
                    src={isDark ? SunIcon: MoonIcon}
                    alt={isDark?"Light Mode":"Dark Mode"}
                />
            </button>
        </div>
    )
}

export default ToggleButton