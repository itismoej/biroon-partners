import { Modal } from "@/app/Components/Modal";
import { type Customer, fetchCustomers } from "@/app/api";
import AddNewCustomerModal from "@/components/AddNewCustomerModal";
import CustomerListItem from "@/components/CustomerSelectionModal/CustomerListItem";
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  setNewAppointmentCustomer: (customer: Customer | null) => void;
};

function CustomerSelectionModal({ isOpen, onClose, setNewAppointmentCustomer }: Props) {
  const [clients, setClients] = useState<Customer[]>([]);
  const [addNewCustomerModalIsOpen, setAddNewCustomerModalIsOpen] = useState(false);

  useEffect(() => {
    fetchCustomers().then(({ data }) => {
      setClients(data);
    });
  }, []);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="انتخاب مشتری">
        <hr className="-mx-5" />
        <ul className="-mx-5">
          <li>
            <button
              className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5"
              onClick={() => setAddNewCustomerModalIsOpen(true)}
              type="button"
            >
              <div className="h-16 w-16 flex items-center justify-center bg-purple-100 rounded-full">
                <img src="/plus-purple.svg" alt="plus person" className="w-7 h-7" />
              </div>
              <p className="font-medium text-lg">افزودن مشتری جدید</p>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5"
              onClick={() => {
                setNewAppointmentCustomer(null);
                onClose();
              }}
            >
              <div className="h-16 w-16 flex items-center justify-center bg-purple-100 rounded-full">
                <img src="/walk-in.svg" alt="walk-in" className="w-8 h-8" />
              </div>
              <p className="font-medium text-lg">مراجعهکنندهی حضوری</p>
            </button>
          </li>
        </ul>
        {clients.length > 0 && (
          <>
            <hr />
            <ul className="-mx-5">
              {clients.map((customer) => (
                <CustomerListItem
                  key={customer.id}
                  customer={customer}
                  onSelect={(selectedCustomer) => {
                    setNewAppointmentCustomer(selectedCustomer);
                    onClose();
                  }}
                />
              ))}
            </ul>
          </>
        )}
      </Modal>
      <AddNewCustomerModal
        isOpen={addNewCustomerModalIsOpen}
        customersList={clients}
        setCustomersList={setClients}
        onClose={() => setAddNewCustomerModalIsOpen(false)}
      />
    </>
  );
}

export default CustomerSelectionModal;
