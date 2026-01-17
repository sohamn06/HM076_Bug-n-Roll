import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, userRole, setUserRole }) => {
    return (
        <div className="flex h-screen bg-gray-950 text-white">
            {/* Sidebar Section */}
            <Sidebar userRole={userRole} setUserRole={setUserRole} />

            {/* Main Content Section */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
