import { BottomSheet } from "@/app/Components/BottomSheet";
import { CheckboxField, InputField, TextAreaField } from "@/app/Components/FormFields";
import { Modal } from "@/app/Components/Modal";
import { type Employee, createEmployee, deleteEmployee } from "@/app/api";
import { toEnglishDigits, toFarsiDigits, useShallowRouter } from "@/app/utils";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";

interface TeamMembersModalProps {
  allEmployees: Employee[];
  setAllEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export function TeamMembersModal({ allEmployees, setAllEmployees }: TeamMembersModalProps) {
  const pathname = usePathname();
  const shallowRouter = useShallowRouter();
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [description, setDescription] = useState("");
  const [isLocationOwner, setIsLocationOwner] = useState(false);

  return (
    <Modal
      isOpen={pathname.startsWith("/team/team-members")}
      onClose={() => shallowRouter.push("/team")}
      title={
        <div>
          <h1 className="-mt-4 text-3xl">اعضای تیم</h1>
        </div>
      }
      topBarTitle={<h2 className="text-xl font-bold">منوی سرویس‌ها</h2>}
      leftBtn={
        <button
          className="bg-black px-3 py-2 text-white text-lg rounded-lg font-bold flex flex-row gap-2 items-center justify-center"
          onClick={() => {
            shallowRouter.push(`${pathname}/add`);
          }}
        >
          <NextImage src="/plus-white.svg" alt="افزودن سرویس" width={20} height={20} />
          افزودن
        </button>
      }
    >
      <div className="flex flex-col divide-y">
        {allEmployees.map((emp) => (
          <div key={emp.id} className="flex flex-row bg-white py-4 px-1 justify-between items-center">
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
              <span className="text-lg font-medium">{emp.nickname}</span>
            </div>
            <button className="bg-white p-4 rounded-xl" onClick={() => setEditingEmployee(emp)}>
              <NextImage src="/3dots.svg" alt="تنظیمات دسته‌بندی" width={24} height={24} />
            </button>
          </div>
        ))}
      </div>
      <BottomSheet
        isOpen={editingEmployee !== undefined}
        onClose={() => setEditingEmployee(undefined)}
        title={editingEmployee?.nickname}
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
                className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl"
                onClick={() => {}}
              >
                <p className="text-lg font-medium">مشاهده‌ی شیفت‌های هفتگی</p>
              </button>
            </li>
            <li>
              <button
                className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl"
                onClick={() => {}}
              >
                <p className="text-lg font-medium">افزودن زمان مرخصی</p>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex flex-row gap-4 items-center w-full p-3 px-4 bg-white rounded-xl"
                onClick={() => {
                  if (editingEmployee) {
                    deleteEmployee(editingEmployee.id).then(({ response }) => {
                      if (response.status !== 204) {
                        toast.error("حذف متخصص با مشکل مواجه شد", {
                          duration: 5000,
                          position: "top-center",
                          className: "w-full font-medium",
                        });
                      } else {
                        toast.success(
                          `متخصص «${editingEmployee.nickname || editingEmployee.user.name}» با موفقیت از کسب‌و‌کار شما حذف شد`,
                          {
                            duration: 5000,
                            position: "top-center",
                            className: "w-full font-medium",
                          },
                        );
                        setAllEmployees((prev) => prev.filter((emp) => emp.id !== editingEmployee.id));
                        setEditingEmployee(undefined);
                      }
                    });
                  }
                }}
              >
                <p className="text-lg text-red-600 font-medium">حذف دائمی (غیر قابل بازگشت)</p>
              </button>
            </li>
          </ul>
        </div>
      </BottomSheet>
      <Modal
        isOpen={pathname.startsWith("/team/team-members/add")}
        title="افزودن متخصص جدید"
        onClose={() => shallowRouter.push("/team/team-members")}
      >
        <div className="flex flex-col gap-5 pt-8 pb-28">
          <div className="mb-4">
            <CheckboxField
              label="صاحب کسب‌و‌کار و یا مدیر آن می‌باشد *"
              checked={isLocationOwner}
              onChange={(e) => setIsLocationOwner(e.target.checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="نام *"
              placeholder=""
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />
            <InputField
              label="نام خانوادگی"
              placeholder=""
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
            />
          </div>

          <InputField
            label="نام مستعار (نمایش به مشتریان)"
            placeholder={`${firstName} ${lastName}`}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
            }}
          />

          <div className="flex w-full flex-col gap-2">
            <label className="font-bold text-md">شماره‌ی همراه *</label>
            <div className="flex items-center text-2xl" style={{ direction: "ltr" }}>
              <div
                className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg"
                style={{ direction: "ltr" }}
              >
                +۹۸
              </div>
              <div id="phone-div" className="relative w-full !tabular-nums" style={{ direction: "ltr" }}>
                <input
                  type="tel"
                  style={{ direction: "ltr" }}
                  aria-describedby="شماره تلفن همراه"
                  value={phoneNumber}
                  className="block tracking-[4px] !tabular-nums p-2.5 w-full text-white caret-black rounded-e-lg border-s-0 border border-gray-300 focus:outline-0 focus:border-gray-400"
                  placeholder=""
                  onChange={(e) => {
                    const engValue = toEnglishDigits(e.target.value.replaceAll(" ", ""));
                    const val = engValue[0] === "0" ? engValue.slice(1) : engValue;
                    if (val.startsWith("0"))
                      toast.error("لطفاً در ابتدای شماره عدد ۰ قرار ندهید", {
                        duration: 3000,
                        position: "top-center",
                      });
                    else if (val.length > 10)
                      toast.error("طول شماره حداکثر ۱۰ رقم می‌باشد", {
                        duration: 3000,
                        position: "top-center",
                      });
                    else setPhoneNumber(toFarsiDigits(val));
                  }}
                  inputMode="numeric"
                />
                <div className="absolute p-2.5 top-0 pointer-events-none" style={{ direction: "ltr" }}>
                  <span className="text-black tracking-[4px]">{phoneNumber}</span>
                  <span className="text-gray-400 tracking-[1.3px]">
                    {Array(10 - phoneNumber.length)
                      .fill("—")
                      .join("")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <TextAreaField
            label="توضیحات"
            placeholder="می‌توانید توضیح کوتاهی اضافه کنید"
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="fixed bottom-0 w-full -mx-5 px-4 py-4 bg-white border-t">
          <button
            className="w-full bg-black text-white font-bold rounded-lg text-xl py-3"
            onClick={() => {
              const cleanedPhoneNumber = `+98${toEnglishDigits(phoneNumber)}`;
              if (!firstName)
                toast.error("فیلد نام، اجباری می‌باشد", {
                  duration: 5000,
                  position: "top-center",
                  className: "w-full font-medium",
                });
              else if (cleanedPhoneNumber.length !== 13 || !cleanedPhoneNumber.startsWith("+989"))
                toast.error("فیلد شماره‌همراه، اجباری می‌باشد و باید به شکل صحیح وارد شود", {
                  duration: 5000,
                  position: "top-center",
                  className: "w-full font-medium",
                });
              else {
                createEmployee({
                  firstName,
                  lastName,
                  description,
                  nickname,
                  phoneNumber,
                  isLocationOwner,
                }).then(({ data, response }) => {
                  if (response.status !== 201) {
                    toast.error("افزودن متخصص جدید با خطا مواجه شد", {
                      duration: 5000,
                      position: "top-center",
                      className: "w-full font-medium",
                    });
                  } else {
                    toast.success(
                      `متخصص «${data.nickname || data.user.name}» با موفقیت به کسب‌و‌کار اضافه شد`,
                      {
                        duration: 5000,
                        position: "top-center",
                        className: "w-full font-medium",
                      },
                    );
                    setAllEmployees((prev) => [...prev, data]);
                    shallowRouter.push("/team/team-members");
                  }
                });
              }
            }}
          >
            افزودن عضو جدید
          </button>
        </div>
      </Modal>
    </Modal>
  );
}
