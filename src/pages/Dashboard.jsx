import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Activity, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeCampaigns: 1, // Hardcoded as per requirements
        pendingReview: 0,
        scheduled: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'content'));
                let pending = 0;
                let scheduled = 0;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.status === 'IN_REVIEW') pending++;
                    if (data.status === 'SCHEDULED') scheduled++;
                });

                setStats(prev => ({
                    ...prev,
                    pendingReview: pending,
                    scheduled: scheduled
                }));
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            label: 'Active Campaigns',
            value: stats.activeCampaigns,
            icon: Activity,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10'
        },
        {
            label: 'Pending Review',
            value: stats.pendingReview,
            icon: Clock,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-400/10'
        },
        {
            label: 'Scheduled Posts',
            value: stats.scheduled,
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Good evening, Alex
                </h1>
                <p className="text-gray-400 mt-2">Here's what's happening with your content today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 transition-all duration-200 hover:border-gray-700 hover:shadow-lg hover:shadow-gray-900/50"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white">{loading ? '-' : stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
