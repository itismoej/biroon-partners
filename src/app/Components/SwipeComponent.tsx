import type React from "react";
import { useRef, useState } from "react";

export type CanSwipeDirection = boolean | "Left" | "Right";

interface SwipeComponentProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  canSwipeDirectionRef: React.MutableRefObject<CanSwipeDirection>;
  children: React.ReactNode;
}

export const SwipeComponent: React.FC<SwipeComponentProps> = ({
  onSwipeLeft,
  onSwipeRight,
  canSwipeDirectionRef,
  children,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (canSwipeDirectionRef.current === false) return;
    setStartX(e.touches[0].pageX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || startX === null || startY === null || canSwipeDirectionRef.current === false) return;

    const currentX = e.touches[0].pageX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (!isSwiping) {
      if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
        setIsSwiping(true);
      }
    } else {
      const newTranslateX = -deltaX;
      if (
        ((canSwipeDirectionRef.current === "Left" || canSwipeDirectionRef.current === true) &&
          newTranslateX > 0) ||
        ((canSwipeDirectionRef.current === "Right" || canSwipeDirectionRef.current === true) &&
          newTranslateX < 0)
      ) {
        setTranslateX(newTranslateX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || startX === null || canSwipeDirectionRef.current === false) return;

    const containerWidth = sliderRef.current?.offsetWidth || 1;
    const threshold = containerWidth * 0.3;

    if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
      setTimeout(() => {
        setTranslateX(600);
      }, 50);
    } else if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
      setTimeout(() => {
        setTranslateX(-600);
      }, 50);
    }

    setTimeout(() => {
      setTranslateX(0);
      setStartX(null);
      setStartY(null);
      setIsDragging(false);
      setIsSwiping(false);
    }, 200);
  };

  return (
    <div
      ref={sliderRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`${isDragging ? "" : "transition-transform duration-300"}`}
      style={{
        transform: `translateX(${-translateX}px)`,
        flexDirection: "row",
      }}
    >
      {children}
    </div>
  );
};
