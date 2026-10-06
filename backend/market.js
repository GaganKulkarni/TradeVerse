// Fixed educational quotes, not live exchange data. All money is stored in paise.
const market = [
  { symbol: "INFY", pricePaise: 155545, change: -1.60 },
  { symbol: "ONGC", pricePaise: 11680, change: -0.09 },
  { symbol: "TCS", pricePaise: 319480, change: -0.25 },
  { symbol: "KPITTECH", pricePaise: 26645, change: 3.54 },
  { symbol: "QUICKHEAL", pricePaise: 30855, change: -0.15 },
  { symbol: "WIPRO", pricePaise: 57775, change: 0.32 },
  { symbol: "M&M", pricePaise: 77980, change: -0.01 },
  { symbol: "RELIANCE", pricePaise: 211240, change: 1.44 },
  { symbol: "HUL", pricePaise: 51240, change: 1.04 },
];
module.exports = { market, quoteFor: (symbol) => market.find((stock) => stock.symbol === symbol) };
