import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Target, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2,
  Briefcase,
  Globe,
  X,
  Calendar,
  Users,
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', departmentId: '' });
  const [newTask, setNewTask] = useState({ goalId: null, title: '' });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchGoals();
    fetchDepartments();
    const token = localStorage.getItem('token');
    if (token) {
      const parts = token.split('-');
      if (parts.length >= 5) {
        setUserRole(parts[4]);
      }
    }
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(response.data);
    } catch (err) {
      console.error("Error fetching goals", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments", err);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: newGoal.title,
        description: newGoal.description,
        departmentId: newGoal.departmentId ? parseInt(newGoal.departmentId) : null
      };

      await axios.post('http://localhost:8080/api/goals', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewGoal({ title: '', description: '', departmentId: '' });
      fetchGoals();
    } catch (err) {
      console.error("Error creating goal", err);
      alert("Failed to create goal");
    }
  };

  const handleAddTask = async (goalId) => {
    if (newTask.goalId !== goalId || !newTask.title.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/goals/${goalId}/tasks`, {
        title: newTask.title
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({ goalId: null, title: '' });
      fetchGoals();
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/goals/tasks/${taskId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGoals();
    } catch (err) {
      console.error("Error toggling task", err);
    }
  };

  const handleDeleteGoal = (goalId) => {
    setGoalToDelete(goalId);
    setShowDeleteModal(true);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/goals/${goalToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGoals();
      setShowDeleteModal(false);
      setGoalToDelete(null);
    } catch (err) {
      console.error("Error deleting goal", err);
      alert("Failed to delete goal. You may not have permission.");
    }
  };

  const isAdmin = userRole === 'COMPANY_ADMIN' || userRole === 'HR_MANAGER';
  const isManager = userRole === 'DEPT_MANAGER';
  const canCreate = isAdmin || isManager;

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown Dept';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals & Initiatives</h1>
          <p className="text-gray-500 mt-1">Track and manage company and department objectives.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-brand-teal to-brand-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm font-medium"
          >
            <Plus size={20} className="mr-2" />
            New Goal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const completedTasks = goal.tasks.filter(t => t.completed).length;
          const totalTasks = goal.tasks.length;
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          const isCompanyGoal = !goal.departmentId;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={goal.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {isCompanyGoal ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        <Globe size={12} className="mr-1" />
                        Company Wide
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                        <Users size={12} className="mr-1" />
                        {getDepartmentName(goal.departmentId)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{goal.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{goal.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-brand-teal">{Math.round(progress)}%</div>
                  {/* Delete Button Logic: Admin can delete all. Manager can delete their dept goals. */}
                  {(isAdmin || (isManager && !isCompanyGoal)) && (
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="mt-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Delete Goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-brand-teal'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Results</h4>
                  <span className="text-xs text-gray-400">{completedTasks}/{totalTasks} Completed</span>
                </div>
                
                <div className="space-y-2">
                  {goal.tasks.map((task) => (
                    <div key={task.id} className="flex items-start group">
                      <button 
                        onClick={() => canCreate && handleToggleTask(task.id)}
                        className={`flex-shrink-0 mr-3 mt-0.5 ${canCreate ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {task.completed ? (
                          <CheckSquare size={18} className="text-brand-teal" />
                        ) : (
                          <Square size={18} className="text-gray-300 group-hover:text-brand-teal transition-colors" />
                        )}
                      </button>
                      <span className={`text-sm leading-tight ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Task Input */}
                {canCreate && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="relative flex items-center group">
                      <div className="absolute left-3 text-gray-400 group-focus-within:text-brand-teal transition-colors">
                        <PlusCircle size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Add a key result..."
                        className="w-full pl-10 pr-12 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all placeholder-gray-400 text-gray-700 font-medium"
                        value={newTask.goalId === goal.id ? newTask.title : ''}
                        onChange={(e) => setNewTask({ goalId: goal.id, title: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(goal.id)}
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddTask(goal.id)}
                        disabled={newTask.goalId !== goal.id || !newTask.title.trim()}
                        className={`absolute right-2 p-1.5 rounded-lg transition-all duration-200 ${
                          newTask.goalId === goal.id && newTask.title.trim() 
                            ? 'bg-brand-teal text-white shadow-md hover:bg-teal-600 transform hover:scale-105' 
                            : 'bg-transparent text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <ArrowRight size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Goals Found</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              Get started by creating a new goal to track your team's progress and achievements.
            </p>
            {canCreate && (
              <button 
                onClick={() => setShowModal(true)}
                className="mt-6 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Create First Goal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Goal?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Are you sure you want to delete this goal? This action cannot be undone and all associated key results will be removed.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteGoal}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create New Goal</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Increase Q4 Revenue"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Describe the objective and success criteria..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal resize-none"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>

                {/* Assign To Dropdown - Only for Admins */}
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Assign To</label>
                    <div className="relative">
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal appearance-none"
                        value={newGoal.departmentId}
                        onChange={(e) => setNewGoal({ ...newGoal, departmentId: e.target.value })}
                      >
                        <option value="" className="bg-gray-800 text-white">🏢 Entire Company</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id} className="bg-gray-800 text-white">👥 {dept.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                        <Users size={16} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {newGoal.departmentId ? "This goal will be visible to the selected department." : "This goal will be visible to everyone in the company."}
                    </p>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-brand-teal to-brand-purple text-white rounded-lg hover:opacity-90 font-medium transition-opacity shadow-sm"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;
