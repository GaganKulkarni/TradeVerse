import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const dashboardUrl = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";
const pages = [["/", "Home"], ["/about", "About"], ["/product", "Products"], ["/pricing", "Pricing"], ["/support", "Support"]];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <nav className="site-nav" aria-label="Main navigation">
    <Link className="site-brand" to="/" onClick={() => setOpen(false)}><img src="/media/images/tvlogo.png" alt="TradeVerse home" /></Link>
    <button className="site-menu-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="site-links">Menu</button>
    <div id="site-links" className={open ? "site-links is-open" : "site-links"}>
      {pages.map(([path, label]) => <NavLink key={path} to={path} end={path === "/"} onClick={() => setOpen(false)}>{label}</NavLink>)}
      <NavLink to="/login" onClick={() => setOpen(false)}>Log in</NavLink>
      <NavLink to="/signup" onClick={() => setOpen(false)}>Sign up</NavLink>
      <a className="site-dashboard-link" href={dashboardUrl}>Trading dashboard ↗</a>
    </div>
  </nav>;
}
