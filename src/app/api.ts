import { format } from "date-fns";

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
  upfrontPrice: number;
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
  region: string;
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
  description?: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface BusinessHour {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
}

export interface Employee {
  id: string;
  user: User;
  nickname: string;
  businessHours: BusinessHour[];
}

export type Weekday = "شنبه" | "یک‌شنبه" | "دوشنبه" | "سه‌شنبه" | "چهارشنبه" | "پنج‌شنبه" | "جمعه";

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
  rating: number;
  reviews: number;
  serviceCatalog: ServiceCatalog;
  availableServicesCount: number;
  categories: Category[];
  images: Image[];
  team: User[];
  about: {
    description: string;
    workingDays: WorkingDay[];
  };
}

type ReserveStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "ARCHIVED";

export interface ReserveData {
  id: string;
  customer: Customer;
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

export async function fetchEvent(id: string): Promise<{ data: CalendarEvent; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/events/${id}/`, { credentials: "include" });
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

export async function createCustomer({
  firstName,
  lastName,
  phoneNumber,
}: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}): Promise<{ data: Customer; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/clients/`, {
    method: "POST",
    body: JSON.stringify({ phoneNumber, firstName, lastName }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  return { data, response };
}

export const fetchLocation: () => Promise<{ data: Location; response: Response }> = async () => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await fetch(`${apiUrl}/partners/my-location/`, {
    headers: {
      "X-Timezone": timeZone,
    },
    credentials: "include",
  });
  return { data: await response.json(), response };
};

export interface AvailableEmployee {
  id: string;
  nickname: string;
  user: User;
  formattedPrice: string;
  price: number;
  durationInMins: number;
  formattedDuration: string;
}

export interface AvailableEmployeesByService {
  noPreferenceEmployee: {
    formattedMinimumPrice: string;
    minimumPrice: number;
    minimumDurationInMins: number;
    formattedMinimumDuration: string;
  };
  employees: AvailableEmployee[];
}

export async function fetchAvailableEmployeesByService(
  svcItem: Service["id"],
): Promise<{ data: AvailableEmployeesByService; response: Response }> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await fetch(`${apiUrl}/partners/available-employees/?svcItems=${svcItem}`, {
    headers: {
      "X-Timezone": timeZone,
    },
    credentials: "include",
  });
  return { data: await response.json(), response };
}

type StartDateTime = string;

interface CartInputItem {
  serviceId: string;
  employeeAssociations: string[];
}

export type CartInput = CartInputItem[];

export interface NewAppointment {
  startDateTime: StartDateTime;
  cartInput: CartInput;
  customerId?: Customer["id"];
}

export async function createReservation(
  newAppointment: NewAppointment,
): Promise<{ data: ReserveData; response: Response }> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await fetch(`${apiUrl}/partners/events/`, {
    method: "POST",
    body: JSON.stringify(newAppointment),
    headers: {
      "Content-Type": "application/json",
      "X-Timezone": timeZone,
    },
    credentials: "include",
  });
  const data = await response.json();
  return { data, response };
}

export interface UserStatus {
  status: "NoLocation" | "Employee" | "LocationOwner";
  user?: User;
}

export async function fetchUserStatus(): Promise<{ data: UserStatus; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/status/`, {
    credentials: "include",
  });
  return { data: await response.json(), response };
}

export async function logout() {
  const response = await fetch(`${apiUrl}/logout/`, {
    method: "POST",
    credentials: "include",
  });
  return { response };
}

export interface Onboarding {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  enBusinessName?: string;
  website?: string;
  categories?: string;
  address?: {
    region: string;
    latitude: number;
    longitude: number;
    address: string;
    title: string;
  };
  isConfirmed?: boolean;
}

export async function fetchOnboarding(): Promise<{ data: Onboarding; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/onboarding/`, {
    credentials: "include",
  });
  return { data: await response.json(), response };
}

export async function updateOnboarding(data: Onboarding): Promise<{ data: Onboarding; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/onboarding/`, {
    method: "PATCH",
    credentials: "include",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return { data: await response.json(), response };
}

export async function confirmOnboarding(): Promise<{ data: Location; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/onboarding/confirm/`, {
    method: "POST",
    credentials: "include",
  });
  return { data: await response.json(), response };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  is_primary: boolean;
}

export async function fetchCategories(): Promise<{ data: Category[]; response: Response }> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await fetch(`${apiUrl}/location/main-categories/`, {
    headers: {
      "X-Timezone": timeZone,
    },
  });
  return { data: await response.json(), response };
}

export interface ReverseGeocodeResponse {
  status: "OK" | "ERROR"; // Adjust "ERROR" based on any potential error codes if available
  formatted_address: string; // Full address
  route_name: string | null; // Street name at the end of the address
  route_type: string | null; // Type of street (e.g., primary, secondary)
  neighbourhood: string | null; // Neighborhood name (if available)
  city: string; // City name
  state: string; // Province/State name
  place: string | null; // Name of public place (if available)
  municipality_zone: string | null; // Municipality zone (if available)
  in_traffic_zone: boolean; // Whether in a traffic zone
  in_odd_even_zone: boolean; // Whether in odd/even traffic zone
  village: string | null; // Village name (if applicable)
  county: string; // County name
  district: string; // District name
}

export const fetchReverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<ReverseGeocodeResponse> => {
  const response = await fetch(`https://api.neshan.org/v5/reverse?lat=${latitude}&lng=${longitude}`, {
    headers: {
      "Api-Key": "service.af65e25ca7c24b3081d0a330bfbfdf25",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return (await response.json()) as ReverseGeocodeResponse;
};

export interface ServiceCategory {
  id: string;
  name: string;
}

export async function fetchServiceCategories(): Promise<{ data: ServiceCategory[]; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/service-categories/`, {
    credentials: "include",
  });
  return { data: await response.json(), response };
}

export async function createServiceCategory(
  name: string,
): Promise<{ data: ServiceCategory; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/service-categories/`, {
    credentials: "include",
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return { data: await response.json(), response };
}

export interface NewServicePerEmployee {
  id: string;
  isOperator: boolean;
  price?: Service["price"];
  upfrontPrice?: Service["upfrontPrice"];
  durationInMins?: Service["durationInMins"];
}

export interface CreateNewService {
  name: string;
  category: Category["id"];
  serviceCategory: ServiceCategory["id"];
  durationInMins?: number;
  price: number;
  upfrontPrice?: number;
  description?: string;
  isRecommendedByLocation?: boolean;
  gender: string;
  perEmployeeSettings: NewServicePerEmployee[];
}

export async function createNewService(newService: CreateNewService): Promise<{ response: Response }> {
  const response = await fetch(`${apiUrl}/partners/services/`, {
    method: "POST",
    body: JSON.stringify(newService),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return { response };
}

export async function deleteService(serviceId: Service["id"]): Promise<{ response: Response }> {
  const response = await fetch(`${apiUrl}/partners/services/${serviceId}/`, {
    method: "DELETE",
    credentials: "include",
  });
  return { response };
}

export async function deleteServiceCategory(
  serviceCategoryId: ServiceCategory["id"],
): Promise<{ response: Response }> {
  const response = await fetch(`${apiUrl}/partners/service-categories/${serviceCategoryId}/`, {
    method: "DELETE",
    credentials: "include",
  });
  return { response };
}

interface CreateEmployee {
  firstName: string;
  lastName?: string;
  nickname?: string;
  phoneNumber: string;
  description?: string;
  isLocationOwner: boolean;
}

export async function createEmployee(
  newEmployee: CreateEmployee,
): Promise<{ data: Employee; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/employees/`, {
    method: "POST",
    body: JSON.stringify(newEmployee),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return { data: await response.json(), response };
}

export async function deleteEmployee(employeeId: Employee["id"]): Promise<{ response: Response }> {
  const response = await fetch(`${apiUrl}/partners/employees/${employeeId}/`, {
    method: "DELETE",
    credentials: "include",
  });
  return { response };
}

export interface WorkingTime {
  startTime: string;
  endTime: string;
}

export interface WorkingDay {
  day: string;
  workingHours: WorkingTime[];
  regularWorkingHours: WorkingTime[];
}

export interface EmployeeWorkingDays {
  employee: Employee;
  workingDays: WorkingDay[];
}

export interface EmployeesShifts {
  shifts: EmployeeWorkingDays[];
}

export async function fetchShifts(date: Date): Promise<{ data: EmployeesShifts; response: Response }> {
  const response = await fetch(`${apiUrl}/partners/shifts/?date=${format(date, "yyyy-MM-dd")}`, {
    credentials: "include",
  });
  return { data: await response.json(), response };
}

export async function modifyFreeTimeForEmployee(
  employeeId: Employee["id"],
  freeTimes: WorkingTime[],
  modifyingDate: Date,
): Promise<{ data: WorkingTime[]; response: Response }> {
  const response = await fetch(
    `${apiUrl}/partners/shifts/${employeeId}/${format(modifyingDate, "yyyy-MM-dd")}/`,
    {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(freeTimes),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return { data: await response.json(), response };
}

export async function modifyRegularShiftForEmployee(
  employeeId: Employee["id"],
  regularTimes: WorkingTime[],
  modifyingDate: Date,
): Promise<{ data: WorkingTime[]; response: Response }> {
  const response = await fetch(
    `${apiUrl}/partners/regular-shifts/${employeeId}/${format(modifyingDate, "yyyy-MM-dd")}/`,
    {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(regularTimes),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return { data: await response.json(), response };
}
