export type UserRole = 'CHW' | 'AUTHORITY';
export type RiskLevel = 'LOW' | 'MODERATE' | 'CRITICAL';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  district?: string;
  createdAt: Date;
}

export interface PatientCase {
  id?: string;
  patientId: string; // For longitudinal tracking
  patientAgeMonths: number;
  symptoms: string[];
  hasFever: boolean;
  history?: string;
  diagnosis?: string;
  probability?: number;
  reasoning?: string;
  redFlags?: string[];
  malnutritionStatus?: string;
  muacMeasurement?: number;
  photoUrl?: string;
  chwId: string;
  district: string;
  village: string;
  riskLevel: RiskLevel;
  priorityScore: number;
  isAlert?: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: any;
  hospitalConfirmedDiagnosis?: string; // For feedback loop
}

export interface PatientRecord {
  id: string;
  name?: string; // Optional/Encrypted PII
  village: string;
  district: string;
  lastVisit: any;
  riskHistory: { date: any; level: RiskLevel }[];
}

export interface MedicalStock {
  id?: string;
  district: string;
  itemName: string;
  currentStock: number;
  unit: string;
  threshold: number;
  lastUpdated: any;
}

export interface EpidemicAlert {
  id?: string;
  district: string;
  condition: string;
  caseCount: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED';
  createdAt: any;
  predictedCases7d?: number; // For forecasting
}

export interface AIFeedbackLoop {
  id?: string;
  caseId: string;
  aiDiagnosis: string;
  hospitalDiagnosis: string;
  isCorrect: boolean;
  note?: string;
  createdAt: any;
}
