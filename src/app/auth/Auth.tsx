"use client";

import { login, sendOTP } from "@/app/api";
import { toEnglishDigits, toFarsiDigits } from "@/app/utils";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface AuthProps {
  onAuth?: () => void;
  compact?: boolean;
}

export function Auth({ onAuth, compact = false }: AuthProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const [step, setStep] = useState("phone");
  const [otpCode, setOtpCode] = useState("");
  const farsiOtpCode = toFarsiDigits(otpCode);

  const codeRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`relative bg-white w-full overflow-y-scroll ${compact ? "h-[350px]" : "h-dvh p-5"}`}
    >
      {!compact && (
        <button
          type="button"
          onClick={() => {
            if (step === "otp") {
              setStep("phone");
            }
          }}
          className="bg-none border-none cursor-pointer flex items-center"
        >
          <img src="/back.svg" alt="بازگشت" className="w-7 h-7" />
        </button>
      )}
      <div className="flex flex-col justify-center pt-6 gap-5 items-center">
        <h2 className="text-3xl font-bold text-center">بیرون برای همکاران</h2>
        {step === "phone" && (
          <>
            <p className="text-gray-500 text-lg text-center px-9">
              ورود و یا ایجاد حساب کاربری برای مدیریت سالن خود.
            </p>
            <form className="max-w-sm mx-auto px-5" style={{ direction: "ltr" }}>
              <div className="flex items-center text-2xl" style={{ direction: "ltr" }}>
                <div
                  className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg"
                  style={{ direction: "ltr" }}
                >
                  +۹۸
                </div>
                <div
                  id="phone-div"
                  className="relative w-full !tabular-nums"
                  style={{ direction: "ltr" }}
                >
                  <input
                    type="tel"
                    style={{ direction: "ltr" }}
                    aria-describedby="شماره تلفن همراه"
                    value={phoneNumber}
                    className="block tracking-[4px] !tabular-nums p-2.5 w-full text-white caret-black rounded-e-lg border-s-0 border border-gray-300 focus:outline-0 focus:border-gray-400"
                    placeholder=""
                    onChange={(e) => {
                      const engValue = toEnglishDigits(e.target.value.replaceAll(" ", ""));
                      const val = engValue[0] === "0" ? engValue.slice(1) : engValue;
                      if (val.startsWith("0"))
                        toast.error("لطفاً در ابتدای شماره عدد ۰ قرار ندهید", {
                          duration: 3000,
                          position: "top-center",
                        });
                      else if (val.length > 10)
                        toast.error("طول شماره حداکثر ۱۰ رقم می‌باشد", {
                          duration: 3000,
                          position: "top-center",
                        });
                      else setPhoneNumber(toFarsiDigits(val));
                    }}
                    inputMode="numeric"
                  />
                  <div
                    className="absolute p-2.5 top-0 pointer-events-none"
                    style={{ direction: "ltr" }}
                  >
                    <span className="text-black tracking-[4px]">{phoneNumber}</span>
                    <span className="text-gray-400 tracking-[1.3px]">
                      {Array(10 - phoneNumber.length)
                        .fill("—")
                        .join("")}
                    </span>
                  </div>
                </div>
              </div>
              <p className="my-4 text-center text-md text-gray-500" dir="rtl">
                کد تأیید به این شماره ارسال خواهد شد.
              </p>
              <div className="absolute bottom-0 inset-x-0 w-full max-w-sm mb-5 px-5 mx-auto">
                <button
                  type="submit"
                  className="text-white w-full bg-black font-medium rounded-lg text-lg px-5 py-2.5"
                  onClick={(e) => {
                    e.preventDefault();
                    sendOTP(`+98${toEnglishDigits(phoneNumber)}`).then(() => {
                      setStep("otp");
                    });
                  }}
                >
                  ارسال کد تأیید
                </button>
              </div>
            </form>
          </>
        )}
        {step === "otp" && (
          <>
            <p className="text-gray-500 text-lg text-center px-4">
              کد تأیید به شماره زیر ارسال شد.
            </p>
            <p className="font-bold text-gray-800 text-2xl" dir="ltr" style={{ direction: "ltr" }}>
              +۹۸ {`${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`}
            </p>
            <form className="max-w-sm mx-auto px-5" dir="ltr" style={{ direction: "ltr" }}>
              <div className="flex items-center text-2xl" style={{ direction: "ltr" }}>
                <div
                  id="otp-div"
                  className="relative w-full !tabular-nums rounded-lg border border-gray-300 focus:outline-0 focus:border-gray-400"
                  onClick={() => {
                    if (codeRef.current) codeRef.current.focus();
                  }}
                  style={{ direction: "ltr" }}
                >
                  <input
                    ref={codeRef}
                    style={{ direction: "ltr" }}
                    type="text"
                    aria-describedby="کد تأیید"
                    value={farsiOtpCode}
                    className="text-left mx-auto block tracking-[4px] !tabular-nums p-2.5 w-[90px] text-white caret-black focus:!outline-0 focus:!border-none"
                    placeholder=""
                    onChange={(e) => {
                      const val = e.target.value.replaceAll(" ", "");
                      if (val.length > 4) return;
                      setOtpCode(toFarsiDigits(val));
                    }}
                    inputMode="numeric"
                  />
                  <div
                    className="absolute w-full text-center p-2.5 top-0 pointer-events-none"
                    style={{ direction: "ltr" }}
                  >
                    <span className="text-black tracking-[4px] text-center">{farsiOtpCode}</span>
                    <span className="text-gray-400 tracking-[1.3px] text-center">
                      {Array(4 - otpCode.length)
                        .fill("—")
                        .join("")}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 mb-1 text-center text-md text-gray-500" dir="rtl">
                لطفاً کد ۴ رقمی ارسال شده را وارد کنید.
              </p>
              <div className="absolute bottom-0 inset-x-0 w-full max-w-sm mb-5 px-5 mx-auto">
                <button
                  type="submit"
                  className="text-white w-full bg-black font-medium rounded-lg text-lg px-5 py-2.5"
                  onClick={(e) => {
                    e.preventDefault();
                    login(toEnglishDigits(`+98${phoneNumber}`), toEnglishDigits(otpCode)).then(
                      ({ response }) => {
                        if (response.ok) {
                          if (onAuth) onAuth();
                        } else if (response.status === 403) {
                          toast.error("کد وارد شده نادرست است.", {
                            duration: 3000,
                            position: "top-center",
                            className: "text-xl",
                          });
                        }
                      },
                    );
                  }}
                >
                  تأیید کد
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
