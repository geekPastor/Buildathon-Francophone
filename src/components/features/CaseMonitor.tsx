/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Search, Users, Shield, Thermometer, Cloud, FileText, Clock, ArrowUpRight, Activity, AlertCircle, History, X } from 'lucide-react';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { StatCard } from '../shared';
import { Card, Button } from '../ui';
import { UserProfile, PatientCase, RiskLevel } from '../../types';
import { translations } from '../../constants/translations';

interface CaseMonitorProps {
  profile: UserProfile | null;
  language: 'fr' | 'en';
}

export const CaseMonitor = ({ profile, language }: CaseMonitorProps) => {
  const t = translations[language];
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'cases'),
      where('district', '==', profile.district || 'CENTRAL'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      setCases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PatientCase)));
    });
  }, [profile]);

  const stats = {
    total: cases.length,
    critical: cases.filter(c => c.riskLevel === 'CRITICAL').length,
    alerts: cases.filter(c => c.isAlert).length
  };

  return (
    <div className="space-y-8">
      {/* Real-time Stats Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label={t.total_cases} value={stats.total.toString()} icon={Database} />
        <StatCard label={t.critical_cases} value={stats.critical.toString()} icon={AlertCircle} status={stats.critical > 0 ? 'danger' : 'normal'} />
        <StatCard label={t.active_outbreaks} value={stats.alerts.toString()} icon={Cloud} status={stats.alerts > 0 ? 'warning' : 'normal'} />
        <StatCard label={t.forecast_7d} value="+12%" icon={Activity} status="success" />
      </div>

      <Card title={t.registry_monitor} subtitle={t.data_flow} icon={Search}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-4 py-2">{language === 'fr' ? 'Heure' : 'Time'}</th>
                <th className="px-4 py-2">{t.patient_id}</th>
                <th className="px-4 py-2">Diagnostic</th>
                <th className="px-4 py-2">{t.triage}</th>
                <th className="px-4 py-2">Nutrition</th>
                <th className="px-4 py-2">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={c.id} 
                  className="bg-slate-50/50 hover:bg-slate-100/50 transition-colors group rounded-xl"
                >
                  <td className="px-4 py-4 font-mono text-[10px] text-slate-400">
                    {c.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-bold font-mono text-slate-600">{c.patientId}</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{c.village}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs font-bold text-slate-900 leading-none mb-1">{c.diagnosis}</p>
                    <div className="flex gap-1">
                      {c.symptoms.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-medium">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${
                      c.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-600' : 
                      c.riskLevel === 'MODERATE' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                     <span className="text-[10px] font-bold text-slate-600">{c.malnutritionStatus || 'SAIN'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCase(c)}
                      className="!py-1.5 !px-3 !text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100"
                      icon={ArrowUpRight}
                    >
                      {t.view_history}
                    </Button>
                  </td>
                </motion.tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-xs italic">
                    {language === 'fr' ? 'Aucune donnée entrante...' : 'No incoming data...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient Longitudinal View Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCase(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
               <div className="bg-slate-900 p-8 text-white">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Historique Longitudinal</p>
                        <h2 className="text-3xl font-black tracking-tight">{selectedCase.patientId}</h2>
                        <p className="text-sm text-white/50">{selectedCase.village}, {selectedCase.district}</p>
                     </div>
                     <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="flex gap-4">
                     <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Âge</p>
                        <p className="text-sm font-bold">{selectedCase.patientAgeMonths} mois</p>
                     </div>
                     <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Dernier MUAC</p>
                        <p className="text-sm font-bold text-emerald-400">{selectedCase.muacMeasurement || '--'} cm</p>
                     </div>
                  </div>
               </div>
               
               <div className="p-8 space-y-8">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 border-b border-slate-100 pb-2">Progression du Risque</h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4">
                          <div className="w-12 text-[10px] font-bold text-slate-400 uppercase">{selectedCase.createdAt?.toDate().toLocaleDateString()}</div>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${
                                selectedCase.riskLevel === 'CRITICAL' ? 'bg-red-500 w-full' :
                                selectedCase.riskLevel === 'MODERATE' ? 'bg-orange-500 w-2/3' : 'bg-blue-500 w-1/3'
                             }`} />
                          </div>
                          <div className="text-[10px] font-black uppercase text-slate-600">{selectedCase.riskLevel}</div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                           <History size={12} /> Diagnostic IA
                        </h4>
                        <p className="text-sm font-bold text-slate-900">{selectedCase.diagnosis}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                           <FileText size={12} /> Recommandation
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 leading-tight">Patient stable. Surveillance communautaire recommandée dans 7 jours.</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
