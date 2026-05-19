-- AlterTable
ALTER TABLE "OrganizationMember" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteTokenHash" TEXT;
