import type { Customer } from "@/app/api";
import type React from "react";

interface CustomerListItemProps {
  customer: Customer;
  onSelect: (customer: Customer) => void;
}

const CustomerListItem: React.FC<CustomerListItemProps> = ({ customer, onSelect }) => {
  return (
    <li key={customer.id}>
      <button
        type="button"
        className="flex flex-row gap-5 items-center bg-white w-full py-4 px-5"
        onClick={() => onSelect(customer)}
      >
        <div className="h-16 w-16 flex items-center justify-center bg-purple-100 font-bold text-2xl text-primary-400 rounded-full">
            {customer.user.fullName.slice(0, 2)}
        </div>
        <p className="font-medium text-lg" style={{ direction: "ltr" }}>
          {customer.user.fullName}
        </p>
      </button>
    </li>
  );
};

export default CustomerListItem;
