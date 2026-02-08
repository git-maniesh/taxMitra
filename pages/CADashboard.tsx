
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Users, FileText, CheckCircle, Clock, TrendingUp, MoreVertical, 
  MessageSquare, Settings2, Plus, X, ChevronUp, ChevronDown,
  Calendar as CalendarIcon, Star, Quote, Power, Activity
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { storageService } from '../services/storageService';
import { Review, CAProfile } from '../types';

// Mock Data for Charts
const engagementData = [
  { name: 'Jan', inquiries: 4 },
  { name: 'Feb', inquiries: 7 },
  { name: 'Mar', inquiries: 15 },
  { name: 'Apr', inquiries: 12 },
];

type WidgetId = 'stats' | 'inquiries' | 'engagement' | 'calendar' | 'profileStrength' | 'proBanner' | 'testimonials';

interface WidgetConfig {
  id: WidgetId;
  title: string;
  description: string;
}

const ALL_WIDGETS: WidgetConfig[] = [
  { id: 'stats', title: 'Performance Metrics', description: 'Quick view of active inquiries, completions, and views.' },
  { id: 'inquiries', title: 'Recent Inquiries', description: 'List of your most recent client reach-outs.' },
  { id: 'engagement', title: 'Engagement Trends', description: 'Visual chart of your monthly inquiry growth.' },
  { id: 'calendar', title: 'Calendar', description: 'Your upcoming consultation schedule.' },
  { id: 'profileStrength', title: 'Profile Strength', description: 'Tips to improve your search visibility.' },
  { id: 'proBanner', title: 'Pro Perks', description: 'Exclusive features for verified professionals.' },
  { id: 'testimonials', title: 'Client Feedback', description: 'Positive reviews from your clients.' },
];

const CADashboard: React.FC = () => {
  const { user, notify } = useAuth();
  const [widgets, setWidgets] = useState<WidgetId[]>(['stats', 'inquiries', 'engagement', 'testimonials', 'profileStrength']);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [caProfile, setCaProfile] = useState<CAProfile | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const saved = localStorage.getItem('ca_dashboard_layout');
      if (saved) {
        try {
          setWidgets(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load dashboard layout", e);
        }
      }
      
      // Fixed: Corrected method names and awaited asynchronous calls
      if (user) {
        const profile = await storageService.findProfileByUserId(user.id);
        if (profile) {
          setCaProfile(profile);
          const profReviews = await storageService.findReviewsByProfileId(profile.id);
          setReviews(profReviews.filter(r => r.rating >= 4));
        }
      }
    };
    loadData();
  }, [user]);

  const toggleOnline = async () => {
    // Fixed: Awaited toggleOnlineStatus call
    if (caProfile) {
      const updated = await storageService.toggleOnlineStatus(caProfile.id);
      if (updated) {
        setCaProfile({ ...updated });
        notify(updated.isOnline ? 'You are now Online and accepting inquiries!' : 'You are now Offline.', updated.isOnline ? 'success' : 'info');
      }
    }
  };

  const saveLayout = (newLayout: WidgetId[]) => {
    setWidgets(newLayout);
    localStorage.setItem('ca_dashboard_layout', JSON.stringify(newLayout));
  };

  const removeWidget = (id: WidgetId) => {
    const next = widgets.filter(w => w !== id);
    saveLayout(next);
  };

  const addWidget = (id: WidgetId) => {
    if (!widgets.includes(id)) {
      const next = [...widgets, id];
      saveLayout(next);
    }
    setShowAddModal(false);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const next = [...widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < next.length) {
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      saveLayout(next);
    }
  };

  const renderWidget = (id: WidgetId, index: number) => {
    const controls = isCustomizing && (
      <div className="absolute top-2 right-2 z-20 flex gap-1 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => moveWidget(index, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronUp size={16}/></button>
        <button onClick={() => moveWidget(index, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronDown size={16}/></button>
        <button onClick={() => removeWidget(id)} className="p-1 hover:bg-red-50 text-red-500 rounded"><X size={16}/></button>
      </div>
    );

    const containerClass = `relative group rounded-2xl border transition-all ${isCustomizing ? 'border-dashed border-blue-400 ring-2 ring-blue-50 ring-offset-2' : 'border-slate-200 shadow-sm'}`;

    switch (id) {
      case 'stats':
        return (
          <div key={id} className={`lg:col-span-3 ${containerClass}`}>
            {controls}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              {[
                { label: 'Active Inquiries', value: '12', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Completed Jobs', value: '156', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Pending Bookings', value: '5', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Profile Views', value: '1.2k', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-100">
                  <div className={`${stat.bg} ${stat.color} p-2.5 rounded-lg w-fit mb-3`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div key={id} className={`bg-white p-6 ${containerClass}`}>
            {controls}
            <div className="flex items-center gap-2 mb-4">
              <Quote className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-900">Top Reviews</h3>
            </div>
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">Collect high ratings to see them featured here.</p>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 2).map(r => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1 mb-2">
                       {[1, 2, 3, 4, 5].map(s => (
                         <Star key={s} className={`h-3 w-3 ${r.rating >= s ? 'text-amber-500 fill-current' : 'text-slate-200'}`} />
                       ))}
                    </div>
                    <p className="text-xs text-slate-600 italic mb-2">"{r.comment}"</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase">— {r.clientName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'inquiries':
        return (
          <div key={id} className={`lg:col-span-2 bg-white p-6 ${containerClass}`}>
            {controls}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Recent Inquiries</h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">Manage All</button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {['SG', 'RP', 'AK'][i-1]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{['Suresh Gupta', 'Rahul Patel', 'Anita Kapoor'][i-1]}</h4>
                      <p className="text-xs text-slate-500">Service: {['GST Returns', 'ITR Filing', 'Audit'][i-1]}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                     <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded uppercase">New</span>
                     <button className="p-1 text-slate-300 hover:text-slate-600 transition"><MoreVertical size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'engagement':
        return (
          <div key={id} className={`lg:col-span-2 bg-white p-6 ${containerClass}`}>
            {controls}
            <h3 className="text-xl font-bold text-slate-900 mb-6">Engagement Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="inquiries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'profileStrength':
        return (
          <div key={id} className={`bg-white p-6 ${containerClass}`}>
            {controls}
            <h3 className="text-lg font-bold text-slate-900 mb-4">Profile Strength</h3>
            <div className="w-full bg-slate-100 h-2.5 rounded-full mb-4">
               <div className="bg-blue-600 h-2.5 rounded-full w-[85%]"></div>
            </div>
            <p className="text-sm text-slate-600 mb-6 font-medium">Your profile is <span className="text-blue-600 font-bold">85% complete</span>.</p>
            <ul className="space-y-3">
              <li className="flex items-center text-xs text-slate-400 line-through">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Verify ICAI Number
              </li>
              <li className="flex items-center text-xs text-slate-600">
                <div className="h-4 w-4 rounded-full border border-slate-300 mr-2"></div> Add Professional Photos
              </li>
            </ul>
          </div>
        );

      case 'proBanner':
        return (
          <div key={id} className={`bg-slate-900 text-white p-6 ${containerClass}`}>
            {controls}
            <div className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full w-fit mb-4">PRO</div>
            <h3 className="text-lg font-bold mb-2">Boost your visibility</h3>
            <p className="text-slate-400 text-xs mb-6">Get featured at the top of search results.</p>
            <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm">Upgrade</button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Prominent Status Banner */}
      <div className={`w-full py-2 px-6 flex items-center justify-center gap-3 transition-colors ${caProfile?.isOnline ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
        <Activity size={16} className={caProfile?.isOnline ? 'animate-pulse' : ''} />
        <p className="text-[11px] font-black uppercase tracking-[0.2em]">
          {caProfile?.isOnline ? 'You are currently appearing in "Active Now" search results' : 'Your profile is hidden from "Active Now" filters'}
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">Workspace</h1>
               <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Live Account</span>
            </div>
            <p className="text-slate-500 mt-1 font-medium italic">Welcome back, {user?.name}. Here's what's happening today.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            {/* Status Switcher Component */}
            <div className="flex items-center bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center gap-4">
                  <div className="text-left">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Visibility</p>
                     <p className={`text-xs font-black uppercase tracking-tight ${caProfile?.isOnline ? 'text-green-600' : 'text-slate-500'}`}>
                       {caProfile?.isOnline ? 'Publicly Online' : 'Currently Offline'}
                     </p>
                  </div>
                  <button 
                    onClick={toggleOnline}
                    className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${caProfile?.isOnline ? 'bg-green-500' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ${caProfile?.isOnline ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </button>
               </div>
            </div>

            <button 
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                isCustomizing 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <Settings2 size={18} />
              {isCustomizing ? 'Done' : 'Layout'}
            </button>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg">
              New Invoice
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {widgets.map((id, index) => renderWidget(id, index))}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h2 className="text-xl font-bold text-slate-900">Add Module</h2>
                 <button onClick={() => setShowAddModal(false)}><X /></button>
              </div>
              <div className="p-6 space-y-3">
                 {ALL_WIDGETS.map(widget => {
                   const isAdded = widgets.includes(widget.id);
                   return (
                     <div key={widget.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-900">{widget.title}</p>
                          <p className="text-xs text-slate-500">{widget.description}</p>
                        </div>
                        <button 
                          disabled={isAdded}
                          onClick={() => addWidget(widget.id)}
                          className={`px-4 py-2 rounded-lg font-bold text-xs ${
                            isAdded ? 'text-slate-400' : 'text-blue-600 bg-blue-50'
                          }`}
                        >
                          {isAdded ? 'Added' : 'Add'}
                        </button>
                     </div>
                   );
                 })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CADashboard;
