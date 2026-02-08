
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { notify } = useAuth();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      notify(`Reset link dispatched to ${email}`, 'success');
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="p-8 text-center bg-slate-900 text-white">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-600/20 p-3 rounded-2xl">
                    <ShieldCheck className="h-10 w-10 text-blue-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-black mb-2">Reset Password</h2>
                <p className="text-slate-400 text-sm px-4">Enter your email address and we'll send you a link to reset your password.</p>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition font-medium"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Sending Link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <Link to="/login" className="text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:text-blue-600 transition">
                    <ArrowLeft size={16} /> Back to Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-12 text-center"
            >
              <div className="bg-green-100 text-green-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">Check your email</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                We've sent a password reset link to <br /><span className="font-bold text-slate-900">{email}</span>. Please check your inbox and spam folder.
              </p>
              <div className="space-y-4">
                 <button 
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Resend Link
                </button>
                <Link to="/login" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
