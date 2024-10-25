const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface Category {
  id: string;
  name: string;
  icon: string;
  is_primary: boolean;
}

export interface Service {
  id: string;
  name: string;
  durationInMins: number;
  formattedDuration: string;
  price: number;
  formattedPrice: string;
  priceType: "FIXED" | "STARTS_AT";
  description?: string;
}

export interface LocationServiceCatalogCategory {
  id: string;
  name: string;
  items: Service[];
  description?: string;
}

export type ServiceCatalog = LocationServiceCatalogCategory[];

export interface Address {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}

export interface Image {
  url: string;
}

export interface User {
  id: string;
  avatar: Image;
  name: string;
  description?: string;
}

export interface BusinessHour {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface Employee {
  id: string;
  user: User;
  nickname: string;
  businessHours: BusinessHour[];
}

export type Weekday = "شنبه" | "یکشنبه" | "دوشنبه" | "سه‌شنبه" | "چهارشنبه" | "پنج‌شنبه" | "جمعه";

export interface OpeningTime {
  weekday: Weekday;
  isOpen: boolean;
  fromTime?: string;
  toTime?: string;
  isToday: boolean;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  address: Address;
  city: string;
  rating: number;
  reviews: number;
  serviceCatalog: ServiceCatalog;
  availableServicesCount: number;
  categories: Category[];
  images: Image[];
  team: User[];
  about: {
    description: string;
    openingTimes: OpeningTime[];
  };
}

type ReserveStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "ARCHIVED";

export interface ReserveData {
  id: string;
  location: Location;
  startDateTime: string;
  endDateTime: string;
  totalDurationInMins: number;
  formattedTotalDuration: string;
  totalPrice: number;
  formattedTotalPrice: string;
  upfrontPrice: number;
  formattedUpfrontPrice: string;
  formattedAtLocationPrice: string;
  status: ReserveStatus;
}

export interface CalendarEvent {
  service: Service;
  employee: Employee;
  servicePrice: number;
  serviceUpfrontPrice: number;
  startDateTime: string;
  endDateTime: string;
  durationInMins: number;
  reserve: ReserveData;
}

export async function fetchAllEvents(): Promise<{ data: CalendarEvent[]; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/events/`, { credentials: "include" });
  return { data: await response.json(), response };
}

export async function fetchAllEmployees(): Promise<{ data: Employee[]; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/employees/`, { credentials: "include" });
  return { data: await response.json(), response };
}
