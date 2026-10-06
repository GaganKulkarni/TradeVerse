import React, { useContext } from "react";
import GeneralContext, { money } from "./GeneralContext";
import { VerticalGraph } from "./VerticalGraph";

export default function Holdings() {
  const { account, openTrade, tradingUnavailable } = useContext(GeneralContext);
  const data = { labels: account.holdings.map((item) => item.symbol), datasets: [{ label: "Holding value (₹)", data: account.holdings.map((item) => item.valuePaise / 100), backgroundColor: "#387ed1aa" }] };
  return <section className="paper-page">
    <h2>Holdings ({account.holdings.length})</h2>
    <p className="paper-muted">Shares you own. They stay here until you sell them.</p>
    {!account.holdings.length ? <div className="paper-empty"><h3>No holdings yet</h3><p>Buy a stock from the watchlist to start your portfolio.</p></div> : <>
      <div className="paper-table-wrap"><table className="paper-table"><thead><tr><th>Stock</th><th>Qty.</th><th>Average cost</th><th>Demo price</th><th>Current value</th><th>P&amp;L</th><th>Actions</th></tr></thead>
      <tbody>{account.holdings.map((holding) => <tr key={holding.symbol}><td>{holding.symbol}</td><td>{holding.qty}</td><td>{money(holding.avgPaise)}</td><td>{money(holding.pricePaise)}</td><td>{money(holding.valuePaise)}</td><td className={holding.pnlPaise < 0 ? "paper-loss" : "paper-profit"}>{money(holding.pnlPaise)}</td><td><button disabled={tradingUnavailable} onClick={() => openTrade(holding.symbol, "BUY")}>Buy more</button> <button disabled={tradingUnavailable} onClick={() => openTrade(holding.symbol, "SELL")}>Sell</button></td></tr>)}</tbody></table></div>
      <div className="paper-metrics"><article><span>Total investment</span><strong>{money(account.investedPaise)}</strong></article><article><span>Current value</span><strong>{money(account.valuePaise)}</strong></article><article><span>Unrealized P&amp;L</span><strong>{money(account.unrealizedPaise)}</strong></article></div>
      <VerticalGraph data={data} />
    </>}
  </section>;
}
