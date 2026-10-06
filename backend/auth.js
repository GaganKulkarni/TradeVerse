const { Router } = require("express");
const { randomBytes, scrypt, timingSafeEqual, createHash } = require("node:crypto");
const { promisify } = require("node:util");

const deriveKey = promisify(scrypt);
const cookieName = "tradeverse_session";
const sessionDuration = 24 * 60 * 60 * 1000;
const scryptOptions = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const digest = (value) => createHash("sha256").update(value).digest("hex");
const publicUser = (user) => ({ id: String(user._id), name: user.name, email: user.email });

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt, 64, scryptOptions);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, encoded) {
  const [salt, hex] = encoded.split(":");
  const key = await deriveKey(password, salt, 64, scryptOptions);
  const expected = Buffer.from(hex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

function readToken(req) {
  const match = (req.headers.cookie || "").match(/(?:^|;\s*)tradeverse_session=([a-f0-9]{64})(?:;|$)/);
  return match ? match[1] : null;
}

function createAuthRouter({ UserModel, SessionModel, origins, production = false }) {
  const router = Router();
  const cookieOptions = { httpOnly: true, secure: production, sameSite: "lax", path: "/auth" };
  const attempts = new Map();
  // Perform the same password work for an unknown email to reduce account probing.
  const dummyHash = hashPassword(randomBytes(32).toString("hex"));

  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (req.method === "POST" && !origins.includes(req.headers.origin)) {
      return res.status(403).json({ message: "Request origin is not allowed." });
    }
    next();
  });

  function limitAttempts(req, res, next) {
    const now = Date.now();
    for (const [ip, entry] of attempts) if (entry.until <= now) attempts.delete(ip);
    const entry = attempts.get(req.ip) || { count: 0, until: now + 15 * 60 * 1000 };
    if (entry.count >= 20 || (!attempts.has(req.ip) && attempts.size >= 10000)) {
      res.set("Retry-After", "900");
      return res.status(429).json({ message: "Too many attempts. Please try again in 15 minutes." });
    }
    entry.count += 1;
    attempts.set(req.ip, entry);
    next();
  }

  router.post("/signup", limitAttempts, async (req, res) => {
    const { name, email, password } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ message: "Enter a name between 2 and 80 characters." });
    }
    if (typeof email !== "string" || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Use a password between 8 and 128 characters." });
    }
    try {
      const user = await UserModel.create({
        name: name.trim(), email: email.trim().toLowerCase(), passwordHash: await hashPassword(password),
      });
      res.status(201).json({ message: "Account created. You can now log in.", user: publicUser(user) });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists. Please log in." });
      res.status(503).json({ message: "We couldn't create your account. Please try again." });
    }
  });

  router.post("/login", limitAttempts, async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || !password.length || password.length > 128) {
      return res.status(400).json({ message: "Enter your email and password." });
    }
    try {
      const user = await UserModel.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
      const valid = await verifyPassword(password, user ? user.passwordHash : await dummyHash);
      if (!user || !valid) return res.status(401).json({ message: "Incorrect email or password." });
      const oldToken = readToken(req);
      if (oldToken) await SessionModel.deleteOne({ tokenHash: digest(oldToken) });
      const token = randomBytes(32).toString("hex");
      await SessionModel.create({ tokenHash: digest(token), userId: user._id, expiresAt: new Date(Date.now() + sessionDuration) });
      res.cookie(cookieName, token, { ...cookieOptions, maxAge: sessionDuration });
      res.json({ user: publicUser(user) });
    } catch {
      res.status(503).json({ message: "Login is temporarily unavailable. Please try again." });
    }
  });

  router.get("/me", async (req, res) => {
    const token = readToken(req);
    if (!token) return res.status(401).json({ message: "Please log in." });
    try {
      const session = await SessionModel.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } });
      const user = session && await UserModel.findById(session.userId);
      if (!user) {
        res.clearCookie(cookieName, cookieOptions);
        return res.status(401).json({ message: "Your session has expired. Please log in again." });
      }
      res.json({ user: publicUser(user) });
    } catch {
      res.status(503).json({ message: "We couldn't check your session. Please try again." });
    }
  });

  router.post("/logout", async (req, res) => {
    try {
      const token = readToken(req);
      if (token) await SessionModel.deleteOne({ tokenHash: digest(token) });
      res.clearCookie(cookieName, cookieOptions);
      res.json({ message: "Logged out." });
    } catch {
      res.status(503).json({ message: "Couldn't log out. Please try again." });
    }
  });
  return router;
}

function requireAccount({ UserModel, SessionModel }) {
  return async (req, res, next) => {
    res.set("Cache-Control", "no-store");
    const token = readToken(req);
    if (!token) return res.status(401).json({ message: "Please log in." });
    try {
      const session = await SessionModel.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } });
      const user = session && await UserModel.findById(session.userId);
      if (!user) return res.status(401).json({ message: "Your session has expired. Please log in again." });
      req.accountId = user._id;
      next();
    } catch {
      res.status(503).json({ message: "Unable to check your session. Please try again." });
    }
  };
}

module.exports = { createAuthRouter, hashPassword, verifyPassword, requireAccount };
