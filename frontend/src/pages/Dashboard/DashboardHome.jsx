import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Users, 
  TrendingUp, 
  Briefcase, 
  Award, 
  Download, 
  ArrowUpRight,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle
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

const TIPS = [
  "Regular 1:1 meetings increase employee retention by up to 30%.",
  "Diverse teams are 35% more likely to outperform their competitors.",
  "Use the 'Departments' tab to balance headcount across teams.",
  "Schedule quarterly reviews to keep alignment with company goals.",
  "Check the 'Analytics' page for deep dives into tenure trends.",
  "Recognize employee achievements publicly to boost morale.",
  "Ensure job descriptions use inclusive language to attract diverse talent.",
  "Promote internal mobility to keep high performers engaged."
];

const DashboardHome = () => {
  const dashboardRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTip, setCurrentTip] = useState('');
  const [displayedTip, setDisplayedTip] = useState('');
  const [tipCategory, setTipCategory] = useState({ 
    icon: Sparkles, 
    color: 'from-brand-purple to-indigo-600', 
    label: 'AI Smart Insight',
    glow: 'rgba(139, 92, 246, 0.6)'
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    // Set random tip initially from fallback
    setCurrentTip(TIPS[Math.floor(Math.random() * TIPS.length)]);

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
        
        // If we got tips from the backend, use one of them immediately
        if (response.data.tips && response.data.tips.length > 0) {
             setCurrentTip(response.data.tips[Math.floor(Math.random() * response.data.tips.length)]);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Cycle tips every 10 seconds
  useEffect(() => {
      const intervalId = setInterval(() => {
          const sourceTips = (stats && stats.tips && stats.tips.length > 0) ? stats.tips : TIPS;
          setCurrentTip(sourceTips[Math.floor(Math.random() * sourceTips.length)]);
      }, 10000);
      
      return () => clearInterval(intervalId);
  }, [stats]);

  // Handle Tip Animation & Categorization
  useEffect(() => {
    if (!currentTip) return;

    // 1. Analyze Category based on keywords
    let category = { 
        icon: Sparkles, 
        color: 'from-brand-purple to-indigo-600', 
        label: 'AI Smart Insight', 
        glow: 'rgba(139, 92, 246, 0.6)' 
    };
    
    const lower = currentTip.toLowerCase();
    
    if (lower.includes('critical') || lower.includes('crisis') || lower.includes('risk') || lower.includes('alert')) {
        category = { 
            icon: AlertTriangle, 
            color: 'from-rose-500 to-orange-600', 
            label: 'Attention Needed', 
            glow: 'rgba(244, 63, 94, 0.6)' 
        };
    } else if (lower.includes('high morale') || lower.includes('perfect') || lower.includes('success')) {
        category = { 
            icon: CheckCircle, 
            color: 'from-emerald-400 to-teal-500', 
            label: 'Positive Trend', 
            glow: 'rgba(52, 211, 153, 0.6)' 
        };
    } else if (lower.includes('gap') || lower.includes('check') || lower.includes('opportunity')) {
        category = { 
            icon: Sparkles, 
            color: 'from-blue-400 to-indigo-500', 
            label: 'Optimization Opportunity', 
            glow: 'rgba(96, 165, 250, 0.6)' 
        };
    }

    setTipCategory(category);
    setDisplayedTip('');
    
    // 2. Typewriter Effect
    let i = 0;
    const text = currentTip;
    const timer = setInterval(() => {
        setDisplayedTip(text.substring(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(timer);
    }, 10); // Typing speed

    return () => clearInterval(timer);
  }, [currentTip]);

  const handleDownloadReport = async () => {
    if (!dashboardRef.current) return;
    setIsGeneratingPdf(true);

    try {
      // Capture the dashboard container
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#020617', // Match bg-midnight-950
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit width
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pdfWidth;
      const scaledHeight = imgHeight / ratio;

      // Add Header
      pdf.setFillColor(2, 6, 23); // Dark background for header
      pdf.rect(0, 0, pdfWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('Inqlusiv Dashboard Report', 10, 13);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pdfWidth - 10, 13, { align: 'right' });

      // Add Image (split into pages if too long, but for now just one page fit or cut)
      // For a simple dashboard snapshot, we'll just place it below the header
      pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, scaledHeight);

      pdf.save(`Inqlusiv_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
      ref={dashboardRef}
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
        <button 
          onClick={handleDownloadReport}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isGeneratingPdf ? 'Generating...' : 'Download Report'}
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
          
          <div style={{ width: '100%', height: 300 }}>
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

          <div style={{ width: '100%', height: 300 }}>
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
        
        {/* Smart Insight Widget - Intelligent & Dynamic */}
        <motion.div 
            variants={itemVariants}
            className="lg:col-span-1 relative group"
        >
            {/* Dynamic Gradient Border/Glow Effect */}
            <div className={`absolute -inset-[1px] bg-gradient-to-r ${tipCategory.color} rounded-2xl opacity-40 blur-sm group-hover:opacity-80 transition-opacity duration-500`}></div>
            
            <div className="relative h-full bg-midnight-900/90 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-white/10 shadow-2xl overflow-hidden">
                
                {/* Ambient Background Glow based on category */}
                <div 
                    className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-white/5 via-transparent to-transparent rotate-45 pointer-events-none transition-colors duration-1000"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${tipCategory.glow.replace('0.6', '0.15')}, transparent 70%)` }}
                ></div>

                {/* Animated Icon Container */}
                <motion.div 
                    key={tipCategory.label} // Re-trigger animation on category change
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: 1,
                        boxShadow: [
                            `0 0 0px ${tipCategory.glow.replace('0.6', '0')}`,
                            `0 0 25px ${tipCategory.glow}`, 
                            `0 0 0px ${tipCategory.glow.replace('0.6', '0')}`
                        ]
                    }}
                    transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                    }}
                    className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${tipCategory.color} flex items-center justify-center mb-5 shadow-lg border border-white/20`}
                >
                    <tipCategory.icon className="w-8 h-8 text-white drop-shadow-md" />
                </motion.div>
                
                <h3 className="relative z-10 text-white font-display font-bold text-lg mb-3 tracking-wide flex items-center gap-2">
                  {tipCategory.label}
                </h3>
                
                <div className={`relative z-10 h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4`}></div>

                <p className="relative z-10 text-slate-200 text-sm leading-relaxed font-medium min-h-[60px] flex items-center justify-center">
                    {displayedTip}
                    <span className="animate-pulse ml-1 inline-block w-1 h-4 bg-brand-teal align-middle"></span>
                </p>
            </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
