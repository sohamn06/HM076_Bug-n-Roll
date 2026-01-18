import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Editor from './pages/Editor';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Assets from './pages/Assets';
import Inbox from './pages/Inbox';
import ApprovalQueue from './pages/ApprovalQueue';
import ClientView from './pages/ClientView';
import BrandedReport from './pages/BrandedReport';
import Team from './pages/Team';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TestSocial from './pages/TestSocial';
import ProfileDebug from './pages/ProfileDebug';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
    const [userRole, setUserRole] = useState('admin');

    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/share/:hash" element={<ClientView />} />

                        {/* Protected Routes */}
                        <Route path="/*" element={
                            <ProtectedRoute>
                                <Layout userRole={userRole} setUserRole={setUserRole}>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/campaigns" element={<Campaigns />} />
                                        <Route path="/inbox" element={<Inbox />} />
                                        <Route path="/editor/:id?" element={<Editor />} />
                                        <Route path="/assets" element={<Assets />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/calendar" element={<Calendar />} />
                                        <Route path="/test-social" element={<TestSocial />} />
                                        <Route path="/approvals" element={<ApprovalQueue />} />
                                        <Route path="/team" element={<Team />} />
                                        <Route path="/reports" element={<BrandedReport />} />
                                        <Route path="/profile-debug" element={<ProfileDebug />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
