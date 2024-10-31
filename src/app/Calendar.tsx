"use client";

import {
  type CalendarEvent,
  type CalendarEventPatchRequest,
  type Employee,
  fetchAllEmployees,
  fetchAllEvents,
  updateEvent,
} from "@/app/api";
import { toFarsiDigits } from "@/app/utils";
import type { EventContentArg, EventDropArg } from "@fullcalendar/core";
import interactionPlugin, { type EventResizeDoneArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import type { ResourceApi } from "@fullcalendar/resource";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import { format } from "date-fns-jalali";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import "./calendar.css";
import { BottomSheet } from "@/app/Components/BottomSheet";
import { Tooltip } from "@/app/Components/Tooltip";

type CanSwipeDirection = boolean | "Left" | "Right";

interface SwipeComponentProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  canSwipeDirectionRef: React.MutableRefObject<CanSwipeDirection>;
  children: React.ReactNode;
}

const SwipeComponent: React.FC<SwipeComponentProps> = ({
  onSwipeLeft,
  onSwipeRight,
  canSwipeDirectionRef,
  children,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (canSwipeDirectionRef.current === false) return;
    setStartX(e.touches[0].pageX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || startX === null || startY === null || canSwipeDirectionRef.current === false) return;

    const currentX = e.touches[0].pageX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (!isSwiping) {
      if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
        setIsSwiping(true);
      }
    } else {
      const newTranslateX = -deltaX;
      if (
        ((canSwipeDirectionRef.current === "Left" || canSwipeDirectionRef.current === true) &&
          newTranslateX > 0) ||
        ((canSwipeDirectionRef.current === "Right" || canSwipeDirectionRef.current === true) &&
          newTranslateX < 0)
      ) {
        setTranslateX(newTranslateX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || startX === null || canSwipeDirectionRef.current === false) return;

    const containerWidth = sliderRef.current?.offsetWidth || 1;
    const threshold = containerWidth * 0.3;

    if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
      setTimeout(() => {
        setTranslateX(600);
      }, 50);
    } else if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
      setTimeout(() => {
        setTranslateX(-600);
      }, 50);
    }

    setTimeout(() => {
      setTranslateX(0);
      setStartX(null);
      setStartY(null);
      setIsDragging(false);
      setIsSwiping(false);
    }, 200);
  };

  return (
    <div
      ref={sliderRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
  const canSwipeDirectionRef = useRef<CanSwipeDirection>("Left");
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const calendarRef = useRef<FullCalendar>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [editingEvents, setEditingEvents] = useState<
    (({ newResource?: ResourceApi } & EventDropArg) | EventResizeDoneArg)[]
  >([]);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const [actionsBSIsOpen, setActionsBSIsOpen] = useState(false);

  useEffect(() => {
    if (editingEvents.length > 0) {
      setIsVisible(true);
    } else if (isVisible) {
      setTimeout(() => setIsVisible(false), 400);
    }
  }, [editingEvents]);

  useEffect(() => {
    fetchAllEvents().then(({ data: events, response }) => {
      if (response.status === 401) router.push("/auth");
      else {
        setAllEvents(events);
        fetchAllEmployees().then(({ data: employees, response }) => {
          if (response.status === 401) router.push("/auth");
          else {
            setAllEmployees(employees);
          }
        });
      }
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
    id: event.id,
    title: event.service.name,
    start: event.startDateTime,
    end: event.endDateTime,
    editable: true,
    resourceId: event.employee.id,
  }));

  useEffect(() => {
    const stickyHeaders = document.querySelectorAll(".fc .fc-scrollgrid-section-sticky > *");
    if (stickyHeaders.length > 0) {
      stickyHeaders.forEach((stickyHeader) => {
        if (!isAnimating) {
          stickyHeader.classList.add("!top-[63px]");
          stickyHeader.classList.remove("!top-[0px]");
        } else {
          stickyHeader.classList.add("!top-[0px]");
          stickyHeader.classList.remove("!top-[63px]");
        }
      });
    }
  }, [isAnimating, currentDate]);

  const ANIMATION_DURATION = 300;

  const goToNow = (behavior: ScrollBehavior = "smooth") => {
    const nowLine = document.querySelector(".fc-timegrid-now-indicator-line");
    nowLine?.scrollIntoView({ behavior, block: "center" });
  };

  return (
    resources.length > 0 && (
      <div className="relative overflow-x-clip">
        <div className="sticky top-0 p-5 z-50 bg-white shadow flex flex-row gap-5 items-center">
          <img src="/hamburger.svg" className="w-6 h-6" />
          <h2 className="z-50 text-2xl font-bold">{toFarsiDigits(format(currentDate, "EEEE، d MMMM y"))}</h2>
        </div>
        <div
          className={`relative calendar-container ${isAnimating ? "animating" : ""}`}
          style={{
            transform: `translateX(${translateX}px)`,
            overflowX: isAnimating ? "hidden" : "visible",
          }}
        >
          <SwipeComponent
            canSwipeDirectionRef={canSwipeDirectionRef}
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
            <FullCalendar
              viewDidMount={() => {
                const element = document.querySelector(
                  ".fc-scroller-harness .fc-timegrid-body",
                )?.parentElement;
                if (element) {
                  const handleScroll = () => {
                    const _isAtStart = element.scrollLeft === 0;
                    const _isAtEnd = element.scrollWidth + element.scrollLeft === element.clientWidth;
                    if (_isAtStart) canSwipeDirectionRef.current = "Left";
                    if (_isAtEnd) canSwipeDirectionRef.current = "Right";
                    if (!_isAtStart && !_isAtEnd) canSwipeDirectionRef.current = false;
                    if (_isAtStart && _isAtEnd) canSwipeDirectionRef.current = true;
                  };

                  element.addEventListener("touchend", handleScroll);
                  element.addEventListener("mouseup", handleScroll);
                  setTimeout(handleScroll, 500);
                  setTimeout(() => goToNow("instant"), 100);
                }
              }}
              ref={calendarRef}
              datesSet={(d) => {
                setCurrentDate(d.start);
                setIsAnimating(false);
                setTranslateX(0);
              }}
              longPressDelay={200}
              selectAllow={() => false}
              eventDragStart={() => {
                canSwipeDirectionRef.current = false;
                setIsAnimating(false);
                setTranslateX(0);
              }}
              eventClick={() => {
                canSwipeDirectionRef.current = false;
                setIsAnimating(false);
                setTranslateX(0);
              }}
              eventDragStop={() => {
                const element = document.querySelector(
                  ".fc-scroller-harness .fc-timegrid-body",
                )?.parentElement;
                if (element) {
                  const handleScroll = () => {
                    const _isAtStart = element.scrollLeft === 0;
                    const _isAtEnd = element.scrollWidth + element.scrollLeft === element.clientWidth;
                    if (_isAtStart) canSwipeDirectionRef.current = "Left";
                    if (_isAtEnd) canSwipeDirectionRef.current = "Right";
                    if (!_isAtStart && !_isAtEnd) canSwipeDirectionRef.current = false;
                    if (_isAtStart && _isAtEnd) canSwipeDirectionRef.current = true;
                  };

                  setTimeout(handleScroll, 200);
                }
              }}
              snapDuration={{ minute: 15 }}
              plugins={[resourceTimeGridPlugin, scrollGridPlugin, interactionPlugin]}
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
              slotDuration={{ minute: 15 }}
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
              eventDrop={(info) => {
                setEditingEvents((prev) => [...prev, info]);
              }}
              eventResize={(info) => {
                setEditingEvents((prev) => [...prev, info]);
              }}
              dragRevertDuration={100}
              dragScroll={true}
              nowIndicatorDidMount={(mountArg) => {
                if (mountArg.isAxis) {
                  mountArg.el.classList.add("!w-[90%]");
                  mountArg.el.classList.add("!h-[16px]");
                  mountArg.el.classList.add("!bg-white");
                  mountArg.el.classList.add("!text-sm");
                  mountArg.el.classList.add("!text-center");
                  mountArg.el.classList.add("!font-bold");
                  mountArg.el.classList.add("!text-red-600");
                  mountArg.el.classList.add("!border");
                  mountArg.el.classList.add("!rounded-full");
                  mountArg.el.classList.add("!border-red-600");
                  mountArg.el.classList.add("!absolute");
                  mountArg.el.classList.add("!-translate-y-[2px]");

                  const scheduleNextMinute = () => {
                    const now = new Date();
                    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

                    setTimeout(() => {
                      onMinuteChange();
                      scheduleNextMinute();
                    }, msUntilNextMinute);
                  };

                  const onMinuteChange = () => {
                    mountArg.el.innerText = toFarsiDigits(format(new Date(), "HH:mm"));
                  };
                  onMinuteChange()
                  scheduleNextMinute();
                }
              }}
            />
          </SwipeComponent>
        </div>
        <div className="sticky bottom-0 z-50 bg-white pb-3 pt-1 px-3 w-full shadow">
          <div className="flex flex-row-reverse gap-4 items-center justify-between max-w-[300px] mx-auto">
            <Tooltip text="تقویم">
              <button
                className="relative bg-white rounded-full p-3"
                onClick={() => {
                  if (calendarRef.current) {
                    goToNow();
                  }
                }}
              >
                <img src="/calendar.svg" className="w-7 h-7" />
                <p
                  className="absolute bottom-1/2 translate-y-[80%] -translate-x-[60%] font-extrabold text-[10px] tabular-nums pointer-events-none"
                  style={{ letterSpacing: "-1px" }}
                >
                  {toFarsiDigits(format(new Date(), "dd"))}
                </p>
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
            <BottomSheet
              title="افزودن"
              isOpen={actionsBSIsOpen}
              onClose={() => {
                setActionsBSIsOpen(false);
              }}
            >
              <div className="-mx-3">
                <ul className="flex flex-col">
                  <li>
                    <button className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl">
                      <div className="bg-purple-100 rounded-full p-3">
                        <img src="/add-appointment.svg" className="w-6 h-6" />
                      </div>
                      <p className="text-xl font-normal">نوبت</p>
                    </button>
                  </li>
                  <li>
                    <button className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl">
                      <div className="bg-purple-100 rounded-full p-3">
                        <img src="/add-blocked-time.svg" className="w-6 h-6" />
                      </div>
                      <p className="text-xl font-normal">زمان بلوکه شده</p>
                    </button>
                  </li>
                </ul>
              </div>
            </BottomSheet>
            <Tooltip text="مشتریان">
              <button className="bg-white rounded-full p-3">
                <img src="/client.svg" className="w-7 h-7" />
              </button>
            </Tooltip>
          </div>
        </div>
        {editingEvents.length > 0 && (
          <div
            className={
              "fixed flex w-[97%] max-w-[500px] left-1/2 -translate-x-1/2 flex-row justify-between items-center z-50 top-2 rounded-md py-3 px-3 bg-purple-600 text-white font-light text-center text-xl"
            }
          >
            <h2 className="z-50 text-2xl font-bold">
              {toFarsiDigits(format(currentDate, "EEEE، d MMMM y"))}
            </h2>
            <h2 className="animate-pulse">حالت ویرایش</h2>
          </div>
        )}
        {isVisible && (
          <div
            className={`fixed z-50 bottom-0 bg-white flex items-center px-4 h-[70px] w-full p-4 shadow-t-lg font-bold ${
              editingEvents.length > 0 ? "animate-slideInBottom" : "animate-slideOutBottom"
            }`}
          >
            <div className="relative w-full me-2.5">
              <button
                type="button"
                onClick={() => {
                  editingEvents.reverse().forEach((e) => {
                    e.revert();
                  });
                  setEditingEvents([]);
                }}
                className="w-full p-3 bg-white text-black border rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300"
              >
                لغو و بازگشت
              </button>
            </div>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => {
                  // Create a Map to store the latest edit per event id
                  const uniqueEventsMap = new Map<string, CalendarEventPatchRequest>();

                  // Iterate over editingEvents and update the map with the latest changes for each event id
                  editingEvents.forEach((e) => {
                    uniqueEventsMap.set(e.event.id, {
                      ...(uniqueEventsMap.get(e.event.id) || {}),
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      ...(e.newResource ? { employeeId: e.newResource.id } : {}),
                      startDateTime: e.event.startStr,
                      endDateTime: e.event.endStr,
                    });
                  });

                  // Convert the map values into an array of update promises
                  const updatePromises: [string, ReturnType<typeof updateEvent>][] = Array.from(
                    uniqueEventsMap.entries(),
                  ).map(([id, updateData]) => [id, updateEvent(id, updateData)]);

                  // Use Promise.all to handle all promises together
                  Promise.all(
                    updatePromises.map(([id, p]) =>
                      p.then(({ data, response }) => {
                        if (response.status === 200) {
                          if (calendarRef.current) {
                            const event = calendarRef.current.getApi().getEventById(id);
                            if (!event) {
                              return;
                            }
                            toast.success(`نوبت ${data.service.name} با موفقیت تغییر یافت`, {
                              duration: 5000,
                              position: "top-center",
                              className: "w-full font-medium",
                            });
                            setTimeout(() => {
                              event.setProp("backgroundColor", "green");
                            }, 10);
                            setTimeout(() => {
                              event.setProp("backgroundColor", "");
                            }, 3000);
                          }
                        }
                        if (response.status === 400) {
                          if (calendarRef.current) {
                            const event = calendarRef.current.getApi().getEventById(id);
                            if (!event) {
                              return;
                            }
                            toast.error(`ویرایش ناموفق بود. ${data.error}`, {
                              duration: 5000,
                              position: "top-center",
                              className: "w-full font-medium",
                            });
                            setTimeout(() => {
                              event.setProp("backgroundColor", "red");
                              event.setProp("borderColor", "red");
                            }, 10);
                            setTimeout(() => {
                              event.setProp("backgroundColor", "");
                              event.setProp("borderColor", "");
                            }, 3000);
                          }
                          editingEvents
                            .filter((e) => e.event.id === id)
                            .reverse()
                            .forEach((e) => {
                              e.revert();
                            });
                        }
                      }),
                    ),
                  ).finally(() => {
                    // Run setEditingEvents([]) after all promises have finished
                    setEditingEvents([]);
                  });
                }}
                className="w-full p-3 bg-black text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300"
              >
                ذخیره
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <div>
      <div style={{ direction: "ltr" }}>
        <b>{eventInfo.timeText}</b>
      </div>
      <div>
        <i>{eventInfo.event.title}</i>
      </div>
    </div>
  );
}
