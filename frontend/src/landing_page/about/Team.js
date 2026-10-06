import React from "react";
import { Link } from "react-router-dom";
import "./Team.css";

export default function Team() {
  return <section className="about-creator" aria-labelledby="creator-heading">
    <h2 id="creator-heading">Meet the creator</h2>
    <div className="creator-layout">
      <div className="creator-profile">
        <div className="creator-portrait"><img src="/media/images/gagan-kulkarni.jpg" alt="Gagan Kulkarni" /></div>
        <h3>Gagan Kulkarni</h3>
        <p className="creator-role">Creator of TradeVerse</p>
      </div>
      <div className="creator-story">
        <p>I'm Gagan Kulkarni, the creator of TradeVerse. I built this mini project to explore how a trading platform works and bring the experience to life through a practical web application.</p>
        <p>TradeVerse lets you create an account, practise buying and selling shares with virtual money, and follow your holdings and order history in one place.</p>
        <p>The aim is simple: make the basics of trading easier to understand through hands-on practice. It is a learning project with demo prices, so no real money or market orders are involved.</p>
        <Link to="/">Explore TradeVerse →</Link>
      </div>
    </div>
  </section>;
}
