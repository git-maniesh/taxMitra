
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, MapPin, Briefcase, CheckCircle, Heart, MessageSquare, ShieldCheck, Clock, AlertTriangle, X, SlidersHorizontal, Zap, Calculator } from 'lucide-react';
import { SERVICE_CATEGORIES, INDIAN_STATES } from '../constants';
import { CAProfile } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from '../store/AuthContext';
import ContactModal from '../components/ContactModal';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const { user, toggleBookmark, notify } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  
  const [results, setResults] = useState<CAProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState(queryParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedType, setSelectedType] = useState<'ALL' | 'CA' | 'ACCOUNTANT'>('ALL');
  const [selectedState, setSelectedState] = useState('');
  const [minExperience, setMinExperience] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [activeCAForContact, setActiveCAForContact] = useState<CAProfile | null>(null);

  useEffect(() => {
    const fetchAndFilter = async () => {
      let allProfiles = await storageService.findProfiles();
      let filtered = [...allProfiles];
      
      // Mandatory: Filter out rejected pros from public view
      filtered = filtered.filter(ca => ca.verificationStatus !== 'rejected');

      if (searchTerm) {
        filtered = filtered.filter(ca => 
          ca.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          ca.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ca.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (selectedType !== 'ALL') {
        filtered = filtered.filter(ca => ca.type === selectedType);
      }

      if (selectedCategory) {
        filtered = filtered.filter(ca => 
          ca.specializations.includes(selectedCategory) || 
          ca.services.some(s => s.category === selectedCategory)
        );
      }

      if (selectedState) {
        filtered = filtered.filter(ca => ca.state === selectedState);
      }

      if (minExperience > 0) {
        filtered = filtered.filter(ca => ca.experienceYears >= minExperience);
      }

      setResults(filtered);
    };
    fetchAndFilter();
  }, [searchTerm, selectedCategory, selectedState, minExperience, selectedType]);

  const handleOpenContact = (ca: CAProfile) => {
    if (!user) {
      notify('Please login to contact professionals', 'error');
      return;
    }
    if (ca.verificationStatus !== 'verified') {
      notify('You can only contact fully verified professionals.', 'info');
      return;
    }
    setActiveCAForContact(ca);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedState('');
    setMinExperience(0);
    setSelectedType('ALL');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const hasActiveFilters = selectedState !== '' || minExperience > 0 || selectedType !== 'ALL';

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, expertise, or firm..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition shadow-inner font-medium"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 outline-none w-full md:w-64 font-bold text-sm"
              >
                <option value="">All Services</option>
                {SERVICE_CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  isFilterOpen || hasActiveFilters 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">{isFilterOpen ? 'Close' : 'Filters'}</span>
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2 grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-slate-100 mt-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Level</label>
                    <div className="flex flex-col gap-2">
                       {['ALL', 'CA', 'ACCOUNTANT'].map(t => (
                         <button 
                           key={t}
                           onClick={() => setSelectedType(t as any)}
                           className={`text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedType === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                         >
                           {t === 'ALL' ? 'Show All' : t === 'CA' ? 'Chartered Accountant' : 'General Accountant'}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">State / Region</label>
                    <select 
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition"
                    >
                      <option value="">All States</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Min. Experience</label>
                    <div className="flex flex-wrap gap-2">
                      {[0, 5, 10].map(exp => (
                        <button 
                          key={exp}
                          onClick={() => setMinExperience(exp)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            minExperience === exp 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {exp === 0 ? 'Any' : `${exp}+ Yrs`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-end">
                    <button 
                      onClick={clearFilters}
                      className="text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition flex items-center gap-2"
                    >
                      <X size={14} /> Reset
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-500 text-sm font-medium">
            Found <strong>{results.length}</strong> experts
          </p>
        </div>

        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div 
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {results.map(ca => {
                const isBookmarked = user?.bookmarks?.includes(ca.id);
                const isVerified = ca.verificationStatus === 'verified';
                const isCA = ca.type === 'CA';

                return (
                  <motion.div 
                    key={ca.id} 
                    variants={itemVariants}
                    className="relative bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-xl transition-all flex flex-col md:flex-row gap-6 group"
                  >
                    <button 
                      onClick={() => toggleBookmark(ca.id)}
                      className={`absolute top-6 right-6 p-2 rounded-xl border transition-all z-10 ${isBookmarked ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-red-400'}`}
                    >
                      <Heart size={18} className={isBookmarked ? 'fill-current' : ''} />
                    </button>

                    <div className="relative flex-shrink-0">
                      <img src={ca.avatar} alt="" className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-sm" />
                      {isVerified && (
                        <div className={`absolute -top-2 -right-2 ${isCA ? 'bg-blue-600' : 'bg-green-600'} text-white p-1.5 rounded-xl shadow-lg border-2 border-white`}>
                          {isCA ? <ShieldCheck size={16} /> : <CheckCircle size={16} />}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow pr-10">
                      <div className="mb-2">
                        <div className="flex items-center gap-3">
                          <Link to={`/ca/${ca.id}`} className="text-xl font-black text-slate-900 hover:text-blue-600 transition">
                            {ca.name}
                          </Link>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isCA ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                            {isCA ? 'Chartered Accountant' : 'General Accountant'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{ca.firmName}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Star size={14} className="text-amber-500 fill-current" /> {ca.rating} ({ca.reviewCount})
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Briefcase size={14} className="text-slate-400" /> {ca.experienceYears} Yrs Exp
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <MapPin size={14} className="text-slate-400" /> {ca.city}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ca.specializations.slice(0, 3).map(s => (
                          <span key={s} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 md:w-48">
                      <button 
                        onClick={() => handleOpenContact(ca)}
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 ${
                          isVerified 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <MessageSquare size={14} /> Message
                      </button>
                      <Link 
                        to={`/ca/${ca.id}`}
                        className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-200 text-slate-700 hover:bg-slate-50 text-center"
                      >
                        Profile
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <h3 className="text-2xl font-black text-slate-900 mb-2">No professionals found</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">Try different keywords or clearing filters.</p>
              <button onClick={clearFilters} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-black">Reset Filters</button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {activeCAForContact && (
        <ContactModal 
          ca={activeCAForContact}
          isOpen={!!activeCAForContact}
          onClose={() => setActiveCAForContact(null)}
        />
      )}
    </div>
  );
};

export default SearchPage;
