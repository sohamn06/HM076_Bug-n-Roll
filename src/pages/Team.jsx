import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, MoreVertical, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrganizationMembers, updateMemberRole, removeMember } from '../firebase';
import { ROLES, getRoleLabel, getRoleBadgeColor, hasPermission, PERMISSIONS } from '../utils/permissions';
import InviteModal from '../components/InviteModal';

const Team = () => {
    const { userProfile } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchMembers = async () => {
        try {
            if (userProfile?.organizationId) {
                const data = await getOrganizationMembers(userProfile.organizationId);
                setMembers(data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [userProfile?.organizationId]);

    const handleRoleUpdate = async (userId, newRole) => {
        setActionLoading(userId);
        try {
            await updateMemberRole(userId, newRole);
            await fetchMembers();
        } catch (error) {
            console.error('Failed to update role');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        setActionLoading(userId);
        try {
            await removeMember(userId);
            setMembers(prev => prev.filter(m => m.id !== userId));
        } catch (error) {
            console.error('Failed to remove member');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
            </div>
        );
    }

    // Check if user has permission to manage team
    if (!hasPermission(userProfile?.role, PERMISSIONS.MANAGE_TEAM)) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Shield className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
                <p className="text-gray-400">You do not have permission to view team settings.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Team Management</h1>
                    <p className="text-gray-400 text-sm">Manage your team members and their permissions.</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <UserPlus size={16} />
                    Invite Member
                </button>
            </div>

            {/* Team List */}
            <div className="bg-[#0f111a] border border-[#1F2937] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#1F2937] bg-[#1F2937]/30">
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date Added</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-[#1F2937]/20 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white font-medium">
                                                {member.name?.charAt(0) || member.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{member.name || 'Unknown User'}</div>
                                                <div className="text-sm text-gray-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded border ${getRoleBadgeColor(member.role)}`}>
                                                {getRoleLabel(member.role)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {member.createdAt?.toDate ? member.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Role Selector (Don't allow changing own role or if loading) */}
                                            {member.id !== userProfile?.uid && (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleUpdate(member.id, e.target.value)}
                                                    disabled={actionLoading === member.id}
                                                    className="bg-[#1F2937] border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 outline-none focus:border-[#6366F1]"
                                                >
                                                    {Object.values(ROLES).map(role => (
                                                        <option key={role} value={role}>{getRoleLabel(role)}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {/* Remove Button */}
                                            {member.id !== userProfile?.uid && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    disabled={actionLoading === member.id}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Remove member"
                                                >
                                                    {actionLoading === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInviteSent={fetchMembers}
            />
        </div>
    );
};

export default Team;
