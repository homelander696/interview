import { useState } from "react";
import { api, setToken } from "../api";
import { Eye, EyeOff, Briefcase, Target, Users } from "lucide-react";
import { authStore } from "../auth";
import Spinner from "../components/Spinner.jsx";

const authInputCls =
  "w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-white placeholder-white/50 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 focus-visible:outline-none";

export default function AuthPage({ defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab); // "login" | "signup" | "forgot"
  const [signupStep, setSignupStep] = useState("form");
  const [forgotStep, setForgotStep] = useState("form");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await api("/api/auth/login", {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      setToken(res.token);
      authStore.setUser(res.user);
      window.location.href = res.redirect;
    } catch (err) {
      setMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGNUP STEP 1 (Request OTP) ---------------- */
  const handleSignupRequestOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await api("/api/auth/signup/request-otp", {
        method: "POST",
        auth: false,
        body: { name, email, password },
      });
      setSignupStep("otp");
      setMsg("✅ OTP sent to your email");
    } catch (err) {
      setMsg(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGNUP STEP 2 (Verify OTP) ---------------- */
  const handleSignupVerifyOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await api("/api/auth/signup/verify-otp", {
        method: "POST",
        auth: false,
        body: { email, otp },
      });
      setMsg("🎉 Signup successful! Please login.");
      setTab("login");
      setSignupStep("form");
    } catch (err) {
      setMsg(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FORGOT STEP 1 (Request OTP) ---------------- */
  const handleForgotRequestOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await api("/api/auth/forgot/request-otp", {
        method: "POST",
        auth: false,
        body: { email },
      });
      setForgotStep("otp");
      setMsg("✅ OTP sent to your email");
    } catch (err) {
      setMsg(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FORGOT STEP 2 (Reset Password) ---------------- */
  const handleForgotReset = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await api("/api/auth/forgot/reset", {
        method: "POST",
        auth: false,
        body: { email, otp, newPassword },
      });
      setMsg("🎉 Password reset successful! Please login.");
      setTab("login");
      setForgotStep("form");
    } catch (err) {
      setMsg(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-800 px-3 sm:px-4">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Left Auth Card */}
        <div className="p-6 sm:p-10 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {tab === "login" && "Welcome back 👋"}
            {tab === "signup" && "Create your account 🚀"}
            {tab === "forgot" && "Reset your password 🔑"}
          </h1>
          <p className="text-gray-200 mb-4 sm:mb-6 text-sm sm:text-base">
            {tab === "login" && "Please login with your details to continue"}
            {tab === "signup" && "Sign up with your email and get started"}
            {tab === "forgot" && "Enter your email to reset your password"}
          </p>

          {/* Tabs: segmented control */}
          <div className="inline-flex bg-white/10 p-1 rounded-2xl mb-6">
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === "login" ? "bg-white text-indigo-700 shadow" : "text-white/90 hover:text-white"
              }`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === "signup" ? "bg-white text-indigo-700 shadow" : "text-white/90 hover:text-white"
              }`}
              onClick={() => setTab("signup")}
            >
              Signup
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === "forgot" ? "bg-white text-indigo-700 shadow" : "text-white/90 hover:text-white"
              }`}
              onClick={() => setTab("forgot")}
            >
              Forgot
            </button>
          </div>

          {/* LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={authInputCls}
              />
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${authInputCls} pr-10`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex justify-between items-center text-xs sm:text-sm text-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/40 bg-white/10 text-indigo-600 focus:ring-white/30"
                  />
                  Keep me logged in
                </label>
                <button
                  type="button"
                  onClick={() => setTab("forgot")}
                  className="hover:underline text-white/90"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={22} className="text-white" /> : "Sign in"}
              </button>
            </form>
          )}

          {/* SIGNUP */}
          {tab === "signup" && signupStep === "form" && (
            <form onSubmit={handleSignupRequestOtp} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={authInputCls}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={authInputCls}
              />
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${authInputCls} pr-10`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  aria-label={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={22} className="text-white" /> : "Request OTP"}
              </button>
            </form>
          )}

          {tab === "signup" && signupStep === "otp" && (
            <form onSubmit={handleSignupVerifyOtp} className="space-y-4">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className={authInputCls}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={22} className="text-white" /> : "Verify & Signup"}
              </button>
            </form>
          )}

          {/* FORGOT */}
          {tab === "forgot" && forgotStep === "form" && (
            <form onSubmit={handleForgotRequestOtp} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={authInputCls}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={22} className="text-white" /> : "Request OTP"}
              </button>
            </form>
          )}

          {tab === "forgot" && forgotStep === "otp" && (
            <form onSubmit={handleForgotReset} className="space-y-4">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className={authInputCls}
              />
              <div className="relative">
                <input
                  type={showForgotPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={`${authInputCls} pr-10`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowForgotPassword(!showForgotPassword)}
                  aria-label={showForgotPassword ? "Hide password" : "Show password"}
                >
                  {showForgotPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={22} className="text-white" /> : "Reset Password"}
              </button>
            </form>
          )}

          {msg && <p className="text-center text-sm text-yellow-200">{msg}</p>}
        </div>

        {/* Right Side Info */}
        <div className="hidden md:flex flex-col justify-center bg-black/30 text-white p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-4">About Placement App</h2>
          <p className="text-gray-200 mb-6 leading-relaxed">
            This platform helps students track{" "}
            <span className="font-semibold">
              placements, interviews, and company rounds
            </span>
            . Organize your progress, compare with peers, and prepare smarter.
            Trusted by students from top institutes.
          </p>
          <div className="flex flex-wrap gap-3 text-white/90">
            <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-sm">
              <Briefcase className="h-4 w-4 shrink-0" /> Track companies
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-sm">
              <Target className="h-4 w-4 shrink-0" /> Prepare smart
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-sm">
              <Users className="h-4 w-4 shrink-0" /> Get placed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
