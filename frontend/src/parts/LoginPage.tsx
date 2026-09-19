import styles from "../styles/Login.module.css"
import LeftSideLoginPage from "./login_page_components/LeftSideLoginPage.tsx";
import RightSideLoginPage from "./login_page_components/RightSideLoginPage.tsx";
import type {Role} from "../auth/credentials.ts"

interface LoginPageProps{
    isDark: boolean;
    onToggle: () => void;
    onSuccess: (role:Role) => void;
}

function LoginPage({isDark, onToggle, onSuccess}:LoginPageProps) {

    return(
        <div className={isDark?styles.container:styles.containerDark}>
            <LeftSideLoginPage isDark={isDark}/>
            <RightSideLoginPage
                isDark={isDark}
                onToggle={onToggle}
                onSuccess = {onSuccess}
            />
        </div>
    )
}

export default LoginPage;