import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Editor from './pages/Editor';

function App() {
    const [userRole, setUserRole] = useState('MARKETER');

    return (
        <BrowserRouter>
            <Layout userRole={userRole} setUserRole={setUserRole}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/editor/:id" element={<Editor />} />
                    <Route
                        path="/calendar"
                        element={
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Calendar View Coming Soon
                            </div>
                        }
                    />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
