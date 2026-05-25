import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (
  value: number,
  locale: string = "ID",
  options: Intl.NumberFormatOptions = {},
) => new Intl.NumberFormat(locale, options).format(value);

export const convertToMinutes = (timeString: string = "0"): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const convertMinutesToTimeString = (minutes: number): string => {
  const mins = Math.floor(minutes % 60);
  const hours = Math.floor(minutes / 60);
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMins = String(mins).padStart(2, "0");

  return `${formattedHours}:${formattedMins}`;
};

export const createDateFromTime = (time: string = "00:00") => {
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(Number(hour));
  date.setMinutes(Number(minute));
  return date;
};

export const capitalize = (str: string | null | undefined): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const throttle = <T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number,
) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function formatDateTime(value?: string | Date): string {
  if (!value) return "-";

  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} • ${hh}.${mm}`;
}

export function formatDate(value?: string | Date): string {
  if (!value) return "-";

  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatDateDDMMMYYYY(value?: string | Date): string {
  if (!value) return "-";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatPresentSince(value?: string | Date | null): string {
  if (!value) return "Not Present";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "Not Present";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function extractFileName(url: string): string | null {
  try {
    let extracted = "";
    try {
      const parsed = new URL(url);
      extracted = parsed.pathname.split("/").pop() || "";
    } catch {
      const withoutQuery = url.split(/[?#]/)[0];
      extracted = withoutQuery.split("/").pop() || "";
    }

    const finalName = extracted || url;
    return finalName ? decodeURIComponent(finalName) : null;
  } catch (err) {
    console.error("Failed to extract file name from URL", err);
    return null;
  }
}

export function ensureDate(value: unknown): Date | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }
  try {
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}

export function toISOStringSafe(value: unknown): string | undefined {
  const d = ensureDate(value);
  return d ? d.toISOString() : undefined;
}

export function toDateOnlyString(value: unknown): string | undefined {
  const d = ensureDate(value);
  if (!d) return undefined;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateToDDMMYYYY(value: unknown): string | undefined {
  const d = ensureDate(value);
  if (!d) return undefined;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

export function parseCategorySelection(
  value: string | null,
  onCategoryChange: (categoryId: string) => void,
  onSubCategoryChange: (subCategoryId: string) => void,
): void {
  if (value) {
    try {
      const parsed = JSON.parse(value);
      onCategoryChange(parsed.category_id || "");
      onSubCategoryChange(parsed.sub_category_id || "");
    } catch {
      onCategoryChange("");
      onSubCategoryChange("");
    }
  } else {
    onCategoryChange("");
    onSubCategoryChange("");
  }
}

export function onlyDigits(value: string) {
  return value.replace(/\D+/g, "");
}

export function toNumberOrNull(s: string | undefined) {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function formatWithThousandSeparator(value: string): string {
  if (!value) return "";
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function removeThousandSeparator(value: string): string {
  return value.replace(/\./g, "");
}

export function formatTimeHHMM(value: string): string {
  if (!value) return "-";
  const parts = value.split(":");
  const hh = parts[0] || "00";
  const mm = parts[1] || "00";
  return `${hh}.${mm}`;
}

export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
};

export function getFilenameFromUrl(url: string) {
  if (!url) return "-";
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split("/").pop();
    return filename || "-";
  } catch {
    return "-";
  }
}

export function parseAxiosError(
  error: unknown,
  defaultMessage: string,
): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: { message?: string };
      };
      message?: string;
    };
    return (
      axiosError.response?.data?.message || axiosError.message || defaultMessage
    );
  } else if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

export const capitalizeWords = (str: string | null | undefined) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
};

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "-";
  if (phone.startsWith("+62")) return phone.slice(1);
  if (phone.startsWith("62")) return phone;
  if (phone.startsWith("0")) return `62${phone.slice(1)}`;
  return phone;
};

export const formatDateToString = (date: Date | undefined) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatEnumString = (str: string | null | undefined) => {
  if (!str) return "-";
  return str
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => {
      const lowerWord = word.toLowerCase();

      if (lowerWord === "qr") return "QR";
      if (lowerWord === "ewallet") return "E-Wallet";
      if (lowerWord === "shopeepay") return "ShopeePay";

      const forceTitleCase = ["bank", "transfer"];
      if (forceTitleCase.includes(lowerWord)) {
        return capitalize(lowerWord);
      }

      if (word.length > 1 && word === word.toUpperCase()) {
        return word;
      }

      return capitalize(lowerWord);
    })
    .join(" ");
};

export const normalizeHtml = (s: string | undefined | null): string =>
  (s || "")
    .replace(/^\s+|\s+$/g, "")
    .replace(/^(<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>)$/i, "");

export function formatDatePeriod(
  startDate: string,
  endDate: string,
  locale: string = "en",
): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    id: "id-ID",
  };
  const localeCode = localeMap[locale] || "en-US";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString(localeCode, { month: "short" });
    return `${day} ${month}`;
  };

  const startFormatted = formatDate(startDate);
  const endDate_ = new Date(endDate);
  const endDay = endDate_.getDate();
  const endMonth = endDate_.toLocaleString(localeCode, { month: "short" });
  const endYear = endDate_.getFullYear();

  return `${startFormatted} - ${endDay} ${endMonth} ${endYear}`;
}

export function isDateExpired(endDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return end < today;
}

export function formatCurrency(
  value: string | number | undefined | null,
): string {
  if (!value || value === "0" || value === 0) return "-";
  return `Rp${formatNumber(Number(value) || 0)}`;
}

export function formatCurrencyPagu(
  value: string | number | undefined | null,
): string {
  return (
    "Rp" +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0)
  );
}

export function formatPromoValue(
  promoType: string | undefined,
  promoValue: string | number | undefined,
): string {
  if (!promoValue) return "-";

  if (promoType === "fixed_amount") {
    return `Rp.${formatNumber(Number(promoValue) || 0)}`;
  } else if (promoType === "percentage") {
    return `${promoValue}%`;
  } else {
    return String(promoValue) || "-";
  }
}

export function getHotelDisplay(
  applyScope: string | undefined,
  hotels: { id: string; name: string }[] | undefined,
  allHotelLabel: string = "All Hotel",
  allAvailableHotels?: { id: string }[],
): string {
  if (applyScope === "all") return allHotelLabel;
  if (!hotels || hotels.length === 0) return "-";

  if (allAvailableHotels && allAvailableHotels.length > 0) {
    const allHotelIds = allAvailableHotels.map((h) => h.id);
    const selectedHotelIds = hotels.map((h) => h.id);
    const isAllHotelsSelected = allHotelIds.every((id) =>
      selectedHotelIds.includes(id),
    );

    if (isAllHotelsSelected) {
      return allHotelLabel;
    }
  }

  return hotels.map((h) => h.name).join(", ");
}

export function getRoomTypeDisplay(
  applyScope: string | undefined,
  hotels: { name: string; room_types?: { name: string }[] }[] | undefined,
  allRoomTypeLabel: string = "All Room Type",
): string[] {
  if (applyScope === "all") return [allRoomTypeLabel];
  if (!hotels || hotels.length === 0) return ["-"];

  return hotels.map((hotel) => {
    const roomTypes = hotel.room_types?.map((rt) => rt.name) || [];
    if (roomTypes.length === 0) {
      return `${hotel.name} - ${allRoomTypeLabel}`;
    }
    return `${hotel.name} - ${roomTypes.join(", ")}`;
  });
}

export function ensureE164(phone: string): string {
  if (!phone) return "";
  if (phone.startsWith("+")) return phone;
  if (phone.startsWith("62")) return `+${phone}`;
  if (phone.startsWith("0")) return `+62${phone.slice(1)}`;
  return `+${phone}`;
}
export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Day = (typeof DAYS)[number];

export function calculateAvailableDays(
  startDate?: string,
  endDate?: string,
): Day[] {
  if (!startDate || !endDate) return [...DAYS];

  const start = ensureDate(startDate);
  const end = ensureDate(endDate);

  if (!start || !end) return [...DAYS];

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  if (diff >= 6) return [...DAYS];

  const result = new Set<string>();
  const current = new Date(start);
  while (current <= end) {
    const dayIndex = current.getDay();
    const index = (dayIndex + 6) % 7;
    result.add(DAYS[index]);
    current.setDate(current.getDate() + 1);
  }

  return [...DAYS].filter((day) => result.has(day));
}
