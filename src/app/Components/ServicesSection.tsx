import type { Location, LocationServiceCatalogCategory, Service } from "@/app/api";
import { formatPriceWithSeparator, toFarsiDigits } from "@/app/utils";
// import NextImage from "next/image";
import { useState } from "react";
import { Tabs } from "./Tabs";

interface ServicesProps {
  location: Location;
  serviceOnClick?: (service: Service) => void;
}

export const ServicesSection = ({ location, serviceOnClick = () => {} }: ServicesProps) => {
  const catalog = location.serviceCatalog;
  const tabs = [
    {
      id: "all",
      label: (
        <div className="flex flex-row gap-2 items-center justify-between">
          <h2 className="text-lg font-medium">همه‌ی دسته‌بندی‌ها</h2>
          <div className="w-6 h-6 flex items-center justify-center text-md bg-gray-50 border text-gray-500 rounded-full font-bold">
            <span className="translate-y-[2px] text-sm font-normal">
              {toFarsiDigits(location.serviceCatalog.reduce((acc, { items }) => acc + items.length, 0))}
            </span>
          </div>
        </div>
      ),
    },
  ].concat(
    catalog.map(({ id, name, items }) => ({
      id,
      label: (
        <div className="flex flex-row gap-2 items-center justify-between">
          <h2 className="text-lg font-medium">{name}</h2>
          <div className="w-6 h-6 flex items-center justify-center text-md bg-gray-50 border text-gray-500 rounded-full font-bold">
            <span className="translate-y-[2px] text-sm font-normal">{toFarsiDigits(items.length)}</span>
          </div>
        </div>
      ),
    })),
  );
  const [activeTab, setActiveTab] = useState<"all" | LocationServiceCatalogCategory["id"]>("all");

  const handleTabClick = (index: number, id: string) => {
    setActiveTab(id);
  };

  return (
    <div className="w-full pb-[70px]">
      <div className={"w-full py-5 bg-white"}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabClick} />
      </div>
      <div>
        {(activeTab === "all"
          ? location.serviceCatalog
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
              {/*<button className="bg-white p-3 rounded-xl">*/}
              {/*  <NextImage src="/3dots.svg" alt="تنظیمات دسته‌بندی" width={20} height={20} />*/}
              {/*</button>*/}
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
    </div>
  );
};
