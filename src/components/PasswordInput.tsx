"use client";

import { useState } from "react";

interface PasswordInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete: "current-password" | "new-password";
    placeholder?: string;
}

export default function PasswordInput({
    id,
    label,
    value,
    onChange,
    autoComplete,
    placeholder,
    }: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
        <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-ink"
        >
            {label}
        </label>
        <div className="relative">
            <input
            id={id}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-line bg-white py-3 pl-4 pr-16 text-sm text-ink outline-none transition focus:border-suds"
            />
            <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-suds"
            >
            {visible ? "Hide" : "Show"}
            </button>
        </div>
        </div>
    );
}