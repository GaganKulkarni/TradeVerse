const { Schema, model } = require("mongoose");
const STARTING_CASH = 10000000;
const holdingSchema = new Schema({
  symbol: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  costPaise: { type: Number, required: true, min: 0 },
}, { _id: false });
const portfolioSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  cashPaise: { type: Number, default: STARTING_CASH, min: 0 },
  realizedPaise: { type: Number, default: 0 },
  holdings: { type: [holdingSchema], default: [] },
}, { timestamps: true });
const tradeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  requestId: { type: String, required: true },
  symbol: { type: String, required: true },
  side: { type: String, enum: ["BUY", "SELL"], required: true },
  qty: { type: Number, required: true, min: 1 },
  pricePaise: { type: Number, required: true },
  totalPaise: { type: Number, required: true },
  realizedPaise: { type: Number, default: 0 },
  status: { type: String, default: "COMPLETED" },
}, { timestamps: true });
tradeSchema.index({ userId: 1, requestId: 1 }, { unique: true });
tradeSchema.index({ userId: 1, createdAt: -1 });
module.exports = {
  STARTING_CASH,
  PortfolioModel: model("PaperPortfolio", portfolioSchema),
  TradeModel: model("PaperTrade", tradeSchema),
};
