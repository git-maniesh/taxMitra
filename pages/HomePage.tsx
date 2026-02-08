
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, TrendingUp, Users, CheckCircle, ChevronRight, Calculator, Landmark, FileText, Briefcase, MapPin, Navigation, Sparkles, AlertCircle, Star } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../constants';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { useAuth } from '../store/AuthContext';
import { CAProfile } from '../types';

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [nearbyCAs, setNearbyCAs] = useState<(CAProfile & { distance?: number })[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, notify } = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (isAuthenticated) {
        handleGetLocation(true);
      } else {
        const allProfiles = await storageService.findProfiles();
        const topRated = allProfiles
          .filter(p => p.verificationStatus === 'verified')
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        setNearbyCAs(topRated);
        setIsFallback(true);
      }
    };
    fetchInitialData();
  }, [isAuthenticated]);

  const handleGetLocation = async (isAuto = false) => {
    if (!isAuthenticated) {
      if (!isAuto) {
        notify('Authentication required to use proximity search.', 'info');
        navigate('/login');
      }
      return;
    }

    if ("geolocation" in navigator) {
      setLocLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const nearby = await storageService.getNearbyProfiles(latitude, longitude);
          if (nearby.length > 0) {
            setNearbyCAs(nearby.slice(0, 4));
            setIsFallback(false);
          } else {
            const all = await storageService.findProfiles();
            const topRated = all
              .filter(p => p.verificationStatus === 'verified')
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 4);
            setNearbyCAs(topRated);
            setIsFallback(true);
          }
          setLocLoading(false);
        },
        async () => {
          const all = await storageService.findProfiles();
          const topRated = all
            .filter(p => p.verificationStatus === 'verified')
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
          setNearbyCAs(topRated);
          setIsFallback(true);
          setLocLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleAiSmartSearch = async () => {
    if (!query) return;
    setAiLoading(true);
    const category = await geminiService.recommendCategory(query);
    setAiLoading(false);
    if (category) navigate(`/search?category=${encodeURIComponent(category)}`);
    else navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-32 pb-44 text-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 mb-8"
          >
             <Sparkles className="h-4 w-4 text-amber-400" />
             <span className="text-xs font-black uppercase tracking-widest">Connect with India's Financial Experts</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight"
          >
            Your Finance, Our Expertise. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Taxes Handled Right.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-14 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            Say goodbye to tax stress. Whether it's ITR filing, GST audits, or startup compliance—get matched with <span className="text-white font-bold underline decoration-blue-500 underline-offset-4">verified CA / Accountants</span> in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl p-3 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-stretch gap-3"
          >
            <div className="flex-grow flex items-center px-6 bg-white rounded-2xl shadow-inner group">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your need: 'GST registration for my new agency'..." 
                className="w-full py-5 px-4 text-slate-900 outline-none placeholder:text-slate-400 font-bold text-lg"
              />
            </div>
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-blue-900/40 flex items-center gap-2"
              >
                <span>Search</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={aiLoading}
                onClick={handleAiSmartSearch}
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-5 rounded-2xl font-black transition-all border border-white/10 flex items-center gap-2"
              >
                {aiLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Sparkles className="h-5 w-5 text-amber-400" />}
                <span>AI Match</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Discovery Section */}
      <section className="relative -mt-20 pb-24 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100"
          >
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
               <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-3xl text-white shadow-xl ${isFallback ? 'bg-indigo-600 shadow-indigo-100' : 'bg-blue-600 shadow-blue-100'}`}>
                    {isFallback ? <Star className="h-7 w-7" /> : <Navigation className="h-7 w-7 animate-pulse" />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {isFallback ? 'Top Rated Professionals' : 'Experts Near You'}
                    </h2>
                    <p className="text-slate-500 font-bold">
                      {isFallback ? 'Showing hand-picked experts based on highest review scores.' : 'Discover verified practitioners practicing in your immediate vicinity.'}
                    </p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGetLocation(false)} 
                    disabled={locLoading}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                  >
                    {locLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <MapPin size={18} />
                    )}
                    Find Nearby Experts
                  </motion.button>
               </div>
            </div>

            <AnimatePresence mode="wait">
              {nearbyCAs.length > 0 ? (
                <motion.div 
                  key="results"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  {nearbyCAs.map(ca => (
                    <motion.div key={ca.id} variants={itemVariants}>
                      <Link 
                        to={`/ca/${ca.id}`} 
                        className="group bg-white rounded-3xl p-5 border-2 border-slate-50 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden"
                      >
                        <div className="relative mb-6 overflow-hidden rounded-2xl h-48">
                           <img src={ca.avatar} alt="" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                           {ca.distance && (
                             <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-600 flex items-center gap-1 shadow-xl">
                                <MapPin size={12} className="fill-blue-600" /> {ca.distance.toFixed(1)} KM
                             </div>
                           )}
                           {ca.isOnline && (
                             <div className="absolute bottom-3 left-3 bg-green-500/90 backdrop-blur px-3 py-1 rounded-xl text-[8px] font-black text-white flex items-center gap-1.5 uppercase tracking-widest shadow-xl">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> Active Now
                             </div>
                           )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition truncate mb-1">{ca.name}</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">{ca.city}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                           <div className="flex items-center text-amber-500 font-black gap-1 text-sm bg-amber-50 px-2.5 py-1 rounded-lg">
                              <Star size={14} className="fill-current" /> {ca.rating}
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ca.specializations[0]}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200"
                >
                   <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                   <h4 className="text-xl font-bold text-slate-900">Locate Local Experts</h4>
                   <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">Enable geolocation to find reliable CA / Accountants practicing within your city limits.</p>
                   <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleGetLocation(false)} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg">Find Nearby Professionals</motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
