/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, LogOut, LayoutDashboard, ChevronRight, MapPin, AlertCircle, TrendingUp, Package, Zap, X, CheckCircle, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { aiService, StockPrediction } from '../../services/aiService';
import { UserProfile, EpidemicAlert } from '../../types';
import { Card, Button } from '../ui';
import { translations } from '../../constants/translations';

interface AlertsDashboardProps {
  profile: UserProfile | null;
  language: 'fr' | 'en';
}

export const AlertsDashboard = ({ profile, language }: AlertsDashboardProps) => {
  const t = translations[language];
  const [alerts, setAlerts] = useState<EpidemicAlert[]>([]);
  const [caseData, setCaseData] = useState<any[]>([]);
  const [stockPredictions, setStockPredictions] = useState<StockPrediction[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const qAlerts = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(10));
    
    // Simulating aggregated case data for the chart
    setCaseData([
      { name: 'Lun', cases: 12, threshold: 40, predicted: 15 },
      { name: 'Mar', cases: 18, threshold: 40, predicted: 20 },
      { name: 'Mer', cases: 22, threshold: 40, predicted: 25 },
      { name: 'Jeu', cases: 45, threshold: 40, predicted: 50 },
      { name: 'Ven', cases: 38, threshold: 40, predicted: 42 },
      { name: 'Sam', cases: 42, threshold: 40, predicted: 48 },
      { name: 'Dim', cases: 55, threshold: 40, predicted: 62 },
    ]);

    const unsubscribe = onSnapshot(qAlerts, (snapshot) => {
      setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EpidemicAlert)));
    });

    // Stock prediction logic
    const loadStockAnalysis = async () => {
      try {
        const predictions = await aiService.predictStockNeeds([], 500); 
        setStockPredictions(predictions);
      } catch (err) {
        console.error(err);
      }
    };
    loadStockAnalysis();

    return () => unsubscribe();
  }, [profile]);

  return (
    <div className="space-y-8">
      {/* Continuous Learning / Feedback Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-2xl p-6 text-white flex items-center justify-between shadow-xl"
      >
        <div className="flex items-center gap-6">
           <div className="p-3 bg-white/10 rounded-xl">
             <ShieldCheck size={24} className="text-blue-400" />
           </div>
             <div>
               <h3 className="font-bold tracking-tight">{language === 'fr' ? "Boucle d'Amélioration IA" : "AI Improvement Loop"}</h3>
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'fr' ? "Comparez les diagnostics IA aux réalités hospitalières" : "Compare AI diagnoses with hospital realities"}</p>
             </div>
        </div>
        <Button variant="secondary" onClick={() => setShowFeedback(true)} className="!bg-white/10 !text-white hover:!bg-white/20">{language === 'fr' ? "Ouvrir l'Analyse" : "Open Analysis"}</Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Epidemic Forecast Chart */}
        <Card title={t.district_alerts} subtitle={t.health_intel} icon={TrendingUp} className="lg:col-span-2">
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={caseData}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cases" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCases)" strokeWidth={3} />
                <Area type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" fill="none" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Cas Actuels</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-red-500 border-dashed rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Seuil d'Alerte</span>
             </div>
          </div>
        </Card>

        {/* Smart Stock Predictions */}
        <Card title={language === 'fr' ? 'Besoin de Stocks' : 'Stock Needs'} subtitle="Logistique" icon={Package}>
           <div className="space-y-4">
              {stockPredictions.map((stock, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-slate-900">{stock.itemName}</span>
                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
                        stock.urgency === 'HIGH' ? 'bg-red-100 text-red-600' : 
                        stock.urgency === 'MEDIUM' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                     }`}>
                        {stock.urgency}
                     </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight mb-2">{stock.reasoning}</p>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                     <span>Demande prédite :</span>
                     <span className="text-slate-900">+{stock.predictedDemand} unités</span>
                  </div>
                </div>
              ))}
              {stockPredictions.length === 0 && <div className="py-10 text-center text-[10px] font-bold text-slate-300 uppercase">Analyse des stocks...</div>}
           </div>
        </Card>
      </div>

      {/* Outbreak Alerts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {alerts.map(alert => (
           <div key={alert.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4 relative z-10">
                 <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <AlertCircle size={20} />
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{alert.createdAt?.toDate().toLocaleDateString()}</span>
              </div>
              <h4 className="text-lg font-black tracking-tight text-slate-900 mb-1 relative z-10">{alert.condition}</h4>
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4 relative z-10">{alert.caseCount} cas détectés / 48h</p>
              <div className="p-3 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100 relative z-10">
                 District {alert.district} • Status: {alert.status}
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <TrendingUp size={80} className="text-red-600" />
              </div>
           </div>
         ))}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowFeedback(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]"
            >
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{language === 'fr' ? "Analyse de Performance IA" : "AI Performance Analysis"}</h2>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Nœud de District • Apprentissage Continu</p>
                  </div>
                  <button onClick={() => setShowFeedback(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X size={24} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Précision Moyenne</p>
                       <p className="text-3xl font-black text-slate-900">94.2%</p>
                       <div className="mt-2 text-[10px] font-bold text-emerald-500 uppercase">+1.2% ce mois</div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Faux Positifs</p>
                       <p className="text-3xl font-black text-slate-900">3.1%</p>
                       <div className="mt-2 text-[10px] font-bold text-blue-500 uppercase">Seuil optimal</div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cas Validés</p>
                       <p className="text-3xl font-black text-slate-900">1,240</p>
                       <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase">Derniers 90 jours</div>
                    </div>
                  </div>

                  <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-6 border-b border-slate-100 pb-2">Vérifications Humaines Requises</h3>
                  
                  <div className="space-y-4">
                    {[
                      { id: 1, disease: 'Malaria Probable', confidence: '89%', date: '2h ago', status: 'pending' },
                      { id: 2, disease: 'Pneumonie Suspectée', confidence: '92%', date: '5h ago', status: 'pending' },
                      { id: 3, disease: 'Malnutrition SAM', confidence: '96%', date: 'Yesterday', status: 'pending' }
                    ].map(item => (
                      <div key={item.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                              <Zap size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{item.disease}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{item.date} • Confiance IA: {item.confidence}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="outline" className="!py-2 !px-4 !text-[10px] gap-2 hover:!bg-emerald-50 hover:!text-emerald-600 hover:!border-emerald-200">
                              <ThumbsUp size={14} /> {language === 'fr' ? 'Valider' : 'Validate'}
                           </Button>
                           <Button variant="outline" className="!py-2 !px-4 !text-[10px] gap-2 hover:!bg-red-50 hover:!text-red-600 hover:!border-red-200">
                              <ThumbsDown size={14} /> {language === 'fr' ? 'Rejeter' : 'Reject'}
                           </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                     <AlertTriangle className="text-blue-500 shrink-0" size={20} />
                     <div>
                        <p className="text-sm font-bold text-blue-900 mb-1">{language === 'fr' ? "Amélioration Continue" : "Continuous Improvement"}</p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          {language === 'fr' 
                            ? "Chaque validation humaine permet de ré-entraîner les modèles de district pour réduire les erreurs de diagnostic dans les zones à faible connectivité."
                            : "Each human validation allows for the retraining of district models to reduce diagnostic errors in areas with low connectivity."}
                        </p>
                     </div>
                  </div>
               </div>
               
               <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <Button onClick={() => setShowFeedback(false)}>{language === 'fr' ? 'Fermer' : 'Close'}</Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
