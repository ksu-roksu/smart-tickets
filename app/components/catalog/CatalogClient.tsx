'use client';

// app/components/catalog/CatalogClient.tsx
// Весь клиентский UI каталога — поиск, фильтры, сортировка, секционный фид

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, X, SlidersHorizontal, TrendingUp, Zap,
  ChevronRight, Clock, Sparkles,
} from 'lucide-react';

import {
  EventItem, SortType,
  CATEGORIES, daysUntil, seatsLeft, sortEvents,
} from '@/app/lib/event-utils';

import { FilterState, DEFAULT_FILTERS } from '@/app/components/catalog/FilterSheet';
import { GridCard, HeroCard, CompactCard, RailCard } from '@/app/components/catalog/EventCard';
import { FilterContent, FilterSheet } from '@/app/components/catalog/FilterSheet';

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilters(
  events: EventItem[],
  filters: FilterState,
  query: string,
): EventItem[] {
  return events.filter((e) => {
    // Search
    if (query) {
      const q = query.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.venue.city.toLowerCase().includes(q) ||
        e.venue.name.toLowerCase().includes(q) ||
        (e.description ?? '').toLowerCase().includes(q) ||
        (e.category ?? '').toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (filters.category && e.category !== filters.category) return false;

    // City
    if (filters.city && e.venue.city !== filters.city) return false;

    // Date range
    const days = daysUntil(e.date);
    if (days < 0) return false; // skip past events
    if (filters.dateRange === 'today' && days > 0) return false;
    if (filters.dateRange === 'tomorrow' && !(days >= 1 && days <= 1)) return false;
    if (filters.dateRange === 'weekend') {
      const dow = new Date(e.date).getDay();
      if (dow !== 0 && dow !== 6) return false;
    }
    if (filters.dateRange === 'month' && days > 31) return false;

    // Price
    const prices = e.ticketTypes.map((t) => Number(t.price)).filter(Boolean);
    if (filters.freeOnly && prices.some((p) => p > 0)) return false;
    if (filters.priceMax !== null) {
      const minP = prices.length ? Math.min(...prices) : Infinity;
      if (minP > filters.priceMax) return false;
    }

    // Available only
    if (filters.availableOnly && seatsLeft(e.ticketTypes) === 0) return false;

    return true;
  });
}

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS: { label: string; value: SortType }[] = [
  { label: 'Популярное', value: 'trending' },
  { label: 'Скоро',      value: 'date' },
  { label: 'Дешевле',    value: 'price_asc' },
  { label: 'Дороже',     value: 'price_desc' },
  { label: 'Новые',      value: 'new' },
];

// ─── Section builder ──────────────────────────────────────────────────────────

function buildSections(events: EventItem[]) {
  const now = Date.now();
  const today = events.filter((e) => daysUntil(e.date) === 0);
  const weekend = events.filter((e) => {
    const dow = new Date(e.date).getDay();
    return (dow === 0 || dow === 6) && daysUntil(e.date) > 0;
  });
  const urgency = events.filter((e) => {
    const left = seatsLeft(e.ticketTypes);
    return left > 0 && left <= 20;
  });
  const upcoming = events.filter(
    (e) => daysUntil(e.date) > 7 && daysUntil(e.date) <= 60
  );

  return { today, weekend, urgency, upcoming };
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="text-5xl mb-4">🎭</div>
      <h3 className="text-lg font-bold text-white mb-2">
        {query ? `По запросу «${query}» ничего не найдено` : 'Нет событий'}
      </h3>
      <p className="text-sm text-white/35 mb-6">
        Попробуйте изменить фильтры или поискать другое событие
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2.5 rounded-xl bg-white/8 border border-white/15 text-sm text-white/70
          hover:text-white hover:border-white/30 transition"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}

// ─── CatalogClient ────────────────────────────────────────────────────────────

type Props = {
  initialEvents: EventItem[];
  initialQuery?: string;
  initialCity?: string;
  initialCategory?: string;
};

export default function CatalogClient({
  initialEvents,
  initialQuery = '',
  initialCity = '',
  initialCategory = '',
}: Props) {
  const router = useRouter();

  // ── State ──
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortType>('trending');
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    city: initialCity,
    category: initialCategory,
  });

  // ── Derived ──
  const filtered = useMemo(
    () => applyFilters(initialEvents, filters, query),
    [initialEvents, filters, query]
  );
  const sorted = useMemo(() => sortEvents(filtered, sort), [filtered, sort]);

  const sections = useMemo(() => buildSections(sorted), [sorted]);

  const heroEvent = sorted[0] ?? null;
  const gridEvents = sorted.slice(1);

  // Urgency events (across ALL events, not just filtered)
  const urgencyEvents = useMemo(
    () => initialEvents
      .filter((e) => seatsLeft(e.ticketTypes) > 0 && seatsLeft(e.ticketTypes) <= 20)
      .slice(0, 5),
    [initialEvents]
  );

  const handleReset = useCallback(() => {
    setQuery('');
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
    },
    []
  );

  const activeFilterCount = [
    filters.category !== '',
    filters.city !== '',
    filters.dateRange !== 'all',
    filters.priceMax !== null,
    filters.freeOnly,
  ].filter(Boolean).length;

  // ── Render ──
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden pb-24 md:pb-0">

      {/* ══════════════ DESKTOP ══════════════ */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-16">

          {/* City header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">
                События {filters.city ? `в ${filters.city}` : 'в Казахстане'}
              </h1>
              <p className="text-sm text-white/30 mt-0.5">
                {sorted.length} {sorted.length === 1 ? 'событие' : 'событий'}
                {query && ` · по запросу «${query}»`}
              </p>
            </div>
          </div>

          {/* Sticky search bar */}
          <div className="sticky top-14 z-30 mb-6 -mx-2 px-2 py-2
            bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
            <div className="flex gap-3 items-center">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск событий, артистов, площадок..."
                  className="w-full h-10 bg-white/6 border border-white/10 rounded-xl pl-10 pr-9
                    text-sm text-white placeholder:text-white/25
                    focus:outline-none focus:border-white/25 transition"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>

              {/* Sort */}
              <div className="flex gap-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition
                      ${sort === opt.value
                        ? 'bg-white/12 text-white border border-white/20'
                        : 'text-white/35 hover:text-white/60 border border-transparent'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category chips */}
            <div className="flex gap-1.5 mt-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFilters((f) => ({ ...f, category: cat.value }))}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition
                    ${filters.category === cat.value
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/40 border border-white/8 hover:bg-white/10'}`}
                >
                  {cat.label}
                </button>
              ))}
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1 rounded-full text-xs text-red-400/70 border border-red-500/20
                    hover:text-red-400 hover:border-red-500/40 transition"
                >
                  Сбросить ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

          {/* Main layout: sidebar + feed */}
          <div className="flex gap-6">

            {/* Sidebar */}
            <aside className="w-[220px] flex-shrink-0">
              <div className="sticky top-[140px] bg-white/[0.02] border border-white/7 rounded-2xl p-4">
                <FilterContent
                  filters={filters}
                  onChange={setFilters}
                  resultCount={sorted.length}
                />
              </div>
            </aside>

            {/* Feed */}
            <div className="flex-1 min-w-0">
              {sorted.length === 0 ? (
                <EmptyState query={query} onReset={handleReset} />
              ) : (
                <>
                  {/* Hero */}
                  {heroEvent && (
                    <div className="mb-5">
                      <SectionLabel icon={<Sparkles size={13} className="text-yellow-400" />} label="Главное событие" />
                      <div className="grid grid-cols-2 gap-4">
                        <HeroCard event={heroEvent} />
                        {/* Side cards */}
                        <div className="flex flex-col gap-4">
                          {gridEvents.slice(0, 2).map((e, i) => (
                            <GridCard key={e.id} event={e} idx={i + 1} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Urgency section */}
                  {urgencyEvents.length > 0 && (
                    <div className="mb-5">
                      <SectionLabel
                        icon={<Zap size={13} className="text-orange-400" />}
                        label="Скоро заканчиваются"
                      />
                      <div className="flex flex-col gap-2">
                        {urgencyEvents.map((e, i) => (
                          <CompactCard key={e.id} event={e} idx={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main grid */}
                  {gridEvents.slice(2).length > 0 && (
                    <div className="mb-5">
                      <SectionLabel
                        icon={<TrendingUp size={13} className="text-orange-400" />}
                        label="Все события"
                      />
                      <div className="grid grid-cols-3 gap-4">
                        {gridEvents.slice(2).map((e, i) => (
                          <GridCard key={e.id} event={e} idx={i + 3} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weekend section */}
                  {sections.weekend.length > 0 && !filters.dateRange && (
                    <div className="mb-5">
                      <SectionLabel
                        icon={<Clock size={13} className="text-blue-400" />}
                        label="На выходных"
                      />
                      <div className="grid grid-cols-3 gap-4">
                        {sections.weekend.slice(0, 3).map((e, i) => (
                          <GridCard key={e.id} event={e} idx={i + 10} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MOBILE ══════════════ */}
      <div className="md:hidden">

        {/* Search + filter row */}
        <div className="px-3.5 pt-3 pb-2">
          <form onSubmit={handleSearch} className="flex gap-2 mb-2.5">
            <div className="flex-1 flex items-center gap-2 bg-white/7 border border-white/10
              rounded-xl px-3 py-2.5 focus-within:border-white/25 transition">
              <Search size={14} className="text-white/25 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Концерт, театр, спорт..."
                className="bg-transparent text-white placeholder-white/25 outline-none flex-1 text-[13px]"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-white/25">
                  <X size={13} />
                </button>
              )}
            </div>
            <FilterSheet filters={filters} onChange={setFilters} resultCount={sorted.length} />
          </form>

          {/* City header */}
          <div className="flex items-center justify-between">
            <h1 className="text-[13px] font-bold text-white/70">
              {filters.city ? `${filters.city}` : 'Все города'}
              <span className="text-white/25 font-normal ml-1.5">· {sorted.length} событий</span>
            </h1>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilters((f) => ({ ...f, category: cat.value }))}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition
                ${filters.category === cat.value
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/45 border border-white/8'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort row */}
        <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-2.5 scrollbar-hide">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-semibold border transition
                ${sort === opt.value
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/8 text-white/30'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <EmptyState query={query} onReset={handleReset} />
        ) : (
          <>
            {/* Hero */}
            {heroEvent && (
              <div className="px-3.5 mb-3">
                <MobileSectionLabel label="Главное" />
                <HeroCard event={heroEvent} />
              </div>
            )}

            {/* Urgency rail */}
            {urgencyEvents.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between px-3.5 mb-2">
                  <MobileSectionLabel label="Скоро заканчиваются" />
                  <span className="text-[10px] text-orange-400/70">мало мест</span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto px-3.5 pb-1 scrollbar-hide">
                  {urgencyEvents.map((e, i) => (
                    <RailCard key={e.id} event={e} idx={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Popular rail */}
            {gridEvents.slice(0, 5).length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between px-3.5 mb-2">
                  <MobileSectionLabel label="Популярно" />
                  <span className="text-[10px] text-white/25 flex items-center gap-0.5">
                    Все <ChevronRight size={10} />
                  </span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto px-3.5 pb-1 scrollbar-hide">
                  {gridEvents.slice(0, 6).map((e, i) => (
                    <RailCard key={e.id} event={e} idx={i + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Full grid */}
            {gridEvents.length > 0 && (
              <div className="px-3.5 mb-4">
                <MobileSectionLabel label="Все события" />
                <div className="grid grid-cols-2 gap-2.5">
                  {gridEvents.map((e, i) => (
                    <GridCard key={e.id} event={e} idx={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ─── Section label helpers ────────────────────────────────────────────────────

function SectionLabel({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/6" />
    </div>
  );
}

function MobileSectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">
      {label}
    </p>
  );
}