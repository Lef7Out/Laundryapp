"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useOrder } from "@/context/OrderContext";
import { CLOTHING_ITEMS, WHATSAPP_NUMBER } from "@/lib/config";
import type { ClothingItemId, UserProfile } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { order, totalItems, totalPrice, resetOrder } = useOrder();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

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
      setProfile({
        fullName: metadata.full_name ?? "Student",
        phoneNumber: metadata.phone_number ?? "Not provided",
        hostelRoom: metadata.hostel_room ?? "Not provided",
        email: session.user.email ?? "",
      });
      setIsLoading(false);
    }

    loadSession();
    // Only run on mount; totalItems check intentionally uses the value at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);


  function buildWhatsAppMessage(): string {
    if (!profile) return "";

    const lines: string[] = [];
    lines.push("*New Laundry Order — HostelWash*");
    lines.push("");
    lines.push(`*Name:* ${profile.fullName}`);
    lines.push(`*Room:* ${profile.hostelRoom}`);
    lines.push(`*Phone:* ${profile.phoneNumber}`);
    lines.push("");
    lines.push("*Order rundown:*");

    CLOTHING_ITEMS.forEach((item) => {
      const itemId = item.id as ClothingItemId;
      const counts = order[itemId];
      const pieces = counts.white + counts.coloured;
      if (pieces === 0) return;

      const parts: string[] = [];
      if (counts.white > 0) parts.push(`${counts.white} white`);
      if (counts.coloured > 0) parts.push(`${counts.coloured} coloured`);

      const lineTotal = pieces * item.price;
      lines.push(
        `• ${item.label} — ${parts.join(", ")} (₦${lineTotal.toLocaleString(
          "en-NG"
        )})`
      );
    });

    lines.push("");
    lines.push(`*Total items:* ${totalItems}`);
    lines.push(`*Total due:* ₦${totalPrice.toLocaleString("en-NG")}`);
    lines.push("");
    lines.push(
  "Please send your account details so I can make the transfer, and let me know the pickup window. Thank you!"
);
    return lines.join("\n");
  }

  function handleSendToWhatsApp() {
    const message = buildWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    resetOrder();
  }

  if (isLoading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-ink/60">Preparing your order…</p>
      </main>
    );
  }

  const formattedTotal = totalPrice.toLocaleString("en-NG");

  return (
    <main className="min-h-screen px-6 py-8 pb-16">
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-2xl font-bold text-ink">
  Review &amp; send
</h1>
<p className="mt-1 text-sm text-ink/60">
  Send your order on WhatsApp — we'll reply with payment details there.
</p>

        {/* Order summary card */}
        <section className="mt-6 rounded-card border border-line p-5 shadow-soft">
          <h2 className="font-display text-base font-semibold text-ink">
            Order summary
          </h2>
          <div className="mt-3 space-y-2">
            {CLOTHING_ITEMS.map((item) => {
              const itemId = item.id as ClothingItemId;
              const counts = order[itemId];
              const pieces = counts.white + counts.coloured;
              if (pieces === 0) return null;

              const lineTotal = pieces * item.price;
              const detail = [
                counts.white > 0 ? `${counts.white} white` : null,
                counts.coloured > 0 ? `${counts.coloured} coloured` : null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="text-ink">{item.label}</p>
                    <p className="text-xs text-ink/50">{detail}</p>
                  </div>
                  <p className="font-mono text-ink/80">
                    ₦{lineTotal.toLocaleString("en-NG")}
                  </p>
                </div>
              );
            })}
          </div>
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

        <button
          type="button"
          onClick={handleSendToWhatsApp}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-4 text-sm font-semibold text-white shadow-soft transition hover:bg-whatsapp-dark active:scale-[0.98]"
        >
          Send Order via WhatsApp
        </button>
      </div>
    </main>
  );
}
