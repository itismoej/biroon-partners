import { type Customer, fetchCustomers } from "@/app/api";
import { useOnTop } from "@/app/utils";
import AddNewCustomerModal from "@/components/AddNewCustomerModal";
import CustomerListItem from "@/components/CustomerSelectionModal/CustomerListItem";
import NextImage from "next/image";
import React, { useEffect, useState } from "react";

function CustomersListModalSkeleton() {
  return (
    <ul className="animate-pulse">
      <li className="py-4 flex flex-row gap-6 items-center">
        <div className="h-16 w-16 bg-gray-100 rounded-full"></div>
        <div className="bg-gray-100 h-5 w-[180px] rounded-full" />
      </li>
      <li className="py-4 flex flex-row gap-6 items-center">
        <div className="h-16 w-16 bg-gray-100 rounded-full"></div>
        <div className="bg-gray-100 h-5 w-[120px] rounded-full" />
      </li>
      <li className="py-4 flex flex-row gap-6 items-center">
        <div className="h-16 w-16 bg-gray-100 rounded-full"></div>
        <div className="bg-gray-100 h-5 w-[210px] rounded-full" />
      </li>
    </ul>
  );
}

export function CustomersListPage() {
  const [clients, setClients] = useState<Customer[]>([]);
  const [addNewCustomerModalIsOpen, setAddNewCustomerModalIsOpen] = useState(false);
  const isOnTop = useOnTop();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers().then(({ data }) => {
      setClients(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="px-5">
      <div
        className={`flex flex-col gap-5 bg-white py-5 -mx-5 px-5 sticky top-0 ${isOnTop ? "" : "shadow-md"}`}
      >
        <div className="flex gap-5 flex-row items-center justify-between">
          <div className="flex gap-5 flex-row items-center justify-between">
            {!isOnTop && <h2 className="text-xl font-bold">لیست مشتریان</h2>}
          </div>
          <button
            className="bg-black px-3 py-2 text-white text-lg rounded-lg font-bold flex flex-row gap-2 items-center justify-center"
            onClick={() => {
              setAddNewCustomerModalIsOpen(true);
            }}
          >
            <NextImage src="/plus-white.svg" alt="افزودن سرویس" width={20} height={20} />
            افزودن
          </button>
        </div>
      </div>
      <h2 className="my-8 text-3xl font-semibold">لیست مشتریان</h2>
      <div className="pb-28">
        {isLoading ? (
          <CustomersListModalSkeleton />
        ) : clients.length > 0 ? (
          <ul className="-mx-5">
            {clients.map((customer) => (
              <CustomerListItem key={customer.id} customer={customer} onSelect={() => {}} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-lg">
            لیست مشتریان شما خالیست! با استفاده از دکمهٔ افزودن، لیست مشتری‌های خود را تکمیل کنید.
          </p>
        )}
      </div>
      <AddNewCustomerModal
        isOpen={addNewCustomerModalIsOpen}
        customersList={clients}
        setCustomersList={setClients}
        onClose={() => setAddNewCustomerModalIsOpen(false)}
      />
    </div>
  );
}
