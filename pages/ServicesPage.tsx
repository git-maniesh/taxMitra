
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  FileText, 
  Shield, 
  Briefcase, 
  Landmark, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  Clock,
  Zap,
  Star,
  Users,
  MessageSquare
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../constants';
import { useAuth } from '../store/AuthContext';

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const getIcon = (idx: number) => {
    switch (idx) {
      case 0: return <Calculator className="h-8 w-8" />;
      case 1: return <FileText className="h-8 w-8" />;
      case 2: return <Shield className="h-8 w-8" />;
      case 3: return <Briefcase className="h-8 w-8" />;
      case 4: return <Landmark className="h-8 w-8" />;
      default: return <Zap className="h-8 w-8" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const scrollToServices = () => {
    const element = document.getElementById('all-services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-20 lg:py-32 overflow-hidden relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px]"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full mb-6 border border-blue-100"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">Premium Financial Network</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight"
            >
              End-to-End <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Compliance Support.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl font-medium"
            >
              Whether you're an early-stage startup or a multi-state corporation, TaxMitra connects you with specialized Chartered Accountants for every financial milestone.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => navigate('/search')}
                className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-700 transition shadow-2xl shadow-blue-200 flex items-center gap-2 group"
              >
                Find an Expert <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={scrollToServices}
                className="bg-white text-slate-700 border border-slate-200 px-10 py-5 rounded-2xl font-black hover:bg-slate-50 transition shadow-sm"
              >
                Browse All Services
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Quick View */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between gap-8 md:gap-0">
          {[
            { label: 'Verified Partners', value: '5,000+', icon: Shield },
            { label: 'Services Offered', value: '45+', icon: Zap },
            { label: 'Happy Clients', value: '1.2M+', icon: Users },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 px-6"
            >
              <div className="p-3 bg-white/10 rounded-xl">
                <stat.icon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Services Grid */}
      <section id="all-services" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Expert Solutions</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Financial Mastery Areas</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-6 rounded-full"></div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14"
          >
            {SERVICE_CATEGORIES.map((cat, idx) => (
              <motion.div 
                key={cat.id} 
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex flex-col h-full relative z-10">
                  <div className="bg-slate-50 text-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-50 group-hover:shadow-blue-200">
                    {getIcon(idx)}
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  
                  <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                    Industry-specific compliance strategies for {cat.name.toLowerCase()}, designed to minimize risk and optimize financial health.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-12">
                    {cat.services.map((service, sIdx) => (
                      <div key={sIdx} className="flex items-center text-slate-700 font-bold text-sm">
                        <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        </div>
                        {service}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-100 group"
                    >
                      Connect with Specialists <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Consultation / How it Works Section */}
      <section className="bg-slate-900 py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-6 block">The TaxMitra Process</span>
              <h2 className="text-4xl md:text-5xl font-black mb-12 leading-tight tracking-tight">Getting Started is <br /><span className="text-blue-400">Streamlined.</span></h2>
              
              <div className="space-y-10">
                {[
                  { icon: <HelpCircle className="h-6 w-6 text-blue-400" />, title: "Describe Your Needs", desc: "Our intelligent matching engine identifies your specific filing or audit requirements instantly." },
                  { icon: <Briefcase className="h-6 w-6 text-blue-400" />, title: "Select Verified CAs", desc: "Filter by experience, location, and rating to find the perfect professional fit for your project." },
                  { icon: <Clock className="h-6 w-6 text-blue-400" />, title: "Direct Workspaces", desc: "Collaborate via encrypted chat and secure document exchange portals for total peace of mind." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="bg-white/10 p-4 rounded-2xl h-fit group-hover:bg-blue-600 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-[3rem] blur-[80px] opacity-20 -z-10 scale-110"></div>
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 lg:p-14 rounded-[3rem] shadow-2xl">
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-blue-500/20">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-3xl font-black mb-6 tracking-tight">Need a Custom Quote?</h3>
                <p className="text-slate-300 mb-10 leading-relaxed font-medium text-lg">
                  For complex corporate requirements, multiple entities, or long-term retainer engagements, talk to our business desk.
                </p>
                
                <div className="space-y-5 mb-12">
                  {[
                    "Multi-state compliance support",
                    "Customizable service bundles",
                    "Priority 24/7 account management"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-4 text-slate-200 font-bold text-sm">
                      <div className="bg-green-500/20 p-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </div>
                      {benefit}
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => navigate('/contact')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-blue-900/40 transform active:scale-95 flex items-center justify-center gap-3"
                >
                  Message Business Desk <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs / Final CTA Section */}
      <section className="py-32 text-center bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Ready to Simplify Compliance?</h2>
            <p className="text-slate-500 mb-12 text-xl font-medium max-w-2xl mx-auto">
              Join thousands of businesses who have optimized their taxes with India's largest CA network.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated && (
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-blue-600 text-white px-12 py-5 rounded-2xl font-black hover:bg-blue-700 transition shadow-2xl shadow-blue-200 transform hover:-translate-y-1"
                >
                  Get Started for Free
                </button>
              )}
              <button 
                onClick={() => navigate('/search')}
                className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black transition ${
                  isAuthenticated 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-200 transform hover:-translate-y-1' 
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Explore Experts
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
