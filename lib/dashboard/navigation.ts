import { type AppRole, type Permission, ROLE_PERMISSIONS } from '@/lib/rbac/permissions'

export type BadgeType = 'pro' | 'enterprise' | 'dev' | 'soon' | 'new'

export type NavItem = {
  label: string
  href: string
  icon: string
  permission?: Permission
  platformOnly?: boolean
  section: 'overview' | 'sales' | 'events' | 'marketing' | 'analytics' | 'documents' | 'team' | 'settings'
  badge?: BadgeType
  locked?: boolean
  lockedDesc?: string
  upgradeFeature?: string
  ordersBadge?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  // ОБЗОР
  { section: 'overview', label: 'Обзор',            href: '/dashboard',                       icon: 'LayoutDashboard', permission: 'dashboard:view' },

  // ПРОДАЖИ
  { section: 'sales',    label: 'Заказы',            href: '/dashboard/orders',                icon: 'Receipt',         permission: 'orders:view', ordersBadge: true },
  { section: 'sales',    label: 'Выплаты',           href: '/dashboard/payouts',               icon: 'Wallet',          permission: 'payouts:view' },
  { section: 'sales',    label: 'Возвраты',          href: '/dashboard/refunds',               icon: 'CornerUpLeft',    permission: 'orders:view' },
  { section: 'sales',    label: 'Отчёты',            href: '/dashboard/reports',               icon: 'FileSpreadsheet', permission: 'finance:view' },

  // СОБЫТИЯ
  { section: 'events',   label: 'События',           href: '/dashboard/events',                icon: 'CalendarDays',    permission: 'events:view' },
  { section: 'events',   label: 'Билеты',            href: '/dashboard/tickets',               icon: 'Ticket',          permission: 'tickets:view' },
  { section: 'events',   label: 'Площадки',          href: '/dashboard/venues',                icon: 'Building2',       permission: 'venues:manage' },
  { section: 'events',   label: 'Контроль входа',    href: '/dashboard/checkin',               icon: 'ScanLine',        permission: 'checkin:scan' },
  { section: 'events',   label: 'QR и доступ',       href: '/dashboard/qr-access',             icon: 'QrCode',          permission: 'tickets:view', badge: 'new' },
  { section: 'events',   label: 'Схемы залов',       href: '/dashboard/seat-maps',             icon: 'LayoutTemplate',  locked: true, badge: 'soon', lockedDesc: 'Интерактивная схема зала с управлением местами', upgradeFeature: 'Конструктор схем залов' },

  // МАРКЕТИНГ
  { section: 'marketing', label: 'Кампании',         href: '/dashboard/marketing/campaigns',   icon: 'Megaphone',       permission: 'promocodes:manage' },
  { section: 'marketing', label: 'Промокоды',        href: '/dashboard/promocodes',            icon: 'Tag',             permission: 'promocodes:manage' },
  { section: 'marketing', label: 'Пресейлы',         href: '/dashboard/marketing/presales',    icon: 'Users',           locked: true, badge: 'pro', lockedDesc: 'Закрытые предпродажи для подписчиков', upgradeFeature: 'Пресейлы' },
  { section: 'marketing', label: 'Блогеры',          href: '/dashboard/marketing/bloggers',    icon: 'Star',            locked: true, badge: 'pro', lockedDesc: 'Партнёрские ссылки и трекинг инфлюенсеров', upgradeFeature: 'Инфлюенсер-маркетинг' },
  { section: 'marketing', label: 'Реферальная',      href: '/dashboard/marketing/referral',    icon: 'Share2',          locked: true, badge: 'dev', lockedDesc: 'Реферальная система с кэшбэком Kaspi', upgradeFeature: 'Реферальная программа' },
  { section: 'marketing', label: 'Фрод-монитор',     href: '/dashboard/marketing/fraud',       icon: 'ShieldCheck',     locked: true, badge: 'pro', lockedDesc: 'Мониторинг подозрительных покупок', upgradeFeature: 'Защита от фрода' },

  // АНАЛИТИКА
  { section: 'analytics', label: 'Обзор',            href: '/dashboard/analytics',             icon: 'BarChart2',       permission: 'analytics:view' },
  { section: 'analytics', label: 'Продажи',          href: '/dashboard/analytics/sales',       icon: 'TrendingUp',      permission: 'analytics:view' },
  { section: 'analytics', label: 'Конверсии',        href: '/dashboard/analytics/conversions', icon: 'Filter',          locked: true, badge: 'pro', lockedDesc: 'Воронка от просмотра до покупки', upgradeFeature: 'Аналитика конверсий' },
  { section: 'analytics', label: 'Аудитория',        href: '/dashboard/analytics/audience',    icon: 'UsersRound',      locked: true, badge: 'pro', lockedDesc: 'Демография, города, повторные покупатели', upgradeFeature: 'Анализ аудитории' },
  { section: 'analytics', label: 'Тепловые карты',   href: '/dashboard/analytics/heatmaps',    icon: 'Map',             locked: true, badge: 'pro', lockedDesc: 'Тепловые карты залов', upgradeFeature: 'Тепловые карты' },
  { section: 'analytics', label: 'Прогнозирование',  href: '/dashboard/analytics/forecast',    icon: 'LineChart',       locked: true, badge: 'dev', lockedDesc: 'ML-прогноз продаж', upgradeFeature: 'Прогнозирование' },
  { section: 'analytics', label: 'AI-рекоменд.',     href: '/dashboard/analytics/ai',          icon: 'Brain',           locked: true, badge: 'soon', lockedDesc: 'ИИ-рекомендации по ценообразованию', upgradeFeature: 'AI-рекомендации' },
  { section: 'analytics', label: 'Экспорт',          href: '/dashboard/analytics/export',      icon: 'Download',        permission: 'analytics:view' },

  // ДОКУМЕНТЫ
  { section: 'documents', label: 'Все документы',    href: '/dashboard/documents',             icon: 'Folder',          permission: 'finance:view' },
  { section: 'documents', label: 'Договоры',         href: '/dashboard/documents/contracts',   icon: 'FileText',        permission: 'finance:view' },
  { section: 'documents', label: 'Акты и счета',     href: '/dashboard/documents/invoices',    icon: 'FileCheck',       permission: 'finance:view' },
  { section: 'documents', label: 'Согласования',     href: '/dashboard/documents/approvals',   icon: 'ClipboardCheck',  locked: true, badge: 'enterprise', lockedDesc: 'Документооборот для enterprise', upgradeFeature: 'Согласования' },

  // КОМАНДА
  { section: 'team',     label: 'Команда и доступы', href: '/dashboard/settings/team',         icon: 'UserCog',         permission: 'team:view' },
  { section: 'team',     label: 'Роли',              href: '/dashboard/settings/roles',        icon: 'Shield',          permission: 'team:view' },
  { section: 'team',     label: 'Журнал действий',   href: '/dashboard/settings/audit',        icon: 'History',         permission: 'audit:view' },

  // НАСТРОЙКИ
  { section: 'settings', label: 'Организация',       href: '/dashboard/settings/org',          icon: 'Settings',        permission: 'team:manage' },
  { section: 'settings', label: 'Тарифы и оплата',   href: '/dashboard/settings/billing',      icon: 'CreditCard',      locked: true, badge: 'pro', lockedDesc: 'Управление подпиской и счетами', upgradeFeature: 'Управление тарифом' },
  { section: 'settings', label: 'API и интеграции',  href: '/dashboard/settings/api',          icon: 'Unplug',          locked: true, badge: 'dev', lockedDesc: 'REST API, вебхуки, интеграции', upgradeFeature: 'API и интеграции' },

  // ПЛАТФОРМА (только для Baisanat Holding)
  { section: 'management', label: 'Модерация',       href: '/dashboard/moderation',            icon: 'ShieldCheck',     permission: 'events:moderate', platformOnly: true } as any,
  { section: 'management', label: 'Поддержка',       href: '/dashboard/support',               icon: 'Headphones',      permission: 'support:view', platformOnly: true } as any,
]

export const SECTION_LABELS: Record<string, string> = {
  overview:   'Главная',
  sales:      'Продажи',
  events:     'События',
  marketing:  'Маркетинг',
  analytics:  'Аналитика',
  documents:  'Документы',
  team:       'Команда',
  settings:   'Настройки',
  management: 'Платформа',
}

export const COLLAPSIBLE_SECTIONS = new Set(['marketing', 'analytics', 'documents'])
export const DEFAULT_COLLAPSED_SECTIONS = new Set(['documents'])

export function getNavForRole(role: AppRole): NavItem[] {
  const rolePerms = ROLE_PERMISSIONS[role] ?? []
  if ((rolePerms as string[])[0] === '*') return NAV_ITEMS
  return NAV_ITEMS.filter(
    (item) => item.locked || !item.permission || (rolePerms as Permission[]).includes(item.permission),
  )
}
