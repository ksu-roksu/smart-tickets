'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  CornerUpLeft,
  FileSpreadsheet,
  CalendarDays,
  Ticket,
  Building2,
  ScanLine,
  QrCode,
  BarChart2,
  Megaphone,
  Tag,
  Users,
  Star,
  Share2,
  ShieldCheck,
  TrendingUp,
  Filter,
  Brain,
  Download,
  Folder,
  FileText,
  FileCheck,
  ClipboardCheck,
  UserCog,
  Shield,
  History,
  Settings,
  CreditCard,
  Unplug,
  ChevronsUpDown,
  Lock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Check,
  Building,
  Plus,
  LogOut,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeType = 'pro' | 'enterprise' | 'dev' | 'soon' | 'new';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: BadgeType;
  locked?: boolean;
  lockedDesc?: string;
  upgradeFeature?: string;
};

type NavSection = {
  label?: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

// ─── Badge config ─────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<BadgeType, { label: string; className: string }> = {
  pro:        { label: 'PRO',   className: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  enterprise: { label: 'ENT',   className: 'bg-amber-500/15  text-amber-400  border-amber-500/25'  },
  dev:        { label: 'Dev',   className: 'bg-sky-500/15    text-sky-400    border-sky-500/25'    },
  soon:       { label: 'Скоро', className: 'bg-zinc-500/15   text-zinc-400   border-zinc-500/25'   },
  new:        { label: 'NEW',   className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
};

const PLAN_LABELS: Record<string, string> = {
  pro:        'Smart Tickets PRO',
  enterprise: 'Enterprise',
  dev:        'В разработке',
  soon:       'Скоро',
};

// ─── Navigation config ────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Обзор', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Продажи',
    items: [
      { label: 'Заказы',   href: '/dashboard/orders',   icon: Receipt         },
      { label: 'Выплаты',  href: '/dashboard/payouts',  icon: Wallet          },
      { label: 'Возвраты', href: '/dashboard/refunds',  icon: CornerUpLeft    },
      { label: 'Отчёты',   href: '/dashboard/reports',  icon: FileSpreadsheet },
    ],
  },
  {
    label: 'События',
    items: [
      { label: 'События',        href: '/dashboard/events',     icon: CalendarDays },
      { label: 'Билеты',         href: '/dashboard/tickets',    icon: Ticket       },
      { label: 'Площадки',       href: '/dashboard/venues',     icon: Building2    },
      { label: 'Контроль входа', href: '/dashboard/check-in',   icon: ScanLine     },
      { label: 'QR и доступ',    href: '/dashboard/qr-access',  icon: QrCode, badge: 'new' },
      {
        label: 'Схемы залов',
        href: '/dashboard/seat-maps',
        icon: BarChart2,
        badge: 'soon',
        locked: true,
        lockedDesc: 'Интерактивная схема зала с управлением местами',
        upgradeFeature: 'Визуальный конструктор схем залов',
      },
    ],
  },
  {
    label: 'Маркетинг',
    collapsible: true,
    items: [
      { label: 'Кампании',  href: '/dashboard/marketing/campaigns',  icon: Megaphone },
      { label: 'Промокоды', href: '/dashboard/marketing/promocodes', icon: Tag       },
      {
        label: 'Пресейлы',
        href: '/dashboard/marketing/presales',
        icon: Users,
        badge: 'pro',
        locked: true,
        lockedDesc: 'Закрытые предпродажи для подписчиков',
        upgradeFeature: 'Пресейлы и закрытые продажи',
      },
      {
        label: 'Блогеры',
        href: '/dashboard/marketing/bloggers',
        icon: Star,
        badge: 'pro',
        locked: true,
        lockedDesc: 'Партнёрские ссылки и трекинг инфлюенсеров',
        upgradeFeature: 'Инфлюенсер-маркетинг',
      },
      {
        label: 'Реферальная',
        href: '/dashboard/marketing/referral',
        icon: Share2,
        badge: 'dev',
        locked: true,
        lockedDesc: 'Реферальная система с кэшбэком Kaspi',
        upgradeFeature: 'Реферальная программа',
      },
      {
        label: 'Фрод-монитор',
        href: '/dashboard/marketing/fraud',
        icon: ShieldCheck,
        badge: 'pro',
        locked: true,
        lockedDesc: 'Мониторинг подозрительных покупок в реальном времени',
        upgradeFeature: 'Защита от фрода',
      },
    ],
  },
  {
    label: 'Аналитика',
    collapsible: true,
    items: [
      { label: 'Обзор',   href: '/dashboard/analytics',      icon: BarChart2  },
      { label: 'Продажи', href: '/dashboard/analytics/sales', icon: TrendingUp },
      {
        label: 'Конверсии',
        href: '/dashboard/analytics/conversions',
        icon: Filter,
        badge: 'pro',
        locked: true,
        lockedDesc: 'Воронка от просмотра до покупки по каждому событию',
        upgradeFeature: 'Аналитика конверсий',
      },
      {
        label: 'Аудитория',
        href: '/dashboard/analytics/audience',
        icon: Users,
        badge: 'pro',
        locked: true,
        lockedDesc: 'Демография, города, повторные покупатели',
        upgradeFeature: 'Анализ аудитории',
      },
      {
        label: 'Тепловые карты',
        href: '/dashboard/analytics/heatmaps',
        icon: Filter,
        badge: 'pro',
        locked: true,
        lockedDesc: 'Тепловые карты залов и поведения покупателей',
        upgradeFeature: 'Тепловые карты',
      },
      {
        label: 'Прогнозирование',
        href: '/dashboard/analytics/forecast',
        icon: TrendingUp,
        badge: 'dev',
        locked: true,
        lockedDesc: 'ML-прогноз продаж на основе исторических данных',
        upgradeFeature: 'Прогнозирование продаж',
      },
      {
        label: 'AI-рекоменд.',
        href: '/dashboard/analytics/ai',
        icon: Brain,
        badge: 'soon',
        locked: true,
        lockedDesc: 'ИИ-рекомендации по ценообразованию и маркетингу',
        upgradeFeature: 'AI-рекомендации',
      },
      { label: 'Экспорт', href: '/dashboard/analytics/export', icon: Download },
    ],
  },
  {
    label: 'Документы',
    collapsible: true,
    defaultCollapsed: true,
    items: [
      { label: 'Все документы', href: '/dashboard/documents',           icon: Folder    },
      { label: 'Договоры',      href: '/dashboard/documents/contracts', icon: FileText  },
      { label: 'Акты и счета',  href: '/dashboard/documents/invoices',  icon: FileCheck },
      {
        label: 'Согласования',
        href: '/dashboard/documents/approvals',
        icon: ClipboardCheck,
        badge: 'enterprise',
        locked: true,
        lockedDesc: 'Документооборот и согласования для enterprise-организаторов',
        upgradeFeature: 'Документооборот и согласования',
      },
    ],
  },
  {
    label: 'Команда',
    items: [
      { label: 'Команда и доступы', href: '/dashboard/settings/team',  icon: UserCog },
      { label: 'Роли',              href: '/dashboard/settings/roles',  icon: Shield  },
      { label: 'Журнал действий',   href: '/dashboard/settings/audit',  icon: History },
    ],
  },
  {
    label: 'Настройки',
    items: [
      { label: 'Организация',     href: '/dashboard/settings/org',     icon: Settings },
      {
        label: 'Тарифы и оплата',
        href: '/dashboard/settings/billing',
        icon: CreditCard,
        badge: 'pro',
        locked: true,
        lockedDesc: 'Управление подпиской, счета, история платежей',
        upgradeFeature: 'Управление тарифом',
      },
      {
        label: 'API и интеграции',
        href: '/dashboard/settings/api',
        icon: Unplug,
        badge: 'dev',
        locked: true,
        lockedDesc: 'REST API, вебхуки, интеграция с CRM и CMS',
        upgradeFeature: 'API и интеграции',
      },
    ],
  },
];

// ─── Locked tooltip ───────────────────────────────────────────────────────────

function LockedTooltip({ item, visible }: { item: NavItem; visible: boolean }) {
  if (!visible) return null;
  const badge = item.badge!;
  const isPro = badge === 'pro';
  const isEnt = badge === 'enterprise';
  const isDev = badge === 'dev';

  return (
    <div
      className="
        absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-[100]
        w-52 rounded-2xl border border-white/[0.09] bg-[#161616]
        shadow-[0_8px_40px_rgba(0,0,0,0.7)] p-3
        pointer-events-none
      "
      role="tooltip"
    >
      {/* Blurred preview strip */}
      <div className="relative h-9 rounded-xl overflow-hidden mb-3 bg-white/[0.04] border border-white/[0.06]">
        <div
          className="absolute inset-0 flex items-center gap-2 px-3"
          style={{ filter: 'blur(4px)', opacity: 0.35 }}
        >
          <div className="h-1.5 w-14 rounded bg-white/40" />
          <div className="h-1.5 w-8 rounded bg-orange-400/60" />
          <div className="h-1.5 w-10 rounded bg-white/25" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock size={13} className="text-white/35" />
        </div>
      </div>

      <p className="text-[12px] font-semibold text-white/75 leading-tight mb-1">
        {item.upgradeFeature ?? item.label}
      </p>

      {item.lockedDesc && (
        <p className="text-[11px] text-white/35 leading-snug mb-3">
          {item.lockedDesc}
        </p>
      )}

      {(isPro || isEnt) ? (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-violet-400">
          <Sparkles size={10} />
          <span>{PLAN_LABELS[badge]}</span>
          <ArrowRight size={10} className="ml-auto" />
        </div>
      ) : isDev ? (
        <div className="flex items-center gap-1.5 text-[11px] text-sky-400">
          <Zap size={10} />
          <span>В активной разработке</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <Check size={10} />
          <span>Запланировано к релизу</span>
        </div>
      )}
    </div>
  );
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive =
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(item.href);

  const Icon = item.icon;

  const handleEnter = () => {
    if (!item.locked) return;
    timerRef.current = setTimeout(() => setTooltipVisible(true), 250);
  };
  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltipVisible(false);
  };

  const baseClass = [
    'group relative flex items-center gap-2 px-2.5 py-[7px] rounded-xl transition-all duration-100 select-none',
    item.locked
      ? 'cursor-not-allowed opacity-50 hover:opacity-60 hover:bg-white/[0.03]'
      : isActive
        ? 'bg-orange-500/10'
        : 'hover:bg-white/[0.05] cursor-pointer',
  ].join(' ');

  const inner = (
    <>
      <Icon
        size={15}
        className={[
          'flex-shrink-0 transition-colors',
          item.locked ? 'text-white/25' :
          isActive ? 'text-orange-400' :
          'text-white/30 group-hover:text-white/60',
        ].join(' ')}
        strokeWidth={isActive ? 2.2 : 1.8}
      />
      <span
        className={[
          'flex-1 min-w-0 truncate text-[13px] leading-none transition-colors',
          item.locked ? 'text-white/30' :
          isActive ? 'text-orange-400 font-medium' :
          'text-white/50 group-hover:text-white/80',
        ].join(' ')}
      >
        {item.label}
      </span>
      {item.badge && (
        <span
          className={`flex-shrink-0 text-[9px] font-semibold px-[5px] py-[2px] rounded border leading-none ${BADGE_CONFIG[item.badge].className}`}
        >
          {BADGE_CONFIG[item.badge].label}
        </span>
      )}
      {item.locked && <Lock size={10} className="flex-shrink-0 text-white/15" />}

      {/* Positioned tooltip */}
      <LockedTooltip item={item} visible={tooltipVisible} />
    </>
  );

  if (item.locked) {
    return (
      <div
        className={baseClass}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        aria-disabled="true"
        role="menuitem"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link href={item.href} className={baseClass}>
      {inner}
    </Link>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function NavSectionBlock({ section }: { section: NavSection }) {
  const [collapsed, setCollapsed] = useState(section.defaultCollapsed ?? false);

  return (
    <div className="mb-[2px]">
      {section.label && (
        <button
          onClick={() => section.collapsible && setCollapsed((c) => !c)}
          className={[
            'w-full flex items-center justify-between px-2.5 py-[5px] mb-[1px] rounded-lg transition-colors',
            section.collapsible ? 'hover:bg-white/[0.03] cursor-pointer' : 'cursor-default',
          ].join(' ')}
        >
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-white/20 leading-none">
            {section.label}
          </span>
          {section.collapsible && (
            collapsed
              ? <ChevronRight size={10} className="text-white/20" />
              : <ChevronDown  size={10} className="text-white/20" />
          )}
        </button>
      )}
      {!collapsed && (
        <div className="space-y-[1px]">
          {section.items.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Upgrade banner ───────────────────────────────────────────────────────────

function UpgradeBanner() {
  return (
    <div className="mx-2 mb-2 p-3 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-orange-500/[0.06]">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={11} className="text-violet-400" />
        <span className="text-[11px] font-semibold text-violet-300">Обновить до PRO</span>
      </div>
      <p className="text-[10px] text-white/30 leading-snug mb-2.5">
        Маркетинг, аналитика аудитории, фрод-мониторинг и API
      </p>
      <Link
        href="/dashboard/settings/billing"
        className="flex items-center justify-center gap-1 h-7 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/25 text-[11px] font-medium text-violet-300 transition-colors"
      >
        Узнать больше <ArrowRight size={10} />
      </Link>
    </div>
  );
}

// ─── Org switcher ─────────────────────────────────────────────────────────────

const MOCK_ORGS = [
  { id: 'sk',     name: 'Smart Kazakhstan', plan: 'Free', initials: 'SK' },
  { id: 'astana', name: 'Astana Events',    plan: 'PRO',  initials: 'AE' },
];

function OrgSwitcher() {
  const [open, setOpen]       = useState(false);
  const [activeId, setActiveId] = useState('sk');
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const active = MOCK_ORGS.find((o) => o.id === activeId) ?? MOCK_ORGS[0];

  return (
    <div ref={ref} className="relative px-2 py-2.5 border-t border-white/[0.06] flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-colors group"
      >
        <div className="w-[30px] h-[30px] rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-[10px] font-bold text-orange-400 flex-shrink-0">
          {active.initials}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[12px] font-medium text-white/75 truncate leading-tight">{active.name}</p>
          <p className="text-[10px] text-white/30 mt-[2px] leading-none">
            {active.plan === 'Free' ? 'Free · Обновить до PRO' : `${active.plan} план`}
          </p>
        </div>
        <ChevronsUpDown size={13} className="text-white/25 group-hover:text-white/45 flex-shrink-0 transition-colors" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 mx-0 bg-[#161616] border border-white/[0.09] rounded-2xl py-2 shadow-[0_-12px_40px_rgba(0,0,0,0.7)] z-50">
          {/* User */}
          <div className="px-3 pb-2 mb-1 border-b border-white/[0.06]">
            <p className="text-[12px] font-medium text-white/65 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>

          {/* Orgs */}
          <div className="px-1.5 pb-1 mb-1 border-b border-white/[0.06]">
            <p className="text-[9px] uppercase tracking-[0.1em] text-white/20 px-2 pt-1 pb-1">Организации</p>
            {MOCK_ORGS.map((org) => (
              <button
                key={org.id}
                onClick={() => { setActiveId(org.id); setOpen(false); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[9px] font-bold text-white/40 flex-shrink-0">
                  {org.initials}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[12px] text-white/65 truncate">{org.name}</p>
                  <p className="text-[9px] text-white/25">{org.plan}</p>
                </div>
                {org.id === activeId && <Check size={11} className="text-orange-400 flex-shrink-0" />}
              </button>
            ))}
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors text-white/35 hover:text-white/55 mt-0.5">
              <Plus size={12} />
              <span className="text-[11px]">Добавить организацию</span>
            </button>
          </div>

          {/* Actions */}
          <div className="px-1.5">
            <Link
              href="/dashboard/settings/org"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors text-white/35 hover:text-white/60"
            >
              <Building size={12} />
              <span className="text-[11px]">Настройки организации</span>
            </Link>
            <Link
              href="/sign-out"
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-red-500/[0.08] transition-colors text-red-400/50 hover:text-red-400"
            >
              <LogOut size={12} />
              <span className="text-[11px]">Выйти</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DashboardSidebar() {
  // Replace with real plan check from Clerk org metadata or DB
  const isPro = false;

  return (
    <aside
      className="flex flex-col w-[220px] min-w-[220px] h-screen sticky top-0 overflow-hidden"
      style={{ background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="px-4 pt-4 pb-3.5 border-b border-white/[0.06] flex-shrink-0">
        <Link href="/" className="font-extrabold text-[15px] tracking-tight text-white">
          Smart<span className="text-orange-500">Tickets</span>
        </Link>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-[11px] text-white/30">Панель организатора</span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-2"
        aria-label="Навигация дашборда"
        style={{ scrollbarWidth: 'none' }}
      >
        {NAV_SECTIONS.map((section, i) => (
          <NavSectionBlock key={i} section={section} />
        ))}
        <div className="h-2" />
      </nav>

      {/* Upgrade banner */}
      {!isPro && <UpgradeBanner />}

      {/* Org switcher */}
      <OrgSwitcher />
    </aside>
  );
}