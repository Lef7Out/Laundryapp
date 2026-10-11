"use client";

// src/context/OrderContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CLOTHING_ITEMS, DELIVERY_FEE, PICKUP_FEE } from "@/lib/config";
import type {
  ClothingItemId,
  CollectionMethod,
  ColourVariant,
  LogisticsState,
  OrderState,
  ReturnMethod,
} from "@/types";

const ORDER_STORAGE_KEY = "hostelwash_order_v1";
const LOGISTICS_STORAGE_KEY = "hostelwash_logistics_v1";

function buildEmptyState(): OrderState {
  const state = {} as OrderState;
  CLOTHING_ITEMS.forEach((item) => {
    state[item.id as ClothingItemId] = { white: 0, coloured: 0 };
  });
  return state;
}

function buildDefaultLogistics(): LogisticsState {
  return {
    collectionMethod: "dropoff",
    returnMethod: "selfPickup",
  };
}

function loadInitialState(): OrderState {
  if (typeof window === "undefined") return buildEmptyState();
  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return buildEmptyState();
    const parsed = JSON.parse(raw) as Partial<OrderState>;
    const base = buildEmptyState();
    return { ...base, ...parsed };
  } catch {
    return buildEmptyState();
  }
}

// Only reads the two fields we still use, so anything old left in the
// browser's saved data (like a removed express option) is ignored.
function loadInitialLogistics(): LogisticsState {
  if (typeof window === "undefined") return buildDefaultLogistics();
  try {
    const raw = window.localStorage.getItem(LOGISTICS_STORAGE_KEY);
    if (!raw) return buildDefaultLogistics();
    const parsed = JSON.parse(raw) as Partial<LogisticsState>;
    return {
      collectionMethod: parsed.collectionMethod === "pickup" ? "pickup" : "dropoff",
      returnMethod: parsed.returnMethod === "delivery" ? "delivery" : "selfPickup",
    };
  } catch {
    return buildDefaultLogistics();
  }
}

interface OrderContextValue {
  order: OrderState;
  updateCount: (
    itemId: ClothingItemId,
    variant: ColourVariant,
    delta: number
  ) => void;
  setCount: (
    itemId: ClothingItemId,
    variant: ColourVariant,
    value: number
  ) => void;
  resetOrder: () => void;
  totalItems: number;
  /** Sum of clothing items only, excluding pickup/delivery fees. */
  itemsTotal: number;
  /** Sum of any pickup and delivery fees currently selected. */
  logisticsTotal: number;
  /** itemsTotal + logisticsTotal — the grand total to charge/display. */
  totalPrice: number;
  getItemSubtotal: (itemId: ClothingItemId) => number;
  logistics: LogisticsState;
  setCollectionMethod: (method: CollectionMethod) => void;
  setReturnMethod: (method: ReturnMethod) => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<OrderState>(() => loadInitialState());
  const [logistics, setLogistics] = useState<LogisticsState>(() =>
    loadInitialLogistics()
  );

  const persistOrder = useCallback((next: OrderState) => {
    setOrder(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const persistLogistics = useCallback((next: LogisticsState) => {
    setLogistics(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        LOGISTICS_STORAGE_KEY,
        JSON.stringify(next)
      );
    }
  }, []);

  const updateCount = useCallback(
    (itemId: ClothingItemId, variant: ColourVariant, delta: number) => {
      setOrder((prev) => {
        const currentValue = prev[itemId][variant];
        const nextValue = Math.max(0, currentValue + delta);
        const next: OrderState = {
          ...prev,
          [itemId]: {
            ...prev[itemId],
            [variant]: nextValue,
          },
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    []
  );

  const setCount = useCallback(
    (itemId: ClothingItemId, variant: ColourVariant, value: number) => {
      const safeValue = Math.max(0, Math.floor(value) || 0);
      setOrder((prev) => {
        const next: OrderState = {
          ...prev,
          [itemId]: {
            ...prev[itemId],
            [variant]: safeValue,
          },
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    []
  );

  const resetOrder = useCallback(() => {
    persistOrder(buildEmptyState());
    persistLogistics(buildDefaultLogistics());
  }, [persistOrder, persistLogistics]);

  const setCollectionMethod = useCallback(
    (method: CollectionMethod) => {
      persistLogistics({ ...logistics, collectionMethod: method });
    },
    [logistics, persistLogistics]
  );

  const setReturnMethod = useCallback(
    (method: ReturnMethod) => {
      persistLogistics({ ...logistics, returnMethod: method });
    },
    [logistics, persistLogistics]
  );

  const priceMap = useMemo(() => {
    const map = {} as Record<ClothingItemId, number>;
    CLOTHING_ITEMS.forEach((item) => {
      map[item.id as ClothingItemId] = item.price;
    });
    return map;
  }, []);

  const getItemSubtotal = useCallback(
    (itemId: ClothingItemId) => {
      const counts = order[itemId];
      const price = priceMap[itemId];
      return (counts.white + counts.coloured) * price;
    },
    [order, priceMap]
  );

  const totalItems = useMemo(() => {
    return Object.values(order).reduce(
      (sum, counts) => sum + counts.white + counts.coloured,
      0
    );
  }, [order]);

  const itemsTotal = useMemo(() => {
    return (Object.keys(order) as ClothingItemId[]).reduce((sum, itemId) => {
      const counts = order[itemId];
      const price = priceMap[itemId];
      return sum + (counts.white + counts.coloured) * price;
    }, 0);
  }, [order, priceMap]);

  const logisticsTotal = useMemo(() => {
    let sum = 0;
    if (logistics.collectionMethod === "pickup") sum += PICKUP_FEE;
    if (logistics.returnMethod === "delivery") sum += DELIVERY_FEE;
    return sum;
  }, [logistics]);

  const totalPrice = itemsTotal + logisticsTotal;

  const value: OrderContextValue = {
    order,
    updateCount,
    setCount,
    resetOrder,
    totalItems,
    itemsTotal,
    logisticsTotal,
    totalPrice,
    getItemSubtotal,
    logistics,
    setCollectionMethod,
    setReturnMethod,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return ctx;
}