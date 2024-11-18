import React, { useRef, useEffect, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string | ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (index: number, id: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onTabChange, className }: TabsProps) => {
  const tabRefs = useRef<Record<string, HTMLLIElement>>({});
  const timeoutRef = useRef<number | null>(null); // Ref to store the timeout ID

  useEffect(() => {
    const el = tabRefs.current[activeTab];

    if (el) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        timeoutRef.current = null;
      }, 700);
    }

    // Cleanup timeout on component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTab]);

  return (
    <ul
      className={`flex font-bold text-lg text-nowrap gap-0 overflow-x-scroll -mx-5 px-5 ${className}`}
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map(({ id, label }, index) => (
        <li
          key={id}
          ref={(el) => {
            if (el) tabRefs.current[id] = el;
          }}
          className={`px-3 py-1.5 rounded-full${activeTab === id ? " bg-black text-white" : ""}`}
          onClick={() => onTabChange(index, id)}
        >
          {label}
        </li>
      ))}
    </ul>
  );
};
