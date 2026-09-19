import styles from "../../styles/Login.module.css"
import LoginDayNightToggleButton from "./LoginDayNightToggle.tsx";
import LoginForm from "./LoginForm.tsx";
import type {Role} from "../../auth/credentials.ts";

interface RightSideLoginPageProps{
    isDark: boolean;
    onToggle: () => void;
    onSuccess: (role:Role) => void;
}

function RightSideLoginPage({isDark, onToggle, onSuccess}:RightSideLoginPageProps) {
    return(
        <div className={isDark?styles.rightSideLoginPage:styles.rightSideLoginPageDark}>
            <LoginDayNightToggleButton isDark={isDark} onToggle={onToggle}/>
            <LoginForm isDark={isDark} onSuccess={onSuccess}/>
        </div>
    );
}

export default RightSideLoginPage;