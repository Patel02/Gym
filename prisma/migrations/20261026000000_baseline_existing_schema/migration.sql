-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Division" AS ENUM ('OPEN', 'JUNIOR', 'SUB_JUNIOR', 'MASTER_1', 'MASTER_2', 'MASTER_3', 'MASTER_4');

-- CreateEnum
CREATE TYPE "public"."EquipmentType" AS ENUM ('RAW', 'EQUIPPED', 'CLASSIC_RAW');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."LiftType" AS ENUM ('SQUAT', 'BENCH', 'DEADLIFT', 'TOTAL');

-- CreateEnum
CREATE TYPE "public"."MeetStatus" AS ENUM ('APPROVED', 'PENDING_PAYMENT', 'WAITLISTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."MembershipPlan" AS ENUM ('ANNUAL_ATHLETE', 'LIFETIME', 'COACH_OFFICIAL');

-- CreateEnum
CREATE TYPE "public"."OfficialRole" AS ENUM ('CHIEF_REFEREE', 'SIDE_REFEREE_LEFT', 'SIDE_REFEREE_RIGHT', 'JURY_PRESIDENT', 'JURY_MEMBER', 'TECHNICAL_CONTROLLER');

-- CreateEnum
CREATE TYPE "public"."Permission" AS ENUM ('MANAGE_MEETS', 'MANAGE_MEMBERS', 'MANAGE_RECORDS', 'LIVE_SCORING', 'CMS_PUBLISH');

-- CreateEnum
CREATE TYPE "public"."RefereeCategory" AS ENUM ('STATE_CAT_2', 'NATIONAL_CAT_2', 'NATIONAL_CAT_1', 'IPF_INTERNATIONAL');

-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('MONTHLY', 'SIX_MONTH', 'YEARLY', 'FREE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'PENDING_APPROVAL', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('MEMBER', 'ADMIN', 'REFEREE', 'MEET_DIRECTOR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."WeightClass" AS ENUM ('WC_47', 'WC_52', 'WC_57', 'WC_59', 'WC_63', 'WC_66', 'WC_69', 'WC_74', 'WC_76', 'WC_83', 'WC_84', 'WC_84_PLUS', 'WC_93', 'WC_105', 'WC_120', 'WC_120_PLUS');

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certificate" (
    "id" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "badgeUrl" TEXT,
    "medal" TEXT,
    "pdfUrl" TEXT,
    "rank" INTEGER,
    "securityHash" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Circular" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Circular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "entryFee" DOUBLE PRECISION NOT NULL,
    "registrationOpen" TIMESTAMP(3) NOT NULL,
    "registrationClose" TIMESTAMP(3) NOT NULL,
    "maxAthletes" INTEGER NOT NULL,
    "meetDirector" TEXT NOT NULL,
    "posterUrl" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FederationSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL DEFAULT 'State Powerlifting Association',
    "planType" "public"."SubscriptionPlan" NOT NULL DEFAULT 'MONTHLY',
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyEventQuota" INTEGER NOT NULL DEFAULT 4,
    "extraEventCredits" INTEGER NOT NULL DEFAULT 0,
    "pricePaid" DOUBLE PRECISION NOT NULL DEFAULT 2999,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "contactPhone" TEXT,
    "paymentUtr" TEXT,
    "reactivationRequestedAt" TIMESTAMP(3),
    "reactivationNotes" TEXT,
    "reactivationPlanType" "public"."SubscriptionPlan",
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FederationSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MeetRegistration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "division" "public"."Division" NOT NULL DEFAULT 'OPEN',
    "equipment" "public"."EquipmentType" NOT NULL DEFAULT 'RAW',
    "status" "public"."MeetStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentRef" TEXT,
    "bodyweight" DOUBLE PRECISION,
    "lotNumber" INTEGER,
    "coachPhone" TEXT,
    "contactPhone" TEXT,

    CONSTRAINT "MeetRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "planType" "public"."MembershipPlan" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "badgeUrl" TEXT,
    "idCardPdfUrl" TEXT,
    "securityHash" TEXT,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NationalRecord" (
    "id" TEXT NOT NULL,
    "liftType" "public"."LiftType" NOT NULL,
    "weightClass" "public"."WeightClass" NOT NULL,
    "division" "public"."Division" NOT NULL,
    "equipment" "public"."EquipmentType" NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "athleteId" TEXT NOT NULL,
    "meetId" TEXT NOT NULL,
    "dateSet" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NationalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "weightClass" "public"."WeightClass" NOT NULL,
    "clubId" TEXT,
    "coachName" TEXT,
    "coachPhone" TEXT,
    "phoneNumber" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefereeAssignment" (
    "id" TEXT NOT NULL,
    "refereeProfileId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "platformName" TEXT NOT NULL DEFAULT 'Platform 1',
    "role" "public"."OfficialRole" NOT NULL DEFAULT 'CHIEF_REFEREE',
    "flightGroup" TEXT DEFAULT 'Flight A',
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefereeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefereeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "category" "public"."RefereeCategory" NOT NULL DEFAULT 'NATIONAL_CAT_2',
    "stateAffiliation" TEXT NOT NULL DEFAULT 'Gujarat',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalMeetsJudged" INTEGER NOT NULL DEFAULT 0,
    "licenseValidUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefereeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Result" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "squat1" DOUBLE PRECISION,
    "squat2" DOUBLE PRECISION,
    "squat3" DOUBLE PRECISION,
    "bestSquat" DOUBLE PRECISION,
    "bench1" DOUBLE PRECISION,
    "bench2" DOUBLE PRECISION,
    "bench3" DOUBLE PRECISION,
    "bestBench" DOUBLE PRECISION,
    "deadlift1" DOUBLE PRECISION,
    "deadlift2" DOUBLE PRECISION,
    "deadlift3" DOUBLE PRECISION,
    "bestDeadlift" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "ipfGlPoints" DOUBLE PRECISION,
    "rank" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantBranding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL DEFAULT 'State Powerlifting Association',
    "tagline" TEXT DEFAULT 'Affiliated Member State Body',
    "slug" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#e6501b',
    "secondaryColor" TEXT NOT NULL DEFAULT '#0a0a0a',
    "sealText" TEXT DEFAULT 'OFFICIAL RATIFIED SEAL',
    "presidentName" TEXT DEFAULT 'President',
    "presidentSignUrl" TEXT,
    "secretaryName" TEXT DEFAULT 'General Secretary',
    "secretarySignUrl" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantBranding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'MEMBER',
    "permissions" "public"."Permission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WhatsappQueueAlertLog" (
    "id" TEXT NOT NULL,
    "meetId" TEXT NOT NULL,
    "lifterId" TEXT NOT NULL,
    "lifterName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "queuePosition" TEXT NOT NULL,
    "attemptInfo" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorDetails" TEXT,
    "sentByRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappQueueAlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WhatsappSaaSConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "twilioAccountSid" TEXT,
    "twilioAuthToken" TEXT,
    "twilioPhoneNumber" TEXT DEFAULT 'whatsapp:+14155238886',
    "interaktApiKey" TEXT,
    "isAutoDispatchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "alertCurtainMinutes" INTEGER NOT NULL DEFAULT 3,
    "fallbackToManual" BOOLEAN NOT NULL DEFAULT true,
    "customMessageTemplate" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappSaaSConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_adminId_timestamp_idx" ON "public"."AuditLog"("adminId" ASC, "timestamp" ASC);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType" ASC, "entityId" ASC);

-- CreateIndex
CREATE INDEX "Certificate_verificationCode_idx" ON "public"."Certificate"("verificationCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON "public"."Certificate"("verificationCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Club_name_key" ON "public"."Club"("name" ASC);

-- CreateIndex
CREATE INDEX "Club_state_idx" ON "public"."Club"("state" ASC);

-- CreateIndex
CREATE INDEX "DeletionRequest_status_idx" ON "public"."DeletionRequest"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DeletionRequest_userId_key" ON "public"."DeletionRequest"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "EmailOtp_email_key" ON "public"."EmailOtp"("email" ASC);

-- CreateIndex
CREATE INDEX "Event_status_date_idx" ON "public"."Event"("status" ASC, "date" ASC);

-- CreateIndex
CREATE INDEX "FederationSubscription_status_endDate_idx" ON "public"."FederationSubscription"("status" ASC, "endDate" ASC);

-- CreateIndex
CREATE INDEX "FederationSubscription_userId_idx" ON "public"."FederationSubscription"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "FederationSubscription_userId_key" ON "public"."FederationSubscription"("userId" ASC);

-- CreateIndex
CREATE INDEX "MeetRegistration_eventId_status_idx" ON "public"."MeetRegistration"("eventId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "MeetRegistration_userId_eventId_key" ON "public"."MeetRegistration"("userId" ASC, "eventId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_cardNumber_key" ON "public"."Membership"("cardNumber" ASC);

-- CreateIndex
CREATE INDEX "Membership_status_endDate_idx" ON "public"."Membership"("status" ASC, "endDate" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "NationalRecord_liftType_weightClass_division_equipment_gend_key" ON "public"."NationalRecord"("liftType" ASC, "weightClass" ASC, "division" ASC, "equipment" ASC, "gender" ASC);

-- CreateIndex
CREATE INDEX "NationalRecord_weightClass_gender_idx" ON "public"."NationalRecord"("weightClass" ASC, "gender" ASC);

-- CreateIndex
CREATE INDEX "News_published_publishedAt_idx" ON "public"."News"("published" ASC, "publishedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "public"."News"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId" ASC);

-- CreateIndex
CREATE INDEX "RefereeAssignment_eventId_platformName_idx" ON "public"."RefereeAssignment"("eventId" ASC, "platformName" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RefereeAssignment_refereeProfileId_eventId_role_key" ON "public"."RefereeAssignment"("refereeProfileId" ASC, "eventId" ASC, "role" ASC);

-- CreateIndex
CREATE INDEX "RefereeAssignment_refereeProfileId_idx" ON "public"."RefereeAssignment"("refereeProfileId" ASC);

-- CreateIndex
CREATE INDEX "RefereeProfile_category_stateAffiliation_idx" ON "public"."RefereeProfile"("category" ASC, "stateAffiliation" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RefereeProfile_licenseNumber_key" ON "public"."RefereeProfile"("licenseNumber" ASC);

-- CreateIndex
CREATE INDEX "RefereeProfile_userId_idx" ON "public"."RefereeProfile"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RefereeProfile_userId_key" ON "public"."RefereeProfile"("userId" ASC);

-- CreateIndex
CREATE INDEX "Result_total_ipfGlPoints_idx" ON "public"."Result"("total" ASC, "ipfGlPoints" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Result_userId_eventId_key" ON "public"."Result"("userId" ASC, "eventId" ASC);

-- CreateIndex
CREATE INDEX "TenantBranding_slug_idx" ON "public"."TenantBranding"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TenantBranding_slug_key" ON "public"."TenantBranding"("slug" ASC);

-- CreateIndex
CREATE INDEX "TenantBranding_userId_idx" ON "public"."TenantBranding"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TenantBranding_userId_key" ON "public"."TenantBranding"("userId" ASC);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE INDEX "WhatsappQueueAlertLog_lifterId_idx" ON "public"."WhatsappQueueAlertLog"("lifterId" ASC);

-- CreateIndex
CREATE INDEX "WhatsappQueueAlertLog_meetId_createdAt_idx" ON "public"."WhatsappQueueAlertLog"("meetId" ASC, "createdAt" ASC);

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeletionRequest" ADD CONSTRAINT "DeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FederationSubscription" ADD CONSTRAINT "FederationSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MeetRegistration" ADD CONSTRAINT "MeetRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MeetRegistration" ADD CONSTRAINT "MeetRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NationalRecord" ADD CONSTRAINT "NationalRecord_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NationalRecord" ADD CONSTRAINT "NationalRecord_meetId_fkey" FOREIGN KEY ("meetId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefereeAssignment" ADD CONSTRAINT "RefereeAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefereeAssignment" ADD CONSTRAINT "RefereeAssignment_refereeProfileId_fkey" FOREIGN KEY ("refereeProfileId") REFERENCES "public"."RefereeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefereeProfile" ADD CONSTRAINT "RefereeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantBranding" ADD CONSTRAINT "TenantBranding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
