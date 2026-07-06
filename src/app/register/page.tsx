"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hostelRoom, setHostelRoom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (
      !fullName.trim() ||
      !phoneNumber.trim() ||
      !hostelRoom.trim() ||
      !email.trim() ||
      !password
    ) {
      setErrorMessage("Fill in every field to create your account.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          hostel_room: hostelRoom.trim(),
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/select-clothes");
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold text-ink">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-ink/65">
          We use this to find your room and confirm your order.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-suds"
              placeholder="Ada Okafor"
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Phone number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-suds"
              placeholder="0803 123 4567"
            />
          </div>

          <div>
            <label
              htmlFor="hostelRoom"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Hostel &amp; room number
            </label>
            <input
              id="hostelRoom"
              type="text"
              value={hostelRoom}
              onChange={(e) => setHostelRoom(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-suds"
              placeholder="Block C, Room 214"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-suds"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-suds"
              placeholder="At least 6 characters"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-suds px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-suds-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/65">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-suds">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
