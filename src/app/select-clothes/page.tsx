"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useOrder } from "@/context/OrderContext";
import { SERVICE_LINES } from "@/lib/config";
import CounterControl from "@/components/CounterControl";
import type { LineId } from "@/types";

export default function SelectClothesPage() {
  const router = useRouter();
  const { order, updateCount, totalItems, itemsTotal } = useOrder();
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

  const formattedTotal = itemsTotal.toLocaleString("en-NG");
  const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const line = (id: LineId) => SERVICE_LINES.find((l) => l.id === id)!;
  const everydayCount = order.everydayWhite + order.everydayColoured;

  // A simple +/- row for a single priced line.
  const row = (id: LineId, label?: string) => {
    const l = line(id);
    return (
      <CounterControl
        key={id}
        label={`${label ?? l.label} · ${naira(l.price)}`}
        value={order[id]}
        onIncrement={() => updateCount(id, 1)}
        onDecrement={() => updateCount(id, -1)}
      />
    );
  };

  const card = "rounded-card border border-line p-4 shadow-soft";
  const heading = "font-display text-base font-semibold text-ink";

  return (
    <main className="min-h-screen pb-32">
      <header className="border-b border-line px-6 py-6">
        <h1 className="font-display text-2xl font-bold text-ink">
          What&apos;s in the pile?
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Pick what you&apos;re sending. Your total updates as you go.
        </p>
      </header>

      <section className="space-y-5 px-6 py-6">
        {/* Everyday clothes */}
        <div className={card}>
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className={heading}>Everyday clothes</h2>
            <span className="font-mono text-xs text-ink/50">
              {naira(line("everydayWhite").price)} each
            </span>
          </div>
          <p className="mb-3 text-xs text-ink/55">
            Jeans, sweats, joggers, shorts, shirts &amp; tees.
          </p>
          <div className="space-y-2">
            <CounterControl
              label="White"
              value={order.everydayWhite}
              onIncrement={() => updateCount("everydayWhite", 1)}
              onDecrement={() => updateCount("everydayWhite", -1)}
            />
            <CounterControl
              label="Coloured"
              value={order.everydayColoured}
              onIncrement={() => updateCount("everydayColoured", 1)}
              onDecrement={() => updateCount("everydayColoured", -1)}
            />
          </div>
          {everydayCount > 0 && (
            <div className="mt-3 border-t border-line pt-3">
              <div
                className={
                  order.ironing >= everydayCount
                    ? "[&_button:last-child]:pointer-events-none [&_button:last-child]:opacity-40"
                    : ""
                }
              >
                {row("ironing", "Iron these too (+₦200 each)")}
              </div>
              <p className="mt-1.5 text-xs text-ink/50">
                Up to {everydayCount} {everydayCount === 1 ? "piece" : "pieces"}.
              </p>
            </div>
          )}
        </div>

        {/* Home items */}
        <div className={card}>
          <h2 className={`${heading} mb-3`}>Home items</h2>
          <div className="space-y-2">
            {row("towel")}
            {row("bedsheet")}
            {row("duvetThick")}
            {row("duvetLight")}
          </div>
        </div>

        {/* Shoes */}
        <div className={card}>
          <h2 className={`${heading} mb-3`}>Shoes</h2>
          {row("shoes")}
        </div>

        {/* Suits */}
        <div className={card}>
          <h2 className={`${heading} mb-3`}>Suits</h2>
          <div className="space-y-2">
            {row("suitWashIron")}
            {row("suitIronOnly")}
          </div>
        </div>
      </section>

      {/* Sticky summary bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink/55">
              {totalItems} {totalItems === 1 ? "item" : "items"} · pickup &amp;
              delivery next
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