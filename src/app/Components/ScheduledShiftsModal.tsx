import { BottomSheet, BottomSheetFooter } from "@/app/Components/BottomSheet";
import { MenuPopup } from "@/app/Components/MenuPopup";
import { Modal } from "@/app/Components/Modal";
import { WeekPicker } from "@/app/Components/WeekPicker";
import {type Employee, type EmployeeWorkingDays, fetchShifts, WorkingDay} from "@/app/api";
import { toFarsiDigits, useShallowRouter } from "@/app/utils";
import { endOfWeek, format, parseISO, startOfWeek } from "date-fns-jalali";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

function computeWeeklyHours(emp: Employee): number {
  return emp.businessHours.reduce((total, bh) => {
    const [startHour, startMinute] = bh.startTime.split(":").map(Number);
    const [endHour, endMinute] = bh.endTime.split(":").map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    const duration = (end - start) / 60;
    return total + duration;
  }, 0);
}

interface ScheduledShiftsModalProps {
  allEmployees: Employee[];
  setAllEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export function ScheduledShiftsModal({ allEmployees }: ScheduledShiftsModalProps) {
  const pathname = usePathname();
  const shallowRouter = useShallowRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(new Date());
  const [selectingWeekBSIsOpen, setSelectingWeekBSIsOpen] = useState(false);
  const [openEmployeeIds, setOpenEmployeeIds] = useState<Employee["id"][]>([]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 6 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 6 });

  const formattedWeekRange =
    format(weekStart, "MMMM") === format(weekEnd, "MMMM")
      ? `${toFarsiDigits(format(weekStart, "dd"))} - ${toFarsiDigits(format(weekEnd, "dd MMMM"))}`
      : `${toFarsiDigits(format(weekStart, "dd MMMM"))} - ${toFarsiDigits(format(weekEnd, "dd MMMM"))}`;

  const toggleEmployee = (id: string) => {
    setOpenEmployeeIds((prevState) =>
      prevState.includes(id) ? prevState.filter((empId) => empId !== id) : [...prevState, id],
    );
  };

  const [shifts, setShifts] = useState<EmployeeWorkingDays[]>([]);
  const weekStartISO = weekStart.toISOString();

  useEffect(() => {
    fetchShifts(weekStart).then(({ data, response }) => {
      if (response.status !== 200) {
        toast.error("دریافت لیست شیفت‌ها با خطا مواجه شد", {
          duration: 5000,
          position: "top-center",
          className: "w-full font-medium",
        });
      } else {
        setShifts(data.shifts);
      }
    });
  }, [weekStartISO]);

  const [editingWorkingDay, setEditingWorkingDay] = useState<{employeeWorkingDays: EmployeeWorkingDays, workingDay: WorkingDay}>()

  return (
    <Modal
      isOpen={pathname.startsWith("/team/scheduled-shifts")}
      onClose={() => {
        setTimeout(() => {
          setCurrentDate(new Date());
        }, 500);
        setTimeout(() => {
          setInternalSelectedDate(new Date());
        }, 500);
        shallowRouter.push("/team");
      }}
      title="شیفت‌های هفتگی"
      topBarTitle={<h1 className="text-xl font-bold">شیفت‌ها</h1>}
      leftBtn={
        <button
          className="flex flex-row items-center"
          type="button"
          onClick={() => {
            setSelectingWeekBSIsOpen(true);
          }}
        >
          <h1 className="font-bold text-lg">{formattedWeekRange}</h1>
          <NextImage width={20} height={20} alt="انتخاب هفته" src="/dropdown.svg" />
        </button>
      }
    >
      <div className="flex flex-col divide-y">
        {allEmployees.map((emp) => (
          <div key={emp.id}>
            <button
              className="flex flex-row bg-white py-4 justify-between items-center w-full focus active:transform-none active:filter-none"
              onClick={() => toggleEmployee(emp.id)}
            >
              <div className="flex flex-row items-center gap-4">
                {emp.user.avatar?.url ? (
                  <NextImage
                    width={60}
                    height={60}
                    alt={emp.nickname}
                    src={emp.user.avatar.url}
                    className="rounded-full border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-[60px] h-[60px] border-2 border-gray-300 rounded-full flex items-center justify-center text-md font-bold bg-purple-100 text-purple-700">
                    {emp.nickname.slice(0, 2)}
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="text-lg font-medium">{emp.nickname}</span>
                  <span className="font-normal text-gray-500 text-sm">
                    {toFarsiDigits(computeWeeklyHours(emp))} ساعت
                  </span>
                </div>
              </div>
              <NextImage
                src="/dropdown.svg"
                alt="Toggle"
                width={20}
                height={20}
                className={`transform transition-transform ${openEmployeeIds.includes(emp.id) ? "" : "rotate-180"}`}
              />
            </button>
            {openEmployeeIds.includes(emp.id) && (
              <div className="px-4 py-2 bg-gray-50">
                <div className="flex flex-col divide-y -mx-4">
                  {shifts
                    .filter(({ employee }) => employee.id === emp.id)
                    .map((empWorkingDays) => {
                      return empWorkingDays.workingDays.map((workingDay) => {
                        return (
                          <button
                            key={`${workingDay.day}-${workingDay.workingHours[0]?.startTime || 1}`}
                            className="flex flex-row justify-between items-center py-5 -mx-5 px-5 bg-white active:transform-none"
                            onClick={() => {
                              setEditingWorkingDay({employeeWorkingDays: empWorkingDays, workingDay})
                            }}
                          >
                            <p className="text-lg font-medium">
                              {toFarsiDigits(format(parseISO(workingDay.day), "EEEE، dd MMMM"))}
                            </p>
                            <div className="flex flex-col gap-2">
                              {workingDay.workingHours.length > 0 ? (
                                workingDay.workingHours.map(({ startTime, endTime }) => (
                                  <div
                                    className="border border-purple-300 text-lg py-1 px-3 bg-purple-100 rounded-full"
                                    key={`${startTime}-${endTime}`}
                                    style={{ direction: "ltr" }}
                                  >
                                    {toFarsiDigits(format(parseISO(startTime), "HH:mm"))} -{" "}
                                    {toFarsiDigits(format(parseISO(endTime), "HH:mm"))}
                                  </div>
                                ))
                              ) : (
                                <div
                                  className="border text-lg py-1 px-3 rounded-full"
                                  style={{ direction: "ltr" }}
                                >
                                  کار نمی‌کند
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      });
                    })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <MenuPopup isOpen={editingWorkingDay !== undefined} onClose={() => setEditingWorkingDay(undefined)}>
        {editingWorkingDay && (
          <div className="flex flex-col">
            <div className="flex flex-col gap-1 items-center justify-center my-6">
              <NextImage
                className="rounded-full border-2 border-gray-300"
                src={editingWorkingDay.employeeWorkingDays.employee.user.avatar.url || ""}
                alt={editingWorkingDay.employeeWorkingDays.employee.nickname || ""}
                width={70}
                height={70}
              />
              <h2 className="text-xl font-bold">{editingWorkingDay.employeeWorkingDays.employee.nickname}</h2>
              <h2 className="font-normal">
                {toFarsiDigits(format(parseISO(editingWorkingDay.workingDay.day), "EEEE، dd MMMM"))}
              </h2>
            </div>
            <div className="flex flex-col divide-y">
              {editingWorkingDay.workingDay.workingHours.length > 0 ? (
                <button className="flex flex-row justify-between p-5 bg-white active:transform-none">
                  <p className="text-lg font-semibold">ویرایش این روز</p>
                  <NextImage src="/pen.svg" alt="ویرایش این روز" width={24} height={24}/>
                </button>
              ) : null}
              {editingWorkingDay.workingDay.workingHours.length === 0 ? (
                <button className="flex flex-row justify-between p-5 bg-white active:transform-none">
                  <p className="text-lg font-semibold">افزودن زمان کاری</p>
                  <NextImage src="/plus.svg" alt="افزودن زمان کاری" width={24} height={24}/>
                </button>
              ) : null}
              <button className="flex flex-row justify-between p-5 bg-white active:transform-none">
                <p className="text-lg font-semibold">تنظیم شیفت هفتگی</p>
                <NextImage src="/time.svg" alt="تنظیم شیفت هفتگی" width={24} height={24}/>
              </button>
              <button className="flex flex-row justify-between p-5 bg-white active:transform-none rounded-b-2xl">
                <p className="text-lg font-semibold">افزودن مرخصی یا زمان غیر کاری</p>
                <NextImage src="/calendar-cross.svg" alt="افزودن مرخصی یا زمان غیر کاری" width={24} height={24}/>
              </button>
              {editingWorkingDay.workingDay.workingHours.length > 0 ? (
                <button className="flex flex-row justify-between p-5 bg-white active:transform-none rounded-b-2xl">
                  <p className="text-lg text-red-500 font-semibold">حذف این روز</p>
                  <NextImage src="/delete.svg" alt="حذف این روز" width={24} height={24}/>
                </button>
              ) : null}
            </div>
          </div>
        )}
      </MenuPopup>
      <BottomSheet
        isOpen={selectingWeekBSIsOpen}
        onClose={() => {
          setSelectingWeekBSIsOpen(false);
        }}
        title="انتخاب هفته"
      >
        <WeekPicker
          selectedDate={internalSelectedDate}
          onWeekSelect={(startDate) => {
            setInternalSelectedDate(startDate);
          }}
        />
        <BottomSheetFooter
          onClose={() => {
            setInternalSelectedDate(currentDate);
            setSelectingWeekBSIsOpen(false);
          }}
          onSelect={() => {
            setCurrentDate(internalSelectedDate);
            setSelectingWeekBSIsOpen(false);
          }}
        />
      </BottomSheet>
    </Modal>
  );
}
