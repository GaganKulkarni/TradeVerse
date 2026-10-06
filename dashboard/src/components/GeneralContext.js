import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import BuyActionWindow from "./BuyActionWindow";

const api = axios.create({ baseURL: `${process.env.REACT_APP_API_URL || "http://localhost:3002"}/auth/trading`, withCredentials: true, timeout: 20000 });
const GeneralContext = React.createContext(null);
export const money = (paise = 0) => (paise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

export function GeneralContextProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);
  const [notice, setNotice] = useState("");
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++sequence.current;
    try {
      const { data } = await api.get("/account");
      if (current === sequence.current) { setAccount(data); setError(""); }
    } catch (failure) {
      if (failure.response?.status === 401) window.location.replace(`${process.env.REACT_APP_WEBSITE_URL || "http://localhost:3003"}/login`);
      if (current === sequence.current) setError("Couldn't refresh your portfolio. Please try again before placing another trade.");
      throw failure;
    }
  }, []);
  useEffect(() => { refresh().catch(() => {}); }, [refresh]);

  const openTrade = (symbol, side = "BUY") => {
    setNotice("");
    setTicket({ symbol, side, requestId: crypto.randomUUID() });
  };
  async function submitTrade(order) {
    try {
      const { data } = await api.post("/orders", order);
      setNotice(`${data.order.side === "BUY" ? "Bought" : "Sold"} ${data.order.qty} ${data.order.symbol} for ${money(data.order.totalPaise)}.`);
      setTicket(null);
      // A refresh failure cannot undo the already committed trade.
      await refresh().catch(() => {});
      return data.order;
    } catch (failure) {
      if (failure.response?.status === 401) window.location.replace(`${process.env.REACT_APP_WEBSITE_URL || "http://localhost:3003"}/login`);
      throw failure;
    }
  }
  if (!account) return <section className="paper-loading">
    <h2>Your paper-trading account</h2>
    <p role={error ? "alert" : "status"}>{error || "Loading your portfolio…"}</p>
    {error && <button onClick={() => refresh().catch(() => {})}>Try again</button>}
  </section>;
  return <GeneralContext.Provider value={{ account, openTrade, refresh, submitTrade, tradingUnavailable: !!error }}>
    <div className="paper-banner">PAPER TRADING · Virtual money · Fixed demo prices · Delivery trades only</div>
    {notice && <div className="paper-notice" role="status">{notice} <button onClick={() => setNotice("")} aria-label="Dismiss trade confirmation">×</button></div>}
    {error && <div className="paper-error" role="alert">{error} <button onClick={() => refresh().catch(() => {})}>Refresh portfolio</button></div>}
    {children}
    {ticket && <BuyActionWindow key={ticket.requestId} ticket={ticket} onClose={() => setTicket(null)} />}
  </GeneralContext.Provider>;
}
export default GeneralContext;
