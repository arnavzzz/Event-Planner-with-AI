import { Fragment } from "react";

interface VendorDashboardProps {
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function VendorDashboard({ isDark, onToggle, onLogOut }: VendorDashboardProps) {
    return (
        <Fragment>
            <div className={isDark ? "dark bg-gray-900 text-white min-h-screen p-6" : "bg-gray-100 text-gray-900 min-h-screen p-6"}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
                    <div className="flex gap-3">
                        <button onClick={onToggle} className="px-3 py-1.5 border rounded">
                            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                        </button>
                        <button onClick={onLogOut} className="px-3 py-1.5 bg-red-600 text-white rounded">
                            Log Out
                        </button>
                    </div>
                </div>
                <p>Vendor Services, Bookings & Contract Portal</p>
            </div>
        </Fragment>
    );
}

export default VendorDashboard;