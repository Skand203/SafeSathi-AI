# SafeSathi AI (सेफसाथी)

**Bilingual AI-Powered Scam & Fraud Detection Platform for Senior Citizens**

![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-Flash-4285F4?style=flat-square&logo=google)
![Web Speech API](https://img.shields.io/badge/Web_Speech_API-Bilingual_Voice-critical?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> Submitted for the **Google Solution Challenge 2026**, advancing **UN Sustainable Development Goal 16** (Peace, Justice, and Strong Institutions).

---

## Overview

**SafeSathi** (*सेफसाथी* — "Safe Companion") is an accessible, bilingual web application designed to protect elderly citizens in India from digital deception and financial cyber fraud.

### The Problem
Senior citizens in India are disproportionately targeted by cybercriminals via WhatsApp, SMS, and unsolicited phone messages. Common attack vectors include fraudulent electricity disconnection threats, fake bank KYC expirations, lottery scams, and "digital arrest" extortion. Existing security tooling typically presents confusing technical jargon (e.g., *phishing, DNS spoofing, payload analysis*), lacks support for regional languages, and provides poor accessibility for elderly users.

### The Solution
SafeSathi allows users to paste suspicious messages or message text into an accessible interface. A serverless Next.js API route evaluates the message using **Google Gemini AI**, returning a clear three-tier risk evaluation (**Safe**, **Suspicious**, or **High Danger**) alongside a concise 2–3 sentence plain-language explanation in **English** or **Hindi**. Results can be read aloud with a single tap using native browser text-to-speech.

---

## Architecture & Data Flow

```text
 ┌────────────────────────────────────────────────────────┐
 │ Client Browser (Next.js Client Component)              │
 │  - High-contrast, WCAG AA accessible interface         │
 │  - English / Hindi language selector                   │
 │  - Web Speech API (SpeechSynthesis) audio player       │
 └───────────────────────────┬────────────────────────────┘
                             │
                             │ POST /api/analyze
                             │ { message, language }
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ Next.js 16 Serverless API Route (src/app/api/analyze)   │
 │  - Server-side input validation (≤ 5,000 characters)   │
 │  - Secret API Key isolation (process.env.GEMINI_API_KEY)│
 │  - System Prompt Generation with scam-pattern taxonomy │
 └───────────────────────────┬────────────────────────────┘
                             │
                             │ Google GenAI SDK (@google/genai)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ Google Gemini API (gemini-3.5-flash / flash)           │
 │  - Analyzes psychological urgency & threat pressure    │
 │  - Identifies deceptive links, APK downloads, OTP traps│
 │  - Enforces structured JSON output schema              │
 └───────────────────────────┬────────────────────────────┘
                             │
                             │ Structured JSON Response
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ Client Result Display                                  │
 │  - Color-coded risk card (Safe / Suspicious / Danger)  │
 │  - Conversational explanation in selected language     │
 │  - Single-tap bilingual speech readout                 │
 └────────────────────────────────────────────────────────┘
```

---

## Key Features

- **Bilingual Scam Evaluation (English & Hindi):** Full localization across UI labels, form placeholders, AI risk explanations, and speech synthesis.
- **Single-Tap Voice Readout (Web Speech API):** Leverages browser-native `window.speechSynthesis` with language-specific locale voicing (`hi-IN` and `en-US`), ensuring users with low vision or limited literacy can hear the verdict.
- **Structured Threat Taxonomy:** Prompts Gemini to analyze text against real-world Indian fraud vectors:
  - Psychological pressure (*"Immediate action required"*, *"Power will be cut at 9:30 PM"*).
  - Financial extraction (*"Send ₹10 to verify KYC"*, *"Scan QR code to receive money"*).
  - Impersonation (*TRAI, Mumbai Police, State Electricity Board, Bank Officials*).
- **Elderly-First Accessibility (WCAG AA):** Large high-contrast typography, prominent interactive touch targets, dark theme (`#1a1a1a` base with accessible accents), and clean visual feedback states.
- **Server-Side API Security:** The Gemini API key is isolated inside server-side environment variables and is never exposed to the client bundle.

---

## Project Structure

```text
SafeSathi-AI/
├── src/
│   └── app/
│       ├── api/
│       │   └── analyze/
│       │       └── route.ts        # POST endpoint interfacing with Google GenAI SDK
│       ├── globals.css             # Tailwind v4 utility styles & base variables
│       ├── layout.tsx              # Application shell & OpenGraph metadata
│       └── page.tsx                # Accessible bilingual user interface & speech handler
├── .eslintrc.json
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.js
├── tsconfig.json
└── README.md
```

---

## API Specification

### `POST /api/analyze`
Evaluates input text against known fraud patterns.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "message": "Dear customer, your electricity will be disconnected tonight at 9:30 PM due to pending bill. Call electricity officer immediately at 9876543210.",
  "language": "english"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | `string` | Yes | The message text to analyze (max 5,000 characters). |
| `language` | `string` | Yes | Target explanation language (`"english"` or `"hindi"`). |

#### Response (`200 OK`)
```json
{
  "isScam": true,
  "riskLevel": "High Danger",
  "explanation": "This is a widespread electricity bill disconnection scam. Official utility companies never threaten immediate power cutoffs via unofficial mobile numbers. Do not call this number or share any payment details."
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `isScam` | `boolean` | Binary classification indicator. |
| `riskLevel` | `string` | Severity level: `"Safe"` \| `"Suspicious"` \| `"High Danger"`. |
| `explanation` | `string` | Concise, non-technical guidance tailored to senior citizens in the chosen language. |

---

## Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Skand203/SafeSathi-AI.git
cd SafeSathi-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## Security & Privacy Considerations

- **No Data Retention:** Submitted message text is processed in-memory during the inference request and is never persisted to a database or logged to disk.
- **Input Sanitization & Length Caps:** Inputs are strictly truncated and validated to prevent prompt injection attempts and denial-of-service abuse.
- **Zero Client-Side Secrets:** Gemini API communication executes strictly within the Next.js API route layer.

---

## Roadmap

- [ ] Support for additional Indic regional languages (Tamil, Telugu, Bengali, Marathi).
- [ ] Direct image / screenshot upload for WhatsApp forwards via Gemini Vision OCR analysis.
- [ ] Shareable one-click WhatsApp warning cards for family awareness.
- [ ] Offline PWA (Progressive Web App) support for quick mobile access.

---

## License

This project is licensed under the [MIT License](LICENSE).
