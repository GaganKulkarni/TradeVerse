const { test } = require("node:test");
const assert = require("node:assert/strict");
const { applyTrade, validateOrder } = require("../trading");
const empty = () => ({ cashPaise: 10000000, holdings: [], realizedPaise: 0 });
const order = (side, qty) => ({ symbol: "INFY", side, qty, requestId: "unit-test-reference-1234" });

test("buy, partial sell, full sell preserve cash and holdings", () => {
  const bought = applyTrade(empty(), order("BUY", 2));
  assert.equal(bought.cashPaise, 9688910);
  assert.deepEqual(bought.holdings, [{ symbol: "INFY", qty: 2, costPaise: 311090 }]);
  const sold = applyTrade(bought, order("SELL", 1));
  assert.equal(sold.cashPaise, 9844455);
  assert.equal(sold.holdings[0].qty, 1);
  const closed = applyTrade(sold, order("SELL", 1));
  assert.equal(closed.cashPaise, 10000000);
  assert.equal(closed.holdings.length, 0);
});

test("weighted cost and realized gains preserve every paise", () => {
  const first = applyTrade(empty(), order("BUY", 2), 10001);
  const second = applyTrade(first, order("BUY", 1), 10000);
  assert.equal(second.holdings[0].costPaise, 30002);
  const partial = applyTrade(second, order("SELL", 1), 11000);
  const closed = applyTrade(partial, order("SELL", 2), 11000);
  assert.equal(closed.realizedPaise, 2998);
  assert.equal(closed.cashPaise, 10002998);
  assert.equal(closed.holdings.length, 0);
});

test("reject invalid input, insufficient funds and unowned shares", () => {
  for (const qty of [0, -1, 1.5, "2", NaN, Infinity, 1000001]) assert.throws(() => validateOrder(order("BUY", qty)));
  assert.throws(() => validateOrder({ ...order("BUY", 1), symbol: "FAKE" }));
  assert.throws(() => validateOrder({ ...order("BUY", 1), side: "OTHER" }));
  assert.throws(() => validateOrder({ ...order("BUY", 1), requestId: "short" }));
  assert.throws(() => applyTrade(empty(), order("BUY", 1000)), /Not enough/);
  assert.throws(() => applyTrade(empty(), order("SELL", 1)), /more shares/);
});
