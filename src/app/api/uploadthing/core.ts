import { createUploadthing, type FileRouter } from "uploadthing/next";
import { requireUserRole } from "@/lib/authz";

const f = createUploadthing();

export const ourFileRouter = {
  // 1. Profile Picture Uploader (Max 2MB)
  profileImageUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await requireUserRole("MEMBER", "ADMIN", "SUPER_ADMIN", "REFEREE", "MEET_DIRECTOR");
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // 2. PDF Circulars & Event Posters Uploader (Max 4MB)
  circularUploader: f({ 
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 } 
  })
  .middleware(async () => {
    const admin = await requireUserRole("ADMIN", "SUPER_ADMIN");
    if (!admin) {
      throw new Error("Unauthorized Admin");
    }
    return { userId: admin.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { prisma } = await import("@/lib/prisma");
      const { revalidatePath } = await import("next/cache");
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .trim();
      const title = cleanTitle
        ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
        : "Official Federation Document";

      await prisma.circular.create({
        data: {
          title,
          fileUrl: file.url,
          publishedAt: new Date(),
        },
      });

      revalidatePath("/circulars");
      revalidatePath("/admin/cms");
      revalidatePath("/");
      revalidatePath("/championships");
      revalidatePath("/admin/events");

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;