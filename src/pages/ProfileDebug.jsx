import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Save, Loader } from 'lucide-react';

const ProfileDebug = () => {
    const { currentUser, userProfile } = useAuth();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userProfile?.name) {
            setName(userProfile.name);
        }
    }, [userProfile]);

    const handleUpdateName = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                name: name
            });
            setMessage('✅ Name updated successfully! Please refresh the page.');
        } catch (error) {
            setMessage('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">🔍 Profile Debug Tool</h1>

                {/* Current Profile Data */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Current Profile Data</h2>
                    <div className="space-y-3 font-mono text-sm">
                        <div>
                            <span className="text-gray-400">UID:</span>
                            <span className="text-white ml-2">{currentUser?.uid || 'Not logged in'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Email:</span>
                            <span className="text-white ml-2">{currentUser?.email || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Name:</span>
                            <span className="text-white ml-2">{userProfile?.name || '❌ NOT SET'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Role:</span>
                            <span className="text-white ml-2">{userProfile?.role || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Organization ID:</span>
                            <span className="text-white ml-2">{userProfile?.organizationId || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Full JSON */}
                    <details className="mt-6">
                        <summary className="text-[#6366F1] cursor-pointer hover:text-[#8B5CF6] font-semibold">
                            View Full JSON
                        </summary>
                        <pre className="mt-3 p-4 bg-black/50 rounded-lg text-green-400 text-xs overflow-auto">
                            {JSON.stringify({ currentUser, userProfile }, null, 2)}
                        </pre>
                    </details>
                </div>

                {/* Update Name Form */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Update Your Name</h2>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg ${message.includes('✅')
                                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                                : 'bg-red-500/10 border border-red-500/50 text-red-400'
                            }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleUpdateName} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#6366F1]/50 transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Update Name
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                        💡 <strong>Tip:</strong> If your name is showing as "User" in the sidebar,
                        it means the name field is missing from your Firestore user document.
                        Use this tool to add it!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileDebug;
