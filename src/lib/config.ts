// src/lib/config.ts
// Central place to edit business details. Update these before going live.

export const APP_NAME = "ActiveLaundry";

// Full international format, no "+", no spaces (WhatsApp API requirement).
// Example: Nigerian number 0803 123 4567 -> "2348031234567"
export const WHATSAPP_NUMBER = "2349025347556";

export const BANK_DETAILS = {
  bankName: "Moniepoint MFB",
  accountNumber: "6391474104",
  accountName: "Chibuike Wisdom Obiajulu",
};

export const SERVICE_LINES = [
  { id: "everydayWhite", label: "White", price: 250, group: "everyday" },
  { id: "everydayColoured", label: "Coloured", price: 250, group: "everyday" },
  { id: "ironing", label: "Iron these too", price: 200, group: "everyday" },
  { id: "towel", label: "White towel", price: 600, group: "home" },
  { id: "bedsheet", label: "Bedsheet", price: 400, group: "home" },
  { id: "duvetThick", label: "Duvet (thick)", price: 2000, group: "home" },
  { id: "duvetLight", label: "Duvet (light)", price: 1500, group: "home" },
  { id: "shoes", label: "Shoes (per pair)", price: 1000, group: "shoes" },
  { id: "suitWashIron", label: "Suit: wash + iron", price: 2500, group: "suits" },
  { id: "suitIronOnly", label: "Suit: iron only", price: 1500, group: "suits" },
] as const;

// Leg 1 (dirty clothes -> laundry): dropoff is free (student brings it themselves),
// pickup costs extra (someone collects it from the student's hostel room).
export const PICKUP_FEE = 400;

// Leg 2 (clean clothes -> student): self pick-up is free, delivery to the
// hostel costs extra.
export const DELIVERY_FEE = 400;

// Operating hours (24-hour clock, Lagos time). Orders sent outside this window
// are still saved, but they're flagged "after hours" in /admin and the
// customer sees a heads-up on the checkout page.
export const OPERATING_HOURS = {
  openHour: 8,
  closeHour: 23,
  timeZone: "Africa/Lagos",
};

