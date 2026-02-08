
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { storageService } from '../services/storageService';
import { Conversation, DirectMessage, CAProfile } from '../types';
import { Send, Search, MoreVertical, ShieldCheck, ArrowLeft, Image, Smile, Clock, Calendar, MessageSquare, CheckCheck, UserCheck } from 'lucide-react';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [activeCAProfile, setActiveCAProfile] = useState<CAProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fixed: Correctly handled async storageService.getConversations call
    if (user) {
      const fetchConvos = async () => {
        const convos = await storageService.getConversations(user.id);
        setConversations(convos);
        if (convos.length > 0 && !activeConvo) {
          setActiveConvo(convos[0]);
        }
      };
      fetchConvos();
    }
  }, [user]);

  useEffect(() => {
    // Fixed: Corrected method names and awaited asynchronous storageService calls
    if (activeConvo && user) {
      const syncConvo = async () => {
        await storageService.markMessagesAsRead(user.id, activeConvo.contactId);
        const profiles = await storageService.findProfiles();
        const profile = profiles.find(p => p.userId === activeConvo.contactId);
        setActiveCAProfile(profile || null);
      };
      syncConvo();
    }
  }, [activeConvo, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConvo || !messageText.trim()) return;

    const newMessage: DirectMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      receiverId: activeConvo.contactId,
      subject: 'Direct Inquiry',
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
      caName: activeCAProfile?.name
    };

    // Fixed: Awaited insertOneMessage call
    await storageService.insertOneMessage(newMessage);
    
    const updatedConvo = {
      ...activeConvo,
      messages: [...activeConvo.messages, newMessage],
      lastMessage: messageText,
      lastTimestamp: newMessage.timestamp
    };
    
    setActiveConvo(updatedConvo);
    setConversations(prev => {
      const filtered = prev.filter(c => c.contactId !== activeConvo.contactId);
      return [updatedConvo, ...filtered];
    });
    setMessageText('');
  };

  const formatHighPrecisionTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (!user) return <div className="p-20 text-center text-slate-400 font-bold">Please login to access messages.</div>;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] bg-white border-x border-slate-200 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${activeConvo && 'hidden md:flex'}`}>
        <div className="p-6 border-b border-slate-100">
           <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Messages</h1>
              <div className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                {conversations.length} Threads
              </div>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
              <input 
                type="text" 
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
              />
           </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {conversations.map(convo => (
            <button 
              key={convo.contactId}
              onClick={() => setActiveConvo(convo)}
              className={`w-full p-4 flex items-center gap-4 transition-all border-b border-slate-50 ${activeConvo?.contactId === convo.contactId ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
            >
              <div className="relative flex-shrink-0">
                 <img src={convo.contactAvatar} alt="" className="w-11 h-11 rounded-xl object-cover border border-white shadow-sm" />
                 {convo.unreadCount > 0 && (
                   <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                     {convo.unreadCount}
                   </div>
                 )}
              </div>
              <div className="flex-grow text-left overflow-hidden">
                 <div className="flex justify-between items-baseline mb-0.5">
                   <h4 className="font-bold text-slate-900 text-xs truncate pr-2">{convo.contactName}</h4>
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter flex-shrink-0">
                     {new Date(convo.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </div>
                 <p className={`text-[11px] truncate ${convo.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                   {convo.lastMessage}
                 </p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
               <MessageSquare size={32} className="mb-3 text-slate-300" />
               <p className="text-xs font-bold italic">No active conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-grow flex flex-col bg-white ${!activeConvo && 'hidden md:flex'}`}>
        {activeConvo ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-20">
               <div className="flex items-center gap-4">
                  <button onClick={() => setActiveConvo(null)} className="md:hidden p-2 text-slate-400 hover:text-blue-600 transition">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="relative">
                    <img src={activeConvo.contactAvatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-white shadow-md" />
                    {activeCAProfile?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 flex items-center gap-2 text-base">
                      {activeConvo.contactName}
                      <ShieldCheck size={16} className="text-blue-600" />
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {activeCAProfile?.isOnline ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          <p className="text-[9px] text-green-600 font-black uppercase tracking-widest">Active Now</p>
                        </>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Offline</p>
                      )}
                    </div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Calendar size={18} />
                  </button>
                  <button className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                    <MoreVertical size={18} />
                  </button>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50/20">
               {activeConvo.messages.map((msg, index) => {
                 const isFirstInquiry = index === 0;
                 const isMe = msg.senderId === user.id;
                 return (
                   <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {isFirstInquiry && (
                        <div className="w-full flex justify-center my-6">
                           <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200 shadow-xl flex items-center gap-4">
                              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg">
                                <UserCheck size={24} />
                              </div>
                              <div className="text-left">
                                <p className="text-[8px] text-blue-600 font-black uppercase tracking-[0.2em] mb-0.5">Professional Portal</p>
                                <h4 className="text-sm font-black text-slate-900 tracking-tight">{activeConvo.contactName}</h4>
                                <p className="text-[8px] font-black text-slate-400 flex items-center gap-1 uppercase">
                                  <Clock size={10} /> Started: {formatHighPrecisionTime(msg.timestamp)}
                                </p>
                              </div>
                           </div>
                        </div>
                      )}
                      
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm relative ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-slate-200/40'
                      }`}>
                         <p className="text-[13px] leading-relaxed font-medium mb-2">{msg.content}</p>
                         <div className={`flex items-center justify-between gap-3 pt-1.5 border-t ${
                           isMe ? 'border-white/10 text-blue-100' : 'border-slate-50 text-slate-400'
                         }`}>
                           <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest">
                             <Clock size={9} /> {formatHighPrecisionTime(msg.timestamp)}
                           </div>
                           {isMe && <CheckCheck size={10} className="opacity-70" />}
                         </div>
                      </div>
                   </div>
                 );
               })}
               <div ref={chatEndRef} />
            </div>

            {/* Footer Input */}
            <div className="p-6 border-t border-slate-100 bg-white">
               <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                  <div className="flex items-center gap-1.5">
                     <button type="button" className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all"><Image size={20}/></button>
                     <button type="button" className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all"><Smile size={20}/></button>
                  </div>
                  <div className="flex-grow relative">
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={`Type a message...`}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-[13px] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-40"
                  >
                    <Send size={20} className="transform -rotate-12" />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
             <div className="bg-white p-12 rounded-[2.5rem] shadow-xl mb-8 relative">
                <Send size={60} className="text-blue-50 -rotate-12" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Private Workspaces</h2>
             <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium leading-relaxed">
               Select a conversation to start discussing your requirements securely.
             </p>
             <button onClick={() => navigate('/search')} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
               Browse Experts
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
