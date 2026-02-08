
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { User, CAProfile, UserRole } from '../types';
import { useAuth } from '../store/AuthContext';
import { 
  Users, ShieldCheck, Search, Settings, 
  Check, X, FileText, ExternalLink, Clock,
  MessageSquare, Briefcase, TrendingUp, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const { user: currentUser, notify } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<CAProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'users' | 'cas' | 'pending'>('pending');
  
  // Verification Modal State
  const [selectedProfile, setSelectedProfile] = useState<CAProfile | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const allUsers = await storageService.findUsers();
    const allProfiles = await storageService.findProfiles();
    setUsers(allUsers);
    setProfiles(allProfiles);
  };

  const handleVerify = async (status: 'verified' | 'rejected') => {
    if (!selectedProfile) return;
    if (!feedback && status === 'rejected') {
      notify('Please provide feedback for rejection.', 'error');
      return;
    }

    const update = {
      verificationStatus: status,
      isVerified: status === 'verified',
      adminFeedback: feedback
    };

    const updated = await storageService.updateOneProfile(selectedProfile.id, update);
    if (updated) {
      notify(`Expert ${status === 'verified' ? 'Approved' : 'Rejected'} successfully.`, status === 'verified' ? 'success' : 'info');
      await refreshData();
      setSelectedProfile(null);
      setFeedback('');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingApprovals = profiles.filter(p => p.verificationStatus === 'pending_admin_approval' || p.verificationStatus === 'unverified' || p.verificationStatus === 'email_verified');
  const activeProfessionals = profiles.filter(p => p.verificationStatus === 'verified' || p.verificationStatus === 'rejected');

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <Settings className="text-blue-600 h-8 w-8" /> Control Center
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              Admin: <span className="text-slate-900 font-bold">{currentUser?.name}</span> • <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Authorized</span>
            </p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
             {[
               { id: 'pending', label: 'Queued', count: pendingApprovals.length, icon: Clock },
               { id: 'cas', label: 'Experts', count: activeProfessionals.length, icon: ShieldCheck },
               { id: 'users', label: 'Users', count: users.length, icon: Users }
             ].map(t => (
               <button 
                 key={t.id}
                 onClick={() => setTab(t.id as any)}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${tab === t.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
               >
                 <t.icon size={14} />
                 {t.label}
                 {t.count > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${tab === t.id ? 'bg-white/20' : 'bg-slate-100'}`}>{t.count}</span>}
               </button>
             ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Search profiles, emails, or firm names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm font-medium"
              />
           </div>
           <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="bg-green-50 text-green-600 p-2 rounded-xl"><TrendingUp size={20} /></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Health</p>
                 <p className="text-xl font-black text-slate-900">Stable</p>
              </div>
           </div>
           <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-xl"><Briefcase size={20} /></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Audits</p>
                 <p className="text-xl font-black text-slate-900">{profiles.length}</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
           {tab === 'pending' && (
             <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {pendingApprovals.map(p => (
                     <motion.div 
                       layoutId={p.id}
                       key={p.id} 
                       className="bg-slate-50 rounded-3xl p-6 border border-slate-200 group hover:border-blue-400 transition-all cursor-pointer shadow-sm hover:shadow-xl"
                       onClick={() => setSelectedProfile(p)}
                     >
                        <div className="flex items-start justify-between mb-6">
                           <div className="flex gap-4">
                              <img src={p.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                              <div>
                                 <h4 className="font-black text-slate-900 text-lg">{p.name}</h4>
                                 <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded w-fit mt-1">
                                   {p.type === 'CA' ? 'Chartered Accountant' : 'Professional Accountant'}
                                 </p>
                              </div>
                           </div>
                           <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                           <div className="bg-white p-3 rounded-xl border border-slate-100">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Ref</p>
                              <p className="text-xs font-black text-slate-700 truncate">{p.icaiRegistrationNumber || p.professionalQualification}</p>
                           </div>
                           <div className="bg-white p-3 rounded-xl border border-slate-100">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                              <p className="text-xs font-black text-slate-700 truncate">{p.city}, {p.state}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                           <FileText size={14} /> Review Proof of Qualification
                        </div>
                     </motion.div>
                   ))}
                </div>
                {pendingApprovals.length === 0 && (
                  <div className="text-center py-20 opacity-30">
                     <ShieldCheck size={60} className="mx-auto mb-4 text-slate-200" />
                     <h3 className="text-xl font-black italic">Verification queue empty</h3>
                  </div>
                )}
             </div>
           )}

           {tab === 'cas' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-6">Expert Name</th>
                      <th className="px-8 py-6">Identity Ref</th>
                      <th className="px-8 py-6">Audit Status</th>
                      <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeProfessionals.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <img src={p.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                              <div>
                                 <p className="font-black text-slate-900 text-sm">{p.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">{p.firmName || 'Independent'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-[11px] font-black text-slate-600 uppercase">
                          {p.icaiRegistrationNumber || p.professionalQualification}
                        </td>
                        <td className="px-8 py-6">
                           <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center w-fit gap-1.5 ${
                             p.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                           }`}>
                              {p.verificationStatus === 'verified' ? <Check size={12} /> : <X size={12} />}
                              {p.verificationStatus}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button onClick={() => setSelectedProfile(p)} className="p-2 text-slate-300 hover:text-blue-600 transition">
                              <MessageSquare size={18} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )}

           {tab === 'users' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-6">User Details</th>
                      <th className="px-8 py-6">Assigned Role</th>
                      <th className="px-8 py-6">Onboarding Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="" />
                              <div>
                                 <p className="font-black text-slate-900 text-sm">{u.name}</p>
                                 <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                             u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                             u.role === UserRole.CA ? 'bg-blue-100 text-blue-700' : 
                             u.role === UserRole.ACCOUNTANT ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                           }`}>
                             {u.role}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                          {u.isEmailVerified ? 'Email Confirmed' : 'Verification Pending'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )}
        </div>
      </div>

      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
               onClick={() => setSelectedProfile(null)}
             ></motion.div>
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><FileText size={24}/></div>
                      <div>
                         <h2 className="text-2xl font-black text-slate-900">Expert Audit</h2>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Reviewing Proof for {selectedProfile.name}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedProfile(null)} className="p-2 text-slate-400 hover:text-slate-900 transition"><X size={24}/></button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh]">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Avatar Proof</label>
                         <img src={selectedProfile.avatar} className="w-full h-32 object-cover rounded-2xl border-2 border-slate-100" alt="" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted Credential</label>
                         <div className="w-full h-32 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 group hover:border-blue-400 hover:bg-blue-50 transition-all">
                            <FileText size={32} className="mb-1" />
                            <a href={selectedProfile.icaiCertificateUrl || selectedProfile.documentUrl} target="_blank" className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1"><ExternalLink size={12}/> View Full PDF</a>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auditor Notes / Reason for Rejection</label>
                      <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write down why this professional passed or failed the audit..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[100px] resize-none"
                      ></textarea>
                   </div>

                   <div className="flex gap-4 pt-2">
                      <button 
                        onClick={() => handleVerify('verified')}
                        className="flex-grow bg-green-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                      >
                         <Check size={18}/> Approve Expert
                      </button>
                      <button 
                        onClick={() => handleVerify('rejected')}
                        className="flex-grow bg-red-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition shadow-xl shadow-red-100 flex items-center justify-center gap-2"
                      >
                         <X size={18}/> Reject Submission
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
