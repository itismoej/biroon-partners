"use client";

import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import {EventContentArg} from "@fullcalendar/core";


export function Calendar() {
  return (
    <div>
      <FullCalendar
        plugins={[resourceTimeGridPlugin]}
        initialView='resourceTimeGridDay'
        resources={[
          {id: "a", title: 'محمد'},
          {id: "b", title: 'سما'}
        ]}
        initialEvents={[
          { title: 'event1', start: new Date(), resourceId: 'a' },
          { title: 'event2', start: new Date(), resourceId: 'a' },
          { title: 'event3', start: new Date(), resourceId: 'b' },
          { title: 'event4', start: new Date(), resourceId: 'a' },
          { title: 'event5', start: new Date(), resourceId: 'b' },
        ]}
        allDaySlot={false}
        eventContent={renderEventContent}
        schedulerLicenseKey='GPL-My-Project-Is-Open-Source'
        locale="fa"
        height="100dvh"
        headerToolbar={false}
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
      />
    </div>
  )
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      <div><b>{eventInfo.timeText}</b></div>
      <div><i>{eventInfo.event.title}</i></div>
    </>
  )
}