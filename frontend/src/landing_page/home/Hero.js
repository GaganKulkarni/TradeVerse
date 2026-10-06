import React from "react";

function Hero() {
  return (
    <div className="container p-5 mb-5">
      <div className="row text-center">
        <img
          src="media/images/homeHero.png"
          alt="Hero Image"
          className="mb-5"
        />
        <h1 className="mt-5">Your Gateway to Every Investment</h1>
        <p>
         Your all-in-one platform for stocks, derivatives, mutual funds, ETFs, bonds, and more.
        </p>
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

export default Hero;
