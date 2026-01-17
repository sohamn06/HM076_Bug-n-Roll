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
import Login from './pages/Login';
import Signup from './pages/Signup';
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

                        {/* Protected Routes */}
                        <Route path="/*" element={
                            <ProtectedRoute>
                                <Layout userRole={userRole} setUserRole={setUserRole}>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/campaigns" element={<Campaigns />} />
                                        <Route path="/editor/:id?" element={<Editor />} />
                                        <Route path="/assets" element={<Assets />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/calendar" element={<Calendar />} />
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
