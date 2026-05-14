'use client';

// app/components/catalog/EventCard.tsx
// Универсальная карточка события — три варианта: 'grid' | 'hero' | 'compact'

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, Zap, Clock } from 'lucide-react';
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

// ─── EventBg ──────────────────────────────────────────────────────────────────

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
  const [imgError, setImgError] = useState(false);

  if (img && !imgError) {
    return (
      <>
        <img
          src={img}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${className}`}
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      </>
    );
  }
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
}

// ─── Wishlist button ──────────────────────────────────────────────────────────

function WishlistBtn({ eventId }: { eventId: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      aria-label={saved ? 'Убрать из избранного' : 'Добавить в избранное'}
      onClick={(e) => {
        e.preventDefault();
        setSaved((s) => !s);
        // TODO: persist to /api/favorites
      }}
      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all
        ${saved
          ? 'bg-orange-500/30 border-orange-500/60 text-orange-400'
          : 'bg-black/40 border-white/15 text-white/50 hover:text-white hover:border-white/30'
        }`}
    >
      <Heart size={13} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}

// ─── Viewer badge ─────────────────────────────────────────────────────────────

function ViewersBadge({ seed }: { seed: number }) {
  // stable pseudo-random per event
  const count = 12 + (seed % 40);
  return (
    <span className="flex items-center gap-1 bg-black/50 border border-white/15 text-white/55 text-[9px] px-2 py-0.5 rounded-full">
      <Eye size={9} /> {count}
    </span>
  );
}

// ─── GridCard (default — 2-col adaptive grid) ────────────────────────────────

export function GridCard({
  event,
  idx,
  priority = false,
}: {
  event: EventItem;
  idx: number;
  priority?: boolean;
}) {
  const price = minPrice(event.ticketTypes);
  const left  = seatsLeft(event.ticketTypes);
  const badge = getEventBadge(event);
  const days  = daysUntil(event.date);

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-end group cursor-pointer"
      style={{ minHeight: '220px', background: '#0f1923' }}
    >
      <EventBg event={event} idx={idx} />

      {/* Top row */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
        {badge ? (
          <span
            className={`${badge.color} text-white text-[9px] font-bold px-2 py-0.5 rounded-full`}
          >
            {badge.label}
          </span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1.5">
          <ViewersBadge seed={idx * 7 + 3} />
          <WishlistBtn eventId={event.id} />
        </div>
      </div>

      {/* Body */}
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
            {price !== null ? (
              <span className="text-white/80 text-[12px] font-semibold">
                от {price.toLocaleString('ru-RU')} ₸
              </span>
            ) : (
              <span className="text-white/30 text-[11px]">Уточняется</span>
            )}
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

// ─── HeroCard (featured / первая карточка секции) ────────────────────────────

export function HeroCard({ event }: { event: EventItem }) {
  const price = minPrice(event.ticketTypes);
  const left  = seatsLeft(event.ticketTypes);
  const badge = getEventBadge(event);
  const days  = daysUntil(event.date);
  const urgent = days >= 0 && days <= 5;

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative rounded-[20px] overflow-hidden flex flex-col justify-end group col-span-2"
      style={{ minHeight: '280px', background: '#0f1923' }}
    >
      <EventBg event={event} idx={0} />

      {/* Top */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between z-10">
        <div className="flex flex-col gap-1.5">
          {badge && (
            <span
              className={`${badge.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-fit`}
            >
              {badge.label}
            </span>
          )}
          {urgent && (
            <span className="flex items-center gap-1 bg-black/60 border border-orange-500/40 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full w-fit">
              <Clock size={8} /> осталось {days === 0 ? 'сегодня' : `${days} дн`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <ViewersBadge seed={11} />
          <WishlistBtn eventId={event.id} />
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 p-5">
        <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">
          {event.venue.city} · {event.venue.name}
        </p>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-[0.95] mb-3">
          {event.title}
        </h2>
        <div className="flex items-center gap-3 flex-wrap mb-4">
          {price !== null && (
            <span className="bg-white/10 text-white/80 text-sm px-3 py-1 rounded-full">
              от {price.toLocaleString('ru-RU')} ₸
            </span>
          )}
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

// ─── CompactCard (горизонтальный список — urgency секция) ─────────────────────

export function CompactCard({ event, idx }: { event: EventItem; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const left  = seatsLeft(event.ticketTypes);
  const img   = getEventImage(event);
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/3 border border-white/7
        hover:border-white/15 hover:bg-white/5 transition group"
    >
      {/* Thumbnail */}
      <div
        className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative"
        style={{ background: '#1a1a2e' }}
      >
        {img && !imgError ? (
          <img
            src={img}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate group-hover:text-white/80 transition">
          {event.title}
        </p>
        <p className="text-xs text-white/35 mt-0.5">
          {fmtDate(event.date)} · {event.venue.city}
        </p>
      </div>

      {/* Right */}
      <div className="text-right flex-shrink-0">
        {price !== null && (
          <p className="text-xs font-semibold text-white/70">
            {price.toLocaleString('ru-RU')} ₸
          </p>
        )}
        {left > 0 && left <= 20 && (
          <p className="text-[10px] text-orange-400 mt-0.5">осталось {left}</p>
        )}
      </div>
    </Link>
  );
}

// ─── RailCard (горизонтальный скролл) ─────────────────────────────────────────

export function RailCard({ event, idx }: { event: EventItem; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const badge = getEventBadge(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative rounded-2xl overflow-hidden flex-shrink-0 group"
      style={{ width: '160px', height: '140px', background: '#0f1923' }}
    >
      <EventBg event={event} idx={idx} />
      {badge && (
        <div
          className={`absolute top-2 left-2 ${badge.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10`}
        >
          {badge.label}
        </div>
      )}
      <WishlistBtn eventId={event.id} />
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
        <p className="text-white/40 text-[9px] mb-0.5">{event.venue.city}</p>
        <p className="text-white text-[12px] font-bold leading-tight line-clamp-2">
          {event.title}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-white/35 text-[9px]">{fmtDate(event.date)}</p>
          {price !== null && (
            <p className="text-white/60 text-[9px]">{price.toLocaleString('ru-RU')} ₸</p>
          )}
        </div>
      </div>
    </Link>
  );
}