import {Fragment} from "react";

interface VendorDashboardProps {
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function VendorDashboard({isDark, onToggle, onLogOut}:VendorDashboardProps) {
    return(
        <Fragment>
            <h1>Vendor Dashboard</h1>
            <button onClick={onLogOut}>Log Out</button>
        </Fragment>
    )
}

export default VendorDashboard