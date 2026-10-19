"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useOrder } from "@/context/OrderContext";
import OptionCard from "@/components/OptionCard";
import {
  DELIVERY_FEE,
  PICKUP_FEE,
  WHATSAPP_NUMBER,
} from "@/lib/config";
import { getHoursStatus } from "@/lib/hours";
import { buildItemLines as makeItemLines } from "@/lib/orderLines";
import type { OrderItemLine, UserProfile } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    order,
    totalItems,
    itemsTotal,
    logisticsTotal,
    totalPrice,
    logistics,
    setCollectionMethod,
    setReturnMethod,
    resetOrder,
  } = useOrder();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ ref: string; url: string } | null>(null);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (totalItems === 0) {
        router.replace("/select-clothes");
        return;
      }

      const metadata = session.user.user_metadata ?? {};
      setUserId(session.user.id);
      setProfile({
        fullName: metadata.full_name ?? "Student",
        phoneNumber: metadata.phone_number ?? "Not provided",
        hostelRoom: metadata.hostel_room ?? "Not provided",
        email: session.user.email ?? "",
      });
      setIsLoading(false);
    }

    loadSession();
    // Only run on mount; the totalItems check intentionally uses the value at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function buildItemLines(): OrderItemLine[] {
    return makeItemLines(order);
  }

  function buildWhatsAppMessage(ref: string, isAfterHours: boolean): string {
    if (!profile) return "";

    const lines: string[] = [];
    lines.push("*New Laundry Order — HostelWash*");
    lines.push(`*Ref:* ${ref}`);
    lines.push("");
    lines.push(`*Name:* ${profile.fullName}`);
    lines.push(`*Room:* ${profile.hostelRoom}`);
    lines.push(`*Phone:* ${profile.phoneNumber}`);
    lines.push("");
    lines.push("*Order rundown:*");

    buildItemLines().forEach((line) => {
      lines.push(
        `• ${line.label} — ${line.detail} (₦${line.subtotal.toLocaleString(
          "en-NG"
        )})`
      );
    });

    lines.push("");
    lines.push("*Delivery:*");
    lines.push(
      `• Collection — ${
        logistics.collectionMethod === "pickup"
          ? `Pickup from my room (₦${PICKUP_FEE})`
          : "I'll drop it off (free)"
      }`
    );
    lines.push(
      `• Return — ${
        logistics.returnMethod === "delivery"
          ? `Delivery to my room (₦${DELIVERY_FEE})`
          : "I'll collect it (free)"
      }`
    );

    lines.push("");
    lines.push(`*Total items:* ${totalItems}`);
    lines.push(`*Total due:* ₦${totalPrice.toLocaleString("en-NG")}`);
    if (isAfterHours) {
      lines.push("");
      lines.push("_Sent outside operating hours._");
    }
    lines.push("");
    lines.push(
      "Please send your account details so I can make the transfer, and let me know the pickup window. Thank you!"
    );

    return lines.join("\n");
  }

  async function handleSend() {
    if (!profile || !userId || isSending) return;

    setIsSending(true);
    setSendError(null);

    // Open the tab right now, while the tap still counts as a user action.
    // Browsers block window.open() when it's called after an await.
    const popup = window.open("", "_blank");

    const hours = getHoursStatus(new Date());

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: profile.fullName,
        phone: profile.phoneNumber,
        hostel_room: profile.hostelRoom,
        items: buildItemLines(),
        items_total: itemsTotal,
        logistics_total: logisticsTotal,
        total: totalPrice,
        collection_method: logistics.collectionMethod,
        return_method: logistics.returnMethod,
        after_hours: !hours.isOpen,
      })
      .select("ref")
      .single();

    if (error || !data) {
      popup?.close();
      setSendError(
        "We couldn't save your order. Check your connection and try again."
      );
      setIsSending(false);
      return;
    }

    const ref = data.ref as string;
    const message = buildWhatsAppMessage(ref, !hours.isOpen);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    if (popup) {
      popup.location.href = url;
    }

    setSent({ ref, url });
    resetOrder();
    setIsSending(false);
  }

  if (sent) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs font-medium text-marigold">
            ORDER {sent.ref}
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">
            Order saved — finish on WhatsApp
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/65">
            Your order is recorded. Send the pre-filled message in WhatsApp and
            we&apos;ll reply with payment details. Quote {sent.ref} if you need
            to follow up.
          </p>
          <a
            href={sent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center rounded-full bg-whatsapp px-6 py-4 text-sm font-semibold text-white shadow-soft transition hover:bg-whatsapp-dark"
          >
            Open WhatsApp
          </a>
          <p className="mt-2 text-xs text-ink/50">
            WhatsApp didn&apos;t open on its own? Tap the button above.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-suds"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-ink/60">Preparing your order…</p>
      </main>
    );
  }

  const hours = getHoursStatus(new Date());
  const formattedItemsTotal = itemsTotal.toLocaleString("en-NG");
  const formattedTotal = totalPrice.toLocaleString("en-NG");

  return (
    <main className="min-h-screen px-6 py-8 pb-16">
      <div className="mx-auto max-w-lg">
        <Link
          href="/select-clothes"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-suds"
        >
          ← Edit order
        </Link>

        <h1 className="font-display text-2xl font-bold text-ink">
          Review &amp; send
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Choose how your laundry travels, then send your order on WhatsApp.
        </p>

        {/* Pickup & delivery */}
        <section className="mt-6 rounded-card border border-line p-5">
          <h2 className="font-display text-lg font-semibold text-ink">
            Stay in. We&apos;ll come to you.
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            No need to move — we can collect from your room and bring it back
            clean.
          </p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Getting it to us
          </p>
          <div className="mt-2 space-y-2">
            <OptionCard
              label="We pick it up from your room"
              description="No need to move. We come to you."
              feeLabel={`+₦${PICKUP_FEE}`}
              isSelected={logistics.collectionMethod === "pickup"}
              onSelect={() => setCollectionMethod("pickup")}
            />
            <OptionCard
              label="I'll drop it off"
              description="Bring it to us yourself"
              feeLabel="Free"
              isSelected={logistics.collectionMethod === "dropoff"}
              onSelect={() => setCollectionMethod("dropoff")}
            />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Getting it back to you
          </p>
          <div className="mt-2 space-y-2">
            <OptionCard
              label="We deliver it to your room"
              description="Fresh clothes at your door. No walking."
              feeLabel={`+₦${DELIVERY_FEE}`}
              isSelected={logistics.returnMethod === "delivery"}
              onSelect={() => setReturnMethod("delivery")}
            />
            <OptionCard
              label="I'll collect it"
              description="Pick up your clean laundry from us"
              feeLabel="Free"
              isSelected={logistics.returnMethod === "selfPickup"}
              onSelect={() => setReturnMethod("selfPickup")}
            />
          </div>
        </section>

        {/* Order summary card */}
        <section className="mt-5 rounded-card border border-line p-5 shadow-soft">
          <h2 className="font-display text-base font-semibold text-ink">
            Order summary
          </h2>
          <div className="mt-3 space-y-2">
            {buildItemLines().map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-ink">{line.label}</p>
                  <p className="text-xs text-ink/50">{line.detail}</p>
                </div>
                <p className="font-mono text-ink/80">
                  ₦{line.subtotal.toLocaleString("en-NG")}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <p className="text-ink/70">Items subtotal</p>
            <p className="font-mono text-ink/80">₦{formattedItemsTotal}</p>
          </div>

          {logisticsTotal > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-line pt-3">
              {logistics.collectionMethod === "pickup" && (
                <div className="flex items-center justify-between text-sm">
                  <p className="text-ink/70">Pickup from your room</p>
                  <p className="font-mono text-ink/80">
                    +₦{PICKUP_FEE.toLocaleString("en-NG")}
                  </p>
                </div>
              )}
              {logistics.returnMethod === "delivery" && (
                <div className="flex items-center justify-between text-sm">
                  <p className="text-ink/70">Delivery to your room</p>
                  <p className="font-mono text-ink/80">
                    +₦{DELIVERY_FEE.toLocaleString("en-NG")}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="clothesline" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <p className="font-display text-base font-semibold text-ink">
              Total due
            </p>
            <p className="font-mono text-xl font-bold text-suds-dark">
              ₦{formattedTotal}
            </p>
          </div>
        </section>

        <p
          role="status"
          className={`mt-5 rounded-xl px-4 py-3 text-sm ${
            hours.isOpen
              ? "bg-sky text-suds-dark"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {hours.message}
        </p>

        <p className="mt-4 text-xs leading-relaxed text-ink/60">
          Tapping the button below saves your order and opens WhatsApp with the
          details filled in. We&apos;ll reply there with the account to pay
          into.
        </p>

        {sendError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {sendError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-4 text-sm font-semibold text-white shadow-soft transition hover:bg-whatsapp-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Saving your order…" : "Send Order via WhatsApp"}
        </button>
      </div>
    </main>
  );
}