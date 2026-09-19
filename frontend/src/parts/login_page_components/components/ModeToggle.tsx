import styles from "../../../styles/Login.module.css"

type Mode = "login" | "signup"

interface ModeToggleProps {
    mode: Mode;
    onChange: (mode: Mode) => void;
    isDark: boolean
}

function ModeToggle({mode, onChange, isDark}:ModeToggleProps){
    return(
        <div
            className={isDark?styles.modeToggleContainer:styles.modeToggleContainerDark}
            role="tablist"
            aria-label="Log in or Create Account"
        >
            <button
                type="button"
                role="tab"
                aria-selected={mode==="login"}
                onClick={() => onChange("login")}
            >
                Login
            </button>

            <button
                type="button"
                role="tab"
                aria-selected={mode==="signup"}
                onClick={() => onChange("signup")}
            >
                Sign Up
            </button>
        </div>
    )
}

export default ModeToggle