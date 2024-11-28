import { InputField } from "@/app/Components/FormFields";
import { Modal } from "@/app/Components/Modal";
import PhoneNumberInput from "@/components/Common/PhoneNumberInput";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function AddNewCustomerModal({ isOpen, onClose }: Props) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن مشتری جدید">
      <div className="flex flex-col gap-6">
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
    </Modal>
  );
}

export default AddNewCustomerModal;
