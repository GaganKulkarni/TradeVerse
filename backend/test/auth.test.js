const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { createAuthRouter, verifyPassword } = require("../auth");

test("signup, login, session expiry and logout with validation and persistence failures", async () => {
  const users = [];
  const sessions = [];
  let failCreate = false;
  const UserModel = {
    async create(data) {
      if (failCreate) throw new Error("Database unavailable");
      if (users.some((user) => user.email === data.email)) throw Object.assign(new Error("Duplicate"), { code: 11000 });
      const user = { ...data, _id: String(users.length + 1) };
      users.push(user);
      return user;
    },
    findOne(query) { return { select: async () => users.find((user) => user.email === query.email) }; },
    async findById(id) { return users.find((user) => user._id === id); },
  };
  const SessionModel = {
    async create(session) { sessions.push(session); },
    async findOne(query) { return sessions.find((session) => session.tokenHash === query.tokenHash && session.expiresAt > query.expiresAt.$gt); },
    async deleteOne(query) { const i = sessions.findIndex((session) => session.tokenHash === query.tokenHash); if (i >= 0) sessions.splice(i, 1); },
  };
  const app = express();
  app.use(express.json());
  app.use("/auth", createAuthRouter({ UserModel, SessionModel, origins: ["http://localhost:3000"] }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}/auth`;
  async function request(path, body, cookie, origin = "http://localhost:3000") {
    return fetch(url + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", Origin: origin, ...(cookie && { Cookie: cookie }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  const account = { name: "Test Trader", email: "TRADER@example.com", password: "a-long-demo-passphrase" };
  try {
    assert.equal((await request("/me")).status, 401);
    assert.equal((await request("/signup", account, null, "https://untrusted.example")).status, 403);
    for (const invalid of [{}, { ...account, password: "short" }, { ...account, email: "invalid" }, { ...account, name: " " }]) {
      assert.equal((await request("/signup", invalid)).status, 400);
    }
    const created = await request("/signup", account);
    assert.equal(created.status, 201);
    const data = await created.json();
    assert.equal(data.user.email, "trader@example.com");
    assert.equal(data.user.passwordHash, undefined);
    assert.notEqual(users[0].passwordHash, account.password);
    assert.equal(await verifyPassword(account.password, users[0].passwordHash), true);
    assert.equal((await request("/signup", { ...account, email: "trader@example.com" })).status, 409);
    assert.equal((await request("/login", { ...account, password: "wrong-password" })).status, 401);
    assert.equal((await request("/login", { ...account, email: "missing@example.com" })).status, 401);
    const loggedIn = await request("/login", account);
    assert.equal(loggedIn.status, 200);
    const cookieHeader = loggedIn.headers.get("set-cookie");
    assert.match(cookieHeader, /HttpOnly/);
    assert.match(cookieHeader, /SameSite=Lax/);
    const cookie = cookieHeader.split(";")[0];
    assert.notEqual(sessions[0].tokenHash, cookie.split("=")[1]);
    assert.equal((await request("/me", undefined, cookie)).status, 200);
    sessions[0].expiresAt = new Date(0);
    assert.equal((await request("/me", undefined, cookie)).status, 401);
    const relogin = await request("/login", account, cookie);
    const newCookie = relogin.headers.get("set-cookie").split(";")[0];
    assert.equal((await request("/logout", {}, newCookie)).status, 200);
    assert.equal((await request("/me", undefined, newCookie)).status, 401);
    failCreate = true;
    assert.equal((await request("/signup", { ...account, email: "another@example.com" })).status, 503);
    let throttled;
    for (let i = 0; i < 21; i++) throttled = await request("/login", {});
    assert.equal(throttled.status, 429);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
