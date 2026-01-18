import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Megaphone,
    FileText,
    Calendar,
    Settings,
    LogOut,
    BarChart3,
    FolderOpen,
    Inbox,
    Shield,
    Award,
    Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { hasPermission, PERMISSIONS, getRoleLabel, getRoleBadgeColor } from '../utils/permissions';

const Sidebar = ({ userRole, setUserRole }) => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();

    // Debug: Log userProfile to console
    console.log('🔍 Sidebar - userProfile:', userProfile);
    console.log('🔍 Sidebar - userProfile.name:', userProfile?.name);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
        { icon: Inbox, label: 'Inbox', path: '/inbox' },
        { icon: FileText, label: 'Content', path: '/editor' },
        { icon: FolderOpen, label: 'Assets', path: '/assets' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: Award, label: 'Reports', path: '/reports' },
    ];

    // Add Approvals link based on permission
    if (hasPermission(userProfile?.role || userRole, PERMISSIONS.APPROVE_CONTENT)) {
        navItems.splice(3, 0, { icon: Shield, label: 'Approvals', path: '/approvals' });
    }

    // Add Team link based on permission
    if (hasPermission(userProfile?.role || userRole, PERMISSIONS.MANAGE_TEAM)) {
        navItems.push({ icon: Users, label: 'Team', path: '/team' });
    }

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="w-64 bg-[#0B0C15] border-r border-[#1F2937]/50 flex flex-col h-screen sticky top-0">

            {/* Brand Header */}
            <div className="p-6 border-b border-[#1F2937]/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-base">Studio AI</h1>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Marketing v1</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative cursor-pointer ${isActive
                                    ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/30'
                                    : 'text-gray-400 hover:text-white hover:bg-[#1F2937]/50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                    )}
                                    <item.icon size={20} className="z-10" strokeWidth={2.5} />
                                    <span className="z-10">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-6 h-px bg-[#1F2937]/50" />

                {/* Secondary Nav */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1F2937]/50 transition-all">
                        <Settings size={20} strokeWidth={2.5} />
                        <span>Settings</span>
                    </button>
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-[#1F2937]/50 space-y-4">

                {/* Notifications */}
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alerts</span>
                    <NotificationBell />
                </div>

                {/* User Profile */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#1F2937]/30 hover:bg-[#1F2937]/50 transition-colors cursor-pointer group"
                >
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">
                                {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0B0C15] rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-white text-sm font-semibold truncate">
                            {userProfile?.name || 'User'}
                        </p>
                        <div className={`text-xs px-2 py-0.5 rounded border inline-block mt-1 ${getRoleBadgeColor(userProfile?.role || userRole)}`}>
                            {getRoleLabel(userProfile?.role || userRole)}
                        </div>
                    </div>
                    <LogOut size={16} className="text-gray-500 group-hover:text-gray-400 transition-colors" />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
