// src/types/index.ts

export type ClothingItemId =
  | "tshirt"
  | "shirt"
  | "trousers"
  | "sweatpantsHoodies"
  | "shorts"
  | "underwear"
  | "socks"
  | "bedsheets"
  | "duvets";

export type ColourVariant = "white" | "coloured";

export interface ItemCount {
  white: number;
  coloured: number;
}

export type OrderState = Record<ClothingItemId, ItemCount>;

export interface ClothingItemDefinition {
  id: ClothingItemId;
  label: string;
  price: number;
  unitNote: string;
}

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
  id: ClothingItemId;
  label: string;
  white: number;
  coloured: number;
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