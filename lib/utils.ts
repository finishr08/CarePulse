import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine class names with Tailwind's merge strategy
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safely parse an object to a JSON string and back to an object
export const parseStringify = (value: any) => {
  if (value === undefined || value === null) {
    return value; // Return the value as is if it's undefined or null
  }
  return JSON.parse(JSON.stringify(value));
};

// Convert a file to a URL for display or download
export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// Format date and time according to specified timezone
export const formatDateTime = (
  dateString: Date | string,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    year: "numeric", // numeric year (e.g., '2023')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock
    timeZone, // use the provided timezone
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // two-digit month (e.g., '10')
    day: "2-digit", // two-digit day of the month (e.g., '25')
    timeZone, // use the provided timezone
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
    timeZone, // use the provided timezone
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock
    timeZone, // use the provided timezone
  };

  return {
    dateTime: new Date(dateString).toLocaleString("en-US", dateTimeOptions),
    dateDay: new Date(dateString).toLocaleString("en-US", dateDayOptions),
    dateOnly: new Date(dateString).toLocaleString("en-US", dateOptions),
    timeOnly: new Date(dateString).toLocaleString("en-US", timeOptions),
  };
};

// Encrypt a passkey using Base64 encoding
export function encryptKey(passkey: string) {
  return btoa(passkey);
}

// Decrypt a Base64-encoded passkey
export function decryptKey(passkey: string) {
  return atob(passkey);
}
