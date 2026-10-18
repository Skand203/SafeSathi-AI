"use client";

import { useState, useCallback } from "react";
import {
  ShieldCheck,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type Language = "english" | "hindi";
type RiskLevel = "Safe" | "Suspicious" | "High Danger";

interface AnalyzeResult {
  isScam: boolean;
  riskLevel: RiskLevel;
  explanation: string;
}

// ── UI label dictionaries ──────────────────────────────────────────────────

const LABELS = {
  english: {
    header: "SafeSathi",
    tagline: "Scam Checker",
    subtitle: "Protect yourself from fraud messages",
    languageLabel: "Language",
    langEnglish: "English",
    langHindi: "हिंदी",
    textareaLabel: "Paste the suspicious message here",
    textareaPlaceholder:
      'Paste the WhatsApp message, SMS, or email text here that you want to check...\n\nFor example: "Congratulations! You have won ₹50,000. Click this link to claim your prize immediately."',
    checkButton: "Check Message",
    checkingButton: "Checking…",
    clearButton: "Clear",
    resultsTitle: "Analysis Result",
    resultsPlaceholder: "Your result will appear here after checking the message.",
    charCount: "characters",
    readAloud: "Read Aloud",
    stopReading: "Stop Reading",
    riskLabel: "Risk Level",
    errorTitle: "Something went wrong",
    errorRetry: "Please try again.",
    safeHeading: "✓ This message looks safe",
    dangerHeading: "⚠ Warning: This looks like a scam!",
    suspiciousHeading: "⚠ Caution: This message is suspicious",
  },
  hindi: {
    header: "सेफसाथी",
    tagline: "स्कैम जाँचकर्ता",
    subtitle: "धोखाधड़ी के संदेशों से खुद को बचाएं",
    languageLabel: "भाषा",
    langEnglish: "English",
    langHindi: "हिंदी",
    textareaLabel: "यहाँ संदिग्ध संदेश चिपकाएं",
    textareaPlaceholder:
      "यहाँ WhatsApp संदेश, SMS, या ईमेल का पाठ चिपकाएं जिसे आप जाँचना चाहते हैं...\n\nउदाहरण: \"बधाई हो! आपने ₹50,000 जीते हैं। अभी अपना इनाम लेने के लिए इस लिंक पर क्लिक करें।\"",
    checkButton: "संदेश जाँचें",
    checkingButton: "जाँच हो रही है…",
    clearButton: "साफ करें",
    resultsTitle: "विश्लेषण परिणाम",
    resultsPlaceholder: "संदेश जाँचने के बाद आपका परिणाम यहाँ दिखाई देगा।",
    charCount: "अक्षर",
    readAloud: "ज़ोर से पढ़ें",
    stopReading: "पढ़ना बंद करें",
    riskLabel: "जोखिम स्तर",
    errorTitle: "कुछ गलत हुआ",
    errorRetry: "कृपया फिर से प्रयास करें।",
    safeHeading: "✓ यह संदेश सुरक्षित लगता है",
    dangerHeading: "⚠ चेतावनी: यह एक स्कैम है!",
    suspiciousHeading: "⚠ सावधान: यह संदेश संदिग्ध है",
  },
};

// ── Risk-level colour tokens ───────────────────────────────────────────────

const RISK_STYLES: Record<
  RiskLevel,
  { bg: string; border: string; badge: string; badgeText: string; icon: string; text: string }
> = {
  Safe: {
    bg: "#0d2818",
    border: "#22c55e",
    badge: "#14532d",
    badgeText: "#86efac",
    icon: "#4ade80",
    text: "#bbf7d0",
  },
  Suspicious: {
    bg: "#292007",
    border: "#f59e0b",
    badge: "#451a03",
    badgeText: "#fde68a",
    icon: "#fbbf24",
    text: "#fef3c7",
  },
  "High Danger": {
    bg: "#2d1515",
    border: "#ef4444",
    badge: "#450a0a",
    badgeText: "#fca5a5",
    icon: "#f87171",
    text: "#fecaca",
  },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  const [language, setLanguage] = useState<Language>("english");
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = LABELS[language];

  // ── API call ──────────────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async () => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    // Reset previous state
    setResult(null);
    setApiError(null);
    setIsLoading(true);
    // Stop any active speech when re-analysing
    if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? `Server error ${response.status}`);
      }

      setResult(data as AnalyzeResult);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }, [messageText, language, isLoading]);

  // ── Clear ─────────────────────────────────────────────────────────────────

  const handleClear = () => {
    setMessageText("");
    setResult(null);
    setApiError(null);
    if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // ── Read Aloud (Web Speech API) ───────────────────────────────────────────

  const handleReadAloud = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hindi" ? "hi-IN" : "en-US";
      utterance.rate = 0.88;   // slightly slower for elderly listeners
      utterance.pitch = 1.05;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel(); // clear queue first
      window.speechSynthesis.speak(utterance);
    },
    [language, isSpeaking]
  );

  // ── Derived display values ────────────────────────────────────────────────

  const isDisabled = !messageText.trim() || isLoading;
  const riskStyles = result ? RISK_STYLES[result.riskLevel] : null;

  const resultHeading = result
    ? result.riskLevel === "Safe"
      ? t.safeHeading
      : result.riskLevel === "High Danger"
      ? t.dangerHeading
      : t.suspiciousHeading
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen text-zinc-100" style={{ backgroundColor: "#1a1a1a" }}>
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-xl focus:font-bold focus:text-zinc-900"
        style={{ backgroundColor: "#FFA116" }}
      >
        Skip to main content
      </a>

      {/* ════════════ HEADER ════════════ */}
      <header style={{ backgroundColor: "#282828", borderBottom: "1px solid #3d3d3d" }}>
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-5">
          <div
            className="rounded-2xl p-3 flex-shrink-0"
            style={{ backgroundColor: "#FFA116" }}
            aria-hidden="true"
          >
            <ShieldCheck className="w-10 h-10 stroke-[2.5]" style={{ color: "#1a1a1a" }} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-none text-zinc-100">
              {t.header}
            </h1>
            <p className="text-2xl font-semibold mt-1" style={{ color: "#FFA116" }}>
              {t.tagline}
            </p>
          </div>
        </div>
        <div style={{ backgroundColor: "#1f1f1f", borderTop: "1px solid #3d3d3d" }}>
          <p className="max-w-3xl mx-auto px-6 py-3 text-xl text-zinc-400">
            {t.subtitle}
          </p>
        </div>
      </header>

      {/* ════════════ MAIN ════════════ */}
      <div id="main-content" className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* ── Language toggle ── */}
        <section aria-labelledby="language-label">
          <div id="language-label" className="flex items-center gap-3 mb-4">
            <Globe className="w-7 h-7 flex-shrink-0" style={{ color: "#FFA116" }} aria-hidden="true" />
            <span className="text-2xl font-bold text-zinc-300">{t.languageLabel}</span>
          </div>

          <div
            role="group"
            aria-labelledby="language-label"
            className="flex rounded-xl overflow-hidden w-full max-w-sm"
            style={{ border: "2px solid #3d3d3d" }}
          >
            {(["english", "hindi"] as Language[]).map((lang, i) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setResult(null);
                  setApiError(null);
                }}
                aria-pressed={language === lang}
                className="flex-1 py-4 text-2xl font-extrabold transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-0"
                style={
                  language === lang
                    ? { backgroundColor: "#FFA116", color: "#1a1a1a" }
                    : { backgroundColor: "#282828", color: "#a1a1aa" }
                }
              >
                {i === 0 ? t.langEnglish : t.langHindi}
              </button>
            ))}
          </div>
        </section>

        {/* ── Message textarea ── */}
        <section aria-labelledby="message-label">
          <label
            id="message-label"
            htmlFor="message-input"
            className="block text-2xl font-bold text-zinc-200 mb-4"
          >
            {t.textareaLabel}
          </label>

          <textarea
            id="message-input"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={t.textareaPlaceholder}
            rows={8}
            disabled={isLoading}
            aria-describedby="char-count"
            className="w-full rounded-xl text-zinc-100 text-xl leading-relaxed placeholder:text-zinc-600 px-6 py-5 focus:outline-none resize-y transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#282828",
              border: "2px solid #3d3d3d",
              caretColor: "#FFA116",
            }}
            onFocus={(e) => (e.currentTarget.style.border = "2px solid #FFA116")}
            onBlur={(e) => (e.currentTarget.style.border = "2px solid #3d3d3d")}
          />

          <p
            id="char-count"
            className="mt-2 text-xl text-right"
            style={{ color: "#6b7280" }}
            aria-live="polite"
            aria-atomic="true"
          >
            {messageText.length} {t.charCount}
          </p>
        </section>

        {/* ── Action buttons ── */}
        <section className="flex flex-col sm:flex-row gap-4" aria-label="Actions">
          {/* Primary CTA */}
          <button
            id="check-button"
            onClick={handleAnalyze}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-busy={isLoading}
            className="flex-1 flex items-center justify-center gap-4 text-2xl font-extrabold py-6 px-8 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              backgroundColor: isDisabled ? "#3d3d3d" : "#FFA116",
              color: isDisabled ? "#6b7280" : "#1a1a1a",
              boxShadow: isDisabled ? "none" : "0 0 28px #FFA11650",
              transform: "scale(1)",
            }}
          >
            {isLoading ? (
              <Loader2 className="w-9 h-9 animate-spin flex-shrink-0" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-9 h-9 flex-shrink-0 stroke-[2.5]" aria-hidden="true" />
            )}
            {isLoading ? t.checkingButton : t.checkButton}
          </button>

          {/* Clear */}
          {(messageText || result || apiError) && (
            <button
              id="clear-button"
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 text-2xl font-bold py-6 px-8 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#282828",
                color: "#a1a1aa",
                border: "2px solid #3d3d3d",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = "#FFA116";
                  e.currentTarget.style.color = "#FFA116";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#3d3d3d";
                e.currentTarget.style.color = "#a1a1aa";
              }}
            >
              <XCircle className="w-7 h-7 flex-shrink-0" aria-hidden="true" />
              {t.clearButton}
            </button>
          )}
        </section>

        {/* ════════════ RESULTS ════════════ */}
        <section
          id="results-section"
          aria-labelledby="results-heading"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2
            id="results-heading"
            className="text-2xl font-bold text-zinc-200 mb-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-7 h-7" style={{ color: "#FFA116" }} aria-hidden="true" />
            {t.resultsTitle}
          </h2>

          {/* ── Placeholder (no result yet) ── */}
          {!result && !apiError && !isLoading && (
            <div
              className="rounded-xl min-h-48 p-10 flex items-center justify-center"
              style={{ backgroundColor: "#282828", border: "2px solid #3d3d3d" }}
            >
              <div className="text-center space-y-4">
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#1f1f1f", border: "2px solid #3d3d3d" }}
                  aria-hidden="true"
                >
                  <ShieldCheck className="w-10 h-10 stroke-[1.5]" style={{ color: "#4b5563" }} />
                </div>
                <p
                  className="text-2xl font-medium max-w-sm mx-auto leading-relaxed"
                  style={{ color: "#6b7280" }}
                >
                  {t.resultsPlaceholder}
                </p>
              </div>
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {isLoading && (
            <div
              className="rounded-xl min-h-48 p-10 flex flex-col items-center justify-center gap-6"
              style={{ backgroundColor: "#282828", border: "2px dashed #3d3d3d" }}
              aria-label="Analyzing message, please wait"
            >
              <Loader2
                className="w-16 h-16 animate-spin"
                style={{ color: "#FFA116" }}
                aria-hidden="true"
              />
              <p className="text-2xl font-bold animate-pulse" style={{ color: "#FFA116" }}>
                {t.checkingButton}
              </p>
            </div>
          )}

          {/* ── API error ── */}
          {apiError && !isLoading && (
            <div
              className="rounded-xl p-8 flex items-start gap-5"
              style={{
                backgroundColor: "#2d1515",
                border: "2px solid #ef4444",
              }}
              role="alert"
            >
              <AlertTriangle
                className="w-10 h-10 flex-shrink-0 mt-1"
                style={{ color: "#f87171" }}
                aria-hidden="true"
              />
              <div>
                <p className="text-2xl font-extrabold text-red-300">{t.errorTitle}</p>
                <p className="text-xl mt-2 text-red-200 leading-relaxed">{apiError}</p>
                <p className="text-xl mt-1" style={{ color: "#f87171" }}>{t.errorRetry}</p>
              </div>
            </div>
          )}

          {/* ── Real result card ── */}
          {result && !isLoading && riskStyles && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `3px solid ${riskStyles.border}` }}
              role="alert"
              aria-live="assertive"
            >
              {/* Card header banner */}
              <div
                className="px-8 py-5 flex items-center gap-4"
                style={{ backgroundColor: riskStyles.border }}
              >
                {result.riskLevel === "Safe" ? (
                  <CheckCircle2
                    className="w-10 h-10 flex-shrink-0 stroke-[2.5]"
                    style={{ color: "#fff" }}
                    aria-hidden="true"
                  />
                ) : (
                  <AlertTriangle
                    className="w-10 h-10 flex-shrink-0 stroke-[2.5]"
                    style={{ color: "#fff" }}
                    aria-hidden="true"
                  />
                )}
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {resultHeading}
                </span>
              </div>

              {/* Card body */}
              <div
                className="px-8 py-7 space-y-6"
                style={{ backgroundColor: riskStyles.bg }}
              >
                {/* Risk level badge */}
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className="text-xl font-bold"
                    style={{ color: riskStyles.text }}
                  >
                    {t.riskLabel}:
                  </span>
                  <span
                    className="text-xl font-extrabold px-5 py-2 rounded-full"
                    style={{
                      backgroundColor: riskStyles.badge,
                      color: riskStyles.badgeText,
                      border: `2px solid ${riskStyles.border}`,
                    }}
                  >
                    {result.riskLevel}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: riskStyles.border, opacity: 0.35 }} />

                {/* Explanation */}
                <p
                  className="text-2xl font-bold leading-relaxed"
                  style={{ color: riskStyles.text }}
                >
                  {result.explanation}
                </p>

                {/* Read Aloud button */}
                <button
                  id="read-aloud-button"
                  onClick={() => handleReadAloud(result.explanation)}
                  className="flex items-center gap-3 text-xl font-bold px-6 py-4 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 active:scale-[0.97]"
                  style={{
                    backgroundColor: isSpeaking ? riskStyles.border : riskStyles.badge,
                    color: isSpeaking ? "#fff" : riskStyles.badgeText,
                    border: `2px solid ${riskStyles.border}`,
                    boxShadow: isSpeaking ? `0 0 20px ${riskStyles.border}60` : "none",
                  }}
                  aria-pressed={isSpeaking}
                  aria-label={isSpeaking ? t.stopReading : t.readAloud}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-7 h-7 flex-shrink-0 animate-pulse" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-7 h-7 flex-shrink-0" aria-hidden="true" />
                  )}
                  {isSpeaking ? t.stopReading : t.readAloud}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ════════════ FOOTER ════════════ */}
      <footer
        style={{
          marginTop: "4rem",
          borderTop: "1px solid #3d3d3d",
          backgroundColor: "#282828",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <p className="text-xl" style={{ color: "#6b7280" }}>
            SafeSathi — Helping you stay safe online.
          </p>
        </div>
      </footer>
    </main>
  );
}
