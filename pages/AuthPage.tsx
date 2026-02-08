
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Briefcase, Calculator } from 'lucide-react';

const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, notify } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 800));

    if (mode === 'login') {
      // Fixed: Awaited login Promise
      const result = await login(email, password);
      setIsLoading(false);
      
      if (result.success) {
        const savedUserStr = localStorage.getItem('taxmitra_session_user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser.role === UserRole.ADMIN) navigate('/admin');
          else navigate((savedUser.role === UserRole.CA || savedUser.role === UserRole.ACCOUNTANT) ? '/ca-dashboard' : '/dashboard');
        }
      } else if (result.errorType === 'NOT_FOUND') {
        notify('No account found with this email. Please sign up.', 'info');
        navigate(`/register?email=${encodeURIComponent(email)}`);
      }
    } else {
      // Fixed: Awaited signup Promise
      const result = await signup(email, name, role);
      setIsLoading(false);
      
      if (result.success) {
        if (role === UserRole.CA || role === UserRole.ACCOUNTANT) navigate('/ca-onboarding');
        else navigate('/dashboard');
      } else if (result.errorType === 'ALREADY_EXISTS') {
        notify('An account already exists with this email. Please log in.', 'info');
        navigate(`/login?email=${encodeURIComponent(email)}`);
      }
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-10 text-center bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-blue-600/20 p-4 rounded-3xl backdrop-blur-sm">
              <ShieldCheck className="h-12 w-12 text-blue-400" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-black mb-2 tracking-tight">
            {mode === 'login' ? 'Secure Login' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {mode === 'login' 
              ? 'Access your private financial dashboard' 
              : 'Join India\'s trusted network of financial experts'}
          </p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Legal Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="e.g. Full Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">I am joining as a:</label>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        type="button"
                        onClick={() => setRole(UserRole.CLIENT)}
                        className={`py-3 px-4 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-between ${role === UserRole.CLIENT ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                      >
                        Client <UserIcon size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRole(UserRole.CA)}
                        className={`py-3 px-4 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-between ${role === UserRole.CA ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                      >
                        Chartered Accountant (CA) <ShieldCheck size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRole(UserRole.ACCOUNTANT)}
                        className={`py-3 px-4 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-between ${role === UserRole.ACCOUNTANT ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                      >
                        General Accountant <Calculator size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                {mode === 'login' && (
                  <Link to="/forgot-password" hidden={false} className="text-xs text-blue-600 font-black hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button 
              type="submit" 
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                   <Loader2 className="h-5 w-5 animate-spin" />
                   <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Join TaxMitra'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              {mode === 'login' ? "Don't have an account?" : "Already a member?"}{' '}
              <button 
                onClick={() => navigate(mode === 'login' ? '/register' : '/login')}
                className="text-blue-600 font-black hover:underline ml-1"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
