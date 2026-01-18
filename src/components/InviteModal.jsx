import React, { useState } from 'react';
import { X, Mail, Shield, Loader2 } from 'lucide-react';
import { inviteUser } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ROLES, getRoleLabel } from '../utils/permissions';

const InviteModal = ({ isOpen, onClose, onInviteSent }) => {
    const { userProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('VIEWER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await inviteUser(email, role, userProfile.organizationId, userProfile.uid);
            onInviteSent();
            onClose();
            setEmail('');
            setRole('VIEWER');
        } catch (err) {
            setError('Failed to send invitation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f111a] rounded-xl border border-[#1F2937] w-full max-w-md overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1F2937]">
                    <h2 className="text-xl font-semibold text-white">Invite Team Member</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1F2937]/50 border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition-colors"
                                placeholder="colleague@company.com"
                                required
                            />
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Role</label>
                        <div className="relative">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-[#1F2937]/50 border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#6366F1] transition-colors appearance-none cursor-pointer"
                            >
                                {Object.values(ROLES).filter(r => r !== 'ADMIN').map((r) => (
                                    <option key={r} value={r}>
                                        {getRoleLabel(r)}
                                    </option>
                                ))}
                            </select>
                            <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {role === 'MARKETER' && "Can create, approve, and manage content."}
                            {role === 'EDITOR' && "Can create and edit content, but cannot approve."}
                            {role === 'VIEWER' && "Read-only access to campaigns and content."}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteModal;
