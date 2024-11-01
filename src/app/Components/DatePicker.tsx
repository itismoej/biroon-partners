import { toFarsiDigits } from "@/app/utils";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from "date-fns-jalali";
import { useEffect, useMemo, useState } from "react";
import type React from "react";

type DatePickerProps = {
  selectedDate?: Date | undefined;
  onDateSelect?: (date: Date) => void;
  isDateDisabled?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  isDateDisabled,
  minDate,
  maxDate,
}) => {
  const today = useMemo(() => new Date(), []);
  const [currentViewingDate, setCurrentViewingDate] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setInternalSelectedDate(undefined);
  }, []);

  useEffect(() => {
    setInternalSelectedDate(selectedDate);
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
    return false;
  };

  const handlePrevMonth = () => {
    setCurrentViewingDate(addMonths(currentViewingDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentViewingDate(addMonths(currentViewingDate, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) {
      return;
    }
    if (selectedDate === undefined) {
      // Uncontrolled mode
      setInternalSelectedDate(date);
    }
    if (onDateSelect) onDateSelect(date);
  };

  const startOfMonthDate = startOfMonth(currentViewingDate);
  const endOfMonthDate = endOfMonth(currentViewingDate);
  const daysInMonth = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate });

  const renderDays = () => {
    const firstDayOfMonth = startOfMonthDate.getDay();
    const calendarDays = [];
    for (let i = 0; i < (firstDayOfMonth + 1) % 6; i++) calendarDays.push({ day: null, key: i });

    daysInMonth.forEach((day) => calendarDays.push({ day, key: day }));

    return calendarDays.map(({ day, key }) => {
      if (day === null) {
        return <div key={key} className="flex justify-center items-center cursor-default bg-transparent" />;
      }

      const currentSelectedDate = selectedDate !== undefined ? selectedDate : internalSelectedDate;
      const isSelected = currentSelectedDate && isSameDay(day, currentSelectedDate);
      const isToday = isSameDay(day, today);
      const disabled = isDisabled(day);

      const spanClass = `rounded-full flex justify-center items-center w-12 min-w-12 h-12 font-normal text-[1.2rem] ${
        isSelected ? "bg-purple-600 text-white" : ""
      } ${disabled ? "text-gray-400 cursor-default" : "cursor-pointer"}`;
      const spanStyle = isToday
        ? {
            boxShadow: `inset 0 0 0 1px ${isSelected ? "white" : "#bfbfbf"}, 0 0 0 2px ${
              isSelected ? "#7f5af0" : "transparent"
            }`,
          }
        : undefined;

      return (
        <div
          key={key}
          className={"flex justify-center items-center cursor-pointer"}
          onClick={() => !disabled && handleDateClick(day)}
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
          <img src="/right.svg" />
        </button>
        <div className="font-bold text-2xl">{toFarsiDigits(format(startOfMonthDate, "MMMM yyyy"))}</div>
        <button onClick={handleNextMonth} className="p-3">
          <img src="/left.svg" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
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
