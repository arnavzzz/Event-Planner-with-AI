import styles from "../../../../styles/EventOrganizer.module.css";
import RightSideHeader from "./header-components/RightSideHeader.tsx";
import LeftSideHeader from "./header-components/LeftSideHeader.tsx";
import MiddleSideHeader from "./header-components/MiddleSideHeader.tsx";
import type { UserProfile } from "../../../../api/authService.ts";

interface EventOrganizerHeaderProps {
    isDark: boolean;
    user?: UserProfile | null;
    onToggle: () => void;
    onLogOut: () => void;
    onOpenProfile?: () => void;
}

function EventOrganizerHeader({
    isDark,
    user,
    onToggle,
    onLogOut,
    onOpenProfile,
}: EventOrganizerHeaderProps) {
    return (
        <header className={isDark ? styles.eventHeader : styles.eventHeaderDark}>
            <LeftSideHeader isDark={isDark} />
            <MiddleSideHeader isDark={isDark} />
            <RightSideHeader
                isDark={isDark}
                user={user}
                onToggle={onToggle}
                onLogOut={onLogOut}
                onOpenProfile={onOpenProfile}
            />
        </header>
    );
}

export default EventOrganizerHeader;
