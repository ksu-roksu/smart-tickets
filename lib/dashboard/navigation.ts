import { Role, Permission, ROLE_PERMISSIONS } from '@/lib/rbac/permissions'

export type NavItem = {
  label: string
  labelRu: string
  href: string
  icon: string
  permission?: Permission
  badge?: string
  platformOnly?: boolean  // добавил — нужно для DashboardSidebar
  section: 'overview' | 'events' | 'finance' | 'operations' | 'management'
}

export const NAV_ITEMS: NavItem[] = [
  // ОБЗОР
  { section: 'overview', label: 'Dashboard', labelRu: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { section: 'overview', label: 'Analytics', labelRu: 'Аналитика', href: '/dashboard/analytics', icon: 'BarChart2', permission: 'analytics:view_own' },

  // МЕРОПРИЯТИЯ
  { section: 'events', label: 'Events', labelRu: 'События', href: '/dashboard/events', icon: 'CalendarDays', permission: 'events:create' },
  { section: 'events', label: 'Tickets', labelRu: 'Билеты', href: '/dashboard/tickets', icon: 'Ticket', permission: 'tickets:view_own' },
  { section: 'events', label: 'Venues', labelRu: 'Площадки', href: '/dashboard/venues', icon: 'MapPin', permission: 'venues:manage' },
  { section: 'events', label: 'Promocodes', labelRu: 'Промокоды', href: '/dashboard/promocodes', icon: 'Tag', permission: 'promocodes:manage' },

  // ФИНАНСЫ
  { section: 'finance', label: 'Orders', labelRu: 'Заказы', href: '/dashboard/orders', icon: 'ShoppingCart', permission: 'orders:view_own', badge: 'orders' },
  { section: 'finance', label: 'Payouts', labelRu: 'Выплаты', href: '/dashboard/payouts', icon: 'Wallet', permission: 'payouts:view_own' },
  { section: 'finance', label: 'Reports', labelRu: 'Отчёты', href: '/dashboard/reports', icon: 'FileText', permission: 'analytics:view_own' },

  // ОПЕРАЦИИ
  { section: 'operations', label: 'Check-in', labelRu: 'Check-in', href: '/dashboard/checkin', icon: 'ScanLine', permission: 'checkin:manage' },
  { section: 'operations', label: 'Support', labelRu: 'Поддержка', href: '/dashboard/support', icon: 'HeadphonesIcon', badge: 'support' },

  // УПРАВЛЕНИЕ (только admin+)
  { section: 'management', label: 'Users', labelRu: 'Пользователи', href: '/dashboard/users', icon: 'Users', permission: 'users:manage' },
  { section: 'management', label: 'Moderation', labelRu: 'Модерация', href: '/dashboard/moderation', icon: 'ShieldCheck', permission: 'events:moderate' },
  { section: 'management', label: 'Audit Log', labelRu: 'Audit Log', href: '/dashboard/audit', icon: 'History', permission: 'audit:view' },
]

export const SECTION_LABELS: Record<NavItem['section'], string> = {
  overview: 'ОБЗОР',
  events: 'МЕРОПРИЯТИЯ',
  finance: 'ФИНАНСЫ',
  operations: 'ОПЕРАЦИИ',
  management: 'УПРАВЛЕНИЕ',
}

export function getNavForRole(role: Role): NavItem[] {
  const rolePerms = ROLE_PERMISSIONS[role] ?? []
  return NAV_ITEMS.filter(item =>
    !item.permission || rolePerms.includes(item.permission)
  )
}