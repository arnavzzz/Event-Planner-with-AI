import {Fragment} from "react";

interface EventOrganizerDashboardProps{
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function EventOrganizerDashboard({isDark, onToggle, onLogOut}:EventOrganizerDashboardProps) {
    return(
        <Fragment>
            <h1>Event Organizer Dashboard</h1>
            <button onClick={onLogOut}>Log Out</button>
        </Fragment>
    )
}

export default EventOrganizerDashboard