import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/permissions';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import MarketerDashboard from '../components/dashboards/MarketerDashboard';
import EditorDashboard from '../components/dashboards/EditorDashboard';
import ViewerDashboard from '../components/dashboards/ViewerDashboard';

const Dashboard = () => {
    const { userProfile } = useAuth();

    // Show loading state while user profile loads
    if (!userProfile?.organizationId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/30 animate-pulse">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Route to role-specific dashboard
    const userRole = userProfile.role?.toUpperCase();

    switch (userRole) {
        case ROLES.ADMIN:
            return <AdminDashboard />;
        case ROLES.MARKETER:
            return <MarketerDashboard />;
        case ROLES.EDITOR:
            return <EditorDashboard />;
        case ROLES.VIEWER:
            return <ViewerDashboard />;
        default:
            // Default to editor dashboard if role is unknown
            return <EditorDashboard />;
    }
};

export default Dashboard;
