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
import { DELIVERY_FEE, PICKUP_FEE, SERVICE_LINES } from "@/lib/config";
import { emptyOrder } from "@/lib/orderLines";
import type {
  CollectionMethod,
  LineId,
  LogisticsState,
  OrderState,
  ReturnMethod,
} from "@/types";

const ORDER_STORAGE_KEY = "hostelwash_order_v2";
const LOGISTICS_STORAGE_KEY = "hostelwash_logistics_v1";

const buildEmptyState = emptyOrder;

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
    const parsed = JSON.parse(raw) as Partial<Record<LineId, unknown>>;
    const base = buildEmptyState();
    (Object.keys(base) as LineId[]).forEach((id) => {
      const v = parsed[id];
      if (typeof v === "number" && v > 0) base[id] = Math.floor(v);
    });
    return base;
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
  updateCount: (lineId: LineId, delta: number) => void;
  resetOrder: () => void;
  totalItems: number;
  /** Sum of clothing items only, excluding pickup/delivery fees. */
  itemsTotal: number;
  /** Sum of any pickup and delivery fees currently selected. */
  logisticsTotal: number;
  /** itemsTotal + logisticsTotal — the grand total to charge/display. */
  totalPrice: number;
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

  const updateCount = useCallback((lineId: LineId, delta: number) => {
    setOrder((prev) => {
      const next: OrderState = {
        ...prev,
        [lineId]: Math.max(0, prev[lineId] + delta),
      };
      // Ironing can't exceed the number of everyday clothes being washed.
      const everyday = next.everydayWhite + next.everydayColoured;
      if (next.ironing > everyday) next.ironing = everyday;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

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

  const totalItems = useMemo(() => {
    // Ironing is an add-on to pieces already counted, so it isn't counted twice.
    return (Object.keys(order) as LineId[]).reduce(
      (sum, id) => (id === "ironing" ? sum : sum + order[id]),
      0
    );
  }, [order]);

  const itemsTotal = useMemo(() => {
    return SERVICE_LINES.reduce((sum, l) => sum + order[l.id] * l.price, 0);
  }, [order]);

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
    resetOrder,
    totalItems,
    itemsTotal,
    logisticsTotal,
    totalPrice,
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