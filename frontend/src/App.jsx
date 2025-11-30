import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import SetupWizard from './pages/SetupWizard/SetupWizard';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';

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
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
