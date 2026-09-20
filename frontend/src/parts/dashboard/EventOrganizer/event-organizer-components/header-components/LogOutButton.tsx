import styles from "../../../../../styles/EventOrganizer.module.css"

interface LogOutButtonProps {
    isDark: boolean;
    onLogOut: () => void;
}

function LogOutButton({isDark, onLogOut}: LogOutButtonProps) {
    return (
        <div className={isDark ? styles.logOutButtonEventOrganizer : styles.logOutButtonEventOrganizer}>
            <button
                onClick={onLogOut}
                aria-label="Log Out"
            >
                Log Out
            </button>
        </div>
    )
}

export default LogOutButton