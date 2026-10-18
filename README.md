# 🛡️ SafeSathi — AI Scam Checker

> **SafeSathi** (सेफसाथी) means *"Safe Companion"* — an AI-powered scam detection tool designed especially for elderly users in India.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-3.5_Flash-4285F4?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📖 What is SafeSathi?

SafeSathi is a web application that lets anyone paste a suspicious WhatsApp message, SMS, or email and instantly get an AI-powered verdict — **safe**, **suspicious**, or **high danger** — explained in plain, simple language without technical jargon.

It was built with **elderly users as the primary audience**, so every design decision prioritises large text, high contrast, and ease of use.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **AI Analysis** | Powered by Google Gemini `gemini-3.5-flash` — detects urgency, unknown links, OTP/payment requests |
| 🌐 **Bilingual** | Full English & Hindi support — UI labels, placeholders, AI explanations, and Read Aloud all switch language |
| 🔊 **Read Aloud** | One-tap voice readout using the browser's native Web Speech API (`hi-IN` / `en-US`) |
| ♿ **Accessible** | WCAG AA contrast, `aria-live` regions, skip-to-main link, `aria-pressed` toggles, focus-visible rings |
| 🎨 **Dark Theme** | LeetCode-inspired dark UI (`#1a1a1a` base, `#FFA116` orange accents) — easy on the eyes |
| 🛡️ **Secure** | API key stays server-side; `.env.local` is git-ignored; input capped at 5 000 characters |

---

## 🖼️ Preview

### Risk Level Cards

| Safe ✅ | Suspicious ⚠️ | High Danger 🚨 |
|---|---|---|
| Dark green card | Dark amber card | Dark red card |
| Green badge & icon | Amber badge & icon | Red banner & icon |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Google Gemini API key** — get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 1 — Clone the repository

```bash
git clone https://github.com/Skand203/SafeSathi-AI.git
cd SafeSathi-AI
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Add your API key

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

> ⚠️ **Never commit this file.** It is already listed in `.gitignore`.

### 4 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

```
SafeSathi/
├── src/
│   └── app/
│       ├── page.tsx                # Main UI — client component
│       ├── layout.tsx              # Root layout + SEO metadata
│       ├── globals.css             # Tailwind v4 import
│       └── api/
│           └── analyze/
│               └── route.ts       # POST /api/analyze — Gemini handler
├── .env.local                      # 🔒 Secret API key (git-ignored)
├── .gitignore
├── next.config.ts
├── postcss.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔌 API Reference

### `POST /api/analyze`

Analyses a message for scam indicators.

**Request body**

```json
{
  "message": "Congratulations! You have won ₹50,000. Click here now.",
  "language": "english"
}
```

| Field | Type | Values |
|---|---|---|
| `message` | `string` | The suspicious text (max 5 000 chars) |
| `language` | `string` | `"english"` or `"hindi"` |

**Response**

```json
{
  "isScam": true,
  "riskLevel": "High Danger",
  "explanation": "This message is a fake prize scam. Real companies never ask you to claim money through unknown links. Please do not click the link and delete this message immediately."
}
```

| Field | Type | Values |
|---|---|---|
| `isScam` | `boolean` | `true` / `false` |
| `riskLevel` | `string` | `"Safe"` · `"Suspicious"` · `"High Danger"` |
| `explanation` | `string` | 2–3 sentence plain-language explanation in the requested language |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + inline styles |
| AI | [@google/genai](https://www.npmjs.com/package/@google/genai) — Gemini 3.5 Flash |
| Icons | [lucide-react](https://lucide.dev/) |
| Speech | Web Speech API (`SpeechSynthesis`) — built into all modern browsers |

---

## 🔒 Security Considerations

- The Gemini API key is **only accessed server-side** in the Next.js API route — it is never exposed to the browser.
- `.env.local` is listed in `.gitignore` and is never committed.
- User input is validated and capped at 5 000 characters before being sent to Gemini.
- When deploying, add `GEMINI_API_KEY` as an environment variable in your hosting platform's dashboard.

---

## ☁️ Deployment

### Deploy to Vercel (recommended)

1. Push your code to GitHub (already done ✅).
2. Go to [vercel.com](https://vercel.com), import the repository.
3. Under **Settings → Environment Variables**, add:
   ```
   GEMINI_API_KEY = your_api_key_here
   ```
4. Click **Deploy**. Vercel auto-detects Next.js.

---

## 🗺️ Roadmap

- [ ] Voice input (speech-to-text) — paste by speaking
- [ ] Share result as image for WhatsApp forwarding
- [ ] History of checked messages (local storage)
- [ ] Browser extension for checking messages in-context
- [ ] More Indic language support (Tamil, Telugu, Bengali)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Made with ❤️ to help keep everyone safe online.
</p>
