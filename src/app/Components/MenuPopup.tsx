import { type FC, type ReactNode, useEffect } from "react";

export interface MenuPopupProps {
  title?: string;
  isOpen: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}

export const MenuPopup: FC<MenuPopupProps> = ({ isOpen, onClose, className, children }) => {
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

  return (
    <>
      <div
        className={`fixed max-w-[500px] m-auto inset-0 bg-black bg-opacity-30 transition-opacity duration-75 z-50 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      <div
        className={`flex flex-col gap-2 fixed max-w-[500px] mx-3 m-auto inset-x-0 bottom-3 z-50 transform transition-transform duration-100 ease-out ${isOpen ? "shadow-t-xl translate-y-0" : "translate-y-full"} ${className}`}
      >
        <div
          className={`w-full min-h-[100px] bg-white shadow-lg rounded-xl transform transition-transform duration-100 ease-out ${isOpen ? "translate-y-0" : "translate-y-full"} ${className}`}
        >
          {children}
        </div>
        <button
          className={`p-4 text-xl font-medium w-full bg-white shadow-lg rounded-xl transform transition-transform duration-100 ease-out ${isOpen ? "translate-y-0" : "translate-y-full"} ${className}`}
          onClick={handleClose}
        >
          بستن
        </button>
      </div>
    </>
  );
};
