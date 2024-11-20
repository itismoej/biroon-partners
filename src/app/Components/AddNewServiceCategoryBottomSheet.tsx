import { BottomSheet, BottomSheetFooter, type BottomSheetProps } from "@/app/Components/BottomSheet";
import { InputField } from "@/app/Components/FormFields";
import {
  type Location,
  type ServiceCategory,
  createServiceCategory,
  fetchLocation,
  fetchServiceCategories,
} from "@/app/api";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";

export const AddNewServiceCategoryBottomSheet = (
  props: BottomSheetProps & {
    setLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
    setServiceCategories: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
  },
) => {
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const router = useRouter();

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
              fetchLocation().then(({ data, response }) => {
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
                      props.setServiceCategories(svcCategoriesData);
                      props.setLocation(data);
                      setNewCategoryName("");
                    }
                  });
                }

                if (props.onClose) props.onClose();
              });
            }
          });
        }}
        selectText="اضافه کردن"
        closeText="لغو"
      />
    </BottomSheet>
  );
};
