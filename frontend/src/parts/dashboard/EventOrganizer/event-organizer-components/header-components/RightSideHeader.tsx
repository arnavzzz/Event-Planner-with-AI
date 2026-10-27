import styles from "../../../../../styles/EventOrganizer.module.css";
import ToggleButton from "./ToggleButton.tsx";
import LogOutButton from "./LogOutButton.tsx";
import type { UserProfile } from "../../../../../api/authService.ts";

interface RightSideHeaderProps {
    isDark: boolean;
    user?: UserProfile | null;
    onToggle: () => void;
    onLogOut: () => void;
    onOpenProfile?: () => void;
}

function RightSideHeader({
    isDark,
    user,
    onToggle,
    onLogOut,
    onOpenProfile,
}: RightSideHeaderProps) {
    const initials = user?.name
        ? user.name
              .trim()
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
        : "EO";

    return (
        <div className={isDark ? styles.rightHeader : styles.rightHeaderDark}>
            <div>
                {onOpenProfile && (
                    <button
                        type="button"
                        onClick={onOpenProfile}
                        title="View Profile and Default Events"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.35rem 0.85rem",
                            borderRadius: "999px",
                            border: isDark
                                ? "1px solid rgba(255,255,255,0.18)"
                                : "1px solid #dce6e0",
                            background: isDark
                                ? "rgba(255,255,255,0.06)"
                                : "#ffffff",
                            color: isDark ? "#f2f7f4" : "#172820",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            minHeight: "2.5rem",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <span
                            style={{
                                width: "1.75rem",
                                height: "1.75rem",
                                borderRadius: "50%",
                                background: user?.avatar_color || "#3d6b4f",
                                color: "#ffffff",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                            }}
                        >
                            {initials}
                        </span>
                        <span>{user?.name || "Profile"}</span>
                    </button>
                )}
                <ToggleButton isDark={isDark} onToggle={onToggle} />
                <LogOutButton isDark={isDark} onLogOut={onLogOut} />
            </div>
        </div>
    );
}

export default RightSideHeader;
