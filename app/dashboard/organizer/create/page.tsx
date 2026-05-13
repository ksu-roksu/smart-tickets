"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    doorsOpen: "",
    venueName: "",
    venueAddress: "",
    venueCity: "Алматы",
    imageUrl: "🎤",
  });
  const [ticketTypes, setTicketTypes] = useState([
    { name: "Партер", price: "", totalSeats: "" },
  ]);

  function updateTicket(index: number, field: string, value: string) {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  }

  function addTicketType() {
    setTicketTypes([...ticketTypes, { name: "", price: "", totalSeats: "" }]);
  }

  function removeTicketType(index: number) {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ticketTypes }),
      });
      if (res.ok) {
        router.push("/dashboard/organizer");
      } else {
        alert("Ошибка создания события");
      }
    } catch {
      alert("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Smart Tickets
        </Link>
        <Link href="/dashboard/organizer" className="text-sm text-white/60 hover:text-white transition">
          ← Назад
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold mb-10">Новое событие</h1>

        <div className="flex flex-col gap-6">
          {/* Основная информация */}
          <div>
            <label className="block text-sm text-white/40 mb-2">Название *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Например: Dimash Qudaibergen"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-sm text-white/40 mb-2">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Описание события..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/40 mb-2">Дата и время *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-sm text-white/40 mb-2">Открытие дверей</label>
              <input
                type="datetime-local"
                value={form.doorsOpen}
                onChange={(e) => setForm({ ...form, doorsOpen: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/40 mb-2">Эмодзи / иконка</label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="🎤"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Площадка */}
          <div className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-bold mb-4">Площадка</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-white/40 mb-2">Название площадки *</label>
                <input
                  type="text"
                  value={form.venueName}
                  onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                  placeholder="Алматы Арена"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/40 mb-2">Адрес</label>
                  <input
                    type="text"
                    value={form.venueAddress}
                    onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                    placeholder="пр. Абая, 1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/40 mb-2">Город</label>
                  <input
                    type="text"
                    value={form.venueCity}
                    onChange={(e) => setForm({ ...form, venueCity: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Типы билетов */}
          <div className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-bold mb-4">Категории билетов</h2>
            <div className="flex flex-col gap-3">
              {ticketTypes.map((ticket, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={(e) => updateTicket(index, "name", e.target.value)}
                    placeholder="Название (Партер)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                  />
                  <input
                    type="number"
                    value={ticket.price}
                    onChange={(e) => updateTicket(index, "price", e.target.value)}
                    placeholder="Цена ₸"
                    className="w-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                  />
                  <input
                    type="number"
                    value={ticket.totalSeats}
                    onChange={(e) => updateTicket(index, "totalSeats", e.target.value)}
                    placeholder="Кол-во"
                    className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                  />
                  {ticketTypes.length > 1 && (
                    <button
                      onClick={() => removeTicketType(index)}
                      className="text-white/20 hover:text-white/60 transition px-2 py-3"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addTicketType}
                className="text-sm text-white/40 hover:text-white transition text-left"
              >
                + Добавить категорию
              </button>
            </div>
          </div>

          {/* Кнопка */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-full font-medium hover:bg-white/90 transition disabled:opacity-50 mt-4"
          >
            {loading ? "Создание..." : "Создать событие"}
          </button>
        </div>
      </div>
    </main>
  );
}