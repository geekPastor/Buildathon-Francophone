import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DiagnosisResult {
  diagnosis: string;
  probability: number;
  reasoning: string;
  redFlags: string[];
  riskLevel: 'LOW' | 'MODERATE' | 'CRITICAL';
  priorityScore: number;
}

export interface MalnutritionResult {
  status: 'NORMAL' | 'MAM' | 'SAM';
  estimatedMuac: number;
  confidence: number;
  observations: string[];
}

export interface StockPrediction {
  itemName: string;
  predictedDemand: number;
  reasoning: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const aiService = {
  async analyzeSymptoms(symptoms: string[], patientAge: number, history?: string): Promise<DiagnosisResult> {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analysez ces symptômes pour un enfant de ${patientAge} mois dans un contexte rural en Afrique : ${symptoms.join(", ")}. 
      Contexte/Historique : ${history || "Aucun"}. 
      Suivez les directives PCIME de l'OMS. 
      Évaluez également le niveau de risque (LOW/MODERATE/CRITICAL) et un score de priorité (0-100).
      Veuillez répondre en français.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            probability: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MODERATE', 'CRITICAL'] },
            priorityScore: { type: Type.NUMBER }
          },
          required: ["diagnosis", "probability", "reasoning", "redFlags", "riskLevel", "priorityScore"]
        }
      }
    });

    return JSON.parse(response.text);
  },

  async detectMalnutrition(imageBase64: string): Promise<MalnutritionResult> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: "Analysez cette photo d'un enfant pour détecter des signes de malnutrition (SAM/MAM). Recherchez l'amyotrophie, l'oedème ou la lecture du ruban MUAC si visible. Retournez le statut, le MUAC estimé en cm, la confiance et les observations en français." },
        { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['NORMAL', 'MAM', 'SAM'] },
            estimatedMuac: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            observations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["status", "estimatedMuac", "confidence", "observations"]
        }
      }
    });

    return JSON.parse(response.text);
  },

  async predictStockNeeds(cases: any[], currentStock: number): Promise<StockPrediction[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analysez ces cas récents : ${JSON.stringify(cases)}. 
      Stock actuel : ${currentStock}. 
      Prédisez les besoins en médicaments essentiels (Artéméther-Luméfantrine, Amoxicilline, SRO) pour les 7 prochains jours.
      Veuillez répondre en français au format JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemName: { type: Type.STRING },
              predictedDemand: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              urgency: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] }
            },
            required: ["itemName", "predictedDemand", "reasoning", "urgency"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  },

  async processVoiceCommand(transcript: string): Promise<{ symptoms: string[], history: string }> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extrayez les symptômes et l'historique médical de ce texte parlé par un agent de santé : "${transcript}".
      Retournez une liste de symptômes normalisés et un texte d'historique.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            history: { type: Type.STRING }
          },
          required: ["symptoms", "history"]
        }
      }
    });

    return JSON.parse(response.text);
  }
};
