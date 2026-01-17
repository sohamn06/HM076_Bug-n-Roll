import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    PenTool,
    Calendar,
    User,
    LogOut
} from 'lucide-react';

const Sidebar = ({ userRole, setUserRole }) => {
    const location = useLocation();

    const navItems = [
        {
            label: 'Dashboard',
            path: '/',
            icon: LayoutDashboard
        },
        {
            label: 'Campaigns',
            path: '/campaigns',
            icon: PenTool
        },
        {
            label: 'Calendar',
            path: '/calendar',
            icon: Calendar
        }
    ];

    const handleRoleToggle = () => {
        setUserRole(userRole === 'MARKETER' ? 'CREATOR' : 'MARKETER');
    };

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col border-r border-gray-800">
            {/* Logo Area */}
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    AdVantage
                </h1>
                <p className="text-xs text-gray-400 mt-1">Marketing SaaS</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon
                                size={20}
                                className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                            />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User / Role Demo Section */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-full ${userRole === 'MARKETER' ? 'bg-purple-500/20' : 'bg-green-500/20'}`}>
                            <User size={20} className={userRole === 'MARKETER' ? 'text-purple-400' : 'text-green-400'} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Demo User</p>
                            <p className="text-xs text-gray-400">{userRole}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleRoleToggle}
                        className="w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                        Switch Role
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
