import React from "react";
import { Link } from "react-router-dom";

const dashboardUrl = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";
export default function Footer() {
  return <footer style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #e3eaf1" }}>
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-12 col-md-4">
          <Link to="/"><img src="/media/images/tvlogo.png" alt="TradeVerse home" style={{ width: 140, marginBottom: 16 }} /></Link>
          <p className="text-muted">Explore the markets. Practise with confidence.</p>
          <p className="text-muted">© 2026 TradeVerse</p>
        </div>
        <div className="col-6 col-md-4"><h2 className="fs-6">Explore</h2>
          <ul className="list-unstyled lh-lg">
            <li><Link to="/">Home</Link></li><li><Link to="/about">About</Link></li>
            <li><Link to="/product">Products</Link></li><li><Link to="/pricing">Pricing</Link></li><li><Link to="/support">Support</Link></li>
          </ul>
        </div>
        <div className="col-6 col-md-4"><h2 className="fs-6">Your account</h2>
          <ul className="list-unstyled lh-lg">
            <li><Link to="/signup">Create an account</Link></li><li><Link to="/login">Log in</Link></li>
            <li><a href={dashboardUrl}>Trading dashboard</a></li><li><a href={dashboardUrl + "/holdings"}>Holdings</a></li><li><a href={dashboardUrl + "/funds"}>Virtual funds</a></li>
          </ul>
        </div>
      </div>
      <p className="text-muted small mb-0">TradeVerse is an educational paper-trading project, not a registered stock broker. Trades use virtual cash and fixed demo prices. No real payments or market orders are placed.</p>
    </div>
  </footer>;
}
