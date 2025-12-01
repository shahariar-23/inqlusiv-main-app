import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Calendar, BarChart2, Edit, Play, Trash2, FileText } from 'lucide-react';

const Surveys = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/surveys', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSurveys(response.data);
    } catch (error) {
      console.error("Error fetching surveys", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (id) => {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:8080/api/surveys/${id}/launch`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchSurveys(); // Refresh list
      } catch (error) {
          console.error("Error launching survey", error);
          alert("Failed to launch survey");
      }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CLOSED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Surveys</h1>
          <p className="text-slate-400">Manage and track employee sentiment surveys.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/surveys/new')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-midnight-950 font-semibold rounded-lg hover:bg-teal-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Survey
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <div key={survey.id} className="bg-midnight-900/60 backdrop-blur-xl border border-white/5 rounded-xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(survey.status)}`}>
                {survey.status}
              </div>
              {survey.deadline && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(survey.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{survey.title}</h3>
            <p className="text-slate-400 text-sm mb-6 line-clamp-2">{survey.description}</p>

            <div className="mt-auto flex gap-3">
              {survey.status === 'DRAFT' ? (
                <>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleLaunch(survey.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple border border-brand-purple/20 text-sm transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Launch
                  </button>
                </>
              ) : (
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors">
                  <BarChart2 className="w-4 h-4" />
                  View Results
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Surveys;
