import React from 'react';
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

// --- Mock Data ---
const STATS_DATA = [
  { 
    id: 1, 
    label: 'Total Employees', 
    value: '142', 
    trend: '+12% this month', 
    icon: Users, 
    color: 'text-brand-teal' 
  },
  { 
    id: 2, 
    label: 'Engagement Score', 
    value: '86%', 
    trend: '+4.2% vs last qtr', 
    icon: TrendingUp, 
    color: 'text-brand-purple' 
  },
  { 
    id: 3, 
    label: 'Open Roles', 
    value: '8', 
    trend: '2 filled this week', 
    icon: Briefcase, 
    color: 'text-accent-mint' 
  },
  { 
    id: 4, 
    label: 'Retention Rate', 
    value: '94%', 
    trend: 'Top 5% in industry', 
    icon: Award, 
    color: 'text-pink-500' 
  },
];

const DIVERSITY_DATA = [
  { name: 'Male', value: 45, color: '#06B6D4' }, // brand-teal
  { name: 'Female', value: 42, color: '#7C3AED' }, // brand-purple
  { name: 'Non-Binary', value: 8, color: '#DB2777' }, // pink-600
  { name: 'Prefer not to say', value: 5, color: '#94A3B8' }, // slate-400
];

const DEPARTMENT_DATA = [
  { name: 'Eng', count: 45 },
  { name: 'Sales', count: 32 },
  { name: 'Mktg', count: 24 },
  { name: 'HR', count: 12 },
  { name: 'Ops', count: 18 },
  { name: 'Design', count: 11 },
];

const ACTIVITY_DATA = [
  { id: 1, text: 'New employee added: Sarah Jenkins (Engineering)', time: '2 hours ago', color: 'bg-brand-teal' },
  { id: 2, text: 'Q3 Engagement Survey completed', time: '5 hours ago', color: 'bg-brand-purple' },
  { id: 3, text: 'Department headcount updated for Sales', time: '1 day ago', color: 'bg-accent-mint' },
  { id: 4, text: 'System maintenance scheduled', time: '2 days ago', color: 'bg-slate-500' },
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

const DashboardHome = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
        {STATS_DATA.map((stat) => (
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
            <h3 className="text-lg font-display font-semibold text-white">Diversity Metrics</h3>
            <button className="text-slate-500 hover:text-white transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DIVERSITY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DIVERSITY_DATA.map((entry, index) => (
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

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
             {ACTIVITY_DATA.map((activity, index) => (
               <div key={activity.id} className="flex gap-4 relative">
                 {/* Connector Line */}
                 {index !== ACTIVITY_DATA.length - 1 && (
                   <div className="absolute left-[9px] top-8 bottom-[-24px] w-[2px] bg-white/5"></div>
                 )}
                 
                 <div className={`relative z-10 w-5 h-5 rounded-full ${activity.color} shadow-[0_0_10px_rgba(0,0,0,0.5)] flex-shrink-0 mt-1`}></div>
                 
                 <div>
                   <p className="text-slate-300 text-sm font-medium">{activity.text}</p>
                   <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
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
