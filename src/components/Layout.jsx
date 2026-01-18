import React from 'react';
import Sidebar from './Sidebar';

import { useLocation } from 'react-router-dom';

const Layout = ({ children, userRole, setUserRole }) => {
    const location = useLocation();
    const isFullHeightPage = location.pathname.startsWith('/editor');

    return (
        <div className="h-screen bg-[#030712] text-white flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar userRole={userRole} setUserRole={setUserRole} />

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-h-0 ${isFullHeightPage ? '' : 'overflow-auto'}`}>
                <div className={isFullHeightPage ? 'flex-1 flex flex-col min-h-0' : 'p-8'}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
