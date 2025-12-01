import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, BarChart2, MessageSquare } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const SurveyResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/surveys/${id}/results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching survey results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) return <div className="text-white text-center mt-20">Loading Results...</div>;
  if (!results) return <div className="text-white text-center mt-20">Failed to load results.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard/surveys')}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{results.title}</h1>
          <p className="text-slate-400">Survey Results Overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-brand-teal/10 text-brand-teal">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Total Responses</span>
          </div>
          <div className="text-3xl font-bold text-white">{results.totalResponses}</div>
        </div>
      </div>

      {/* Questions Analysis */}
      <div className="space-y-6">
        {results.questions.map((question, index) => (
          <div key={question.questionId} className="p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Question {index + 1}</span>
                <h3 className="text-lg font-semibold text-white mt-1">{question.text}</h3>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-400 border border-white/5">
                {question.type.replace('_', ' ')}
              </div>
            </div>

            {/* Visualization based on type */}
            {question.type === 'RATING_SCALE' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-brand-purple">{question.averageRating?.toFixed(1)}</div>
                  <div className="text-sm text-slate-400">Average Rating<br/>out of 5.0</div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={Object.entries(question.answerDistribution || {}).map(([key, value]) => ({ name: key, value }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      />
                      <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {question.type === 'MULTIPLE_CHOICE' && (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={Object.entries(question.answerDistribution || {}).map(([key, value]) => ({ name: key, value }))}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} width={100} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#06B6D4" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {question.type === 'OPEN_TEXT' && (
              <div className="space-y-3">
                {question.textAnswers && question.textAnswers.length > 0 ? (
                  question.textAnswers.map((answer, i) => (
                    <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-sm">
                      "{answer}"
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-sm">No text responses yet.</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyResults;
