# HostelWash

Mobile-first laundry booking app: pick items → pay by bank transfer → confirm
via WhatsApp. No payment gateway.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase project URL + anon key
npm run dev
```

Open http://localhost:3000

## Before going live

1. **Supabase project** — create one at supabase.com, enable Email/Password
   under Authentication → Providers, and paste the URL + anon key into
   `.env.local`.
2. **`src/lib/config.ts`** — replace `WHATSAPP_NUMBER` (international format,
   digits only, e.g. `2348031234567`) and `BANK_DETAILS` with your real
   account.
3. **Optional: `profiles` table** — user name/phone/room are currently stored
   as Supabase Auth `user_metadata` (set on sign-up, read at checkout). If you
   later want to query/filter students from a dashboard, mirror this into a
   `profiles` table with a Postgres trigger on `auth.users`.

## Flow

1. `/` — landing page, "Book a Pickup" → `/login`
2. `/register` or `/login` — Supabase email/password auth; registration also
   captures name, phone, and hostel room as auth metadata
3. `/select-clothes` — counters per item (white / coloured), sticky bottom bar
   with live total, protected route (redirects to `/login` if not signed in)
4. `/checkout` — reads order from context + profile from the Supabase
   session, shows bank transfer details, "Send Order via WhatsApp" opens
   `wa.me` with a pre-filled, formatted order + "Payment Sent" note, then
   clears the cart

State (`src/context/OrderContext.tsx`) also persists to `localStorage` so a
refresh mid-selection doesn't wipe the cart.
