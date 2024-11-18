"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  place?: "center" | "left" | "right";
}

export const Tooltip = ({ children, text, place = "center" }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => {
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <div
      className="relative flex flex-col items-center group"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute bottom-full flex flex-col items-center animate-fadeInUp ${place === "left" ? "left-[5px]" : place === "right" ? "right-[5px]" : ""}`}
        >
          <div className="relative bg-gray-900 text-white text-md font-normal rounded py-2 px-3 shadow-lg">
            {text}
          </div>
        </div>
      )}
    </div>
  );
};
