import { SelectField } from "@/app/Components/FormFields";
import { Modal } from "@/app/Components/Modal";
import {
  type Employee,
  type EmployeeWorkingDays,
  type WorkingDay,
  type WorkingTime,
  modifyRegularShiftForEmployee,
} from "@/app/api";
import { formatDurationInFarsi, toFarsiDigits, useShallowRouter } from "@/app/utils";
import { parse } from "date-fns";
import { addHours, differenceInMinutes, format, parseISO, setHours, setMinutes } from "date-fns-jalali";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface RegularShiftEditModalProps {
  editingWorkingDay: {
    employeeWorkingDays: EmployeeWorkingDays;
    workingDay: WorkingDay;
  };
  onSave?: (data: WorkingDay & { employee: Employee }) => void;
}

export function RegularShiftEditModal({ editingWorkingDay, onSave }: RegularShiftEditModalProps) {
  const pathname = usePathname();
  const shallowRouter = useShallowRouter();

  const regularShiftEditModalIsOpen =
    editingWorkingDay !== undefined &&
    pathname.startsWith("/team/scheduled-shifts/regular-working-hours/") &&
    /^\d+$/.test(pathname.split("/").pop() || "");

  // State for managing working hours in the shift edit modal
  const [regularWorkingHours, setRegularWorkingHours] = useState<WorkingTime[]>([]);

  const defaultStartTime = editingWorkingDay
    ? setMinutes(setHours(parse(editingWorkingDay.workingDay.day, "yyyy-MM-dd", new Date()), 9), 0)
    : setMinutes(setHours(new Date(), 9), 0);

  useEffect(() => {
    if (editingWorkingDay) {
      if (editingWorkingDay.workingDay.regularWorkingHours.length > 0) {
        setRegularWorkingHours(editingWorkingDay.workingDay.regularWorkingHours);
      } else {
        // Initialize with default working hour
        setRegularWorkingHours([
          { startTime: defaultStartTime.toISOString(), endTime: addHours(defaultStartTime, 8).toISOString() },
        ]);
      }
    }
  }, [editingWorkingDay]);

  const timeOptions = [
    ...Array.from({ length: 24 * 4 }, (_, index) => {
      const hours = Math.floor(index / 4);
      const minutes = (index % 4) * 15;
      const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      return { value, label: toFarsiDigits(value) };
    }),
    { value: "23:59", label: "۲۳:۵۹" },
  ];

  const handleStartTimeChange = (index: number, newValue: string) => {
    setRegularWorkingHours((prevWorkingHours) => {
      const updatedWorkingHours = [...prevWorkingHours];
      const [hour, minute] = newValue.split(":").map(Number);
      updatedWorkingHours[index] = {
        ...updatedWorkingHours[index],
        startTime: setMinutes(setHours(defaultStartTime, hour), minute).toISOString(),
      };
      if (validateWorkingHours(updatedWorkingHours))
        return updatedWorkingHours.slice().sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        });
      return prevWorkingHours;
    });
  };

  const handleEndTimeChange = (index: number, newValue: string) => {
    setRegularWorkingHours((prevWorkingHours) => {
      const updatedWorkingHours = [...prevWorkingHours];
      const [hour, minute] = newValue.split(":").map(Number);
      updatedWorkingHours[index] = {
        ...updatedWorkingHours[index],
        endTime: setMinutes(setHours(defaultStartTime, hour), minute).toISOString(),
      };

      if (validateWorkingHours(updatedWorkingHours))
        return updatedWorkingHours.slice().sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        });
      return prevWorkingHours;
    });
  };

  const handleDelete = (index: number) => {
    setRegularWorkingHours((prevWorkingHours) => {
      const updatedWorkingHours = [...prevWorkingHours];
      updatedWorkingHours.splice(index, 1);
      return updatedWorkingHours;
    });
  };

  const handleAddShift = () => {
    setRegularWorkingHours((prevWorkingHours) => {
      const newShift =
        prevWorkingHours.length > 0
          ? {
              startTime: addHours(
                parseISO(prevWorkingHours[prevWorkingHours.length - 1].endTime),
                1,
              ).toISOString(),
              endTime: addHours(
                parseISO(prevWorkingHours[prevWorkingHours.length - 1].endTime),
                2,
              ).toISOString(),
            }
          : {
              startTime: defaultStartTime.toISOString(),
              endTime: addHours(defaultStartTime, 8).toISOString(),
            };
      return [...prevWorkingHours, newShift];
    });
  };

  const computeTotalMinutes = () => {
    let totalMinutes = 0;
    for (const wh of regularWorkingHours) {
      totalMinutes += differenceInMinutes(parseISO(wh.endTime), parseISO(wh.startTime));
    }
    return totalMinutes;
  };

  const validateWorkingHours = (workingHours: WorkingTime[]) => {
    const sortedWorkingHours = workingHours.slice().sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    for (const wh of sortedWorkingHours) {
      if (parseISO(wh.startTime) >= parseISO(wh.endTime)) {
        toast.error("زمان شروع باید قبل از زمان پایان باشد");
        return false;
      }
    }

    for (let i = 0; i < sortedWorkingHours.length - 1; i++) {
      const currentEnd = sortedWorkingHours[i].endTime;
      const nextStart = sortedWorkingHours[i + 1].startTime;

      if (currentEnd > nextStart) {
        toast.error("زمان‌ها نباید با هم تداخل داشته باشند");
        return false;
      }
    }

    return true;
  };

  return (
    <Modal
      isOpen={regularShiftEditModalIsOpen}
      onClose={() => {
        shallowRouter.push("/team/scheduled-shifts");
      }}
      title={`ثبت شیفت هفتگی ${editingWorkingDay.employeeWorkingDays.employee.nickname} برای ${format(
        parseISO(editingWorkingDay.workingDay.day),
        "EEEE",
      )}‌ها`}
    >
      <div className="pb-32">
        <div className="-mt-5 pb-6 text-lg">
          <p>این شیفت‌ها به‌طور هفتگی تکرار می‌شوند.</p>
          <p>هر مقداری که در این صفحه ذخیره کنید، در تمامی هفته‌ها اعمال خواهد شد.</p>
        </div>
        {regularWorkingHours.map((wh, index) => (
          <div key={index} className="grid grid-cols-12 items-end gap-4 mt-4">
            <SelectField
              containerClassName="col-span-5"
              label={"زمان شروع"}
              value={format(wh.startTime ? parseISO(wh.startTime) : defaultStartTime, "HH:mm")}
              onChange={(newValue) => handleStartTimeChange(index, newValue.target.value)}
              options={timeOptions}
            />
            <SelectField
              containerClassName="col-span-5"
              label={"زمان پایان"}
              value={format(wh.endTime ? parseISO(wh.endTime) : addHours(defaultStartTime, 8), "HH:mm")}
              onChange={(newValue) => handleEndTimeChange(index, newValue.target.value)}
              options={timeOptions}
            />
            <button
              className="col-span-2 w-[48px] h-[48px] bg-white rounded-xl p-2"
              onClick={() => handleDelete(index)}
              disabled={regularWorkingHours.length === 1}
            >
              <NextImage
                className="m-auto"
                style={{
                  filter: regularWorkingHours.length === 1 ? "saturate(0) brightness(2.5)" : "",
                }}
                src="/delete.svg"
                alt="حذف این شیفت"
                width={24}
                height={24}
              />
            </button>
          </div>
        ))}
        <div className="flex flex-row justify-between items-center mt-7">
          <button className="flex flex-row items-center gap-2" onClick={handleAddShift}>
            <NextImage src="/circular-plus-purple.svg" alt="افزودن شیفت" width={24} height={24} />
            <span className="font-medium text-lg text-purple-600">افزودن شیفت</span>
          </button>
          <p className="text-lg font-medium">{formatDurationInFarsi(computeTotalMinutes())}</p>
        </div>
        <div className="flex fixed bottom-0 w-[100vw] -mx-5 bg-white border-t py-5 px-5">
          <div className="relative w-full me-2.5">
            {editingWorkingDay.workingDay.regularWorkingHours.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  modifyRegularShiftForEmployee(
                    editingWorkingDay.employeeWorkingDays.employee.id,
                    [],
                    parseISO(editingWorkingDay.workingDay.day),
                  ).then(({ data, response }) => {
                    if (response.status !== 200) toast.error("ویرایش شیفت‌ها با مشکل مواجه شد");
                    else {
                      shallowRouter.push("/team/scheduled-shifts");
                      setRegularWorkingHours(data);
                      if (onSave)
                        onSave({
                          employee: editingWorkingDay.employeeWorkingDays.employee,
                          day: editingWorkingDay.workingDay.day,
                          workingHours: editingWorkingDay.workingDay.workingHours,
                          regularWorkingHours: data,
                        });
                    }
                  });
                }}
                className="w-full text-red-500 font-medium p-3 bg-white border rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300"
              >
                حذف روز
              </button>
            ) : (
              <button
                type="button"
                onClick={() => shallowRouter.push("/team/scheduled-shifts")}
                className="w-full p-3 bg-white text-black border rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300"
              >
                بستن
              </button>
            )}
          </div>
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => {
                modifyRegularShiftForEmployee(
                  editingWorkingDay.employeeWorkingDays.employee.id,
                  regularWorkingHours,
                  parseISO(editingWorkingDay.workingDay.day),
                ).then(({ data, response }) => {
                  if (response.status !== 200) toast.error("ویرایش شیفت‌ها با مشکل مواجه شد");
                  else {
                    shallowRouter.push("/team/scheduled-shifts");
                    setRegularWorkingHours(data);
                    if (onSave)
                      onSave({
                        employee: editingWorkingDay.employeeWorkingDays.employee,
                        day: editingWorkingDay.workingDay.day,
                        workingHours: editingWorkingDay.workingDay.workingHours,
                        regularWorkingHours: data,
                      });
                  }
                });
              }}
              className={
                "w-full font-medium p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 bg-black"
              }
            >
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
