// src/lib/config.ts
// Central place to edit business details. Update these before going live.

export const APP_NAME = "HostelWash";

// Full international format, no "+", no spaces (WhatsApp API requirement).
// Example: Nigerian number 0803 123 4567 -> "2348031234567"
export const WHATSAPP_NUMBER = "2348031234567";

export const BANK_DETAILS = {
  bankName: "Moniepoint MFB",
  accountNumber: "1234567890",
  accountName: "HostelWash Laundry Services",
};

export const CLOTHING_ITEMS = [
  { id: "tshirt", label: "T-Shirt", price: 400, unitNote: "per piece" },
  { id: "shirt", label: "Shirt", price: 400, unitNote: "per piece" },
  { id: "trousers", label: "Trousers", price: 700, unitNote: "per piece" },
  {
    id: "sweatpantsHoodies",
    label: "Sweatpants / Hoodies",
    price: 700,
    unitNote: "per piece",
  },
  { id: "shorts", label: "Shorts", price: 400, unitNote: "per piece" },
  {
    id: "underwear",
    label: "Underwear (Boxers, Vests, Bras, etc.)",
    price: 400,
    unitNote: "per piece",
  },
  { id: "socks", label: "Socks", price: 400, unitNote: "per pair" },
  { id: "bedsheets", label: "Bedsheets", price: 700, unitNote: "per piece" },
  { id: "duvets", label: "Duvets", price: 1500, unitNote: "per piece" },
] as const;

// Leg 1 (dirty clothes -> laundry): dropoff is free (student brings it themselves),
// pickup costs extra (someone collects it from the student's hostel room).
export const PICKUP_FEE = 300;

// Leg 2 (clean clothes -> student): self pick-up is free, delivery to the
// hostel costs extra.
export const DELIVERY_FEE = 300;

// Optional priority add-on, kept cheap so it's an easy upsell rather than a
// big decision.
export const EXPRESS_FEE = 200;

