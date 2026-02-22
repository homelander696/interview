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
 * @param {string} experienceText - Plain text description (company, rounds, notes).
 * @returns {Promise<string>} Summary as 3-4 bullet points.
 */
export async function generateSummary(experienceText) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: MODEL });
  const prompt = `You are a helpful assistant. Summarize the following interview experience in 3 to 4 concise bullet points. Focus on key rounds, topics, and outcomes. Output only the bullet list, no intro or outro.

Interview experience:
${experienceText}`;

  try {
    console.log("[Gemini] Generating summary, input length:", experienceText.length);
    const result = await model.generateContent(prompt);
    const response = result.response;
    if (!response || !response.text) {
      throw new Error("Empty response from Gemini");
    }
    const text = response.text().trim();
    console.log("[Gemini] Summary generated, output length:", text.length);
    return text;
  } catch (err) {
    console.error("[Gemini] generateSummary error:", err.message);
    throw err;
  }
}

/**
 * Generate 10 questions a candidate could prepare based on an interview experience.
 * @param {string} experienceText - Plain text description (company, rounds, notes).
 * @returns {Promise<string[]>} Array of exactly 10 question strings.
 */
export async function generateSuggestQuestions(experienceText) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: MODEL });
  const prompt = `You are a helpful assistant. Based on the following interview experience, suggest exactly 10 questions that a candidate could prepare for similar interviews. Mix technical, behavioral, and role-specific questions. Output only a JSON array of 10 strings, no other text. Example format: ["Question 1?", "Question 2?", ...]

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
    // Strip markdown code block if present
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error("Expected JSON array");
    }
    const questions = parsed.slice(0, 10).map((q) => (typeof q === "string" ? q : String(q)).trim()).filter(Boolean);
    const out = questions.length >= 10 ? questions : [...questions, ...Array(10 - questions.length).fill("(Prepare for similar topics)")];
    console.log("[Gemini] Suggest-questions generated, count:", out.length);
    return out;
  } catch (err) {
    // Fallback: try newline-separated list
    try {
      const result = await model.generateContent(
        `Based on this interview experience, list exactly 10 questions a candidate could prepare. One per line, numbered 1. to 10. No other text.\n\n${experienceText}`
      );
      const text = result.response?.text?.()?.trim() || "";
      const lines = text.split(/\n/).map((s) => s.replace(/^\d+\.\s*/, "").trim()).filter(Boolean).slice(0, 10);
      if (lines.length >= 10) {
        console.log("[Gemini] Suggest-questions generated (fallback), count:", lines.length);
        return lines;
      }
      while (lines.length < 10) lines.push("(Prepare for similar topics)");
      return lines;
    } catch (_) {}
    console.error("[Gemini] generateSuggestQuestions error:", err.message);
    throw err;
  }
}
