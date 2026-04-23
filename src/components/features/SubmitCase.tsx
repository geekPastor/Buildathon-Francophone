/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Mic, Zap, Camera, TrendingUp, CheckCircle2, ChevronRight, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { db } from '../../lib/firebase';
import { aiService, DiagnosisResult, MalnutritionResult } from '../../services/aiService';
import { UserProfile, PatientCase } from '../../types';
import { Card, Button, Input } from '../ui';
import { translations } from '../../constants/translations';
import { useGeolocation } from '../../hooks/useGeolocation';

interface SubmitCaseProps {
  profile: UserProfile | null;
  language: 'fr' | 'en';
}

export const SubmitCase = ({ profile, language }: SubmitCaseProps) => {
  const t = translations[language];
  const { location, error: geoError } = useGeolocation();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const [formData, setFormData] = useState({
    village: '',
    age: '',
    symptoms: [] as string[],
    hasFever: false,
    history: ''
  });

  const [analysis, setAnalysis] = useState<DiagnosisResult | null>(null);
  const [malnutrition, setMalnutrition] = useState<MalnutritionResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const symptomList = language === 'fr' 
    ? ['Toux', 'Diarrhée', 'Vomissements', 'Léthargie', 'Éruption cutanée', 'Respiration rapide', 'Convulsions']
    : ['Cough', 'Diarrhea', 'Vomiting', 'Lethargy', 'Skin Rash', 'Fast Breathing', 'Convulsions'];

  const toggleSymptom = (s: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) 
        ? prev.symptoms.filter(x => x !== s)
        : [...prev.symptoms, s]
    }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const data = canvasRef.current.toDataURL('image/jpeg');
      setPhoto(data);
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    setErrors(prev => ({ ...prev, symptoms: '' }));
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setLoading(true);
      try {
        const result = await aiService.processVoiceCommand(text);
        setFormData(prev => ({
          ...prev,
          symptoms: [...new Set([...prev.symptoms, ...result.symptoms])],
          history: prev.history + " " + result.history
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsListening(false);
      }
    };
    recognition.start();
  };

  const validateStep1 = () => {
    let newErrors: { [key: string]: string } = {};
    if (!formData.village.trim()) newErrors.village = language === 'fr' ? 'Le village est requis' : 'Village is required';
    
    const ageNum = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = language === 'fr' ? 'L\'âge est requis' : 'Age is required';
    } else if (isNaN(ageNum) || ageNum < 0 || ageNum > 240) {
      newErrors.age = language === 'fr' ? 'Âge invalide (0-240 mois)' : 'Invalid age (0-240 months)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors: { [key: string]: string } = {};
    if (formData.symptoms.length === 0 && !formData.history.trim()) {
      newErrors.symptoms = language === 'fr' ? 'Sélectionnez au moins un symptôme ou ajoutez un historique' : 'Select at least one symptom or add patient history';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const [diag, mal] = await Promise.all([
        aiService.analyzeSymptoms(formData.symptoms, parseInt(formData.age), formData.history),
        photo ? aiService.detectMalnutrition(photo.split(',')[1]) : Promise.resolve(null)
      ]);
      setAnalysis(diag);
      setMalnutrition(mal);
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveCase = async () => {
    if (!profile || !analysis) return;
    setLoading(true);
    try {
      const caseData: PatientCase = {
        patientId: `PAT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        patientAgeMonths: parseInt(formData.age),
        symptoms: formData.symptoms,
        hasFever: formData.hasFever,
        history: formData.history,
        diagnosis: analysis.diagnosis,
        probability: analysis.probability,
        reasoning: analysis.reasoning,
        redFlags: analysis.redFlags,
        malnutritionStatus: malnutrition?.status,
        muacMeasurement: malnutrition?.estimatedMuac,
        chwId: profile.uid,
        district: profile.district || 'CENTRAL',
        village: formData.village,
        riskLevel: analysis.riskLevel,
        priorityScore: analysis.priorityScore,
        createdAt: serverTimestamp(),
        // Integration of Location
        latitude: location?.latitude,
        longitude: location?.longitude
      };
      await addDoc(collection(db, 'cases'), caseData);
      setStep(1);
      setFormData({ village: '', age: '', symptoms: [], hasFever: false, history: '' });
      setPhoto(null);
      setAnalysis(null);
      setMalnutrition(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 w-12 transition-all ${step >= s ? 'bg-[#141414]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <span className="font-mono text-xs uppercase text-gray-500">{language === 'fr' ? 'Étape' : 'Step'} {step} {language === 'fr' ? 'sur' : 'of'} 4</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card title={t.new_case} subtitle={t.district_node} icon={MapPin}>
               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <Input label="Village" value={formData.village} onChange={v => { setFormData(p=>({...p, village: v})); setErrors(p=>({...p, village: ''})); }} placeholder="ex: Kanyama" />
                     {errors.village && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.village}</p>}
                   </div>
                   <div className="space-y-1">
                     <Input label={language === 'fr' ? "Âge (mois)" : "Age (months)"} type="number" value={formData.age} onChange={v => { setFormData(p=>({...p, age: v})); setErrors(p=>({...p, age: ''})); }} placeholder="0-60" />
                     {errors.age && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.age}</p>}
                   </div>
                 </div>
                 
                 <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${location ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${location ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <MapPin size={16} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Géo-localisation</p>
                          <p className="text-xs font-bold text-slate-900">
                             {geoError ? (language === 'fr' ? 'Erreur de signal' : 'Signal Error') : (location ? (language === 'fr' ? 'Coordonnées verrouillées' : 'Coordinates Locked') : (language === 'fr' ? 'Recherche signal...' : 'Finding signal...'))}
                          </p>
                       </div>
                    </div>
                    {location && <ShieldCheck className="text-emerald-500" size={16} />}
                 </div>

                 <Button onClick={() => validateStep1() && setStep(2)} className="w-full mt-4" icon={ChevronRight}>{language === 'fr' ? 'Suivant : Symptômes' : 'Next: Symptoms'}</Button>
               </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card title={language === 'fr' ? 'Constats Cliniques' : 'Clinical Findings'} subtitle={language === 'fr' ? 'Observation' : 'Observation'} icon={Stethoscope}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {symptomList.map(s => (
                      <button 
                        key={s} 
                        onClick={() => { toggleSymptom(s); setErrors(p=>({...p, symptoms: ''})); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                          formData.symptoms.includes(s) 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.symptoms && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.symptoms}</p>}
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                  <Button variant="secondary" onClick={startVoice} loading={isListening} icon={Mic} className="flex-1 !bg-blue-50 !text-blue-600 hover:!bg-blue-100">
                    {isListening ? t.listening : t.voice_assistant}
                  </Button>
                  <p className="text-[10px] font-bold text-slate-400 max-w-[150px] uppercase leading-tight italic">Gemini transcrit & extrait automatiquement les symptômes</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">Patient History / Clinical Context</label>
                  <textarea 
                    value={formData.history}
                    onChange={e => { setFormData(p=>({...p, history: e.target.value})); setErrors(p=>({...p, symptoms: ''})); }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 min-h-[100px] text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="Capture additional context here..."
                  />
                </div>

                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer group hover:bg-slate-100 transition-colors">
                  <input type="checkbox" checked={formData.hasFever} onChange={e => setFormData(p=>({...p, hasFever: e.target.checked}))} className="w-4 h-4 rounded border-slate-300 text-slate-900" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-900 transition-colors">{language === 'fr' ? 'Le patient a une fièvre visible' : 'Patient has visible fever'}</span>
                </label>
                <div className="flex gap-4 pt-2">
                  <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">{language === 'fr' ? 'Retour' : 'Back'}</Button>
                  <Button onClick={() => { if(validateStep2()) { setStep(3); startCamera(); } }} className="flex-1" icon={ChevronRight}>{language === 'fr' ? 'Suivant : Photo' : 'Next: Photo'}</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card title={language === 'fr' ? 'Dépistage de la Malnutrition' : 'Malnutrition Screening'} subtitle={language === 'fr' ? 'Vision par Ordinateur' : 'Computer Vision'} icon={Camera}>
              <div className="space-y-4">
                {!photo ? (
                  <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden group shadow-inner">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-48 h-48 border border-white/20 rounded-full" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 flex justify-center translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-slate-950 to-transparent">
                       <Button onClick={capturePhoto} icon={Camera} className="shadow-lg shadow-blue-500/20">{language === 'fr' ? 'Capturer Évaluation' : 'Capture Assessment'}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                    <img src={photo} alt="Malnutrition check" className="w-full h-full object-cover" />
                    <button onClick={() => { setPhoto(null); startCamera(); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg backdrop-blur-md">
                       <Zap size={20} />
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                   <AlertTriangle className="text-blue-500 shrink-0" size={16} />
                   <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{language === 'fr' ? "Conseil : Capturez clairement le haut du corps de l'enfant ou la lecture du ruban MUAC." : "Tip: Clearly capture the child's upper body or the MUAC tape reading."}</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">{language === 'fr' ? 'Retour' : 'Back'}</Button>
                  <Button onClick={analyze} loading={loading} className="flex-1" icon={TrendingUp}>{language === 'fr' ? "Lancer l'Analyse IA" : "Launch AI Analysis"}</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 4 && analysis && (
          <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="space-y-6">
              <div className={`p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden ${
                analysis.riskLevel === 'CRITICAL' ? 'bg-red-600' : 
                analysis.riskLevel === 'MODERATE' ? 'bg-orange-600' : 'bg-slate-900'
              }`}>
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                     <HeartPulse size={32} />
                  </div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">{language === 'fr' ? 'ID Référence' : 'Reference ID'}</p>
                     <p className="font-mono font-bold">#AFYA-{Math.floor(Date.now()/100000)}</p>
                   </div>
                </div>
                <div>
                   <h2 className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">
                     {language === 'fr' ? (analysis.probability > 0.8 ? 'Protocole d\'Action Immédiate' : 'Suggestion de Dépistage Standard') : (analysis.probability > 0.8 ? 'Immediate Action Protocol' : 'Standard Screening Suggestion')}
                   </h2>
                   <p className="text-xl font-black tracking-tight">{analysis.diagnosis} ({Math.round(analysis.probability * 100)}%)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-3 border-b border-slate-50 pb-2 tracking-widest">{language === 'fr' ? 'Logique Médicale' : 'Medical Logic'}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium font-sans">{analysis.reasoning}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-3 border-b border-slate-50 pb-2 tracking-widest">{language === 'fr' ? 'Signes de Danger Identifiés' : 'Identified Danger Signs'}</h4>
                  <ul className="text-xs space-y-2">
                    {analysis.redFlags.map((rf, i) => (
                      <li key={i} className="flex items-center gap-2 font-bold text-slate-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        {rf}
                      </li>
                    ))}
                    {analysis.redFlags.length === 0 && <span className="text-slate-300 italic font-medium">{language === 'fr' ? 'Aucun détecté' : 'None detected'}</span>}
                  </ul>
                </div>
              </div>

              {malnutrition && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{language === 'fr' ? 'Métriques de Nutrition par Vision' : 'Vision Nutrition Metrics'}</h4>
                      <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest rounded-full uppercase ${
                        malnutrition.status === 'SAM' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>{malnutrition.status === 'SAM' ? (language === 'fr' ? 'Malnutrition Aiguë Sévère' : 'Severe Acute Malnutrition') : (language === 'fr' ? 'Statut Sain' : 'Healthy Status')}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-3xl font-black tracking-tight text-slate-900">{malnutrition.estimatedMuac} cm</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{language === 'fr' ? 'MUAC Estimé' : 'Estimated MUAC'}</p>
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                           <span>{language === 'fr' ? 'Confiance' : 'Confidence'}</span>
                           <span>{Math.round(malnutrition.confidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${malnutrition.confidence * 100}%` }} className="h-full bg-slate-900" />
                        </div>
                      </div>
                   </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{t.cancel_entry}</Button>
                <Button onClick={saveCase} loading={loading} className="flex-1" icon={CheckCircle2}>{t.submit_to_registry}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Internal icon helper because I missed it in extraction
const HeartPulse = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>
);
