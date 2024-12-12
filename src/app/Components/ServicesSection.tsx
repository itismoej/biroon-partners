import { BottomSheet, BottomSheetFooter } from "@/app/Components/BottomSheet";
import {
  type Location,
  type LocationServiceCatalogCategory,
  type Service,
  type ServiceCategory,
  deleteServiceCategory,
  fetchLocation,
  fetchServiceCategories,
} from "@/app/api";
import { formatPriceWithSeparator, toFarsiDigits } from "@/app/utils";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Tabs } from "./Tabs";

interface ServicesProps {
  location: Location;
  setLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
  serviceOnClick?: (service: Service) => void;
  setServiceCategories: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
}

export const ServicesSection = ({
  location,
  serviceOnClick = () => {},
  setLocation,
  setServiceCategories,
}: ServicesProps) => {
  const catalog = location.serviceCatalog;
  const tabs = [
    {
      id: "all",
      label: (
        <div className="flex flex-row gap-2 items-center justify-between">
          <h2 className="text-lg font-medium">همه‌ی دسته‌بندی‌ها</h2>
          <div className="w-6 h-6 flex items-center justify-center text-md bg-gray-50 border text-gray-500 rounded-full font-bold">
            <span className="translate-y-[2px] text-sm font-normal">
              {toFarsiDigits(
                location.serviceCatalog.reduce((acc, { items }) => acc + items.length, 0),
              )}
            </span>
          </div>
        </div>
      ),
    },
  ].concat(
    catalog
      .map(({ id, name, items }) => ({
        id,
        label: (
          <div className="flex flex-row gap-2 items-center justify-between">
            <h2 className="text-lg font-medium">{name}</h2>
            <div className="w-6 h-6 flex items-center justify-center text-md bg-gray-50 border text-gray-500 rounded-full font-bold">
              <span className="translate-y-[2px] text-sm font-normal">
                {toFarsiDigits(items.length)}
              </span>
            </div>
          </div>
        ),
      }))
      .slice(1),
  );
  const [activeTab, setActiveTab] = useState<"all" | LocationServiceCatalogCategory["id"]>("all");

  const handleTabClick = (_index: number, id: string) => {
    setActiveTab(id);
  };

  const router = useRouter();
  const [deletingServiceCategory, setDeletingServiceCategory] = useState<
    ServiceCategory | undefined
  >(undefined);

  return (
    <div className="w-full pb-[70px]">
      <div className={"w-full py-5 bg-white"}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabClick} />
      </div>
      <div>
        {(activeTab === "all"
          ? location.serviceCatalog.slice(1)
          : location.serviceCatalog.filter(({ id }) => id === activeTab)
        ).map((category) => (
          <div key={category.id}>
            <div className="flex flex-row justify-between items-center pt-5 pb-3">
              <div className="flex flex-row gap-3 items-center">
                <h2 className="text-2xl font-medium">{category.name}</h2>
                <div className="w-6 h-6 flex items-center justify-center text-md bg-gray-200 text-gray-500 rounded-full font-bold">
                  <span className="translate-y-[2px]">{toFarsiDigits(category.items.length)}</span>
                </div>
              </div>
              <button
                className="bg-white p-3 rounded-xl"
                onClick={() => {
                  setDeletingServiceCategory(category);
                }}
              >
                <NextImage src="/3dots.svg" alt="تنظیمات دسته‌بندی" width={20} height={20} />
              </button>
            </div>
            <div className="flex flex-col">
              {category.items.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  className="-mx-2 flex flex-row gap-4 items-center bg-white p-2 rounded-xl active:inner-w-8"
                  onClick={() => {
                    serviceOnClick(svc);
                  }}
                >
                  <div className="h-[70px] w-[4px] bg-purple-300 rounded-full" />
                  <div className="flex flex-col w-full">
                    <div className="flex flex-row gap-4 justify-between items-start">
                      <h3 className="text-lg font-normal text-start">{svc.name}</h3>
                      <div className="font-normal text-lg text-nowrap">
                        {toFarsiDigits(formatPriceWithSeparator(svc.price))}
                        <span className="text-xs font-light text-gray-500"> تومان</span>
                      </div>
                    </div>
                    <p className="font-normal text-gray-500 text-start">{svc.formattedDuration}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <BottomSheet
        isOpen={deletingServiceCategory !== undefined}
        onClose={() => setDeletingServiceCategory(undefined)}
      >
        {deletingServiceCategory && (
          <div className="space-y-8 pb-12">
            <h2 className="text-3xl font-bold -mt-6">
              حذف دائمی دسته‌بندی «{deletingServiceCategory.name}»
            </h2>
            <p className="text-lg font-normal text-red-600">
              همه‌ی سرویس‌های موجود در این دسته‌بندی نیز حذف خواهند شد! آیا اطمینان دارید؟
            </p>
            <BottomSheetFooter
              selectText="حذف"
              closeText="لغو"
              onClose={() => {
                setDeletingServiceCategory(undefined);
              }}
              onSelect={() => {
                deleteServiceCategory(deletingServiceCategory.id).then(({ response }) => {
                  if (response.status !== 204) {
                    toast.error("حذف سرویس با مشکل مواجه شد", {
                      duration: 5000,
                      position: "top-center",
                      className: "w-full font-medium",
                    });
                  } else {
                    fetchLocation().then(({ data: locationData, response }) => {
                      toast.success(`سرویس «${deletingServiceCategory.name}» با موفقیت حذف شد`, {
                        duration: 5000,
                        position: "top-center",
                        className: "w-full font-medium",
                      });

                      if (response.status !== 200) router.push("/");
                      else {
                        fetchServiceCategories().then(({ data: svcCategoriesData, response }) => {
                          if (response.status !== 200)
                            toast.error("دریافت منوی کاتالوگ شما با خطا مواجه شد", {
                              duration: 5000,
                              position: "top-center",
                              className: "w-full font-medium",
                            });
                          else {
                            setLocation(locationData);
                            setDeletingServiceCategory(undefined);
                            setServiceCategories(svcCategoriesData);
                          }
                        });
                      }
                    });
                  }
                });
              }}
            />
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
