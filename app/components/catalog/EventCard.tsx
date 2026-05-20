'use client';

// app/components/catalog/EventCard.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Eye, Zap, Clock, Wind } from 'lucide-react';
import {
  EventItem,
  getEventBadge,
  getEventImage,
  minPrice,
  seatsLeft,
  fmtDate,
  fmtTime,
  daysUntil,
  GRADIENTS,
} from '@/app/lib/event-utils';
import { OUTDOOR_CATEGORIES } from '@/app/lib/category-config';

// ─── Weather ──────────────────────────────────────────────────────────────────

type WeatherData = {
  temp: number;
  condition: string;
  icon: string;
  windSpeed: number;
  isGoodOutdoor: boolean;
};

const weatherCache = new Map<string, WeatherData>();

function useWeather(city: string, enabled: boolean) {
  const [w, setW] = useState<WeatherData | null>(weatherCache.get(city) ?? null);

  useEffect(() => {
    if (!enabled) return;
    if (weatherCache.has(city)) {
      setW(weatherCache.get(city)!);
      return;
    }

    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((d: WeatherData) => {
        weatherCache.set(city, d);
        setW(d);
      })
      .catch(() => {});
  }, [city, enabled]);

  return w;
}

export function WeatherBadge({ city, category }: { city: string; category?: string }) {
  const outdoor = OUTDOOR_CATEGORIES.has(category ?? '');
  const w = useWeather(city, outdoor);

  if (!outdoor || !w) return null;

  return (
    <span className="flex items-center gap-1 bg-black/50 border border-white/15 text-white/65 text-[9px] px-2 py-0.5 rounded-full">
      <span>{w.icon}</span>
      <span>{w.temp}°</span>
      {w.windSpeed > 5 && (
        <span className="flex items-center gap-0.5 text-white/40">
          <Wind size={8} />
          {w.windSpeed}
        </span>
      )}
    </span>
  );
}

// ─── Live ─────────────────────────────────────────────────────────────────────

function isLiveNow(date: string | Date): boolean {
  const s = new Date(date).getTime();
  const n = Date.now();
  return n >= s && n <= s + 3 * 60 * 60 * 1000;
}

export function LiveBadge({ date }: { date: string | Date }) {
  if (!isLiveNow(date)) return null;

  return (
    <span className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
      LIVE
    </span>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function EventBg({
  event,
  idx,
  className = '',
}: {
  event: EventItem;
  idx: number;
  className?: string;
}) {
  const img = getEventImage(event);
  const [err, setErr] = useState(false);

  if (img && !err) {
    return (
      <>
        <img
          src={img}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${className}`}
          onError={() => setErr(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      </>
    );
  }

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
}

function WishlistBtn({ eventId }: { eventId: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      aria-label={saved ? 'Убрать' : 'Сохранить'}
      onClick={(e) => {
        e.preventDefault();
        setSaved((s) => !s);
      }}
      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all
        ${
          saved
            ? 'bg-orange-500/30 border-orange-500/60 text-orange-400'
            : 'bg-black/40 border-white/15 text-white/50 hover:text-white hover:border-white/30'
        }`}
    >
      <Heart size={13} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}

function ViewersBadge({ seed }: { seed: number }) {
  return (
    <span className="flex items-center gap-1 bg-black/50 border border-white/15 text-white/55 text-[9px] px-2 py-0.5 rounded-full">
      <Eye size={9} /> {12 + (seed % 40)}
    </span>
  );
}

function Price({ price }: { price: number | null }) {
  if (price === null) return <span className="text-white/30 text-[11px]">Уточняется</span>;
  if (price === 0) return <span className="text-green-400 text-[12px] font-semibold">Бесплатно</span>;

  return (
    <span className="text-white/80 text-[12px] font-semibold">
      от {price.toLocaleString('ru-RU')} ₸
    </span>
  );
}

// ─── GridCard ─────────────────────────────────────────────────────────────────

export function GridCard({ event, idx }: { event: EventItem; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const left = seatsLeft(event.ticketTypes);
  const badge = getEventBadge(event);
  const days = daysUntil(event.date);
  const live = isLiveNow(event.date);

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-end group cursor-pointer"
      style={{ minHeight: '220px', background: '#0f1923' }}
    >
      <EventBg event={event} idx={idx} />

      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
        <div className="flex flex-col gap-1">
          {live ? (
            <LiveBadge date={event.date} />
          ) : (
            badge && (
              <span className={`${badge.color} text-white text-[9px] font-bold px-2 py-0.5 rounded-full w-fit`}>
                {badge.label}
              </span>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <WeatherBadge city={event.venue.city} category={event.category ?? undefined} />
          <ViewersBadge seed={idx * 7 + 3} />
          <WishlistBtn eventId={event.id} />
        </div>
      </div>

      <div className="relative z-10 p-3.5">
        <p className="text-white/35 text-[9px] uppercase tracking-widest mb-0.5">
          {event.venue.city}
          {days >= 0 && days <= 1 && (
            <span className="ml-1.5 text-yellow-400">· Сегодня {fmtTime(event.date)}</span>
          )}
        </p>

        <h3 className="text-[14px] font-bold text-white leading-tight mb-1.5 line-clamp-2">
          {event.title}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <Price price={price} />
            <p className="text-white/30 text-[9px] mt-0.5">{fmtDate(event.date)}</p>
          </div>

          {left > 0 && left <= 30 && (
            <span className="flex items-center gap-0.5 text-orange-400 text-[9px]">
              <Zap size={9} /> {left} мест
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── SideCard ─────────────────────────────────────────────────────────────────

export function SideCard({ event, idx }: { event: EventItem; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const badge = getEventBadge(event);
  const live = isLiveNow(event.date);

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-end group flex-1"
      style={{ minHeight: '130px', background: '#0f1923' }}
    >
      <EventBg event={event} idx={idx} />

      <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
        {live ? (
          <LiveBadge date={event.date} />
        ) : badge ? (
          <span className={`${badge.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full`}>
            {badge.label}
          </span>
        ) : (
          <span />
        )}
        <WishlistBtn eventId={event.id} />
      </div>

      <div className="relative z-10 p-3">
        <p className="text-white/40 text-[9px] mb-0.5">{event.venue.city}</p>
        <p className="text-[13px] font-bold text-white leading-tight line-clamp-1">{event.title}</p>

        <div className="flex items-center justify-between mt-1">
          <p className="text-white/35 text-[10px]">{fmtDate(event.date)}</p>
          {price !== null && price > 0 ? (
            <p className="text-white/65 text-[11px]">{price.toLocaleString('ru-RU')} ₸</p>
          ) : price === 0 ? (
            <p className="text-green-400 text-[11px]">Бесплатно</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

// ─── HeroCard ─────────────────────────────────────────────────────────────────

export function HeroCard({ event }: { event: EventItem }) {
  const price = minPrice(event.ticketTypes);
  const left = seatsLeft(event.ticketTypes);
  const badge = getEventBadge(event);
  const days = daysUntil(event.date);
  const urgent = days >= 0 && days <= 5;
  const live = isLiveNow(event.date);

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative rounded-[20px] overflow-hidden flex flex-col justify-end group"
      style={{ minHeight: '280px', background: '#0f1923' }}
    >
      <EventBg event={event} idx={0} />

      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between z-10">
        <div className="flex flex-col gap-1.5">
          {live ? (
            <LiveBadge date={event.date} />
          ) : (
            <>
              {badge && (
                <span className={`${badge.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-fit`}>
                  {badge.label}
                </span>
              )}
              {urgent && (
                <span className="flex items-center gap-1 bg-black/60 border border-orange-500/40 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full w-fit">
                  <Clock size={8} /> осталось {days === 0 ? 'сегодня' : `${days} дн`}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <WeatherBadge city={event.venue.city} category={event.category ?? undefined} />
          <ViewersBadge seed={11} />
          <WishlistBtn eventId={event.id} />
        </div>
      </div>

      <div className="relative z-10 p-5">
        <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">
          {event.venue.city} · {event.venue.name}
        </p>

        <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-[0.95] mb-3">
          {event.title}
        </h2>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          {price !== null && price > 0 ? (
            <span className="bg-white/10 text-white/80 text-sm px-3 py-1 rounded-full">
              от {price.toLocaleString('ru-RU')} ₸
            </span>
          ) : price === 0 ? (
            <span className="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full">
              Бесплатно
            </span>
          ) : null}

          <span className="text-white/40 text-sm">{fmtDate(event.date)}</span>

          {left > 0 && left <= 50 && (
            <span className="flex items-center gap-1 text-white/35 text-xs">
              <Zap size={10} className="text-yellow-400" /> Осталось {left} мест
            </span>
          )}
        </div>

        <span className="inline-block bg-white text-black text-[12px] font-bold px-5 py-2 rounded-full group-hover:bg-white/90 transition">
          Купить билет →
        </span>
      </div>
    </Link>
  );
}

// ─── CompactCard ──────────────────────────────────────────────────────────────

export function CompactCard({ event, idx }: { event: EventItem; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const left = seatsLeft(event.ticketTypes);
  const img = getEventImage(event);
  const live = isLiveNow(event.date);
  const [err, setErr] = useState(false);

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/3 border border-white/7 hover:border-white/15 hover:bg-white/5 transition group"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative" style={{ background: '#1a1a2e' }}>
        {img && !err ? (
          <img src={img} alt="" className="w-full h-full object-cover" onError={() => setErr(true)} />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {live && <LiveBadge date={event.date} />}
          <p className="text-sm font-semibold text-white truncate">{event.title}</p>
        </div>
        <p className="text-xs text-white/35">
          {fmtDate(event.date)} · {event.venue.city}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <Price price={price} />
        {left > 0 && left <= 20 && <p className="text-[10px] text-orange-400 mt-0.5">осталось {left}</p>}
      </div>
    </Link>
  );
}

// ─── RailCard ─────────────────────────────────────────────────────────────────

export function RailCard({ event, idx }: { event: EventItem; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const badge = getEventBadge(event);
  const live = isLiveNow(event.date);

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative rounded-2xl overflow-hidden flex-shrink-0 group"
      style={{ width: '160px', height: '140px', background: '#0f1923' }}
    >
      <EventBg event={event} idx={idx} />

      <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
        {live ? (
          <LiveBadge date={event.date} />
        ) : badge ? (
          <div className={`${badge.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full`}>
            {badge.label}
          </div>
        ) : (
          <span />
        )}

        <WishlistBtn eventId={event.id} />
      </div>

      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
        <p className="text-white/40 text-[9px] mb-0.5">{event.venue.city}</p>
        <p className="text-white text-[12px] font-bold leading-tight line-clamp-2">{event.title}</p>

        <div className="flex items-center justify-between mt-1">
          <p className="text-white/35 text-[9px]">{fmtDate(event.date)}</p>
          {price !== null && price > 0 ? (
            <p className="text-white/60 text-[9px]">{price.toLocaleString('ru-RU')} ₸</p>
          ) : price === 0 ? (
            <p className="text-green-400 text-[9px]">Бесплатно</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

// ─── TheatreListCard ──────────────────────────────────────────────────────────

export function TheatreListCard({ event, rank }: { event: EventItem; rank: number }) {
  const price = minPrice(event.ticketTypes);
  const left = seatsLeft(event.ticketTypes);
  const days = daysUntil(event.date);

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-3 px-4 py-3.5 bg-white/3 border border-white/7 rounded-2xl hover:border-white/15 hover:bg-white/5 transition group"
    >
      <div className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-[10px] text-white/40 flex-shrink-0 font-semibold">
        {rank}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white truncate">{event.title}</p>
        <p className="text-[10px] text-white/35 mt-0.5">
          {event.venue.name} · {fmtDate(event.date)}
          {days === 0 && <span className="ml-1 text-yellow-400">· Сегодня</span>}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <Price price={price} />
        {left > 0 && left <= 50 ? (
          <p className="text-[9px] text-orange-400 mt-0.5">Осталось {left}</p>
        ) : (
          <p className="text-[9px] text-green-400/70 mt-0.5">Есть места</p>
        )}
      </div>
    </Link>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────

export function MatchCard({ event }: { event: EventItem }) {
  const price = minPrice(event.ticketTypes);
  const left = seatsLeft(event.ticketTypes);
  const live = isLiveNow(event.date);
  const days = daysUntil(event.date);
  const parts = event.title.split(/\s+[—\-–]\s+|\s+vs\s+/i);
  const isMatch = parts.length === 2;

  return (
    <Link
      href={`/events/${event.id}`}
      className="bg-white/3 border border-white/7 rounded-2xl p-4 hover:border-white/15 hover:bg-white/5 transition group"
    >
      {isMatch ? (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
              {parts[0].trim().slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[13px] font-semibold text-white">{parts[0].trim()}</span>
          </div>

          {live ? <LiveBadge date={event.date} /> : <span className="text-[10px] font-bold text-white/40">vs</span>}

          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
              {parts[1].trim().slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[13px] font-semibold text-white">{parts[1].trim()}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-white">{event.title}</p>
          {live && <LiveBadge date={event.date} />}
        </div>
      )}

      <div className="flex items-center justify-between pt-2.5 border-t border-white/7">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[10px] text-white/40">
            {days === 0 ? `Сегодня ${fmtTime(event.date)}` : `${fmtDate(event.date)} · ${fmtTime(event.date)}`}
          </p>
          <p className="text-[10px] text-white/25">· {event.venue.name}</p>
          <WeatherBadge city={event.venue.city} category={event.category ?? undefined} />
        </div>

        <div className="flex items-center gap-2">
          {left > 0 && left <= 100 && <span className="text-[9px] text-orange-400">Осталось {left}</span>}
          <Price price={price} />
        </div>
      </div>
    </Link>
  );
}

// ─── KidsCard ─────────────────────────────────────────────────────────────────

export function KidsCard({ event }: { event: EventItem }) {
  const price = minPrice(event.ticketTypes);
  const left = seatsLeft(event.ticketTypes);

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex gap-3 bg-white/3 border border-white/7 rounded-2xl p-3 hover:border-white/15 hover:bg-white/5 transition group"
    >
      <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center text-xl flex-shrink-0">
        🧸
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white truncate">{event.title}</p>
        <p className="text-[10px] text-white/35 mt-0.5">
          {fmtDate(event.date)} · {event.venue.name}
        </p>

        <div className="flex gap-1 mt-1">
          <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">6+</span>
          <span className="text-[9px] bg-white/7 text-white/35 px-1.5 py-0.5 rounded">90 мин</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <Price price={price} />
        {left > 0 && left <= 120 && <p className="text-[9px] text-orange-400 mt-1">Осталось {left}</p>}
      </div>
    </Link>
  );
}

// ─── ExhibitionCard ───────────────────────────────────────────────────────────

export function ExhibitionCard({ event, idx }: { event: EventItem; idx: number }) {
  const price = minPrice(event.ticketTypes);

  return (
    <Link
      href={`/events/${event.id}`}
      className="rounded-2xl overflow-hidden bg-white/3 border border-white/7 hover:border-white/15 transition group"
    >
      <div className="relative h-[130px] overflow-hidden">
        <EventBg event={event} idx={idx} />
      </div>

      <div className="p-3">
        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Выставка</p>
        <p className="text-[13px] font-semibold text-white truncate">{event.title}</p>
        <p className="text-[10px] text-white/35 mt-0.5">
          {fmtDate(event.date)} · {event.venue.city}
        </p>

        <div className="mt-1">
          {price === 0 ? (
            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Бесплатно</span>
          ) : (
            <Price price={price} />
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── StandupCard ──────────────────────────────────────────────────────────────

export function StandupCard({ event, idx }: { event: EventItem; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const badge = getEventBadge(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-end group"
      style={{ minHeight: '180px', background: '#2d0d0d' }}
    >
      <EventBg event={event} idx={idx} />

      <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
        {badge ? (
          <span className={`${badge.color} text-white text-[9px] font-bold px-2 py-0.5 rounded-full`}>
            {badge.label}
          </span>
        ) : (
          <span />
        )}
        <WishlistBtn eventId={event.id} />
      </div>

      <div className="relative z-10 p-3">
        <p className="text-white/35 text-[9px]">18+ · {event.venue.city}</p>
        <p className="text-[13px] font-bold text-white leading-tight line-clamp-2">{event.title}</p>

        <div className="flex items-center justify-between mt-1">
          <p className="text-white/35 text-[10px]">{fmtDate(event.date)}</p>
          <Price price={price} />
        </div>
      </div>
    </Link>
  );
}