
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ChevronRight, ChevronLeft, Check, 
  Briefcase, Award, Plus, Trash2, FileText, UserCheck, Mail, Camera, FileUp, Calculator
} from 'lucide-react';
import { ServiceCategory, CAProfile, UserRole } from '../types';
import { INDIAN_STATES } from '../constants';
import { useAuth } from '../store/AuthContext';
import { storageService } from '../services/storageService';

const STEPS = [
  { id: 1, title: 'Professional Info', icon: Award },
  { id: 2, title: 'Expertise', icon: Briefcase },
  { id: 3, title: 'Documents', icon: FileUp },
  { id: 4, title: 'Service Menu', icon: FileText },
  { id: 5, title: 'Verification', icon: Mail },
];

const CARegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, notify } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isAccountant = user?.role === UserRole.ACCOUNTANT;

  const [formData, setFormData] = useState({
    icaiRegistrationNumber: '',
    professionalQualification: '',
    firmName: '',
    experienceYears: 0,
    city: '',
    state: '',
    pincode: '',
    specializations: [] as string[],
    languages: [] as string[],
    about: '',
    pricingRange: 'Standard' as 'Budget' | 'Standard' | 'Premium',
    services: [] as any[],
    icaiCertificateUrl: '',
    documentUrl: '',
    profilePhotoUrl: ''
  });

  const updateFormData = (data: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...data }));

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      if (!user) return;
      setIsSubmitting(true);
      
      const newId = (isAccountant ? 'acc_' : 'ca_') + Math.random().toString(36).substr(2, 5);
      const newProfile: CAProfile = {
        id: newId,
        userId: user.id,
        type: isAccountant ? 'ACCOUNTANT' : 'CA',
        name: isAccountant ? user.name : `CA ${user.name}`,
        firmName: formData.firmName,
        icaiRegistrationNumber: isAccountant ? undefined : formData.icaiRegistrationNumber,
        professionalQualification: isAccountant ? formData.professionalQualification : undefined,
        experienceYears: formData.experienceYears,
        rating: 0,
        reviewCount: 0,
        specializations: formData.specializations,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        isVerified: false,
        verificationStatus: 'unverified',
        languages: formData.languages,
        about: formData.about,
        pricingRange: formData.pricingRange,
        services: formData.services.map((s, i) => ({
          id: 's_' + i,
          category: s.category,
          name: s.name,
          description: s.name,
          basePrice: s.price,
          isFixedPrice: true
        })),
        avatar: formData.profilePhotoUrl || user.avatar,
        icaiCertificateUrl: isAccountant ? undefined : formData.icaiCertificateUrl,
        documentUrl: isAccountant ? formData.documentUrl : undefined,
        profilePhotoUrl: formData.profilePhotoUrl
      };

      // Fixed: Awaited insertOneProfile
      await storageService.insertOneProfile(newProfile);
      
      setTimeout(() => {
        setIsSubmitting(false);
        notify('Registration submitted! Please verify your email.', 'info');
      }, 1500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const toggleSpecialization = (spec: string) => {
    const current = [...formData.specializations];
    const index = current.indexOf(spec);
    if (index > -1) current.splice(index, 1);
    else current.push(spec);
    updateFormData({ specializations: current });
  };

  const addService = () => updateFormData({ services: [...formData.services, { category: ServiceCategory.ACCOUNTING, name: '', price: 0 }] });
  
  const updateService = (index: number, field: string, value: any) => {
    const updated = [...formData.services];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ services: updated });
  };
  
  const removeService = (index: number) => updateFormData({ services: formData.services.filter((_, i) => i !== index) });

  const handleFileUpload = (field: 'icaiCertificateUrl' | 'profilePhotoUrl' | 'documentUrl') => {
    const mockUrl = field === 'profilePhotoUrl' 
      ? `https://picsum.photos/seed/${Math.random()}/300` 
      : `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
    
    updateFormData({ [field]: mockUrl });
    notify(`Document uploaded successfully (Simulation)`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : isActive ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <span className={`mt-2 text-[10px] font-black uppercase tracking-widest text-center max-w-[80px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12">
            {currentStep === 1 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">{isAccountant ? 'Practitioner Info' : 'Professional Identity'}</h2>
                  <p className="text-slate-500">{isAccountant ? 'Tell us about your accounting experience and firm.' : 'Verify your ICAI status and tell us where you practice.'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!isAccountant ? (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">ICAI Membership Number</label>
                      <input type="text" placeholder="e.g. MNo. 123456" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.icaiRegistrationNumber} onChange={(e) => updateFormData({ icaiRegistrationNumber: e.target.value })} />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Primary Qualification</label>
                      <input type="text" placeholder="e.g. B.Com / MBA / Tally Certified" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.professionalQualification} onChange={(e) => updateFormData({ professionalQualification: e.target.value })} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Practice/Firm Name</label>
                    <input type="text" placeholder="e.g. Varma & Co" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.firmName} onChange={(e) => updateFormData({ firmName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Experience Years</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.experienceYears} onChange={(e) => updateFormData({ experienceYears: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">City</label>
                    <input type="text" placeholder="Hyderabad" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.city} onChange={(e) => updateFormData({ city: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black">Skills & Expertise</h2>
                <p className="text-slate-500">Select the domains you excel in.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(ServiceCategory).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => toggleSpecialization(cat)} 
                      className={`px-4 py-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.specializations.includes(cat) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h2 className="text-3xl font-black mb-2">Portfolio Documents</h2>
                  <p className="text-slate-500">Upload documents that validate your expertise.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Professional Photo</label>
                    <div 
                      onClick={() => handleFileUpload('profilePhotoUrl')}
                      className={`h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${formData.profilePhotoUrl ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                    >
                      {formData.profilePhotoUrl ? (
                        <>
                          <img src={formData.profilePhotoUrl} className="h-24 w-24 rounded-2xl object-cover mb-2 border-2 border-white shadow-sm" alt="" />
                          <p className="text-xs font-bold text-green-600">Photo Attached</p>
                        </>
                      ) : (
                        <>
                          <Camera className="h-10 w-10 text-slate-300 mb-2" />
                          <p className="text-sm font-bold text-slate-500">Click to Upload</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest">{isAccountant ? 'Experience Letter/Degree' : 'ICAI Certificate'}</label>
                    <div 
                      onClick={() => handleFileUpload(isAccountant ? 'documentUrl' : 'icaiCertificateUrl')}
                      className={`h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${(formData.icaiCertificateUrl || formData.documentUrl) ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                    >
                      {(formData.icaiCertificateUrl || formData.documentUrl) ? (
                        <>
                          <Check className="h-10 w-10 text-green-500 mb-2" />
                          <p className="text-xs font-bold text-green-600 text-center px-4">Proof Received<br/><span className="text-[10px] opacity-60">Verified Mock Document</span></p>
                        </>
                      ) : (
                        <>
                          <FileUp className="h-10 w-10 text-slate-300 mb-2" />
                          <p className="text-sm font-bold text-slate-500">Upload PDF/Scan</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black">Standard Services</h2>
                    <button onClick={addService} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1">
                      <Plus size={14} /> Add Service
                    </button>
                 </div>
                 <div className="space-y-4">
                    {formData.services.map((s, i) => (
                      <div key={i} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in slide-in-from-right-4">
                        <div className="flex-grow">
                           <input 
                             className="w-full bg-transparent font-bold text-slate-900 outline-none mb-1" 
                             placeholder="Service (e.g. Day-to-Day Accounting)" 
                             value={s.name} 
                             onChange={(e) => updateService(i, 'name', e.target.value)} 
                           />
                           <select 
                             className="text-xs text-slate-500 bg-transparent outline-none"
                             value={s.category}
                             onChange={(e) => updateService(i, 'category', e.target.value)}
                           >
                             {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-slate-400 font-bold">₹</span>
                           <input 
                             className="w-24 p-2 bg-white border border-slate-200 rounded-lg font-bold outline-none" 
                             type="number" 
                             placeholder="Price" 
                             value={s.price} 
                             onChange={(e) => updateService(i, 'price', e.target.value)} 
                           />
                        </div>
                        <button onClick={() => removeService(i)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={20}/>
                        </button>
                      </div>
                    ))}
                    {formData.services.length === 0 && (
                      <div className="text-center py-10 text-slate-400 italic">No services listed yet.</div>
                    )}
                 </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-8 animate-in fade-in duration-500 text-center">
                 <div className="bg-blue-50 p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-10 w-10 text-blue-600" />
                 </div>
                 <h2 className="text-3xl font-black">Identity Check</h2>
                 <p className="text-slate-500">Confirm your email to complete the registration. Our compliance team will audit your skills and documents before making your profile public.</p>
                 
                 {isSubmitting ? (
                   <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
                      <p className="font-bold text-slate-700">Finalizing Profile...</p>
                   </div>
                 ) : (
                   <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-2xl">
                      <div className="text-left">
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Onboarding Module</p>
                         <p className="text-sm font-medium">Click finish to enter the verification queue.</p>
                      </div>
                      <button 
                        onClick={async () => {
                          // Fixed: Corrected method name and awaited findProfiles
                          const profiles = await storageService.findProfiles();
                          const myProfile = profiles.find(p => p.userId === user?.id);
                          if (myProfile) navigate(`/verify?caId=${myProfile.id}`);
                        }}
                        className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-blue-50 transition shadow-lg"
                      >
                         Finish Onboarding
                      </button>
                   </div>
                 )}
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={handleBack} 
                disabled={currentStep === 1} 
                className={`flex items-center gap-2 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition ${currentStep === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button 
                onClick={handleNext} 
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95"
              >
                {currentStep === STEPS.length ? 'Submit Profile' : 'Continue'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CARegistrationPage;
