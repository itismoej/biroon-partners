import type { AvailableEmployee } from "@/app/api";

interface TileProps {
  employee: AvailableEmployee;
  selectedEmployeeId: string;
  onTileChange: (employee: AvailableEmployee) => void;
}

export const Tile = ({ employee, onTileChange }: TileProps) => {
  return (
    <button
      type="button"
      className={"flex bg-white min-w-48 justify-center pt-12 pb-7 px-2 cursor-pointer border-2 rounded-lg"}
      onClick={() => {
        onTileChange(employee);
      }}
    >
      <div className="flex flex-col items-center">
        <img
          src={employee.user.avatar.url}
          alt={employee.nickname || employee.user.fullName}
          className="w-20 h-20 rounded-full mb-4"
        />
        <p className="font-medium">{employee.nickname || employee.user.fullName}</p>
        <p className="font-normal">{employee.formattedPrice}</p>
      </div>
    </button>
  );
};
