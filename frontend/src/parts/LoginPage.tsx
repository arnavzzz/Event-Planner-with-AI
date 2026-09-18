import styles from "../styles/Login.module.css"
import LeftSideLoginPage from "./login_page_components/LeftSideLoginPage.tsx";
import RightSideLoginPage from "./login_page_components/RightSideLoginPage.tsx";

interface LoginPageProps{
    isDark: boolean;
    onToggle: () => void
}

function LoginPage({isDark, onToggle}:LoginPageProps) {

    return(
        <div className={styles.container}>
            <LeftSideLoginPage isDark={isDark}/>
            <RightSideLoginPage isDark={isDark} onToggle={onToggle}/>
        </div>
    )
}

export default LoginPage;