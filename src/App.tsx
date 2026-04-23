/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LogOut, 
  MapPin, 
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './lib/firebase';
import { UserProfile } from './types';
import { translations } from './constants/translations';

// Sub-components (Refactored architecture)
import { Button } from './components/ui';
import { NavButton } from './components/shared';
import { LandingPage } from './components/features/LandingPage';
import { CaseMonitor } from './components/features/CaseMonitor';
import { SubmitCase } from './components/features/SubmitCase';
import { AlertsDashboard } from './components/features/AlertsDashboard';

const App = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cases'|'submit'|'alerts'>('cases');
  const [language, setLanguage] = useState<'fr' | 'en'>(() => {
    const saved = localStorage.getItem('afyachain_lang');
    return (saved as 'fr' | 'en') || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('afyachain_lang', language);
  }, [language]);

  const t = translations[language];

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            role: 'CHW',
            district: 'CENTRAL-01',
            createdAt: new Date()
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      }
      setLoading(false);
    });
  }, []);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LandingPage onLogin={login} language={language} setLanguage={setLanguage} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-8 flex flex-col shrink-0">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">A</div>
          <div>
            <h1 className="font-black tracking-tighter text-xl leading-none">AfyaChain<span className="text-blue-600">.</span></h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Node v2.0</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          <NavButton active={activeTab === 'cases'} onClick={() => setActiveTab('cases')} icon={MapPin} label={t.registry_monitor} />
          <NavButton active={activeTab === 'submit'} onClick={() => setActiveTab('submit')} icon={MapPin} label={t.diagnostic_input} />
          <NavButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={MapPin} label={t.district_alerts} />
        </nav>

        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col gap-4">
           <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <MapPin size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase text-slate-400 truncate">{user.email}</p>
                <p className="text-xs font-bold text-slate-900 truncate">{profile?.role}</p>
              </div>
           </div>
           <Button variant="outline" onClick={logout} className="w-full !justify-start !px-4" icon={LogOut}>
              {language === 'fr' ? 'Déconnexion' : 'Logout'}
           </Button>
           <button 
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-lg justify-center mt-2"
          >
            {language === 'fr' ? 'Switch to English' : 'Passer au Français'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              {activeTab === 'cases' && t.data_flow}
              {activeTab === 'submit' && t.clinical_lab}
              {activeTab === 'alerts' && t.health_intel}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <MapPin size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-600">{profile?.district || t.district_node}</span>
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
           {activeTab === 'cases' && <CaseMonitor profile={profile} language={language} />}
           {activeTab === 'submit' && <SubmitCase profile={profile} language={language} />}
           {activeTab === 'alerts' && <AlertsDashboard profile={profile} language={language} />}
        </div>

        <footer className="mt-auto p-10 border-t border-slate-200 bg-white">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                 <span className="flex items-center gap-2"><MapPin size={12} /> {t.cloud_sync_active}</span>
                 <span className="flex items-center gap-2"><MapPin size={12} /> {t.gemini_enabled}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.privacy_protocol}</p>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
