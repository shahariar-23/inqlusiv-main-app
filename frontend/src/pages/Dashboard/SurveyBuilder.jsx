import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Save, 
  Plus, 
  Trash2, 
  AlignLeft, 
  List, 
  BarChart, 
  GripVertical,
  X
} from 'lucide-react';

const SurveyBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    deadline: '',
    questions: []
  });

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(), // Temporary ID for React keys
      text: '',
      type,
      options: type === 'MULTIPLE_CHOICE' ? ['Option 1', 'Option 2'] : [],
      isRequired: false,
      orderIndex: survey.questions.length
    };
    setSurvey({ ...survey, questions: [...survey.questions, newQuestion] });
  };

  const updateQuestion = (id, field, value) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  const removeQuestion = (id) => {
    setSurvey({
      ...survey,
      questions: survey.questions.filter(q => q.id !== id)
    });
  };

  const addOption = (questionId) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => 
        q.id === questionId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q
      )
    });
  };

  const updateOption = (questionId, index, value) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[index] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    });
  };

  const removeOption = (questionId, index) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = q.options.filter((_, i) => i !== index);
          return { ...q, options: newOptions };
        }
        return q;
      })
    });
  };

  const handleSave = async () => {
    if (!survey.title) return alert("Please enter a survey title");
    if (survey.questions.length === 0) return alert("Please add at least one question");

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Clean up temporary IDs before sending
      const payload = {
        ...survey,
        questions: survey.questions.map(({ id, ...rest }, index) => ({
          ...rest,
          orderIndex: index
        }))
      };

      await axios.post('http://localhost:8080/api/surveys', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/dashboard/surveys');
    } catch (error) {
      console.error("Error saving survey", error);
      alert("Failed to save survey");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Left Sidebar: Settings */}
      <div className="w-80 flex-shrink-0 bg-midnight-900/60 backdrop-blur-xl border border-white/5 rounded-xl p-6 h-full overflow-y-auto">
        <h2 className="text-lg font-semibold text-white mb-6">Survey Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={survey.title}
              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
              className="w-full bg-midnight-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal"
              placeholder="e.g., Q3 Engagement Survey"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <textarea
              value={survey.description}
              onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
              className="w-full bg-midnight-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal h-24 resize-none"
              placeholder="What is this survey about?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Deadline</label>
            <input
              type="date"
              value={survey.deadline}
              onChange={(e) => setSurvey({ ...survey, deadline: e.target.value })}
              className="w-full bg-midnight-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-teal text-midnight-950 font-semibold rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Survey'}
          </button>
        </div>
      </div>

      {/* Main Area: Questions */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {survey.questions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-xl">
              <p>No questions yet. Add one below!</p>
            </div>
          ) : (
            survey.questions.map((q, index) => (
              <div key={q.id} className="bg-midnight-900/60 backdrop-blur-xl border border-white/5 rounded-xl p-6 relative group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-purple/50 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start gap-4">
                  <div className="mt-3 text-slate-500 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-slate-300">
                          Q{index + 1} • {q.type.replace('_', ' ')}
                        </span>
                        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={q.isRequired}
                            onChange={(e) => updateQuestion(q.id, 'isRequired', e.target.checked)}
                            className="rounded border-white/10 bg-midnight-800 text-brand-teal focus:ring-0"
                          />
                          Required
                        </label>
                      </div>
                      <button 
                        onClick={() => removeQuestion(q.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-lg text-white focus:outline-none focus:border-brand-teal placeholder-slate-600"
                      placeholder="Enter your question here..."
                    />

                    {q.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2 pl-4 border-l border-white/5">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-white/20"></div>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                              className="flex-1 bg-transparent border-none px-2 py-1 text-sm text-slate-300 focus:outline-none focus:bg-white/5 rounded"
                            />
                            <button 
                              onClick={() => removeOption(q.id, optIndex)}
                              className="text-slate-600 hover:text-slate-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(q.id)}
                          className="text-xs text-brand-teal hover:text-teal-400 font-medium mt-2 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Option
                        </button>
                      </div>
                    )}

                    {q.type === 'RATING_SCALE' && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(num => (
                          <div key={num} className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-slate-500 text-sm">
                            {num}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'OPEN_TEXT' && (
                      <div className="w-full h-20 rounded-lg border border-dashed border-white/10 bg-white/5"></div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Bar: Add Question */}
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-center gap-4">
          <button
            onClick={() => addQuestion('OPEN_TEXT')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors border border-white/5"
          >
            <AlignLeft className="w-4 h-4 text-brand-purple" />
            Text
          </button>
          <button
            onClick={() => addQuestion('MULTIPLE_CHOICE')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors border border-white/5"
          >
            <List className="w-4 h-4 text-brand-teal" />
            Multiple Choice
          </button>
          <button
            onClick={() => addQuestion('RATING_SCALE')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors border border-white/5"
          >
            <BarChart className="w-4 h-4 text-accent-mint" />
            Rating Scale
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;
