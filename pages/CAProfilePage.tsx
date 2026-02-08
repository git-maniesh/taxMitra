
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Star, MapPin, Briefcase, CheckCircle2, 
  Award, Clock, Share2, Heart, MessageSquare, Send, Zap, AlertTriangle, Calculator, XCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../store/AuthContext';
import { CAProfile, Review } from '../types';
import ContactModal from '../components/ContactModal';

const CAProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, toggleBookmark, notify } = useAuth();
  const [ca, setCa] = useState<CAProfile | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setIsLoading(true);
        const profile = await storageService.findProfileById(id);
        setCa(profile);
        const allReviews = await storageService.findReviewsByProfileId(id);
        setReviews(allReviews);
        if (profile) {
          geminiService.summarizeCAProfile(profile.about).then(res => res && setSummary(res));
        }
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) return <div className="p-20 text-center"><Clock className="animate-spin mx-auto h-8 w-8 text-blue-600" /></div>;
  if (!ca) return <div className="p-20 text-center text-slate-500 font-bold">Profile Not Found</div>;

  const isBookmarked = user?.bookmarks?.includes(ca.id);
  const isVerified = ca.verificationStatus === 'verified';
  const isCA = ca.type === 'CA';
  const isRejected = ca.verificationStatus === 'rejected';

  return (
    <div className="bg-slate-50 min-h-screen pb-20 overflow-hidden">
      {/* Alert for Pending/Rejected */}
      {!isVerified && (
        <div className={`w-full py-4 px-6 text-center text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${isRejected ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
           {isRejected ? <XCircle size={16} /> : <Clock size={16} />}
           {isRejected ? 'Verification Failed - View feedback below' : 'Account awaiting administrative verification'}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-900 text-white py-12 md:py-20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <img 
                src={ca.avatar || `https://picsum.photos/seed/${ca.id}/300`} 
                alt={ca.name} 
                className={`w-40 h-40 rounded-3xl border-4 border-white/10 object-cover shadow-2xl transition-all ${isVerified ? '' : 'grayscale opacity-50'}`}
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleBookmark(ca.id)}
                className={`absolute -bottom-2 -right-2 p-3 rounded-2xl shadow-xl border-2 transition-colors ${
                  isBookmarked ? 'bg-red-500 border-red-400 text-white' : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <Heart className={`h-6 w-6 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>
            </motion.div>
            
            <div className="flex-grow text-center md:text-left">
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                    {ca.name}
                    {isVerified && (isCA ? <ShieldCheck className="h-8 w-8 text-blue-500" /> : <CheckCircle2 className="h-8 w-8 text-green-500" />)}
                  </h1>
                  {isVerified ? (
                    <span className={`${isCA ? 'bg-blue-600' : 'bg-green-600'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                      {isCA ? 'ICAI Verified' : 'Verified Practitioner'}
                    </span>
                  ) : (
                    <span className={`${isRejected ? 'bg-red-900' : 'bg-slate-700'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                      {isRejected ? 'Verification Rejected' : 'Verification Queue'}
                    </span>
                  )}
                </div>
              </motion.div>
              
              <motion.p className="text-xl text-slate-300 mb-6 font-medium">
                {ca.firmName} • {isCA ? 'Chartered Accountant' : 'General Accountant'}
              </motion.p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="flex items-center"><Star className="h-5 w-5 text-amber-400 mr-2 fill-amber-400" /> <span className="font-bold">{ca.rating}</span> <span className="text-slate-400 ml-1">({ca.reviewCount} Reviews)</span></div>
                <div className="flex items-center"><Briefcase className="h-5 w-5 text-slate-400 mr-2" /> {ca.experienceYears} Years Exp.</div>
                <div className="flex items-center"><MapPin className="h-5 w-5 text-slate-400 mr-2" /> {ca.city}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {isRejected && (
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                 <AlertTriangle className="text-red-600 flex-shrink-0" />
                 <div>
                    <h4 className="font-black text-red-900 text-sm">Auditor Feedback</h4>
                    <p className="text-red-700 text-xs italic mt-1 font-medium leading-relaxed">"{ca.adminFeedback || 'No feedback provided yet.'}"</p>
                 </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Award className="h-6 w-6 mr-2 text-blue-600" /> Professional Identity
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">{ca.about}</p>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{isCA ? 'ICAI Ref' : 'Credential'}</p>
                   <p className="text-slate-900 font-bold">{isCA ? ca.icaiRegistrationNumber : ca.professionalQualification}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase mb-1">State Practice</p>
                   <p className="text-slate-900 font-bold">{ca.city}, {ca.state}</p>
                 </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className={`bg-white p-8 rounded-3xl shadow-xl border border-blue-100 sticky top-24 ${isVerified ? '' : 'opacity-50 grayscale'}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Contact Workspace</h3>
              <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed">
                Send a secure inquiry to initiate professional collaboration.
              </p>
              <button 
                disabled={!isVerified}
                onClick={() => setIsContactModalOpen(true)}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${isVerified ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {isVerified ? 'Send Message' : isRejected ? 'Verification Failed' : 'Queueing...'}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <ContactModal ca={ca} isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
};

export default CAProfilePage;
