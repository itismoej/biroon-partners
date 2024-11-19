"use client";

import { AddAppointmentModal } from "@/app/Components/AddAppointmentModal";
import { BottomSheet } from "@/app/Components/BottomSheet";
import { CalendarFooter } from "@/app/Components/CalendarFooter";
import { CalendarHeader } from "@/app/Components/CalendarHeader";
import { ServicesSection } from "@/app/Components/ServicesSection";
import type { CanSwipeDirection } from "@/app/Components/SwipeComponent";
import { SwipeComponent } from "@/app/Components/SwipeComponent";
import type {
  CalendarEvent,
  CalendarEventPatchRequest,
  Category,
  Customer,
  Employee,
  Location,
  Service,
  ServiceCategory,
} from "@/app/api";
import {
  fetchAllEmployees,
  fetchAllEvents,
  fetchCategories,
  fetchCustomers,
  fetchLocation,
  fetchServiceCategories,
  updateEvent,
} from "@/app/api";
import { toFarsiDigits } from "@/app/utils";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import { addDays, format } from "date-fns-jalali";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { DatePicker } from "./Components/DatePicker";
import { Modal } from "./Components/Modal";
import "./calendar.css";
import { AddNewServiceCategoryBottomSheet } from "@/app/Components/AddNewServiceCategoryBottomSheet";
import { AddNewServiceModal } from "@/app/Components/AddNewServiceModal";
import { goToNow } from "@/app/calendarUtils";
import type { EventContentArg, EventDropArg } from "@fullcalendar/core";
import type { ResourceApi } from "@fullcalendar/resource";

const generateDurations = () => {
  const durations = [];
  for (let i = 5; i <= 720; i += 5) {
    let label = "";
    if (i < 60) {
      label = `${i} دقیقه`;
    } else if (i % 60 === 0) {
      if (i === 60) label = `${i / 60} ساعت`;
      else label = `${i / 60} ساعت`;
    } else {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;
      label = `${hours} ساعت و ${minutes} دقیقه`;
    }
    durations.push({ value: i, label: toFarsiDigits(label) });
  }
  return durations;
};

const durations = generateDurations();

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

const LoadingSpinner: React.FC = () => (
  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none">
    <svg
      aria-hidden="true"
      className="w-20 h-20 text-gray-200 animate-spin fill-black"
      viewBox="0 0 100 101"
      fill="none"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.0830 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
  </div>
);

interface EditingIndicatorProps {
  editingEvents: Array<EventDropArg | EventResizeDoneArg>;
  currentDate: Date;
}

const EditingIndicator: React.FC<EditingIndicatorProps> = ({ editingEvents, currentDate }) => {
  if (editingEvents.length === 0) return null;

  return (
    <div className="fixed flex w-[97%] max-w-[500px] left-1/2 -translate-x-1/2 flex-row justify-between items-center z-50 top-2 rounded-md py-3 px-3 bg-purple-600 text-white font-light text-center text-xl">
      <h2 className="z-50 text-2xl font-bold">{toFarsiDigits(format(currentDate, "EEEE، d MMMM y"))}</h2>
      <h2 className="animate-pulse">حالت ویرایش</h2>
    </div>
  );
};

interface SaveCancelButtonsProps {
  isVisible: boolean;
  editingEvents: Array<EventDropArg | EventResizeDoneArg>;
  setEditingEvents: React.Dispatch<React.SetStateAction<Array<EventDropArg | EventResizeDoneArg>>>;
  calendarRef: React.RefObject<FullCalendar>;
}

const SaveCancelButtons: React.FC<SaveCancelButtonsProps> = ({
  isVisible,
  editingEvents,
  setEditingEvents,
  calendarRef,
}) => {
  if (!isVisible) return null;

  return (
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
            const uniqueEventsMap = new Map<string, CalendarEventPatchRequest>();

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

            const updatePromises: [string, ReturnType<typeof updateEvent>][] = Array.from(
              uniqueEventsMap.entries(),
            ).map(([id, updateData]) => [id, updateEvent(id, updateData)]);

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
  const [addAppointmentModalIsOpen, setAddAppointmentModalIsOpen] = useState(false);
  const [clients, setClients] = useState<Customer[]>([]);
  const [location, setLocation] = useState<Location | undefined>();
  const [selectDateInCalendarBSIsOpen, setSelectDateInCalendarBSIsOpen] = useState<boolean>(false);
  const [servicesModalIsOpen, setServicesModalIsOpen] = useState(false);
  const [addNewServicesModalIsOpen, setAddNewServicesModalIsOpen] = useState(false);
  const [addNewServiceCategoryBSIsOpen, setAddNewServiceCategoryBSIsOpen] = useState(false);
  const [addNewServiceOrServiceCategoryBSIsOpen, setAddNewServiceOrServiceCategoryBSIsOpen] = useState(false);
  const [editingServiceInServicesPage, setEditingServiceInServicesPage] = useState<Service>();
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [page, setPage] = useState(0);

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

    fetchCategories().then(({ data, response }) => {
      if (response.status !== 200)
        toast.error("دریافت لیست سرویس‌های قابل انتخاب", {
          duration: 5000,
          position: "bottom-center",
          className: "w-full font-medium",
        });
      else setAvailableCategories(data);
    });

    fetchServiceCategories().then(({ data, response }) => {
      if (response.status !== 200)
        toast.error("دریافت منوی کاتالوگ شما با خطا مواجه شد", {
          duration: 5000,
          position: "bottom-center",
          className: "w-full font-medium",
        });
      else setServiceCategories(data);
    });
  }, []);

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

  const resources = useMemo(
    () =>
      allEmployees.map((employee) => ({
        id: employee.id,
        title: employee.nickname || employee.user.name,
        avatar: employee.user.avatar.url,
        businessHours: employee.businessHours.map((i) => ({
          daysOfWeek: [i.weekday],
          startTime: i.startTime,
          endTime: i.endTime,
        })),
      })),
    [allEmployees],
  );

  const initialEvents = useMemo(
    () =>
      allEvents.map((event) => ({
        id: event.id,
        title: event.service.name,
        start: event.startDateTime,
        end: event.endDateTime,
        editable: true,
        resourceId: event.employee.id,
      })),
    [allEvents],
  );

  const ANIMATION_DURATION = 300;

  if (resources.length <= 0) return <LoadingSpinner />;

  return (
    <div className="relative overflow-x-clip">
      <CalendarHeader
        page={page}
        currentDate={currentDate}
        setSelectDateInCalendarBSIsOpen={setSelectDateInCalendarBSIsOpen}
      />

      {page === 0 ? (
        <div
          className={`pb-[60px] relative calendar-container ${isAnimating ? "animating" : ""}`}
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
                  setTimeout(() => goToNow("smooth"), 100);
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
                if (info.resource.extendedProps.avatar) {
                  const avatar = document.createElement("img");
                  avatar.src = info.resource.extendedProps.avatar;
                  avatar.className = "w-8 h-8 rounded-full mx-auto border-2 border-gray-300 mt-2";
                  info.el.prepend(avatar);
                } else {
                  const avatar = document.createElement("div");
                  avatar.className =
                    "w-8 h-8 text-xs flex items-center justify-center font-normal rounded-full mx-auto border-2 bg-purple-100 border-gray-300 mt-2";
                  avatar.innerText = info.resource.title.slice(0, 2);
                  info.el.prepend(avatar);
                }
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
      ) : page === 1 ? (
        "sales"
      ) : page === 2 ? (
        "clients"
      ) : page === 3 ? (
        <div className="p-5 bg-gray-100" style={{ minHeight: "calc(100dvh - 119px)" }}>
          <div className="py-5 grid grid-cols-2 gap-3">
            <button
              className={
                "relative bg-white border rounded-xl flex flex-col gap-4 items-start justify-between text-right px-6 py-5"
              }
              onClick={() => {
                setServicesModalIsOpen(true);
              }}
            >
              <NextImage width={24} height={24} alt="سرویس‌ها" src="/catalog.svg" />
              <p className="text-lg font-medium">سرویس‌ها</p>
            </button>
            <button
              className={
                "relative bg-white border rounded-xl flex flex-col gap-4 items-start justify-between text-right px-6 py-5"
              }
            >
              <NextImage width={24} height={24} alt="تیم متخصصان" src="/team.svg" />
              <p className="text-lg font-medium">تیم متخصصان</p>
            </button>
            <button
              className={
                "relative bg-white border rounded-xl flex flex-col gap-4 items-start justify-between text-right px-6 py-5"
              }
            >
              <NextImage width={24} height={24} alt="پرداخت‌ها" src="/payments.svg" />
              <p className="text-lg font-medium">پرداخت‌ها</p>
            </button>
          </div>
          <Modal
            isOpen={servicesModalIsOpen}
            onClose={() => {
              setServicesModalIsOpen(false);
            }}
            title={
              <div className="-mt-4">
                <h1 className="text-3xl">منوی سرویس‌ها</h1>
                <p className="text-lg font-normal text-gray-500">
                  مشاهده و مدیریت سرویس‌هایی که در کسب‌و‌کار شما ارائه می‌شود.
                </p>
              </div>
            }
            topBarTitle={<h2 className="text-xl font-bold">منوی سرویس‌ها</h2>}
            leftBtn={
              <button
                className="bg-black px-3 py-2 text-white text-lg rounded-lg font-bold flex flex-row gap-2 items-center justify-center"
                onClick={() => {
                  setAddNewServiceOrServiceCategoryBSIsOpen(true);
                }}
              >
                <NextImage src="/plus-white.svg" alt="افزودن سرویس" width={20} height={20} />
                افزودن
              </button>
            }
          >
            {location && (
              <>
                <ServicesSection
                  location={location}
                  serviceOnClick={(svc) => {
                    setEditingServiceInServicesPage(svc);
                  }}
                />
                <BottomSheet
                  isOpen={editingServiceInServicesPage !== undefined}
                  onClose={() => setEditingServiceInServicesPage(undefined)}
                  title={editingServiceInServicesPage?.name}
                >
                  <div className="-mt-6 -mx-3">
                    <ul className="flex flex-col">
                      <li>
                        <button
                          className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl"
                          onClick={() => {}}
                        >
                          <p className="text-lg font-medium">ویرایش</p>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl"
                          onClick={() => {}}
                        >
                          <p className="text-lg text-red-600 font-medium">حذف دائمی (غیر قابل بازگشت)</p>
                        </button>
                      </li>
                    </ul>
                  </div>
                </BottomSheet>
              </>
            )}
          </Modal>
          <BottomSheet
            isOpen={addNewServiceOrServiceCategoryBSIsOpen}
            onClose={() => setAddNewServiceOrServiceCategoryBSIsOpen(false)}
          >
            <div className="flex flex-col items-start gap-8">
              <button
                className="flex flex-row justify-between items-center text-xl font-normal"
                onClick={() => {
                  setAddNewServiceOrServiceCategoryBSIsOpen(false);
                  setAddNewServicesModalIsOpen(true);
                }}
              >
                افزودن سرویس جدید
              </button>
              <button
                className="flex flex-row justify-between items-center text-xl font-normal"
                onClick={() => {
                  setAddNewServiceOrServiceCategoryBSIsOpen(false);
                  setAddNewServiceCategoryBSIsOpen(true);
                }}
              >
                افزودن دسته‌بندی جدید در منو
              </button>
            </div>
          </BottomSheet>
          <AddNewServiceModal
            isOpen={addNewServicesModalIsOpen}
            onClose={() => setAddNewServicesModalIsOpen(false)}
            allEmployees={allEmployees}
            setLocation={setLocation}
            availableCategories={availableCategories}
            serviceCategories={serviceCategories}
            durations={durations}
          />
          <AddNewServiceCategoryBottomSheet
            isOpen={addNewServiceCategoryBSIsOpen}
            onClose={() => setAddNewServiceCategoryBSIsOpen(false)}
          />
        </div>
      ) : null}

      <CalendarFooter setPage={setPage} calendarRef={calendarRef} setActionsBSIsOpen={setActionsBSIsOpen} />

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

      <EditingIndicator editingEvents={editingEvents} currentDate={currentDate} />

      <SaveCancelButtons
        isVisible={isVisible}
        editingEvents={editingEvents}
        setEditingEvents={setEditingEvents}
        calendarRef={calendarRef}
      />

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
              calendarRef.current.getApi().gotoDate(date);
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
              if (calendarRef.current) {
                const today = new Date();
                calendarRef.current.getApi().gotoDate(today);
                setCurrentDate(today);
                setSelectDateInCalendarBSIsOpen(false);
              }
            }}
          >
            امروز
          </button>
          <button
            type="button"
            className={"px-5 py-2 text-xl border rounded-full me-1"}
            onClick={() => {
              if (calendarRef.current) {
                const tomorrow = addDays(new Date(), 1);
                calendarRef.current.getApi().gotoDate(tomorrow);
                setCurrentDate(tomorrow);
                setSelectDateInCalendarBSIsOpen(false);
              }
            }}
          >
            فردا
          </button>
        </div>
      </BottomSheet>

      <AddAppointmentModal
        isOpen={addAppointmentModalIsOpen}
        onClose={() => setAddAppointmentModalIsOpen(false)}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        clients={clients}
        calendarRef={calendarRef}
        location={location}
      />
    </div>
  );
}
