import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Sort your pile",
    body: "Tell us how many whites and coloureds of each item you're sending — takes about 40 seconds.",
  },
  {
    number: "02",
    title: "Send payment, confirm on WhatsApp",
    body: "Transfer the total, then tap one button to send your order straight to our laundry line.",
  },
  {
    number: "03",
    title: "We wash, you wear",
    body: "Fresh, folded, and back at your door in your room within 48 hours.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 sm:pt-20">
        <div className="mx-auto max-w-lg text-center">
          <span className="inline-flex items-center rounded-full bg-sky px-3 py-1 text-xs font-medium text-suds-dark">
            Hostel pickup &amp; delivery
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Laundry day, without leaving your floor.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/70 sm:text-lg">
            Pick your items, pay by transfer, confirm on WhatsApp. No app
            downloads for us to chase, no queueing for machines.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="w-full max-w-xs rounded-full bg-suds px-8 py-4 text-center font-semibold text-white shadow-soft transition hover:bg-suds-dark active:scale-[0.98] sm:w-auto"
            >
              Book a Pickup
            </Link>
            <span className="text-xs text-ink/50">
              Takes under a minute · No account fees
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-lg px-6">
        <div className="clothesline" aria-hidden="true" />
      </div>

      {/* How it works */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-lg">
          <h2 className="font-display text-2xl font-bold text-ink">
            How it works
          </h2>
          <ol className="mt-6 space-y-6">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="font-mono text-sm font-medium text-marigold">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/65">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing snapshot */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-lg rounded-card border border-line bg-sky/60 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Simple, per-item pricing
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono text-lg font-semibold text-suds-dark">
                ₦400
              </p>
              <p className="mt-1 text-xs text-ink/60">
                Tops, bottoms &amp; undergarments
              </p>
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-suds-dark">
                ₦700
              </p>
              <p className="mt-1 text-xs text-ink/60">
                Trousers, heavy wear &amp; bedsheets
              </p>
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-suds-dark">
                ₦1,500
              </p>
              <p className="mt-1 text-xs text-ink/60">Duvets</p>
            </div>
          </div>
          <Link
            href="/login"
            className="mt-6 block w-full rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-ink/85"
          >
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}
