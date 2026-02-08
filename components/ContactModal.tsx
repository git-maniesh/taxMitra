
import React, { useState } from 'react';
import { X, Send, MessageSquare, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { CAProfile, DirectMessage } from '../types';
import { useAuth } from '../store/AuthContext';
import { storageService } from '../services/storageService';

interface ContactModalProps {
  ca: CAProfile;
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ ca, isOpen, onClose, initialSubject = '' }) => {
  const { user, notify } = useAuth();
  const [subject, setSubject] = useState(initialSubject || `Inquiry for ${ca.name}`);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify('Please login to send a message.', 'error');
      return;
    }

    setIsSending(true);
    
    const newMessage: DirectMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      receiverId: ca.userId,
      caProfileId: ca.id,
      subject,
      content: message,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Fixed: Corrected method name to insertOneMessage and awaited the asynchronous call
    setTimeout(async () => {
      await storageService.insertOneMessage(newMessage);
      setIsSending(false);
      setIsSuccess(true);
      notify(`Message sent to ${ca.name}`, 'success');
      
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {!isSuccess ? (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                   <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Contact CA</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Messaging {ca.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <img src={ca.avatar} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{ca.name}</p>
                  <p className="text-xs text-blue-600 font-medium">{ca.firmName}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-green-600 uppercase">
                  <ShieldCheck size={12} /> Verified
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Subject</label>
                  <input 
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Briefly state your query"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Your Message</label>
                  <textarea 
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    placeholder="Provide details about your requirement or query..."
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSending}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Direct Message <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="p-12 text-center animate-in fade-in duration-500">
            <div className="bg-green-100 text-green-600 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Message Sent!</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Your inquiry has been delivered to <strong>{ca.name}</strong>. They will respond shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
