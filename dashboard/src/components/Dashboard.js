import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Summary from "./Summary";
import WatchList from "./WatchList";
import { GeneralContextProvider } from "./GeneralContext";
import "./PaperTrading.css";

const Dashboard = () => {
  return (
    <GeneralContextProvider>
    <div className="dashboard-container">
          <WatchList />
     
    
      <div className="content">
        <Routes>
          <Route exact path="/" element={<Summary />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/positions" element={<Navigate to="/holdings" replace />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/apps" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
    </GeneralContextProvider>
  );
};

export default Dashboard;
