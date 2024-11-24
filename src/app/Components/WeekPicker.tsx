import { toFarsiDigits } from "@/app/utils";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns-jalali";
import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";
import type React from "react";

type WeekPickerProps = {
  selectedDate?: Date | undefined;
  onWeekSelect?: (startDate: Date, endDate: Date) => void;
  isDateDisabled?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
};

export const WeekPicker: React.FC<WeekPickerProps> = ({
  selectedDate,
  onWeekSelect,
  isDateDisabled,
  minDate,
  maxDate,
}) => {
  const today = useMemo(() => addDays(new Date(), 0), []);
  const [currentViewingDate, setCurrentViewingDate] = useState(new Date());
  const [selectedWeekStartDate, setSelectedWeekStartDate] = useState<Date | undefined>(undefined);
  const [selectedWeekEndDate, setSelectedWeekEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setSelectedWeekStartDate(undefined);
    setSelectedWeekEndDate(undefined);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 6 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 6 });
      setSelectedWeekStartDate(weekStart);
      setSelectedWeekEndDate(weekEnd);
    } else {
      setSelectedWeekStartDate(undefined);
      setSelectedWeekEndDate(undefined);
    }
  }, [selectedDate]);

  const isDisabled = (date: Date) => {
    if (isDateDisabled?.(date)) {
      return true;
    }
    if (minDate && date < minDate) {
      return true;
    }
    if (maxDate && date > maxDate) {
      return true;
    }
    return getMonth(date) !== getMonth(currentViewingDate);
  };

  const handlePrevMonth = () => {
    setCurrentViewingDate(addMonths(currentViewingDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentViewingDate(addMonths(currentViewingDate, 1));
  };

  const handleDateClick = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 6 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 6 });
    setSelectedWeekStartDate(weekStart);
    setSelectedWeekEndDate(weekEnd);
    if (onWeekSelect) onWeekSelect(weekStart, weekEnd);
  };

  const startOfMonthDate = startOfMonth(currentViewingDate);
  const endOfMonthDate = endOfMonth(currentViewingDate);
  const calendarStartDate = startOfWeek(startOfMonthDate, { weekStartsOn: 6 });
  const calendarEndDate = endOfWeek(endOfMonthDate, { weekStartsOn: 6 });
  const daysInCalendar = eachDayOfInterval({ start: calendarStartDate, end: calendarEndDate });

  const renderDays = () => {
    return daysInCalendar.map((day) => {
      const key = day.toISOString();

      // const currentSelectedDate = selectedDate !== undefined ? selectedDate : internalSelectedDate;
      const isToday = isSameDay(day, today);
      const disabled = isDisabled(day);

      const isStartOfSelectedWeek = selectedWeekStartDate && isSameDay(day, selectedWeekStartDate);
      const isEndOfSelectedWeek = selectedWeekEndDate && isSameDay(day, selectedWeekEndDate);
      const isInSelectedWeek =
        selectedWeekStartDate &&
        selectedWeekEndDate &&
        isWithinInterval(day, { start: selectedWeekStartDate, end: selectedWeekEndDate });

      const spanClass = `rounded-full flex justify-center items-center w-12 min-w-12 h-12 font-normal text-[1.2rem] ${
        isStartOfSelectedWeek || isEndOfSelectedWeek
          ? "bg-black text-white rounded-full"
          : isInSelectedWeek
            ? "text-black"
            : ""
      } ${disabled ? "text-gray-400 cursor-default" : "cursor-pointer"}`;

      const spanStyle = isToday
        ? {
            boxShadow: `inset 0 0 0 1px ${
              isStartOfSelectedWeek || isEndOfSelectedWeek ? "white" : "black"
            }, 0 0 0 2px ${isStartOfSelectedWeek || isEndOfSelectedWeek ? "black" : "transparent"}`,
          }
        : undefined;

      return (
        <div
          key={key}
          className={`flex justify-center items-center ${
            isInSelectedWeek && !(isStartOfSelectedWeek || isEndOfSelectedWeek)
              ? "bg-gray-100"
              : isStartOfSelectedWeek
                ? "bg-gradient-to-r from-50% to-50% from-gray-100 to-transparent"
                : isEndOfSelectedWeek
                  ? "bg-gradient-to-r from-50% to-50% from-transparent to-gray-100"
                  : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          <span className={spanClass} style={spanStyle}>
            <p className="translate-y-[2px]">{toFarsiDigits(format(day, "d"))}</p>
          </span>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center py-4">
        <button onClick={handlePrevMonth} className="p-3">
          <NextImage width={24} height={24} alt="بعدی" src="/right.svg" />
        </button>
        <div className="font-bold text-2xl">{toFarsiDigits(format(startOfMonthDate, "MMMM yyyy"))}</div>
        <button onClick={handleNextMonth} className="p-3">
          <NextImage width={24} height={24} alt="قبلی" src="/left.svg" />
        </button>
      </div>
      <div className="grid grid-cols-7">
        <div className="text-center h-10 text-gray-500">شنـ</div>
        <div className="text-center h-10 text-gray-500">یکـ</div>
        <div className="text-center h-10 text-gray-500">دو</div>
        <div className="text-center h-10 text-gray-500">سه</div>
        <div className="text-center h-10 text-gray-500">چهـ</div>
        <div className="text-center h-10 text-gray-500">پنـ</div>
        <div className="text-center h-10 text-gray-500">جمـ</div>
        {renderDays()}
      </div>
    </div>
  );
};
