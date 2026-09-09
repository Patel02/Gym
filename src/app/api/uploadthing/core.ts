import { auth } from "@/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const upload = createUploadthing();

export const ourFileRouter = {
  circularUploader: upload({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();

      if (session?.user?.role !== "ADMIN" || !session.user.id) {
        throw new Error("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;