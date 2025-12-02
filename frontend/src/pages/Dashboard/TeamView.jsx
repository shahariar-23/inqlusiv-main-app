import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Mail, 
  Briefcase, 
  CheckCircle, 
  Clock,
  Search
} from 'lucide-react';

const TeamView = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    } catch (err) {
      console.error("Error fetching team", err);
      setError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => 
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.fullName && member.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
          <p className="text-gray-500 mt-1">Overview of your department members.</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filteredMembers.length}</span> members
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {member.fullName ? member.fullName.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.fullName || 'No Name'}</h3>
                  <p className="text-sm text-gray-500">{member.role.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={16} className="mr-3 text-gray-400" />
                <span className="truncate">{member.email}</span>
              </div>
              
              {/* Mock Status for Demo */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">Survey Status</span>
                <span className="flex items-center text-orange-600 font-medium">
                  <Clock size={14} className="mr-1.5" />
                  Pending
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && !error && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">No team members found</p>
            <p className="text-sm">Users assigned to your department will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamView;
