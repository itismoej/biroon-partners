import { Tooltip } from "@/app/Components/Tooltip";
import type React from "react";

interface CalendarFooterProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  addNewServicesModalIsOpen: boolean;
  calendarRef: React.RefObject<any>;
  setActionsBSIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  goToNow: () => void;
}

export const CalendarFooter: React.FC<CalendarFooterProps> = ({
  page,
  setPage,
  addNewServicesModalIsOpen,
  calendarRef,
  setActionsBSIsOpen,
  goToNow,
}) => {
  return (
    !addNewServicesModalIsOpen && (
      <div className="fixed bottom-0 z-50 bg-white pb-3 pt-1 px-3 w-full shadow h-[60px]">
        <div className="flex flex-row-reverse gap-4 items-center justify-between max-w-[400px] mx-auto">
          <Tooltip text="تقویم" place="left">
            <button
              className="relative bg-white rounded-full p-3"
              onClick={() => {
                setPage(0);
                if (calendarRef.current) {
                  goToNow();
                }
              }}
            >
              <img src="/calendar.svg" className="w-7 h-7" />
            </button>
          </Tooltip>
          <Tooltip text="فروش">
            <button className="bg-white rounded-full p-3" onClick={() => setPage(1)}>
              <img src="/sales.svg" className="w-7 h-7" />
            </button>
          </Tooltip>
          <button
            type="button"
            className="bg-purple-600 rounded-full p-2"
            onClick={() => {
              setActionsBSIsOpen(true);
            }}
          >
            <img src="/plus-white.svg" className="w-7 h-7" />
          </button>
          <Tooltip text="مشتریان">
            <button className="bg-white rounded-full p-3" onClick={() => setPage(2)}>
              <img src="/client.svg" className="w-7 h-7" />
            </button>
          </Tooltip>
          <Tooltip text="تنظیمات" place="right">
            <button className="bg-white rounded-full p-3" onClick={() => setPage(3)}>
              <img src="/more.svg" className="w-7 h-7" />
            </button>
          </Tooltip>
        </div>
      </div>
    )
  );
};
