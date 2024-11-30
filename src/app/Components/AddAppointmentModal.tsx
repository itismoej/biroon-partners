import { BottomSheet } from "@/app/Components/BottomSheet";
import { DatePicker } from "@/app/Components/DatePicker";
import { Modal } from "@/app/Components/Modal";
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
import { formatPriceWithSeparator, toFarsiDigits, useShallowRouter } from "@/app/utils";
import CustomerSelectionModal from "@/components/CustomerSelectionModal";
import type FullCalendar from "@fullcalendar/react";
import { addDays, addMinutes, format, setHours, setMinutes, setSeconds, startOfDay } from "date-fns-jalali";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  location: Location | undefined;
  calendarRef: React.RefObject<FullCalendar>;
}

interface DateHeaderButtonProps {
  currentDate: Date;
  onClick: () => void;
}

const DateHeaderButton: React.FC<DateHeaderButtonProps> = ({ currentDate, onClick }) => (
  <button className="flex flex-row gap-2" type="button" onClick={onClick}>
    <h1 className="text-3xl font-bold">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</h1>
    <img src="/dropdown.svg" />
  </button>
);

interface TopBarDateHeaderButtonProps {
  currentDate: Date;
  onClick: () => void;
}

const TopBarDateHeaderButton: React.FC<TopBarDateHeaderButtonProps> = ({ currentDate, onClick }) => (
  <button className="flex flex-row gap-2" type="button" onClick={onClick}>
    <h1 className="text-xl font-bold">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</h1>
    <img src="/dropdown.svg" />
  </button>
);

interface CustomerSelectionButtonProps {
  newAppointmentCustomer: Customer | null;
  onClick: () => void;
}

const CustomerSelectionButton: React.FC<CustomerSelectionButtonProps> = ({
  newAppointmentCustomer,
  onClick,
}) =>
  newAppointmentCustomer ? (
    <button
      type="button"
      className="flex w-full flex-row justify-between items-center rounded-lg border border-gray-200 py-6 px-6 border-l-4 border-l-purple-400"
      onClick={onClick}
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
      onClick={onClick}
    >
      <div className="text-right">
        <p className="text-xl font-normal">افزودن مشتری</p>
        <p className="text-md text-gray-500">برای مشتری حضوری خالی بگذارید</p>
      </div>
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
        <img src="/person-plus.svg" className="w-7 h-7" />
      </div>
    </button>
  );

interface DateTimeSelectionProps {
  currentDate: Date;
  newAppointmentTime: Date;
  onDateClick: () => void;
  onTimeClick: () => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  currentDate,
  newAppointmentTime,
  onDateClick,
  onTimeClick,
}) => (
  <div className="mt-7 flex flex-row justify-between items-center rounded-lg border border-gray-200 py-7 px-7">
    <button className="flex flex-row gap-2" type="button" onClick={onDateClick}>
      <img src="/calendar.svg" className="w-6 h-6" />
      <span className="text-lg font-normal">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</span>
    </button>
    <button className="flex flex-row gap-2" type="button" onClick={onTimeClick}>
      <img src="/time.svg" className="w-6 h-6" />
      <span className="text-lg font-normal">{toFarsiDigits(format(newAppointmentTime, "HH:mm"))}</span>
    </button>
  </div>
);

interface ServiceSelectionButtonProps {
  selectedServiceToAddInNewAppointment: Service | undefined;
  newAppointmentTime: Date;
  selectedEmployeeForNewAppointment: AvailableEmployee | undefined;
  onClick: () => void;
}

const ServiceSelectionButton: React.FC<ServiceSelectionButtonProps> = ({
  selectedServiceToAddInNewAppointment,
  newAppointmentTime,
  selectedEmployeeForNewAppointment,
  onClick,
}) =>
  selectedServiceToAddInNewAppointment && selectedEmployeeForNewAppointment ? (
    <button
      type="button"
      className="w-full flex flex-row gap-4 items-center bg-white py-2 rounded-xl active:inner-w-8"
      onClick={onClick}
    >
      <div className="h-[70px] w-[4px] bg-purple-300 rounded-full" />
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-4 justify-between">
          <h3 className="text-lg font-normal">{selectedServiceToAddInNewAppointment.name}</h3>
          <h3 className="text-lg font-normal text-nowrap">
            {toFarsiDigits(formatPriceWithSeparator(selectedEmployeeForNewAppointment.price))}
            <span className="text-xs font-light text-gray-500"> تومان</span>
          </h3>
        </div>
        <p className="font-normal text-gray-500 text-start">
          <span>{toFarsiDigits(format(newAppointmentTime, "HH:mm"))}</span>
          <span className="mx-2 inline-block translate-y-[1px]">•</span>
          <span>{selectedEmployeeForNewAppointment.formattedDuration}</span>
          <span className="mx-2 inline-block translate-y-[1px]">•</span>
          <span>{selectedEmployeeForNewAppointment.nickname}</span>
        </p>
      </div>
    </button>
  ) : (
    <div className="mt-4 flex flex-col justify-between items-center rounded-lg border border-gray-200 py-7 px-16">
      <img src="/service.png" className="w-16 h-16" />
      <p className="text-lg text-gray-500 text-center mt-4">برای ذخیره‌ی این نوبت یک سرویس اضافه کنید</p>
      <button
        className="mt-6 flex flex-row rounded-full px-4 py-2 gap-2 border border-gray-300"
        type="button"
        onClick={onClick}
      >
        <img src="/circular-plus.svg" className="w-6 h-6" />
        <span className="text-lg font-normal">افزودن سرویس</span>
      </button>
    </div>
  );

interface ActionButtonsProps {
  onClose: () => void;
  onSave: () => void;
  saveDisabled: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onClose, onSave, saveDisabled }) => (
  <div className="flex fixed bottom-0 w-[100vw] -mx-5 bg-white border-t py-5 px-5">
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
        disabled={saveDisabled}
        onClick={onSave}
        className={`w-full p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 ${
          saveDisabled ? "bg-gray-300 active:transform-none active:filter-none" : "bg-black"
        }`}
      >
        ذخیره
      </button>
    </div>
  </div>
);

interface EmployeeTileProps {
  employee: AvailableEmployee;
  onSelect: (employee: AvailableEmployee) => void;
}

const EmployeeTileComponent: React.FC<EmployeeTileProps> = ({ employee, onSelect }) => (
  <Tile employee={employee} selectedEmployeeId={"none"} onTileChange={() => onSelect(employee)} />
);

const EmployeeTilesLoading: React.FC = () => (
  <>
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
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
    ))}
  </>
);

interface TimePickerListItemProps {
  time: Date;
  selected: boolean;
  onSelect: (time: Date) => void;
}

const TimePickerListItem: React.FC<TimePickerListItemProps> = ({ time, selected, onSelect }) => (
  <li
    key={time.toISOString()}
    className={`flex flex-row content-start px-2 justify-${selected ? "between" : "end"} items-center text-2xl py-4 text-left`}
    onClick={() => onSelect(time)}
  >
    {selected && <img src="/check.svg" className="invert" />}
    <p>{toFarsiDigits(format(time, "HH:mm"))}</p>
  </li>
);

// Now the main component

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  setCurrentDate,
  location,
  calendarRef,
}) => {
  const pathname = usePathname();
  const shallowRouter = useShallowRouter();
  const [selectDateInAddAppointmentModalBSIsOpen, setSelectDateInAddAppointmentModalBSIsOpen] =
    useState(false);
  const [selectTimeInAddAppointmentModalBSIsOpen, setSelectTimeInAddAppointmentModalBSIsOpen] =
    useState(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<Date>(
    setMinutes(setSeconds(new Date(), 0), 0),
  );
  const addServiceInNewAppointmentIsOpen = pathname.endsWith("/select-service");
  const [createCustomerModalIsOpen, setCreateCustomerModalIsOpen] = useState(false);
  const [newAppointmentCustomer, setNewAppointmentCustomer] = useState<Customer | null>(null);
  const [selectedServiceToAddInNewAppointment, setSelectedServiceToAddInNewAppointment] = useState<
    Service | undefined
  >();
  const [tempSelectedServiceToAddInNewAppointment, setTempSelectedServiceToAddInNewAppointment] = useState<
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
        <DateHeaderButton
          currentDate={currentDate}
          onClick={() => setSelectDateInAddAppointmentModalBSIsOpen(true)}
        />
      }
      topBarTitle={
        <TopBarDateHeaderButton
          currentDate={currentDate}
          onClick={() => setSelectDateInAddAppointmentModalBSIsOpen(true)}
        />
      }
    >
      <div className="pb-32">
        <div className="-mx-5 mt-2 mb-6">
          <hr />
        </div>
        {/* Customer Selection */}
        <CustomerSelectionButton
          newAppointmentCustomer={newAppointmentCustomer}
          onClick={() => setCreateCustomerModalIsOpen(true)}
        />
        {/* Date and Time Selection */}
        <DateTimeSelection
          currentDate={currentDate}
          newAppointmentTime={newAppointmentTime}
          onDateClick={() => setSelectDateInAddAppointmentModalBSIsOpen(true)}
          onTimeClick={() => setSelectTimeInAddAppointmentModalBSIsOpen(true)}
        />
        {/* Service Selection */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold">سرویس</h2>
          <ServiceSelectionButton
            selectedServiceToAddInNewAppointment={selectedServiceToAddInNewAppointment}
            newAppointmentTime={newAppointmentTime}
            selectedEmployeeForNewAppointment={selectedEmployeeForNewAppointment}
            onClick={() => {
              shallowRouter.push(`${pathname}/select-service`);
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        onClose={onClose}
        onSave={() => {
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
              shallowRouter.push("/calendar");
              calendarRef.current.getApi().gotoDate(currentDate);
            } else {
              response.text().then((error) => {
                console.log(error);
              });
              console.log(response.status);
            }
          });
        }}
        saveDisabled={!selectedServiceToAddInNewAppointment || !selectedEmployeeForNewAppointment}
      />

      {/* Date Picker BottomSheet */}
      <BottomSheet
        isOpen={selectDateInAddAppointmentModalBSIsOpen}
        onClose={() => setSelectDateInAddAppointmentModalBSIsOpen(false)}
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
        onClose={() => setSelectTimeInAddAppointmentModalBSIsOpen(false)}
        title="زمان شروع"
      >
        <ul>
          {Array.from({ length: 24 * 4 }, (_, i) => addMinutes(startOfDay(new Date()), i * 15)).map(
            (time) => (
              <TimePickerListItem
                key={time.toISOString()}
                time={time}
                selected={format(time, "HH:mm") === format(newAppointmentTime, "HH:mm")}
                onSelect={(selectedTime) => {
                  setNewAppointmentTime(selectedTime);
                  setSelectTimeInAddAppointmentModalBSIsOpen(false);
                }}
              />
            ),
          )}
        </ul>
      </BottomSheet>

      {/* Service Selection Modal */}
      {location && (
        <Modal
          isOpen={addServiceInNewAppointmentIsOpen}
          onClose={() => {
            shallowRouter.push(pathname.slice(0, -"/select-service".length));
          }}
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
                          setTempSelectedServiceToAddInNewAppointment(svc);
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
                            <h3 className="text-lg font-normal text-nowrap">
                              {svc.priceType === "STARTS_AT" && <span className="text-base">از </span>}
                              {toFarsiDigits(formatPriceWithSeparator(svc.price))}
                              <span className="text-xs font-light text-gray-500"> تومان</span>
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
        </Modal>
      )}

      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        isOpen={createCustomerModalIsOpen}
        onClose={() => setCreateCustomerModalIsOpen(false)}
        setNewAppointmentCustomer={setNewAppointmentCustomer}
      />

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
            availableEmployeesByService.employees.length > 0 ? (
              availableEmployeesByService.employees.map((employee) => (
                <EmployeeTileComponent
                  key={employee.id}
                  employee={employee}
                  onSelect={(selectedEmployee) => {
                    setSelectedServiceToAddInNewAppointment(tempSelectedServiceToAddInNewAppointment);
                    setTempSelectedServiceToAddInNewAppointment(undefined);
                    setSelectedEmployeeForNewAppointment(selectedEmployee);
                    setSelectEmployeeBSIsOpen(false);

                    shallowRouter.push(pathname.slice(0, -"/select-service".length));
                  }}
                />
              ))
            ) : (
              <div className="text-lg border text-center p-8 py-24 rounded-xl">
                متأسفانه در حال حاضر هیچ متخصصی این سرویس را ارائه نمی‌کند
              </div>
            )
          ) : (
            <EmployeeTilesLoading />
          )}
        </div>
      </BottomSheet>
    </Modal>
  );
};
