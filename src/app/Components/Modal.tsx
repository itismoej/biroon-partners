import { useOnTopWithRef } from "@/app/utils";
import { type FC, type ReactNode, useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  title: ReactNode | string;
  topBarTitle?: ReactNode | string;
  className?: string;
  disableBackBtn?: boolean;
  leftBtn?: ReactNode | null;
  stepBar?: ReactNode | null;
}

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose = () => {},
  children,
  title,
  topBarTitle = null,
  className = "",
  disableBackBtn = false,
  leftBtn = null,
  stepBar = null,
}) => {
  const [isOnTop, ref] = useOnTopWithRef();
  const [animation, setAnimation] = useState("animate-fadeInUp");
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(isOpen);
      setAnimation("animate-fadeInUp");
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => {
        setIsVisible(isOpen);
      }, 200);
      setAnimation("animate-fadeOutDown");
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    isVisible && (
      <div
        className={`fixed max-w-[500px] m-auto inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ${animation} ${className}`}
      >
        <div ref={ref} className="bg-white px-5 w-full h-dvh overflow-y-scroll relative">
          <div
            className={`flex flex-col gap-5 bg-white py-5 -mx-5 px-5 sticky top-0 ${isOnTop ? "" : "shadow-md"} z-50`}
          >
            {stepBar}
            <div className="flex gap-5 flex-row items-center justify-between">
              <div className="flex gap-5 flex-row items-center justify-between">
                {disableBackBtn ? null : (
                  <button
                    type="button"
                    onClick={disableBackBtn ? () => {} : onClose}
                    className="bg-none border-none cursor-pointer flex items-center"
                  >
                    <img src="/back.svg" alt="بازگشت" className={"w-7 h-7"} />
                  </button>
                )}
                {!isOnTop &&
                  (topBarTitle ? topBarTitle : <h3 className="text-xl font-semibold">{title}</h3>)}
              </div>
              {leftBtn}
            </div>
          </div>
          {title && <h2 className="my-8 text-3xl font-semibold">{title}</h2>}
          {children}
        </div>
      </div>
    )
  );
};
