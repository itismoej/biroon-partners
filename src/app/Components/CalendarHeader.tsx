import { toFarsiDigits } from "@/app/utils";
import { useUserData } from "@/context/UserContext";
import { format } from "date-fns-jalali";
import NextImage from "next/image";
import type React from "react";

interface CalendarHeaderProps {
  page: number;
  currentDate: Date;
  setSelectDateInCalendarBSIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  page,
  currentDate,
  setSelectDateInCalendarBSIsOpen,
}) => {
  const { userData } = useUserData();

  return (
    <div className="sticky top-0 ps-2 pe-5 z-50 h-[59px] bg-white shadow flex flex-row gap-5 items-center justify-between">
      {page === 0 ? (
        <div className="flex flex-row gap-2 items-center">
          <button className="bg-white p-3 rounded-xl">
            <NextImage width={24} height={24} alt="منو" src="/hamburger.svg" className="w-[24px] h-[24px]" />
          </button>
          <button
            className="flex flex-row gap-1"
            type="button"
            onClick={() => {
              setSelectDateInCalendarBSIsOpen(true);
            }}
          >
            <h2 className="z-50 text-xl font-bold">{toFarsiDigits(format(currentDate, "EEEE، d MMMM"))}</h2>
            <NextImage width={24} height={24} alt="باز کردن تقویم" src="/dropdown.svg" />
          </button>
        </div>
      ) : (
        <div />
      )}
      <button>
        {userData?.user?.avatar.url ? (
          <NextImage
            width={30}
            height={30}
            alt="پروفایل"
            src={userData.user.avatar.url}
            className="w-[30px] h-[30px] rounded-full"
          />
        ) : userData?.user ? (
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold bg-purple-200">
            {userData.user.name.slice(0, 2)}
          </div>
        ) : null}
      </button>
    </div>
  );
};
