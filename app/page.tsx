'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Clock, Eye, Zap, ChevronRight, MapPin,
  Flame, TrendingUp, Star, Sparkles, ShieldCheck,
  MessageCircle, Send, Phone, Building2,
  FileText, Lock, RefreshCw, ArrowUpRight, Ticket,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketType = { price: number | string; totalSeats: number; soldSeats: number };
type Event = {
  id: string;
  title: string;
  date: string | Date;
  venue: { city: string; name: string };
  ticketTypes: TicketType[];
  category?: string;
  imageUrl?: string | null;
};
type Stats = { totalSold: number; concert: number; theatre: number; sport: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const minPrice = (tt: TicketType[]) =>
  tt.length ? Math.min(...tt.map(t => Number(t.price))) : null;
const seatsLeft = (tt: TicketType[]) =>
  tt.reduce((a, t) => a + (t.totalSeats - t.soldSeats), 0);
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
const daysUntil = (d: string | Date) =>
  Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

// ─── Image system ─────────────────────────────────────────────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  concert:    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=75',
  theatre:    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=75',
  sport:      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=75',
  standup:    'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=75',
  exhibition: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=75',
  default:    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=75',
};

const GRADIENTS = [
  'from-[#2d1b69] to-[#11998e]',
  'from-[#c94b4b] to-[#4b134f]',
  'from-[#134e5e] to-[#71b280]',
  'from-[#373b44] to-[#4286f4]',
  'from-[#1a1a2e] to-[#e96c6c]',
  'from-[#2c3e50] to-[#fd746c]',
];

function getEventImage(event: Event): string | null {
  if (event.imageUrl && event.imageUrl.startsWith('http')) return event.imageUrl;
  return CATEGORY_IMAGES[event.category ?? ''] ?? CATEGORY_IMAGES.default;
}

// EventBg — renders image if available, gradient fallback
function EventBg({ event, idx, className = '' }: { event: Event; idx: number; className?: string }) {
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
      </>
    );
  }
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
}

// ─── Badge logic ──────────────────────────────────────────────────────────────

function getEventBadge(event: Event): { label: string; color: string } | null {
  const days = daysUntil(event.date);
  const left = seatsLeft(event.ticketTypes);
  const total = event.ticketTypes.reduce((a, t) => a + t.totalSeats, 0);
  const soldPct = total > 0 ? (total - left) / total : 0;

  if (left > 0 && left <= 10) return { label: `Осталось ${left}`, color: 'bg-red-500' };
  if (soldPct >= 0.8)         return { label: '🔥 Хит продаж', color: 'bg-[#FF4D00]' };
  if (days >= 0 && days <= 3) return { label: '⚡ Скоро', color: 'bg-yellow-500' };
  if (days >= 0 && days <= 7) return { label: '🕐 Заканчивается', color: 'bg-orange-600' };
  return null;
}

// ─── Mood & Category data ─────────────────────────────────────────────────────

const MOODS = [
  { emoji: '🔥', label: 'Зажечь',   value: 'energetic' },
  { emoji: '😌', label: 'Спокойно', value: 'calm' },
  { emoji: '👨‍👩‍👧', label: 'Семья',    value: 'family' },
  { emoji: '💫', label: 'Свидание', value: 'date' },
  { emoji: '🎉', label: 'Праздник', value: 'party' },
  { emoji: '🎭', label: 'Культура', value: 'culture' },
];

const CATEGORIES = [
  { label: 'Все',      value: '' },
  { label: 'Концерты', value: 'concert' },
  { label: 'Театр',    value: 'theatre' },
  { label: 'Спорт',    value: 'sport' },
  { label: 'Стендап',  value: 'standup' },
];

// ─── Countdown ────────────────────────────────────────────────────────────────

function Countdown({ date }: { date: string | Date }) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    const tick = () => setMs(Math.max(0, new Date(date).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (d > 0) return <span>{d}д {String(h).padStart(2, '0')}ч</span>;
  return <span>{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>;
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({ event }: { event: Event }) {
  const price  = minPrice(event.ticketTypes);
  const left   = seatsLeft(event.ticketTypes);
  const days   = daysUntil(event.date);
  const urgent = days >= 0 && days <= 5;
  const badge  = getEventBadge(event);
  const [viewers] = useState(() => 14 + Math.floor(Math.random() * 35));

  return (
    <Link href={`/events/${event.id}`}
      className="relative rounded-[20px] overflow-hidden flex flex-col justify-end group"
      style={{ minHeight: '200px', background: '#0f1923' }}>
      <EventBg event={event} idx={0} />

      {/* Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
        {badge ? (
          <span className={`${badge.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-full`}>
            {badge.label}
          </span>
        ) : <span />}
        <span className="flex items-center gap-1 bg-black/50 border border-white/15 text-white/65 text-[10px] px-2 py-1 rounded-full">
          <Eye size={9} /> {viewers} смотрят
        </span>
      </div>

      {urgent && (
        <div className="absolute top-10 left-3 z-10">
          <span className="flex items-center gap-1 bg-black/60 border border-orange-500/40 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
            <Clock size={8} /><Countdown date={event.date} />
          </span>
        </div>
      )}

      <div className="relative z-10 p-3.5">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
          {event.venue.city} · {fmtDate(event.date)}
        </p>
        <h2 className="text-[18px] font-black text-white leading-tight tracking-tight mb-2">
          {event.title}
        </h2>
        <div className="flex items-center gap-2 mb-2.5">
          {price && (
            <span className="bg-white/12 text-white/80 text-[11px] px-2.5 py-1 rounded-full">
              {price.toLocaleString('ru-RU')} ₸
            </span>
          )}
          {left > 0 && (
            <span className="flex items-center gap-1 text-white/40 text-[10px]">
              <Zap size={9} className="text-yellow-400" />Осталось {left} мест
            </span>
          )}
        </div>
        <span className="inline-block bg-white text-black text-[12px] font-bold px-4 py-1.5 rounded-full group-hover:bg-white/90 transition">
          Купить билет →
        </span>
      </div>
    </Link>
  );
}

// ─── Small Scroll Card ────────────────────────────────────────────────────────

function SmallCard({ event, idx }: { event: Event; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const badge = getEventBadge(event);

  return (
    <Link href={`/events/${event.id}`}
      className="relative rounded-2xl overflow-hidden flex-shrink-0 group"
      style={{ width: '150px', height: '130px', background: '#0f1923' }}>
      <EventBg event={event} idx={idx} />
      {badge && (
        <div className={`absolute top-2 left-2 ${badge.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10`}>
          {badge.label}
        </div>
      )}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
        <p className="text-white/40 text-[9px] mb-0.5">{event.venue.city}</p>
        <p className="text-white text-[12px] font-bold leading-tight">{event.title}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-white/35 text-[9px]">{fmtDate(event.date)}</p>
          {price && <p className="text-white/60 text-[9px]">{price.toLocaleString('ru-RU')} ₸</p>}
        </div>
      </div>
    </Link>
  );
}

// ─── Desktop Side Card ────────────────────────────────────────────────────────

function DesktopSideCard({ event, idx }: { event: Event; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const badge = getEventBadge(event);

  return (
    <Link href={`/events/${event.id}`}
      className="relative rounded-[16px] overflow-hidden flex flex-col justify-end flex-1 group"
      style={{ minHeight: '140px', background: '#0f1923' }}>
      <EventBg event={event} idx={idx} />
      {badge && (
        <div className={`absolute top-2.5 left-2.5 ${badge.color} text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10`}>
          {badge.label}
        </div>
      )}
      <div className="relative z-10 p-3">
        <p className="text-white/40 text-[9px] mb-0.5">{event.venue.city}</p>
        <p className="text-[14px] font-bold text-white leading-tight">{event.title}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-white/35 text-[10px]">{fmtDate(event.date)}</p>
          {price && <p className="text-white/65 text-[11px]">{price.toLocaleString('ru-RU')} ₸</p>}
        </div>
      </div>
    </Link>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────

function RecoCard({ event, idx }: { event: Event; idx: number }) {
  const price = minPrice(event.ticketTypes);
  const badge = getEventBadge(event);

  return (
    <Link href={`/events/${event.id}`}
      className="relative rounded-2xl overflow-hidden flex-shrink-0 group"
      style={{ width: '200px', height: '160px', background: '#0f1923' }}>
      <EventBg event={event} idx={idx + 2} />
      {badge && (
        <div className={`absolute top-2.5 left-2.5 ${badge.color} text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10`}>
          {badge.label}
        </div>
      )}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">{event.venue.city}</p>
        <p className="text-[13px] font-bold text-white leading-tight mb-1.5">{event.title}</p>
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-[10px]">{fmtDate(event.date)}</p>
          {price && (
            <span className="bg-white/15 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {price.toLocaleString('ru-RU')} ₸
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Popular Now ──────────────────────────────────────────────────────────────

function PopularNow({ events }: { events: Event[] }) {
  const top = events.slice(0, 3);
  if (!top.length) return null;
  return (
    <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-white/8"
      style={{ background: 'linear-gradient(135deg,rgba(255,77,0,.06),rgba(139,92,246,.06))' }}>
      <div className="px-4 py-3.5 border-b border-white/6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-sm font-bold text-white/90">Популярно сейчас</span>
        <span className="ml-auto text-xs text-white/30">за 24 часа</span>
      </div>
      {top.map((event, i) => {
        const price = minPrice(event.ticketTypes);
        const left  = seatsLeft(event.ticketTypes);
        return (
          <Link key={event.id} href={`/events/${event.id}`}
            className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/4 transition group">
            {/* Mini thumbnail */}
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative"
              style={{ background: '#1a1a2e' }}>
              {getEventImage(event) && (
                <img src={getEventImage(event)!} alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-white/20 font-black text-sm bg-black/30">
                {i + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{event.title}</p>
              <p className="text-xs text-white/35 mt-0.5">{fmtDate(event.date)} · {event.venue.city}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {price && <p className="text-xs font-semibold text-white/70">{price.toLocaleString('ru-RU')} ₸</p>}
              {left > 0 && left <= 30 && <p className="text-[10px] text-orange-400 mt-0.5">осталось {left}</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Why Us ───────────────────────────────────────────────────────────────────

function WhyUs() {
  const items = [
    { icon: ShieldCheck, color: 'text-green-400',  title: 'Безопасная оплата',    desc: 'Kaspi Pay и карты — всё защищено' },
    { icon: Ticket,      color: 'text-orange-400', title: 'Мгновенный QR-билет',  desc: 'На телефон сразу после оплаты' },
    { icon: RefreshCw,   color: 'text-blue-400',   title: 'Возврат до 48 часов',  desc: 'Без вопросов при отмене события' },
    { icon: Star,        color: 'text-yellow-400', title: '50 000+ билетов',       desc: 'Продано за последние 12 месяцев' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(({ icon: Icon, color, title, desc }) => (
        <div key={title} className="rounded-2xl bg-white/3 border border-white/7 p-4 flex flex-col gap-2">
          <Icon size={20} className={color} />
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/6 mt-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center font-extrabold text-xl tracking-tight text-white mb-3">
              Smart<span className="text-orange-500">Tickets</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-4">
              Билетная платформа Казахстана. Концерты, театр, спорт и многое другое.
            </p>
            <div className="flex gap-2">
              {[
                { href: 'https://instagram.com/smarttickets.kz', icon: '📸' },
                { href: 'https://t.me/smarttickets_kz', icon: <Send size={15} /> },
                { href: 'https://wa.me/77771234567', icon: <MessageCircle size={15} /> },
                { href: 'tel:+77771234567', icon: <Phone size={15} /> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/12 transition">
                  {typeof s.icon === 'string' ? <span className="text-sm">{s.icon}</span> : s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Покупателям */}
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Покупателям</p>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Все события',    href: '/events' },
                { label: 'Мои билеты',     href: '/tickets' },
                { label: 'Как купить',     href: '/help/how-to-buy' },
                { label: 'Возврат',        href: '/help/refund' },
                { label: 'Помощь',         href: '/help' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm text-white/50 hover:text-white transition">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Компания */}
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Компания</p>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'О нас',     href: '/about' },
                { label: 'Контакты', href: '/contact' },
                { label: 'Новости',  href: '/news' },
                { label: 'Карьера',  href: '/careers' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm text-white/50 hover:text-white transition">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Организаторам */}
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Организаторам</p>
            <div className="flex flex-col gap-2.5 mb-4">
              {[
                { label: 'Разместить событие',   href: '/organizer' },
                { label: 'Кабинет организатора', href: '/dashboard' },
                { label: 'Тарифы',               href: '/pricing' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm text-white/50 hover:text-white transition">{l.label}</Link>
              ))}
            </div>
            <Link href="/organizer"
              className="flex items-center gap-2 bg-orange-500/12 border border-orange-500/25 text-orange-400 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-500/20 transition">
              <Building2 size={15} />Вы организатор?
              <ArrowUpRight size={13} className="ml-auto" />
            </Link>
          </div>
        </div>

        {/* Cities */}
        <div className="border-t border-white/6 pt-6 mb-6">
          <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Города присутствия</p>
          <div className="flex flex-wrap gap-2">
            {['Алматы','Астана','Шымкент','Актау','Атырау','Актобе','Павлодар','Тараз'].map(city => (
              <Link key={city} href={`/events?city=${city}`}
                className="flex items-center gap-1.5 bg-white/4 border border-white/8 hover:border-white/18 rounded-full px-3 py-1 text-xs text-white/45 hover:text-white/75 transition">
                <MapPin size={10} className="text-orange-500/60" />{city}
              </Link>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-white/6 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-white/25">© 2026 Smart Kazakhstan. Все права защищены.</p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Публичная оферта',      href: '/legal/offer',   icon: FileText },
              { label: 'Конфиденциальность',     href: '/legal/privacy', icon: Lock },
              { label: 'Условия возврата',       href: '/legal/refund',  icon: RefreshCw },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/65 transition">
                <Icon size={11} />{label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({ totalSold: 0, concert: 0, theatre: 0, sport: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/home-data')
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setStats(d.stats ?? {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/events?q=${encodeURIComponent(query.trim())}` : '/events');
  };

  const filtered    = activeCategory ? events.filter(e => e.category === activeCategory) : events;
  const heroEvent   = filtered[0];
  const sideEvents  = filtered.slice(1, 3);
  const gridEvents  = filtered.slice(3, 6);
  const recoEvents  = events.slice(0, 6);

  return (
    <>
      <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden pb-24 md:pb-0">

        {/* ══════════════ MOBILE ══════════════ */}
        <div className="md:hidden">

          {/* Search */}
          <form onSubmit={handleSearch} className="mx-3.5 mt-2.5 mb-2.5">
            <div className="flex items-center gap-2 bg-white/7 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-white/25 transition">
              <Search size={14} className="text-white/25 flex-shrink-0" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Найди концерт, театр, спорт..."
                className="bg-transparent text-white placeholder-white/25 outline-none flex-1 text-[13px]" />
            </div>
          </form>

          {/* Hero */}
          {loading
            ? <div className="mx-3.5 mb-3 rounded-[20px] bg-white/5 animate-pulse" style={{ height: '200px' }} />
            : heroEvent && <div className="mx-3.5 mb-3"><HeroCard event={heroEvent} /></div>
          }

          {/* Mood icons */}
          <p className="text-[10px] text-white/25 uppercase tracking-widest mx-3.5 mb-2">Настроение</p>
          <div className="flex gap-3 overflow-x-auto pb-1 px-3.5 scrollbar-hide mb-3">
            {MOODS.map(mood => (
              <Link key={mood.value} href={`/events?mood=${mood.value}`}
                className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-white/7 border border-white/10 flex items-center justify-center text-xl active:scale-95 transition">
                  {mood.emoji}
                </div>
                <span className="text-[9px] text-white/40 whitespace-nowrap">{mood.label}</span>
              </Link>
            ))}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-1 scrollbar-hide mb-3">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition
                  ${activeCategory === cat.value ? 'bg-white text-black' : 'bg-white/5 text-white/45 border border-white/8'}`}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cards horizontal scroll */}
          <p className="text-[10px] text-white/25 uppercase tracking-widest mx-3.5 mb-2">Ближайшие</p>
          <div className="flex gap-2.5 overflow-x-auto px-3.5 pb-1 scrollbar-hide mb-4">
            {loading
              ? [0,1,2].map(i => <div key={i} className="flex-shrink-0 rounded-2xl bg-white/5 animate-pulse" style={{ width:'150px', height:'130px' }} />)
              : filtered.slice(0, 6).map((e, i) => <SmallCard key={e.id} event={e} idx={i} />)
            }
          </div>

          {/* Popular Now */}
          <div className="mx-3.5 mb-4"><PopularNow events={events} /></div>

          {/* Recommendations */}
          {recoEvents.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mx-3.5 mb-2.5">
                <span className="flex items-center gap-1.5 text-sm font-bold text-white/90">
                  <Sparkles size={14} className="text-yellow-400" />Может понравиться
                </span>
                <Link href="/events" className="text-[10px] text-white/35 flex items-center gap-0.5">Все <ChevronRight size={10} /></Link>
              </div>
              <div className="flex gap-2.5 overflow-x-auto px-3.5 pb-1 scrollbar-hide">
                {recoEvents.map((e, i) => <RecoCard key={e.id} event={e} idx={i} />)}
              </div>
            </div>
          )}

          {/* Why Us */}
          <div className="px-3.5 mb-4">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Почему Smart Tickets</p>
            <WhyUs />
          </div>
        </div>

        {/* ══════════════ DESKTOP ══════════════ */}
        <div className="hidden md:block">
          <section className="px-6 lg:px-8 pt-12 pb-8 max-w-7xl mx-auto">

            {/* Live badge */}
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-[#FF4D00] rounded-full animate-pulse" />
                <span className="text-sm text-[#FF4D00] font-semibold">
                  {stats.totalSold.toLocaleString('ru-RU')} билетов куплено сегодня
                </span>
              </div>
              <span className="text-sm text-white/25">
                +{Math.max(1, Math.floor((stats.totalSold||0)*0.03))} за последний час
              </span>
            </div>

            {/* Title + search */}
            <div className="mb-8">
              <h1 className="text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
                Лучшие события<br /><span className="text-white/18">Казахстана</span>
              </h1>
              <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
                <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus-within:border-white/25 transition">
                  <Search size={17} className="text-white/25 flex-shrink-0" />
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Поиск концерта, артиста, места..."
                    className="bg-transparent text-white placeholder-white/20 outline-none flex-1 text-sm" />
                  {query && <button type="button" onClick={() => setQuery('')} className="text-white/25 hover:text-white/60 text-xl">&times;</button>}
                </div>
                <button type="submit"
                  className="bg-[#FF4D00] hover:bg-[#e64400] text-white px-8 py-3.5 rounded-2xl font-semibold text-sm transition">
                  Найти →
                </button>
              </form>
            </div>

            {/* Mood pills */}
            <div className="flex gap-2 flex-wrap mb-5">
              {MOODS.map(mood => (
                <Link key={mood.value} href={`/events?mood=${mood.value}`}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/8 rounded-full px-4 py-2 text-sm text-white/60 hover:text-white/90 transition">
                  <span>{mood.emoji}</span><span>{mood.label}</span>
                </Link>
              ))}
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mb-6">
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition
                    ${activeCategory === cat.value ? 'bg-white text-black' : 'bg-white/5 text-white/45 hover:bg-white/10 border border-white/8'}`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Bento grid */}
            {loading ? (
              <div className="grid grid-cols-3 gap-4 mb-4 animate-pulse">
                <div className="col-span-2 rounded-3xl bg-white/4" style={{ minHeight:'300px' }} />
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl bg-white/4 flex-1" />
                  <div className="rounded-2xl bg-white/4 flex-1" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-4">

                {/* Desktop Hero */}
                {heroEvent && (
                  <Link href={`/events/${heroEvent.id}`}
                    className="col-span-2 relative rounded-3xl overflow-hidden group flex flex-col justify-end"
                    style={{ minHeight:'300px', background:'#0f1923' }}>
                    <EventBg event={heroEvent} idx={0} />
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                      {(() => { const b = getEventBadge(heroEvent); return b
                        ? <span className={`${b.color} text-white text-[11px] font-bold px-3 py-1.5 rounded-full`}>{b.label}</span>
                        : <span />; })()}
                      <span className="flex items-center gap-1.5 bg-black/50 border border-white/15 text-white/60 text-[10px] px-2.5 py-1.5 rounded-full">
                        <Eye size={10} /> {14 + Math.floor(Math.random()*35)} смотрят
                      </span>
                    </div>
                    <div className="relative z-10 p-6 lg:p-7">
                      <p className="text-white/35 text-xs uppercase tracking-widest mb-2">
                        {heroEvent.venue.city} · {fmtDate(heroEvent.date)}
                      </p>
                      <h2 className="text-3xl xl:text-4xl font-black tracking-tighter leading-[0.95] mb-3">
                        {heroEvent.title}
                      </h2>
                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        <span className="text-white/50 text-sm">{heroEvent.venue.name}</span>
                        {minPrice(heroEvent.ticketTypes) && (
                          <span className="bg-white/10 text-white/80 text-sm px-3 py-1 rounded-full">
                            от {minPrice(heroEvent.ticketTypes)!.toLocaleString('ru-RU')} ₸
                          </span>
                        )}
                        {seatsLeft(heroEvent.ticketTypes) > 0 && (
                          <span className="flex items-center gap-1 text-white/35 text-xs">
                            <Zap size={10} className="text-yellow-400" />
                            Осталось {seatsLeft(heroEvent.ticketTypes)} мест
                          </span>
                        )}
                      </div>
                      <span className="inline-block bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full group-hover:bg-white/90 transition">
                        Купить билет →
                      </span>
                    </div>
                  </Link>
                )}

                {/* Side cards */}
                <div className="flex flex-col gap-4">
                  {sideEvents.map((e, i) => <DesktopSideCard key={e.id} event={e} idx={i} />)}
                </div>

                {/* Popular Now */}
                <div className="col-span-1">
                  <PopularNow events={events} />
                </div>

                {/* Grid events */}
                {gridEvents.map(event => (
                  <Link key={event.id} href={`/events/${event.id}`}
                    className="rounded-3xl bg-white/4 border border-white/8 hover:border-white/18 p-5 flex flex-col justify-between group transition"
                    style={{ minHeight:'130px' }}>
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <MapPin size={10} className="text-white/25" />
                        <p className="text-white/25 text-[10px] uppercase tracking-wider">{event.venue.city}</p>
                      </div>
                      <h3 className="font-bold text-base leading-snug mb-1 group-hover:text-white/80 transition">{event.title}</h3>
                      <p className="text-white/35 text-xs">{event.venue.name}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-sm font-semibold text-white/80">
                          {minPrice(event.ticketTypes)
                            ? `от ${minPrice(event.ticketTypes)!.toLocaleString('ru-RU')} ₸`
                            : 'Уточняется'}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">{fmtDate(event.date)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/6 border border-white/10 group-hover:bg-white/12 flex items-center justify-center transition">
                        <ChevronRight size={14} className="text-white/40 group-hover:text-white/70 transition" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {recoEvents.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                    <Sparkles size={18} className="text-yellow-400" />Может понравиться
                  </h2>
                  <Link href="/events" className="flex items-center gap-1 text-sm text-white/35 hover:text-white/70 transition">
                    Все события <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                  {recoEvents.map((e, i) => <RecoCard key={e.id} event={e} idx={i} />)}
                </div>
              </div>
            )}

            {/* Trending */}
            {events.length > 0 && (
              <div className="mb-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <TrendingUp size={18} className="text-orange-400" />Этим летом в Казахстане
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {events.slice(0, 3).map((event, i) => (
                    <Link key={event.id} href={`/events/${event.id}`}
                      className="flex items-center gap-3 bg-white/3 border border-white/7 hover:border-white/15 rounded-2xl p-3.5 group transition">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative" style={{ background:'#1a1a2e' }}>
                        {getEventImage(event) && (
                          <img src={getEventImage(event)!} alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-white/80 transition">{event.title}</p>
                        <p className="text-xs text-white/35 mt-0.5">{fmtDate(event.date)}</p>
                        {minPrice(event.ticketTypes) && (
                          <p className="text-xs text-orange-400 mt-0.5 font-medium">
                            от {minPrice(event.ticketTypes)!.toLocaleString('ru-RU')} ₸
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Why Us */}
            <div className="mb-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                <Star size={18} className="text-yellow-400" />Почему Smart Tickets
              </h2>
              <WhyUs />
            </div>

          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}