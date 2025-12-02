import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Mail, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Search,
  Send
} from 'lucide-react';

const TeamView = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentName, setDepartmentName] = useState('My Department');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/users/my-team', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(response.data);
      
      // Extract department name from the first record if available
      if (response.data.length > 0 && response.data[0].departmentName) {
        setDepartmentName(response.data[0].departmentName);
      }
    } catch (err) {
      console.error("Error fetching team", err);
      setError('Failed to load team members. You might not be a Department Manager.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = (member) => {
    alert(`Reminder sent to ${member.fullName} (${member.email})!`);
  };

  const filteredMembers = teamMembers.filter(member => 
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.fullName && member.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats Calculation
  const totalMembers = teamMembers.length;
  const completedCount = teamMembers.filter(m => m.status === 'Completed').length;
  const pendingCount = teamMembers.filter(m => m.status === 'Pending').length;
  const notStartedCount = teamMembers.filter(m => m.status === 'Not Started').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Overview - {departmentName}</h1>
        <p className="text-gray-500 mt-1">Manage your team's survey participation and status.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Team Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalMembers}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Survey Completion</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{completedCount}/{totalMembers}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${totalMembers > 0 ? (completedCount / totalMembers) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Action</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{pendingCount + notStartedCount}</p>
            </div>
            <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Survey Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        {member.fullName ? member.fullName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.fullName || 'No Name'}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {member.role.replace('_', ' ')}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${member.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        member.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {member.status === 'Completed' && <CheckCircle size={12} className="mr-1" />}
                      {member.status === 'Pending' && <Clock size={12} className="mr-1" />}
                      {member.status === 'Not Started' && <AlertCircle size={12} className="mr-1" />}
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {(member.status === 'Pending' || member.status === 'Not Started') && (
                      <button 
                        onClick={() => handleSendReminder(member)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Send size={12} className="mr-1.5" />
                        Send Reminder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No team members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
