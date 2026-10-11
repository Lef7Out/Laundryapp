

// src/lib/hours.ts
import { OPERATING_HOURS } from "@/lib/config";

export interface HoursStatus {
    isOpen: boolean;
    message: string;
}

function formatHour(hour: number): string {
    const suffix = hour < 12 ? "am" : "pm";
    const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${twelveHour}${suffix}`;
}

function getLocalMinutes(date: Date): number {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: OPERATING_HOURS.timeZone,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    }).formatToParts(date);

    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return hour * 60 + minute;
}

export function getHoursStatus(date: Date): HoursStatus {
    const minutes = getLocalMinutes(date);
    const opensAt = OPERATING_HOURS.openHour * 60;
    const closesAt = OPERATING_HOURS.closeHour * 60;
    const isOpen = minutes >= opensAt && minutes < closesAt;

    if (isOpen) {
        return {
        isOpen: true,
        message: `Open now · taking orders until ${formatHour(
            OPERATING_HOURS.closeHour
        )}`,
        };
    }

    return {
        isOpen: false,
        message: `We're closed right now. You can still send your order — we'll pick it up when we open at ${formatHour(
        OPERATING_HOURS.openHour
        )}.`,
    };
}