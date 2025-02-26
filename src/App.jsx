// App.js - With Multi-Stop Route Planning
import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import Home from "./views/home";
import RouteDelivery from "./views/route";

function App() {
  const navigate = useNavigate();
  return (
    <div className="app">
      <header>
        <div className="container">
          <nav>
            <div className="logo" style={{ cursor: "pointer" }}>
              <FontAwesomeIcon icon={faTruck} className="logo-icon" />
              <span onClick={() => navigate("/")}>TMS</span>
            </div>
            <div className="nav-links">
              <a href="#" className="active">
                Dashboard
              </a>
            </div>
            <div className="user-menu">
              <button className="secondary">
                <FontAwesomeIcon icon={faBell} />
              </button>
              <button>
                <FontAwesomeIcon icon={faUser} />
                Admin
              </button>
            </div>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/route" element={<RouteDelivery />} />

        {/* Catch-all route for 404 */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>

      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FontAwesomeIcon icon={faTruck} className="text-primary mr-2" />
            <span> </span>
            <span className="text-lg font-semibold text-primary">
              &copy;2025 Transport Management System
            </span>
          </div>
          {/* <div className="text-slate-500 text-sm">
            &copy; 2025 Transport Management System.
          </div> */}
        </div>
      </footer>
    </div>
  );
}

export default App;
