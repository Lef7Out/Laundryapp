import { SERVICE_LINES } from "@/lib/config";
import type { LineId, OrderItemLine, OrderState } from "@/types";

const price = (id: LineId) =>

    SERVICE_LINES.find((l) => l.id === id)?.price ?? 0;

export function emptyOrder(): OrderState {
    const state = {} as OrderState;
    SERVICE_LINES.forEach((l) => {
        state[l.id] = 0;
    });
    return state;
}

/** Turns the cart into the lines saved to Supabase, shown in the summary and sent on WhatsApp. */
export function buildItemLines(order: OrderState): OrderItemLine[] {
    const lines: OrderItemLine[] = [];
    const white = order.everydayWhite;
    const coloured = order.everydayColoured;
    const everyday = white + coloured;

    if (everyday > 0) {
        lines.push({
        id: "everyday",
        label: "Everyday clothes",
        detail: [white > 0 ? `${white} white` : null, coloured > 0 ? `${coloured} coloured` : null]
            .filter(Boolean)
            .join(" · "),
        subtotal: everyday * price("everydayWhite"),
        });
    }
    if (order.ironing > 0) {
        lines.push({
        id: "ironing",
        label: "Ironing (everyday clothes)",
        detail: `${order.ironing} ${order.ironing === 1 ? "piece" : "pieces"}`,
        subtotal: order.ironing * price("ironing"),
        });
    }

    const plain: LineId[] = [
        "towel",
        "bedsheet",
        "duvetThick",
        "duvetLight",
        "shoes",
        "suitWashIron",
        "suitIronOnly",
    ];
    plain.forEach((id) => {
        const qty = order[id];
        if (qty <= 0) return;
        lines.push({
        id,
        label: SERVICE_LINES.find((l) => l.id === id)?.label ?? id,
        detail: `× ${qty}`,
        subtotal: qty * price(id),
        });
    });
    return lines;
    }