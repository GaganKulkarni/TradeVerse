import React from "react";

function Universe() {
  return (
    <div className="container mt-5">
      <div className="row text-center">
        <h1>The TradeVerse Network</h1>
        <p>
          Extend your trading and investment experience even further with our
          partner platforms
        </p>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/smallcaseLogo.png" />
          <p className="text-small text-muted">Thematic investment platform</p>
        </div>
        <div className="col-4 p-3 mt-5">
          <img src="media/images/goldenpiLogo.png"/>
          <p className="text-small text-muted"> online investment platform focused primarily on fixed-income products</p>
        </div>
        <div className="col-4 p-3 mt-5">
          <img src="media/images/streakLogo.png"  style={{ width: "27%", marginBottom: "6px"}}
            alt="Logo"/>
          <p className="text-small text-muted"> trading platform/tool focused on algorithmic and rule-based trading without requiring users to write code.</p>
        </div>
        <div className="col-4 p-3 mt-5">
          <img src="media/images/pressLogos.png" style={{ width: "90%", marginBottom: "6px"}}
            alt="Logo"/>
          <p className="text-small text-muted">financial news/press platform related to trading</p>
        </div>
        <div className="col-4 p-3 mt-5">
          <img src="media/images/sensibullLogo.svg" style={{ width: "36%", marginBottom: "6px"}} />
          <p className="text-small text-muted">options trading and analysis platform focused on helping traders analyze and make strategies.</p>
        </div>
        <div className="col-4 p-3 mt-5">
          <img src="media/images/tradeversefundhouse.png" style={{ width: "32%"}} />
          <p className="text-small text-muted">It is TradeVerse's asset management company (AMC).</p>
        </div>
        <button
          onClick={() => window.location.assign("/signup")}
          className="p-2 btn btn-primary fs-5 mb-5"
          style={{ width: "20%", margin: "0 auto" }}
        >
          Signup Now
        </button>
      </div>
    </div>
  );
}

export default Universe;
