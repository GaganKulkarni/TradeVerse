import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "./AccountSession";
import GeneralContext, { money } from "./GeneralContext";

export default function Summary() {
  const { user } = useAccount();
  const { account, refresh } = useContext(GeneralContext);
  return <section className="paper-page">
    <div className="paper-heading"><h2>Welcome back, {user.name}!</h2><button onClick={() => refresh().catch(() => {})}>Refresh</button></div>
    <p className="paper-muted">Your own practice portfolio. You start with {money(account.startingCashPaise)} in virtual cash.</p>
    <div className="paper-metrics">
      <article><span>Available cash</span><strong>{money(account.cashPaise)}</strong></article>
      <article><span>Holdings value</span><strong>{money(account.valuePaise)}</strong></article>
      <article><span>Total account value</span><strong>{money(account.equityPaise)}</strong></article>
      <article><span>Unrealized P&amp;L</span><strong className={account.unrealizedPaise < 0 ? "paper-loss" : "paper-profit"}>{money(account.unrealizedPaise)}</strong></article>
      <article><span>Realized P&amp;L</span><strong className={account.realizedPaise < 0 ? "paper-loss" : "paper-profit"}>{money(account.realizedPaise)}</strong></article>
      <article><span>Completed orders</span><strong>{account.orderCount}</strong></article>
    </div>
    <div className="paper-guide"><h3>Make your first practice trade</h3>
      <ol><li>Choose a stock from the watchlist and click <strong>Buy</strong>.</li><li>Enter a whole-number quantity and confirm the cost.</li><li>Open <Link to="/holdings">Holdings</Link> to see the shares you own. Keeping them is holding—there is no extra button.</li><li>Click <strong>Sell</strong> to sell some or all of your shares. The proceeds return to your virtual balance.</li></ol>
      <p>Quotes are fixed demo prices, so buying and selling at the same price produces zero profit or loss. Check every completed trade in <Link to="/orders">Orders</Link>.</p>
    </div>
  </section>;
}
