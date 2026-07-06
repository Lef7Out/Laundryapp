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
