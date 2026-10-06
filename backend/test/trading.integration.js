// Explicit opt-in: creates and removes only uniquely named test accounts and their records.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const mongoose = require("mongoose");
const express = require("express");
const { createAuthRouter } = require("../auth");
const { createTradingRouter } = require("../trading");
const { UserModel, SessionModel } = require("../model/UserModel");
const { PortfolioModel, TradeModel } = require("../model/PortfolioModel");

test("real MongoDB: authentication, isolation, idempotency, rollback and concurrent trades", { skip: process.env.RUN_TRADING_INTEGRATION !== "1" }, async () => {
  require("dotenv").config({ quiet: true });
  const emails = [0, 1].map(() => `trading-check-${randomUUID()}@example.invalid`);
  const origin = "http://localhost:3001";
  let server;
  try {
    await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 });
    await Promise.all([UserModel.init(), SessionModel.init(), PortfolioModel.init(), TradeModel.init()]);
    const app = express();
    app.use(express.json());
    const options = { UserModel, SessionModel, origins: [origin] };
    app.use("/auth", createAuthRouter(options));
    app.use("/auth/trading", createTradingRouter(options));
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}/auth`;
    const request = (path, body, cookie, from = origin) => fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", Origin: from, ...(cookie && { Cookie: cookie }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const cookies = [];
    for (const email of emails) {
      const credentials = { name: "Trading Test", email, password: `Test-${randomUUID()}` };
      assert.equal((await request("/signup", credentials)).status, 201);
      const login = await request("/login", credentials);
      assert.equal(login.status, 200);
      cookies.push(login.headers.get("set-cookie").split(";")[0]);
    }
    const [a, b] = cookies;
    const account = async (cookie) => { const response = await request("/trading/account", undefined, cookie); assert.equal(response.status, 200); return response.json(); };
    const trade = (cookie, side, qty, extra = {}) => request("/trading/orders", { symbol: "INFY", side, qty, requestId: randomUUID(), ...extra }, cookie);
    assert.equal((await request("/trading/account")).status, 401);
    assert.equal((await request("/trading/orders", {}, a, "https://untrusted.example")).status, 403);
    assert.equal((await account(a)).cashPaise, 10000000);
    assert.equal((await trade(a, "BUY", 2, { pricePaise: 1 })).status, 200);
    let state = await account(a);
    assert.equal(state.cashPaise, 9688910); // Client's fabricated price is ignored.
    assert.equal(state.holdings[0].qty, 2);
    assert.equal((await account(b)).holdings.length, 0);
    assert.equal((await account(b)).orderCount, 0);
    assert.equal((await trade(a, "SELL", 3)).status, 409);
    assert.equal((await trade(a, "BUY", -1)).status, 400);
    assert.equal((await trade(a, "SELL", 1)).status, 200);
    assert.equal((await account(a)).holdings[0].qty, 1);
    const sameId = randomUUID();
    const duplicate = await Promise.all([trade(a, "BUY", 1, { requestId: sameId }), trade(a, "BUY", 1, { requestId: sameId })]);
    assert.deepEqual(duplicate.map((response) => response.status), [200, 200]);
    state = await account(a);
    assert.equal(state.holdings[0].qty, 2);
    assert.equal(state.orderCount, 3);
    assert.equal((await trade(a, "BUY", 2, { requestId: sameId })).status, 409);
    const racingBuys = await Promise.all([trade(b, "BUY", 60), trade(b, "BUY", 60)]);
    assert.deepEqual(racingBuys.map((response) => response.status).sort(), [200, 409]);
    const racingSells = await Promise.all([trade(b, "SELL", 40), trade(b, "SELL", 40)]);
    assert.deepEqual(racingSells.map((response) => response.status).sort(), [200, 409]);
    assert.equal((await account(b)).holdings[0].qty, 20);
    const beforeFailure = await account(a);
    const originalCreate = TradeModel.create;
    try {
      TradeModel.create = async () => { throw new Error("Injected order-write failure"); };
      assert.equal((await trade(a, "BUY", 1)).status, 503);
    } finally { TradeModel.create = originalCreate; }
    const afterFailure = await account(a);
    assert.equal(afterFailure.cashPaise, beforeFailure.cashPaise);
    assert.equal(afterFailure.holdings[0].qty, beforeFailure.holdings[0].qty);
    assert.equal(afterFailure.orderCount, beforeFailure.orderCount);
    assert.equal((await trade(a, "SELL", 2)).status, 200);
    assert.equal((await account(a)).holdings.length, 0);
    assert.equal((await account(a)).cashPaise, 10000000);
    assert.equal((await request("/logout", {}, a)).status, 200);
    assert.equal((await request("/trading/account", undefined, a)).status, 401);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      const users = await UserModel.find({ email: { $in: emails } }).select("_id");
      const userIds = users.map((user) => user._id);
      await SessionModel.deleteMany({ userId: { $in: userIds } });
      await TradeModel.deleteMany({ userId: { $in: userIds } });
      await PortfolioModel.deleteMany({ userId: { $in: userIds } });
      await UserModel.deleteMany({ _id: { $in: userIds }, email: { $in: emails } });
      console.log("Removed integration test accounts, sessions, portfolios and trades.");
    }
    await mongoose.disconnect();
  }
});
