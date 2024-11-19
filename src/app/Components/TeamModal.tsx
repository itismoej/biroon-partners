import { Modal } from "@/app/Components/Modal";
import NextImage from "next/image";
import type React from "react";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تیم متخصصان">
      <div className="border rounded-xl p-2 flex flex-col">
        <button className="flex flex-row rounded-lg bg-white p-4 justify-between items-center">
          <div className="flex flex-row gap-4 items-center">
            <NextImage width={24} height={24} src="/team.svg" alt="تیم متخصصان" />
            <span className="text-lg font-medium">اعضای تیم</span>
          </div>
          <NextImage width={24} height={24} src="/left.svg" alt="صفحه‌ی متخصصان" />
        </button>
        <button className="flex flex-row rounded-lg bg-white p-4 justify-between items-center">
          <div className="flex flex-row gap-4 items-center">
            <NextImage width={24} height={24} src="/scheduled-shifts.svg" alt="تیم متخصصان" />
            <span className="text-lg font-medium">شیفت‌های منظم هفتگی</span>
          </div>
          <NextImage width={24} height={24} src="/left.svg" alt="صفحه‌ی متخصصان" />
        </button>
      </div>
    </Modal>
  );
};
