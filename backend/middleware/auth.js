
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    console.log("[Auth] Request rejected: no token", req.method, req.path);
    return res.status(401).json({ msg: "No token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (e) {
    console.log("[Auth] Request rejected: invalid or expired token", req.method, req.path);
    return res.status(401).json({ msg: "Invalid token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    console.log("[Auth] Admin route denied: user role=" + (req.user?.role || "none"), req.method, req.path);
    return res.status(403).json({ msg: "Admin only" });
  }
  next();
}
