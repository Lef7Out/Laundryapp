"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useOrder } from "@/context/OrderContext";
import { CLOTHING_ITEMS } from "@/lib/config";
import CounterControl from "@/components/CounterControl";
import type { ClothingItemId } from "@/types";

export default function SelectClothesPage() {
  const router = useRouter();
  const { order, updateCount, totalItems, totalPrice, getItemSubtotal } =
    useOrder();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      setIsCheckingSession(false);
    }
    checkSession();
  }, [router]);

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-ink/60">Loading your session…</p>
      </main>
    );
  }

  const formattedTotal = totalPrice.toLocaleString("en-NG");

  return (
    <main className="min-h-screen pb-32">
      <header className="border-b border-line px-6 py-6">
        <h1 className="font-display text-2xl font-bold text-ink">
          What's in the pile?
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Add counts for white and coloured items separately.
        </p>
      </header>

      <section className="space-y-5 px-6 py-6">
        {CLOTHING_ITEMS.map((item) => {
          const itemId = item.id as ClothingItemId;
          const counts = order[itemId];
          const subtotal = getItemSubtotal(itemId);

          return (
            <div
              key={item.id}
              className="rounded-card border border-line p-4 shadow-soft"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-base font-semibold text-ink">
                  {item.label}
                </h2>
                <span className="font-mono text-xs text-ink/50">
                  ₦{item.price} {item.unitNote}
                </span>
              </div>

              <div className="space-y-2">
                <CounterControl
                  label="White"
                  value={counts.white}
                  onIncrement={() => updateCount(itemId, "white", 1)}
                  onDecrement={() => updateCount(itemId, "white", -1)}
                />
                <CounterControl
                  label="Coloured"
                  value={counts.coloured}
                  onIncrement={() => updateCount(itemId, "coloured", 1)}
                  onDecrement={() => updateCount(itemId, "coloured", -1)}
                />
              </div>

              {subtotal > 0 && (
                <p className="mt-3 text-right font-mono text-sm font-medium text-suds-dark">
                  ₦{subtotal.toLocaleString("en-NG")}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* Sticky summary bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink/55">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
            <p className="font-mono text-lg font-bold text-ink">
              ₦{formattedTotal}
            </p>
          </div>
          <button
            type="button"
            disabled={totalItems === 0}
            onClick={() => router.push("/checkout")}
            className="rounded-full bg-suds px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-suds-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}
