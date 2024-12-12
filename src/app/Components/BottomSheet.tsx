import { useOnTopWithRef } from "@/app/utils";
import { type FC, type ReactNode, useEffect } from "react";

export interface BottomSheetProps {
  title?: string;
  isOpen: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}

export const BottomSheet: FC<BottomSheetProps> = ({
  title = "",
  isOpen,
  onClose,
  className,
  children,
}) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [isOnTop, ref] = useOnTopWithRef();

  return (
    <>
      <div
        className={`fixed max-w-[500px] m-auto inset-0 bg-black bg-opacity-30 transition-opacity duration-75 z-50 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed max-w-[500px] m-auto inset-x-0 bottom-0 z-50 bg-white shadow-lg rounded-t-2xl transform transition-transform duration-100 ease-out ${isOpen ? "translate-y-0" : "translate-y-full"} ${className}`}
      >
        <div
          className={`flex p-6 rounded-t-2xl justify-between sticky top-0 bg-white${!isOnTop ? " border-b " : ""}`}
        >
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={() => {
              handleClose();
            }}
            className="bg-none border-none cursor-pointer flex items-center"
          >
            <img src="/cross.svg" alt="بازگشت" className="w-7 h-7" />
          </button>
        </div>
        <div className="p-6 pb-28 overflow-scroll max-h-[80dvh]" ref={ref}>
          {children}
        </div>
      </div>
    </>
  );
};

interface BottomSheetFooterProps {
  onClose: () => void;
  onSelect: () => void;
  selectText?: string;
  closeText?: string;
}

export const BottomSheetFooter: FC<BottomSheetFooterProps> = ({
  onClose,
  onSelect,
  selectText = "انتخاب",
  closeText = "بستن",
}) => {
  return (
    <div className="flex m-auto absolute w-full bottom-0 bg-white py-4 border-t font-medium -mx-6 px-6">
      <div className="relative w-full me-2.5">
        <button
          type="button"
          onClick={onClose}
          className="w-full p-3 bg-white text-black border rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300"
        >
          {closeText}
        </button>
      </div>
      <div className="relative w-full">
        <button
          type="button"
          onClick={onSelect}
          className="w-full p-3 bg-black text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300"
        >
          {selectText}
        </button>
      </div>
    </div>
  );
};
