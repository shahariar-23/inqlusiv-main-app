import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Briefcase, 
  Award, 
  Download, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading Dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-white text-center mt-20">Failed to load data.</div>;
  }

  // Transform API data for charts
  console.log("Dashboard Stats Received:", stats);

  let genderDataRaw = stats.genderDistribution || {};
  let deptDataRaw = stats.departmentHeadcount || {};

  // Defensive check: If genderDistribution contains department-like keys (not Male/Female), swap them.
  // This handles cases where the API might inadvertently swap data or if the user is seeing cached weirdness.
  const genderKeys = Object.keys(genderDataRaw);
  const isGenderDataSuspicious = genderKeys.length > 0 && !genderKeys.includes('Male') && !genderKeys.includes('Female');
  
  if (isGenderDataSuspicious) {
      console.warn("Detected potential data swap. Swapping Gender and Department data.");
      const temp = genderDataRaw;
      genderDataRaw = deptDataRaw;
      deptDataRaw = temp;
  }

  // Diversity Metrics (Pie Chart) -> Gender Distribution
  const diversityData = Object.entries(genderDataRaw).map(([name, value]) => ({
    name,
    value,
    color: name === 'Male' ? '#06B6D4' : name === 'Female' ? '#7C3AED' : '#DB2777'
  }));

  const maleCount = genderDataRaw['Male'] || 0;
  const femaleCount = genderDataRaw['Female'] || 0;
  const nonBinaryCount = genderDataRaw['Non-binary'] || 0;
  const otherCount = genderDataRaw['Other'] || 0;

  // Department Headcount (Bar Chart) -> Department Headcount
  const departmentData = Object.entries(deptDataRaw).map(([name, count]) => ({
    name,
    count
  }));

  const STATS_CARDS = [
    { 
      id: 1, 
      label: 'Total Employees', 
      value: stats.totalEmployees, 
      trend: '+12% this month', 
      icon: Users, 
      color: 'text-brand-teal' 
    },
    { 
      id: 2, 
      label: 'Total Departments', 
      value: stats.totalDepartments, 
      trend: 'Stable', 
      icon: Briefcase, 
      color: 'text-brand-purple' 
    },
    // Keep placeholders for others
    { 
      id: 3, 
      label: 'Open Roles', 
      value: stats.openRoles, 
      trend: 'No active listings', 
      icon: TrendingUp, 
      color: 'text-accent-mint' 
    },
    { 
      id: 4, 
      label: 'Retention Rate', 
      value: stats.retentionRate, 
      trend: 'Based on current data', 
      icon: Award, 
      color: 'text-pink-500' 
    },
  ];

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
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
      className="space-y-8"
    >
      {/* A. Hero Section */}
      <motion.div variants={itemVariants} className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Good morning, Admin.
          </h1>
          <p className="text-slate-400">
            Here is your workforce overview for <span className="text-slate-200 font-medium">{currentDate}</span>.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </motion.div>

      {/* B. Smart Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CARDS.map((stat) => (
          <div 
            key={stat.id}
            className="group relative p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5 hover:border-brand-teal/30 hover:-translate-y-1 hover:shadow-neon transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-full bg-white/5 ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${stat.color.replace('text-', 'text-opacity-80 ')}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              {stat.label}
            </h3>
            <div className="text-4xl font-display font-bold text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </motion.div>

      {/* C. Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Diversity Metrics (Pie Chart) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Diversity Metrics</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4]"></span>
                  Male: <span className="text-white font-medium">{maleCount}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
                  Female: <span className="text-white font-medium">{femaleCount}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#DB2777]"></span>
                  Non-binary: <span className="text-white font-medium">{nonBinaryCount}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  Other: <span className="text-white font-medium">{otherCount}</span>
                </div>
              </div>
            </div>
            <button className="text-slate-500 hover:text-white transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diversityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diversityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 2: Department Headcount (Bar Chart) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-semibold text-white">Department Headcount</h3>
            <div className="flex gap-2">
              <select className="bg-midnight-800/50 border border-white/10 rounded-lg text-xs text-slate-300 px-3 py-1 focus:outline-none">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#06B6D4" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* D. Recent Activity Feed */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5">
           <h3 className="text-lg font-display font-semibold text-white mb-6">Recent Activity</h3>
           <div className="space-y-6">
             {stats.recentActivities && stats.recentActivities.map((activity, index) => (
               <div key={index} className="flex gap-4 relative">
                 {/* Connector Line */}
                 {index !== stats.recentActivities.length - 1 && (
                   <div className="absolute left-[9px] top-8 bottom-[-24px] w-[2px] bg-white/5"></div>
                 )}
                 
                 <div className={`relative z-10 w-5 h-5 rounded-full bg-brand-teal shadow-[0_0_10px_rgba(0,0,0,0.5)] flex-shrink-0 mt-1`}></div>
                 
                 <div>
                   <p className="text-slate-300 text-sm font-medium">{activity}</p>
                   <p className="text-slate-500 text-xs mt-1">Just now</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
        
        {/* Placeholder for another widget or empty space */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-midnight-900/60 backdrop-blur-xl border border-white/5 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-purple/20 flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-brand-purple" />
            </div>
            <h3 className="text-white font-display font-semibold text-lg mb-2">Pro Tip</h3>
            <p className="text-slate-400 text-sm">
                Schedule your weekly team syncs directly from the calendar view to boost engagement.
            </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
