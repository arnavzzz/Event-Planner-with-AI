import styles from "../../styles/Login.module.css"
import SunIcon from "../../assets/sun.svg"
import MoonIcon from "../../assets/moon.svg"

interface LoginDayNightToggleButtonProps{
    isDark: boolean;
    onToggle: () => void
}

function LoginDayNightToggleButton({isDark,onToggle}:LoginDayNightToggleButtonProps){


    return(
        <div className={styles.loginToggleContainer}>
            <button
                className={styles.loginToggleButton}
                onClick={onToggle}
                aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
            >
                <img
                    className={styles.LightimageToggleButton}
                    src={isDark ? SunIcon: MoonIcon}
                    alt={isDark?"Light Mode":"Dark Mode"}
                />
            </button>
        </div>
    )
}

export default LoginDayNightToggleButton;