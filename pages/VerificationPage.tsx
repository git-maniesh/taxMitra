
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const VerificationPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, notify } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const caId = params.get('caId');
    if (!caId) {
      setStatus('error');
      return;
    }

    const performVerification = async () => {
      try {
        const success = await verifyEmail(caId);
        if (success) {
          setStatus('success');
          notify('Email verified! Your profile is now under admin review.', 'success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };

    performVerification();
  }, [params, verifyEmail, notify]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
        {status === 'verifying' && (
          <div className="animate-in fade-in duration-500">
             <div className="bg-blue-50 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Verifying Security Link</h2>
             <p className="text-slate-500 font-medium">Please wait while we validate your credentials and confirm your account identity...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in zoom-in-95 duration-500">
             <div className="bg-green-100 text-green-600 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="h-12 w-12" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 mb-4">Email Verified!</h2>
             <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
               Your email identity has been successfully confirmed. Your professional profile is now in the <strong>Admin Review Queue</strong>. 
               Our verification team will audit your ICAI documents shortly.
             </p>
             <button 
               onClick={() => navigate('/ca-dashboard')}
               className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition shadow-xl shadow-slate-200"
             >
               Go to Dashboard <ArrowRight size={18} />
             </button>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in fade-in duration-500">
             <div className="bg-red-50 text-red-600 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <ShieldCheck className="h-10 w-10" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h2>
             <p className="text-slate-500 mb-8 font-medium">The verification link is either expired, invalid, or has already been used. Please request a new link from your dashboard.</p>
             <button 
               onClick={() => navigate('/')}
               className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
             >
               Return Home
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
