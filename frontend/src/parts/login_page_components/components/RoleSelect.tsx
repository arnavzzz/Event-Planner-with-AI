import {ROLES, type Role} from "../../../auth/credentials.ts";
import styles from "../../../styles/Login.module.css";

interface RoleSelectionProps{
    role: Role;
    onChange: (role: Role) => void;
    isDark: boolean;
}


function RoleSelection({role, onChange, isDark}:RoleSelectionProps) {
    return(
        <div className={isDark ? styles.roleSelectionContainer:styles.roleSelectionContainerDark}>
            <span>
                I'm Signing up as
            </span>
            <div role="radiogroup" aria-label="account label">
                {ROLES.map((option) =>(
                    <button
                        key = {option.role}
                        type="button"
                        role="radio"
                        aria-checked={role === option.role}
                        onClick={() => onChange(option.role)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default RoleSelection