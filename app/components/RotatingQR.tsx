"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function RotatingQR({ ticketId }: { ticketId: string }) {
  const [token, setToken] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  async function fetchToken() {
    try {
      const res = await fetch(`/api/tickets/token?ticketId=${ticketId}`);
      const data = await res.json();
      setToken(data.token);
      setExpiresIn(data.expiresIn);
    } catch {
      console.error("Failed to fetch token");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchToken();

    // Обновляем токен каждые 30 секунд
    const interval = setInterval(fetchToken, 30000);
    return () => clearInterval(interval);
  }, [ticketId]);

  useEffect(() => {
    // Таймер обратного отсчёта
    const timer = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          fetchToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-48 h-48 bg-white/5 rounded-xl flex items-center justify-center">
        <p className="text-white/40 text-sm">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-3 rounded-2xl">
        <QRCode
          value={token || ticketId}
          size={180}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      {/* Таймер */}
      <div className="flex items-center gap-2">
        <div className="w-full bg-white/10 rounded-full h-1 w-32">
          <div
            className="bg-white h-1 rounded-full transition-all duration-1000"
            style={{ width: `${(expiresIn / 30) * 100}%` }}
          />
        </div>
        <span className="text-xs text-white/40 tabular-nums">{expiresIn}с</span>
      </div>

      <p className="text-xs text-white/30 text-center">
        QR-код обновляется автоматически
      </p>
    </div>
  );
}