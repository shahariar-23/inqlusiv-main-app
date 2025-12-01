import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Save, 
  Upload, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  User
} from 'lucide-react';

const Settings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Admin');

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchSettings();
    
    // Check for redirect data from Employees page
    if (location.state?.inviteData) {
      const { name, email } = location.state.inviteData;
      setInviteName(name || '');
      setInviteEmail(email || '');
      setActiveTab('team');
      // Clear state to prevent re-filling on refresh (optional, but good practice)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/company/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
      setCompanyName(response.data.companyName);
      setIndustry(response.data.industry);
    } catch (error) {
      console.error("Error fetching settings", error);
      setMessage({ type: 'error', text: 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/api/company/settings', {
        companyName,
        industry
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Company settings updated successfully.' });
      fetchSettings(); // Refresh data
    } catch (error) {
      console.error("Error updating settings", error);
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds 2MB limit.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/company/logo', formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      setMessage({ type: 'success', text: 'Logo updated successfully.' });
      fetchSettings(); // Refresh to get new logo URL
    } catch (error) {
      console.error("Error uploading logo", error);
      setMessage({ type: 'error', text: 'Failed to upload logo.' });
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/company/invite-admin', {
        email: inviteEmail,
        role: inviteRole,
        fullName: inviteName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      setInviteName('');
      fetchSettings(); // Refresh admin list
    } catch (error) {
      console.error("Error inviting admin", error);
      setMessage({ type: 'error', text: 'Failed to invite admin.' });
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/company/admin/${editingUser.id}`, {
        role: editRole,
        status: editStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'User updated successfully.' });
      setEditingUser(null);
      fetchSettings();
    } catch (error) {
      console.error("Error updating user", error);
      setMessage({ type: 'error', text: 'Failed to update user.' });
    }
  };

  const handleDeleteUser = async () => {
    if (!editingUser) return;
    if (!window.confirm(`Are you sure you want to remove ${editingUser.fullName} from the team?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/company/admin/${editingUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'User removed successfully.' });
      setEditingUser(null);
      fetchSettings();
    } catch (error) {
      console.error("Error deleting user", error);
      setMessage({ type: 'error', text: 'Failed to remove user.' });
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">Loading Settings...</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-5xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Company Settings</h1>
        <p className="text-slate-400">Manage your company profile and team access.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex space-x-1 bg-midnight-900/60 p-1 rounded-xl border border-white/5 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'general' 
              ? 'bg-brand-teal text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            General Info
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'team' 
              ? 'bg-brand-teal text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Management
          </div>
        </button>
      </motion.div>

      {/* Message Alert */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'general' && (
          <motion.div 
            key="general"
            initial="hidden"
            animate="show"
            variants={itemVariants} 
            className="space-y-6"
          >
            {/* Logo Section */}
            <div className="p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5">
              <h3 className="text-lg font-display font-semibold text-white mb-4">Company Logo</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  {settings?.logoUrl ? (
                    <img src={settings.logoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-10 h-10 text-slate-600" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    Upload New Logo
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Recommended size: 400x400px. Max size: 2MB.</p>
                </div>
              </div>
            </div>

            {/* Details Form */}
            <div className="p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5">
              <h3 className="text-lg font-display font-semibold text-white mb-6">Company Details</h3>
              <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-midnight-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-teal/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-midnight-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-teal/50 transition-colors"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-teal text-white font-medium hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div 
            key="team"
            initial="hidden"
            animate="show"
            variants={itemVariants} 
            className="space-y-6"
          >
            {/* Invite Section */}
            <div className="p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5">
              <h3 className="text-lg font-display font-semibold text-white mb-4">Invite New Admin</h3>
              <form onSubmit={handleInviteAdmin} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-midnight-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-teal/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full bg-midnight-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-teal/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-midnight-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-teal/50 transition-colors"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/10"
                >
                  Send Invite
                </button>
              </form>
            </div>

            {/* Admin List */}
            <div className="p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5">
              <h3 className="text-lg font-display font-semibold text-white mb-6">Team Members</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 text-sm">
                      <th className="py-3 px-4 font-medium">Name</th>
                      <th className="py-3 px-4 font-medium">Email</th>
                      <th className="py-3 px-4 font-medium">Role</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium">Last Active</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {settings?.admins?.map((admin) => (
                      <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{admin.fullName}</td>
                        <td className="py-3 px-4 text-slate-300">{admin.email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-medium border border-brand-purple/20">
                            <Shield className="w-3 h-3" />
                            {admin.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            admin.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {admin.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{admin.lastActive}</td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => handleEditClick(admin)}
                            className="text-slate-400 hover:text-white transition-colors text-xs underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-midnight-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                >
                  <h3 className="text-xl font-display font-bold text-white mb-4">Edit User</h3>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                      <input 
                        type="text" 
                        value={editingUser.fullName} 
                        disabled 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                      <input 
                        type="text" 
                        value={editingUser.email} 
                        disabled 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full bg-midnight-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-teal/50"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Viewer">Viewer</option>
                        <option value="Editor">Editor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full bg-midnight-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-teal/50"
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={handleDeleteUser}
                        className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors mr-auto"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-brand-teal text-white font-medium hover:bg-brand-teal/90 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;
