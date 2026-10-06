import React from "react";

function Hero() {
  return (
    <div className="container">
      <div className="row p-3 p-md-5 mt-5 mb-5">
        <h1 className="fs-2 text-center">
         We are building a smarter way to invest
<br />
Now, we are shaping the future with technology.
        </h1>
      </div>

      <div
        className="row p-3 p-md-5 mt-5 border-top text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
       <div className="col-12 col-md-6 p-3 p-md-5">
  <p>
    TradeVerse makes investing simple, accessible, and easy to understand. It brings essential financial tools together in one platform. Our goal is to help investors make smarter and more confident decisions.
  </p>

  <p>
    We are building TradeVerse around intuitive design, modern technology,
    and a seamless user experience to make managing investments more
    convenient and efficient.
  </p>

  <p>
    As TradeVerse continues to evolve, our focus remains on building a
    reliable and user-friendly investment ecosystem that can grow with the
    changing needs of investors.
  </p>
</div>
       <div className="col-12 col-md-6 p-3 p-md-5">
  <p>
    TradeVerse is focused on creating an informative and user-friendly
    platform that helps investors explore financial markets and understand
    different investment opportunities.
  </p>

  <p>
    Our platform brings together essential investment tools and resources,
    with the goal of making the investing experience simpler, more
    accessible, and convenient for users.
  </p>

  <p>
    We are continuously working on new features and improvements to enhance
    the TradeVerse experience. As the platform evolves, our focus remains on
    technology, reliability, and building a seamless environment for modern
    investors.
  </p>
</div>
      </div>
    </div>
  );
}

export default Hero;