import { useEffect, useState } from "react";
import LoginPage from "./parts/LoginPage.tsx";
import EventOrganizerDashboard from "./parts/dashboard/EventOrganizer/EventOrganizerDashboard.tsx";
import type { Role } from "./auth/credentials.ts";
import { authService, type UserProfile, type AuthResponse } from "./api/authService.ts";
import type { EventRecord } from "./parts/dashboard/EventOrganizer/EventData.ts";

function App() {
    const [isDark, setIsDark] = useState(true);
    const [role, setRole] = useState<Role | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [userEvents, setUserEvents] = useState<EventRecord[]>([]);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const onToggle = () => {
        setIsDark((prev) => !prev);
    };

    // Auto-check stored session on mount
    useEffect(() => {
        authService
            .getCurrentUser()
            .then((authData) => {
                if (authData && authData.user) {
                    setRole(authData.user.role || "event-organizer");
                    setCurrentUser(authData.user);
                    if (authData.events && authData.events.length > 0) {
                        setUserEvents(authData.events);
                    }
                }
            })
            .catch(() => {
                // Not authenticated
            })
            .finally(() => {
                setIsCheckingAuth(false);
            });
    }, []);

    const handleLoginSuccess = (selectedRole: Role, authData?: AuthResponse) => {
        setRole(selectedRole);
        if (authData?.user) {
            setCurrentUser(authData.user);
        }
        if (authData?.events && authData.events.length > 0) {
            setUserEvents(authData.events);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        setRole(null);
        setCurrentUser(null);
        setUserEvents([]);
    };

    if (isCheckingAuth) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    background: isDark ? "#0b1915" : "#f3f7f4",
                    color: isDark ? "#f2f7f4" : "#172820",
                    fontFamily: "sans-serif",
                }}
            >
                <div>Connecting to SQLite Workspace...</div>
            </div>
        );
    }

    if (!role) {
        return (
            <LoginPage
                isDark={isDark}
                onToggle={onToggle}
                onSuccess={handleLoginSuccess}
            />
        );
    }

    return (
        <EventOrganizerDashboard
            isDark={isDark}
            user={currentUser}
            initialEvents={userEvents}
            onToggle={onToggle}
            onLogOut={handleLogout}
        />
    );
}

export default App;
