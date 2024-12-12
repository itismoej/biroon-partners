import type React from "react";

interface Item {
  id: string;
  label: string;
  icon?: string | null;
  initials: string;
}

interface MultiSelectProps {
  items: Item[];
  selectedItems: string[]; // list of selected item IDs
  onSelectItem: (id: string) => void;
  onSelectAll: () => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  items,
  selectedItems,
  onSelectItem,
  onSelectAll,
}) => {
  const isAllSelected = selectedItems.length === items.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="form-checkbox h-5 w-5 text-blue-600 rounded"
        />
        <span className="text-gray-900 font-medium">Select All</span>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-3 py-2">
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={() => onSelectItem(item.id)}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <div className="flex items-center space-x-2">
            {item.icon && (
              <img
                src={item.icon}
                alt={`${item.label}`}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <span className="text-gray-900">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
