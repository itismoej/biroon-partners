"use client";

import {
  type AvailableEmployee,
  type AvailableEmployeesByService,
  type CalendarEvent,
  type CalendarEventPatchRequest,
  type Customer,
  type Employee,
  type Location,
  type Service,
  createReservation,
  fetchAllEmployees,
  fetchAllEvents,
  fetchAvailableEmployeesByService,
  fetchCustomers,
  fetchLocation,
  updateEvent,
} from "@/app/api";
import { formatPriceInFarsi, toFarsiDigits } from "@/app/utils";
import type { EventContentArg, EventDropArg } from "@fullcalendar/core";
import interactionPlugin, { type EventResizeDoneArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import type { ResourceApi } from "@fullcalendar/resource";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import { addDays, addMinutes, format, setHours, setMinutes, setSeconds, startOfDay } from "date-fns-jalali";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import "./calendar.css";
import { BottomSheet } from "@/app/Components/BottomSheet";
import { type CanSwipeDirection, SwipeComponent } from "@/app/Components/SwipeComponent";
import { Tile } from "@/app/Components/Tile";
import { Tooltip } from "@/app/Components/Tooltip";
import { DatePicker } from "./Components/DatePicker";
import { Modal } from "./Components/Modal";

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
  const [addAppointmentModalIsOpen, setAddAppointmentModalIsOpen] = useState(false);
  const [selectDateInAddAppointmentModalBSIsOpen, setSelectDateInAddAppointmentModalBSIsOpen] =
    useState(false);
  const [selectTimeInAddAppointmentModalBSIsOpen, setSelectTimeInAddAppointmentModalBSIsOpen] =
    useState(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<Date>(
    setMinutes(setSeconds(new Date(), 0), 0),
  );
  const [addServiceInNewAppointmentIsOpen, setAddServiceInNewAppointmentIsOpen] = useState(false);
  const [createCustomerModalIsOpen, setCreateCustomerModalIsOpen] = useState(false);
  const [clients, setClients] = useState<Customer[]>([]);
  const [newAppointmentCustomer, setNewAppointmentCustomer] = useState<Customer | null>(null);
  const [location, setLocation] = useState<Location | undefined>();
  const [selectedServiceToAddInNewAppointment, setSelectedServiceToAddInNewAppointment] = useState<
    Service | undefined
  >();
  const [availableEmployeesByService, setAvailableEmployeesByService] = useState<
    AvailableEmployeesByService | undefined
  >();
  const [selectedEmployeeForNewAppointment, setSelectedEmployeeForNewAppointment] = useState<
    AvailableEmployee | undefined
  >();
  const [selectEmployeeBSIsOpen, setSelectEmployeeBSIsOpen] = useState<boolean>(false);
  const [selectDateInCalendarBSIsOpen, setSelectDateInCalendarBSIsOpen] = useState<boolean>(false);

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

    fetchCustomers().then(({ data }) => {
      setClients(data);
    });

    fetchLocation().then(({ data, response }) => {
      if (response.status === 401) router.push("/auth");
      else if (response.status !== 200)
        toast.error("دریافت اطلاعات سالن با خطا مواجه شد", {
          duration: 5000,
          position: "top-center",
          className: "w-full font-medium",
        });
      else setLocation(data);
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
          stickyHeader.classList.add("!top-[59px]");
          stickyHeader.classList.remove("!top-[0px]");
        } else {
          stickyHeader.classList.add("!top-[0px]");
          stickyHeader.classList.remove("!top-[59px]");
        }
      });
    }
  }, [isAnimating, currentDate]);

  const ANIMATION_DURATION = 300;

  const goToNow = (behavior: ScrollBehavior = "smooth") => {
    const nowLine = document.querySelector(".fc-timegrid-now-indicator-line");
    nowLine?.scrollIntoView({ behavior, block: "center" });
  };

  return resources.length > 0 ? (
    <div className="relative overflow-x-clip">
      {/* Header */}
      <div className="sticky top-0 p-5 z-50 bg-white shadow flex flex-row gap-5 items-center">
        <button
          className="flex flex-row gap-2"
          type="button"
          onClick={() => {
            setSelectDateInCalendarBSIsOpen(true);
          }}
        >
          <h2 className="z-50 text-xl font-bold">{toFarsiDigits(format(currentDate, "EEEE، d MMMM y"))}</h2>
          <img src="/dropdown.svg"/>
        </button>
      </div>

      {/* Calendar Container */}
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
              const element = document.querySelector(".fc-scroller-harness .fc-timegrid-body")?.parentElement;
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
              const element = document.querySelector(".fc-scroller-harness .fc-timegrid-body")?.parentElement;
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
                mountArg.el.classList.add(
                  "!w-[90%]",
                  "!h-[16px]",
                  "!bg-white",
                  "!text-sm",
                  "!text-center",
                  "!font-bold",
                  "!text-red-600",
                  "!border",
                  "!rounded-full",
                  "!border-red-600",
                  "!absolute",
                  "!-translate-y-[2px]",
                );

                const updateNowIndicator = () => {
                  mountArg.el.innerText = toFarsiDigits(format(new Date(), "HH:mm"));
                };

                const scheduleNextUpdate = () => {
                  const now = new Date();
                  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

                  setTimeout(() => {
                    updateNowIndicator();
                    scheduleNextUpdate();
                  }, msUntilNextMinute);
                };

                updateNowIndicator();
                scheduleNextUpdate();
              }
            }}
          />
        </SwipeComponent>
      </div>

      {/* Footer */}
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
            </button>
          </Tooltip>
          <Tooltip text="فروش">
            <button className="bg-white rounded-full p-3">
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
                  <button
                    className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl"
                    onClick={() => {
                      setAddAppointmentModalIsOpen(true);
                      setActionsBSIsOpen(false);
                    }}
                  >
                    <div className="bg-purple-100 rounded-full p-3">
                      <img src="/add-appointment.svg" className="w-6 h-6" />
                    </div>
                    <p className="text-xl font-normal">نوبت</p>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl"
                    onClick={() => {
                      setActionsBSIsOpen(false);
                    }}
                  >
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
          <Tooltip text="تنظیمات">
            <button className="bg-white rounded-full p-3">
              <img src="/more.svg" className="w-7 h-7" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Editing Indicator */}
      {editingEvents.length > 0 && (
        <div className="fixed flex w-[97%] max-w-[500px] left-1/2 -translate-x-1/2 flex-row justify-between items-center z-50 top-2 rounded-md py-3 px-3 bg-purple-600 text-white font-light text-center text-xl">
          <h2 className="z-50 text-2xl font-bold">{toFarsiDigits(format(currentDate, "EEEE، d MMMM y"))}</h2>
          <h2 className="animate-pulse">حالت ویرایش</h2>
        </div>
      )}

      {/* Save/Cancel Editing Buttons */}
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

      <BottomSheet
        isOpen={selectDateInCalendarBSIsOpen}
        onClose={() => {
          setSelectDateInCalendarBSIsOpen(false);
        }}
      >
        <DatePicker
          selectedDate={currentDate}
          onDateSelect={(date) => {
            if (calendarRef.current) {
              calendarRef.current.getApi().gotoDate(date)
              setCurrentDate(date);
              setSelectDateInCalendarBSIsOpen(false);
            }
          }}
        />
        <div className="mt-9">
          <button
            type="button"
            className={"px-5 py-2 text-xl border rounded-full me-1"}
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              setSelectDateInCalendarBSIsOpen(false);
            }}
          >
            امروز
          </button>
          <button
            type="button"
            className={"px-5 py-2 text-xl border rounded-full me-1"}
            onClick={() => {
              const tomorrow = addDays(new Date(), 1);
              setCurrentDate(tomorrow);
              setSelectDateInCalendarBSIsOpen(false);
            }}
          >
            فردا
          </button>
        </div>
      </BottomSheet>

      <Modal
        isOpen={addAppointmentModalIsOpen}
        onClose={() => {
          setAddAppointmentModalIsOpen(false);
        }}
        title={
          <button
            className="flex flex-row gap-2"
            type="button"
            onClick={() => {
              setSelectDateInAddAppointmentModalBSIsOpen(true);
            }}
          >
            <h1 className="text-3xl font-bold">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</h1>
            <img src="/dropdown.svg" />
          </button>
        }
        topBarTitle={
          <button
            className="flex flex-row gap-2"
            type="button"
            onClick={() => {
              setSelectDateInAddAppointmentModalBSIsOpen(true);
            }}
          >
            <h1 className="text-xl font-bold">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</h1>
            <img src="/dropdown.svg" />
          </button>
        }
      >
        <div className="pb-12">
          <div className="-mx-5 mt-2 mb-6">
            <hr />
          </div>
          {/* TODO: fix this UI for the selected customer */}
          {newAppointmentCustomer ? (
            <button
              type="button"
              className="flex w-full flex-row justify-between items-center rounded-lg border border-gray-200 py-6 px-6 border-l-4 border-l-purple-400"
              onClick={() => setCreateCustomerModalIsOpen(true)}
            >
              <img src="/right.svg" className="w-6 h-6" />
              <div className="text-left">
                <p className="text-xl font-medium" style={{ direction: "ltr" }}>
                  {toFarsiDigits(
                    `${newAppointmentCustomer.user.username.slice(0, 3)} ${newAppointmentCustomer.user.username.slice(3, 6)} ${newAppointmentCustomer.user.username.slice(6, 9)} ${newAppointmentCustomer.user.username.slice(9)}`,
                  )}
                </p>
              </div>
            </button>
          ) : (
            <button
              type="button"
              className="flex w-full flex-row justify-between items-center rounded-lg border border-gray-200 py-7 px-7"
              onClick={() => setCreateCustomerModalIsOpen(true)}
            >
              <div className="text-right">
                <p className="text-xl font-normal">افزودن مشتری</p>
                <p className="text-md text-gray-500">برای مشتری حضوری خالی بگذارید</p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <img src="/person-plus.svg" className="w-7 h-7" />
              </div>
            </button>
          )}
          <div className="mt-7 flex flex-row justify-between items-center rounded-lg border border-gray-200 py-7 px-7">
            <button
              className="flex flex-row gap-2"
              type="button"
              onClick={() => {
                setSelectDateInAddAppointmentModalBSIsOpen(true);
              }}
            >
              <img src="/calendar.svg" className="w-6 h-6" />
              <span className="text-lg font-normal">
                {toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}
              </span>
            </button>
            <button
              className="flex flex-row gap-2"
              type="button"
              onClick={() => {
                setSelectTimeInAddAppointmentModalBSIsOpen(true);
              }}
            >
              <img src="/time.svg" className="w-6 h-6" />
              <span className="text-lg font-normal">
                {toFarsiDigits(format(newAppointmentTime, "HH:mm"))}
              </span>
            </button>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold">سرویس</h2>
            {selectedServiceToAddInNewAppointment ? (
              <button
                type="button"
                className="w-full -mx-2 flex flex-row gap-4 items-center bg-white p-2 rounded-xl active:inner-w-8"
                onClick={() => {
                  setAddServiceInNewAppointmentIsOpen(true);
                  // setEditSelectedNewServiceIsOpen(true);
                }}
              >
                <div className="h-[70px] w-[4px] bg-purple-300 rounded-full" />
                <div className="flex flex-col w-full">
                  <div className="flex flex-row gap-4 justify-between">
                    <h3 className="text-xl font-normal">{selectedServiceToAddInNewAppointment.name}</h3>
                    <h3 className="text-xl font-normal">
                      {formatPriceInFarsi(selectedServiceToAddInNewAppointment.price)}
                    </h3>
                  </div>
                  <p className="text-lg font-normal text-gray-500 text-start">
                    <span>{toFarsiDigits(format(newAppointmentTime, "HH:mm"))}</span>
                    <span className="text-xl mx-2 inline-block translate-y-[1px]">•</span>
                    <span>{selectedServiceToAddInNewAppointment.formattedDuration}</span>
                    {selectedEmployeeForNewAppointment && (
                      <>
                        <span className="text-xl mx-2 inline-block translate-y-[1px]">•</span>
                        <span>{selectedEmployeeForNewAppointment.nickname}</span>
                      </>
                    )}
                  </p>
                </div>
              </button>
            ) : (
              <div className="mt-4 flex flex-col justify-between items-center rounded-lg border border-gray-200 py-7 px-16">
                <img src="/service.png" className="w-16 h-16" />
                <p className="text-lg text-gray-500 text-center mt-4">
                  برای ذخیره‌ی این نوبت یک سرویس اضافه کنید
                </p>
                <button
                  className="mt-6 flex flex-row rounded-full px-4 py-2 gap-2 border border-gray-300"
                  type="button"
                  onClick={() => setAddServiceInNewAppointmentIsOpen(true)}
                >
                  <img src="/circular-plus.svg" className="w-6 h-6" />
                  <span className="text-lg font-normal">افزودن سرویس</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex sticky w-[100vw] -mx-5 bottom-0 bg-white border-t py-5 px-5">
          <div className="relative w-full me-2.5">
            <button
              type="button"
              onClick={() => {
                setAddAppointmentModalIsOpen(false);
              }}
              className="w-full p-3 bg-white text-black border rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300"
            >
              بستن
            </button>
          </div>
          <div className="relative w-full">
            <button
              type="button"
              disabled={!selectedServiceToAddInNewAppointment || !selectedEmployeeForNewAppointment}
              onClick={() => {
                if (!selectedServiceToAddInNewAppointment || !selectedEmployeeForNewAppointment) {
                  toast.error("ابتدا یک سرویس انتخاب کنید", {
                    duration: 5000,
                    position: "top-center",
                    className: "w-full font-medium",
                  });
                  return;
                }

                createReservation({
                  customerId: newAppointmentCustomer ? newAppointmentCustomer.id : undefined,
                  startDateTime: setMinutes(
                    setHours(currentDate, newAppointmentTime.getHours()),
                    newAppointmentTime.getMinutes(),
                  ).toISOString(),
                  cartInput: [
                    {
                      serviceId: selectedServiceToAddInNewAppointment.id,
                      employeeAssociations: [selectedEmployeeForNewAppointment.id],
                    },
                  ],
                }).then(({ data, response }) => {
                  if (response.status === 201 && calendarRef.current) {
                    calendarRef.current.getApi().addEvent({
                      id: data.id,
                      title: selectedServiceToAddInNewAppointment.name,
                      start: data.startDateTime,
                      end: data.endDateTime,
                      editable: true,
                      resourceId: selectedEmployeeForNewAppointment.id,
                    });
                    toast.success(
                      `نوبت «${selectedServiceToAddInNewAppointment.name}» با متخصص «${selectedEmployeeForNewAppointment.nickname}» در «${toFarsiDigits(format(currentDate, "EEEE، d MMMM y"))}» اضافه شد.`,
                      {
                        duration: 5000,
                        position: "top-center",
                        className: "w-full font-medium",
                      },
                    );
                    setAddAppointmentModalIsOpen(false);
                    calendarRef.current.getApi().gotoDate(currentDate);
                  } else {
                    response.text().then((error) => {
                      console.log(error);
                    });
                    console.log(response.status);
                  }
                });
              }}
              className={`w-full p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 ${selectedServiceToAddInNewAppointment ? "bg-black" : "bg-gray-300 active:transform-none active:filter-none"}`}
            >
              ذخیره
            </button>
          </div>
        </div>

        <BottomSheet
          isOpen={selectDateInAddAppointmentModalBSIsOpen}
          onClose={() => {
            setSelectDateInAddAppointmentModalBSIsOpen(false);
          }}
        >
          <DatePicker
            selectedDate={currentDate}
            onDateSelect={(date) => {
              if (calendarRef.current) {
                calendarRef.current.getApi().gotoDate(date)
                setCurrentDate(date);
                setSelectDateInAddAppointmentModalBSIsOpen(false);
              }
            }}
          />
          <div className="mt-9">
            <button
              type="button"
              className={"px-5 py-2 text-xl border rounded-full me-1"}
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectDateInAddAppointmentModalBSIsOpen(false);
              }}
            >
              امروز
            </button>
            <button
              type="button"
              className={"px-5 py-2 text-xl border rounded-full me-1"}
              onClick={() => {
                const tomorrow = addDays(new Date(), 1);
                setCurrentDate(tomorrow);
                setSelectDateInAddAppointmentModalBSIsOpen(false);
              }}
            >
              فردا
            </button>
          </div>
        </BottomSheet>

        <BottomSheet
          isOpen={selectTimeInAddAppointmentModalBSIsOpen}
          onClose={() => {
            setSelectTimeInAddAppointmentModalBSIsOpen(false);
          }}
          title="زمان شروع"
        >
          <ul>
            {Array.from({ length: 24 * 4 }, (_, i) => addMinutes(startOfDay(new Date()), i * 15)).map(
              (time) =>
                format(time, "HH:mm") === format(newAppointmentTime, "HH:mm") ? (
                  <li
                    key={time.toISOString()}
                    className="flex flex-row content-start px-2 justify-between items-center text-2xl py-4 text-left"
                    onClick={() => {
                      setNewAppointmentTime(time);
                      setSelectTimeInAddAppointmentModalBSIsOpen(false);
                    }}
                  >
                    <img src="/check.svg" className="invert" />
                    <p>{toFarsiDigits(format(time, "HH:mm"))}</p>
                  </li>
                ) : (
                  <li
                    key={time.toISOString()}
                    className="flex flex-row content-start px-2 justify-end items-center text-2xl py-4 text-left"
                    onClick={() => {
                      setNewAppointmentTime(time);
                      setSelectTimeInAddAppointmentModalBSIsOpen(false);
                    }}
                  >
                    <p>{toFarsiDigits(format(time, "HH:mm"))}</p>
                  </li>
                ),
            )}
          </ul>
        </BottomSheet>
      </Modal>

      {location && (
        <Modal
          isOpen={addServiceInNewAppointmentIsOpen}
          onClose={() => setAddServiceInNewAppointmentIsOpen(false)}
          title={<span className="text-3xl font-bold">انتخاب سرویس</span>}
          topBarTitle={<span className="text-xl font-bold">انتخاب سرویس</span>}
        >
          <div className="pb-12">
            <div className="-mx-5 mt-2 mb-6">
              <hr />
            </div>
            <div className="flex flex-col gap-8">
              {location.serviceCatalog.map((category) => (
                <div key={category.id}>
                  <div className="flex flex-row gap-3">
                    <h2 className="text-2xl font-medium mb-4">{category.name}</h2>
                    <div className="w-6 h-6 flex items-center justify-center text-md bg-gray-200 text-gray-500 rounded-full font-bold">
                      <span className="translate-y-[2px]">{toFarsiDigits(category.items.length)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {category.items.map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        className="-mx-2 flex flex-row gap-4 items-center bg-white p-2 rounded-xl active:inner-w-8"
                        onClick={() => {
                          setSelectedServiceToAddInNewAppointment(svc);
                          setSelectEmployeeBSIsOpen(true);
                          fetchAvailableEmployeesByService(svc.id).then(({ data }) => {
                            setAvailableEmployeesByService(data);
                          });
                        }}
                      >
                        <div className="h-[70px] w-[4px] bg-purple-300 rounded-full" />
                        <div className="flex flex-col w-full">
                          <div className="flex flex-row gap-4 justify-between">
                            <h3 className="text-xl font-normal">{svc.name}</h3>
                            <h3 className="text-xl font-normal">{formatPriceInFarsi(svc.price)}</h3>
                          </div>
                          <p className="text-lg font-normal text-gray-500 text-start">
                            {svc.formattedDuration}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={createCustomerModalIsOpen}
        onClose={() => setCreateCustomerModalIsOpen(false)}
        title="انتخاب مشتری"
      >
        <hr className="-mx-5" />
        <ul className="-mx-5">
          <li>
            <button className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5">
              <div className="h-16 w-16 flex items-center justify-center bg-purple-100 rounded-full">
                <img src="/plus-purple.svg" className="w-7 h-7" />
              </div>
              <p className="font-medium text-lg">افزودن مشتری جدید</p>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5"
              onClick={() => {
                setNewAppointmentCustomer(null);
                setCreateCustomerModalIsOpen(false);
              }}
            >
              <div className="h-16 w-16 flex items-center justify-center bg-purple-100 rounded-full">
                <img src="/walk-in.svg" className="w-8 h-8" />
              </div>
              <p className="font-medium text-lg">مراجعه‌‌کننده‌ی حضوری</p>
            </button>
          </li>
        </ul>
        {clients.length > 0 && (
          <>
            <hr />
            <ul className="-mx-5">
              {clients.map((customer) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5"
                    onClick={() => {
                      setNewAppointmentCustomer(customer);
                      setCreateCustomerModalIsOpen(false);
                    }}
                  >
                    <div className="h-16 w-16 flex items-center justify-center bg-purple-100 rounded-full">
                      <img src="/person-purple.svg" className="w-7 h-7" />
                    </div>
                    <p className="font-medium text-lg" style={{ direction: "ltr" }}>
                      {toFarsiDigits(
                        `${customer.user.username.slice(0, 3)} ${customer.user.username.slice(3, 6)} ${customer.user.username.slice(6, 9)} ${customer.user.username.slice(9)}`,
                      )}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>

      <BottomSheet
        isOpen={selectEmployeeBSIsOpen}
        onClose={() => {
          setSelectEmployeeBSIsOpen(false);
          setAvailableEmployeesByService(undefined);
        }}
        title="انتخاب متخصص"
      >
        <div
          className={`flex gap-4 overflow-x-auto -mx-5 px-5${availableEmployeesByService ? "" : " animate-pulse"}`}
          style={{ scrollbarWidth: "none" }}
        >
          {availableEmployeesByService ? (
            availableEmployeesByService.employees.map((employee) => (
              <Tile
                key={employee.id}
                employee={employee}
                selectedEmployeeId={"none"}
                onTileChange={(employee) => {
                  setSelectedEmployeeForNewAppointment(employee);
                  setSelectEmployeeBSIsOpen(false);
                  setAddServiceInNewAppointmentIsOpen(false);
                }}
              />
            ))
          ) : (
            <>
              <div
                className={
                  "flex justify-center h-[196px] pt-12 pb-7 px-9 min-w-[168px] cursor-pointer border-2 rounded-lg border-gray-200"
                }
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-[60px] h-[60px] rounded-full mb-6 bg-gray-200" />
                  <div className="w-[100px] h-[14px] rounded-full bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-2 bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-4 bg-gray-200" />
                </div>
              </div>
              <div
                className={
                  "flex justify-center h-[196px] pt-12 pb-7 px-9 min-w-[168px] cursor-pointer border-2 rounded-lg border-gray-200"
                }
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-[60px] h-[60px] rounded-full mb-6 bg-gray-200" />
                  <div className="w-[100px] h-[14px] rounded-full bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-2 bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-4 bg-gray-200" />
                </div>
              </div>
              <div
                className={
                  "flex justify-center h-[196px] pt-12 pb-7 px-9 min-w-[168px] cursor-pointer border-2 rounded-lg border-gray-200"
                }
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-[60px] h-[60px] rounded-full mb-6 bg-gray-200" />
                  <div className="w-[100px] h-[14px] rounded-full bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-2 bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-4 bg-gray-200" />
                </div>
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  ) : (
    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none">
      <svg
        aria-hidden="true"
        className="w-20 h-20 text-gray-200 animate-spin fill-black"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
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
