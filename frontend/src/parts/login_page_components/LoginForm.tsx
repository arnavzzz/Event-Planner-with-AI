import React from "react";
import ModeToggle from "./components/ModeToggle.tsx";
import AuthForm from "./components/AuthForm.tsx";
import {validateCredentials, type Role} from "../../auth/credentials.ts";
import styles from "../../styles/Login.module.css"

type Mode = "login" | "signup";

interface LoginFormProps{
    isDark: boolean;
    onSuccess: (role:Role) => void;
}

export default function LoginForm({isDark, onSuccess}:LoginFormProps){
    const [mode, setMode] = React.useState<Mode>("login")
    const [error, setError] = React.useState<string | null>(null)

    const handleModeChange = (next:Mode) => {
         setMode(next);
         setError(null);
    }

    const handleLogin = (email:string, password:string) => {
        const role = validateCredentials(email, password)
        if(role) {
            setError(null)
            onSuccess(role)
        }else {
            setError("That email and passcode do not match a workspace account")
        }
    }

    const handleSignup = (_email:string, _password:string) => {
        setError(null)
        onSuccess("event-organizer")
    }


    return(
        <div className={isDark ? styles.loginFormContainer:styles.loginFormContainerDark}>
            <section className={styles.loginCard} aria-labelledby="login-title">
                <ModeToggle mode={mode} onChange={handleModeChange} isDark={isDark} />
                <header className={styles.formHeading}>
                    <p className={styles.formEyebrow}>{mode === "login" ? "Your events, in sync" : "Get started"}</p>
                    <h2 className={styles.formTitle} id="login-title">
                        {mode === "login" ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className={styles.formDescription}>
                        {mode === "login"
                            ? "Sign in to pick up right where your team left off."
                            : "Set up your workspace and start planning together."}
                    </p>
                </header>
                <AuthForm mode={mode} onLogin={handleLogin} onSignUp={handleSignup} isDark={isDark} />
                {error && <p className={styles.error} role="alert">{error}</p>}
            </section>
        </div>
    )
}
