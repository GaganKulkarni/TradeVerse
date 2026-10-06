import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAccount } from "./AccountSession";

const links = [["/", "Dashboard"], ["/orders", "Orders"], ["/holdings", "Holdings"], ["/funds", "Funds"]];
const websiteUrl = process.env.REACT_APP_WEBSITE_URL || "http://localhost:3003";

export default function Menu() {
  const { user, logout } = useAccount();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function handleLogout() {
    setPending(true);
    setError("");
    try { await logout(); }
    catch { setError("Couldn't log out. Please try again."); setPending(false); }
  }
  return <div className="menu-container">
    <div className="dashboard-website-links">
      <a href={websiteUrl} aria-label="TradeVerse home"><img src="/flylogo.png" alt="" width="48" /></a>
      <a href={websiteUrl}>Home</a>
      <a href={`${websiteUrl}/about`}>About</a>
    </div>
    <div className="menus">
      <ul>{links.map(([path, label]) => <li key={path}>
        <NavLink to={path} end={path === "/"} style={{ textDecoration: "none" }}>{({ isActive }) => <p className={isActive ? "menu selected" : "menu"}>{label}</p>}</NavLink>
      </li>)}</ul>
      <hr />
      <div style={{ position: "relative" }}>
        <button className="profile" onClick={() => setOpen((value) => !value)} aria-expanded={open} style={{ border: 0, background: "transparent", cursor: "pointer" }}>
          <span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>
          <span className="username">{user.name}</span>
        </button>
        {open && <div style={{ position: "absolute", right: 0, top: 40, zIndex: 110, minWidth: 220, background: "white", padding: 16, boxShadow: "0 4px 20px #0002" }}>
          <p style={{ overflowWrap: "anywhere" }}>{user.email}</p>
          <button onClick={handleLogout} disabled={pending}>{pending ? "Logging out…" : "Log out"}</button>
          {error && <p role="alert">{error}</p>}
        </div>}
      </div>
    </div>
  </div>;
}
