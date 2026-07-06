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
import { CLOTHING_ITEMS } from "@/lib/config";
import type { ClothingItemId, ColourVariant, OrderState } from "@/types";

const STORAGE_KEY = "hostelwash_order_v1";

function buildEmptyState(): OrderState {
  const state = {} as OrderState;
  CLOTHING_ITEMS.forEach((item) => {
    state[item.id as ClothingItemId] = { white: 0, coloured: 0 };
  });
  return state;
}

function loadInitialState(): OrderState {
  if (typeof window === "undefined") return buildEmptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildEmptyState();
    const parsed = JSON.parse(raw) as Partial<OrderState>;
    const base = buildEmptyState();
    return { ...base, ...parsed };
  } catch {
    return buildEmptyState();
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
  totalPrice: number;
  getItemSubtotal: (itemId: ClothingItemId) => number;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<OrderState>(() => loadInitialState());

  const persist = useCallback((next: OrderState) => {
    setOrder(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    []
  );

  const resetOrder = useCallback(() => {
    persist(buildEmptyState());
  }, [persist]);

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

  const totalPrice = useMemo(() => {
    return (Object.keys(order) as ClothingItemId[]).reduce((sum, itemId) => {
      const counts = order[itemId];
      const price = priceMap[itemId];
      return sum + (counts.white + counts.coloured) * price;
    }, 0);
  }, [order, priceMap]);

  const value: OrderContextValue = {
    order,
    updateCount,
    setCount,
    resetOrder,
    totalItems,
    totalPrice,
    getItemSubtotal,
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
