import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, User, X, ChevronLeft, ChevronRight, MoreVertical, UserMinus, Shield } from 'lucide-react';

const Employees = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [scope, setScope] = useState(searchParams.get('scope') || 'basic');
  const [departmentId, setDepartmentId] = useState(location.state?.departmentId || null);
  const [departmentName, setDepartmentName] = useState(location.state?.departmentName || null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeToUpdateStatus, setEmployeeToUpdateStatus] = useState(null);
  const [employeeToCreateUser, setEmployeeToCreateUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const [newEmployee, setNewEmployee] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    gender: 'Male',
    departmentId: '',
    location: '',
    startDate: ''
  });

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    departmentId: ''
  });

  const [statusUpdate, setStatusUpdate] = useState({
    status: 'TERMINATED',
    exitDate: new Date().toISOString().split('T')[0]
  });

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = { search, scope, page, size: 10 };
      if (departmentId) params.departmentId = departmentId;

      const response = await axios.get('http://localhost:8080/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching employees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [search, scope, departmentId, page]);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlScope = searchParams.get('scope');
    if (urlSearch) {
      setSearch(urlSearch);
    }
    if (urlScope) {
      setScope(urlScope);
    }
  }, [searchParams]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...newEmployee,
        departmentId: newEmployee.departmentId === '' ? null : newEmployee.departmentId
      };
      
      if (isEditMode && newEmployee.id) {
        await axios.put(`http://localhost:8080/api/employees/${newEmployee.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:8080/api/employees', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setIsModalOpen(false);
      setNewEmployee({ id: null, firstName: '', lastName: '', email: '', jobTitle: '', gender: 'Male', departmentId: '', location: '', startDate: '' });
      setIsEditMode(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee", error);
      alert("Failed to save employee");
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!employeeToUpdateStatus) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/employees/${employeeToUpdateStatus.id}/status`, statusUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsStatusModalOpen(false);
      setEmployeeToUpdateStatus(null);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating status", error);
      alert("Failed to update status");
    }
  };

  const handleCreateUserClick = (employee, e) => {
    e.stopPropagation();
    setEmployeeToCreateUser(employee);
    setNewUser({
      fullName: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      password: '',
      role: 'EMPLOYEE',
      departmentId: employee.departmentId || ''
    });
    setIsUserModalOpen(true);
    setActiveMenu(null);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsUserModalOpen(false);
      setEmployeeToCreateUser(null);
      setNewUser({ fullName: '', email: '', password: '', role: 'EMPLOYEE', departmentId: '' });
      alert("User account created successfully!");
    } catch (error) {
      console.error("Error creating user", error);
      alert(error.response?.data || "Failed to create user account");
    }
  };

  const handleEditClick = (employee, e) => {
    e.stopPropagation();
    setNewEmployee({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      jobTitle: employee.jobTitle,
      gender: employee.gender || 'Male',
      departmentId: employee.departmentId || '',
      location: employee.location || '',
      startDate: employee.startDate || ''
    });
    setIsEditMode(true);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteClick = (employee, e) => {
    e.stopPropagation();
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const handleStatusClick = (employee, e) => {
    e.stopPropagation();
    setEmployeeToUpdateStatus(employee);
    setStatusUpdate({
      status: 'TERMINATED',
      exitDate: new Date().toISOString().split('T')[0]
    });
    setIsStatusModalOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/employees/${employeeToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee", error);
      alert("Failed to delete employee");
    }
  };

  const handleAddToTeam = (employee, e) => {
    e.stopPropagation();
    navigate('/dashboard/settings', { 
      state: { 
        inviteData: { 
          name: `${employee.firstName} ${employee.lastName}`, 
          email: employee.email 
        } 
      } 
    });
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Active</span>;
      case 'TERMINATED':
        return <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">Terminated</span>;
      case 'RESIGNED':
        return <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">Resigned</span>;
      case 'ON_LEAVE':
        return <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">On Leave</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Active</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-display font-bold text-white">
            {departmentName ? `${departmentName} Employees` : 'Employees'}
          </h1>
          {departmentId && (
            <button 
              onClick={() => { setDepartmentId(null); setDepartmentName(null); }}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-sm text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
              Clear Filter
            </button>
          )}
        </div>
        <button 
          onClick={() => {
            setNewEmployee({ id: null, firstName: '', lastName: '', email: '', jobTitle: '', gender: 'Male', departmentId: '', location: '', startDate: '' });
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-teal to-brand-purple text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Add/Edit Employee Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.jobTitle}
                    onChange={(e) => setNewEmployee({...newEmployee, jobTitle: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={newEmployee.location}
                      onChange={(e) => setNewEmployee({...newEmployee, location: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newEmployee.startDate}
                      onChange={(e) => setNewEmployee({...newEmployee, startDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Gender</label>
                    <select
                      value={newEmployee.gender}
                      onChange={(e) => setNewEmployee({...newEmployee, gender: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                    <select
                      value={newEmployee.departmentId}
                      onChange={(e) => setNewEmployee({...newEmployee, departmentId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    >
                      <option value="">Select Dept</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-teal to-brand-purple text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    {isEditMode ? 'Update Employee' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create User Account</h2>
                <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="DEPT_MANAGER">Dept Manager</option>
                      <option value="HR_MANAGER">HR Manager</option>
                      <option value="COMPANY_ADMIN">Company Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                    <select
                      value={newUser.departmentId}
                      onChange={(e) => setNewUser({...newUser, departmentId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    >
                      <option value="">Select Dept</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-teal to-brand-purple text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {isStatusModalOpen && employeeToUpdateStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Update Status</h2>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                  <p className="text-white font-medium">{employeeToUpdateStatus.firstName} {employeeToUpdateStatus.lastName}</p>
                  <p className="text-sm text-slate-400">{employeeToUpdateStatus.jobTitle}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">New Status</label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="TERMINATED">Terminated</option>
                    <option value="RESIGNED">Resigned</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="ACTIVE">Active</option>
                  </select>
                </div>

                {(statusUpdate.status === 'TERMINATED' || statusUpdate.status === 'RESIGNED') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Exit Date</label>
                    <input
                      type="date"
                      value={statusUpdate.exitDate}
                      onChange={(e) => setStatusUpdate({...statusUpdate, exitDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsStatusModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-teal to-brand-purple text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && employeeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Delete Employee</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-300">Are you sure you want to delete this employee? This action cannot be undone.</p>
                
                <div className="bg-white/5 rounded-lg p-4 space-y-2 border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="text-white font-medium">{employeeToDelete.firstName} {employeeToDelete.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white">{employeeToDelete.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Job Title:</span>
                    <span className="text-white">{employeeToDelete.jobTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-white">{employeeToDelete.departmentName || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-lg bg-red-500/80 text-white font-medium hover:bg-red-500 transition-colors"
                  >
                    Delete Employee
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5">
        <div className="flex justify-end mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setScope('basic'); // Switch to basic search when typing in local search bar
                setPage(0);
              }}
              className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-brand-teal/50 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-sm uppercase tracking-wider">
                <th className="pb-4 pl-4">Name</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Job Title</th>
                <th className="pb-4">Department</th>
                <th className="pb-4">Location</th>
                <th className="pb-4">Start Date</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-400">No employees found.</td></tr>
              ) : (
                employees.map((employee) => (
                  <motion.tr 
                    key={employee.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple font-bold">
                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{employee.firstName} {employee.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{employee.email}</td>
                    <td className="py-4 text-slate-300">{employee.jobTitle}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 rounded-full bg-white/5 text-xs text-slate-300 border border-white/10">
                        {employee.departmentName || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-300">{employee.location}</td>
                    <td className="py-4 text-slate-300">{employee.startDate}</td>
                    <td className="py-4">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={(e) => toggleMenu(employee.id, e)}
                          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {activeMenu === employee.id && (
                          <div className="absolute right-0 top-full mt-2 w-40 bg-midnight-800 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                            <button 
                              onClick={(e) => handleEditClick(employee, e)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                            >
                              <Edit2 className="w-3 h-3" /> Edit Profile
                            </button>
                            <button 
                              onClick={(e) => handleCreateUserClick(employee, e)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                            >
                              <Shield className="w-3 h-3" /> Add to Users List
                            </button>
                            {employee.status === 'ACTIVE' && (
                              <button 
                                onClick={(e) => handleAddToTeam(employee, e)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                              >
                                <Shield className="w-3 h-3" /> Invite to Admin Team
                              </button>
                            )}
                            <button 
                              onClick={(e) => handleStatusClick(employee, e)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                            >
                              <UserMinus className="w-3 h-3" /> Change Status
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(employee, e)}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6 border-t border-white/5 pt-4">
          <div className="text-sm text-slate-400">
            Page <span className="text-white font-medium">{page + 1}</span> of <span className="text-white font-medium">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
