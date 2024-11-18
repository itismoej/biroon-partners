import { BottomSheet } from "@/app/Components/BottomSheet";
import { DatePicker } from "@/app/Components/DatePicker";
import { Modal as CustomModal, Modal } from "@/app/Components/Modal";
import { Tile } from "@/app/Components/Tile";
import {
  type AvailableEmployee,
  type AvailableEmployeesByService,
  type Customer,
  type Location,
  type Service,
  createReservation,
  fetchAvailableEmployeesByService,
} from "@/app/api";
import { formatPriceInFarsi, toFarsiDigits } from "@/app/utils";
import { addDays, addMinutes, format, setHours, setMinutes, setSeconds, startOfDay } from "date-fns-jalali";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import type FullCalendar from "@fullcalendar/react";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  clients: Customer[];
  location: Location | undefined;
  calendarRef: React.RefObject<FullCalendar>;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  setCurrentDate,
  clients,
  calendarRef,
  location,
}) => {
  const [selectDateInAddAppointmentModalBSIsOpen, setSelectDateInAddAppointmentModalBSIsOpen] =
    useState(false);
  const [selectTimeInAddAppointmentModalBSIsOpen, setSelectTimeInAddAppointmentModalBSIsOpen] =
    useState(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<Date>(
    setMinutes(setSeconds(new Date(), 0), 0),
  );
  const [addServiceInNewAppointmentIsOpen, setAddServiceInNewAppointmentIsOpen] = useState(false);
  const [createCustomerModalIsOpen, setCreateCustomerModalIsOpen] = useState(false);
  const [newAppointmentCustomer, setNewAppointmentCustomer] = useState<Customer | null>(null);
  const [selectedServiceToAddInNewAppointment, setSelectedServiceToAddInNewAppointment] = useState<
    Service | undefined
  >();
  const [availableEmployeesByService, setAvailableEmployeesByService] = useState<
    AvailableEmployeesByService | undefined
  >();
  const [selectedEmployeeForNewAppointment, setSelectedEmployeeForNewAppointment] = useState<
    AvailableEmployee | undefined
  >();
  const [selectEmployeeBSIsOpen, setSelectEmployeeBSIsOpen] = useState<boolean>(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <button
          className="flex flex-row gap-2"
          type="button"
          onClick={() => {
            setSelectDateInAddAppointmentModalBSIsOpen(true);
          }}
        >
          <h1 className="text-3xl font-bold">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</h1>
          <img src="/dropdown.svg" />
        </button>
      }
      topBarTitle={
        <button
          className="flex flex-row gap-2"
          type="button"
          onClick={() => {
            setSelectDateInAddAppointmentModalBSIsOpen(true);
          }}
        >
          <h1 className="text-xl font-bold">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</h1>
          <img src="/dropdown.svg" />
        </button>
      }
    >
      <div className="pb-12">
        <div className="-mx-5 mt-2 mb-6">
          <hr />
        </div>
        {/* Customer Selection */}
        {newAppointmentCustomer ? (
          <button
            type="button"
            className="flex w-full flex-row justify-between items-center rounded-lg border border-gray-200 py-6 px-6 border-l-4 border-l-purple-400"
            onClick={() => setCreateCustomerModalIsOpen(true)}
          >
            <img src="/right.svg" className="w-6 h-6" />
            <div className="text-left">
              <p className="text-xl font-medium" style={{ direction: "ltr" }}>
                {toFarsiDigits(
                  `${newAppointmentCustomer.user.username.slice(0, 3)} ${newAppointmentCustomer.user.username.slice(
                    3,
                    6,
                  )} ${newAppointmentCustomer.user.username.slice(6, 9)} ${newAppointmentCustomer.user.username.slice(
                    9,
                  )}`,
                )}
              </p>
            </div>
          </button>
        ) : (
          <button
            type="button"
            className="flex w-full flex-row justify-between items-center rounded-lg border border-gray-200 py-7 px-7"
            onClick={() => setCreateCustomerModalIsOpen(true)}
          >
            <div className="text-right">
              <p className="text-xl font-normal">افزودن مشتری</p>
              <p className="text-md text-gray-500">برای مشتری حضوری خالی بگذارید</p>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <img src="/person-plus.svg" className="w-7 h-7" />
            </div>
          </button>
        )}
        {/* Date and Time Selection */}
        <div className="mt-7 flex flex-row justify-between items-center rounded-lg border border-gray-200 py-7 px-7">
          <button
            className="flex flex-row gap-2"
            type="button"
            onClick={() => {
              setSelectDateInAddAppointmentModalBSIsOpen(true);
            }}
          >
            <img src="/calendar.svg" className="w-6 h-6" />
            <span className="text-lg font-normal">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</span>
          </button>
          <button
            className="flex flex-row gap-2"
            type="button"
            onClick={() => {
              setSelectTimeInAddAppointmentModalBSIsOpen(true);
            }}
          >
            <img src="/time.svg" className="w-6 h-6" />
            <span className="text-lg font-normal">{toFarsiDigits(format(newAppointmentTime, "HH:mm"))}</span>
          </button>
        </div>
        {/* Service Selection */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold">سرویس</h2>
          {selectedServiceToAddInNewAppointment ? (
            <button
              type="button"
              className="w-full -mx-2 flex flex-row gap-4 items-center bg-white p-2 rounded-xl active:inner-w-8"
              onClick={() => {
                setAddServiceInNewAppointmentIsOpen(true);
              }}
            >
              <div className="h-[70px] w-[4px] bg-purple-300 rounded-full" />
              <div className="flex flex-col w-full">
                <div className="flex flex-row gap-4 justify-between">
                  <h3 className="text-xl font-normal">{selectedServiceToAddInNewAppointment.name}</h3>
                  <h3 className="text-xl font-normal">
                    {formatPriceInFarsi(selectedServiceToAddInNewAppointment.price)}
                  </h3>
                </div>
                <p className="text-lg font-normal text-gray-500 text-start">
                  <span>{toFarsiDigits(format(newAppointmentTime, "HH:mm"))}</span>
                  <span className="text-xl mx-2 inline-block translate-y-[1px]">•</span>
                  <span>{selectedServiceToAddInNewAppointment.formattedDuration}</span>
                  {selectedEmployeeForNewAppointment && (
                    <>
                      <span className="text-xl mx-2 inline-block translate-y-[1px]">•</span>
                      <span>{selectedEmployeeForNewAppointment.nickname}</span>
                    </>
                  )}
                </p>
              </div>
            </button>
          ) : (
            <div className="mt-4 flex flex-col justify-between items-center rounded-lg border border-gray-200 py-7 px-16">
              <img src="/service.png" className="w-16 h-16" />
              <p className="text-lg text-gray-500 text-center mt-4">
                برای ذخیره‌ی این نوبت یک سرویس اضافه کنید
              </p>
              <button
                className="mt-6 flex flex-row rounded-full px-4 py-2 gap-2 border border-gray-300"
                type="button"
                onClick={() => setAddServiceInNewAppointmentIsOpen(true)}
              >
                <img src="/circular-plus.svg" className="w-6 h-6" />
                <span className="text-lg font-normal">افزودن سرویس</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex sticky w-[100vw] -mx-5 bottom-0 bg-white border-t py-5 px-5">
        <div className="relative w-full me-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full p-3 bg-white text-black border rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300"
          >
            بستن
          </button>
        </div>
        <div className="relative w-full">
          <button
            type="button"
            disabled={!selectedServiceToAddInNewAppointment || !selectedEmployeeForNewAppointment}
            onClick={() => {
              if (!selectedServiceToAddInNewAppointment || !selectedEmployeeForNewAppointment) {
                toast.error("ابتدا یک سرویس انتخاب کنید", {
                  duration: 5000,
                  position: "top-center",
                  className: "w-full font-medium",
                });
                return;
              }

              createReservation({
                customerId: newAppointmentCustomer ? newAppointmentCustomer.id : undefined,
                startDateTime: setMinutes(
                  setHours(currentDate, newAppointmentTime.getHours()),
                  newAppointmentTime.getMinutes(),
                ).toISOString(),
                cartInput: [
                  {
                    serviceId: selectedServiceToAddInNewAppointment.id,
                    employeeAssociations: [selectedEmployeeForNewAppointment.id],
                  },
                ],
              }).then(({ data, response }) => {
                if (response.status === 201 && calendarRef.current) {
                  calendarRef.current.getApi().addEvent({
                    id: data.id,
                    title: selectedServiceToAddInNewAppointment.name,
                    start: data.startDateTime,
                    end: data.endDateTime,
                    editable: true,
                    resourceId: selectedEmployeeForNewAppointment.id,
                  });
                  toast.success(
                    `نوبت «${selectedServiceToAddInNewAppointment.name}» با متخصص «${selectedEmployeeForNewAppointment.nickname}» در «${toFarsiDigits(
                      format(currentDate, "EEEE، d MMMM y"),
                    )}» اضافه شد.`,
                    {
                      duration: 5000,
                      position: "top-center",
                      className: "w-full font-medium",
                    },
                  );
                  onClose();
                  calendarRef.current.getApi().gotoDate(currentDate);
                } else {
                  response.text().then((error) => {
                    console.log(error);
                  });
                  console.log(response.status);
                }
              });
            }}
            className={`w-full p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 ${
              selectedServiceToAddInNewAppointment
                ? "bg-black"
                : "bg-gray-300 active:transform-none active:filter-none"
            }`}
          >
            ذخیره
          </button>
        </div>
      </div>

      {/* Date Picker BottomSheet */}
      <BottomSheet
        isOpen={selectDateInAddAppointmentModalBSIsOpen}
        onClose={() => {
          setSelectDateInAddAppointmentModalBSIsOpen(false);
        }}
      >
        <DatePicker
          selectedDate={currentDate}
          onDateSelect={(date) => {
            if (calendarRef.current) {
              calendarRef.current.getApi().gotoDate(date);
              setCurrentDate(date);
              setSelectDateInAddAppointmentModalBSIsOpen(false);
            }
          }}
        />
        <div className="mt-9">
          <button
            type="button"
            className={"px-5 py-2 text-xl border rounded-full me-1"}
            onClick={() => {
              if (calendarRef.current) {
                const today = new Date();
                calendarRef.current.getApi().gotoDate(today);
                setCurrentDate(today);
                setSelectDateInAddAppointmentModalBSIsOpen(false);
              }
            }}
          >
            امروز
          </button>
          <button
            type="button"
            className={"px-5 py-2 text-xl border rounded-full me-1"}
            onClick={() => {
              if (calendarRef.current) {
                const tomorrow = addDays(new Date(), 1);
                calendarRef.current.getApi().gotoDate(tomorrow);
                setCurrentDate(tomorrow);
                setSelectDateInAddAppointmentModalBSIsOpen(false);
              }
            }}
          >
            فردا
          </button>
        </div>
      </BottomSheet>

      {/* Time Picker BottomSheet */}
      <BottomSheet
        isOpen={selectTimeInAddAppointmentModalBSIsOpen}
        onClose={() => {
          setSelectTimeInAddAppointmentModalBSIsOpen(false);
        }}
        title="زمان شروع"
      >
        <ul>
          {Array.from({ length: 24 * 4 }, (_, i) => addMinutes(startOfDay(new Date()), i * 15)).map((time) =>
            format(time, "HH:mm") === format(newAppointmentTime, "HH:mm") ? (
              <li
                key={time.toISOString()}
                className="flex flex-row content-start px-2 justify-between items-center text-2xl py-4 text-left"
                onClick={() => {
                  setNewAppointmentTime(time);
                  setSelectTimeInAddAppointmentModalBSIsOpen(false);
                }}
              >
                <img src="/check.svg" className="invert" />
                <p>{toFarsiDigits(format(time, "HH:mm"))}</p>
              </li>
            ) : (
              <li
                key={time.toISOString()}
                className="flex flex-row content-start px-2 justify-end items-center text-2xl py-4 text-left"
                onClick={() => {
                  setNewAppointmentTime(time);
                  setSelectTimeInAddAppointmentModalBSIsOpen(false);
                }}
              >
                <p>{toFarsiDigits(format(time, "HH:mm"))}</p>
              </li>
            ),
          )}
        </ul>
      </BottomSheet>

      {/* Service Selection Modal */}
      {location && (
        <CustomModal
          isOpen={addServiceInNewAppointmentIsOpen}
          onClose={() => setAddServiceInNewAppointmentIsOpen(false)}
          title={<span className="text-3xl font-bold">انتخاب سرویس</span>}
          topBarTitle={<span className="text-xl font-bold">انتخاب سرویس</span>}
        >
          <div className="pb-12">
            <div className="-mx-5 mt-2 mb-6">
              <hr />
            </div>
            <div className="flex flex-col gap-8">
              {location.serviceCatalog.map((category) => (
                <div key={category.id}>
                  <div className="flex flex-row gap-3">
                    <h2 className="text-2xl font-medium mb-4">{category.name}</h2>
                    <div className="w-6 h-6 flex items-center justify-center text-md bg-gray-200 text-gray-500 rounded-full font-bold">
                      <span className="translate-y-[2px]">{toFarsiDigits(category.items.length)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {category.items.map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        className="-mx-2 flex flex-row gap-4 items-center bg-white p-2 rounded-xl active:inner-w-8"
                        onClick={() => {
                          setSelectedServiceToAddInNewAppointment(svc);
                          setSelectEmployeeBSIsOpen(true);

                          fetchAvailableEmployeesByService(svc.id).then(({ data }) => {
                            setAvailableEmployeesByService(data);
                          });
                        }}
                      >
                        <div className="h-[70px] w-[4px] bg-purple-300 rounded-full" />
                        <div className="flex flex-col w-full">
                          <div className="flex flex-row gap-4 justify-between">
                            <h3 className="text-lg font-normal">{svc.name}</h3>
                            <h3 className="font-normal text-lg">
                              {toFarsiDigits(formatPriceInFarsi(svc.price))}
                            </h3>
                          </div>
                          <p className="font-normal text-gray-500 text-start">{svc.formattedDuration}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CustomModal>
      )}

      {/* Customer Selection Modal */}
      <CustomModal
        isOpen={createCustomerModalIsOpen}
        onClose={() => setCreateCustomerModalIsOpen(false)}
        title="انتخاب مشتری"
      >
        <hr className="-mx-5" />
        <ul className="-mx-5">
          <li>
            <button className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5">
              <div className="h-16 w-16 flex items-center justify-center bg-purple-100 rounded-full">
                <img src="/plus-purple.svg" className="w-7 h-7" />
              </div>
              <p className="font-medium text-lg">افزودن مشتری جدید</p>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5"
              onClick={() => {
                setNewAppointmentCustomer(null);
                setCreateCustomerModalIsOpen(false);
              }}
            >
              <div className="h-16 w-16 flex items-center justify-center bg-purple-100 rounded-full">
                <img src="/walk-in.svg" className="w-8 h-8" />
              </div>
              <p className="font-medium text-lg">مراجعه‌‌کننده‌ی حضوری</p>
            </button>
          </li>
        </ul>
        {clients.length > 0 && (
          <>
            <hr />
            <ul className="-mx-5">
              {clients.map((customer) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5"
                    onClick={() => {
                      setNewAppointmentCustomer(customer);
                      setCreateCustomerModalIsOpen(false);
                    }}
                  >
                    <div className="h-16 w-16 flex items-center justify-center bg-purple-100 rounded-full">
                      <img src="/person-purple.svg" className="w-7 h-7" />
                    </div>
                    <p className="font-medium text-lg" style={{ direction: "ltr" }}>
                      {toFarsiDigits(
                        `${customer.user.username.slice(0, 3)} ${customer.user.username.slice(
                          3,
                          6,
                        )} ${customer.user.username.slice(6, 9)} ${customer.user.username.slice(9)}`,
                      )}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </CustomModal>

      {/* Employee Selection BottomSheet */}
      <BottomSheet
        isOpen={selectEmployeeBSIsOpen}
        onClose={() => {
          setSelectEmployeeBSIsOpen(false);
          setAvailableEmployeesByService(undefined);
        }}
        title="انتخاب متخصص"
      >
        <div
          className={`flex gap-4 overflow-x-auto -mx-5 px-5${
            availableEmployeesByService ? "" : " animate-pulse"
          }`}
          style={{ scrollbarWidth: "none" }}
        >
          {availableEmployeesByService ? (
            availableEmployeesByService.employees.map((employee) => (
              <Tile
                key={employee.id}
                employee={employee}
                selectedEmployeeId={"none"}
                onTileChange={(employee) => {
                  setSelectedEmployeeForNewAppointment(employee);
                  setSelectEmployeeBSIsOpen(false);
                  setAddServiceInNewAppointmentIsOpen(false);
                }}
              />
            ))
          ) : (
            <>
              <div
                className={
                  "flex justify-center h-[196px] pt-12 pb-7 px-9 min-w-[168px] cursor-pointer border-2 rounded-lg border-gray-200"
                }
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-[60px] h-[60px] rounded-full mb-6 bg-gray-200" />
                  <div className="w-[100px] h-[14px] rounded-full bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-2 bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-4 bg-gray-200" />
                </div>
              </div>
              <div
                className={
                  "flex justify-center h-[196px] pt-12 pb-7 px-9 min-w-[168px] cursor-pointer border-2 rounded-lg border-gray-200"
                }
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-[60px] h-[60px] rounded-full mb-6 bg-gray-200" />
                  <div className="w-[100px] h-[14px] rounded-full bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-2 bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-4 bg-gray-200" />
                </div>
              </div>
              <div
                className={
                  "flex justify-center h-[196px] pt-12 pb-7 px-9 min-w-[168px] cursor-pointer border-2 rounded-lg border-gray-200"
                }
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-[60px] h-[60px] rounded-full mb-6 bg-gray-200" />
                  <div className="w-[100px] h-[14px] rounded-full bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-2 bg-gray-200" />
                  <div className="w-[40px] h-[14px] rounded-full mt-4 bg-gray-200" />
                </div>
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </Modal>
  );
};
