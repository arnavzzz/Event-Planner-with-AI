import { Fragment } from "react";

interface AdminDashboardProps {
    isDark: boolean;
    onToggle: () => void;
    onLogOut: () => void;
}

function AdminDashboard({ isDark, onToggle, onLogOut }: AdminDashboardProps) {
    return (
        <Fragment>
            <div className={isDark ? "dark bg-gray-900 text-white min-h-screen p-6" : "bg-gray-100 text-gray-900 min-h-screen p-6"}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <div className="flex gap-3">
                        <button onClick={onToggle} className="px-3 py-1.5 border rounded">
                            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                        </button>
                        <button onClick={onLogOut} className="px-3 py-1.5 bg-red-600 text-white rounded">
                            Log Out
                        </button>
                    </div>
                </div>
                <p>System Admin Governance & Control Panel</p>
            </div>
        </Fragment>
    );
}

export default AdminDashboard;