"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { OrderRow, OrderStatus } from "@/types";

type AccessState = "checking" | "granted" | "denied";
type FilterKey = "active" | "new" | "done" | "all";

interface DayGroup {
    key: string;
    label: string;
    visible: OrderRow[];
    count: number;
    cancelled: number;
    value: number;
    pickups: number;
    deliveries: number;
    express: number;
    afterHours: number;
    }

const TIME_ZONE = "Africa/Lagos";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
    { value: "new", label: "New" },
    { value: "confirmed", label: "Confirmed" },
    { value: "picked_up", label: "Picked up" },
    { value: "washing", label: "Washing" },
    { value: "ready", label: "Ready" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "new", label: "New" },
    { key: "done", label: "Done" },
    { key: "all", label: "All" },
];

const CLOSED_STATUSES: OrderStatus[] = ["completed", "cancelled"];

function formatNaira(amount: number): string {
    return `₦${amount.toLocaleString("en-NG")}`;
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleString("en-NG", {
        timeZone: TIME_ZONE,
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    });
}

// Calendar day in Lagos as "YYYY-MM-DD", so "today" is the same for everyone
function dayKey(date: Date): string {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value ?? "0000";
    const month = parts.find((p) => p.type === "month")?.value ?? "00";
    const day = parts.find((p) => p.type === "day")?.value ?? "00";
    return `${year}-${month}-${day}`;
}

function formatDayLabel(
    key: string,
    todayKey: string,
    yesterdayKey: string
): string {
    if (key === todayKey) return "Today";
    if (key === yesterdayKey) return "Yesterday";
    // Noon UTC + UTC formatting avoids the date slipping across time zones
    return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-NG", {
        timeZone: "UTC",
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

// "0803 123 4567" -> "2348031234567" so wa.me links work
function toWhatsAppNumber(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("234")) return digits;
    if (digits.startsWith("0")) return `234${digits.slice(1)}`;
    return digits;
}

function matchesFilter(order: OrderRow, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "new") return order.status === "new";
  if (filter === "done") return CLOSED_STATUSES.includes(order.status);
  return !CLOSED_STATUSES.includes(order.status);
}

export default function AdminPage() {
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>("checking");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>("active");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadOrders = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (loadError) {
      setError(loadError.message);
      return;
    }
    setError(null);
    setOrders((data ?? []) as OrderRow[]);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!adminRow) {
        setAccess("denied");
        return;
      }

      setAccess("granted");
      await loadOrders();
    }

    init();
  }, [router, loadOrders]);

  // Refresh every 20 seconds so new orders show up without reloading
  useEffect(() => {
    if (access !== "granted") return;
    const timer = setInterval(loadOrders, 20000);
    return () => clearInterval(timer);
  }, [access, loadOrders]);

  async function updateStatus(id: string, status: OrderStatus) {
    const previous = orders;
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order))
    );

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setOrders(previous);
      setError("Couldn't update that order. Try again.");
    }
  }

  // Orders grouped by Lagos calendar day, newest day first, with daily totals.
  // Totals use every order from that day; the list below respects the filter.
  const dayGroups = useMemo<DayGroup[]>(() => {
    const now = new Date();
    const todayKey = dayKey(now);
    const yesterdayKey = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));

    const byDay = new Map<string, OrderRow[]>();
    orders.forEach((order) => {
      const key = dayKey(new Date(order.created_at));
      const bucket = byDay.get(key);
      if (bucket) bucket.push(order);
      else byDay.set(key, [order]);
    });

    const groups: DayGroup[] = [];
    byDay.forEach((dayOrders, key) => {
      const live = dayOrders.filter((order) => order.status !== "cancelled");
      groups.push({
        key,
        label: formatDayLabel(key, todayKey, yesterdayKey),
        visible: dayOrders.filter((order) => matchesFilter(order, filter)),
        count: dayOrders.length,
        cancelled: dayOrders.length - live.length,
        value: live.reduce((sum, order) => sum + order.total, 0),
        pickups: live.filter((order) => order.collection_method === "pickup")
          .length,
        deliveries: live.filter((order) => order.return_method === "delivery")
          .length,
        express: live.filter((order) => order.express).length,
        afterHours: live.filter((order) => order.after_hours).length,
      });
    });

    return groups.sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [orders, filter]);

  const stats = useMemo(() => {
    const todayGroup = dayGroups.find((group) => group.label === "Today");
    return {
      needsAction: orders.filter((order) => order.status === "new").length,
      ordersToday: todayGroup ? todayGroup.count : 0,
      valueToday: todayGroup ? todayGroup.value : 0,
    };
  }, [orders, dayGroups]);

  const visibleDays = dayGroups.filter((group) => group.visible.length > 0);

  if (access === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-ink/60">Checking access…</p>
      </main>
    );
  }

  if (access === "denied") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-xs text-center text-sm text-ink/70">
          This account doesn&apos;t have admin access.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 pb-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
            <p className="mt-1 text-xs text-ink/50">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString("en-NG", {
                    timeZone: TIME_ZONE,
                    hour: "numeric",
                    minute: "2-digit",
                  })} · refreshes every 20s`
                : "Loading…"}
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition hover:bg-sky"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-line p-3">
            <p className="text-xs text-ink/55">Needs action</p>
            <p className="mt-1 font-mono text-xl font-bold text-ink">
              {stats.needsAction}
            </p>
          </div>
          <div className="rounded-xl border border-line p-3">
            <p className="text-xs text-ink/55">Orders today</p>
            <p className="mt-1 font-mono text-xl font-bold text-ink">
              {stats.ordersToday}
            </p>
          </div>
          <div className="rounded-xl border border-line p-3">
            <p className="text-xs text-ink/55">Value today</p>
            <p className="mt-1 font-mono text-lg font-bold text-ink">
              {formatNaira(stats.valueToday)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === item.key
                  ? "bg-suds text-white"
                  : "border border-line text-ink hover:bg-sky"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="mt-5 space-y-8">
          {visibleDays.length === 0 && (
            <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink/50">
              No orders here yet.
            </p>
          )}

          {visibleDays.map((group) => (
            <section key={group.key}>
              <div className="sticky top-0 z-10 -mx-4 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-base font-semibold text-ink">
                    {group.label}
                  </h2>
                  <p className="font-mono text-sm font-bold text-ink">
                    {formatNaira(group.value)}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-ink/55">
                  {group.count} {group.count === 1 ? "order" : "orders"}
                  {group.visible.length !== group.count &&
                    ` (showing ${group.visible.length})`}
                  {` · ${group.pickups} pickup${group.pickups === 1 ? "" : "s"}`}
                  {` · ${group.deliveries} deliver${
                    group.deliveries === 1 ? "y" : "ies"
                  }`}
                  {group.express > 0 && ` · ${group.express} express`}
                  {group.afterHours > 0 && ` · ${group.afterHours} after hours`}
                  {group.cancelled > 0 && ` · ${group.cancelled} cancelled`}
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {group.visible.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-card border border-line p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-semibold text-suds-dark">
                          {order.ref}
                        </p>
                        <p className="mt-0.5 text-xs text-ink/50">
                          {formatTime(order.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {order.after_hours && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            After hours
                          </span>
                        )}
                        {order.express && (
                          <span className="rounded-full bg-marigold/20 px-2.5 py-1 text-xs font-medium text-ink">
                            Express
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-semibold text-ink">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-ink/70">{order.hostel_room}</p>
                      <a
                        href={`https://wa.me/${toWhatsAppNumber(order.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-block text-sm font-medium text-suds"
                      >
                        {order.phone} · WhatsApp
                      </a>
                    </div>

                    <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                      {order.items.map((line) => (
                        <li
                          key={line.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="text-ink">
                            {line.label}{" "}
                            <span className="text-xs text-ink/50">
                              {line.detail ??
                                [
                                  (line.white ?? 0) > 0 ? `${line.white} white` : null,
                                  (line.coloured ?? 0) > 0 ? `${line.coloured} coloured` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                            </span>
                          </span>
                          <span className="font-mono text-ink/70">
                            {formatNaira(line.subtotal)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                      <span className="rounded-full bg-sky px-2.5 py-1 font-medium text-suds-dark">
                        {order.collection_method === "pickup"
                          ? "Pick up from room"
                          : "Student drops off"}
                      </span>
                      <span className="rounded-full bg-sky px-2.5 py-1 font-medium text-suds-dark">
                        {order.return_method === "delivery"
                          ? "Deliver to room"
                          : "Student collects"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                      <p className="font-mono text-base font-bold text-ink">
                        {formatNaira(order.total)}
                      </p>
                      <label className="flex items-center gap-2 text-xs text-ink/60">
                        Status
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-suds"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}