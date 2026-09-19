import React, {Fragment} from "react";
import type {SubmitEvent} from "react";
import RoleSelection from "./RoleSelect.tsx";
import type {Role} from "../../../auth/credentials.ts";
import styles from "../../../styles/Login.module.css";

type Mode = "login" | "signup";

interface AuthFormProps{
    mode: Mode;
    onLogin: (email: string, password: string) => void;
    onSignUp: (email: string, password: string, role:Role) => void;
    isDark: boolean;
}

function AuthForm({mode, onLogin, onSignUp, isDark}:AuthFormProps){
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [role, setRole] = React.useState<Role>("event-organizer")
    const [formError, setFormError] = React.useState<string|null>(null)

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>)=> {
        event.preventDefault();
        setFormError(null);

        if(!email.includes("@")){
            setFormError("Enter a valid email address.")
            return;
        }

        if(password.length < 6) {
            setFormError("Passcode needs at least 6 characters.");
            return;
        }

        if(mode === "signup") {
            if(password !== confirmPassword) {
                setFormError("Passcodes do not match");
                return;
            }
            onSignUp(email, password, role);
            return;
        }
        onLogin(email, password);
    }

    return (
        <div className={isDark?styles.formPart:styles.formPartDark}>
            <form onSubmit={handleSubmit} noValidate>
                <RoleSelection role={role} onChange={setRole} isDark={isDark} />
                <label>
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="arnav@arnav.com"
                        autoComplete="email"
                    />
                </label>
                <label>
                    <span>Passcode</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={mode==="login" ? "current-password" : "new-password"}
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
                            />
                        </label>
                    </Fragment>
                )}

                {formError && <p>{formError}</p>}

                <button type="submit">
                    {mode == "login" ? "Log In" : "Create Account"}
                </button>

            </form>
        </div>
    );
}

export default AuthForm