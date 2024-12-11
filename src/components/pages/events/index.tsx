import type { Location } from "@/app/api";
import EditEvent from "@/components/EditEvent";
import type FullCalendar from "@fullcalendar/react";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

type Props = {
  location: Location | undefined;
  calendarRef: React.RefObject<FullCalendar>;
};

function Events({ calendarRef, location }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = useMemo(() => {
    return searchParams.get("id");
  }, [searchParams]);

  return <>{isEditMode ? <EditEvent location={location} calendarRef={calendarRef} /> : <div>Events</div>}</>;
}

export default Events;
