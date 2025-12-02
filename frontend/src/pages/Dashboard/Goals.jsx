import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Target, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2,
  Briefcase,
  Globe
} from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });
  const [newTask, setNewTask] = useState({ goalId: null, title: '' });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchGoals();
    const token = localStorage.getItem('token');
    if (token) {
      const parts = token.split('-');
      if (parts.length >= 5) setUserRole(parts[4]);
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

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/goals', newGoal, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewGoal({ title: '', description: '' });
      fetchGoals();
    } catch (err) {
      console.error("Error creating goal", err);
      alert("Failed to create goal");
    }
  };

  const handleAddTask = async (goalId) => {
    if (!newTask.title.trim()) return;
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

  const canEdit = userRole === 'COMPANY_ADMIN' || userRole === 'DEPT_MANAGER';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DEI Goals & Initiatives</h1>
          <p className="text-gray-500 mt-1">Track progress on company and department objectives.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Goal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const completedTasks = goal.tasks.filter(t => t.completed).length;
          const totalTasks = goal.tasks.length;
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                    {goal.departmentId ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Briefcase size={12} className="mr-1" />
                        Department
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Globe size={12} className="mr-1" />
                        Company
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{goal.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-brand-teal">{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                <div 
                  className="bg-brand-teal h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Key Results / Tasks</h4>
                {goal.tasks.map((task) => (
                  <div key={task.id} className="flex items-center group">
                    <button 
                      onClick={() => canEdit && handleToggleTask(task.id)}
                      className={`flex-shrink-0 mr-3 ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {task.completed ? (
                        <CheckSquare size={20} className="text-brand-teal" />
                      ) : (
                        <Square size={20} className="text-gray-300 group-hover:text-gray-400" />
                      )}
                    </button>
                    <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}

                {/* Add Task Input */}
                {canEdit && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a new task..."
                        className="flex-1 text-sm border-gray-200 rounded-md focus:ring-brand-teal focus:border-brand-teal"
                        value={newTask.goalId === goal.id ? newTask.title : ''}
                        onChange={(e) => setNewTask({ goalId: goal.id, title: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(goal.id)}
                      />
                      <button 
                        onClick={() => handleAddTask(goal.id)}
                        className="p-2 text-brand-teal hover:bg-teal-50 rounded-md"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Target size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Goals Yet</h3>
            <p className="text-gray-500">Start by creating a new goal for your organization or department.</p>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
            <form onSubmit={handleCreateGoal}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  className="w-full border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-700"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
