"use client";

import { InputField, TextAreaField } from "@/app/Components/FormFields";
import { Modal } from "@/app/Components/Modal";
import { User, fetchEmployeeProfile, updateEmployeeProfile } from "@/app/api";
import { useShallowRouter } from "@/app/utils";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";

export default function EditProfileModal() {
  const pathname = usePathname();
  const shallowRouter = useShallowRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<User["avatar"]>({ url: "" });
  const [isSaving, startTransition] = useTransition();

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
    }
  };

  useEffect(() => {
    fetchEmployeeProfile().then(({ response, data }) => {
      if (response.status === 200) {
        setAvatar(data.user.avatar);
        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setNickname(data.nickname);
        setDescription(data.user.description || "");
      } else
        toast.error("دریافت اطلاعات پروفایل با خطا مواجه شد", {
          duration: 3000,
          position: "top-center",
          className: "w-full font-medium",
        });
    });
  }, []);

  return (
    <Modal
      isOpen={pathname.startsWith("/user-account/profile/edit")}
      onClose={shallowRouter.back}
      title="پروفایل"
    >
      <div className="flex flex-col gap-6 pb-28">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">تصویر شما</h2>
          <p className="text-lg text-gray-500">تصویر خود را برای آواتار کاری خود بارگذاری کنید.</p>
          <button
            className="relative w-fit mx-auto my-8 active:!transform-none rounded-full"
            onClick={handleClick}
          >
            <div className="bg-gray-100 rounded-full w-[30px] h-[30px] p-[7px] border border-white absolute bottom-0 left-1/2 translate-x-1/2">
              <NextImage
                width={16}
                height={16}
                alt="ویرایش"
                src="/pen.svg"
                className="rounded-full opacity-60"
              />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
            {avatar.url ? (
              <NextImage
                width={118}
                height={118}
                alt="پروفایل"
                src={avatar.url}
                className="rounded-lg"
              />
            ) : (
              <div className="mx-auto w-[118px] h-[118px] rounded-full flex items-center justify-center text-3xl font-bold bg-purple-100 text-purple-700">
                {(firstName + lastName).slice(0, 2)}
              </div>
            )}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">اطلاعات شخصی</h2>
          <p className="text-lg text-gray-500">اطلاعات اولیه‌ی شما در این بخش قابل تغییر می‌باشد.</p>
          <div className="flex flex-col gap-6 mt-6">
            <InputField
              label="نام مستعار (قابل نمایش به مشتریان)"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
              }}
            />
            <InputField
              label="نام کوچک"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />
            <InputField
              label="نام خانوادگی"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
            />
            <TextAreaField
              label="دربارهٔ شما"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 w-full -mx-5 px-4 py-4 bg-white border-t">
        <button
          className={`w-full bg-black text-white font-bold rounded-lg text-xl py-3 ${isSaving ? "opacity-30" : ""}`}
          disabled={isSaving}
          onClick={() => {
            startTransition(async () => {
              const { response } = await updateEmployeeProfile({
                nickname,
                user: {
                  avatar,
                  lastName,
                  firstName,
                  description,
                },
              });

              if (response.status === 200)
                toast.success("اطلاعات شما با موفقیت به‌روزرسانی شد", {
                  duration: 3000,
                  position: "top-center",
                  className: "w-full font-medium",
                });
              else
                toast.error("دریافت اطلاعات پروفایل با خطا مواجه شد", {
                  duration: 3000,
                  position: "top-center",
                  className: "w-full font-medium",
                });
            });
          }}
        >
          {isSaving ? (
            <svg
              aria-hidden="true"
              className="w-7 h-7 text-gray-200 animate-spin fill-black mx-auto"
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
          ) : (
            "ذخیره"
          )}
        </button>
      </div>
    </Modal>
  );
}
