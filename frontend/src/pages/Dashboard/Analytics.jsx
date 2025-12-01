import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, Filter, TrendingUp, Users, PieChart as PieIcon } from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchDepartments();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments", err);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:8080/api/analytics/advanced';
      if (selectedDept) {
        url += `?departmentId=${selectedDept}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analyticsData) return;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headcount Trends
    csvContent += "Headcount Trends\nMonth,Count\n";
    analyticsData.headcountTrends.forEach(row => {
      csvContent += `${row.month},${row.count}\n`;
    });

    // Tenure
    csvContent += "\nTenure Distribution\nCategory,Count\n";
    Object.entries(analyticsData.tenureDistribution).forEach(([key, val]) => {
      csvContent += `${key},${val}\n`;
    });

    // Gender
    csvContent += "\nGender Distribution\nGender,Count\n";
    Object.entries(analyticsData.genderDistribution).forEach(([key, val]) => {
      csvContent += `${key},${val}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${selectedDept || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !analyticsData) {
    return <div className="text-white text-center mt-20">Loading Analytics...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center mt-20">{error}</div>;
  }

  // Transform data for Recharts
  const tenureData = analyticsData ? Object.entries(analyticsData.tenureDistribution).map(([name, value]) => ({ name, value })) : [];
  const genderData = analyticsData ? Object.entries(analyticsData.genderDistribution).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Advanced Analytics</h1>
          <p className="text-slate-400">Deep dive into your workforce metrics.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-midnight-800 border border-white/10 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:border-brand-teal/50 appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-teal text-white font-medium hover:bg-brand-teal/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Headcount Growth */}
        <div className="col-span-1 lg:col-span-2 bg-midnight-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-brand-teal" />
            <h3 className="text-lg font-semibold text-white">Headcount Growth (Last 6 Months)</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.headcountTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="count" stroke="#2dd4bf" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenure Distribution */}
        <div className="bg-midnight-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-brand-purple" />
            <h3 className="text-lg font-semibold text-white">Tenure Distribution</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  cursor={{ fill: '#ffffff05' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Split */}
        <div className="bg-midnight-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-semibold text-white">Gender Demographics</h3>
          </div>
          <div className="h-80 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
