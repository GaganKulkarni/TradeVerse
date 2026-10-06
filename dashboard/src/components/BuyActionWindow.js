import React, { useContext, useEffect, useRef, useState } from "react";
import GeneralContext, { money } from "./GeneralContext";
import "./BuyActionWindow.css";

export default function BuyActionWindow({ ticket, onClose }) {
  const { account, submitTrade, tradingUnavailable } = useContext(GeneralContext);
  const [qty, setQty] = useState("1");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const requestId = useRef(ticket.requestId);
  const submitting = useRef(false);
  const dialog = useRef(null);
  const stock = account.market.find((item) => item.symbol === ticket.symbol);
  const owned = account.holdings.find((item) => item.symbol === ticket.symbol)?.qty || 0;
  const quantity = Number(qty);
  const validQty = Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 1000000;
  const total = validQty ? stock.pricePaise * quantity : 0;
  const insufficient = ticket.side === "BUY" ? total > account.cashPaise : quantity > owned;

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    return () => { element.close(); previousFocus?.focus(); };
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (submitting.current || !validQty || insufficient || tradingUnavailable) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await submitTrade({ ...ticket, qty: quantity, requestId: requestId.current });
    } catch (failure) {
      const unknown = !failure.response || failure.response.status >= 500;
      setUncertain(unknown);
      setError(unknown
        ? "We couldn't confirm the result. Retry this order to check it safely—your retry won't place a duplicate trade."
        : failure.response.data?.message || "This order could not be placed.");
    } finally { submitting.current = false; setPending(false); }
  }
  return <dialog ref={dialog} className="trade-dialog" aria-labelledby="trade-title" onCancel={(event) => { event.preventDefault(); if (!pending && !uncertain) onClose(); }}>
    <form onSubmit={submit}>
      <header><span className="trade-kicker">PAPER ORDER · DELIVERY</span><h2 id="trade-title">{ticket.side === "BUY" ? "Buy" : "Sell"} {ticket.symbol}</h2></header>
      <p>Demo market price <strong>{money(stock.pricePaise)}</strong> per share</p>
      <p>{ticket.side === "BUY" ? `Available cash: ${money(account.cashPaise)}` : `Shares you own: ${owned}`}</p>
      <label htmlFor="trade-qty">Quantity</label>
      <input id="trade-qty" type="number" min="1" max="1000000" step="1" required autoFocus value={qty} disabled={pending || uncertain} onChange={(event) => { setQty(event.target.value); setError(""); requestId.current = crypto.randomUUID(); }} />
      <div className="trade-total"><span>{ticket.side === "BUY" ? "Total cost" : "Sale proceeds"}</span><strong>{money(total)}</strong></div>
      <p className="trade-explanation">Executes immediately at the displayed demo price. No fees. Bought shares stay in Holdings until you sell them.</p>
      {insufficient && validQty && <p className="trade-error" role="alert">{ticket.side === "BUY" ? "Not enough virtual cash. Reduce the quantity." : "You don't own enough shares to sell this quantity."}</p>}
      {error && <p className="trade-error" role="alert">{error}</p>}
      <footer><button type="button" disabled={pending || uncertain} onClick={onClose}>Cancel</button>
        <button className={ticket.side === "BUY" ? "trade-buy" : "trade-sell"} type="submit" disabled={pending || !validQty || insufficient || tradingUnavailable}>{pending ? "Processing…" : uncertain ? "Retry same order" : `Confirm ${ticket.side === "BUY" ? "buy" : "sell"}`}</button>
      </footer>
    </form>
  </dialog>;
}
