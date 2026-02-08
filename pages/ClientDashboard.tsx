
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Clock, MessageSquare, Briefcase, 
  ChevronRight, Star, Trash2, ShieldCheck, MapPin 
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { storageService } from '../services/storageService';
import { CAProfile } from '../types';

const ClientDashboard: React.FC = () => {
  const { user, toggleBookmark } = useAuth();
  const [bookmarks, setBookmarks] = useState<CAProfile[]>([]);

  useEffect(() => {
    // Fixed: Awaited storageService.findProfiles within an async function
    const loadBookmarks = async () => {
      if (user?.bookmarks) {
        const profiles = await storageService.findProfiles();
        const filtered = profiles.filter(p => user.bookmarks?.includes(p.id));
        setBookmarks(filtered);
      }
    };
    loadBookmarks();
  }, [user]);

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900">My Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Welcome, {user?.name}. Manage your financial roadmap here.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content: Bookmarks */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="text-red-500 fill-current h-5 w-5" /> Saved Experts
                </h3>
                <Link to="/search" className="text-blue-600 font-bold text-sm hover:underline">Browse More</Link>
              </div>

              {bookmarks.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                  <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-900">No experts saved yet</h4>
                  <p className="text-slate-500 text-sm mt-2">Bookmark CAs you're interested in to easily find them later.</p>
                  <Link to="/search" className="inline-block mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Start Searching</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarks.map(ca => (
                    <div key={ca.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group relative">
                       <button 
                         onClick={() => toggleBookmark(ca.id)}
                         className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 rounded-lg bg-slate-50 opacity-0 group-hover:opacity-100 transition"
                       >
                         <Trash2 size={16} />
                       </button>
                       <Link to={`/ca/${ca.id}`}>
                         <div className="flex items-center gap-4 mb-4">
                           <img src={ca.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                           <div>
                             <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">{ca.name}</h4>
                             <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase font-bold tracking-tight">
                               <MapPin size={10} /> {ca.city}
                             </p>
                           </div>
                         </div>
                         <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="flex items-center gap-1">
                             <Star className="h-3 w-3 text-amber-500 fill-current" /> {ca.rating}
                           </div>
                           <div className="flex items-center gap-1">
                             <Briefcase className="h-3 w-3 text-slate-400" /> {ca.experienceYears}Y
                           </div>
                           <ChevronRight size={14} className="text-blue-600" />
                         </div>
                       </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar: Activity & Status */}
          <aside className="space-y-8">
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <Clock className="text-blue-600 h-5 w-5" /> Recent Activity
               </h3>
               <div className="space-y-6">
                 {[
                   { type: 'Inquiry', msg: 'Sent to CA Rajesh Kumar', status: 'Pending', time: '2h ago' },
                   { type: 'Update', msg: 'CA Priya Sharma updated services', status: 'Info', time: '1d ago' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                     <div className="w-2 bg-blue-100 rounded-full h-auto"></div>
                     <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-black uppercase text-blue-600 tracking-tighter">{item.type}</p>
                          <span className="text-[10px] text-slate-400">{item.time}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{item.msg}</p>
                        <span className={`text-[10px] font-black mt-1 px-2 py-0.5 rounded-full inline-block ${
                          item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                     </div>
                   </div>
                 ))}
               </div>
            </section>

            <section className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 blur-2xl rounded-full"></div>
               <ShieldCheck className="text-blue-400 h-10 w-10 mb-4" />
               <h3 className="text-xl font-bold mb-2">Safe & Verified</h3>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                 All professionals on our platform go through a mandatory ICAI registration check.
               </p>
               <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition">
                 Learn about Security
               </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
