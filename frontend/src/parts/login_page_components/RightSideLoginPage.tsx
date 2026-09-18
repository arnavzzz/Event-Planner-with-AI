import styles from "../../styles/Login.module.css"
import LoginDayNightToggleButton from "./LoginDayNightToggle.tsx";

interface RightSideLoginPageProps{
    isDark: boolean;
    onToggle: () => void
}

function RightSideLoginPage({isDark, onToggle}:RightSideLoginPageProps) {
    return(
        <div className={styles.rightSideLoginPage}>
            <h1>Right</h1>
            <LoginDayNightToggleButton isDark={isDark} onToggle={onToggle}/>

        </div>
    );
}

export default RightSideLoginPage;