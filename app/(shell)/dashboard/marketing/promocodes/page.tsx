'use client';

import { useState, useMemo } from 'react';

type PromoStatus = 'active' | 'paused' | 'expired' | 'draft';
type DiscountType = 'percent' | 'fixed' | 'free';
type CodeType = 'public' | 'single' | 'personal' | 'bulk';

interface PromoCode {
  id: string;
  code: string;
  name: string;
  codeType: CodeType;
  discountType: DiscountType;
  discountValue: number;
  used: number;
  limit: number | null;
  revenue: number;
  expiresAt: string | null;
  status: PromoStatus;
}

const PAGE_SIZE = 7;

const MOCK_CODES: PromoCode[] = [
  { id:'1', code:'SMART20',  name:'Подписчики Instagram',    codeType:'public',   discountType:'percent', discountValue:20,    used:84,  limit:200, revenue:142000, expiresAt:'2025-08-01', status:'active'  },
  { id:'2', code:'VIP2025',  name:'VIP гости',               codeType:'personal', discountType:'fixed',   discountValue:5000,  used:12,  limit:50,  revenue:28900,  expiresAt:'2025-06-15', status:'active'  },
  { id:'3', code:'OPENING',  name:'Открытие сезона',         codeType:'public',   discountType:'percent', discountValue:30,    used:200, limit:200, revenue:88000,  expiresAt:'2025-05-10', status:'expired' },
  { id:'4', code:'BLOGGER01',name:'Блогер @bekzat_kz',       codeType:'single',   discountType:'percent', discountValue:15,    used:33,  limit:100, revenue:67500,  expiresAt:'2025-07-20', status:'active'  },
  { id:'5', code:'FLASH10',  name:'Flash-распродажа',        codeType:'public',   discountType:'fixed',   discountValue:2000,  used:0,   limit:300, revenue:0,      expiresAt:'2025-05-25', status:'draft'   },
  { id:'6', code:'EARLYBIRD',name:'Ранние птицы',            codeType:'public',   discountType:'percent', discountValue:25,    used:45,  limit:45,  revenue:56250,  expiresAt:'2025-06-01', status:'paused'  },
  { id:'7', code:'CORP2025X',name:'Корпоративные клиенты',   codeType:'personal', discountType:'fixed',   discountValue:10000, used:7,   limit:30,  revenue:43500,  expiresAt:'2025-12-31', status:'active'  },
];

function fmt(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸';
}

function discountLabel(c: PromoCode) {
  if (c.discountType === 'percent') return `${c.discountValue}%`;
  if (c.discountType === 'fixed') return fmt(c.discountValue);
  return 'Бесплатный';
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const STATUS_CONFIG: Record<PromoStatus, { label: string; dot: string; text: string; bg: string }> = {
  active:  { label: 'Активен',  dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  paused:  { label: 'Пауза',    dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20' },
  expired: { label: 'Истёк',    dot: 'bg-zinc-500',    text: 'text-zinc-500',    bg: 'bg-zinc-500/10 border-zinc-500/20' },
  draft:   { label: 'Черновик', dot: 'bg-sky-400',     text: 'text-sky-400',     bg: 'bg-sky-400/10 border-sky-400/20' },
};

function StatusBadge({ status }: { status: PromoStatus }) {
  const s = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function UsageBar({ used, limit }: { used: number; limit: number | null }) {
  if (!limit) return <span className="text-[var(--color-text-tertiary)] text-sm">∞</span>;

  const pct = Math.min(100, Math.round((used / limit) * 100));
  const color = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div>
      <div className="text-sm text-[var(--color-text-primary)]">{used} / {limit}</div>
      <div className="h-[3px] bg-[var(--color-background-secondary)] rounded-full mt-1.5 w-20">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const MINI_CHART = [12, 20, 18, 35, 28, 44, 33];

function DetailDrawer({ code, onClose }: { code: PromoCode | null; onClose: () => void }) {
  if (!code) return null;

  const maxBar = Math.max(...MINI_CHART);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-80 h-full overflow-y-auto p-6 border-l border-[var(--dash-card-border)]" >
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)]">Промокод</span>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] text-lg leading-none">✕</button>
        </div>

        <div className="font-mono text-2xl font-bold text-[var(--color-text-primary)] mb-2">{code.code}</div>
        <StatusBadge status={code.status} />

        <div className="mt-6 space-y-0">
          {([
            ['Название', code.name],
            ['Тип', { public:'Публичный', single:'Одноразовый', personal:'Персональный', bulk:'Массовый' }[code.codeType]],
            ['Скидка', discountLabel(code)],
            ['Использований', `${code.used} из ${code.limit ?? '∞'}`],
            ['Выручка', code.revenue ? fmt(code.revenue) : '—'],
            ['Действует до', code.expiresAt ?? '—'],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-3 border-b border-[var(--dash-card-border)] text-sm">
              <span className="text-[var(--color-text-tertiary)]">{k}</span>
              <span className="text-[var(--color-text-primary)] font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">Использования за 7 дней</div>
          <div className="flex items-end gap-1 h-12">
            {MINI_CHART.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-[var(--color-background-secondary)] hover:bg-orange-500/40 transition-colors"
                style={{ height: `${(h / maxBar) * 100}%` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="flex-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-sm rounded-xl py-2 font-medium transition-colors">
            Редактировать
          </button>
          <button className="px-4 bg-[var(--color-background-secondary)] hover:bg-[var(--color-background-secondary)] border border-[var(--dash-card-border)] text-[var(--color-text-secondary)] text-sm rounded-xl py-2 transition-colors">
            ⎘
          </button>
        </div>
      </div>
    </div>
  );
}

const WIZARD_STEPS = ['Основное', 'Логика', 'Лимиты', 'Расписание'];

const CODE_TYPES: { value: CodeType; label: string; hint: string }[] = [
  { value: 'public',   label: 'Публичный',    hint: 'Один код для всех — любой покупатель может использовать до лимита' },
  { value: 'single',   label: 'Одноразовый',  hint: 'Каждый код используется только один раз — подходит для VIP' },
  { value: 'personal', label: 'Персональный', hint: 'Привязан к конкретному email — нельзя передать другому' },
  { value: 'bulk',     label: 'Массовый',     hint: 'Массовая генерация уникальных кодов — для рассылок и партнёров' },
];

function CreateWizard({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (code: PromoCode) => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    code: '',
    codeType: 'public' as CodeType,
    discountType: 'percent' as DiscountType,
    discountValue: '',
    minOrder: '',
    maxUses: '',
    perUser: '',
    maxTickets: '',
    startsAt: '',
    expiresAt: '',
    status: 'active' as PromoStatus,
  });

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  const codeTypeObj = CODE_TYPES.find(t => t.value === form.codeType);

  const inputCls = 'w-full bg-[var(--color-background-secondary)] border border-[var(--dash-card-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--dash-card-border)] transition-colors';
  const selectCls = 'w-full bg-[var(--color-background-secondary)] border border-[var(--dash-card-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--dash-card-border)] transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--dash-card-border)] overflow-hidden" >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--dash-card-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Новый промокод</h2>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] text-lg leading-none">✕</button>
        </div>

        <div className="flex border-b border-[var(--dash-card-border)]">
          {WIZARD_STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < step ? 'done' : n === step ? 'active' : 'idle';

            return (
              <button
                key={s}
                onClick={() => n < step && setStep(n)}
                className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
                  state === 'active'
                    ? 'border-orange-500 text-orange-400'
                    : state === 'done'
                      ? 'border-emerald-500/50 text-emerald-400/70 cursor-pointer'
                      : 'border-transparent text-[var(--color-text-tertiary)]'
                }`}
              >
                <span className="block text-sm mb-0.5">{n}</span>
                {s}
              </button>
            );
          })}
        </div>

        <div className="px-6 py-5 space-y-4 min-h-[280px]">
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Название кампании *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Например: Скидка для подписчиков"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Код *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => update('code', e.target.value.toUpperCase())}
                    placeholder="SMART20"
                    className={`${inputCls} flex-1 font-mono`}
                  />
                  <button
                    onClick={() => update('code', generateCode())}
                    className="px-3 border border-dashed border-[var(--dash-card-border)] rounded-xl text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:border-[var(--dash-card-border)] whitespace-nowrap transition-colors"
                  >
                    ↻ Случайный
                  </button>
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Только латинские буквы и цифры</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Тип промокода</label>
                <div className="grid grid-cols-2 gap-2">
                  {CODE_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => update('codeType', t.value)}
                      className={`text-left p-3 rounded-xl border text-sm transition-all ${
                        form.codeType === t.value
                          ? 'border-orange-500/40 bg-orange-500/[0.08] text-orange-300'
                          : 'border-[var(--dash-card-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {codeTypeObj && <p className="text-xs text-[var(--color-text-tertiary)] mt-2">{codeTypeObj.hint}</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Вид скидки *</label>
                <div className="flex gap-2">
                  {(['percent', 'fixed', 'free'] as DiscountType[]).map(t => {
                    const labels = { percent: '% Процент', fixed: '₸ Сумма', free: '🎁 Бесплатный' };

                    return (
                      <button
                        key={t}
                        onClick={() => update('discountType', t)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          form.discountType === t
                            ? 'border-orange-500/40 bg-orange-500/[0.08] text-orange-300'
                            : 'border-[var(--dash-card-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-background-secondary)]'
                        }`}
                      >
                        {labels[t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Размер скидки *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={e => update('discountValue', e.target.value)}
                      placeholder={form.discountType === 'percent' ? '20' : '5000'}
                      disabled={form.discountType === 'free'}
                      className={`${inputCls} pr-8 disabled:opacity-30`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-tertiary)]">
                      {form.discountType === 'percent' ? '%' : '₸'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Мин. сумма заказа</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.minOrder}
                      onChange={e => update('minOrder', e.target.value)}
                      placeholder="5000"
                      className={`${inputCls} pr-6`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-tertiary)]">₸</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Применяется к событиям</label>
                <select className={selectCls}>
                  <option>Все события организатора</option>
                  <option>Только выбранные события</option>
                  <option>Только выбранные категории</option>
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Макс. использований</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={e => update('maxUses', e.target.value)}
                    placeholder="100"
                    className={inputCls}
                  />
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Пусто — без лимита</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">На 1 покупателя</label>
                  <input
                    type="number"
                    value={form.perUser}
                    onChange={e => update('perUser', e.target.value)}
                    placeholder="1"
                    className={inputCls}
                  />
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Раз на один email</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Макс. билетов за транзакцию</label>
                <input
                  type="number"
                  value={form.maxTickets}
                  onChange={e => update('maxTickets', e.target.value)}
                  placeholder="4"
                  className={inputCls}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Начало действия</label>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={e => update('startsAt', e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Конец действия</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={e => update('expiresAt', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Начальный статус</label>
                <div className="flex gap-2">
                  {[
                    { v: 'active' as PromoStatus, label: 'Активен сразу' },
                    { v: 'draft' as PromoStatus, label: 'Черновик' },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => update('status', opt.v)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        form.status === opt.v
                          ? 'border-orange-500/40 bg-orange-500/[0.08] text-orange-300'
                          : 'border-[var(--dash-card-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-background-secondary)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--dash-card-border)]" >
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 border border-[var(--dash-card-border)] rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)] hover:border-[var(--dash-card-border)] transition-colors"
              >
                Назад
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 border border-[var(--dash-card-border)] rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              Отмена
            </button>
          </div>

          <button
            onClick={() => {
  if (step < 4) {
    setStep(s => s + 1);
    return;
  }

  const newCode: PromoCode = {
    id: crypto.randomUUID(),
    code: form.code || generateCode(),
    name: form.name || 'Новый промокод',
    codeType: form.codeType,
    discountType: form.discountType,
    discountValue: form.discountType === 'free' ? 0 : Number(form.discountValue || 0),
    used: 0,
    limit: form.maxUses ? Number(form.maxUses) : null,
    revenue: 0,
    expiresAt: form.expiresAt || null,
    status: form.status,
  };

  onCreate(newCode);
}}
            className="px-5 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-orange-400 rounded-xl text-sm font-medium transition-colors"
          >
            {step < 4 ? 'Далее →' : 'Создать промокод'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromoCodesPage() {
  const [filter, setFilterState] = useState<'all' | PromoStatus>('all');
  const [search, setSearchState] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PromoCode | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [codes, setCodes] = useState<PromoCode[]>(MOCK_CODES);

  function handleFilterChange(v: 'all' | PromoStatus) {
    setFilterState(v);
    setPage(1);
  }

  function handleSearchChange(v: string) {
    setSearchState(v);
    setPage(1);
  }

  const filtered = useMemo(() => {
    return codes.filter(c => {
      if (filter !== 'all' && c.status !== filter) return false;

      if (
        search &&
        !c.code.toLowerCase().includes(search.toLowerCase()) &&
        !c.name.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [codes, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kpi = useMemo(() => ({
    active: codes.filter(c => c.status === 'active').length,
    used: codes.reduce((s, c) => s + c.used, 0),
    discount: codes.reduce((s, c) => s + c.revenue, 0),
  }), [codes]);

  const FILTERS: { value: 'all' | PromoStatus; label: string }[] = [
    { value: 'all',     label: 'Все'       },
    { value: 'active',  label: 'Активные'  },
    { value: 'paused',  label: 'На паузе'  },
    { value: 'expired', label: 'Истёкшие'  },
    { value: 'draft',   label: 'Черновики' },
  ];

  const CODE_TYPE_LABELS: Record<CodeType, string> = {
    public: 'Публичный',
    single: 'Одноразовый',
    personal: 'Персональный',
    bulk: 'Массовый',
  };

  return (
    <div className="min-h-screen p-6" >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Промокоды</h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-0.5">Управление скидочными кодами для ваших событий</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-orange-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          + Создать промокод
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Активных кодов', value: kpi.active, delta: '+3 за месяц', up: true },
          { label: 'Использований', value: kpi.used.toLocaleString('ru-KZ'), delta: '↑ 18% vs прошлый мес.', up: true },
          { label: 'Скидок выдано', value: fmt(kpi.discount), delta: '↓ 5% от выручки', up: false },
          { label: 'Конверсия', value: '34%', delta: '↑ 6 пп vs прошлый мес.', up: true },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-[var(--dash-card-border)] p-4" >
            <div className="text-xs text-[var(--color-text-tertiary)] mb-2">{k.label}</div>
            <div className="text-2xl font-semibold text-[var(--color-text-primary)]">{k.value}</div>
            <div className={`text-xs mt-1 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] text-sm">🔍</span>
          <input
            type="text"
            placeholder="Найти по коду или названию…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-background-secondary)] border border-[var(--dash-card-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--dash-card-border)]"
          />
        </div>

        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              filter === f.value
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'border-[var(--dash-card-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--dash-card-border)] overflow-hidden" >
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--dash-card-border)]" >
            <tr>
              {['КОД', 'ТИП', 'СКИДКА', 'ИСП. / ЛИМИТ', 'ВЫРУЧКА', 'ДО', 'СТАТУС', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[var(--color-text-tertiary)] text-sm">
                  Промокоды не найдены
                </td>
              </tr>
            ) : (
              paginated.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="border-b border-[var(--dash-card-border)] hover:bg-[var(--color-background-secondary)] cursor-pointer transition-colors last:border-none group"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold bg-[var(--color-background-secondary)] border border-[var(--dash-card-border)] px-2 py-0.5 rounded-lg text-[var(--color-text-primary)]">
                      {c.code}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs bg-[var(--color-background-secondary)] border border-[var(--dash-card-border)] text-[var(--color-text-tertiary)] px-2 py-0.5 rounded-lg">
                      {CODE_TYPE_LABELS[c.codeType]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-[var(--color-text-primary)] font-medium">{discountLabel(c)}</td>
                  <td className="px-4 py-3"><UsageBar used={c.used} limit={c.limit} /></td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{c.revenue ? fmt(c.revenue) : '—'}</td>
                  <td className="px-4 py-3 text-[var(--color-text-tertiary)]">{c.expiresAt ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors text-xs"
                      >
                        ✎
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigator.clipboard?.writeText(c.code);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors text-xs"
                      >
                        ⎘
                      </button>

                      <button
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-lg hover:bg-red-500/[0.08] text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--dash-card-border)] text-xs text-[var(--color-text-tertiary)]">
          <span>
            Показано {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            –{Math.min(page * PAGE_SIZE, filtered.length)} из {filtered.length}
          </span>

          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-lg border border-[var(--dash-card-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-background-secondary)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  page === n
                    ? 'bg-orange-500/10 border-orange-500/25 text-orange-400'
                    : 'border-[var(--dash-card-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-background-secondary)]'
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-lg border border-[var(--dash-card-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-background-secondary)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {selected && <DetailDrawer code={selected} onClose={() => setSelected(null)} />}
      {showCreate && (
  <CreateWizard
    onClose={() => setShowCreate(false)}
    onCreate={(newCode) => {
      setCodes(prev => [newCode, ...prev]);
      setShowCreate(false);
      setPage(1);
    }}
  />
)}
    </div>
  );
}