import { InputField } from "@/app/Components/AddNewServiceModal";
import { BottomSheet, BottomSheetFooter, type BottomSheetProps } from "@/app/Components/BottomSheet";
import { createServiceCategory } from "@/app/api";
import React, { useState } from "react";
import toast from "react-hot-toast";

export const AddNewServiceCategoryBottomSheet = (props: BottomSheetProps) => {
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  return (
    <BottomSheet {...props} title="افزودن دسته‌بندی">
      <div className="flex flex-col items-start gap-8">
        <InputField
          label="نام دسته‌بندی"
          placeholder="نام دسته‌بندی؛ مثلاً «ناخن وی‌آی‌پی»"
          value={newCategoryName}
          onChange={(e) => {
            setNewCategoryName(e.target.value);
          }}
        />
      </div>

      <BottomSheetFooter
        onClose={() => {
          setNewCategoryName("");
          if (props.onClose) props.onClose();
        }}
        onSelect={() => {
          createServiceCategory(newCategoryName).then(({ data, response }) => {
            if (response.status !== 201) {
              toast.error("ایجاد دسته‌بندی با خطا مواجه شد", {
                duration: 5000,
                position: "top-center",
                className: "w-full font-medium",
              });
            } else {
              toast.success(`دسته‌بندی ${data.name} با موفقیت ایجاد شد`, {
                duration: 5000,
                position: "top-center",
                className: "w-full font-medium",
              });
            }
            if (props.onClose) props.onClose();
          });
          setNewCategoryName("");
        }}
        selectText="اضافه کردن"
        closeText="لغو"
      />
    </BottomSheet>
  );
};
