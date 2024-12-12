import { type Customer, fetchCustomers } from "@/app/api";
import AddNewCustomerModal from "@/components/AddNewCustomerModal";
import CustomerListItem from "@/components/CustomerSelectionModal/CustomerListItem";
import NextImage from "next/image";
import React, { useEffect, useState } from "react";

function Clients() {
  const [clients, setClients] = useState<Customer[]>([]);
  const [addNewCustomerModalIsOpen, setAddNewCustomerModalIsOpen] = useState(false);

  useEffect(() => {
    fetchCustomers().then(({ data }) => {
      setClients(data);
    });
  }, []);

  return (
    <>
      <div className="px-5 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="my-8 text-3xl font-semibold">انتخاب مشتری</h2>
          <button
            type="button"
            className="bg-black px-3 py-2 text-white text-lg rounded-lg font-bold flex flex-row gap-2 items-center justify-center"
            onClick={() => {
              setAddNewCustomerModalIsOpen(true);
            }}
          >
            <NextImage src="/plus-white.svg" alt="افزودن سرویس" width={20} height={20} />
            افزودن
          </button>
        </div>
        <hr className="-mx-5" />
        {clients.length > 0 && (
          <>
            <hr />
            <ul className="-mx-5">
              {clients.map((customer) => (
                <CustomerListItem key={customer.id} customer={customer} onSelect={() => {}} />
              ))}
            </ul>
          </>
        )}
      </div>
      <AddNewCustomerModal
        isOpen={addNewCustomerModalIsOpen}
        customersList={clients}
        setCustomersList={setClients}
        onClose={() => setAddNewCustomerModalIsOpen(false)}
      />
    </>
  );
}

export default Clients;
