"use client";

import { useState } from "react";

export default function BuyButton({ ticketTypeId }: { ticketTypeId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketTypeId, quantity: 1 }),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.url) window.location.href = data.url;
      else alert("Ошибка: " + text);
    } catch (e) {
      alert("Ошибка fetch: " + e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-white text-black text-xs px-3 py-1.5 rounded-full hover:bg-white/90 transition disabled:opacity-50"
    >
      {loading ? "..." : "Купить"}
    </button>
  );
}