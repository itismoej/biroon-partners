import { BottomSheet } from "@/app/Components/BottomSheet";
import { DatePicker } from "@/app/Components/DatePicker";
import { Modal } from "@/app/Components/Modal";
import {
  type AvailableEmployee,
  type CalendarEvent,
  type Customer,
  type Service,
  fetchEvent,
  updateEvent,
} from "@/app/api";
import { formatPriceWithSeparator, toFarsiDigits, useShallowRouter } from "@/app/utils";
import type FullCalendar from "@fullcalendar/react";
import { addDays, addMinutes, format, setHours, setMinutes, startOfDay } from "date-fns-jalali";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddAppointmentModalProps {
  calendarRef: React.RefObject<FullCalendar>;
}

interface DateHeaderButtonProps {
  currentDate: Date;
  onClick: () => void;
}

const DateHeaderButton: React.FC<DateHeaderButtonProps> = ({ currentDate, onClick }) => (
  <button className="flex flex-row gap-2" type="button" onClick={onClick}>
    <h1 className="text-3xl font-bold">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</h1>
    <img src="/dropdown.svg" alt="dropdown" />
  </button>
);

interface TopBarDateHeaderButtonProps {
  currentDate: Date;
  onClick: () => void;
}

const TopBarDateHeaderButton: React.FC<TopBarDateHeaderButtonProps> = ({
  currentDate,
  onClick,
}) => (
  <button className="flex flex-row gap-2" type="button" onClick={onClick}>
    <h1 className="text-xl font-bold">{toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}</h1>
    <img src="/dropdown.svg" alt="dropdown" />
  </button>
);

interface CustomerSelectionButtonProps {
  newAppointmentCustomer: Customer | null;
  disabled?: boolean;
  onClick: () => void;
}

const CustomerSelectionButton: React.FC<CustomerSelectionButtonProps> = ({
  newAppointmentCustomer,
  disabled,
  onClick,
}) =>
  newAppointmentCustomer ? (
    <button
      type="button"
      className="flex w-full flex-row justify-between items-center rounded-lg border border-gray-200 py-6 px-6 border-l-4 border-l-purple-400"
      onClick={onClick}
      disabled={disabled}
    >
      <img src="/right.svg" className="w-6 h-6" alt="right arrow" />
      <div className="text-left">
        <p className="text-xl font-medium" style={{ direction: "ltr" }}>
          {newAppointmentCustomer?.user?.fullName}
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
        <img src="/person-plus.svg" alt="person plus shape" className="w-7 h-7" />
      </div>
    </button>
  );

interface DateTimeSelectionProps {
  currentDate: Date;
  onDateClick: () => void;
  onTimeClick: () => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  currentDate,
  onDateClick,
  onTimeClick,
}) => {
  return (
    <div className="mt-7 flex flex-row justify-between items-center rounded-lg border border-gray-200 py-7 px-7">
      <button className="flex flex-row gap-2" type="button" onClick={onDateClick}>
        <img src="/calendar.svg" alt="calandar shape" className="w-6 h-6" />
        <span className="text-lg font-normal">
          {toFarsiDigits(format(currentDate, "EEEE dd MMMM"))}
        </span>
      </button>
      <button className="flex flex-row gap-2" type="button" onClick={onTimeClick}>
        <img src="/time.svg" alt="clock shape" className="w-6 h-6" />
        <span className="text-lg font-normal">{toFarsiDigits(format(currentDate, "HH:mm"))}</span>
      </button>
    </div>
  );
};

interface ServiceSelectionButtonProps {
  selectedServiceToAddInNewAppointment: Service | undefined;
  currentDate: Date;
  selectedEmployeeForNewAppointment: AvailableEmployee | undefined;
  onClick: () => void;
}

const ServiceSelectionButton: React.FC<ServiceSelectionButtonProps> = ({
  selectedServiceToAddInNewAppointment,
  currentDate,
  selectedEmployeeForNewAppointment,
  onClick,
}) =>
  selectedServiceToAddInNewAppointment && selectedEmployeeForNewAppointment ? (
    <button
      type="button"
      className="w-full flex flex-row gap-4 items-center bg-white py-2 rounded-xl active:inner-w-8"
      onClick={onClick}
      disabled={true}
    >
      <div className="h-[70px] w-[4px] bg-purple-300 rounded-full" />
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-4 justify-between">
          <h3 className="text-lg font-normal">{selectedServiceToAddInNewAppointment.name}</h3>
          <h3 className="text-lg font-normal text-nowrap">
            {toFarsiDigits(formatPriceWithSeparator(selectedServiceToAddInNewAppointment.price))}
            <span className="text-xs font-light text-gray-500"> تومان</span>
          </h3>
        </div>
        <p className="font-normal text-gray-500 text-start">
          <span>{toFarsiDigits(format(currentDate, "HH:mm"))}</span>
          <span className="mx-2 inline-block translate-y-[1px]">•</span>
          <span>{selectedEmployeeForNewAppointment.formattedDuration}</span>
          <span className="mx-2 inline-block translate-y-[1px]">•</span>
          <span>{selectedEmployeeForNewAppointment.nickname}</span>
        </p>
      </div>
    </button>
  ) : (
    <div className="mt-4 flex flex-col justify-between items-center rounded-lg border border-gray-200 py-7 px-16">
      <img src="/service.png" alt="service" className="w-16 h-16" />
      <p className="text-lg text-gray-500 text-center mt-4">
        برای ذخیرهی این نوبت یک سرویس اضافه کنید
      </p>
      <button
        className="mt-6 flex flex-row rounded-full px-4 py-2 gap-2 border border-gray-300"
        type="button"
        onClick={onClick}
      >
        <img src="/circular-plus.svg" alt="" className="w-6 h-6" />
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
    {selected && <img src="/check.svg" alt="check shapge" className="invert" />}
    <p>{toFarsiDigits(format(time, "HH:mm"))}</p>
  </li>
);

const SkeletonEditEvent: React.FC = () => (
  <div className="animate-pulse flex flex-col w-full px-2 py-4">
    <div className="w-full border border-gray-300 rounded-lg p-[21px]">
      <div className="w-2/3 h-6 bg-gray-300 rounded-full mr-auto" />
    </div>
    <div className="flex justify-between w-full border border-gray-300 rounded-lg p-[21px] mt-6">
      <div className="w-[110px] h-6 bg-gray-300 rounded-full" />
      <div className="w-[70px] h-6 bg-gray-300 rounded-full" />
    </div>
    <div className="w-[80px] h-7 bg-gray-300 rounded-full mt-8" />
    <div className="flex justify-between w-full border border-gray-300 rounded-lg p-[21px] mt-2">
      <div className="flex flex-col gap-2">
        <div className="w-[70px] h-6 bg-gray-300 rounded-full" />
        <div className="w-[110px] h-4 bg-gray-300 rounded-full" />
      </div>
      <div className="w-[60px] h-4 bg-gray-300 rounded-full" />
    </div>
  </div>
);

export const EditEvent: React.FC<AddAppointmentModalProps> = ({ calendarRef }) => {
  const shallowRouter = useShallowRouter();
  const [selectDateInAddAppointmentModalBSIsOpen, setSelectDateInAddAppointmentModalBSIsOpen] =
    useState(false);
  const [selectTimeInAddAppointmentModalBSIsOpen, setSelectTimeInAddAppointmentModalBSIsOpen] =
    useState(false);
  const [selectedServiceToAddInNewAppointment, setSelectedServiceToAddInNewAppointment] = useState<
    Service | undefined
  >();
  const [selectedEmployeeForNewAppointment, setSelectedEmployeeForNewAppointment] = useState<
    AvailableEmployee | undefined
  >();
  const [event, setEvent] = useState<CalendarEvent>({} as CalendarEvent);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const searchParams = useSearchParams();

  useEffect(() => {
    const eventId = searchParams.get("id");
    if (eventId) {
      setIsLoading(true);
      fetchEvent(eventId)
        .then((res) => {
          setEvent(res.data);
          setCurrentDate(new Date(res?.data?.startDateTime));
          if (res?.data?.employee) {
            setSelectedEmployeeForNewAppointment(res.data.employee as unknown as AvailableEmployee);
          }
          if (res?.data?.service) {
            setSelectedServiceToAddInNewAppointment(res.data.service as unknown as Service);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [searchParams]);

  return (
    <>
      <Modal
        isOpen={true}
        onClose={() => {
          shallowRouter.back();
        }}
        title={
          isLoading ? (
            <div className="animate-pulse w-[150px] h-8 bg-gray-300 rounded-full" />
          ) : (
            <DateHeaderButton
              currentDate={currentDate}
              onClick={() => setSelectDateInAddAppointmentModalBSIsOpen(true)}
            />
          )
        }
        topBarTitle={
          <TopBarDateHeaderButton
            currentDate={currentDate}
            onClick={() => setSelectDateInAddAppointmentModalBSIsOpen(true)}
          />
        }
      >
        {isLoading ? (
          <SkeletonEditEvent />
        ) : (
          <>
            <div className="pb-32">
              <div className="-mx-5 mt-2 mb-6">
                <hr />
              </div>
              {/* Customer Selection */}
              <CustomerSelectionButton
                newAppointmentCustomer={event?.reserve?.customer}
                disabled
                onClick={() => {
                  // currently disabled
                }}
              />

              {/* Date and Time Selection */}
              <DateTimeSelection
                currentDate={currentDate}
                onDateClick={() => setSelectDateInAddAppointmentModalBSIsOpen(true)}
                onTimeClick={() => setSelectTimeInAddAppointmentModalBSIsOpen(true)}
              />
              {/* Service Selection */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold">سرویس</h2>
                <ServiceSelectionButton
                  currentDate={currentDate}
                  selectedServiceToAddInNewAppointment={selectedServiceToAddInNewAppointment}
                  selectedEmployeeForNewAppointment={selectedEmployeeForNewAppointment}
                  onClick={() => {
                    console.log("do nothing");
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <ActionButtons
              onClose={() => {
                shallowRouter.back();
              }}
              onSave={() => {
                if (!selectedServiceToAddInNewAppointment || !selectedEmployeeForNewAppointment) {
                  toast.error("ابتدا یک سرویس انتخاب کنید", {
                    duration: 5000,
                    position: "top-center",
                    className: "w-full font-medium",
                  });
                  return;
                }

                updateEvent(event.id, {
                  employeeId: event.employee.id,
                  startDateTime: setMinutes(
                    setHours(currentDate, currentDate.getHours()),
                    currentDate.getMinutes(),
                  ).toISOString(),
                  endDateTime: setMinutes(
                    setHours(currentDate, currentDate.getHours()),
                    currentDate.getMinutes() + event.service.durationInMins,
                  ).toISOString(),
                }).then(({ data, response }) => {
                  if (response.status === 200 && calendarRef.current) {
                    calendarRef.current.getApi().getEventById(event.id)?.remove();
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
                      )}» ویرایش شد.`,
                      {
                        duration: 5000,
                        position: "top-center",
                        className: "w-full font-medium",
                      },
                    );
                    shallowRouter.back();
                    calendarRef.current.getApi().gotoDate(currentDate);
                  } else {
                    response.text().then((error) => {
                      console.log(error);
                    });
                    console.log(response.status);
                  }
                });
              }}
              saveDisabled={
                !selectedServiceToAddInNewAppointment || !selectedEmployeeForNewAppointment
              }
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
                {Array.from({ length: 24 * 4 }, (_, i) =>
                  addMinutes(startOfDay(currentDate), i * 15),
                ).map((time) => (
                  <TimePickerListItem
                    key={time.toISOString()}
                    time={time}
                    selected={format(time, "HH:mm") === format(currentDate, "HH:mm")}
                    onSelect={(selectedTime) => {
                      setCurrentDate(selectedTime);
                      setSelectTimeInAddAppointmentModalBSIsOpen(false);
                    }}
                  />
                ))}
              </ul>
            </BottomSheet>
          </>
        )}
      </Modal>
    </>
  );
};

export default EditEvent;
