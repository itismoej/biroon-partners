"use client";

import type React from "react";
import { useEffect, useState } from "react";

export const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
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
        <div className="absolute bottom-full flex flex-col items-center animate-fadeInUp">
          <div className="relative bg-gray-900 text-white text-md font-normal rounded py-2 px-3 shadow-lg">
            {text}
          </div>
        </div>
      )}
    </div>
  );
};
