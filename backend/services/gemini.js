import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error("GEMINI_API_KEY is required. Add it to your .env file (see .env.example).");
  }
  return new GoogleGenerativeAI(apiKey.trim());
}

/**
 * Generate a short bullet-point summary of an interview experience.
 * @param {string} experienceText
 * @returns {Promise<string>}
 */
export async function generateSummary(experienceText) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `Summarize the following interview experience in 3 to 4 concise bullet points.
Output only bullet points using "-" at start of each line. No extra text.

Interview experience:
${experienceText}`;

  try {
    console.log("[Gemini] Generating summary, input length:", experienceText.length);
    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response || !response.text) {
      throw new Error("Empty response from Gemini");
    }

    let text = response.text().trim();

    if (!text.includes("-")) {
      const lines = text.split(".").map(l => l.trim()).filter(Boolean).slice(0,4);
      text = lines.map(l => `- ${l}`).join("\n");
    }

    console.log("[Gemini] Summary generated, output length:", text.length);
    return text;
  } catch (err) {
    console.error("[Gemini] generateSummary error:", err.message);
    throw err;
  }
}

/**
 * Generate 5 suggested interview questions
 * @param {string} experienceText
 * @returns {Promise<string[]>}
 */
export async function generateSuggestQuestions(experienceText) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `Based on the following interview experience, generate exactly 5 interview questions a candidate should prepare.
Mix technical and behavioral.
Return ONLY JSON array of 5 strings.

Interview experience:
${experienceText}`;

  try {
    console.log("[Gemini] Generating suggest-questions, input length:", experienceText.length);
    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response || !response.text) {
      throw new Error("Empty response from Gemini");
    }

    const raw = response.text().trim();
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      throw new Error("Expected JSON array");
    }

    const questions = parsed
      .slice(0, 5)
      .map(q => (typeof q === "string" ? q : String(q)).trim())
      .filter(Boolean);

    while (questions.length < 5) questions.push("(Prepare for similar topics)");

    console.log("[Gemini] Suggest-questions generated, count:", questions.length);
    return questions;

  } catch (err) {
    try {
      const result = await model.generateContent(
        `List exactly 5 interview questions based on this experience. One per line numbered 1 to 5.\n\n${experienceText}`
      );

      const text = result.response?.text?.()?.trim() || "";
      const lines = text
        .split(/\n/)
        .map(s => s.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0,5);

      while (lines.length < 5) lines.push("(Prepare for similar topics)");

      console.log("[Gemini] Suggest-questions generated (fallback), count:", lines.length);
      return lines;

    } catch (_) {}

    console.error("[Gemini] generateSuggestQuestions error:", err.message);
    throw err;
  }
}