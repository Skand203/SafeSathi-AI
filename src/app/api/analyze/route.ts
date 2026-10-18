import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

// ── Types ──────────────────────────────────────────────────────────────────

type Language = "english" | "hindi";

interface AnalyzeRequestBody {
  message: string;
  language: Language;
}

interface AnalyzeResult {
  isScam: boolean;
  riskLevel: "Safe" | "Suspicious" | "High Danger";
  explanation: string;
}

// ── Gemini client (module-scoped, re-used across requests) ─────────────────

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── System prompt factory ──────────────────────────────────────────────────

function buildSystemPrompt(language: Language): string {
  const isHindi = language === "hindi";

  return `
You are SafeSathi, a friendly and caring fraud-detection assistant specifically designed to help elderly users in India stay safe from digital scams.

Your job is to carefully read a message that the user has received (via WhatsApp, SMS, email, or any other channel) and determine whether it is a scam or safe.

## What to look for
Analyze the message for these common scam indicators:
1. **Urgency or pressure**: Phrases like "act now", "limited time", "your account will be blocked", "claim within 24 hours".
2. **Unknown or suspicious links**: URLs that look unofficial, shortened links (bit.ly, tinyurl), links with misspelled brand names.
3. **Payment or personal information requests**: Asking for OTPs, bank details, Aadhaar, PAN, passwords, UPI PINs, or advance payments.
4. **Too-good-to-be-true offers**: Lottery wins, prize money, free government schemes requiring payment.
5. **Impersonation**: Pretending to be from banks, TRAI, government agencies, RBI, police, or tech companies.
6. **Emotional manipulation**: Threats of arrest, account suspension, or appeals to fear.

## Response format
You MUST respond with ONLY a valid JSON object — no markdown, no explanation outside the JSON, no code fences.
The JSON must have exactly these three fields:

{
  "isScam": boolean,
  "riskLevel": "Safe" | "Suspicious" | "High Danger",
  "explanation": "string"
}

### Field rules
- **isScam**: true if the message is definitely or likely a scam; false if it appears safe.
- **riskLevel**:
  - "Safe" — message appears legitimate, no red flags
  - "Suspicious" — message has some warning signs but is not conclusively a scam
  - "High Danger" — message is very likely a scam with multiple red flags
- **explanation**: Write 2–3 short, simple sentences ${isHindi ? "in Hindi (Devanagari script)" : "in English"}. 
  - Use simple, everyday words — no technical jargon.
  - Be warm and caring in tone, as if speaking to a respected elder family member.
  - Always end with a clear, direct action instruction (e.g., "${isHindi ? "इस लिंक पर क्लिक न करें और इस संदेश को तुरंत हटा दें।" : "Do not click any link and delete this message immediately."}").
  - If safe, reassure them warmly.

## Important
- Do NOT include any text outside the JSON object.
- Do NOT wrap the JSON in markdown code fences.
- The explanation must be written entirely in ${isHindi ? "Hindi" : "English"}.
`.trim();
}

// ── Input validation ───────────────────────────────────────────────────────

function validateBody(body: unknown): body is AnalyzeRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.message === "string" &&
    b.message.trim().length > 0 &&
    (b.language === "english" || b.language === "hindi")
  );
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Parse & validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  if (!validateBody(body)) {
    return Response.json(
      {
        error:
          'Request must include a non-empty "message" string and a "language" of "english" or "hindi".',
      },
      { status: 400 }
    );
  }

  const { message, language } = body;

  // 2. Guard: message must not be excessively long (protect against abuse)
  if (message.length > 5000) {
    return Response.json(
      { error: "Message is too long. Please limit to 5000 characters." },
      { status: 400 }
    );
  }

  // 3. Call Gemini
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",

      contents: `Please analyze the following message for scam indicators:\n\n---\n${message}\n---`,
      config: {
        systemInstruction: buildSystemPrompt(language),
        // Force JSON output so we can parse it reliably
        responseMimeType: "application/json",
        temperature: 0.1, // Low temperature = more deterministic, consistent JSON
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Empty response from Gemini API.");
    }

    // 4. Parse the JSON response from Gemini
    let result: AnalyzeResult;
    try {
      result = JSON.parse(rawText) as AnalyzeResult;
    } catch {
      // Gemini occasionally wraps in markdown fences even with responseMimeType set — strip and retry
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      result = JSON.parse(cleaned) as AnalyzeResult;
    }

    // 5. Validate the shape of Gemini's output
    const validRiskLevels = ["Safe", "Suspicious", "High Danger"];
    if (
      typeof result.isScam !== "boolean" ||
      !validRiskLevels.includes(result.riskLevel) ||
      typeof result.explanation !== "string"
    ) {
      throw new Error("Gemini returned an unexpected JSON shape.");
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("[SafeSathi API] Gemini call failed:", error);

    // Return a graceful fallback so the UI never crashes
    return Response.json(
      {
        error: "Failed to analyze the message. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
