export const goToNow = (behavior: ScrollBehavior = "instant") => {
  const nowLine = document.querySelector(".fc-timegrid-now-indicator-line");
  (nowLine as HTMLElement)?.scrollIntoView({ behavior, block: "center" });
};
