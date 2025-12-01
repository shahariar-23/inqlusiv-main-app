import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, ArrowRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const SurveyTaker = () => {
  const { token } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/surveys/public/${token}`);
        setSurvey(response.data);
      } catch (err) {
        setError(err.response?.data || "Failed to load survey. It may be expired or invalid.");
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [token]);

  const handleAnswerChange = (questionId, value, type) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        textValue: type === 'RATING_SCALE' ? null : value,
        intValue: type === 'RATING_SCALE' ? value : null
      }
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    const missingRequired = survey.questions.filter(q => q.isRequired && !answers[q.id]);
    if (missingRequired.length > 0) {
      alert(`Please answer all required questions.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.values(answers);
      await axios.post(`http://localhost:8080/api/surveys/public/${token}/submit`, payload);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error", err);
      alert("Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">
        <div className="animate-pulse">Loading Survey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-12 max-w-md text-center"
        >
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Thank You!</h2>
          <p className="text-emerald-200">
            Your feedback has been submitted anonymously. Your voice matters in building a better workplace.
          </p>
        </motion.div>
      </div>
    );
  }

  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = survey.questions.length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 font-body selection:bg-brand-teal/30">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-midnight-900 z-50">
        <div 
          className="h-full bg-brand-teal transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-display font-bold text-white mb-3">{survey.title}</h1>
          <p className="text-slate-400">{survey.description}</p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {survey.questions.map((q, index) => (
            <motion.div 
              key={q.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-midnight-900/60 backdrop-blur-xl border border-white/5 rounded-xl p-6 md:p-8"
            >
              <div className="flex items-start gap-3 mb-6">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-xs font-bold flex items-center justify-center text-slate-300 mt-0.5">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {q.text} {q.isRequired && <span className="text-red-400">*</span>}
                  </h3>
                </div>
              </div>

              <div className="pl-9">
                {q.type === 'OPEN_TEXT' && (
                  <textarea
                    className="w-full bg-midnight-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-teal min-h-[120px]"
                    placeholder="Type your answer here..."
                    onChange={(e) => handleAnswerChange(q.id, e.target.value, 'OPEN_TEXT')}
                    value={answers[q.id]?.textValue || ''}
                  />
                )}

                {q.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-3">
                    {q.options.map((opt, i) => (
                      <label 
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          answers[q.id]?.textValue === opt 
                            ? 'bg-brand-teal/10 border-brand-teal text-white' 
                            : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt}
                          checked={answers[q.id]?.textValue === opt}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value, 'MULTIPLE_CHOICE')}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          answers[q.id]?.textValue === opt ? 'border-brand-teal' : 'border-slate-500'
                        }`}>
                          {answers[q.id]?.textValue === opt && <div className="w-2 h-2 rounded-full bg-brand-teal"></div>}
                        </div>
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'RATING_SCALE' && (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => handleAnswerChange(q.id, num, 'RATING_SCALE')}
                        className={`w-12 h-12 rounded-lg border font-bold text-lg transition-all ${
                          answers[q.id]?.intValue === num
                            ? 'bg-brand-purple text-white border-brand-purple shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-teal to-emerald-500 text-midnight-950 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Survey'}
            {!submitting && <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyTaker;
