import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, MoreVertical, X, Edit2, Trash2 } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [deletingDept, setDeletingDept] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    
    // Close menus when clicking outside
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingDept) {
        await axios.put(`http://localhost:8080/api/departments/${editingDept.id}`, 
          { name: departmentName }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post('http://localhost:8080/api/departments', 
          { name: departmentName }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      closeModal();
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department", error);
      alert("Failed to save department");
    }
  };

  const handleDelete = async () => {
    if (!deletingDept) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/departments/${deletingDept.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      setDeletingDept(null);
      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department", error);
      if (error.response && error.response.status === 400) {
        alert(error.response.data || "Cannot delete: This department has active employees.");
      } else {
        alert("Failed to delete department");
      }
    }
  };

  const openAddModal = () => {
    setEditingDept(null);
    setDepartmentName('');
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const openEditModal = (dept, e) => {
    e.stopPropagation();
    setEditingDept(dept);
    setDepartmentName(dept.name);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const openDeleteModal = (dept, e) => {
    e.stopPropagation();
    setDeletingDept(dept);
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setDepartmentName('');
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Departments</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-teal to-brand-purple text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Add/Edit Department Modal */}
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
                <h2 className="text-xl font-bold text-white">{editingDept ? 'Rename Department' : 'Add New Department'}</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Engineering"
                    autoFocus
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-teal to-brand-purple text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    {editingDept ? 'Save Changes' : 'Add Department'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Delete Department</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-300">
                  Are you sure you want to delete <span className="text-white font-medium">{deletingDept.name}</span>?
                </p>
                <p className="text-sm text-slate-400 bg-white/5 p-3 rounded-lg border border-white/10">
                  Note: You cannot delete a department that has active employees. Please reassign them first.
                </p>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-red-500/80 text-white font-medium hover:bg-red-500 transition-colors"
                  >
                    Delete Department
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center text-slate-400 mt-20">Loading Departments...</div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {departments.map((dept) => (
            <motion.div 
              key={dept.id}
              variants={itemVariants}
              onClick={() => navigate('/dashboard/employees', { state: { departmentId: dept.id, departmentName: dept.name } })}
              className="group relative p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5 hover:border-brand-teal/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-brand-teal/10 text-brand-teal">
                  <Users className="w-6 h-6" />
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => toggleMenu(dept.id, e)}
                    className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {activeMenu === dept.id && (
                    <div className="absolute right-0 top-full mt-2 w-32 bg-midnight-800 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                      <button 
                        onClick={(e) => openEditModal(dept, e)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                      >
                        <Edit2 className="w-3 h-3" /> Rename
                      </button>
                      <button 
                        onClick={(e) => openDeleteModal(dept, e)}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-display font-bold text-white mb-1">{dept.name}</h3>
              <p className="text-slate-400 text-sm mb-6">Headcount: <span className="text-white font-medium">{dept.headcount}</span></p>
              
              <div className="flex -space-x-2 overflow-hidden">
                {/* Mock avatars for visual appeal */}
                {[...Array(Math.min(dept.headcount, 4))].map((_, i) => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-midnight-900 bg-slate-700 flex items-center justify-center text-xs text-white">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {dept.headcount > 4 && (
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-midnight-900 bg-slate-800 flex items-center justify-center text-xs text-slate-300">
                    +{dept.headcount - 4}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Departments;
