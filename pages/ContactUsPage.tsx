
import React, { useState } from 'react';
// Added ShieldCheck to imports to fix "Cannot find name 'ShieldCheck'" error on line 168
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ShieldCheck } from 'lucide-react';

const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Support Center</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-6">How can we help you?</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Whether you're a client seeking financial advice or a CA looking to join our network, our team is here for you.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Cards */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition">
                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-lg">Email Us</h3>
                <p className="text-slate-500 text-sm mb-3">Our support team usually responds within 4 hours.</p>
                <a href="mailto:itsurmanishmehra@gmail.com" className="text-blue-600 font-bold hover:underline">itsurmanishmehra@gmail.com</a>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition">
                <div className="bg-green-50 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-lg">Call Us</h3>
                <p className="text-slate-500 text-sm mb-3">Mon-Fri from 9am to 6pm IST.</p>
                <a href="tel:+91180082964872" className="text-slate-900 font-bold">+91 1800-TAX-MITRA</a>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition">
                <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-lg">Visit Us</h3>
                <p className="text-slate-500 text-sm mb-1">Corporate Office:</p>
                <p className="text-slate-900 text-sm font-medium">Kattedan, Hyderabad, Telangana 500077</p>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 h-full">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                        <input 
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                        <input 
                          type="email"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Subject</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Inquiry about GST Registration"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Message</label>
                      <textarea 
                        required
                        rows={6}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                        placeholder="Tell us more about your requirement..."
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 group"
                    >
                      Send Message <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </form>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="bg-blue-100 text-blue-600 p-6 rounded-full mb-8">
                       <MessageSquare className="h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Message Received!</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg">
                      Thank you for reaching out. We've received your inquiry and will get back to you shortly at {formData.email}.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                      Send Another Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Teaser */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-4 justify-center md:justify-start">
                 <Clock className="h-5 w-5" />
                 <span className="font-bold uppercase text-xs tracking-wider">Business Hours</span>
              </div>
              <p className="text-slate-600">Standard Support: Mon - Fri, 9am - 6pm</p>
              <p className="text-slate-600">Premium Support: 24/7 priority access</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-4 justify-center md:justify-start">
                 <Globe className="h-5 w-5" />
                 <span className="font-bold uppercase text-xs tracking-wider">Coverage</span>
              </div>
              <p className="text-slate-600">Pan-India network across 28 states and 8 Union Territories.</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-4 justify-center md:justify-start">
                 <ShieldCheck className="h-5 w-5" />
                 <span className="font-bold uppercase text-xs tracking-wider">Legal</span>
              </div>
              <p className="text-slate-600">All Chartered Accountants are ICAI verified and registered practitioners.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;
