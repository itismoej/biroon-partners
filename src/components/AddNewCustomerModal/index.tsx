import { InputField } from "@/app/Components/FormFields";
import { Modal } from "@/app/Components/Modal";
import { type Customer, createCustomer } from "@/app/api";
import { toEnglishDigits } from "@/app/utils";
import PhoneNumberInput from "@/components/Common/PhoneNumberInput";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  customersList: Customer[];
  setCustomersList: (customers: Customer[]) => void;
  onClose: () => void;
};

function AddNewCustomerModal({ isOpen, customersList, setCustomersList, onClose }: Props) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن مشتری جدید">
      <div className="flex flex-col gap-6 mb-[80px]">
        <div className="bg-purple-100 rounded-full w-[120px] h-[120px] flex items-center justify-center">
          <img src="/person-purple.svg" alt="person" className="w-16 h-16" />
        </div>
        <div className="grid grid-cols-2 gap-6 mt-4">
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

        <PhoneNumberInput value={phoneNumber} setValue={setPhoneNumber} />
      </div>
      <div className="fixed bottom-0 right-0 w-full px-5 pb-4 z-[2]">
        <button
          className="w-full bg-black text-white font-bold rounded-lg text-xl py-3"
          type="button"
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
              createCustomer({
                firstName,
                lastName,
                phoneNumber: cleanedPhoneNumber,
              }).then(({ data, response }) => {
                if (response.status !== 201) {
                  toast.error("افزودن مشتری جدید با خطا مواجه شد", {
                    duration: 5000,
                    position: "top-center",
                    className: "w-full font-medium",
                  });
                } else {
                  toast.success(`مشتری «${data?.user?.fullName}» با موفقیت به کسب‌وکار اضافه شد`, {
                    duration: 5000,
                    position: "top-center",
                    className: "w-full font-medium",
                  });
                  setPhoneNumber("")
                  setFirstName("")
                  setLastName("")
                  setCustomersList([...customersList, data]);
                  onClose();
                }
              });
            }
          }}
        >
          افزودن عضو جدید
        </button>
      </div>
    </Modal>
  );
}

export default AddNewCustomerModal;
