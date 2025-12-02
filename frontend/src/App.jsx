import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import SetupWizard from './pages/SetupWizard/SetupWizard';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import Employees from './pages/Dashboard/Employees';
import Departments from './pages/Dashboard/Departments';
import Settings from './pages/Dashboard/Settings';
import Analytics from './pages/Dashboard/Analytics';
import Surveys from './pages/Dashboard/Surveys';
import SurveyBuilder from './pages/Dashboard/SurveyBuilder';
import SurveyResults from './pages/Dashboard/SurveyResults';
import SurveyTaker from './pages/Public/SurveyTaker';
import UserManagement from './pages/Dashboard/UserManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="/s/:token" element={<SurveyTaker />} />
        
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
          path="/dashboard/users" 
          element={
            <DashboardLayout>
              <UserManagement />
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
          path="/dashboard/surveys" 
          element={
            <DashboardLayout>
              <Surveys />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/dashboard/surveys/new" 
          element={
            <DashboardLayout>
              <SurveyBuilder />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/dashboard/surveys/:id/results" 
          element={
            <DashboardLayout>
              <SurveyResults />
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
