import { MenuPopup } from "@/app/Components/MenuPopup";
import { formatPriceWithSeparator, toFarsiDigits, useShallowRouter } from "@/app/utils";
import { useUserData } from "@/context/UserContext";
import { format } from "date-fns-jalali";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import type React from "react";

interface CalendarHeaderProps {
  page: number;
  currentDate: Date;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ page, currentDate }) => {
  const { userData } = useUserData();
  const shallowRouter = useShallowRouter();
  const pathname = usePathname();
  return (
    <div className="sticky top-0 ps-2 pe-5 z-50 h-[59px] bg-white shadow flex flex-row gap-5 items-center justify-between">
      {page === 0 ? (
        <div className="flex flex-row gap-2 items-center">
          <button className="bg-white p-3 rounded-xl">
            <NextImage
              width={24}
              height={24}
              alt="منو"
              src="/hamburger.svg"
              className="w-[24px] h-[24px]"
            />
          </button>
          <button
            className="flex flex-row gap-1"
            type="button"
            onClick={() => {
              shallowRouter.push(`${pathname}/select-date`);
            }}
          >
            <h2 className="z-50 text-xl font-bold">
              {toFarsiDigits(format(currentDate, "EEEE، d MMMM"))}
            </h2>
            <NextImage width={24} height={24} alt="باز کردن تقویم" src="/dropdown.svg" />
          </button>
        </div>
      ) : (
        <div />
      )}
      <button
        onClick={() => {
          shallowRouter.push(`${pathname}/profile-menu`);
        }}
      >
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
            {userData.user.fullName.slice(0, 2)}
          </div>
        ) : null}
      </button>
      <MenuPopup
        isOpen={pathname.endsWith("/profile-menu")}
        onClose={() => {
          shallowRouter.push(`${pathname.split("/").slice(0, -1).join("/")}`);
        }}
      >
        <div className="flex flex-col gap-1 items-center justify-center my-6">
          <div className="flex flex-row items-center justify-between w-full px-5">
            {userData?.user?.avatar.url ? (
              <NextImage
                width={70}
                height={70}
                alt="پروفایل"
                src={userData.user.avatar.url}
                className="rounded-lg"
              />
            ) : userData?.user ? (
              <div className="w-[70px] h-[70px] rounded-lg flex items-center justify-center text-2xl font-bold bg-purple-200">
                {userData.user.fullName.slice(0, 2)}
              </div>
            ) : null}
            <div
              className="flex flex-col items-end bg-white active:transform-none"
              onClick={() => {}}
            >
              <p className="text-gray-600">موجودی کیف پول</p>
              <h3 className="text-lg font-semibold text-nowrap">
                {toFarsiDigits(formatPriceWithSeparator(17261000))}
                <span className="text-xs font-light text-gray-500"> تومان</span>
              </h3>
            </div>
          </div>
        </div>
        <div className="flex flex-col divide-y">
          <button className="flex flex-row justify-between p-5 bg-white active:!transform-none rounded-b-2xl">
            <p className="text-lg font-semibold">ویرایش پروفایل</p>
            <NextImage src="/profile.svg" alt="ویرایش پروفایل" width={24} height={24} />
          </button>
          <button
            type="button"
            className="flex flex-row justify-between p-5 bg-white active:!transform-none"
            onClick={() => {}}
          >
            <p className="text-lg font-semibold">برداشت موجودی کیف‌پول</p>
            <NextImage src="/bank-card.svg" alt="برداشت موجودی کیف‌پول" width={24} height={24} />
          </button>
          <button
            type="button"
            className="flex flex-row justify-between p-5 bg-white active:!transform-none rounded-b-2xl"
            onClick={() => {}}
          >
            <p className="text-lg font-semibold text-red-600">خروج از حساب</p>
            <NextImage
              style={{ filter: "saturate(45) hue-rotate(160deg)" }}
              src="/logout.svg"
              alt="خروج از حساب"
              width={24}
              height={24}
            />
          </button>
        </div>
      </MenuPopup>
    </div>
  );
};
