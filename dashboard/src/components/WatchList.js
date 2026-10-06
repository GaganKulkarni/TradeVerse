import React, { useContext, useState } from "react";
import GeneralContext, { money } from "./GeneralContext";

export default function WatchList() {
  const { account, openTrade, tradingUnavailable } = useContext(GeneralContext);
  const [search, setSearch] = useState("");
  const stocks = account.market.filter((stock) => stock.symbol.toLowerCase().includes(search.trim().toLowerCase()));
  return <aside className="watchlist-container paper-watchlist" aria-label="Stock watchlist">
    <div className="paper-search"><label htmlFor="stock-search">Watchlist · Demo prices</label><input id="stock-search" placeholder="Search stocks, e.g. INFY" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    <ul className="paper-stocks">
      {stocks.map((stock) => <li key={stock.symbol}>
        <div><strong>{stock.symbol}</strong><span>{money(stock.pricePaise)}</span></div>
        <div><small className={stock.change < 0 ? "paper-loss" : "paper-profit"}>{stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}% (demo)</small><small>Owned: {account.holdings.find((item) => item.symbol === stock.symbol)?.qty || 0}</small></div>
        <div className="paper-stock-actions"><button className="paper-buy" disabled={tradingUnavailable} onClick={() => openTrade(stock.symbol, "BUY")} aria-label={`Buy ${stock.symbol}`}>Buy</button><button className="paper-sell" disabled={tradingUnavailable} onClick={() => openTrade(stock.symbol, "SELL")} aria-label={`Sell ${stock.symbol}`}>Sell</button></div>
      </li>)}
    </ul>
    {!stocks.length && <p className="paper-empty">No stocks match your search.</p>}
  </aside>;
}
