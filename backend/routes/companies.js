// backend/routes/companies.js
import express from "express";
import Company from "../models/Company.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { generateSummary, generateSuggestQuestions } from "../services/gemini.js";

const router = express.Router();

/* helper: search query */
function buildSearchQuery(search) {
  if (!search) return {};
  return { name: { $regex: search, $options: "i" } };
}

/* helper: load company and check access (same as GET /:id). Returns company or sends 404/403 and returns null. */
async function getCompanyIfAllowed(req, res) {
  const c = await Company.findById(req.params.id).lean();
  if (!c) {
    res.status(404).json({ msg: "Not found" });
    return null;
  }
  const isOwner = String(c.createdBy) === String(req.user.id);
  if (req.user.role !== "admin") {
    if (c.status !== "approved" && !isOwner) {
      res.status(403).json({ msg: "Not allowed" });
      return null;
    }
  }
  return c;
}

function buildExperienceText(c) {
  const parts = [`Company: ${c.name || ""}`];
  if (c.year) parts.push(`Year: ${c.year}`);
  if (c.college) parts.push(`College: ${c.college}`);
  parts.push("");
  parts.push("Rounds:");
  (c.rounds || []).forEach((r, i) => {
    parts.push(`- ${r.title || `Round ${i + 1}`}: ${r.notes || ""}`);
  });
  return parts.join("\n");
}

/**
 * POST /api/companies
 * - User: creates as PENDING (goes to admin for approval)
 * - Admin: creates as APPROVED
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, rounds = [], year, college } = req.body || {};
    if (!name || !String(name).trim())
      return res.status(400).json({ msg: "Name is required" });

    // sanitize year
    let yr = undefined;
    if (year !== undefined && year !== null && String(year).trim() !== "") {
      const y = parseInt(year, 10);
      const current = new Date().getFullYear() + 1; // allow next year
      if (isNaN(y) || y < 2000 || y > current) {
        return res.status(400).json({ msg: "Year must be between 2000 and " + current });
      }
      yr = y;
    }

    const doc = await Company.create({
      name: String(name).trim(),
      rounds: Array.isArray(rounds) ? rounds : [],
      status: "pending",
      createdBy: req.user.id,
      year: yr,
      college: (college || "").trim() || undefined,
    });

    console.log("[Companies] Created experience:", doc.name, "id=" + doc._id, "rounds=" + (doc.rounds?.length || 0), "by user=" + req.user.id);
    res.status(201).json({
      msg: "Submitted for approval",
      company: { ...doc.toObject(), roundsCount: doc.rounds?.length || 0 },
    });
  } catch (e) {
    console.error("[Companies] POST create error:", e.message);
    res.status(500).json({ msg: "Server error" });
  }
});
/**
 * GET /api/companies
 * - Admin: can filter by status (?status=pending/approved/rejected) and search
 * - User: sees ONLY APPROVED (public).  👈 IMPORTANT
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { search = "", status } = req.query;
    const searchQ = buildSearchQuery(search);
    let query = {};

    if (req.user.role === "admin") {
      if (status && ["pending", "approved", "rejected"].includes(status)) {
        query = { ...searchQ, status };
      } else {
        query = { ...searchQ };
      }
    } else {
      // Non-admin users get ONLY approved companies in the public list
      query = { ...searchQ, status: "approved" };
    }

    const items = await Company.find(query).sort({ createdAt: -1 }).lean();
    const withCounts = items.map((c) => ({ ...c, roundsCount: c.rounds?.length || 0 }));
    console.log("[Companies] GET list: role=" + req.user.role + ", count=" + withCounts.length + (search ? " search=" + search : ""));
    return res.json(withCounts);
  } catch (e) {
    console.error("[Companies] GET list error:", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/companies/mine
 * - User’s own submissions (any status)
 */
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const { search = "" } = req.query;
    const items = await Company.find({
      ...buildSearchQuery(search),
      createdBy: req.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const withCounts = items.map((c) => ({ ...c, roundsCount: c.rounds?.length || 0 }));
    console.log("[Companies] GET mine: count=" + withCounts.length);
    return res.json(withCounts);
  } catch (e) {
    console.error("[Companies] GET mine error:", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/companies/pending  (ADMIN)
 */
router.get("/pending", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { search = "" } = req.query;
    const items = await Company.find({ ...buildSearchQuery(search), status: "pending" })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    const withCounts = items.map((c) => ({ ...c, roundsCount: c.rounds?.length || 0 }));
    console.log("[Companies] GET pending: count=" + withCounts.length);
    return res.json(withCounts);
  } catch (e) {
    console.error("[Companies] GET pending error:", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/companies/:id/summarize
 * - Same access as GET /:id. Returns AI-generated summary (3-4 bullets).
 */
router.get("/:id/summarize", requireAuth, async (req, res) => {
  try {
    const c = await getCompanyIfAllowed(req, res);
    if (!c) return;
    console.log("[Companies] Summarize requested: id=" + req.params.id + " name=" + c.name);
    const experienceText = buildExperienceText(c);
    const summary = await generateSummary(experienceText);
    console.log("[Companies] Summary generated for", c.name);
    return res.json({ summary });
  } catch (e) {
    console.error("[Companies] Summarize error:", e.message);
    return res.status(502).json({ msg: "Summary unavailable" });
  }
});

/**
 * GET /api/companies/:id/suggest-questions
 * - Same access as GET /:id. Returns top 10 questions to prepare.
 */
router.get("/:id/suggest-questions", requireAuth, async (req, res) => {
  try {
    const c = await getCompanyIfAllowed(req, res);
    if (!c) return;
    console.log("[Companies] Suggest-questions requested: id=" + req.params.id + " name=" + c.name);
    const experienceText = buildExperienceText(c);
    const questions = await generateSuggestQuestions(experienceText);
    console.log("[Companies] Questions generated for", c.name, "count=" + (questions?.length || 0));
    return res.json({ questions });
  } catch (e) {
    console.error("[Companies] Suggest-questions error:", e.message);
    return res.status(502).json({ msg: "Suggestions unavailable" });
  }
});

/**
 * GET /api/companies/:id
 * - Admin: can open anything
 * - User: can open APPROVED; can open own even if pending/rejected (owner visibility)
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const c = await getCompanyIfAllowed(req, res);
    if (!c) return;
    console.log("[Companies] GET experience: id=" + req.params.id + " name=" + c.name);
    return res.json({ ...c, roundsCount: c.rounds?.length || 0 });
  } catch (e) {
    console.error("[Companies] GET :id error:", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * PATCH /api/companies/:id/approve   (ADMIN)
 */
router.patch("/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    const c = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "approved", rejectionReason: "" } },
      { new: true }
    ).lean();
    if (!c) return res.status(404).json({ msg: "Not found" });
    console.log("[Companies] Approved: id=" + req.params.id + " name=" + c.name);
    return res.json({ msg: "Approved", company: { ...c, roundsCount: c.rounds?.length || 0 } });
  } catch (e) {
    console.error("[Companies] Approve error:", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * PATCH /api/companies/:id/reject   (ADMIN)
 * body: { reason?: string }
 */
router.patch("/:id/reject", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { reason = "" } = req.body || {};
    const c = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "rejected", rejectionReason: reason } },
      { new: true }
    ).lean();
    if (!c) return res.status(404).json({ msg: "Not found" });
    console.log("[Companies] Rejected: id=" + req.params.id + " name=" + c.name, reason ? "reason length=" + reason.length : "");
    return res.json({ msg: "Rejected", company: { ...c, roundsCount: c.rounds?.length || 0 } });
  } catch (e) {
    console.error("[Companies] Reject error:", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * DELETE /api/companies/:id   (ADMIN)
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const c = await Company.findByIdAndDelete(req.params.id).lean();
    if (!c) return res.status(404).json({ msg: "Not found" });
    console.log("[Companies] Deleted: id=" + req.params.id + " name=" + c.name);
    return res.json({ msg: "Deleted" });
  } catch (e) {
    console.error("[Companies] Delete error:", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
