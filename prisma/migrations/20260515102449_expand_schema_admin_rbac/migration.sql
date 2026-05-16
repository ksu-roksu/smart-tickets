-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "OrgTier" AS ENUM ('STARTER', 'GROWTH', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "KybStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'EVENT_MANAGER', 'FINANCE', 'SCANNER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT', 'FINANCE', 'CONTENT_MODERATION', 'FRAUD_RISK');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'APPROVE', 'REFUND', 'BLOCK', 'REISSUE', 'EXPORT', 'MANAGE');

-- CreateEnum
CREATE TYPE "PermissionResource" AS ENUM ('EVENTS', 'TICKETS', 'ORDERS', 'FINANCE', 'PAYOUTS', 'PROMO_CODES', 'USERS', 'TEAM', 'SETTINGS', 'ANALYTICS', 'CHECK_IN', 'AUDIT_LOGS', 'VENUES', 'SEAT_MAPS');

-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'BLOCKED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'PAUSED', 'SOLD_OUT', 'COMPLETED', 'CANCELLED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RefundPolicy" AS ENUM ('NO_REFUND', 'STANDARD', 'FLEXIBLE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'AWAITING_PAYMENT', 'PAID', 'TICKET_ISSUED', 'FAILED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'DISPUTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'KASPI', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('VALID', 'USED', 'CANCELLED', 'REFUNDED', 'BLOCKED', 'REISSUED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('SUCCESS', 'ALREADY_USED', 'INVALID_QR', 'EXPIRED_QR', 'WRONG_EVENT', 'BLOCKED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TICKET', 'EARLY_BIRD', 'VIP_ACCESS');

-- CreateEnum
CREATE TYPE "FraudType" AS ENUM ('MULTIPLE_CARDS_ONE_IP', 'EXCESSIVE_PURCHASE_VELOCITY', 'MULTIPLE_FAILURES', 'BULK_TICKET_PURCHASE', 'COUNTRY_MISMATCH', 'SUSPICIOUS_EMAIL', 'REPEAT_CHARGEBACKS', 'QR_SCREENSHOT_ATTEMPT', 'DUPLICATE_SCAN', 'INVALID_PROMO_ABUSE');

-- CreateEnum
CREATE TYPE "FraudSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FraudSignalStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_LEGIT', 'RESOLVED_FRAUD', 'ESCALATED');

-- CreateEnum
CREATE TYPE "NotifChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "NotifType" AS ENUM ('TICKET_ISSUED', 'ORDER_CONFIRMED', 'ORDER_CANCELLED', 'REFUND_PROCESSED', 'EVENT_REMINDER', 'EVENT_CANCELLED', 'EVENT_RESCHEDULED', 'PAYMENT_FAILED', 'WAITLIST_AVAILABLE');

-- CreateEnum
CREATE TYPE "NotifStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'BOUNCED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "bin" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "address" TEXT,
    "description" TEXT,
    "status" "OrgStatus" NOT NULL DEFAULT 'PENDING',
    "tier" "OrgTier" NOT NULL DEFAULT 'STARTER',
    "kybStatus" "KybStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "kybVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedByUserId" TEXT,
    "invitedAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformUser" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "PlatformRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "resource" "PermissionResource" NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "orgMemberId" TEXT,
    "platformUserId" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'KZ',
    "capacity" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatMap" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "svgData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "seatMapId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "rowCount" INTEGER,
    "seatCount" INTEGER,
    "isNumbered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "row" TEXT,
    "number" TEXT,
    "label" TEXT,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "venueId" TEXT NOT NULL,
    "seatMapId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "date" TIMESTAMP(3) NOT NULL,
    "doorsOpen" TIMESTAMP(3),
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "durationMin" INTEGER,
    "isOutdoor" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "coverUrl" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "slug" TEXT,
    "shortDesc" TEXT,
    "mood" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "doorsOpenAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Almaty',
    "bannerUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isOnlineEvent" BOOLEAN NOT NULL DEFAULT false,
    "onlineUrl" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "ageRestriction" INTEGER,
    "refundPolicy" "RefundPolicy" NOT NULL DEFAULT 'STANDARD',
    "refundDeadline" TIMESTAMP(3),
    "maxTicketsPerOrder" INTEGER NOT NULL DEFAULT 8,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "moderationNote" TEXT,
    "rejectedReason" TEXT,
    "totalCapacity" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "zoneId" TEXT,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "totalSeats" INTEGER NOT NULL,
    "soldSeats" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "saleStartAt" TIMESTAMP(3),
    "saleEndAt" TIMESTAMP(3),
    "earlyBirdPrice" DECIMAL(10,2),
    "earlyBirdUntil" TIMESTAMP(3),
    "earlyBirdCount" INTEGER,
    "groupMinSize" INTEGER,
    "groupDiscount" DECIMAL(5,2),
    "maxPerOrder" INTEGER NOT NULL DEFAULT 8,
    "minPerOrder" INTEGER NOT NULL DEFAULT 1,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "requiresPromo" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventId" TEXT,
    "organizationId" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "stripeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "serviceFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "promoCodeId" TEXT,
    "buyerEmail" TEXT NOT NULL DEFAULT '',
    "buyerPhone" TEXT,
    "buyerName" TEXT,
    "paymentProvider" "PaymentProvider",
    "providerOrderId" TEXT,
    "providerData" JSONB,
    "fraudScore" DOUBLE PRECISION,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "status" "PaymentStatus" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerTxId" TEXT,
    "providerData" JSONB,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "ticketTypeId" TEXT NOT NULL,
    "eventId" TEXT,
    "userId" TEXT,
    "seatId" TEXT,
    "qrCode" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'VALID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrSecret" TEXT NOT NULL,
    "qrVersion" INTEGER NOT NULL DEFAULT 1,
    "eventTitle" TEXT NOT NULL DEFAULT '',
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "venueName" TEXT,
    "ticketTypeName" TEXT NOT NULL DEFAULT '',
    "seatLabel" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "transferredFromId" TEXT,
    "transferredAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanLog" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "scannedById" TEXT,
    "eventId" TEXT,
    "status" "ScanStatus" NOT NULL,
    "device" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "ticketIds" TEXT[],
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedById" TEXT,
    "processedById" TEXT,
    "providerRefundId" TEXT,
    "providerData" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "platformFee" DECIMAL(12,2) NOT NULL,
    "processingFee" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankBic" TEXT,
    "recipientName" TEXT,
    "providerPayoutId" TEXT,
    "notes" TEXT,
    "processedById" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT,
    "code" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorPlatformId" TEXT,
    "actorRole" TEXT,
    "organizationId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudSignal" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "userId" TEXT,
    "type" "FraudType" NOT NULL,
    "severity" "FraudSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "FraudSignalStatus" NOT NULL DEFAULT 'OPEN',
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportNote" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "userId" TEXT,
    "channel" "NotifChannel" NOT NULL,
    "type" "NotifType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "NotifStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerId" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "permissions" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "orgIds" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_role_idx" ON "OrganizationMember"("role");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformUser_clerkId_key" ON "PlatformUser"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformUser_email_key" ON "PlatformUser"("email");

-- CreateIndex
CREATE INDEX "PlatformUser_clerkId_idx" ON "PlatformUser"("clerkId");

-- CreateIndex
CREATE INDEX "PlatformUser_role_idx" ON "PlatformUser"("role");

-- CreateIndex
CREATE INDEX "Permission_orgMemberId_idx" ON "Permission"("orgMemberId");

-- CreateIndex
CREATE INDEX "Permission_platformUserId_idx" ON "Permission"("platformUserId");

-- CreateIndex
CREATE INDEX "Venue_organizationId_idx" ON "Venue"("organizationId");

-- CreateIndex
CREATE INDEX "Venue_city_idx" ON "Venue"("city");

-- CreateIndex
CREATE INDEX "SeatMap_venueId_idx" ON "SeatMap"("venueId");

-- CreateIndex
CREATE INDEX "Zone_seatMapId_idx" ON "Zone"("seatMapId");

-- CreateIndex
CREATE INDEX "Seat_zoneId_idx" ON "Seat"("zoneId");

-- CreateIndex
CREATE INDEX "Seat_status_idx" ON "Seat"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "TicketType_eventId_idx" ON "TicketType"("eventId");

-- CreateIndex
CREATE INDEX "TicketType_zoneId_idx" ON "TicketType"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_eventId_idx" ON "Order"("eventId");

-- CreateIndex
CREATE INDEX "Order_organizationId_idx" ON "Order"("organizationId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_buyerEmail_idx" ON "Order"("buyerEmail");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_ticketTypeId_idx" ON "OrderItem"("ticketTypeId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_providerTxId_idx" ON "Payment"("providerTxId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_qrCode_key" ON "Ticket"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_qrSecret_key" ON "Ticket"("qrSecret");

-- CreateIndex
CREATE INDEX "Ticket_orderId_idx" ON "Ticket"("orderId");

-- CreateIndex
CREATE INDEX "Ticket_eventId_idx" ON "Ticket"("eventId");

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_qrSecret_idx" ON "Ticket"("qrSecret");

-- CreateIndex
CREATE INDEX "ScanLog_ticketId_idx" ON "ScanLog"("ticketId");

-- CreateIndex
CREATE INDEX "ScanLog_eventId_idx" ON "ScanLog"("eventId");

-- CreateIndex
CREATE INDEX "ScanLog_createdAt_idx" ON "ScanLog"("createdAt");

-- CreateIndex
CREATE INDEX "Refund_orderId_idx" ON "Refund"("orderId");

-- CreateIndex
CREATE INDEX "Refund_status_idx" ON "Refund"("status");

-- CreateIndex
CREATE INDEX "Payout_organizationId_idx" ON "Payout"("organizationId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_organizationId_idx" ON "PromoCode"("organizationId");

-- CreateIndex
CREATE INDEX "PromoCode_eventId_idx" ON "PromoCode"("eventId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_actorPlatformId_idx" ON "AuditLog"("actorPlatformId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "FraudSignal_orderId_idx" ON "FraudSignal"("orderId");

-- CreateIndex
CREATE INDEX "FraudSignal_userId_idx" ON "FraudSignal"("userId");

-- CreateIndex
CREATE INDEX "FraudSignal_status_idx" ON "FraudSignal"("status");

-- CreateIndex
CREATE INDEX "FraudSignal_severity_idx" ON "FraudSignal"("severity");

-- CreateIndex
CREATE INDEX "SupportNote_orderId_idx" ON "SupportNote"("orderId");

-- CreateIndex
CREATE INDEX "NotificationLog_orderId_idx" ON "NotificationLog"("orderId");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_orgMemberId_fkey" FOREIGN KEY ("orgMemberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_platformUserId_fkey" FOREIGN KEY ("platformUserId") REFERENCES "PlatformUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatMap" ADD CONSTRAINT "SeatMap_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_seatMapId_fkey" FOREIGN KEY ("seatMapId") REFERENCES "SeatMap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_seatMapId_fkey" FOREIGN KEY ("seatMapId") REFERENCES "SeatMap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_scannedById_fkey" FOREIGN KEY ("scannedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorPlatformId_fkey" FOREIGN KEY ("actorPlatformId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "audit_event_fk" FOREIGN KEY ("entityId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudSignal" ADD CONSTRAINT "FraudSignal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudSignal" ADD CONSTRAINT "FraudSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportNote" ADD CONSTRAINT "SupportNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportNote" ADD CONSTRAINT "SupportNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
