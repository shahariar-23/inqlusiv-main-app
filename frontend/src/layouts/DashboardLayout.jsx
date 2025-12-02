import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Zap,
  ClipboardList
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/dashboard/employees?search=${encodeURIComponent(searchQuery)}&scope=global`);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Employees', path: '/dashboard/employees' },
    { icon: Users, label: 'Users', path: '/dashboard/users' },
    { icon: Building2, label: 'Departments', path: '/dashboard/departments' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: ClipboardList, label: 'Surveys', path: '/dashboard/surveys' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 font-body selection:bg-brand-teal/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="fixed inset-0 bg-grid-slate pointer-events-none" />
      <div className="fixed inset-0 bg-radial-fade pointer-events-none" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-midnight-900/60 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <span className="text-2xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Inqlusiv.
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-purple/10 text-brand-purple border-l-2 border-brand-purple' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-brand-purple' : 'text-slate-500 group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-teal to-brand-purple flex items-center justify-center text-xs font-bold text-white">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@inqlusiv.io</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 px-8 flex items-center justify-between bg-midnight-900/60 backdrop-blur-xl border-b border-white/5">
          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employee or department..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-midnight-800/50 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-transparent transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-purple to-brand-teal text-white text-sm font-medium shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 transition-all hover:-translate-y-0.5">
              <Zap className="w-4 h-4 fill-current" />
              <span>Quick Action</span>
            </button>
            
            <button className="relative p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-teal rounded-full animate-ping" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-teal rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
