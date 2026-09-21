import LoginPage from "./parts/LoginPage.tsx"
import EventOrganizerDashboard from "./parts/dashboard/EventOrganizer/EventOrganizerDashboard.tsx";
import AdminDashboard from "./parts/dashboard/Admin/AdminDashboard.tsx";
import VendorDashboard from "./parts/dashboard/Vendor/VendorDashboard.tsx";
import type {Role} from "./auth/credentials.ts"
import React from "react";

function App() {
    const [isDark, setIsDark] = React.useState(false);
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

    if (role == "event-organizer") {
        return <EventOrganizerDashboard
            isDark={isDark}
            onToggle={onToggle}
            onLogOut={handleLogout}/>
    }

    if (role == "admin") {
        return <AdminDashboard
            isDark={isDark}
            onToggle={onToggle}
            onLogOut={handleLogout}/>
    }

    return <VendorDashboard
        isDark={isDark}
        onToggle={onToggle}
        onLogOut={handleLogout}/>
}

export default App
