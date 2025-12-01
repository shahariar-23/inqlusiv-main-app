import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import SetupWizard from './pages/SetupWizard/SetupWizard';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import Employees from './pages/Dashboard/Employees';
import Departments from './pages/Dashboard/Departments';
import Settings from './pages/Dashboard/Settings';
import Analytics from './pages/Dashboard/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<SetupWizard />} />
        
        {/* Dashboard Route with Layout */}
        <Route 
          path="/dashboard" 
          element={
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          } 
        />
        
        <Route 
          path="/dashboard/employees" 
          element={
            <DashboardLayout>
              <Employees />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/dashboard/departments" 
          element={
            <DashboardLayout>
              <Departments />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/dashboard/analytics" 
          element={
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/dashboard/settings" 
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          } 
        />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
