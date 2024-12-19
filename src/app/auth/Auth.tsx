"use client";

import { login, sendOTP } from "@/app/api";
import { toEnglishDigits, toFarsiDigits } from "@/app/utils";
import React, { useRef, useState, useTransition } from "react";
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
  const [isLoading, startTransition] = useTransition();

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
                  className="flex-shrink-0 z-10 inline-flex items-center py-2.5 h-[48px] px-4 font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg"
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
                    className="block tracking-[4px] !tabular-nums p-2.5 h-[48px] w-full text-white caret-black rounded-e-lg border-s-0 border border-gray-300 focus:outline-0 focus:border-gray-400"
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
                    className="absolute flex items-center p-2.5 h-[48px] top-0 pointer-events-none"
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
                  disabled={isLoading}
                  className={`text-white w-full bg-black font-medium rounded-lg text-lg px-5 py-2.5 ${isLoading ? "opacity-30" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    startTransition(async () => {
                      const { response } = await sendOTP(`+98${toEnglishDigits(phoneNumber)}`);
                      if (response.status !== 200)
                        toast.error("شماره همراه وارد شده نادرست است.", {
                          duration: 3000,
                          position: "top-center",
                          className: "text-xl",
                        });
                      else
                        startTransition(() => {
                          setStep("otp");
                        });
                    });
                  }}
                >
                  {isLoading ? (
                    <svg
                      aria-hidden="true"
                      className="w-7 h-7 text-gray-200 animate-spin fill-black mx-auto"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  ) : (
                    "ارسال کد تأیید"
                  )}
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
                    className="text-left h-[48px] mx-auto block tracking-[4px] !tabular-nums p-2.5 w-[90px] text-white caret-black focus:!outline-0 focus:!border-none"
                    placeholder=""
                    onChange={(e) => {
                      const val = e.target.value.replaceAll(" ", "");
                      if (val.length > 4) return;
                      setOtpCode(toFarsiDigits(val));
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  <div
                    className="absolute w-full text-center p-2.5 h-[48px] top-0 pointer-events-none"
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
                  disabled={isLoading}
                  className={`text-white w-full bg-black font-medium rounded-lg text-lg px-5 py-2.5 ${isLoading ? "opacity-30" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    startTransition(async () => {
                      const { response } = await login(
                        toEnglishDigits(`+98${phoneNumber}`),
                        toEnglishDigits(otpCode),
                      );
                      if (response.ok) {
                        if (onAuth) startTransition(onAuth);
                      } else if (response.status === 403) {
                        toast.error("کد وارد شده نادرست است.", {
                          duration: 3000,
                          position: "top-center",
                          className: "text-xl",
                        });
                      }
                    });
                  }}
                >
                  {isLoading ? (
                    <svg
                      aria-hidden="true"
                      className="w-7 h-7 text-gray-200 animate-spin fill-black mx-auto"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  ) : (
                    "تأیید کد"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
