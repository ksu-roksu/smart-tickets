'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useUser, SignOutButton } from '@clerk/nextjs';
import {
  Moon, Sun, Search, Ticket, User, Home,
  MapPin, ChevronDown, Heart, Bell, LogOut,
  Globe, ChevronRight, Locate,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'RU' | 'KZ' | 'EN';

const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Актау', 'Атырау', 'Актобе', 'Павлодар'];

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Алматы':   { lat: 43.238, lng: 76.945 },
  'Астана':   { lat: 51.180, lng: 71.446 },
  'Шымкент':  { lat: 42.317, lng: 69.595 },
  'Актау':    { lat: 43.652, lng: 51.198 },
  'Атырау':   { lat: 47.117, lng: 51.921 },
  'Актобе':   { lat: 50.300, lng: 57.153 },
  'Павлодар': { lat: 52.285, lng: 76.940 },
};

const LANG_LABELS: Record<Lang, string> = { RU: 'RU', KZ: 'ҚАЗ', EN: 'EN' };

const t: Record<Lang, Record<string, string>> = {
  RU: {
    search_placeholder: 'Концерт, театр, спорт...',
    my_tickets: 'Мои билеты',
    cabinet: 'Личный кабинет',
    favorites: 'Избранное',
    notifications: 'Уведомления',
    logout: 'Выйти',
    home: 'Главная',
    search: 'Поиск',
    profile: 'Профиль',
    signin: 'Войти',
  },
  KZ: {
    search_placeholder: 'Концерт, театр, спорт...',
    my_tickets: 'Менің билеттерім',
    cabinet: 'Жеке кабинет',
    favorites: 'Таңдаулылар',
    notifications: 'Хабарландырулар',
    logout: 'Шығу',
    home: 'Басты',
    search: 'Іздеу',
    profile: 'Профиль',
    signin: 'Кіру',
  },
  EN: {
    search_placeholder: 'Concert, theatre, sport...',
    my_tickets: 'My Tickets',
    cabinet: 'My Account',
    favorites: 'Favorites',
    notifications: 'Notifications',
    logout: 'Sign Out',
    home: 'Home',
    search: 'Search',
    profile: 'Profile',
    signin: 'Sign In',
  },
};

// ─── Geo helpers ──────────────────────────────────────────────────────────────

function distKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCity(lat: number, lng: number): string {
  let best = 'Алматы';
  let bestDist = Infinity;
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const d = distKm(lat, lng, coords.lat, coords.lng);
    if (d < bestDist) { bestDist = d; best = city; }
  }
  // Дальше 300 км — VPN, возвращаем Алматы
  return bestDist < 300 ? best : 'Алматы';
}

// ─── City Dropdown ────────────────────────────────────────────────────────────

function CityDropdown({ city, setCity }: { city: string; setCity: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const detectCity = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setCity(detected);
        setGeoLoading(false);
        setOpen(false);
      },
      () => setGeoLoading(false),
      { timeout: 5000 }
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/7 hover:bg-white/12 border border-white/10 rounded-full px-3 py-1.5 text-sm text-white/90 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
        {city}
        <ChevronDown size={12} className="opacity-50" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl py-1.5 z-50 shadow-2xl">
          <button
            onClick={detectCity}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/7 transition-colors"
          >
            <Locate size={13} className={`text-orange-400 ${geoLoading ? 'animate-pulse' : ''}`} />
            {geoLoading ? 'Определяем...' : 'Моё местоположение'}
          </button>
          <div className="h-px bg-white/8 mx-3 my-1" />
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCity(c); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between
                ${c === city ? 'text-orange-400 bg-orange-500/10' : 'text-white/70 hover:text-white hover:bg-white/7'}`}
            >
              {c}
              {c === city && <ChevronRight size={12} className="opacity-60" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lang Selector ────────────────────────────────────────────────────────────

function LangSelector({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-[34px] px-3 bg-white/7 hover:bg-white/12 border border-white/10 rounded-lg text-xs font-semibold text-white/70 transition-colors"
      >
        <Globe size={13} className="opacity-60" />
        {LANG_LABELS[lang]}
        <ChevronDown size={11} className="opacity-40" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-28 bg-[#1a1a1a] border border-white/10 rounded-xl py-1 z-50 shadow-2xl">
          {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors
                ${l === lang ? 'text-orange-400 font-semibold' : 'text-white/60 hover:text-white hover:bg-white/7'}`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileDropdown({ lang, ticketCount }: { lang: Lang; ticketCount: number }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.firstName?.[0]?.toUpperCase() ?? 'А';
  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Профиль';
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-sm font-bold text-white border-2 border-orange-500/40 transition-transform hover:scale-105"
        aria-label="Профиль"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl p-1.5 z-50 shadow-2xl">
          <div className="px-3 py-2.5 border-b border-white/8 mb-1">
            <p className="text-sm font-semibold text-white">{fullName}</p>
            {email && <p className="text-xs text-white/40 mt-0.5">{email}</p>}
          </div>

          <Link href="/account" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/7 transition-colors">
            <User size={15} className="opacity-50" />
            {t[lang].cabinet}
          </Link>

          <Link href="/tickets" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/7 transition-colors">
            <Ticket size={15} className="opacity-50" />
            {t[lang].my_tickets}
            {ticketCount > 0 && (
              <span className="ml-auto bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full font-bold">
                {ticketCount}
              </span>
            )}
          </Link>

          <Link href="/favorites" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/7 transition-colors">
            <Heart size={15} className="opacity-50" />
            {t[lang].favorites}
          </Link>

          <Link href="/notifications" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/7 transition-colors">
            <Bell size={15} className="opacity-50" />
            {t[lang].notifications}
          </Link>

          <div className="border-t border-white/8 mt-1 pt-1">
            <SignOutButton>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-colors">
                <LogOut size={15} className="opacity-60" />
                {t[lang].logout}
              </button>
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile Tab Bar ───────────────────────────────────────────────────────────

function MobileTabBar({ lang, ticketCount }: { lang: Lang; ticketCount: number }) {
  const pathname = usePathname();

  const tabs = [
    { href: '/',        icon: Home,   label: t[lang].home,       match: (p: string) => p === '/' },
    { href: '/events',  icon: Search, label: t[lang].search,     match: (p: string) => p.startsWith('/events') },
    { href: '/tickets', icon: Ticket, label: t[lang].my_tickets, match: (p: string) => p.startsWith('/tickets'), badge: ticketCount },
    { href: '/account', icon: User,   label: t[lang].profile,    match: (p: string) => p.startsWith('/account') },
  ];

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden">
      <div className="bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-[22px] h-[60px] flex items-center px-2 shadow-2xl">
        {tabs.map(({ href, icon: Icon, label, match, badge }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-[3px] h-11 rounded-xl transition-colors relative
                ${active ? 'bg-orange-500/15' : 'hover:bg-white/5'}`}
            >
              <Icon
                size={20}
                className={active ? 'text-orange-400' : 'text-white/30'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[9px] font-medium leading-none ${active ? 'text-orange-400' : 'text-white/30'}`}>
                {label}
              </span>
              {badge != null && badge > 0 && (
                <span className="absolute top-1 right-[18%] w-[14px] h-[14px] bg-orange-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center border-[1.5px] border-[#141414]">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { isSignedIn, user } = useUser(); // ← user деструктурирован здесь, не внутри JSX

  const [city, setCity] = useState('Алматы');
  const [lang, setLang] = useState<Lang>('RU');
  const [ticketCount, setTicketCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Restore saved prefs
  useEffect(() => {
    setMounted(true);
    const savedCity = localStorage.getItem('st_city');
    const savedLang = localStorage.getItem('st_lang') as Lang | null;
    if (savedCity) setCity(savedCity);
    if (savedLang) setLang(savedLang);
  }, []);

  // Auto-detect city on first visit (silent fail for VPN)
  useEffect(() => {
    if (!mounted) return;
    if (localStorage.getItem('st_city')) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setCity(detected);
        localStorage.setItem('st_city', detected);
      },
      () => {},
      { timeout: 4000 }
    );
  }, [mounted]);

  useEffect(() => { if (mounted) localStorage.setItem('st_city', city); }, [city, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem('st_lang', lang); }, [lang, mounted]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/tickets/count')
      .then(r => r.json())
      .then(d => setTicketCount(d.count ?? 0))
      .catch(() => {});
  }, [isSignedIn]);

  const isDark = resolvedTheme === 'dark';
  const userInitial = (user?.firstName?.[0] ?? 'А').toUpperCase();

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <header className="sticky top-0 z-40 hidden md:flex items-center gap-3 px-5 h-14 bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/6">
        <Link href="/" className="flex items-center font-extrabold text-[17px] tracking-tight text-white mr-2 flex-shrink-0">
          Smart<span className="text-orange-500">Tickets</span>
        </Link>

        <CityDropdown city={city} setCity={setCity} />

        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            type="search"
            placeholder={t[lang].search_placeholder}
            className="w-full h-9 bg-white/6 border border-white/9 rounded-xl pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40 transition-colors"
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-[34px] h-[34px] rounded-full bg-white/7 hover:bg-white/12 border border-white/10 flex items-center justify-center text-white/60 transition-colors"
              aria-label="Сменить тему"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}

          <LangSelector lang={lang} setLang={setLang} />

          {isSignedIn && (
            <Link
              href="/tickets"
              className="relative flex items-center gap-1.5 h-[34px] px-3 bg-orange-500/15 hover:bg-orange-500/22 border border-orange-500/30 rounded-lg text-sm font-semibold text-orange-400 transition-colors"
            >
              <Ticket size={15} />
              {t[lang].my_tickets}
              {ticketCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-[#0d0d0d]">
                  {ticketCount > 9 ? '9+' : ticketCount}
                </span>
              )}
            </Link>
          )}

          {isSignedIn ? (
            <ProfileDropdown lang={lang} ticketCount={ticketCount} />
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 h-[34px] px-4 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold text-white transition-colors"
            >
              <User size={14} />
              {t[lang].signin}
            </Link>
          )}
        </div>
      </header>

      {/* ── MOBILE TOP BAR ── */}
      <header className="sticky top-0 z-40 flex md:hidden items-center gap-2 px-4 h-12 bg-[#111]/95 backdrop-blur-xl border-b border-white/6">
        <Link href="/" className="font-extrabold text-[15px] tracking-tight text-white flex-shrink-0">
          Smart<span className="text-orange-500">Tickets</span>
        </Link>

        <CityDropdown city={city} setCity={setCity} />

        <div className="flex-1" />

        {mounted && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-8 h-8 rounded-full bg-white/7 border border-white/10 flex items-center justify-center text-white/60"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}

        <button
          onClick={() => {
            const langs: Lang[] = ['RU', 'KZ', 'EN'];
            setLang(langs[(langs.indexOf(lang) + 1) % langs.length]);
          }}
          className="h-8 px-2.5 bg-white/7 border border-white/10 rounded-lg text-xs font-bold text-white/60"
        >
          {lang}
        </button>

        {/* Аватар — используем userInitial, вычисленный выше, без вызова хука в JSX */}
        {isSignedIn ? (
          <Link
            href="/account"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white border-2 border-orange-500/40"
          >
            {userInitial}
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center"
          >
            <User size={14} className="text-white/60" />
          </Link>
        )}
      </header>

      {/* ── MOBILE TAB BAR ── */}
      <MobileTabBar lang={lang} ticketCount={ticketCount} />

      <div className="md:hidden h-[72px]" aria-hidden="true" />
    </>
  );
}