import React, {Fragment} from "react";
import type {SubmitEvent} from "react";
import styles from "../../../styles/Login.module.css";

type Mode = "login" | "signup";

interface AuthFormProps {
    mode: Mode;
    onLogin: (email: string, password: string) => void;
    onSignUp: (email: string, password: string, name?: string) => void;
    isDark: boolean;
    isLoading?: boolean;
}

function AuthForm({mode, onLogin, onSignUp, isDark, isLoading = false}: AuthFormProps) {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [formError, setFormError] = React.useState<string | null>(null);

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!email.includes("@")) {
            setFormError("Enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setFormError("Passcode needs at least 6 characters.");
            return;
        }

        if (mode === "signup") {
            if (password !== confirmPassword) {
                setFormError("Passcodes do not match.");
                return;
            }
            onSignUp(email, password, name);
            return;
        }
        onLogin(email, password);
    };

    const handleQuickFillDemo = () => {
        setEmail("eo1@arnav.com");
        setPassword("123456");
        setFormError(null);
    };

    return (
        <div className={isDark ? styles.formPart : styles.formPartDark}>
            <form onSubmit={handleSubmit} noValidate>
                {mode === "signup" && (
                    <label>
                        <span>Full Name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Arnav Agrawal"
                            autoComplete="name"
                            disabled={isLoading}
                        />
                    </label>
                )}

                <label>
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="eo1@arnav.com"
                        autoComplete="email"
                        disabled={isLoading}
                        required
                    />
                </label>

                <label>
                    <span>Passcode</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        disabled={isLoading}
                        required
                    />
                </label>

                {mode === "signup" && (
                    <Fragment>
                        <label>
                            <span>Confirm passcode</span>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                disabled={isLoading}
                                required
                            />
                        </label>
                    </Fragment>
                )}

                {formError && <p className={styles.formError} role="alert">{formError}</p>}

                <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "wait" : "pointer" }}
                >
                    {isLoading
                        ? mode === "login"
                            ? "Connecting to SQLite..."
                            : "Creating Account in SQLite..."
                        : mode === "login"
                        ? "Log In"
                        : "Create Account"}
                </button>

                {mode === "login" && (
                    <button
                        type="button"
                        onClick={handleQuickFillDemo}
                        disabled={isLoading}
                        style={{
                            marginTop: "12px",
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: isDark ? "1px dashed rgba(255,255,255,0.25)" : "1px dashed rgba(0,0,0,0.25)",
                            background: "transparent",
                            color: isDark ? "#A0AEC0" : "#4A5568",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                    >
                        ⚡ Fill Demo Credentials (eo1@arnav.com / 123456)
                    </button>
                )}
            </form>
        </div>
    );
}

export default AuthForm;
