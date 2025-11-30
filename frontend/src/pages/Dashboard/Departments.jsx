import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, MoreVertical, X } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');

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
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/departments', { name: newDepartmentName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setNewDepartmentName('');
      fetchDepartments();
    } catch (error) {
      console.error("Error adding department", error);
      alert("Failed to add department");
    }
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
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-teal to-brand-purple text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Add Department Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Add New Department</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Engineering"
                  />
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
                    Add Department
                  </button>
                </div>
              </form>
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
              className="group p-6 rounded-2xl bg-midnight-900/60 backdrop-blur-xl border border-white/5 hover:border-brand-teal/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-brand-teal/10 text-brand-teal">
                  <Users className="w-6 h-6" />
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
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
