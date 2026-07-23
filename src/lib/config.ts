// src/lib/config.ts
// Central place to edit business details. Update these before going live.

export const APP_NAME = "HostelWash";


export const WHATSAPP_NUMBER = "2349136110554";

export const BANK_DETAILS = {
  bankName: "Moniepoint MFB",
  accountNumber: "9136110554",
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
  { id: "bedsheets", label: "Bedsheets/Towels", price: 700, unitNote: "per piece" },
  { id: "duvets", label: "Duvets", price: 1500, unitNote: "per piece" },
] as const;
