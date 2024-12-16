import { CheckboxField, InputField, SelectField, TextAreaField } from "@/app/Components/FormFields";
import { createNewService, fetchLocation, getService, updateService } from "@/app/api";
import type {
  Category,
  Employee,
  Location,
  NewServicePerEmployee,
  Service,
  ServiceCategory,
} from "@/app/api";
import {
  formatDurationInFarsi,
  formatPriceWithSeparator,
  toEnglishDigits,
  toFarsiDigits,
} from "@/app/utils";
import NextImage from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { BottomSheet, BottomSheetFooter } from "./BottomSheet";
import { Modal } from "./Modal";

export function AddNewServiceModal(props: {
  isOpen: boolean;
  onClose: () => void;
  allEmployees: Employee[];
  setLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
  availableCategories: Category[];
  serviceCategories: ServiceCategory[];
  durations: { value: number; label: string }[];
}) {
  const {
    isOpen,
    onClose,
    allEmployees,
    setLocation,
    availableCategories,
    serviceCategories,
    durations,
  } = props;
  const router = useRouter();

  const [newServiceName, setNewServiceName] = useState<Service["name"]>("");
  const [newServiceMainCategory, setNewServiceMainCategory] = useState<Category>();
  const [newServiceSelectMainCategoryBSIsOpen, setNewServiceSelectMainCategoryBSIsOpen] =
    useState<boolean>(false);
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>();
  const [newServiceSelectServiceCategoryBSIsOpen, setNewServiceSelectServiceCategoryBSIsOpen] =
    useState<boolean>(false);
  const [newServiceDescription, setNewServiceDescription] = useState<string>("");
  const [newServiceDuration, setNewServiceDuration] = useState<Service["durationInMins"]>(60);
  const [newServicePrice, setNewServicePrice] = useState<Service["price"]>();
  const [newServiceUpfrontPrice, setNewServiceUpfrontPrice] = useState<Service["upfrontPrice"]>();
  const [newServiceGender, setNewServiceGender] = useState<"f" | "m" | "">("f");
  const [newServiceIsRecommendedByLocation, setNewServiceIsRecommendedByLocation] =
    useState<boolean>(false);
  const [newServiceAdvancedSettingsModalIsOpen, setNewServiceAdvancedSettingsModalIsOpen] =
    useState<boolean>(false);
  const [newServiceAdvancedPerEmployeeSettings, setNewServiceAdvancedPerEmployeeSettings] =
    useState<Record<Employee["id"], NewServicePerEmployee>>({});
  const [
    newServiceAdvancedPerEmployeeSettingsIsEditingEmployee,
    setNewServiceAdvancedPerEmployeeSettingsIsEditingEmployee,
  ] = useState<Employee>();
  const [isConfirmCloseAddNewServiceBSOpen, setIsConfirmCloseAddNewServiceBSOpen] =
    useState<boolean>(false);

  const searchParams = useSearchParams();
  const isEditMode = useMemo(() => {
    return searchParams.get("id");
  }, [searchParams]);

  function makeAllFieldsEmpty() {
    setNewServiceName("");
    setNewServiceMainCategory(undefined);
    setNewServiceCategory(undefined);
    setNewServiceDescription("");
    setNewServiceDuration(60);
    setNewServicePrice(undefined);
    setNewServiceUpfrontPrice(undefined);
    setNewServiceGender("f");
    setNewServiceIsRecommendedByLocation(false);
    setNewServiceAdvancedPerEmployeeSettings({});
    setNewServiceAdvancedPerEmployeeSettingsIsEditingEmployee(undefined);
  }

  useEffect(() => {
    if (isEditMode) {
      const serviceId = searchParams.get("id") || "";
      getService(serviceId).then(({ data, response }) => {
        if (response.status === 200 && data) {
          setNewServiceName(data.name);
          setNewServiceMainCategory(data.category);
          setNewServiceCategory(data.serviceCategory);
          setNewServiceDescription(data.description || "");
          setNewServiceDuration(data.durationInMins || 60);
          setNewServicePrice(data.price);
          setNewServiceUpfrontPrice(data.upfrontPrice);
          setNewServiceGender((data.gender as "f" | "m" | "") || "f");
          setNewServiceIsRecommendedByLocation(!!data.isRecommendedByLocation);
          setNewServiceAdvancedPerEmployeeSettings(
            data.perEmployeeSettings.reduce(
              (allEmployees, employee) => ({ ...allEmployees, [employee.id]: employee }),
              {},
            ),
          );
        }
      });
    }
  }, [isEditMode]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsConfirmCloseAddNewServiceBSOpen(true);
      }}
      title="افزودن سرویس"
    >
      <div className="flex flex-col gap-6 pb-28">
        <h2 className="text-2xl font-bold">اطلاعات کلی</h2>
        <InputField
          label="نام سرویس"
          placeholder="نام سرویس؛ مثلاً مانیکور"
          value={newServiceName}
          onChange={(e) => setNewServiceName(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <label className="font-bold text-md">نوع سرویس</label>
          <div className="relative">
            <input
              className="w-full border text-lg rounded-lg py-3 px-5 outline-0"
              placeholder="نوع سرویس را انتخاب کنید"
              value={newServiceMainCategory?.name || ""}
              readOnly
            />
            <div className="left-1 top-1/2 -translate-y-1/2 absolute text-purple-600 text-xl font-medium">
              <button
                className="bg-white py-2 px-3 rounded-xl"
                onClick={() => setNewServiceSelectMainCategoryBSIsOpen(true)}
              >
                انتخاب
              </button>
            </div>
            <BottomSheet
              isOpen={newServiceSelectMainCategoryBSIsOpen}
              onClose={() => setNewServiceSelectMainCategoryBSIsOpen(false)}
              title="دسته‌بندی‌های اصلی"
            >
              <div className="grid grid-cols-2 gap-3">
                {availableCategories.map((category) => {
                  return (
                    <button
                      key={category.id}
                      className={`relative border rounded-xl flex flex-col gap-4 items-start justify-between text-right px-6 py-5 ${
                        newServiceMainCategory?.id === category.id
                          ? "shadow-[inset_0_0_0_2px] shadow-purple-500"
                          : ""
                      }`}
                      onClick={() => {
                        setNewServiceMainCategory(category);
                        setNewServiceSelectMainCategoryBSIsOpen(false);
                      }}
                    >
                      <NextImage
                        width={32}
                        height={32}
                        alt={category.name}
                        src={category.icon}
                        style={{ filter: "saturate(0) brightness(0)" }}
                      />
                      <p className="text-lg font-bold">{category.name}</p>
                    </button>
                  );
                })}
              </div>
            </BottomSheet>
          </div>
          <p className="text-gray-500 text-sm font-light">
            انتخاب درست این فیلد، برای پیدا کردن شما در پلتفرم بیرون توسط مشتریان، تأثیر مهمی دارد.
            این گزینه فقط در موتور جستجوی بیرون اثرگذاری دارد و به کاربران نمایش داده نمی‌شود.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-md">دسته‌بندی منوی شما</label>
          <div className="relative">
            <input
              className="w-full border text-lg rounded-lg py-3 px-5 outline-0"
              placeholder="در کدام منو قرار بگیرد؟"
              value={newServiceCategory?.name || ""}
              readOnly
            />
            <div className="left-1 top-1/2 -translate-y-1/2 absolute text-purple-600 text-xl font-medium">
              <button
                className="bg-white py-2 px-3 rounded-xl"
                onClick={() => setNewServiceSelectServiceCategoryBSIsOpen(true)}
              >
                انتخاب
              </button>
            </div>
            <BottomSheet
              isOpen={newServiceSelectServiceCategoryBSIsOpen}
              onClose={() => setNewServiceSelectServiceCategoryBSIsOpen(false)}
              title="دسته‌بندی‌های منوی شما"
            >
              <div className="flex flex-col items-start gap-4">
                {serviceCategories.map((svcCategory) => (
                  <button
                    key={svcCategory.id}
                    className="w-full flex flex-row justify-between items-center text-xl font-normal"
                    onClick={() => {
                      setNewServiceCategory(svcCategory);
                      setNewServiceSelectServiceCategoryBSIsOpen(false);
                    }}
                  >
                    {svcCategory.name}
                    {newServiceCategory?.id === svcCategory.id && (
                      <NextImage
                        className="invert"
                        src="/check.svg"
                        alt="انتخاب شده"
                        width={18}
                        height={18}
                      />
                    )}
                  </button>
                ))}
              </div>
            </BottomSheet>
          </div>
          <p className="text-gray-500 text-sm font-light">
            همان دسته‌بندی که به مشتریان شما در صفحه‌ی کسب‌و‌کارتان نمایش داده می‌شود.
          </p>
        </div>
        <TextAreaField
          label="توضیحات"
          placeholder="می‌توانید توضیح کوتاهی اضافه کنید"
          value={newServiceDescription}
          maxLength={1000}
          onChange={(e) => setNewServiceDescription(e.target.value)}
        />
        <hr className="my-4" />
        <h2 className="text-2xl font-bold">هزینه و زمان</h2>
        <SelectField
          label="مدت‌زمان سرویس"
          value={newServiceDuration}
          onChange={(e) => {
            setNewServiceDuration(+e.target.value);
          }}
          options={durations.map((duration) => ({
            value: duration.value,
            label: duration.label,
          }))}
        />
        <div className="flex flex-col gap-2">
          <label className="font-bold text-md">هزینه</label>
          <div className="relative">
            <input
              className="w-full border text-lg rounded-lg py-3 px-5 outline-0"
              style={{ direction: "ltr" }}
              placeholder="۵۰۰٫۰۰۰"
              value={
                newServicePrice
                  ? toFarsiDigits(formatPriceWithSeparator(Number(newServicePrice)))
                  : ""
              }
              onChange={(e) => {
                const val = toEnglishDigits(e.target.value).replaceAll("٫", "");
                if (!Number.isNaN(Number(val)) && +val < 100000000) {
                  setNewServicePrice(+val);
                  setNewServiceUpfrontPrice(
                    newServiceUpfrontPrice
                      ? Math.min(+val, newServiceUpfrontPrice)
                      : newServiceUpfrontPrice,
                  );
                  setNewServiceAdvancedPerEmployeeSettings((prevSettings) => {
                    return Object.keys(prevSettings).reduce(
                      (acc, employeeId) => {
                        const employeeSettings = prevSettings[employeeId];

                        const updatedUpfrontPrice =
                          employeeSettings.upfrontPrice !== undefined
                            ? Math.min(+val, employeeSettings.upfrontPrice)
                            : employeeSettings.upfrontPrice;

                        acc[employeeId] = {
                          ...employeeSettings,
                          upfrontPrice: updatedUpfrontPrice,
                        };

                        return acc;
                      },
                      {} as Record<Employee["id"], NewServicePerEmployee>,
                    );
                  });
                }
              }}
            />
            <div className="bg-white py-2 px-3 rounded-xl right-1 top-1/2 -translate-y-1/2 absolute text-gray-500 text-xl font-medium">
              تومــان
            </div>
          </div>
        </div>
        <div className={`flex flex-col gap-2 ${!newServicePrice ? "opacity-40" : ""}`}>
          <label className="font-bold text-md">پیش‌بها</label>
          <div className="relative">
            <input
              className={"w-full border text-lg rounded-lg py-3 px-5 outline-0"}
              style={{ direction: "ltr" }}
              disabled={!newServicePrice}
              placeholder={
                newServicePrice
                  ? toFarsiDigits(formatPriceWithSeparator(Math.ceil(newServicePrice / 2)))
                  : "۲۵۰٫۰۰۰"
              }
              value={
                newServiceUpfrontPrice !== undefined
                  ? toFarsiDigits(formatPriceWithSeparator(Number(newServiceUpfrontPrice)))
                  : ""
              }
              onChange={(e) => {
                const val = toEnglishDigits(e.target.value).replaceAll("٫", "");
                if (newServicePrice && !Number.isNaN(Number(val)) && +val <= newServicePrice)
                  setNewServiceUpfrontPrice(+val);
              }}
            />
            <div className="bg-white py-2 px-3 rounded-xl right-1 top-1/2 -translate-y-1/2 absolute text-gray-500 text-xl font-medium">
              تومــان
            </div>
          </div>
        </div>
        <button
          disabled={!newServicePrice}
          className={`mt-3 text-xl font-medium text-purple-600 flex flex-row gap-3 ${
            newServicePrice ? "" : "opacity-30"
          }`}
          onClick={() => setNewServiceAdvancedSettingsModalIsOpen(true)}
        >
          <span>تنظیمات پیشرفته‌ی هزینه و زمان</span>
          {Object.keys(newServiceAdvancedPerEmployeeSettings).length > 0 && (
            <div className="w-6 h-6 flex items-center justify-center text-md bg-purple-500 border text-white rounded-full font-bold">
              <span className="translate-y-[2px] text-sm font-normal">
                {toFarsiDigits(Object.keys(newServiceAdvancedPerEmployeeSettings).length)}
              </span>
            </div>
          )}
        </button>
        {newServicePrice ? (
          <Modal
            isOpen={newServiceAdvancedSettingsModalIsOpen}
            onClose={() => setNewServiceAdvancedSettingsModalIsOpen(false)}
            title="تنظیمات پیشرفته‌ی هزینه و زمان"
          >
            <p className="text-lg text-gray-500">
              به‌ازای هر متخصص، می‌توانید هزینه و مدت‌زمان این سرویس را به‌طور مجزا تنظیم کنید.
            </p>
            <div className="flex flex-col gap-4 mt-12 pb-28">
              {allEmployees.map((emp) => (
                <div key={emp.id} className="flex flex-row items-center gap-4">
                  <input
                    type="checkbox"
                    checked={
                      newServiceAdvancedPerEmployeeSettings[emp.id]?.isOperator !== undefined
                        ? newServiceAdvancedPerEmployeeSettings[emp.id].isOperator
                        : true
                    }
                    onChange={(e) => {
                      setNewServiceAdvancedPerEmployeeSettings({
                        ...newServiceAdvancedPerEmployeeSettings,
                        [emp.id]: {
                          ...newServiceAdvancedPerEmployeeSettings[emp.id],
                          id: emp.id,
                          isOperator: e.target.checked,
                        },
                      });
                    }}
                    className="form-checkbox h-8 w-8 text-blue-600 rounded accent-purple-500"
                  />
                  <button
                    disabled={newServiceAdvancedPerEmployeeSettings[emp.id]?.isOperator === false}
                    className={`w-full flex flex-row justify-between items-center ${
                      newServiceAdvancedPerEmployeeSettings[emp.id]?.isOperator === false
                        ? "opacity-30 active:transform-none active:filter-none"
                        : ""
                    }`}
                    onClick={() => setNewServiceAdvancedPerEmployeeSettingsIsEditingEmployee(emp)}
                  >
                    <div className="flex flex-row items-center gap-3">
                      {emp.user?.avatar?.url ? (
                        <NextImage
                          width={40}
                          height={40}
                          alt="پروفایل"
                          src={emp.user.avatar.url}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="w-[45px] h-[45px] rounded-full flex items-center justify-center text-md font-bold bg-purple-100 text-purple-700">
                          {emp.nickname.slice(0, 2)}
                        </div>
                      )}
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-lg">{emp.nickname}</span>
                        <span className="font-normal text-gray-500">
                          {newServiceAdvancedPerEmployeeSettings[emp.id]?.isOperator !== false
                            ? formatDurationInFarsi(
                                newServiceAdvancedPerEmployeeSettings[emp.id]?.durationInMins ||
                                  newServiceDuration,
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>
                    {newServiceAdvancedPerEmployeeSettings[emp.id]?.isOperator !== false && (
                      <div className="flex flex-col gap-1 items-end">
                        <div
                          className={`font-normal text-lg ${
                            newServiceAdvancedPerEmployeeSettings[emp.id]?.price
                              ? ""
                              : "text-gray-500"
                          }`}
                        >
                          {toFarsiDigits(
                            formatPriceWithSeparator(
                              newServiceAdvancedPerEmployeeSettings[emp.id]?.price ||
                                newServicePrice ||
                                0,
                            ),
                          )}
                          <span className="text-xs font-light text-gray-500"> تومان</span>
                        </div>
                        <div
                          className={`font-normal text-sm ${
                            newServiceAdvancedPerEmployeeSettings[emp.id]?.upfrontPrice
                              ? ""
                              : "text-gray-500"
                          }`}
                        >
                          {toFarsiDigits(
                            formatPriceWithSeparator(
                              newServiceAdvancedPerEmployeeSettings[emp.id]?.upfrontPrice ||
                                newServiceUpfrontPrice ||
                                Math.ceil(newServicePrice / 2),
                            ),
                          )}
                          <span className="text-xs font-light text-gray-500"> تومان</span>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
            <BottomSheet
              isOpen={!!newServiceAdvancedPerEmployeeSettingsIsEditingEmployee?.id}
              onClose={() => {
                setNewServiceAdvancedPerEmployeeSettingsIsEditingEmployee(undefined);
              }}
              title={`تنظیم هزینه و مدت‌زمان برای ${newServiceAdvancedPerEmployeeSettingsIsEditingEmployee?.nickname}`}
            >
              {newServiceAdvancedPerEmployeeSettingsIsEditingEmployee && (
                <div className="flex flex-col gap-6 pb-8">
                  <SelectField
                    label="مدت‌زمان سرویس"
                    value={
                      newServiceAdvancedPerEmployeeSettings[
                        newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                      ]?.durationInMins || newServiceDuration
                    }
                    onChange={(e) => {
                      setNewServiceAdvancedPerEmployeeSettings({
                        ...newServiceAdvancedPerEmployeeSettings,
                        [newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id]: {
                          ...newServiceAdvancedPerEmployeeSettings[
                            newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                          ],
                          id: newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id,
                          durationInMins: +e.target.value,
                        },
                      });
                    }}
                    options={durations.map((duration) => ({
                      value: duration.value,
                      label: duration.label,
                    }))}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-md">هزینه</label>
                    <div className="relative">
                      <input
                        className="w-full border text-lg rounded-lg py-3 px-5 outline-0"
                        style={{ direction: "ltr" }}
                        placeholder={
                          newServicePrice
                            ? toFarsiDigits(formatPriceWithSeparator(Number(newServicePrice)))
                            : "۵۰۰٫۰۰۰"
                        }
                        value={
                          newServiceAdvancedPerEmployeeSettings[
                            newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                          ]?.price
                            ? toFarsiDigits(
                                formatPriceWithSeparator(
                                  Number(
                                    newServiceAdvancedPerEmployeeSettings[
                                      newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                                    ]?.price,
                                  ),
                                ),
                              )
                            : ""
                        }
                        onChange={(e) => {
                          const val = toEnglishDigits(e.target.value).replaceAll("٫", "");
                          const prevUpfrontPrice =
                            newServiceAdvancedPerEmployeeSettings[
                              newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                            ]?.upfrontPrice;
                          const upfrontPrice =
                            prevUpfrontPrice !== undefined
                              ? Math.min(+val, prevUpfrontPrice)
                              : prevUpfrontPrice;
                          if (!Number.isNaN(Number(val)) && +val < 100000000) {
                            setNewServiceAdvancedPerEmployeeSettings({
                              ...newServiceAdvancedPerEmployeeSettings,
                              [newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id]: {
                                ...newServiceAdvancedPerEmployeeSettings[
                                  newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                                ],
                                id: newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id,
                                price: val ? +val : undefined,
                                upfrontPrice,
                              },
                            });
                          }
                        }}
                      />
                      <div className="bg-white py-2 px-3 rounded-xl right-1 top-1/2 -translate-y-1/2 absolute text-gray-500 text-xl font-medium">
                        تومــان
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-md">پیش‌بها</label>
                    <div className="relative">
                      <input
                        className="w-full border text-lg rounded-lg py-3 px-5 outline-0"
                        style={{ direction: "ltr" }}
                        placeholder={
                          newServiceUpfrontPrice
                            ? toFarsiDigits(formatPriceWithSeparator(newServiceUpfrontPrice))
                            : newServicePrice
                              ? toFarsiDigits(
                                  formatPriceWithSeparator(Math.ceil(newServicePrice / 2)),
                                )
                              : "۲۵۰٫۰۰۰"
                        }
                        value={
                          newServiceAdvancedPerEmployeeSettings[
                            newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                          ]?.upfrontPrice !== undefined
                            ? toFarsiDigits(
                                formatPriceWithSeparator(
                                  Number(
                                    newServiceAdvancedPerEmployeeSettings[
                                      newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                                    ]?.upfrontPrice,
                                  ),
                                ),
                              )
                            : ""
                        }
                        onChange={(e) => {
                          const val = toEnglishDigits(e.target.value).replaceAll("٫", "");
                          const maxUpfront =
                            newServiceAdvancedPerEmployeeSettings[
                              newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                            ]?.price || newServicePrice;
                          if (maxUpfront && !Number.isNaN(Number(val)) && +val <= maxUpfront) {
                            setNewServiceAdvancedPerEmployeeSettings({
                              ...newServiceAdvancedPerEmployeeSettings,
                              [newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id]: {
                                ...newServiceAdvancedPerEmployeeSettings[
                                  newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id
                                ],
                                id: newServiceAdvancedPerEmployeeSettingsIsEditingEmployee.id,
                                upfrontPrice: val ? +val : undefined,
                              },
                            });
                          }
                        }}
                      />
                      <div className="bg-white py-2 px-3 rounded-xl right-1 top-1/2 -translate-y-1/2 absolute text-gray-500 text-xl font-medium">
                        تومــان
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="fixed bottom-0 w-full -mx-5 px-4 py-4 bg-white border-t">
                <button
                  className="w-full bg-black text-white font-bold rounded-lg text-xl py-3"
                  onClick={() => {
                    setNewServiceAdvancedPerEmployeeSettingsIsEditingEmployee(undefined);
                  }}
                >
                  ذخیره
                </button>
              </div>
            </BottomSheet>

            <div className="fixed bottom-0 w-full -mx-5 px-4 py-4 bg-white border-t">
              <button
                className="w-full bg-black text-white font-bold rounded-lg text-xl py-3"
                onClick={() => {
                  setNewServiceAdvancedSettingsModalIsOpen(false);
                  setNewServiceAdvancedPerEmployeeSettings((prev) => {
                    const cleaned: typeof prev = {};
                    for (const k of Object.keys(prev))
                      if (
                        (prev[k]?.price !== undefined && prev[k]?.price !== newServicePrice) ||
                        (prev[k]?.durationInMins !== undefined &&
                          prev[k]?.durationInMins !== newServiceDuration) ||
                        (prev[k]?.isOperator !== undefined && prev[k]?.isOperator !== true) ||
                        (prev[k]?.upfrontPrice !== undefined &&
                          prev[k]?.upfrontPrice !==
                            (newServiceUpfrontPrice || Math.ceil(newServicePrice / 2)))
                      )
                        cleaned[k] = prev[k];
                    return cleaned;
                  });
                }}
              >
                ذخیره
              </button>
            </div>
          </Modal>
        ) : null}
        <hr className="my-4" />
        <h2 className="text-2xl font-bold">تنظیمات عمومی</h2>
        <SelectField
          label="محدودیت جنسیت"
          value={newServiceGender}
          onChange={(e) => {
            setNewServiceGender(e.target.value === "f" ? "f" : e.target.value === "m" ? "m" : "");
          }}
          options={[
            { value: "f", label: "فقط زنانه" },
            { value: "m", label: "فقط مردانه" },
            { value: "", label: "فرقی ندارد" },
          ]}
        />
        <CheckboxField
          label="به دسته‌بندی ویژه اضافه شود (حداکثر ۴ سرویس)"
          checked={newServiceIsRecommendedByLocation}
          onChange={(e) => setNewServiceIsRecommendedByLocation(e.target.checked)}
        />
      </div>
      <div className="fixed bottom-0 w-full -mx-5 px-4 py-4 bg-white border-t">
        <button
          className="w-full bg-black text-white font-bold rounded-lg text-xl py-3"
          onClick={() => {
            if (!newServiceName)
              toast.error("نام سرویس را باید وارد کنید", {
                duration: 5000,
                position: "top-center",
                className: "w-full font-medium",
              });
            else if (!newServiceMainCategory)
              toast.error("نوع سرویس را باید انتخاب کنید", {
                duration: 5000,
                position: "top-center",
                className: "w-full font-medium",
              });
            else if (!newServiceCategory)
              toast.error("دسته‌بندی سرویس را باید انتخاب کنید", {
                duration: 5000,
                position: "top-center",
                className: "w-full font-medium",
              });
            else if (!newServicePrice)
              toast.error("هزینه‌ی سرویس را باید وارد کنید", {
                duration: 5000,
                position: "top-center",
                className: "w-full font-medium",
              });
            else {
              const sendData = {
                name: newServiceName,
                category: newServiceMainCategory.id,
                serviceCategory: newServiceCategory.id,
                description: newServiceDescription,
                gender: newServiceGender,
                durationInMins: newServiceDuration,
                price: newServicePrice,
                upfrontPrice: newServiceUpfrontPrice,
                isRecommendedByLocation: newServiceIsRecommendedByLocation,
                perEmployeeSettings: Object.values(newServiceAdvancedPerEmployeeSettings),
              };

              if (isEditMode) {
                const serviceId = searchParams.get("id");
                if (serviceId) {
                  updateService({ id: serviceId, service: sendData }).then(({ response }) => {
                    if (response.status === 201) {
                      toast.success(`سرویس ${newServiceName} با موفقیت ویرایش شد`, {
                        duration: 5000,
                        position: "top-center",
                        className: "w-full font-medium",
                      });
                      // fetchLocation().then(({ data, response }) => {
                      //   if (response.status !== 200) router.push("/");
                      //   else {
                      //     setLocation(data);
                      //     onClose();
                      //     makeAllFieldsEmpty();
                      //   }
                      // });
                    } else {
                      toast.error(`ویرایش سرویس ${newServiceName} با مشکل مواجه شد`, {
                        duration: 5000,
                        position: "top-center",
                        className: "w-full font-medium",
                      });
                    }
                  });
                }
              } else {
                createNewService(sendData).then(({ response }) => {
                  if (response.status === 201) {
                    toast.success(`سرویس جدید ${newServiceName} با موفقیت ایجاد شد`, {
                      duration: 5000,
                      position: "top-center",
                      className: "w-full font-medium",
                    });
                    fetchLocation().then(({ data, response }) => {
                      if (response.status !== 200) router.push("/");
                      else {
                        setLocation(data);
                        onClose();
                        makeAllFieldsEmpty();
                      }
                    });
                  } else {
                    toast.error(`ایجاد سرویس جدید ${newServiceName} با مشکل مواجه شد`, {
                      duration: 5000,
                      position: "top-center",
                      className: "w-full font-medium",
                    });
                  }
                });
              }
            }
          }}
        >
          افزودن سرویس
        </button>
      </div>
      <BottomSheet
        className="h-[90dvh]"
        isOpen={isConfirmCloseAddNewServiceBSOpen}
        onClose={() => {
          setIsConfirmCloseAddNewServiceBSOpen(false);
        }}
      >
        <div>
          <h2 className="text-3xl font-bold mb-10">مطمئنید که می‌خواهید این صفحه را ترک کنید؟</h2>
          <p className="text-lg ">همه‌ی اطلاعات وارد شده پاک خواهند شد.</p>
        </div>
        <BottomSheetFooter
          onClose={() => {
            setIsConfirmCloseAddNewServiceBSOpen(false);
          }}
          onSelect={() => {
            setIsConfirmCloseAddNewServiceBSOpen(false);
            onClose();
            makeAllFieldsEmpty();
          }}
          selectText="بله، خارج شو"
          closeText="بمان!"
        />
      </BottomSheet>
    </Modal>
  );
}
