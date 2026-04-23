/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { RefreshCcw, Plus, Activity, Zap, ShieldCheck, CheckCircle2, Stethoscope, TrendingUp, Package } from 'lucide-react';
import { Button } from '../ui';
import { translations } from '../../constants/translations';

interface LandingPageProps {
  onLogin: () => void;
  language: 'fr' | 'en';
  setLanguage: (l: 'fr' | 'en') => void;
}

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100"
  };

  return (
    <div className="p-10 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
      <div className={`p-4 rounded-2xl w-fit mb-8 border transition-transform group-hover:scale-110 ${colors[color as keyof typeof colors]}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
};

export const LandingPage = ({ onLogin, language, setLanguage }: LandingPageProps) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-black tracking-tighter text-xl">AfyaChain<span className="text-blue-600">.</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-full"
          >
            <RefreshCcw size={10} />
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
          <Button onClick={onLogin} variant="primary" className="!py-2 !px-5 text-xs uppercase tracking-widest">Login</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px] tracking-widest uppercase mb-8 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            {t.hero_tag}
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-8">
            {t.hero_title_1}<br/>
            <span className="text-blue-600">{t.hero_title_2}</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-xl leading-relaxed mb-10 font-medium italic">
            "{t.hero_desc}"
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={onLogin} icon={Plus} className="!py-4 !px-8 text-base">
              {t.cta_start}
            </Button>
            <div className="flex -space-x-3 items-center">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="avatar" />
                </div>
              ))}
              <div className="pl-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">+500 Districts</p>
                <p className="text-xs font-bold text-slate-900 leading-none">{t.hero_social}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-square bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-8 gap-4 p-8">
              {Array.from({length: 64}).map((_, i) => (
                <div key={i} className="border border-white/50 rounded-sm" />
              ))}
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Diagnostic Système</p>
                   <h3 className="text-white text-3xl font-black tracking-tight leading-none">Analyse de Nœud District B-12</h3>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
                   <Activity className="text-emerald-400 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Charge Épidémique</span>
                     <span className="text-blue-400 text-xs font-bold">+42.8%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Zap size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Latence Réseau 0ms</p>
                     <p className="text-white font-bold">Synchronisation Locale Active</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating tags */}
          <div className="absolute -top-6 -right-6 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={20}/></div>
             <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Sécurité</p>
                <p className="text-[11px] font-black text-slate-900 leading-none">Conforme RGPD/HIPAA</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">{t.features_title}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">{t.features_subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Stethoscope} 
              title={t.f1_title} 
              desc={t.f1_desc}
              color="blue"
            />
            <FeatureCard 
              icon={TrendingUp} 
              title={t.f2_title} 
              desc={t.f2_desc}
              color="emerald"
            />
            <FeatureCard 
              icon={Package} 
              title={t.f3_title} 
              desc={t.f3_desc}
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* The Why section */}
      <section id="mission" className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
           <div className="flex-1">
              <div className="aspect-video bg-slate-900 rounded-[32px] shadow-2xl relative overflow-hidden p-12">
                 <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)]" />
                 <div className="relative z-10 flex flex-col justify-center h-full">
                    <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Urgence District</h4>
                    <p className="text-3xl font-light text-white leading-tight italic">
                      "Dans les districts ruraux, les enfants souffrant de malaria ou de pneumonie peuvent succomber en 24h sans traitement."
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                       <div className="h-0.5 w-12 bg-blue-600" />
                       <span className="text-white font-bold text-xs">Mission AfyaChain</span>
                    </div>
                 </div>
              </div>
           </div>
           <div className="flex-1 space-y-10">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-6">{t.why_title}</h2>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  {t.why_desc}
                </p>
              </div>
              <ul className="space-y-6">
                 {[t.why_point_1, t.why_point_2, t.why_point_3].map((point, i) => (
                   <li key={i} className="flex gap-4 items-start">
                     <div className="mt-1 p-1 bg-blue-50 text-blue-600 rounded-md"><CheckCircle2 size={16}/></div>
                     <span className="font-bold text-slate-700">{point}</span>
                   </li>
                 ))}
              </ul>
              <Button onClick={onLogin} variant="primary" className="!py-4 !px-8 text-base shadow-xl shadow-slate-900/10">
                {t.cta_start}
              </Button>
           </div>
        </div>
      </section>

      {/* Roadmap section */}
      <section className="py-24 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full font-bold text-[10px] tracking-widest uppercase mb-8">
            Roadmap 2026
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-12">{language === 'fr' ? 'Impact Communautaire Futur' : 'Future Community Impact'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'edu', title: language === 'fr' ? 'Éducation IA Locale' : 'Local AI Education', desc: language === 'fr' ? 'Conseils de santé générés en dialectes locaux.' : 'Health advice generated in local dialects.' },
              { id: 'water', title: language === 'fr' ? 'Qualité de l\'Eau' : 'Water Quality Tracking', desc: language === 'fr' ? 'Suivi communautaire des sources d\'eau potable.' : 'Community tracking of safe water sources.' },
              { id: 'blood', title: language === 'fr' ? 'Réseau de Don de Sang' : 'Blood Donor Network', desc: language === 'fr' ? 'Coordination locale des urgences transfusionnelles.' : 'Local coordination for transfusion emergencies.' },
              { id: 'gps', title: language === 'fr' ? 'Cartographie Anonyme' : 'Anonymous Heatmaps', desc: language === 'fr' ? 'Visualisation des zones à risque sans compromis PII.' : 'Risk zone visualization without PII compromise.' }
            ].map(item => (
              <div key={item.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs text-center">A</div>
                <span className="font-black tracking-tighter text-lg leading-none">AfyaChain.</span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                © 2026 Geek Pastor. All rights reserved.<br/>
                Développé dans le cadre du Buildathon Francophone.
              </p>
           </div>
           <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Ethics</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
           </div>
        </div>
      </footer>
    </div>
  );
};
