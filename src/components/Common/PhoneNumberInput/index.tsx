import { isJustDigits, toEnglishDigits, toFarsiDigits } from "@/app/utils";
import { cn } from "@/helpers/cn";
import toast from "react-hot-toast";

type Props = {
  value: string;
  title?: string;
  className?: string;
  setValue: (value: string) => void;
};

function PhoneNumberInput({ value, title = "شماره همراه *", className, setValue }: Props) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <label className="font-bold text-md" htmlFor="customer-phone-input">
        {title}
      </label>
      <div className="flex items-center text-2xl" style={{ direction: "ltr" }}>
        <div
          className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg"
          style={{ direction: "ltr" }}
        >
          +۹۸
        </div>
        <div id="phone-div" className="relative w-full !tabular-nums" style={{ direction: "ltr" }}>
          <input
            type="tel"
            id="customer-phone-input"
            style={{ direction: "ltr" }}
            aria-describedby="شماره تلفن همراه"
            value={value}
            className="block tracking-[4px] !tabular-nums p-2.5 w-full text-white caret-black rounded-e-lg border-s-0 border border-gray-300 focus:outline-0 focus:border-gray-400"
            placeholder=""
            onChange={(e) => {
              const engValue = toEnglishDigits(e.target.value.replaceAll(" ", ""));
              const val = engValue[0] === "0" ? engValue.slice(1) : engValue;

              if (!isJustDigits(val) && val !== "") {
                toast.error("لطفا فقط عدد وارد کنید", {
                  duration: 3000,
                  position: "top-center",
                });
                return false;
              }

              if (val.startsWith("0")) {
                toast.error("لطفا در ابتدای شماره عدد ۰ قرار ندهید", {
                  duration: 3000,
                  position: "top-center",
                });
                return false;
              }

              if (val.length > 10) {
                toast.error("طول شماره حداکثر ۱۰ رقم میباشد", {
                  duration: 3000,
                  position: "top-center",
                });
                return false;
              }

              setValue(toFarsiDigits(val));
            }}
            inputMode="numeric"
          />
          <div className="absolute p-2.5 top-0 pointer-events-none" style={{ direction: "ltr" }}>
            <span className="text-black tracking-[4px]">{value}</span>
            <span className="text-gray-400 tracking-[1.3px]">
              {Array(10 - value.length)
                .fill("—")
                .join("")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneNumberInput;
