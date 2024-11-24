import { BottomSheet, BottomSheetFooter } from "@/app/Components/BottomSheet";
import { Modal } from "@/app/Components/Modal";
import { WeekPicker } from "@/app/Components/WeekPicker";
import type { Employee } from "@/app/api";
import { toFarsiDigits, useShallowRouter } from "@/app/utils";
import { endOfWeek, format, startOfWeek } from "date-fns-jalali";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";

const WEEK_DAYS = {
  0: 'یک‌شنبه',
  1: 'دوشنبه',
  2: 'سه‌شنبه',
  3: 'چهارشنبه',
  4: 'پنج‌شنبه',
  5: 'جمعه',
  6: 'شنبه',
}

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
                  <span className="font-normal text-gray-500 text-sm">{toFarsiDigits(computeWeeklyHours(emp))} ساعت</span>
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
                  {emp.businessHours.map((businessHour) => (
                    <p key={`${emp.id}-${businessHour.weekday}-${businessHour.startTime}`}>
                      {WEEK_DAYS[businessHour.weekday]} {businessHour.startTime} - {businessHour.endTime}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
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
