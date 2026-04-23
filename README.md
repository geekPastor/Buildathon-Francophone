# AfyaChain: Rural Health Medical Intelligence

AfyaChain is an AI-powered public health platform designed to bridge the medical gap in rural Africa. By empowering Community Health Workers (CHWs) with state-of-the-art diagnostic assistance, vision-based malnutrition screening, and real-time epidemic surveillance, AfyaChain transforms standard smartphones into clinical-grade medical assistants.

## 🚀 Vision & Mission

In remote districts, access to specialist doctors is often a luxury. AfyaChain's mission is to ensure that "every second counts" by providing:
- **Immediate Triage**: Rapid symptom analysis using the WHO IMCI guidelines.
- **Resilient Infrastructure**: Offline-first operation with smart background synchronization.
- **Data-Driven Logistics**: Predictive modeling to prevent essential drug stockouts.

## ✨ Key Features

### 🩺 1. AI-Assisted Diagnosis (Gemini 3.1 Pro)
Leverages advanced LLMs to provide probabilistic diagnoses based on symptoms, clinical history, and local epidemiological context.
- **Smart Triage**: Categorizes cases into Low, Moderate, or Critical risk levels.
- **Medical Logic**: Provides the reasoning behind each suggestion to assist learning.

### 📸 2. Vision-Based Malnutrition Detection (Gemini 3 Flash)
An automated screening tool for Severe Acute Malnutrition (SAM) and Moderate Acute Malnutrition (MAM).
- **MUAC Estimation**: Analyzes photos to estimate Mid-Upper Arm Circumference.
- **Visual Evidence**: Detects muscle wasting and edema from standard smartphone photos.

### 📡 3. Real-Time Epidemic Surveillance
Aggregates neighborhood-level data to detect outbreaks before they become crises.
- **Anomaly Detection**: Statistical identification of case surges (e.g., Malaria, Cholera).
- **Geolocation Mapping**: Anonymous heatmaps of risk zones for district authorities.

### 🎙️ 4. Multilingual Voice Assistant
Supports Community Health Workers during home visits.
- **Speech-to-Text**: Specialized clinical transcription in French and English.
- **Symptom Extraction**: Automatically identifies clinical signs from spoken descriptions.

### 📦 5. Predictive Supply Chain
Uses historical case data to forecast medical stock requirements.
- **Demand Forecasting**: Predicts needs for Artether-Lumefantrine, Amoxicillin, and ORS.
- **Urgency Scoring**: Prioritizes supply shipments based on actual workload.

## 🏗️ Technical Architecture

The project follows a modular, professional architecture designed for maintainability and performance:

- **Frontend**: React 18+ with Vite and Tailwind CSS.
- **Animations**: Framer Motion for high-quality interaction feedback.
- **Backend/Database**: Firebase (Firestore) for real-time NoSQL storage.
- **Authentication**: Firebase Auth (Google Provider).
- **AI Engine**: Google Gemini API (@google/genai) for specialized clinical reasoning.
- **State Management**: React Hooks & Context for efficient data flow.

### File Structure
```text
src/
├── components/
│   ├── features/    # Page-level feature modules (Diagnosis, Monitor, etc.)
│   ├── shared/      # Shared application components (StatCards, Nav)
│   └── ui/          # Atomic UI components (Buttons, Inputs, Cards)
├── constants/       # Translations and configuration
├── hooks/           # Custom React hooks (Geolocation, etc.)
├── lib/             # Firebase and Third-party initializations
├── services/        # AI and API service abstraction
└── types.ts         # Global TypeScript definitions
```

## 🔒 Privacy & Security

- **Compliance**: Designed with GDPR/HIPAA principles in mind.
- **Anonymization**: PII (Personally Identifiable Information) is isolated or encrypted.
- **Consent**: Explicit hardware permissions (Camera, Location, Mic) requested only when necessary.

## 📅 Roadmap 2026

- [ ] **Local AI Education**: Health tips generated in native dialects.
- [ ] **Water Quality Tracking**: Community-led sentinel surveillance of water sources.
- [ ] **Agile Blood Network**: Local coordination for emergency transfusion needs.
- [ ] **Integrated Tele-Triage**: Escalation paths to district doctors via encrypted chat.

## 📄 License

AfyaChain is released under the **Apache-2.0 License**.

---
*Built with ❤️ by **Geek Pastor** dans le cadre du **Buildathon Francophone**.*
