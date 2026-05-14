'use client';

// app/components/catalog/CatalogClient.tsx

import { useState, useMemo, useCallback } from 'react';
import { Search, X, TrendingUp, Zap, ChevronRight, Clock, Sparkles } from 'lucide-react';
import {
  EventItem,
  SortType,
  daysUntil,
  seatsLeft,
  sortEvents,
  MOOD_TAGS,
  MOODS,
} from '@/app/lib/event-utils';
import { FilterState, DEFAULT_FILTERS } from '@/app/components/catalog/FilterSheet';
import { FilterContent, FilterSheet } from '@/app/components/catalog/FilterSheet';
import {
  GridCard,
  HeroCard,
  SideCard,
  CompactCard,
  RailCard,
  TheatreListCard,
  MatchCard,
  KidsCard,
  ExhibitionCard,
  StandupCard,
} from '@/app/components/catalog/EventCard';
import { getCategoryConfig, CATEGORY_CONFIG } from '@/app/lib/category-config';

function eventMatchesChip(e: EventItem, chipValue: string): boolean {
  if (!chipValue) return true;

  const chip = chipValue.toLowerCase();
  const tags = e.tags ?? [];

  const hasTag = tags.map((tag) => tag.toLowerCase()).includes(chip);

  const haystack = [
    e.title,
    e.description ?? '',
    e.category ?? '',
    e.venue.name,
    e.venue.city,
  ]
    .join(' ')
    .toLowerCase();

  return hasTag || haystack.includes(chip);
}

function hasEventsForChip(events: EventItem[], category: string, chipValue: string): boolean {
  if (!chipValue) return true;

  return events.some((e) => {
    if (category && e.category !== category) return false;
    return eventMatchesChip(e, chipValue);
  });
}

function eventMatchesMood(e: EventItem, moodValue: string): boolean {
  if (!moodValue) return true;

  const moodTags = MOOD_TAGS[moodValue] ?? [];
  const eventTags = e.tags ?? [];

  const hasMoodTag = eventTags.some((tag) => moodTags.includes(tag.toLowerCase()));
  const hasCategoryMatch = moodTags.includes((e.category ?? '').toLowerCase());

  return hasMoodTag || hasCategoryMatch;
}

function applyFilters(
  events: EventItem[],
  filters: FilterState,
  query: string,
  activeChip: string,
  activeMood: string,
): EventItem[] {
  return events.filter((e) => {
    if (query) {
      const q = query.toLowerCase();

      const searchable = [
        e.title,
        e.venue.city,
        e.venue.name,
        e.description ?? '',
        e.category ?? '',
      ];

      if (!searchable.some((s) => s.toLowerCase().includes(q))) return false;
    }

    if (filters.category && e.category !== filters.category) return false;
    if (filters.city && e.venue.city !== filters.city) return false;

    const days = daysUntil(e.date);
    if (days < 0) return false;

    if (filters.dateRange === 'today' && days > 0) return false;
    if (filters.dateRange === 'tomorrow' && days !== 1) return false;

    if (filters.dateRange === 'weekend') {
      const d = new Date(e.date).getDay();
      if (d !== 0 && d !== 6) return false;
    }

    if (filters.dateRange === 'month' && days > 31) return false;

    const prices = e.ticketTypes.map((t) => Number(t.price));

    if (filters.freeOnly && !prices.some((p) => p === 0)) return false;

    if (filters.priceMax !== null) {
      const minP = prices.length ? Math.min(...prices) : Infinity;
      if (minP > filters.priceMax) return false;
    }

    if (filters.availableOnly && seatsLeft(e.ticketTypes) === 0) return false;
    if (activeMood && !eventMatchesMood(e, activeMood)) return false;
    if (activeChip && !eventMatchesChip(e, activeChip)) return false;

    return true;
  });
}

const SORT_OPTIONS: { label: string; value: SortType }[] = [
  { label: 'Популярное', value: 'trending' },
  { label: 'Скоро', value: 'date' },
  { label: 'Дешевле', value: 'price_asc' },
  { label: 'Дороже', value: 'price_desc' },
  { label: 'Новые', value: 'new' },
];

function SL({ icon, label }: { icon?: React.ReactNode; label: string }) {
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

function ML({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">
      {label}
    </p>
  );
}

const AGE_OPTIONS = [
  { label: 'Любой', value: '' },
  { label: '0–3', value: '0' },
  { label: '3–6', value: '3' },
  { label: '6–12', value: '6' },
  { label: '12+', value: '12' },
];

function chipToAge(value: string): string {
  if (value === 'age0') return '0';
  if (value === 'age3') return '3';
  if (value === 'age6') return '6';
  if (value === 'age12') return '12';
  return '';
}

function ageToChip(value: string): string {
  if (value === '0') return 'age0';
  if (value === '3') return 'age3';
  if (value === '6') return 'age6';
  if (value === '12') return 'age12';
  return '';
}

function AgeFilter({
  value,
  onChange,
  events,
  category,
}: {
  value: string;
  onChange: (v: string) => void;
  events: EventItem[];
  category: string;
}) {
  const visibleOptions = AGE_OPTIONS.filter((opt) => {
    if (!opt.value) return true;
    return hasEventsForChip(events, category, ageToChip(opt.value));
  });

  if (visibleOptions.length <= 1) return null;

  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
        Возраст ребёнка
      </p>

      <div className="flex gap-1.5 flex-wrap">
        {visibleOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition ${
              value === opt.value
                ? 'bg-green-500/20 border-green-500/40 text-green-400'
                : 'bg-white/3 border-white/10 text-white/40 hover:bg-white/8'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Empty({
  query,
  category,
  onReset,
}: {
  query: string;
  category: string;
  onReset: () => void;
}) {
  const cfg = getCategoryConfig(category);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="text-5xl mb-4">{cfg.emptyIcon}</div>

      <h3 className="text-lg font-bold text-white mb-2">
        {query ? `По запросу «${query}» ничего не найдено` : cfg.emptyText}
      </h3>

      <p className="text-sm text-white/35 mb-6">Попробуйте изменить фильтры</p>

      <button
        type="button"
        onClick={onReset}
        className="px-6 py-2.5 rounded-xl bg-white/8 border border-white/15 text-sm text-white/70 hover:text-white hover:border-white/30 transition"
      >
        Сбросить
      </button>
    </div>
  );
}

function DesktopFeed({ events, category }: { events: EventItem[]; category: string }) {
  const cfg = getCategoryConfig(category);
  const hero = events[0];
  const rest = events.slice(1);

  const urgency = events
    .filter((e) => {
      const left = seatsLeft(e.ticketTypes);
      return left > 0 && left <= 20;
    })
    .slice(0, 5);

  if (cfg.cardLayout === 'matchcard') {
    return (
      <>
        {hero && (
          <div className="mb-5">
            <SL icon={<Zap size={13} className="text-blue-400" />} label="Топ событие" />
            <HeroCard event={hero} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="mb-5">
            <SL icon={<Clock size={13} className="text-white/40" />} label="Ближайшие матчи" />
            <div className="flex flex-col gap-3">
              {rest.map((e) => (
                <MatchCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  if (cfg.cardLayout === 'list') {
    return (
      <>
        {hero && (
          <div className="mb-5">
            <SL icon={<Sparkles size={13} className="text-amber-400" />} label="Рекомендуем" />
            <HeroCard event={hero} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="mb-5">
            <SL icon={<TrendingUp size={13} className="text-white/40" />} label="Репертуар" />
            <div className="flex flex-col gap-2">
              {rest.map((e, i) => (
                <TheatreListCard key={e.id} event={e} rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  if (cfg.cardLayout === 'kids') {
    return (
      <>
        {hero && (
          <div className="mb-5">
            <SL icon={<Sparkles size={13} className="text-green-400" />} label="Рекомендуем" />
            <HeroCard event={hero} />
          </div>
        )}

        <div className="mb-5">
          <SL label="Для детей" />
          <div className="flex flex-col gap-2">
            {rest.map((e) => (
              <KidsCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (cfg.cardLayout === 'gallery') {
    return (
      <>
        {hero && (
          <div className="mb-5">
            <SL icon={<Sparkles size={13} className="text-teal-400" />} label="Главная выставка" />
            <HeroCard event={hero} />
          </div>
        )}

        <div className="mb-5">
          <SL label="Открытые выставки" />
          <div className="grid grid-cols-3 gap-4">
            {rest.map((e, i) => (
              <ExhibitionCard key={e.id} event={e} idx={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (cfg.cardLayout === 'standup') {
    const tonight = events.filter((e) => daysUntil(e.date) === 0).slice(0, 3);

    return (
      <>
        {hero && (
          <div className="mb-5">
            <SL icon={<Sparkles size={13} className="text-red-400" />} label="Главное шоу" />
            <HeroCard event={hero} />
          </div>
        )}

        {tonight.length > 0 && (
          <div className="mb-5">
            <SL icon={<Zap size={13} className="text-red-400" />} label="Сегодня вечером" />
            <div className="flex flex-col gap-2">
              {tonight.map((e, i) => (
                <CompactCard key={e.id} event={e} idx={i} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {rest.map((e, i) => (
            <StandupCard key={e.id} event={e} idx={i} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {hero && (
        <div className="mb-5">
          <SL icon={<Sparkles size={13} className="text-yellow-400" />} label="Главное событие" />

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <HeroCard event={hero} />
            </div>

            <div className="flex flex-col gap-4">
              {rest.slice(0, 2).map((e, i) => (
                <SideCard key={e.id} event={e} idx={i + 1} />
              ))}
            </div>
          </div>
        </div>
      )}

      {urgency.length > 0 && (
        <div className="mb-5">
          <SL icon={<Zap size={13} className="text-orange-400" />} label="Скоро заканчиваются" />
          <div className="flex flex-col gap-2">
            {urgency.map((e, i) => (
              <CompactCard key={e.id} event={e} idx={i} />
            ))}
          </div>
        </div>
      )}

      {rest.slice(2).length > 0 && (
        <div className="mb-5">
          <SL icon={<TrendingUp size={13} className="text-orange-400" />} label="Все события" />
          <div className="grid grid-cols-3 gap-4">
            {rest.slice(2).map((e, i) => (
              <GridCard key={e.id} event={e} idx={i + 3} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function MobileFeed({ events, category }: { events: EventItem[]; category: string }) {
  const cfg = getCategoryConfig(category);
  const hero = events[0];
  const rest = events.slice(1);

  const urgency = events
    .filter((e) => {
      const left = seatsLeft(e.ticketTypes);
      return left > 0 && left <= 20;
    })
    .slice(0, 5);

  if (cfg.cardLayout === 'matchcard') {
    return (
      <div className="px-3.5">
        {hero && (
          <div className="mb-3">
            <ML label="Топ событие" />
            <HeroCard event={hero} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="mb-4">
            <ML label="Матчи" />
            <div className="flex flex-col gap-2">
              {rest.map((e) => (
                <MatchCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (cfg.cardLayout === 'list') {
    return (
      <div className="px-3.5">
        {hero && (
          <div className="mb-3">
            <ML label="Рекомендуем" />
            <HeroCard event={hero} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="mb-4">
            <ML label="Репертуар" />
            <div className="flex flex-col gap-2">
              {rest.map((e, i) => (
                <TheatreListCard key={e.id} event={e} rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (cfg.cardLayout === 'kids') {
    return (
      <div className="px-3.5">
        {hero && (
          <div className="mb-3">
            <ML label="Рекомендуем" />
            <HeroCard event={hero} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {rest.map((e) => (
            <KidsCard key={e.id} event={e} />
          ))}
        </div>
      </div>
    );
  }

  if (cfg.cardLayout === 'gallery') {
    return (
      <div className="px-3.5">
        {hero && (
          <div className="mb-3">
            <ML label="Главная выставка" />
            <HeroCard event={hero} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {rest.map((e, i) => (
            <ExhibitionCard key={e.id} event={e} idx={i} />
          ))}
        </div>
      </div>
    );
  }

  if (cfg.cardLayout === 'standup') {
    const tonight = events.filter((e) => daysUntil(e.date) === 0).slice(0, 3);

    return (
      <div className="px-3.5">
        {hero && (
          <div className="mb-3">
            <ML label="Главное шоу" />
            <HeroCard event={hero} />
          </div>
        )}

        {tonight.length > 0 && (
          <div className="mb-3">
            <ML label="Сегодня вечером" />
            <div className="flex flex-col gap-2">
              {tonight.map((e, i) => (
                <CompactCard key={e.id} event={e} idx={i} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {rest.map((e, i) => (
            <StandupCard key={e.id} event={e} idx={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {hero && (
        <div className="px-3.5 mb-3">
          <ML label="Главное" />
          <HeroCard event={hero} />
        </div>
      )}

      {urgency.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between px-3.5 mb-2">
            <ML label="Скоро заканчиваются" />
            <span className="text-[10px] text-orange-400/70">мало мест</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto px-3.5 pb-1 scrollbar-hide">
            {urgency.map((e, i) => (
              <RailCard key={e.id} event={e} idx={i} />
            ))}
          </div>
        </div>
      )}

      {rest.slice(0, 6).length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between px-3.5 mb-2">
            <ML label="Популярно" />
            <span className="text-[10px] text-white/25 flex items-center gap-0.5">
              Все <ChevronRight size={10} />
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto px-3.5 pb-1 scrollbar-hide">
            {rest.slice(0, 6).map((e, i) => (
              <RailCard key={e.id} event={e} idx={i + 1} />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="px-3.5 mb-4">
          <ML label="Все события" />
          <div className="grid grid-cols-2 gap-2.5">
            {rest.map((e, i) => (
              <GridCard key={e.id} event={e} idx={i + 1} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const ALL_TABS = [
  { value: '', label: 'Все' },
  ...Object.entries(CATEGORY_CONFIG)
    .filter(([k]) => k !== '')
    .map(([k, v]) => ({ value: k, label: v.label })),
];

export default function CatalogClient({
  initialEvents,
  initialQuery = '',
  initialCity = '',
  initialCategory = '',
  initialMood = '',
}: {
  initialEvents: EventItem[];
  initialQuery?: string;
  initialCity?: string;
  initialCategory?: string;
  initialMood?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortType>('trending');
  const [ageFilter, setAgeFilter] = useState('');
  const [activeChip, setActiveChip] = useState('');
  const [activeMood, setActiveMood] = useState(initialMood);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    city: initialCity,
    category: initialCategory,
  });

  const cfg = getCategoryConfig(filters.category);

  const filtered = useMemo(
    () => applyFilters(initialEvents, filters, query, activeChip, activeMood),
    [initialEvents, filters, query, activeChip, activeMood],
  );

  const sorted = useMemo(() => sortEvents(filtered, sort), [filtered, sort]);

  const handleReset = useCallback(() => {
    setQuery('');
    setFilters(DEFAULT_FILTERS);
    setAgeFilter('');
    setActiveChip('');
    setActiveMood('');
  }, []);

  const setCategory = useCallback((cat: string) => {
    const c = getCategoryConfig(cat);

    setFilters((f) => ({
      ...f,
      category: cat,
    }));

    setSort(c.sortDefault as SortType);
    setAgeFilter('');
    setActiveChip('');
  }, []);

  const handleChipClick = useCallback(
    (value: string) => {
      setActiveChip(value);

      if (filters.category === 'kids') {
        setAgeFilter(chipToAge(value));
      }
    },
    [filters.category],
  );

  const handleAgeChange = useCallback((value: string) => {
    setAgeFilter(value);
    setActiveChip(ageToChip(value));
  }, []);

  const activeCount = [
    filters.city !== '',
    filters.dateRange !== 'all',
    filters.priceMax !== null,
    filters.freeOnly,
    activeChip !== '',
    activeMood !== '',
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden pb-24 md:pb-0">
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-16">
          <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              {cfg.labelPlural} {filters.city ? `в ${filters.city}` : 'в Казахстане'}
            </h1>

            <p className="text-sm text-white/30 mt-0.5">
              {sorted.length} событий
              {activeMood && ` · ${MOODS.find((m) => m.value === activeMood)?.label ?? ''}`}
              {query && ` · «${query}»`}
            </p>
          </div>

          <div className="sticky top-14 z-30 mb-6 -mx-2 px-2 py-2 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
            <div className="flex gap-3 items-center">
              <form onSubmit={(e) => e.preventDefault()} className="flex-1 max-w-xl relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Поиск ${cfg.labelPlural.toLowerCase()}...`}
                  className="w-full h-10 bg-white/6 border border-white/10 rounded-xl pl-10 pr-9 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition"
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

              <div className="flex gap-1">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setSort(o.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      sort === o.value
                        ? 'bg-white/12 text-white border border-white/20'
                        : 'text-white/35 hover:text-white/60 border border-transparent'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
              {ALL_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setCategory(t.value)}
                  className={`flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                    filters.category === t.value
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/40 border border-white/8 hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}

              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-shrink-0 px-3.5 py-1 rounded-full text-xs text-red-400/70 border border-red-500/20 hover:text-red-400 transition"
                >
                  Сбросить ({activeCount})
                </button>
              )}
            </div>

            {filters.category && cfg.chips.length > 0 && (
              <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-hide">
                {cfg.chips.map((c) => {
                  const active = activeChip === c.value;
                  const hasEvents = hasEventsForChip(initialEvents, filters.category, c.value);

                  return (
                    <button
                      key={c.value}
                      type="button"
                      disabled={!hasEvents}
                      onClick={() => handleChipClick(c.value)}
                      className={`flex-shrink-0 px-3 py-0.5 rounded-full text-[11px] border transition ${
                        active
                          ? 'bg-white text-black border-white'
                          : hasEvents
                            ? 'bg-white/3 text-white/35 border-white/7 hover:bg-white/8 hover:text-white/60'
                            : 'bg-white/2 text-white/15 border-white/5 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <aside className="w-[220px] flex-shrink-0">
              <div className="sticky top-[200px] bg-white/[0.02] border border-white/7 rounded-2xl p-4">
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                    Настроение
                  </p>

                  <div className="flex gap-1.5 flex-wrap">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() =>
                          setActiveMood(activeMood === mood.value ? '' : mood.value)
                        }
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition ${
                          activeMood === mood.value
                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                            : 'bg-white/3 border-white/10 text-white/40 hover:bg-white/8 hover:text-white/70'
                        }`}
                      >
                        <span className="mr-1">{mood.emoji}</span>
                        {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filters.category === 'kids' && (
                  <AgeFilter
                    value={ageFilter}
                    onChange={handleAgeChange}
                    events={initialEvents}
                    category={filters.category}
                  />
                )}

                <FilterContent
                  filters={filters}
                  onChange={setFilters}
                  resultCount={sorted.length}
                />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {sorted.length === 0 ? (
                <Empty query={query} category={filters.category} onReset={handleReset} />
              ) : (
                <DesktopFeed events={sorted} category={filters.category} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="px-3.5 pt-3 pb-2">
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 mb-2.5">
            <div className="flex-1 flex items-center gap-2 bg-white/7 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-white/25 transition">
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

          <h1 className="text-[13px] font-bold text-white/70">
            {filters.city || 'Все города'}
            <span className="text-white/25 font-normal ml-1.5">· {sorted.length} событий</span>
          </h1>
        </div>

        <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-2 scrollbar-hide">
          {ALL_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setCategory(t.value)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition ${
                filters.category === t.value
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/45 border border-white/8'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filters.category === 'kids' &&
          (() => {
            const visibleAgeOptions = AGE_OPTIONS.filter((opt) => {
              if (!opt.value) return true;
              return hasEventsForChip(initialEvents, filters.category, ageToChip(opt.value));
            });

            if (visibleAgeOptions.length <= 1) return null;

            return (
              <div className="px-3.5 mb-2">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {visibleAgeOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => handleAgeChange(o.value)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                        ageFilter === o.value
                          ? 'bg-green-500/20 border-green-500/40 text-green-400'
                          : 'bg-white/3 border-white/10 text-white/40'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

        {filters.category && cfg.chips.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-2 scrollbar-hide">
            {cfg.chips.map((c) => {
              const active = activeChip === c.value;
              const hasEvents = hasEventsForChip(initialEvents, filters.category, c.value);

              return (
                <button
                  key={c.value}
                  type="button"
                  disabled={!hasEvents}
                  onClick={() => handleChipClick(c.value)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] border transition ${
                    active
                      ? 'bg-white text-black border-white'
                      : hasEvents
                        ? 'bg-white/3 text-white/35 border-white/7'
                        : 'bg-white/2 text-white/15 border-white/5 cursor-not-allowed opacity-40'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-2.5 scrollbar-hide">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setSort(o.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-semibold border transition ${
                sort === o.value
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/8 text-white/30'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <Empty query={query} category={filters.category} onReset={handleReset} />
        ) : (
          <MobileFeed events={sorted} category={filters.category} />
        )}
      </div>
    </main>
  );
}