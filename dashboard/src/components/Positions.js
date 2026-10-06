import React from "react";
import { Link } from "react-router-dom";

export default function Positions() {
  return <section className="paper-page"><h2>Positions</h2><div className="paper-empty"><h3>Delivery trading only</h3><p>This version supports buying and holding shares. Intraday positions, short selling, and leverage are not enabled.</p><Link to="/holdings">View your owned shares in Holdings →</Link></div></section>;
}
