import React, { useContext } from "react";
import GeneralContext, { money } from "./GeneralContext";

export default function Funds() {
  const { account } = useContext(GeneralContext);
  return <section className="paper-page"><h2>Virtual funds</h2>
    <p className="paper-muted">This is practice money. No deposits, withdrawals, or real payments are involved.</p>
    <div className="paper-metrics">
      <article><span>Starting virtual cash</span><strong>{money(account.startingCashPaise)}</strong></article>
      <article><span>Available to buy</span><strong>{money(account.cashPaise)}</strong></article>
      <article><span>Cost of owned shares</span><strong>{money(account.investedPaise)}</strong></article>
      <article><span>Realized profit / loss</span><strong>{money(account.realizedPaise)}</strong></article>
      <article><span>Holdings market value</span><strong>{money(account.valuePaise)}</strong></article>
      <article><span>Total account value</span><strong>{money(account.equityPaise)}</strong></article>
    </div>
    <div className="paper-guide"><h3>How your balance changes</h3><p>Buying deducts quantity × demo price from available cash. Selling credits the proceeds back. You can only buy with available cash and sell shares you already own.</p><p>Your balance and holdings are saved to your account and remain after you log out.</p></div>
  </section>;
}
