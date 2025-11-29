import { Upload, Plus, X, FileSpreadsheet, CheckCircle2, Building2, User, Users, BarChart3, ChevronDown } from 'lucide-react';

// --- Reusable UI Components ---

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="animate-fade-up">
    <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-midnight-800/50 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="animate-fade-up">
    <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-midnight-800/50 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all appearance-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-midnight-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
    </div>
  </div>
);

// --- Step 1: Company Profile ---
export const Step1Company = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h2 className="font-display text-2xl font-bold text-white mb-6">Company Information</h2>
    
    <div className="flex justify-center mb-8 animate-fade-up">
      <label className="cursor-pointer group">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-midnight-600 group-hover:border-brand-purple transition-colors flex flex-col items-center justify-center bg-midnight-800/30">
          {formData.logo ? (
             <img src={URL.createObjectURL(formData.logo)} className="w-full h-full rounded-full object-cover" alt="Company Logo" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-brand-purple transition-colors" />
              <span className="text-xs text-slate-400">Upload Logo</span>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleChange('logo', e.target.files[0])}
        />
      </label>
    </div>

    <InputField 
      label="Company Name" 
      value={formData.companyName} 
      onChange={(e) => handleChange('companyName', e.target.value)}
      placeholder="Acme Corporation"
    />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SelectField 
        label="Industry"
        value={formData.industry}
        onChange={(e) => handleChange('industry', e.target.value)}
        options={[
          { value: '', label: 'Select Industry' },
          { value: 'Technology', label: 'Technology' },
          { value: 'Finance', label: 'Finance' },
          { value: 'Healthcare', label: 'Healthcare' },
          { value: 'Retail', label: 'Retail' },
        ]}
      />
      <SelectField 
        label="Region"
        value={formData.region}
        onChange={(e) => handleChange('region', e.target.value)}
        options={[
          { value: '', label: 'Select Region' },
          { value: 'North America', label: 'North America' },
          { value: 'Europe', label: 'Europe' },
          { value: 'Asia Pacific', label: 'Asia Pacific' },
        ]}
      />
    </div>
  </div>
);

// --- Step 2: Admin Profile ---
export const Step2Admin = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h2 className="font-display text-2xl font-bold text-white mb-6">Administrator Profile</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField 
        label="Full Name" 
        value={formData.adminName} 
        onChange={(e) => handleChange('adminName', e.target.value)}
        placeholder="John Doe"
      />
      <InputField 
        label="Job Title" 
        value={formData.adminTitle} 
        onChange={(e) => handleChange('adminTitle', e.target.value)}
        placeholder="HR Director"
      />
    </div>
    
    <InputField 
      label="Email Address" 
      value={formData.adminEmail} 
      onChange={(e) => handleChange('adminEmail', e.target.value)}
      placeholder="john.doe@company.com"
      type="email"
    />
    
    <SelectField 
      label="Role"
      value={formData.adminRole}
      onChange={(e) => handleChange('adminRole', e.target.value)}
      options={[
        { value: '', label: 'Select Role' },
        { value: 'CEO', label: 'CEO' },
        { value: 'CTO', label: 'CTO' },
        { value: 'HR Director', label: 'HR Director' },
        { value: 'Manager', label: 'Manager' },
      ]}
    />
  </div>
);

// --- Step 3: Departments ---
export const Step3Departments = ({ formData, handleChange, addDepartment, removeDepartment }) => (
  <div className="space-y-6">
    <h2 className="font-display text-2xl font-bold text-white mb-6">Add Departments</h2>
    
    <div className="flex gap-2 animate-fade-up">
      <input 
        type="text" 
        value={formData.newDepartment}
        onChange={(e) => handleChange('newDepartment', e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
        className="flex-1 px-4 py-3 bg-midnight-800/50 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
        placeholder="Enter department name"
      />
      <button 
        onClick={addDepartment}
        className="px-6 py-3 bg-hero-gradient text-white rounded-xl font-semibold hover:scale-105 transition-transform flex items-center"
      >
        <Plus className="w-5 h-5 mr-1" /> Add
      </button>
    </div>
    
    <div className="flex flex-wrap gap-2 min-h-[100px] animate-fade-up" style={{ animationDelay: '0.1s' }}>
      {formData.departments.length === 0 && (
        <p className="text-slate-500 text-sm w-full">No departments added yet</p>
      )}
      {formData.departments.map((dept, idx) => (
        <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 bg-midnight-800 text-accent-sky rounded-full text-sm font-medium border border-white/5">
          {dept}
          <button 
            onClick={() => removeDepartment(dept)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  </div>
);

// --- Step 4: Employees ---
export const Step4Employees = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h2 className="font-display text-2xl font-bold text-white mb-6">Bulk Employee Upload</h2>
    
    <div className="animate-fade-up">
      <label className="cursor-pointer block">
        <div className="border-2 border-dashed border-midnight-600 rounded-2xl p-12 text-center bg-midnight-800/30 hover:border-brand-purple transition-all hover:shadow-neon group">
          <div className="w-16 h-16 mx-auto bg-midnight-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-8 h-8 text-brand-teal" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {formData.employeeFile ? formData.employeeFile.name : 'Drop your CSV file here'}
          </h3>
          <p className="text-slate-400 text-sm mb-4">or click to browse</p>
          <p className="text-xs text-slate-500">Supported format: CSV (Max 10MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".csv,.xlsx"
          onChange={(e) => handleChange('employeeFile', e.target.files[0])}
        />
      </label>
    </div>
    
    <div className="bg-midnight-800/30 rounded-xl p-4 animate-fade-up border border-white/5" style={{ animationDelay: '0.1s' }}>
      <h4 className="text-sm font-semibold text-white mb-2">CSV Format Requirements:</h4>
      <ul className="text-xs text-slate-400 space-y-1">
        <li>• First Name, Last Name, Email, Department</li>
        <li>• Include header row</li>
        <li>• UTF-8 encoding recommended</li>
      </ul>
    </div>
  </div>
);

// --- Step 5: Preferences ---
export const Step5Preferences = ({ formData, handleMetricToggle, handlePreferenceToggle }) => (
  <div className="space-y-8">
    <h2 className="font-display text-2xl font-bold text-white mb-6">Workspace Preferences</h2>
    
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white animate-fade-up">Notifications</h3>
      
      <div className="space-y-3">
        {[
          { id: 'notifications', label: 'Email Notifications', desc: 'Receive updates via email' },
          { id: 'analytics', label: 'Analytics Dashboard', desc: 'Enable advanced analytics' },
          { id: 'autoInvite', label: 'Auto-Invite Employees', desc: 'Send invites automatically' }
        ].map((pref, idx) => (
          <div key={pref.id} className="flex items-center justify-between p-4 bg-midnight-800/30 rounded-xl animate-fade-up border border-white/5" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
            <div>
              <p className="text-white font-medium">{pref.label}</p>
              <p className="text-sm text-slate-400">{pref.desc}</p>
            </div>
            <div 
              onClick={() => handlePreferenceToggle(pref.id)}
              className={`toggle-switch ${formData.preferences[pref.id] ? 'active' : ''}`}
            />
          </div>
        ))}
      </div>
    </div>
    
    <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
      <h3 className="text-lg font-semibold text-white">Key Metrics to Track</h3>
      <div className="grid grid-cols-2 gap-3">
        {['Engagement Score', 'DEI Index', 'Retention Rate', 'Satisfaction'].map((metric) => (
          <div 
            key={metric}
            onClick={() => handleMetricToggle(metric)}
            className={`
              p-4 bg-midnight-800/30 rounded-xl cursor-pointer transition-all hover:scale-105 border
              ${formData.selectedMetrics.includes(metric) 
                ? 'border-brand-teal ring-1 ring-brand-teal bg-brand-teal/10' 
                : 'border-white/5 hover:border-white/20'}
            `}
          >
            <p className={`font-medium text-center ${formData.selectedMetrics.includes(metric) ? 'text-brand-teal' : 'text-white'}`}>
              {metric}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
