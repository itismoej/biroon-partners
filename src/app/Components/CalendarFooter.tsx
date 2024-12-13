import { Tooltip } from "@/app/Components/Tooltip";
import { goToNow } from "@/app/calendarUtils";
import { useShallowRouter } from "@/app/utils";
import type FullCalendar from "@fullcalendar/react";
import { usePathname } from "next/navigation";
import type React from "react";

interface CalendarFooterProps {
  calendarRef: React.RefObject<FullCalendar>;
}

export const CalendarFooter: React.FC<CalendarFooterProps> = ({ calendarRef }) => {
  const shallowRouter = useShallowRouter();
  const pathname = usePathname();
  return (
    <div className="fixed bottom-0 z-20 bg-white pb-3 pt-1 px-3 w-full shadow h-[60px]">
      <div className="flex flex-row-reverse gap-4 items-center justify-between max-w-[400px] mx-auto">
        <Tooltip text="تقویم" place="left">
          <button
            className="relative bg-white rounded-full p-3"
            onClick={() => {
              shallowRouter.push("/calendar");
              if (calendarRef.current) {
                goToNow();
              }
            }}
          >
            <img
              src="/calendar.svg"
              className="w-7 h-7"
              style={{
                filter: pathname.startsWith("/calendar")
                  ? "invert(20%) sepia(76%) saturate(4498%) hue-rotate(267deg) brightness(97%) contrast(88%)"
                  : "none",
              }}
            />
          </button>
        </Tooltip>
        <Tooltip text="فروش">
          <button
            className="bg-white rounded-full p-3"
            onClick={() => {
              shallowRouter.push("/sales");
            }}
          >
            <img
              src="/sales.svg"
              className="w-7 h-7"
              style={{
                filter: pathname.startsWith("/sales")
                  ? "invert(20%) sepia(76%) saturate(4498%) hue-rotate(267deg) brightness(97%) contrast(88%)"
                  : "none",
              }}
            />
          </button>
        </Tooltip>
        <button
          type="button"
          className="bg-purple-600 rounded-full p-2"
          onClick={() => {
            shallowRouter.push(`${pathname}/calendar-add-modal`);
          }}
        >
          <img src="/plus-white.svg" className="w-7 h-7" />
        </button>
        <Tooltip text="مشتریان">
          <button
            className="bg-white rounded-full p-3"
            onClick={() => {
              shallowRouter.push("/clients");
            }}
          >
            <img
              src="/client.svg"
              className="w-7 h-7"
              style={{
                filter: pathname.startsWith("/clients")
                  ? "invert(20%) sepia(76%) saturate(4498%) hue-rotate(267deg) brightness(97%) contrast(88%)"
                  : "none",
              }}
            />
          </button>
        </Tooltip>
        <Tooltip text="دیگر امکانات" place="right">
          <button
            className="bg-white rounded-full p-3"
            onClick={() => {
              shallowRouter.push("/more");
            }}
          >
            <img
              src="/more.svg"
              className="w-7 h-7"
              style={{
                filter: pathname.startsWith("/more")
                  ? "invert(20%) sepia(76%) saturate(4498%) hue-rotate(267deg) brightness(97%) contrast(88%)"
                  : "none",
              }}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
