
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { storageService } from '../services/storageService';
import { UserRole } from '../types';
import { LogOut, Menu, X, ShieldCheck, Settings, MessageSquare, User as UserIcon } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo(0, 0);
    
    // Fixed: Await storageService.getConversations which returns a Promise
    if (user) {
      const fetchUnread = async () => {
        const convos = await storageService.getConversations(user.id);
        const count = convos.reduce((acc, curr) => acc + curr.unreadCount, 0);
        setUnreadCount(count);
      };
      fetchUnread();
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-100">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">TaxMitra</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-10">
              <Link to="/search" className={`text-sm font-black uppercase tracking-widest transition ${isActive('/search') ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}>Find Experts</Link>
              <Link to="/services" className={`text-sm font-black uppercase tracking-widest transition ${isActive('/services') ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}>Services</Link>
              
              {!isAuthenticated ? (
                <div className="flex items-center space-x-6">
                  <Link to="/login" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition">Login</Link>
                  <Link to="/register" className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-200 active:scale-95">Join as Expert</Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/messages" className={`p-3 rounded-2xl transition relative ${isActive('/messages') ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}>
                    <MessageSquare size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/settings" className={`p-3 rounded-2xl transition ${isActive('/settings') ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}>
                    <UserIcon size={20} />
                  </Link>
                  
                  <Link 
                    to={(user?.role === UserRole.CA || user?.role === UserRole.ACCOUNTANT) ? '/ca-dashboard' : user?.role === UserRole.ADMIN ? '/admin' : '/dashboard'} 
                    className="flex items-center space-x-3 pl-6 border-l border-slate-100"
                  >
                    <img src={user?.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-sm" />
                    <span className="text-sm font-black text-slate-900">{user?.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition ml-2 p-2">
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </nav>

            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-3 bg-slate-50 rounded-2xl text-slate-600 transition-colors active:bg-slate-100 shadow-sm"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 py-8 px-6 space-y-6 shadow-2xl animate-in slide-in-from-top-4">
            <Link onClick={() => setIsMenuOpen(false)} to="/search" className="block text-lg font-black text-slate-900 uppercase tracking-widest">Find Experts</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/services" className="block text-lg font-black text-slate-900 uppercase tracking-widest">Services</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/messages" className="block text-lg font-black text-slate-900 uppercase tracking-widest flex justify-between items-center">
              Messages
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2.5 py-1 rounded-full font-black">
                  {unreadCount} NEW
                </span>
              )}
            </Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/settings" className="block text-lg font-black text-slate-900 uppercase tracking-widest">Settings</Link>
            <hr className="border-slate-100" />
            {!isAuthenticated ? (
              <div className="space-y-4">
                <Link onClick={() => setIsMenuOpen(false)} to="/login" className="block text-lg font-black text-slate-400 uppercase tracking-widest">Login</Link>
                <Link onClick={() => setIsMenuOpen(false)} to="/register" className="block bg-blue-600 text-white px-6 py-5 rounded-[2rem] text-center font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100">Join as Expert</Link>
              </div>
            ) : (
              <div className="space-y-4">
                <Link onClick={() => setIsMenuOpen(false)} to={(user?.role === UserRole.CA || user?.role === UserRole.ACCOUNTANT) ? '/ca-dashboard' : user?.role === UserRole.ADMIN ? '/admin' : '/dashboard'} className="block text-lg font-black text-slate-900 uppercase tracking-widest">My Dashboard</Link>
                <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="block w-full text-left text-lg font-black text-red-600 uppercase tracking-widest">Logout</button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-1">
             <Link to="/" className="flex items-center space-x-2 mb-8 group">
                <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">TaxMitra</span>
              </Link>
              <p className="text-sm leading-relaxed font-medium">
                Democratizing access to high-tier financial expertise for every Indian taxpayer and business. Secure, fast, and verified.
              </p>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">For Clients</h4>
            <ul className="space-y-5 text-sm font-bold">
              <li><Link to="/search" className="hover:text-white transition-colors">Search Experts</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Our Portfolio</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Support</h4>
            <p className="text-sm mb-5 font-bold">Email: support@taxmitra.in</p>
            <p className="text-sm mb-5 font-bold">Phone: +91 1800-TAX-MITRA</p>
            <p className="text-sm font-bold">Kattedan, Hyderabad - 500077</p>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Quick Links</h4>
            <ul className="space-y-5 text-sm font-bold">
              <li><Link to="/register" className="text-blue-400 hover:text-white transition-colors">Register as Expert</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Client Portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-10 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-slate-500">
          <p>&copy; {new Date().getFullYear()} TaxMitra Platforms Pvt Ltd.</p>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
