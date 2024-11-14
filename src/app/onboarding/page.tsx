"use client";

import { AddressList, type SearchResultItem } from "@/app/Components/AddressList";
import { Modal } from "@/app/Components/Modal";
import {
  type Category,
  type Onboarding,
  confirmOnboarding,
  fetchCategories,
  fetchOnboarding,
  fetchReverseGeocode,
  logout,
  updateOnboarding,
} from "@/app/api";
import type mapboxgl from "mapbox-gl";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MapComponent = dynamic(
  () => import("@neshan-maps-platform/mapbox-gl-react").then((mod) => mod.MapComponent),
  { ssr: false },
);

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [enBusinessName, setEnBusinessName] = useState("");
  const [websiteAddress, setWebsiteAddress] = useState("");
  const [categories, setCategories] = useState("");
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [searchingAddress, setSearchingAddress] = useState<SearchResultItem | undefined>();
  const [address, setAddress] = useState<Onboarding["address"] | undefined>();
  const [map, setMap] = useState<mapboxgl.Map>();
  const [isMarkerVisible, setIsMarkerVisible] = useState<boolean>(false);
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    fetchOnboarding().then(({ data, response }) => {
      if (response.status === 401) router.push("/auth");
      else if (response.status !== 200) router.push("/");
      else if (data.isConfirmed) router.push("/");
      else {
        fetchCategories().then(({ data, response }) => {
          if (response.status !== 200)
            toast.error("دریافت لیست سرویس‌های قابل انتخاب", {
              duration: 5000,
              position: "bottom-center",
              className: "w-full font-medium",
            });
          else setAvailableCategories(data);
        });

        if (!data.firstName || !data.lastName) setStep(0);
        else if (!data.businessName || !data.enBusinessName) {
          setStep(1);
        } else if (!data.categories) {
          setStep(2);
        } else if (
          !data.address ||
          !data.address.region ||
          !data.address.latitude ||
          !data.address.longitude
        ) {
          setStep(3);
        } else {
          setStep(4);
        }
        setFirstName(data?.firstName || "");
        setLastName(data?.lastName || "");
        setBusinessName(data?.businessName || "");
        setEnBusinessName(data?.enBusinessName || "");
        setWebsiteAddress(data?.website || "");
        setCategories(data?.categories || "");
        setAddress(data?.address);
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (map) {
      map.on("load", () => {
        setIsMarkerVisible(true);
      });
    }
  }, [map]);

  return isLoading ? (
    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none">
      <svg
        aria-hidden="true"
        className="w-20 h-20 text-gray-200 animate-spin fill-black"
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
    </div>
  ) : step === 0 ? (
    <Modal
      isOpen={true}
      title={
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-400">راه‌اندازی حساب</h3>
          <h1 className="text-3xl font-bold mb-8">ایجاد حساب کسب‌وکار جدید</h1>
          <p className="text-lg font-normal text-gray-500">
            اطلاعات <span className="font-medium text-gray-800">«شخصی خودتان»</span> را در فرم زیر پر کنید تا
            در مرحله‌ی بعدی به اطلاعات کسب‌و‌کار بپردازیم.
          </p>
        </div>
      }
      topBarTitle={<h2 className="font-bold text-xl">ایجاد کسب‌وکار</h2>}
      stepBar={
        <div className="top-0 w-full bg-white pb-4 grid grid-cols-5 gap-3" style={{ direction: "ltr" }}>
          {[0, 1, 2, 3, 4].map((val) => (
            <div key={val} className={`h-1 ${step < val ? "bg-gray-200" : "bg-purple-500"} rounded-full`} />
          ))}
        </div>
      }
      disableBackBtn
      leftBtn={
        <button
          type="button"
          onClick={() => {
            logout().then(({ response }) => {
              if (response.status === 204) router.push("/auth");
            });
          }}
          className="font-bold text-xl ms-auto"
        >
          خروج
        </button>
      }
    >
      <div className="pt-4 -mx-2">
        <div className="flex flex-col mx-5 gap-6 pb-28">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-md">نام</label>
            <input
              className="border text-lg rounded-lg py-3 px-5 outline-0"
              placeholder="سما"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-md">نام خانوادگی</label>
            <input
              className="border text-lg rounded-lg py-3 px-5 outline-0"
              placeholder="بهفرد"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="flex fixed w-full -mx-3 bottom-0 bg-white border-t py-5 px-6">
          <button
            type="button"
            onClick={() => {
              if (!firstName) {
                toast.error("نام اجباری است", {
                  duration: 5000,
                  position: "bottom-center",
                  className: "w-full font-medium",
                });
                return;
              }
              if (!lastName) {
                toast.error("نام خانوادگی اجباری است", {
                  duration: 5000,
                  position: "bottom-center",
                  className: "w-full font-medium",
                });
                return;
              }
              updateOnboarding({ firstName, lastName }).then(({ response }) => {
                if (response.status !== 200)
                  toast.error("ذخیره‌ی اطلاعات با مشکل مواجه شد", {
                    duration: 5000,
                    position: "bottom-center",
                    className: "w-full font-medium",
                  });
                else setStep((prev) => prev + 1);
              });
            }}
            className={
              "flex flex-row items-center justify-center gap-4 w-full p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 bg-black"
            }
          >
            <img src="/services/next-white.svg" alt="ادامه" className="w-6 h-6" />
            <span className="font-bold">ادامــه</span>
          </button>
        </div>
      </div>
    </Modal>
  ) : step === 1 ? (
    <Modal
      isOpen={true}
      onClose={() => {
        setStep((prev) => prev - 1);
      }}
      title={
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-400">راه‌اندازی حساب</h3>
          <h1 className="text-3xl font-bold mb-8">نام کسب‌وکار شما چیست؟</h1>
          <p className="text-lg font-normal text-gray-500">
            این نام برند شما خواهد بود که مشتریان، کسب‌و‌کار شما را به این نام خواهند دید و شناخت.
          </p>
        </div>
      }
      topBarTitle={<h2 className="font-bold text-xl">نام کسب‌وکار</h2>}
      stepBar={
        <div className="top-0 w-full bg-white pb-4 grid grid-cols-5 gap-3" style={{ direction: "ltr" }}>
          {[0, 1, 2, 3, 4].map((val) => (
            <div key={val} className={`h-1 ${step < val ? "bg-gray-200" : "bg-purple-500"} rounded-full`} />
          ))}
        </div>
      }
      leftBtn={
        <button
          type="button"
          onClick={() => {
            logout().then(({ response }) => {
              if (response.status === 204) router.push("/auth");
            });
          }}
          className="font-bold text-xl ms-auto"
        >
          خروج
        </button>
      }
    >
      <div className="pt-4 -mx-2">
        <div className="flex flex-col mx-5 gap-6 pb-28">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-md">نام فارسی کسب‌و‌کار</label>
            <input
              placeholder="سالن زیبایی ماه‌بانو"
              className="border text-lg rounded-lg py-3 px-5 outline-0"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-md">نام انگلیسی کسب‌و‌کار</label>
            <input
              style={{ direction: "ltr" }}
              placeholder="Mahbanoo Beauty Salon"
              className="border text-lg rounded-lg py-3 px-5 outline-0"
              value={enBusinessName}
              onChange={(e) => setEnBusinessName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-md">
              آدرس وب‌سایت <span className="font-normal text-gray-500 text-sm ms-2">اختیاری</span>
            </label>
            <input
              style={{ direction: "ltr" }}
              className="border text-lg rounded-lg py-3 px-5 outline-0"
              placeholder="www.yoursite.com"
              value={websiteAddress}
              onChange={(e) => setWebsiteAddress(e.target.value)}
            />
          </div>
        </div>
        <div className="flex fixed w-full -mx-3 bottom-0 bg-white border-t py-5 px-6">
          <button
            type="button"
            onClick={() => {
              if (!businessName) {
                toast.error("نام کسب‌و‌کار اجباری است", {
                  duration: 5000,
                  position: "bottom-center",
                  className: "w-full font-medium",
                });
                return;
              }
              updateOnboarding({ businessName, enBusinessName, website: websiteAddress }).then(
                ({ response }) => {
                  if (response.status !== 200)
                    toast.error("ذخیره‌ی اطلاعات با مشکل مواجه شد", {
                      duration: 5000,
                      position: "bottom-center",
                      className: "w-full font-medium",
                    });
                  else setStep((prev) => prev + 1);
                },
              );
            }}
            className={
              "flex flex-row items-center justify-center gap-4 w-full p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 bg-black"
            }
          >
            <img src="/services/next-white.svg" alt="ادامه" className="w-6 h-6" />
            <span className="font-bold">ادامــه</span>
          </button>
        </div>
      </div>
    </Modal>
  ) : step === 2 ? (
    <Modal
      isOpen={true}
      onClose={() => {
        setStep((prev) => prev - 1);
      }}
      title={
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-400">راه‌اندازی حساب</h3>
          <h1 className="text-3xl font-bold mb-8">چه خدماتی ارائه می‌دهید؟</h1>
          <p className="text-lg font-normal text-gray-500">
            سرویس اصلی و همچنین تا حداکثر ۳ سرویس فرعی که در کسب‌و‌کار خود ارائه می‌دهید را انتخاب کنید.
          </p>
        </div>
      }
      topBarTitle={<h2 className="font-bold text-xl">سرویس‌ها</h2>}
      stepBar={
        <div className="top-0 w-full bg-white pb-4 grid grid-cols-5 gap-3" style={{ direction: "ltr" }}>
          {[0, 1, 2, 3, 4].map((val) => (
            <div key={val} className={`h-1 ${step < val ? "bg-gray-200" : "bg-purple-500"} rounded-full`} />
          ))}
        </div>
      }
      leftBtn={
        <button
          type="button"
          onClick={() => {
            logout().then(({ response }) => {
              if (response.status === 204) router.push("/auth");
            });
          }}
          className="font-bold text-xl ms-auto"
        >
          خروج
        </button>
      }
    >
      <div className="pt-4 -mx-2">
        <div className="grid grid-cols-2 mx-5 gap-3 pb-28">
          {availableCategories.map((category) => {
            const disabled =
              !categories.split(",").includes(category.id) && categories.split(",").length === 4;
            const index = categories.split(",").findIndex((e) => e === category.id);
            return (
              <button
                key={category.id}
                className={`relative border rounded-xl flex flex-col gap-4 items-start justify-between min-h-[132px] text-right px-6 py-5 ${categories.split(",").includes(category.id) ? "shadow-[inset_0_0_0_2px] shadow-purple-500" : ""} ${disabled ? "opacity-30 active:transform-none active:filter-none" : ""}`}
                disabled={disabled}
                onClick={() => {
                  const isDeselecting = categories.split(",").includes(category.id);
                  if (isDeselecting)
                    setCategories((prev) => {
                      const ids = prev.split(",");
                      return ids.filter((e) => e !== category.id).join(",");
                    });
                  else
                    setCategories((prev) => {
                      const ids = prev.split(",");
                      if (ids.length === 4) {
                        toast.error("حداکثر ۴ سرویس قابل انتخاب است", {
                          duration: 5000,
                          position: "bottom-center",
                          className: "w-full font-medium",
                        });
                        return prev;
                      }
                      if (prev !== "") return `${ids.join(",")},${category.id}`;
                      return category.id;
                    });
                }}
              >
                {index === 0 && (
                  <span className="absolute rounded-full left-2 top-2 bg-purple-600 text-white font-medium px-3 pt-1 pb-0.5">
                    اصلی
                  </span>
                )}
                {index === 1 && (
                  <span className="absolute rounded-full left-2 top-2 bg-purple-600 text-white font-medium w-6 h-6 pt-0.5 text-center">
                    ۱
                  </span>
                )}
                {index === 2 && (
                  <span className="absolute rounded-full left-2 top-2 bg-purple-600 text-white font-medium w-6 h-6 pt-0.5 text-center">
                    ۲
                  </span>
                )}
                {index === 3 && (
                  <span className="absolute rounded-full left-2 top-2 bg-purple-600 text-white font-medium w-6 h-6 pt-0.5 text-center">
                    ۳
                  </span>
                )}
                <NextImage
                  width={32}
                  height={32}
                  alt={category.name}
                  src={category.icon}
                  style={{ filter: "saturate(0) brightness(0)" }}
                />
                <p className="text-lg font-bold">{category.name}</p>
              </button>
            );
          })}
        </div>
        <div className="flex fixed w-full -mx-3 bottom-0 bg-white border-t py-5 px-6">
          <button
            type="button"
            onClick={() => {
              if (!businessName) {
                toast.error("نام کسب‌و‌کار اجباری است", {
                  duration: 5000,
                  position: "bottom-center",
                  className: "w-full font-medium",
                });
                return;
              }
              updateOnboarding({ categories }).then(({ response }) => {
                if (response.status !== 200)
                  toast.error("ذخیره‌ی اطلاعات با مشکل مواجه شد", {
                    duration: 5000,
                    position: "bottom-center",
                    className: "w-full font-medium",
                  });
                else setStep((prev) => prev + 1);
              });
            }}
            className={
              "flex flex-row items-center justify-center gap-4 w-full p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 bg-black"
            }
          >
            <img src="/services/next-white.svg" alt="ادامه" className="w-6 h-6" />
            <span className="font-bold">ادامــه</span>
          </button>
        </div>
      </div>
    </Modal>
  ) : step === 3 ? (
    <Modal
      isOpen={true}
      onClose={() => {
        setStep((prev) => prev - 1);
      }}
      title={
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-400">راه‌اندازی حساب</h3>
          <h1 className="text-3xl font-bold mb-8">لوکیشن خود را ثبت کنید!</h1>
          <p className="text-lg font-normal text-gray-500">
            آدرس کسب‌و‌کار خود را به‌صورت دقیق با استفاده از نقشه ثبت کنید تا مشتریان بتوانند به‌راحتی شما را پیدا
            کنند.
          </p>
        </div>
      }
      topBarTitle={<h2 className="font-bold text-xl">ثبت لوکیشن</h2>}
      stepBar={
        <div className="top-0 w-full bg-white pb-4 grid grid-cols-5 gap-3" style={{ direction: "ltr" }}>
          {[0, 1, 2, 3, 4].map((val) => (
            <div key={val} className={`h-1 ${step < val ? "bg-gray-200" : "bg-purple-500"} rounded-full`} />
          ))}
        </div>
      }
      leftBtn={
        <button
          type="button"
          onClick={() => {
            logout().then(({ response }) => {
              if (response.status === 204) router.push("/auth");
            });
          }}
          className="font-bold text-xl ms-auto"
        >
          خروج
        </button>
      }
    >
      <div className="pt-4 -mx-2">
        <div className="flex flex-col gap-2 px-5">
          {(address?.latitude && address.longitude && address.region) || searchingAddress ? (
            <div className="flex flex-col gap-8">
              <div className="pb-36">
                <h2 className="font-bold text-lg">آیا نشانگر در محل صحیح قرار دارد؟</h2>
                <h3 className="text-gray-500 mb-4">نشانگر را به موقعیت دقیق خود منتقل کنید</h3>
                <div className="relative -mx-8">
                  {isMarkerVisible && (
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-full z-10">
                      <div className="flex justify-center items-center">
                        <div className="bg-purple-900 w-[20px] h-[20px] rounded-full" />
                        <div className="absolute bg-purple-700 w-[14px] h-[14px] rounded-full" />
                      </div>
                      <div className="w-[2px] mx-auto h-[18px] bg-black rounded-full" />
                      <div
                        className="w-[10px] h-[2px] mx-auto bg-black rounded-full -translate-y-1/2"
                        style={{ filter: "blur(2.5px)" }}
                      />
                    </div>
                  )}
                  <MapComponent
                    className={"h-[320px]"}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    mapSetter={setMap}
                    options={{
                      mapKey: "web.4265bbfa21d2414dbf28c8ebdd43f308",
                      mapType: "neshanVector",
                      isTouchPlatform: true,
                      mapTypeControllerOptions: {
                        show: false,
                      },
                      center: {
                        lng: address?.longitude || searchingAddress?.location.x || 1,
                        lat: address?.latitude || searchingAddress?.location.y || 1,
                      },
                      zoom: 13,
                      interactive: true,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <label className="font-bold text-md">محدوده‌ی کسب‌و‌کار شما کجاست؟</label>
              <div className="relative w-full mb-2.5">
                <AddressList address={searchingAddress} setAddress={setSearchingAddress} />
              </div>
            </>
          )}
        </div>
        <div className="flex fixed z-20 w-full -mx-3 bottom-0 bg-white border-t py-5 px-6">
          <button
            type="button"
            onClick={() => {
              if (((!address || !address.longitude || !address.latitude) && !searchingAddress) || !map) {
                toast.error("انتخاب دقیق لوکیشن اجباری است", {
                  duration: 5000,
                  position: "bottom-center",
                  className: "w-full font-medium",
                });
                return;
              }
              const { lng, lat } = map.getCenter();
              fetchReverseGeocode(lat, lng).then((res) => {
                const data: Onboarding["address"] = {
                  address: res.formatted_address,
                  latitude: lat,
                  longitude: lng,
                  region: `${res.state}، ${res.city}`,
                  title: address?.title || searchingAddress?.title || "",
                };
                setAddress(data);
                updateOnboarding({ address: data }).then(({ response }) => {
                  if (response.status !== 200)
                    toast.error("ذخیره‌ی لوکیشن با مشکل مواجه شد", {
                      duration: 5000,
                      position: "bottom-center",
                      className: "w-full font-medium",
                    });
                  else setStep((prev) => prev + 1);
                });
              });
            }}
            className={
              "flex flex-row items-center justify-center gap-4 w-full p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 bg-black"
            }
          >
            <img src="/services/next-white.svg" alt="ادامه" className="w-6 h-6" />
            <span className="font-bold">ادامــه</span>
          </button>
        </div>
      </div>
    </Modal>
  ) : step === 4 ? (
    <Modal
      isOpen={true}
      onClose={() => {
        setStep((prev) => prev - 1);
        setIsEditingAddress(false);
      }}
      title={
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-400">راه‌اندازی حساب</h3>
          <h1 className="text-3xl font-bold mb-8">تأیید آدرس</h1>
          <p className="text-lg font-normal text-gray-500">آدرس کسب‌و‌کار خود را دقیق نمائید.</p>
        </div>
      }
      topBarTitle={<h2 className="font-bold text-xl">تأیید نهایی</h2>}
      stepBar={
        <div className="top-0 w-full bg-white pb-4 grid grid-cols-5 gap-3" style={{ direction: "ltr" }}>
          {[0, 1, 2, 3, 4].map((val) => (
            <div key={val} className={`h-1 ${step < val ? "bg-gray-200" : "bg-purple-500"} rounded-full`} />
          ))}
        </div>
      }
      leftBtn={
        <button
          type="button"
          onClick={() => {
            logout().then(({ response }) => {
              if (response.status === 204) router.push("/auth");
            });
          }}
          className="font-bold text-xl ms-auto"
        >
          خروج
        </button>
      }
    >
      <div className="pt-4">
        <div className="pb-28">
          {address && isEditingAddress ? (
            <div className="relative p-3 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="animate-pulse font-bold text-lg">
                  آدرس پستی <span className="font-light text-sm">(در حال ویرایش)</span>
                </h2>
                <textarea
                  className="border text-lg rounded-lg py-3 px-5 outline-0"
                  placeholder="آدرس پستی"
                  value={address.address}
                  onChange={(e) => {
                    setAddress({ ...address, address: e.target.value });
                  }}
                />
              </div>
              <button
                className="absolute left-1 top-1 rounded-xl text-xl text-purple-600 font-medium p-2"
                onClick={() => {
                  setIsEditingAddress(false);
                }}
              >
                ذخیره
              </button>
            </div>
          ) : (
            <div className="relative p-5 flex flex-col gap-4 border rounded-lg border-gray-300">
              <div className="flex flex-col gap-1">
                <h2 className="font-bold text-lg">آدرس پستی</h2>
                <p className="text-xl font-extralight">{address?.address}</p>
              </div>
              <button
                className="absolute left-1 top-1 rounded-xl text-xl text-purple-600 font-medium p-2"
                onClick={() => {
                  setIsEditingAddress(true);
                }}
              >
                ویرایش
              </button>
            </div>
          )}
        </div>
        <div className="flex fixed z-20 w-full -mx-5 bottom-0 bg-white border-t py-5 px-6">
          <button
            type="button"
            disabled={isEditingAddress}
            onClick={() => {
              updateOnboarding({ address, isConfirmed: true }).then(({ response }) => {
                if (response.status !== 200) {
                  toast.error("ذخیره‌ی اطلاعات با مشکل مواجه شد", {
                    duration: 5000,
                    position: "bottom-center",
                    className: "w-full font-medium",
                  });
                } else
                  confirmOnboarding().then(({ response }) => {
                    if (response.status !== 201) {
                      toast.error("تأییدیه نهایی با مشکل مواجه شد!", {
                        duration: 5000,
                        position: "bottom-center",
                        className: "w-full font-medium",
                      });
                    } else {
                      router.push("/");
                    }
                  });
              });
            }}
            className={`flex flex-row items-center justify-center gap-4 w-full p-3 text-white rounded-md text-xl cursor-pointer hover:bg-opacity-90 transition duration-300 ${isEditingAddress ? "bg-gray-400" : "bg-black"}`}
          >
            <img src="/services/next-white.svg" alt="تأیید و ورود به حساب" className="w-6 h-6" />
            <span className="font-bold">تأیید و ورود به حساب</span>
          </button>
        </div>
      </div>
    </Modal>
  ) : null;
}
