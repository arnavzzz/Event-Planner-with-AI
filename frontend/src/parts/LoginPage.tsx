import styles from "../styles/Login.module.css"
import LeftSideLoginPage from "./login_page_components/LeftSideLoginPage.tsx";
import RightSideLoginPage from "./login_page_components/RightSideLoginPage.tsx";

function LoginPage() {

    return(
        <div className={styles.container}>
            <LeftSideLoginPage/>
            <RightSideLoginPage/>
        </div>
    )
}

export default LoginPage;