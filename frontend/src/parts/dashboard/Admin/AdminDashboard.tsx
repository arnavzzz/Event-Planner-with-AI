import {Fragment} from "react";

interface AdminDashboardProps{
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function AdminDashboard({isDark, onToggle, onLogOut}:AdminDashboardProps) {
    return(
        <Fragment>
            <h1>Admin Dashboard</h1>
            <button onClick={onLogOut}>Log Out</button>
        </Fragment>
    )
}

export default AdminDashboard