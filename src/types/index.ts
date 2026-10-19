// src/types/index.ts

export type LineId =
  | "everydayWhite"
  | "everydayColoured"
  | "ironing"
  | "towel"
  | "bedsheet"
  | "duvetThick"
  | "duvetLight"
  | "shoes"
  | "suitWashIron"
  | "suitIronOnly";

// Quantity per line id.
export type OrderState = Record<LineId, number>;
export interface UserProfile {
  fullName: string;
  phoneNumber: string;
  hostelRoom: string;
  email: string;
}

// Leg 1: getting dirty clothes to the laundry
export type CollectionMethod = "dropoff" | "pickup";

// Leg 2: getting clean clothes back to the student
export type ReturnMethod = "selfPickup" | "delivery";

export interface LogisticsState {
  collectionMethod: CollectionMethod;
  returnMethod: ReturnMethod;
}

// One line of a saved order (stored as JSON in the orders table)
export interface OrderItemLine {
  id: string;
  label: string;
  /** Readable breakdown, e.g. "3 white · 2 coloured". Missing on older orders. */
  detail?: string;
  /** Only present on orders saved before the price-list update. */
  white?: number;
  coloured?: number;
  subtotal: number;
}

export type OrderStatus =
  | "new"
  | "confirmed"
  | "picked_up"
  | "washing"
  | "ready"
  | "completed"
  | "cancelled";

// A row from the Supabase `orders` table
export interface OrderRow {
  id: string;
  ref: string;
  created_at: string;
  customer_name: string;
  phone: string;
  hostel_room: string;
  items: OrderItemLine[];
  items_total: number;
  logistics_total: number;
  total: number;
  collection_method: CollectionMethod;
  return_method: ReturnMethod;
  express: boolean;
  after_hours: boolean;
  status: OrderStatus;
}