import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, userRole, setUserRole }) => {
    return (
        <div className="min-h-screen bg-[#030712] text-white flex">
            {/* Sidebar */}
            <Sidebar userRole={userRole} setUserRole={setUserRole} />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
