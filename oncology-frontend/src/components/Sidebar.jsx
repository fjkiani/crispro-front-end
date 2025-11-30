import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { sun } from "../assets";
import { navlinks } from "../constants";

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <div
    className={`group relative h-[48px] w-[48px] rounded-[10px] ${
      isActive && isActive === name && "bg-blue-100"
    } flex items-center justify-center ${
      !disabled && "cursor-pointer"
    } ${styles} transition-all hover:scale-105 hover:bg-gray-200`}
    onClick={handleClick}
  >
    {!isActive ? (
      <img src={imgUrl} alt="fund_logo" className="h-6 w-6" />
    ) : (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`h-6 w-6 ${isActive !== name && "opacity-50"}`}
      />
    )}
    {/* Tooltip - Only show if name is defined */}
    {name && (
      <div className="absolute left-full ml-3 scale-0 rounded bg-gray-700 px-2 py-1 text-xs font-medium text-white group-hover:scale-100">
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </div>
    )}
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState("dashboard");

  // Determine active navigation item based on current path
  useEffect(() => {
    const path = location.pathname;
    
    const currentLink = navlinks.find(nav => nav.link === path);
    if (currentLink) {
      setIsActive(currentLink.name);
    } else {
      if (path.startsWith("/medical-records/pat12345")) {
      setIsActive("dashboard");
      } else if (path.startsWith("/medical-records/pat12344/research")) {
      setIsActive("research");
      } else if (path.startsWith("/mutation-explorer/pat12345")) {
      setIsActive("mutations");
      } else if (path.includes("/agent-dashboard")) {
        setIsActive("agents");
    } else if (path.includes("/agent-studio")) {
      setIsActive("agentStudio");
    } else if (path.includes("/profile")) {
      setIsActive("profile");
    } else if (path.includes("/food-validator")) {
      setIsActive("food-validator");
    } else if (path.includes("/holistic-hypothesis-tester")) {
      setIsActive("hypothesis-tester");
    } else if (path.includes("/ayesha-complete-care")) {
      setIsActive("ayesha-care");
    } else if (path.includes("/ayesha-twin-demo")) {
      setIsActive("ayesha-demo");
    } else if (path.includes("/universal-dossiers")) {
      setIsActive("universal-dossiers");
    } else if (path.includes("/universal-trial-intelligence")) {
      setIsActive("universal-trial-intelligence");
      } else {
        setIsActive("");
      }
    }
  }, [location.pathname]);

  return (
    <div className="sticky top-5 flex h-[93vh] flex-col items-center justify-between">
      <Link to="/">
        <div className="group relative flex flex-col items-center rounded-[10px] bg-white p-3 transition-all hover:scale-105 border border-gray-200 shadow-sm">
          <span className="text-4xl mb-1">🧬</span> 
          <div className="text-center text-xs font-medium text-gray-700">
            CrisPRO: Oncology Co-Pilot
          </div>
        </div>
      </Link>

      <div className="mt-12 flex w-[76px] flex-1 flex-col items-center justify-between rounded-[20px] bg-white py-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => {
                if (!link.disabled) {
                  setIsActive(link.name);
                  navigate(link.link);
                }
              }}
            />
          ))}
        </div>

        <Icon styles="bg-white shadow-md hover:bg-gray-100" imgUrl={sun} name="theme" />
      </div>
    </div>
  );
};

export default Sidebar;
