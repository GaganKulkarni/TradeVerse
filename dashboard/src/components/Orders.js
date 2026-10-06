import React, { useContext } from "react";
import GeneralContext, { money } from "./GeneralContext";

export default function Orders() {
  const { account } = useContext(GeneralContext);
  return <section className="paper-page"><h2>Orders ({account.orderCount})</h2>
    <p className="paper-muted">Completed paper trades, newest first. {account.orderCount > 100 ? "Showing the most recent 100 orders." : "Orders execute immediately at the demo price."}</p>
    {!account.orders.length ? <div className="paper-empty"><h3>No orders yet</h3><p>Use Buy in the watchlist to place your first paper order.</p></div> :
    <div className="paper-table-wrap"><table className="paper-table"><thead><tr><th>Date &amp; time (IST)</th><th>Stock</th><th>Type</th><th>Qty.</th><th>Price</th><th>Total</th><th>Status</th></tr></thead><tbody>
    {account.orders.map((order) => <tr key={order.id}><td>{new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td><td>{order.symbol}</td><td><span className={order.side === "BUY" ? "paper-buy-label" : "paper-sell-label"}>{order.side}</span></td><td>{order.qty}</td><td>{money(order.pricePaise)}</td><td>{money(order.totalPaise)}</td><td>Completed</td></tr>)}
    </tbody></table></div>}
  </section>;
}
