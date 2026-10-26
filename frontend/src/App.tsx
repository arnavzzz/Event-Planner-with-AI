import LoginPage from "./parts/LoginPage.tsx"
import EventOrganizerDashboard from "./parts/dashboard/EventOrganizer/EventOrganizerDashboard.tsx";
import type {Role} from "./auth/credentials.ts"
import React from "react";

function App() {
    const [isDark, setIsDark] = React.useState(true);
    const onToggle = () => {
        setIsDark((prev) => !prev)
    }

    const [role, setRole] = React.useState <Role | null>(null)

    if (!role) {
        return <LoginPage
            isDark={isDark}
            onToggle={onToggle}
            onSuccess={setRole}/>
    }

    const handleLogout = () => setRole(null)

    return <EventOrganizerDashboard
        isDark={isDark}
        onToggle={onToggle}
        onLogOut={handleLogout}/>
}

export default App
