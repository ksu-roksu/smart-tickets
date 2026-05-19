import { permissions } from './permissions'

export const platformRoles = {
  SUPER_ADMIN: [
    '*',
  ],

  PLATFORM_ADMIN: [
    permissions.events.read,
    permissions.events.update,
    permissions.events.publish,

    permissions.orders.read,
    permissions.orders.refund,

    permissions.finance.read,

    permissions.moderation.review,

    permissions.audit.read,
  ],

  SUPPORT: [
    permissions.orders.read,
    permissions.support.access,
    permissions.tickets.read,
  ],

  FINANCE: [
    permissions.finance.read,
    permissions.orders.read,
  ],

  FRAUD: [
    permissions.fraud.review,
    permissions.orders.read,
    permissions.tickets.read,
  ],
} as const

export const organizerRoles = {
  OWNER: [
    permissions.events.read,
    permissions.events.create,
    permissions.events.update,
    permissions.events.publish,

    permissions.orders.read,

    permissions.finance.read,

    permissions.analytics.read,

    permissions.promo.manage,

    permissions.users.invite,
    permissions.users.manageRoles,
  ],

  EVENT_MANAGER: [
    permissions.events.read,
    permissions.events.create,
    permissions.events.update,

    permissions.orders.read,

    permissions.analytics.read,
  ],

  FINANCE_MANAGER: [
    permissions.finance.read,
    permissions.orders.read,
  ],

  SCANNER: [
    permissions.checkIn.access,
    permissions.tickets.read,
  ],

  VIEWER: [
    permissions.events.read,
    permissions.analytics.read,
  ],
} as const