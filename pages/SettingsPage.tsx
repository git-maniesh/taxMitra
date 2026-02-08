
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { 
  Phone, 
  User as UserIcon, 
  Camera, 
  Mail, 
  ShieldCheck, 
  Upload, 
  Globe, 
  CheckCircle2, 
  Save, 
  Loader2, 
  Trash2,
  X
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user, updateProfile, notify } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateProfile(formData);
    } catch (err) {
      // AuthContext handles most notifications, but we catch local issues here
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Helper to resize and compress images using Canvas
   */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Export as high-quality JPEG to reduce size significantly
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        notify("Please select a valid image file", 'error');
        return;
      }

      try {
        setIsSaving(true);
        // Compress even if it's small to ensure consistent format/behavior
        const compressedDataUrl = await compressImage(file);
        
        setFormData(prev => ({ ...prev, avatar: compressedDataUrl }));
        setPreviewError(false);
        notify("Image processed successfully. Click 'Update' to save.", "success");
      } catch (err) {
        console.error("Compression failed:", err);
        notify("Failed to process image. Try a different photo.", "error");
      } finally {
        setIsSaving(false);
      }
    }
    e.target.value = '';
    setShowImageOptions(false);
  };

  const removePhoto = () => {
    const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;
    setFormData(prev => ({ ...prev, avatar: fallback }));
    setShowImageOptions(false);
    notify("Photo reset to default avatar", "info");
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
      <Loader2 className="animate-spin mb-4 h-8 w-8 text-blue-600" />
      <p className="font-bold">Loading your settings...</p>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your public identity and contact details.</p>
          </div>
          <div className="hidden md:block">
             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'CA' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
               {user.role} Account
             </span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-visible">
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Profile Photo Section */}
              <section>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="relative group">
                    <div 
                      className="relative w-36 h-36 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl cursor-pointer group hover:ring-4 hover:ring-blue-500/20 transition-all"
                      onClick={() => setShowImageOptions(!showImageOptions)}
                    >
                      <img 
                        src={formData.avatar} 
                        alt="Profile Preview" 
                        className={`w-full h-full object-cover transition-all duration-500 ${previewError ? 'opacity-20' : 'group-hover:scale-110 group-hover:brightness-75'}`}
                        onError={() => setPreviewError(true)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40">
                        <Camera className="text-white h-8 w-8" />
                      </div>
                      {previewError && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-50">
                          <UserIcon size={40} />
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {showImageOptions && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowImageOptions(false)}></div>
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-full left-0 mt-4 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 overflow-hidden"
                          >
                            <button 
                              type="button" 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-blue-50 text-blue-700 rounded-2xl transition-all font-bold text-sm"
                            >
                              <Upload size={18} />
                              Upload Image
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setShowImageOptions(false);
                                notify("Paste the URL in the text field below", "info");
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-slate-700 rounded-2xl transition-all font-bold text-sm"
                            >
                              <Globe size={18} />
                              Use Web Link
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            <button 
                              type="button"
                              onClick={removePhoto}
                              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 text-red-600 rounded-2xl transition-all font-bold text-sm"
                            >
                              <Trash2 size={18} />
                              Reset to Default
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-grow space-y-4 w-full">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Profile Photo Data/URL</label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          value={formData.avatar}
                          onChange={(e) => {
                            setFormData({...formData, avatar: e.target.value});
                            setPreviewError(false);
                          }}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs font-medium pr-12 truncate"
                          placeholder="https://example.com/photo.jpg"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                          {formData.avatar.startsWith('data:') ? <Upload size={16} /> : <Globe size={16} />}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 ml-1">
                      <CheckCircle2 size={12} className="text-green-500" />
                      Auto-Compression: Any uploaded photo is optimized for speed.
                    </p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </section>

              <div className="h-px bg-slate-100"></div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Legal Name</label>
                   <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Phone</label>
                   <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input 
                        type="text" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="+91 00000 00000"
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email (Account Identity)</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
                    <input 
                      type="email" 
                      disabled
                      value={user.email}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none cursor-not-allowed font-medium text-slate-400"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShieldCheck className="text-blue-500" size={18} />
                    </div>
                 </div>
              </div>

              <div className="pt-4">
                <motion.button 
                  type="submit" 
                  disabled={isSaving}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={20} />}
                  {isSaving ? 'Synchronizing...' : 'Update Profile Details'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 p-8 bg-red-50/30 rounded-[2.5rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="text-center md:text-left">
              <h3 className="text-lg font-black text-red-900 tracking-tight">Data & Privacy</h3>
              <p className="text-sm text-red-700 font-medium">Permanently remove your account and association.</p>
           </div>
           <button className="px-6 py-3 rounded-xl border border-red-200 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2">
             <Trash2 size={16} /> Delete Account
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
