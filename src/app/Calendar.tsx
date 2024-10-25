"use client";

import { type CalendarEvent, type Employee, fetchAllEmployees, fetchAllEvents } from "@/app/api";
import type { EventContentArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import { useEffect, useRef, useState } from "react";

type CanSwipeDirection = boolean | "Left" | "Right";

interface SwipeComponentProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  canSwipeDirection: CanSwipeDirection;
  children: React.ReactNode;
}

const SwipeComponent: React.FC<SwipeComponentProps> = ({
  onSwipeLeft,
  onSwipeRight,
  canSwipeDirection,
  children,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setStartX(e.touches[0].pageX);
    setStartY(e.touches[0].pageY);
    setIsDragging(true);
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || startX === null || startY === null) return;

    const currentX = e.touches[0].pageX;
    const currentY = e.touches[0].pageY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (!isSwiping) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
        // User is swiping horizontally
        setIsSwiping(true);
      } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // User is scrolling vertically, cancel dragging
        setIsDragging(false);
        setStartX(null);
        setStartY(null);
        return;
      }
    } else {
      const newTranslateX = -deltaX;
      if (
        ((canSwipeDirection === "Left" || canSwipeDirection === true) && newTranslateX > 0) ||
        ((canSwipeDirection === "Right" || canSwipeDirection === true) && newTranslateX < 0)
      )
        setTranslateX(newTranslateX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || startX === null) return;

    const containerWidth = sliderRef.current?.offsetWidth || 1;
    const threshold = containerWidth * 0.3;

    if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
    }

    setTranslateX(0);
    setStartX(null);
    setStartY(null);
    setIsDragging(false);
    setIsSwiping(false);
  };

  return (
    <div
      ref={sliderRef}
      onTouchStart={canSwipeDirection !== false ? handleTouchStart : () => {}}
      onTouchMove={canSwipeDirection !== false ? handleTouchMove : () => {}}
      onTouchEnd={canSwipeDirection !== false ? handleTouchEnd : () => {}}
      className={`${isDragging ? "" : "transition-transform duration-300"}`}
      style={{
        transform: `translateX(${-translateX}px)`,
        flexDirection: "row",
      }}
    >
      {children}
    </div>
  );
};

export function Calendar() {
  const [canSwipeDirection, setCanSwipeDirection] = useState<CanSwipeDirection>("Left");
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState<string>("");
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    fetchAllEvents().then(({ data: events }) => {
      setAllEvents(events);
    });
    fetchAllEmployees().then(({ data: employees }) => {
      setAllEmployees(employees);
    });
  }, []);

  const resources = allEmployees.map((employee) => ({
    id: employee.id,
    title: employee.nickname || employee.user.name,
    avatar: employee.user.avatar.url,
    businessHours: employee.businessHours.map((i) => ({
      daysOfWeek: [i.weekday],
      startTime: i.startTime,
      endTime: i.endTime,
    })),
  }));

  const initialEvents = allEvents.map((event) => ({
    title: event.service.name,
    start: event.startDateTime,
    end: event.endDateTime,
    editable: true,
    resourceId: event.employee.id,
  }));

  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const ANIMATION_DURATION = 300;

  return (
    resources.length > 0 &&
    initialEvents.length > 0 && (
      <div className="relative">
        <div
          className={`relative calendar-container ${isAnimating ? "animating" : ""}`}
          style={{
            transform: `translateX(${translateX}px)`,
            overflowX: isAnimating ? "hidden" : "visible",
          }}
        >
          <SwipeComponent
            canSwipeDirection={canSwipeDirection}
            onSwipeRight={() => {
              setIsAnimating(true);
              setTranslateX(-window.innerWidth);
              setTimeout(() => {
                if (calendarRef.current) {
                  calendarRef.current.getApi().next();
                }
                setTranslateX(0);
                setIsAnimating(false);
              }, ANIMATION_DURATION);
            }}
            onSwipeLeft={() => {
              setIsAnimating(true);
              setTranslateX(window.innerWidth);
              setTimeout(() => {
                if (calendarRef.current) {
                  calendarRef.current.getApi().prev();
                }
                setTranslateX(0);
                setIsAnimating(false);
              }, ANIMATION_DURATION);
            }}
          >
            <div className="sticky top-0 p-4 z-50 bg-white shadow">
              <h2 className="z-50 text-xl font-bold">{currentDate}</h2>
            </div>
            <FullCalendar
              viewDidMount={() => {
                const element = document.querySelector(
                  ".fc-scroller-harness .fc-timegrid-body",
                )?.parentElement;
                if (element) {
                  const handleScroll = () => {
                    const _isAtStart = element.scrollLeft === 0;
                    const _isAtEnd = element.scrollWidth + element.scrollLeft === element.clientWidth;
                    if (_isAtStart) setCanSwipeDirection("Left");
                    if (_isAtEnd) setCanSwipeDirection("Right");
                    if (!_isAtStart && !_isAtEnd) setCanSwipeDirection(false);
                    if (_isAtStart && _isAtEnd) setCanSwipeDirection(true);
                  };

                  element.addEventListener("scroll", handleScroll);
                  setTimeout(handleScroll, 500);
                }
              }}
              ref={calendarRef}
              datesSet={(d) => {
                setCurrentDate(d.view.title);
                setTranslateX(0);
                setIsAnimating(false);
              }}
              plugins={[resourceTimeGridPlugin, scrollGridPlugin]}
              initialView="resourceTimeGridDay"
              resourceLabelDidMount={(info) => {
                const avatar = document.createElement("img");
                avatar.src = info.resource.extendedProps.avatar;
                avatar.className = "w-8 h-8 rounded-full mx-auto border-2 border-gray-300 mt-2";
                info.el.prepend(avatar);
              }}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
              }}
              slotDuration={{ minute: 30 }}
              resources={resources}
              initialEvents={initialEvents}
              allDaySlot={false}
              eventContent={renderEventContent}
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
              locale="fa"
              height="auto"
              dayMinWidth={120}
              headerToolbar={false}
              nowIndicator={true}
              editable={true}
              selectable={true}
              selectMirror={true}
            />
          </SwipeComponent>
        </div>
        <div className="sticky flex flex-row items-center justify-center bottom-0 z-50 bg-white p-4 w-full">
          <button>
            <img src="/calendar.svg" className="w-7 h-7" />
          </button>
          <button>
            <img src="/clients.svg" className="w-7 h-7" />
          </button>
        </div>
      </div>
    )
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      <div>
        <b>{eventInfo.timeText}</b>
      </div>
      <div>
        <i>{eventInfo.event.title}</i>
      </div>
    </>
  );
}
