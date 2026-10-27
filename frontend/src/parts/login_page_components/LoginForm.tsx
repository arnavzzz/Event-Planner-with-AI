import React from "react";
import ModeToggle from "./components/ModeToggle.tsx";
import AuthForm from "./components/AuthForm.tsx";
import { type Role } from "../../auth/credentials.ts";
import { authService, type AuthResponse } from "../../api/authService.ts";
import styles from "../../styles/Login.module.css";

type Mode = "login" | "signup";

interface LoginFormProps {
    isDark: boolean;
    onSuccess: (role: Role, authData?: AuthResponse) => void;
}

export default function LoginForm({isDark, onSuccess}: LoginFormProps) {
    const [mode, setMode] = React.useState<Mode>("login");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const handleModeChange = (next: Mode) => {
        setMode(next);
        setError(null);
    };

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const authData = await authService.login(email, password);
            if (authData && authData.success) {
                onSuccess(authData.user.role || "event-organizer", authData);
            } else {
                setError("Login failed. Please verify your credentials.");
            }
        } catch (err: any) {
            const rawMsg = err?.message || "";
            if (rawMsg.includes("502") || rawMsg.includes("Bad Gateway") || rawMsg.includes("gateway")) {
                setError("Backend connection unavailable. Please check your credentials or retry.");
            } else {
                setError(rawMsg || "That email and passcode do not match a workspace account.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (email: string, password: string, name?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const authData = await authService.signup(email, password, name);
            if (authData && authData.success) {
                onSuccess(authData.user.role || "event-organizer", authData);
            } else {
                setError("Registration failed. Please try again.");
            }
        } catch (err: any) {
            const rawMsg = err?.message || "";
            if (rawMsg.includes("502") || rawMsg.includes("Bad Gateway") || rawMsg.includes("gateway")) {
                setError("Backend connection unavailable. Please retry registration.");
            } else {
                setError(rawMsg || "Could not register account. Email may already be in use.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={isDark ? styles.loginFormContainer : styles.loginFormContainerDark}>
            <section className={styles.loginCard} aria-labelledby="login-title">
                <ModeToggle mode={mode} onChange={handleModeChange} isDark={isDark} />
                <header className={styles.formHeading}>
                    <p className={styles.formEyebrow}>
                        {mode === "login" ? "Connected via SQLite3" : "Get started with SQLite3"}
                    </p>
                    <h2 className={styles.formTitle} id="login-title">
                        {mode === "login" ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className={styles.formDescription}>
                        {mode === "login"
                            ? "Sign in to manage your workspace and view your 3 default profile events."
                            : "Set up your workspace and automatically provision your 3 default profile events."}
                    </p>
                </header>
                <AuthForm
                    mode={mode}
                    onLogin={handleLogin}
                    onSignUp={handleSignup}
                    isDark={isDark}
                    isLoading={isLoading}
                />
                {error && <p className={styles.error} role="alert">{error}</p>}
            </section>
        </div>
    );
}
