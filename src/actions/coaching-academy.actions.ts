"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { 
  COACHING_EXAM_QUESTIONS, 
  SEED_CERTIFIED_COACHES, 
  ISSUED_COACH_LICENSES,
  CertifiedCoachRecord 
} from "@/data/coaching-academy-data";
import { generateQrDataUrl } from "@/lib/qr-generator";
import { consumeRateLimit } from "@/lib/rate-limit";

export interface SubmitExamParams {
  candidateName: string;
  email?: string;
  level: "LEVEL_1" | "LEVEL_2";
  answers: Record<string, "A" | "B" | "C" | "D">;
  clubOrState?: string;
}

export interface ExamResultResponse {
  success: boolean;
  error?: string;
  candidateName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  licenseCode?: string;
  level: "LEVEL_1" | "LEVEL_2";
  levelTitle: string;
  ratificationDate: string;
  verificationUrl?: string;
  qrDataUrl?: string;
  detailedResults: {
    questionNumber: number;
    scenario: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    topic: string;
  }[];
}

export async function submitCoachCertificationExamAction(
  params: SubmitExamParams
): Promise<ExamResultResponse> {
  const session = await auth();
  if (
    !session?.user?.id ||
    !["MEMBER", "ADMIN", "SUPER_ADMIN"].includes(session.user.role ?? "")
  ) {
    return {
      success: false,
      error: "Sign in with a member account to take the certification exam.",
      candidateName: "",
      score: 0,
      totalQuestions: COACHING_EXAM_QUESTIONS.length,
      percentage: 0,
      passed: false,
      level: "LEVEL_1",
      levelTitle: "Coaching Trainee",
      ratificationDate: new Date().toISOString().split("T")[0],
      detailedResults: [],
    };
  }

  const parsed = z
    .object({
      candidateName: z.string().trim().min(1).max(100),
      email: z.string().trim().email().optional(),
      level: z.enum(["LEVEL_1", "LEVEL_2"]),
      answers: z.record(z.string().max(100), z.enum(["A", "B", "C", "D"])),
      clubOrState: z.string().trim().max(100).optional(),
    })
    .safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the exam details and try again.",
      candidateName: "",
      score: 0,
      totalQuestions: COACHING_EXAM_QUESTIONS.length,
      percentage: 0,
      passed: false,
      level: "LEVEL_1",
      levelTitle: "Coaching Trainee",
      ratificationDate: new Date().toISOString().split("T")[0],
      detailedResults: [],
    };
  }
  params = parsed.data;

  const throttle = await consumeRateLimit({
    scope: "coach-certification-exam",
    identifier: session.user.id,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!throttle.allowed) {
    return {
      success: false,
      error: "Too many exam attempts. Please try again later.",
      candidateName: params.candidateName,
      score: 0,
      totalQuestions: COACHING_EXAM_QUESTIONS.length,
      percentage: 0,
      passed: false,
      level: params.level,
      levelTitle: "Coaching Trainee",
      ratificationDate: new Date().toISOString().split("T")[0],
      detailedResults: [],
    };
  }

  try {
    let score = 0;
    const totalQuestions = COACHING_EXAM_QUESTIONS.length;

    const detailedResults = COACHING_EXAM_QUESTIONS.map((q) => {
      const selected = params.answers[q.id];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) score += 1;

      return {
        questionNumber: q.questionNumber,
        scenario: q.scenario,
        selectedAnswer: selected || "Unanswered",
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        topic: q.topic,
      };
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 80;

    let licenseCode: string | undefined = undefined;
    const nowStr = new Date().toISOString().split("T")[0];

    const levelTitle = params.level === "LEVEL_2"
      ? "National High-Performance & Championship Technical Coach"
      : "Club Strength & Conditioning Coach";

    if (passed) {
      const randomSuffix = randomInt(1000, 10000);
      licenseCode = `IPF-COACH-2026-${randomSuffix}`;

      ISSUED_COACH_LICENSES.set(licenseCode, {
        name: params.candidateName,
        level: params.level,
        levelTitle,
        score: `${score}/${totalQuestions} (${percentage}%)`,
        ratificationDate: nowStr,
      });

      // Log to database audit log with admin or system user
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.user.id,
            action: "COACH_LICENSE_ACCREDITED",
            entityType: "CoachCredential",
            entityId: licenseCode,
            details: JSON.stringify({
              candidate: params.candidateName,
              level: params.level,
              score: `${score}/${totalQuestions} (${percentage}%)`,
              licenseCode,
              percentage,
              levelTitle,
              ratificationDate: nowStr,
            }),
          },
        });
      } catch (e) {
        console.error("Coach license audit logging failed:", e instanceof Error ? e.name : "Unknown error");
      }
    }

    revalidatePath("/coaching/academy");

    const searchParams = new URLSearchParams({
      candidate: params.candidateName,
      level: params.level,
      score: `${percentage}%`,
    });
    const verificationUrl = licenseCode
      ? `https://ipf-federation.in/verify/${licenseCode}?${searchParams.toString()}`
      : undefined;
    let qrDataUrl: string | undefined = undefined;
    if (verificationUrl) {
      try {
        qrDataUrl = await generateQrDataUrl(verificationUrl, { width: 320, margin: 1 });
      } catch (e) {
        console.warn("QR code generation error:", e);
      }
    }

    return {
      success: true,
      candidateName: params.candidateName,
      score,
      totalQuestions,
      percentage,
      passed,
      licenseCode,
      level: params.level,
      levelTitle,
      ratificationDate: nowStr,
      verificationUrl,
      qrDataUrl,
      detailedResults,
    };
  } catch (error) {
    console.error(
      "Error in submitCoachCertificationExamAction:",
      error instanceof Error ? error.name : "Unknown error",
    );
    return {
      success: false,
      error: "Failed to evaluate coaching exam.",
      candidateName: params.candidateName,
      score: 0,
      totalQuestions: 10,
      percentage: 0,
      passed: false,
      level: params.level,
      levelTitle: "Coaching Trainee",
      ratificationDate: new Date().toISOString().split("T")[0],
      detailedResults: [],
    };
  }
}

export async function verifyCoachLicenseAction(licenseCode: string): Promise<{
  verified: boolean;
  coach?: CertifiedCoachRecord;
}> {
  const parsed = z.string().trim().min(1).max(64).safeParse(licenseCode);
  if (!parsed.success) return { verified: false };

  const found = SEED_CERTIFIED_COACHES.find(
    (c) => c.licenseCode.toLowerCase() === parsed.data.toLowerCase()
  );

  if (found) {
    return { verified: true, coach: found };
  }

  const issued = ISSUED_COACH_LICENSES.get(parsed.data.toUpperCase());
  if (!issued) return { verified: false };

  return {
    verified: true,
    coach: {
      id: parsed.data.toUpperCase(),
      name: issued.name,
      level: issued.level,
      levelTitle: issued.levelTitle,
      licenseCode: parsed.data.toUpperCase(),
      state: "National Accreditation Pool",
      city: "National Secretariat",
      clubAffiliation: "A&T High-Performance Barbell Academy",
      verifiedYear: new Date(issued.ratificationDate).getFullYear(),
      specialization: "Powerlifting Coaching",
      coachedAthletesCount: 0,
      contactWhatsApp: "",
    },
  };
}
