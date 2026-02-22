import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = express.Router();

/* ---------- STEP 1: Request OTP ---------- */
router.post("/signup/request-otp", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("[Auth] Signup OTP requested for email:", email ? email.replace(/(.{2}).*(@.*)/, "$1***$2") : "(missing)");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[Auth] Signup rejected: user already exists", email ? "(email masked)" : "");
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + process.env.OTP_EXPIRE_MIN * 60 * 1000);

    await Otp.create({ email, otp: otpCode, expireAt, data: { name, password: hashedPassword } });

    await sendOtpEmail(email, otpCode);
    console.log("[Auth] OTP sent for signup, expires in", process.env.OTP_EXPIRE_MIN || 10, "min");
    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error("[Auth] Signup request-otp error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- STEP 2: Verify OTP ---------- */
router.post("/signup/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpDoc = await Otp.findOne({ email, otp });
    if (!otpDoc) {
      console.log("[Auth] Signup verify-otp: invalid OTP for", email ? "(email masked)" : "");
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    if (otpDoc.expireAt < new Date()) {
      await Otp.deleteMany({ email });
      console.log("[Auth] Signup verify-otp: OTP expired");
      return res.status(400).json({ msg: "OTP expired" });
    }

    const { name, password } = otpDoc.data;
    const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";

    const user = new User({ name, email, password, role });
    await user.save();

    await Otp.deleteMany({ email });
    console.log("[Auth] Signup successful, role=" + role);
    res.json({ msg: "Signup successful" });
  } catch (err) {
    console.error("[Auth] Signup verify-otp error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- LOGIN ---------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("[Auth] Login failed: user not found");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[Auth] Login failed: wrong password");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    console.log("[Auth] Login success: userId=" + user._id + ", role=" + user.role);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      redirect: user.role === "admin" ? "/admin/dashboard" : "/user/dashboard",
    });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- STEP 1: Forgot password - request OTP ---------- */
router.post("/forgot/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("[Auth] Forgot password OTP requested for email:", email ? "(masked)" : "(missing)");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[Auth] Forgot OTP: no account found");
      return res.status(400).json({ msg: "No account with this email" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + process.env.OTP_EXPIRE_MIN * 60 * 1000);

    await Otp.create({ email, otp: otpCode, expireAt, data: { reset: true } });
    await sendOtpEmail(email, otpCode);
    console.log("[Auth] Forgot OTP sent");
    res.json({ msg: "OTP sent to email for password reset" });
  } catch (err) {
    console.error("[Auth] Forgot request-otp error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- STEP 2: Forgot password - verify OTP + reset ---------- */
router.post("/forgot/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpDoc = await Otp.findOne({ email, otp });
    if (!otpDoc) return res.status(400).json({ msg: "Invalid OTP" });
    if (otpDoc.expireAt < Date.now()) return res.status(400).json({ msg: "OTP expired" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ email }, { password: hashed });

    await Otp.deleteMany({ email });
    console.log("[Auth] Password reset successful");
    res.json({ msg: "Password reset successful. Please login." });
  } catch (err) {
    console.error("[Auth] Forgot reset error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
