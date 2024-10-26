import { useSearchParams } from "next/navigation";
import { type RefObject, useCallback, useEffect, useState } from "react";

export function toFarsiDigits(num: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (d) => farsiDigits[Number.parseInt(d)]);
}

export function toEnglishDigits(num: string): string {
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return num.replace(/[۰-۹]/g, (d) => englishDigits[farsiDigits.indexOf(d)]);
}

export function formatPriceWithSeparator(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٫");
}

export function formatPriceInFarsi(price: number): string {
  const formattedPrice = formatPriceWithSeparator(price);
  return `${toFarsiDigits(formattedPrice)} تومان`;
}

export function formatDurationInFarsi(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let result = "";

  if (hours > 0) {
    result += `${toFarsiDigits(hours)} ساعت`;
  }
  if (remainingMinutes > 0) {
    if (result) result += " و ";
    result += `${toFarsiDigits(remainingMinutes)} دقیقه`;
  }

  return result;
}

interface UseOnTopOptions {
  isNotTopThreshold?: number;
  isTopThreshold?: number;
}

export const useOnTop = (options: UseOnTopOptions = {}): boolean => {
  const { isNotTopThreshold = 40, isTopThreshold = 5 } = options;
  const [top, setTop] = useState(true);

  useEffect(() => {
    if (!window) return;

    const scrollHandler = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > isNotTopThreshold) setTop(false);
      if (scrollTop < isTopThreshold / 3) setTop(true);
    };

    window.addEventListener("scroll", scrollHandler);
    scrollHandler();

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [isNotTopThreshold, isTopThreshold]);

  return top;
};

interface UseOnTopOptions {
  isNotTopThreshold?: number;
  isTopThreshold?: number;
}

export const useOnTopWithRef = (
  options: UseOnTopOptions = {},
): [boolean, (node: HTMLElement | null) => void] => {
  const { isNotTopThreshold = 40, isTopThreshold = 5 } = options;
  const [top, setTop] = useState(true);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (node !== null) {
      setElement(node);
    } else {
      setElement(null);
    }
  }, []);

  useEffect(() => {
    if (!element) return;

    const scrollHandler = () => {
      const scrollTop = element.scrollTop || 0;

      if (scrollTop > isNotTopThreshold) {
        setTop(false);
      } else if (scrollTop < isTopThreshold) {
        setTop(true);
      }
    };

    element.addEventListener("scroll", scrollHandler);
    scrollHandler();

    return () => {
      element.removeEventListener("scroll", scrollHandler);
      setTop(true);
    };
  }, [element, isNotTopThreshold, isTopThreshold]);

  return [top, ref];
};

interface UseOnBottomOptions {
  isNotBottomThreshold?: number;
  isBottomThreshold?: number;
}

export const useOnBottom = (
  elementRef?: RefObject<HTMLElement>,
  options: UseOnBottomOptions = {},
): boolean => {
  const { isNotBottomThreshold = 25, isBottomThreshold = 8 } = options;
  const [bottom, setBottom] = useState(false);

  useEffect(() => {
    const element = elementRef?.current || window;
    if (!element) return;

    const scrollHandler = () => {
      let isAtBottom = false;

      if (element instanceof Window) {
        const scrollTop = window.scrollY || window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        isAtBottom = documentHeight - (scrollTop + windowHeight) <= isBottomThreshold;
      } else {
        const { scrollTop, scrollHeight, clientHeight } = element;

        isAtBottom = scrollHeight - (scrollTop + clientHeight) <= isBottomThreshold;
      }

      if (isAtBottom && !bottom) {
        setBottom(true);
      } else if (
        !isAtBottom &&
        bottom &&
        (element instanceof Window
          ? window.scrollY < isNotBottomThreshold
          : element.scrollTop < isNotBottomThreshold)
      ) {
        setBottom(false);
      }
    };

    element.addEventListener("scroll", scrollHandler);
    scrollHandler();

    return () => {
      element.removeEventListener("scroll", scrollHandler);
    };
  }, [elementRef?.current, isNotBottomThreshold, isBottomThreshold, bottom]);

  return bottom;
};

export const useCreateQueryParams = () => {
  const searchParams = useSearchParams();

  return useCallback(
    (params: { name: string; value: string }[] = []) => {
      const newParams = new URLSearchParams();
      const excludeParams = params.map((i) => i.name);
      searchParams.forEach((value, name) => {
        if (value && !excludeParams.includes(name)) newParams.set(name, value);
      });
      for (const { name, value } of params) {
        if (value !== undefined && value !== null && value !== "") newParams.set(name, value);
      }
      return newParams.toString();
    },
    [searchParams],
  );
};
