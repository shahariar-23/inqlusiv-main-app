import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Step1Company, Step2Admin, Step3Departments, Step4Employees, Step5Preferences } from './StepComponents';

const SetupWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Company
    companyName: '',
    industry: '',
    region: '',
    logo: null,
    
    // Step 2: Admin
    adminName: '',
    adminTitle: '',
    adminEmail: '',
    adminRole: '',
    
    // Step 3: Departments
    departments: [],
    newDepartment: '',
    
    // Step 4: Employees
    employeeFile: null,
    
    // Step 5: Preferences
    preferences: {
      notifications: true,
      analytics: true,
      autoInvite: false
    },
    selectedMetrics: []
  });

  const steps = [
    { id: 1, label: 'Company Profile' },
    { id: 2, label: 'Admin Profile' },
    { id: 3, label: 'Departments' },
    { id: 4, label: 'Bulk Upload' },
    { id: 5, label: 'Preferences' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: !prev.preferences[key] }
    }));
  };

  const handleMetricToggle = (metric) => {
    setFormData(prev => {
      const metrics = prev.selectedMetrics.includes(metric)
        ? prev.selectedMetrics.filter(m => m !== metric)
        : [...prev.selectedMetrics, metric];
      return { ...prev, selectedMetrics: metrics };
    });
  };

  // Department Logic
  const addDepartment = () => {
    if (formData.newDepartment.trim() && !formData.departments.includes(formData.newDepartment.trim())) {
      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, prev.newDepartment.trim()],
        newDepartment: ''
      }));
    }
  };

  const removeDepartment = (deptToRemove) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== deptToRemove)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const data = new FormData();
      data.append('companyName', formData.companyName);
      data.append('industry', formData.industry);
      data.append('region', formData.region);
      data.append('adminName', formData.adminName);
      data.append('adminTitle', formData.adminTitle);
      data.append('adminEmail', formData.adminEmail);
      
      // Append Departments
      formData.departments.forEach(dept => {
        data.append('departments', dept);
      });
      
      // Append Preferences
      data.append('notifications', formData.preferences.notifications);
      data.append('analytics', formData.preferences.analytics);
      data.append('autoInvite', formData.preferences.autoInvite);
      
      // Append Selected Metrics
      formData.selectedMetrics.forEach(metric => {
        data.append('selectedMetrics', metric);
      });
      
      // Append File
      if (formData.employeeFile) {
        data.append('employeeFile', formData.employeeFile);
      }

      await axios.post('http://localhost:8080/api/company/setup', data, {
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Setup failed", error);
      alert("Failed to save setup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Company formData={formData} handleChange={handleChange} />;
      case 2: return <Step2Admin formData={formData} handleChange={handleChange} />;
      case 3: return <Step3Departments formData={formData} handleChange={handleChange} addDepartment={addDepartment} removeDepartment={removeDepartment} />;
      case 4: return <Step4Employees formData={formData} handleChange={handleChange} />;
      case 5: return <Step5Preferences formData={formData} handleMetricToggle={handleMetricToggle} handlePreferenceToggle={handlePreferenceToggle} />;
      default: return null;
    }
  };

  // Calculate progress percentage for the line
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen w-full bg-midnight-950 bg-grid-slate font-body text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Radial Fade Overlay */}
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="font-display text-4xl font-bold text-white mb-2">Welcome to Inqlusiv</h1>
          <p className="font-body text-lg text-slate-400">Let's set up your workspace</p>
        </div>

        {/* Main Card */}
        <div className="bg-midnight-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-brand p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Progress Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              {/* Progress Line Background */}
              <div className="absolute top-5 left-0 w-full h-0.5 bg-midnight-600">
                {/* Active Progress Line */}
                <div 
                  className="h-full bg-hero-gradient transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Steps */}
              {steps.map((step, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isActive = stepNum === currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div 
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                        ${isCompleted ? 'bg-brand-teal text-white' : 
                          isActive ? 'bg-brand-teal text-white shadow-neon' : 
                          'bg-midnight-800 text-midnight-600 border border-midnight-600'}
                      `}
                    >
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <span 
                      className={`
                        mt-2 text-xs font-medium transition-colors
                        ${isCompleted ? 'text-accent-mint' : 
                          isActive ? 'text-white' : 'text-midnight-600'}
                      `}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
            <button 
              onClick={handleBack}
              className={`px-6 py-3 text-slate-400 hover:text-white transition-colors rounded-xl font-medium ${currentStep === 1 ? 'invisible' : ''}`}
            >
              Back
            </button>
            
            <button 
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-8 py-3 bg-hero-gradient text-white rounded-xl shadow-lg hover:scale-105 transition-transform font-semibold disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Processing...' : currentStep === steps.length ? 'Complete Setup' : 'Continue'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-sm animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Powered by Inqlusiv • Secure & Compliant
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
