import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock,
  Eye,
  Calendar,
  Mail
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminUsersView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data?.users || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to permanently delete this user account and its data?')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && (user.status || 'active') !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3d6b35]/10 text-[#3d6b35] border border-[#3d6b35]/20">
            Platform Admin
          </span>
        );
      case 'employer':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4a5e2f]/10 text-[#4a5e2f] border border-[#4a5e2f]/20">
            Enterprise Recruiter
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c8d5a8]/10 text-[#4a5e2f] border border-[#4a5e2f]/20">
            Job Seeker
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">
          User Directory & RBAC Governance
        </h1>
        <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">
          Inspect, manage permissions, suspend bad actors, and audit accounts across all platform roles.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:outline-none focus:ring-2 focus:ring-[#3d6b35]"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#b5aa96] focus:ring-2 focus:ring-[#3d6b35]"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="job_seeker">Job Seekers (Candidates)</option>
              <option value="employer">Enterprise Recruiters</option>
              <option value="admin">Platform Administrators</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#b5aa96] focus:ring-2 focus:ring-[#3d6b35]"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2">
          <Users className="w-8 h-8 mx-auto text-[#6b6151]" />
          <p className="text-sm font-semibold text-[#f0ebe0]">No users match your filter criteria</p>
        </div>
      ) : (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#b5aa96]">
              <thead className="bg-[#f5f0e8]/80 text-[#9a8e7a] font-semibold uppercase tracking-wider border-b border-[#4a4636]">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Platform Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5cec3]">
                {filteredUsers.map(u => {
                  const isSuspended = u.status === 'suspended';
                  return (
                    <tr key={u.id} className="hover:bg-[#2c2a1e]/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#3a3828] text-[#f0ebe0] font-bold flex items-center justify-center text-xs">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-[#f0ebe0] block">{u.name}</span>
                            <span className="text-[11px] text-[#9a8e7a]">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="px-6 py-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            <Lock className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3d6b35] bg-[#3d6b35]/10 px-2 py-0.5 rounded-full border border-[#3d6b35]/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[#9a8e7a]">
                        {new Date(u.created_at || Date.now()).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg bg-[#f5f0e8] hover:bg-[#3a3828] text-[#9a8e7a] hover:text-[#f0ebe0] transition"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {u.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(u.id, u.status || 'active')}
                                className={`p-1.5 rounded-lg transition ${
                                  isSuspended
                                    ? 'bg-[#3d6b35]/10 text-[#3d6b35] hover:bg-[#3d6b35]/20'
                                    : 'bg-[#fde9c0]/10 text-[#b45309] hover:bg-[#fde9c0]/20'
                                }`}
                                title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                              >
                                {isSuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#4a4636] pb-3">
              <h3 className="font-bold text-[#f0ebe0] text-base">User Account Dossier</h3>
              <button onClick={() => setSelectedUser(null)} className="text-[#9a8e7a] hover:text-[#f0ebe0]">✕</button>
            </div>

            <div className="space-y-3 text-xs text-[#b5aa96]">
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">User ID:</span>
                <span className="font-mono text-[#f0ebe0]">#{selectedUser.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Name:</span>
                <span className="font-semibold text-[#f0ebe0]">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Email:</span>
                <span className="text-[#f0ebe0]">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Role:</span>
                <span className="capitalize text-[#3d6b35] font-semibold">{selectedUser.role.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Status:</span>
                <span className="capitalize">{selectedUser.status || 'active'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#9a8e7a]">Registration Date:</span>
                <span>{new Date(selectedUser.created_at || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-[#f5f0e8] hover:bg-[#3a3828] text-[#f0ebe0] text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsersView;


