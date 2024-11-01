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
  id: string;
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

export interface CalendarEventPatchRequest {
  employeeId?: Employee["id"];
  startDateTime?: string | Date;
  endDateTime?: string | Date;
}

export async function updateEvent(
  eventId: string,
  eventPatch: CalendarEventPatchRequest,
): Promise<{ data: CalendarEvent & { error?: string }; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/events/${eventId}/`, {
    method: "PATCH",
    credentials: "include",
    body: JSON.stringify(eventPatch),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return { data: await response.json(), response };
}

interface SendOTPResponse {
  message: string;
}

export async function sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
  const response = await fetch(`${apiUrl}/otp/`, {
    method: "POST",
    body: JSON.stringify({ phoneNumber }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

interface LoginResponse {
  expiry: string;
  token: string;
}

export async function login(
  phoneNumber: string,
  code: string,
): Promise<{ data: LoginResponse; response: Response }> {
  const response = await fetch(`${apiUrl}/login/`, {
    method: "POST",
    body: JSON.stringify({ phoneNumber, code }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  return { data, response };
}

interface AddedUser extends Omit<User, "avatar"> {
  username: string;
}

export interface Customer {
  id: string;
  user: AddedUser;
}

export async function fetchCustomers(): Promise<{ data: Customer[]; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/clients/`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  return { data, response };
}

export async function createCustomer(
  phoneNumber: string,
  code: string,
): Promise<{ data: Customer[]; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/clients/`, {
    method: "POST",
    body: JSON.stringify({ phoneNumber, code }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  return { data, response };
}
