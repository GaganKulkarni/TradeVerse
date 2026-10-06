const { Router } = require("express");
const mongoose = require("mongoose");
const { market, quoteFor } = require("./market");
const { PortfolioModel, TradeModel, STARTING_CASH } = require("./model/PortfolioModel");
const { requireAccount } = require("./auth");

function reject(message, status = 400) { throw Object.assign(new Error(message), { status }); }

function validateOrder(body) {
  const { symbol, side, qty, requestId } = body || {};
  if (typeof symbol !== "string" || !quoteFor(symbol)) reject("Choose a stock from the watchlist.");
  if (side !== "BUY" && side !== "SELL") reject("Choose Buy or Sell.");
  if (!Number.isSafeInteger(qty) || qty < 1 || qty > 1000000) reject("Quantity must be a whole number between 1 and 10,00,000.");
  if (typeof requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) reject("Invalid order reference. Reopen the order form.");
  return { symbol, side, qty, requestId };
}

// Pure calculation shared by the transaction and tests. Never trusts a client price.
function applyTrade(portfolio, order, pricePaise = quoteFor(order.symbol).pricePaise) {
  const holdings = portfolio.holdings.map(({ symbol, qty, costPaise }) => ({ symbol, qty, costPaise }));
  const holding = holdings.find((item) => item.symbol === order.symbol);
  const totalPaise = pricePaise * order.qty;
  let cashPaise = portfolio.cashPaise;
  let realizedPaise = 0;
  if (order.side === "BUY") {
    if (cashPaise < totalPaise) reject("Not enough virtual cash for this order.", 409);
    cashPaise -= totalPaise;
    if (holding) { holding.qty += order.qty; holding.costPaise += totalPaise; }
    else holdings.push({ symbol: order.symbol, qty: order.qty, costPaise: totalPaise });
  } else {
    if (!holding || holding.qty < order.qty) reject("You cannot sell more shares than you own.", 409);
    const soldCost = Math.round(holding.costPaise * order.qty / holding.qty);
    realizedPaise = totalPaise - soldCost;
    holding.qty -= order.qty;
    holding.costPaise -= soldCost;
    cashPaise += totalPaise;
  }
  return {
    cashPaise, holdings: holdings.filter((item) => item.qty > 0),
    realizedPaise: portfolio.realizedPaise + realizedPaise,
    execution: { pricePaise, totalPaise, realizedPaise },
  };
}

async function ensurePortfolio(userId) {
  try {
    const existing = await PortfolioModel.findOne({ userId });
    if (existing) return existing;
    return await PortfolioModel.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
  } catch (error) {
    if (error.code === 11000) return PortfolioModel.findOne({ userId });
    throw error;
  }
}

function publicOrder(order) {
  return { id: String(order._id), symbol: order.symbol, side: order.side, qty: order.qty,
    pricePaise: order.pricePaise, totalPaise: order.totalPaise, realizedPaise: order.realizedPaise,
    status: order.status, createdAt: order.createdAt };
}

async function executeOrder(userId, body) {
  const order = validateOrder(body);
  await ensurePortfolio(userId);
  let result;
  function reuse(existing) {
    if (existing.symbol !== order.symbol || existing.side !== order.side || existing.qty !== order.qty) reject("This order reference was already used for a different trade.", 409);
    return existing;
  }
  try {
    await mongoose.connection.transaction(async (session) => {
      const existing = await TradeModel.findOne({ userId, requestId: order.requestId }).session(session);
      if (existing) { result = reuse(existing); return; }
      const portfolio = await PortfolioModel.findOne({ userId }).session(session);
      const next = applyTrade(portfolio, order);
      portfolio.cashPaise = next.cashPaise;
      portfolio.holdings = next.holdings;
      portfolio.realizedPaise = next.realizedPaise;
      await portfolio.save({ session });
      const [trade] = await TradeModel.create([{ ...order, ...next.execution, userId }], { session });
      result = trade;
    });
  } catch (error) {
    // A concurrent retry may have committed this request first.
    if (error.code !== 11000) throw error;
    const existing = await TradeModel.findOne({ userId, requestId: order.requestId });
    if (!existing) throw error;
    result = reuse(existing);
  }
  return publicOrder(result);
}

async function accountState(userId) {
  const portfolio = await ensurePortfolio(userId);
  const [orders, orderCount] = await Promise.all([
    TradeModel.find({ userId }).sort({ createdAt: -1, _id: -1 }).limit(100).lean(),
    TradeModel.countDocuments({ userId }),
  ]);
  const holdings = portfolio.holdings.map((holding) => {
    const pricePaise = quoteFor(holding.symbol).pricePaise;
    const valuePaise = pricePaise * holding.qty;
    return { symbol: holding.symbol, qty: holding.qty, costPaise: holding.costPaise,
      avgPaise: holding.costPaise / holding.qty, pricePaise, valuePaise, pnlPaise: valuePaise - holding.costPaise };
  });
  const investedPaise = holdings.reduce((sum, holding) => sum + holding.costPaise, 0);
  const valuePaise = holdings.reduce((sum, holding) => sum + holding.valuePaise, 0);
  return { market, holdings, orders: orders.map(publicOrder), orderCount,
    cashPaise: portfolio.cashPaise, startingCashPaise: STARTING_CASH,
    investedPaise, valuePaise, unrealizedPaise: valuePaise - investedPaise,
    realizedPaise: portfolio.realizedPaise, equityPaise: portfolio.cashPaise + valuePaise };
}

function createTradingRouter({ UserModel, SessionModel, origins }) {
  const router = Router();
  router.use(requireAccount({ UserModel, SessionModel }));
  router.use((req, res, next) => {
    if (req.method !== "GET" && !origins.includes(req.headers.origin)) return res.status(403).json({ message: "Request origin is not allowed." });
    next();
  });
  router.get("/account", async (req, res, next) => {
    try { res.json(await accountState(req.accountId)); } catch (error) { next(error); }
  });
  router.post("/orders", async (req, res, next) => {
    try { res.json({ order: await executeOrder(req.accountId, req.body) }); } catch (error) { next(error); }
  });
  router.use((error, req, res, next) => {
    res.status(error.status || 503).json({ message: error.status ? error.message : "Trading is temporarily unavailable. Retry using the same order form." });
  });
  return router;
}
module.exports = { createTradingRouter, applyTrade, validateOrder, executeOrder, accountState };
